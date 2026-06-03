const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const EventEmitter = require("node:events");
const NexisError = require("./NexisError");
const protocols = require("../protocols");
const defaults = require("../defaults");
const deepMerge = require("../utils/deepMerge");
const encodeConfigBody = require("../utils/encodeConfigBody");
const decodeData = require("../utils/decodeData");
const authFormatter = require("../utils/authFormatter");
const http = require("../utils/header-methods");
const loggers = require("../utils/event-loggers");

class Nexis extends EventEmitter {
  #baseURL = defaults.baseURL;
  #config = defaults.config();

  constructor(config = {}) {
    if (config && typeof config !== "object")
      throw new NexisError("Config input must be object", {
        code: "ERR_NEXIS_INVALID_INPUT_TYPE",
        cause: "Nexis construct requires config input to be object",
      });

    const { baseURL = defaults.baseURL, ...otherConfig } = config;

    super();

    this.setBaseURL(baseURL);
    this.setConfig(otherConfig || defaults.config());

    // Inherit exclusive http properties
    [
      "ClientRequest",
      "IncomingMessage",
      "OutgoingMessage",
      "METHODS",
      "STATUS_CODES",
      "maxHeaderSize",
      "validateHeaderName",
      "validateHeaderValue",
    ].forEach((property) => (Nexis.prototype[property] = http[property]));
  }

  getBaseURL() {
    return this.#baseURL;
  }

  getConfig() {
    return this.#config;
  }

  setBaseURL(newBaseURL = defaults.baseURL) {
    if (typeof newBaseURL !== "string" && !(newBaseURL instanceof URL))
      throw new NexisError("baseURL must be set as string or URL", {
        code: "ERR_NEXIS_INVALID_INPUT_TYPE",
        cause: "newBaseURL input was not string or URL",
      });

    this.#baseURL = new URL(newBaseURL, defaults.baseURL);

    // Inherit methods from new protocol
    ["Agent", "globalAgent", "request"].forEach(
      (property) =>
        (Nexis.prototype[property] =
          protocols[this.#baseURL.protocol][property]),
    );
  }

  setConfig(newConfig = defaults.config()) {
    if (typeof newConfig !== "object")
      throw new NexisError("config must be set as object", {
        code: "ERR_NEXIS_INVALID_INPUT_TYPE",
        cause: "newConfig input was not an object",
      });

    // Validate headers config
    if (newConfig.headers) {
      Object.entries(newConfig.headers).forEach(([name, value]) => {
        http.validateHeaderName(name);
        http.validateHeaderValue(name, value);
      });
    }

    this.#config = deepMerge(defaults.config(), newConfig);
  }

  #validatePathMethodCallback(path, method, callback) {
    if (typeof path !== "string" && !(path instanceof URL))
      throw new NexisError("Path input must be string or URL", {
        code: "ERR_NEXIS_INVALID_INPUT_TYPE",
        cause: "Path input wasn't string or URL",
      });

    const methods = ["get", "delete", "post", "put", "patch"];
    if (!methods.includes(method))
      throw new NexisError(`Method input must be ${methods.join(", ")}`, {
        code: "ERR_NEXIS_INVALID_INPUT_TYPE",
        cause: "Method input must be a supported Nexis Http Method",
      });

    if (callback && typeof callback !== "function")
      throw new NexisError("cb input must be function", {
        code: "ERR_NEXIS_INVALID_INPUT_TYPE",
        cause: "cb input wasn't a function",
      });
  }

  #mergeConfigs(config) {
    // Merges default & attribute configs with input config
    return deepMerge(deepMerge(defaults.config(), this.#config), config);
  }

  async #request(path, method, config, handlers) {
    return new Promise((resolve, reject) => {
      let { cb, onRequest } = handlers;
      // Resolve callback & config
      if (typeof config === "function") {
        cb = config;
        config = {};
      }

      const handleResolve = (res) => {
        this.emit("response", res);
        typeof cb === "function" && cb(res);
        resolve(res);
      };

      const handleReject = (err) => {
        if (err?.req instanceof http.ClientRequest) err.req.destroy(err);
        if (err?.res instanceof http.IncomingMessage) err.res.destroy(err);

        // Handles error by first calling event listeners if there are
        //    Then finishing handling through callback or rejection
        if (this.listenerCount("error") > 0) this.emit("error", err);
        if (typeof cb === "function") {
          cb(err?.res, err);
        } else {
          reject(err);
        }
      };

      // Pre-define request object to be used in the catch block
      let req = defaults.req();
      // Is wrapped in async function to be able to await for potential error from dispatch method
      //    This allows the catch block to catch the error
      //    Better code practise then to make the Promise callback function async
      const safeWrapper = async () => {
        try {
          this.#validatePathMethodCallback(path, method, cb);
          config = this.#mergeConfigs(config); // Merges default & attribute configs with input config

          // Auto constructs date header
          config = deepMerge(
            { headers: { date: new Date().toUTCString() } },
            config,
          );

          // Add event loggers
          if (config?.loggers) {
            Object.entries(config.loggers).forEach(([event, bool]) => {
              if (bool && loggers[event]) this.once(event, loggers[event]);
            });
          }

          // Formats authorization if in json form
          const newAuth = authFormatter(config?.headers?.authorization);
          if (newAuth) config.headers.authorization = newAuth;

          let url = new URL(path, this.#baseURL);
          const dispatch = async (path, maxRedirects) => {
            url = new URL(path, url); // Updates request url with redirected path
            req = protocols[url.protocol].request(
              {
                protocol: url.protocol,
                hostname: url.hostname,
                port: url.port,
                path: url.pathname + url.search,
                method,
                ...config,
              },
              (res) => {
                const chunks = [];
                res.on("data", (chunk) => {
                  chunks.push(chunk);
                });

                res.on("end", () => {
                  // Combines chunks
                  res.data = Buffer.concat(chunks).toString();

                  this.emit("data", res.data);

                  // Converts response data based off headers
                  //      Parse json object or construct URLSearchParams
                  res.data = decodeData(
                    res.data,
                    res.getHeader("content-type"),
                  );

                  // Handle redirect
                  if (
                    maxRedirects > 0 &&
                    res.statusCode === 301 &&
                    res.getHeader("location")
                  ) {
                    this.emit("redirect", res, config);
                    return dispatch(
                      res.getHeader("location"),
                      maxRedirects - 1,
                    );
                  }

                  handleResolve(res);
                });
              },
            );

            const error = (err) => {
              handleReject(new NexisError(err, { req }));
            };
            req.on("error", error);

            req.on("timeout", () => {
              // Removes error event listener
              //    To avoid timeout error being thrown again
              //    When the request stream is destroyed by onReject handler
              req.off("error", error);
              req.on("error", () => null);

              handleReject(
                new NexisError(
                  `Socket Connection Timeout: ${config.timeout}ms Path: ${req.path}`,
                  {
                    cause: "The server didn't respond before the timeout",
                    code: "ERR_HTTP_REQUEST_TIMEOUT",
                    req,
                  },
                ),
              );
            });

            this.emit("request", req);
            // Awaits to catch protential pipeline error
            //    In the write request handler
            await onRequest(req, config);
          };

          await dispatch(path, config?.maxRedirects ?? 0);
        } catch (err) {
          handleReject(new NexisError(err, { req }));
        }
      };

      safeWrapper();
    });
  }

  read(path = defaults.path, method = defaults.method["read"], config, cb) {
    const handlers = {
      cb,
      onRequest: function handleRequest(req) {
        req.end();
      },
    };

    return this.#request(path, method, config, handlers);
  }

  write(
    path = defaults.path,
    method = defaults.method["write"],
    body,
    config,
    cb,
  ) {
    const handlers = {
      cb,
      onRequest: function handleRequest(req, config) {
        // Merges in auto config based off body data
        //    For example, the content-type & length
        const [data, headers] = encodeConfigBody(body);
        deepMerge({ headers }, config);

        if (!data) return req.end();

        // Feeds data to req writable stream
        return pipeline(Readable.from(data), req);
      },
    };

    return this.#request(path, method, config, handlers);
  }
}

// Creates read requests
["get", "delete"].forEach(
  (method) =>
    (Nexis.prototype[method] = function (path, config, cb) {
      return this.read(path, method, config, cb);
    }),
);

// Creates write requests
["post", "put", "patch"].forEach(
  (method) =>
    (Nexis.prototype[method] = function (path, body, config, cb) {
      return this.write(path, method, body, config, cb);
    }),
);

exports = module.exports = Nexis;
