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

  #handleCallbackConfig(configOrCb, cb) {
    // Resolve callback
    if (typeof configOrCb === "function") {
      cb = configOrCb;
      configOrCb = {};
    }

    return [configOrCb, cb];
  }

  #mergeConfigs(config) {
    // Merge configs
    return deepMerge(deepMerge(defaults.config(), this.#config), config);
  }

  #generateHandlers(resolve, reject, cb) {
    const handleResolve = (res) => {
      this.emit("response", res);
      cb && cb(res);
      resolve(res);
    };

    const handleReject = (err) => {
      if (err?.req instanceof http.ClientRequest) err.req.destroy(err);
      if (err?.res instanceof http.IncomingMessage) err.res.destroy(err);

      // Handles error by first calling event listeners if there are
      //    Then finishing handling through callback or rejection
      if (this.listenerCount("error") > 0) this.emit("error", err);
      if (cb && typeof cb === "function") {
        cb(err?.res, err);
      } else {
        reject(err);
      }
    };

    return {
      onResolve: handleResolve,
      onReject: handleReject,
    };
  }

  async #request(path, method, config, handlers) {
    config = deepMerge({ headers: { date: new Date().toUTCString() } }, config);

    // Add event loggers
    if (config?.loggers) {
      Object.entries(config.loggers).forEach(([event, bool]) => {
        if (bool && loggers[event]) this.once(event, loggers[event]);
      });
    }

    const url = new URL(path, this.#baseURL);
    let req = defaults.req();
    try {
      // Formats authorization if in json form
      const newAuth = authFormatter(config?.headers?.authorization);
      if (newAuth) config.headers.authorization = newAuth;

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
            res.data = decodeData(res.data, res.getHeader("content-type"));

            // Handle redirect
            if (
              config?.maxRedirects > 0 &&
              res.statusCode === 301 &&
              res.getHeader("location")
            ) {
              this.emit("redirect", res, config);
              const { maxRedirects, ...other } = config;
              return this.#request(
                res.getHeader("location"),
                method,
                { ...other, maxRedirects: maxRedirects - 1 },
                handlers,
              );
            }

            handlers.onResolve(res);
          });
        },
      );

      const error = (err) => {
        handlers.onReject(new NexisError(err, { req }));
      };
      req.on("error", error);

      req.on("timeout", () => {
        // Removes error event listener
        //    To avoid timeout error being thrown again
        //    When the request stream is destroyed by onReject handler
        req.off("error", error);
        req.on("error", () => null);

        handlers.onReject(
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
      await handlers.onRequest(req);
    } catch (err) {
      handlers.onReject(new NexisError(err, { req }));
    }
  }

  read(path = defaults.path, method = defaults.method["read"], configOrCb, cb) {
    return new Promise((resolve, reject) => {
      // Resolve callback & config
      let [config, callback] = this.#handleCallbackConfig(configOrCb, cb);

      const handlers = this.#generateHandlers(resolve, reject, callback);
      handlers.onRequest = function handleRequest(req) {
        req.end();
      };

      try {
        this.#validatePathMethodCallback(path, method, callback);
        config = this.#mergeConfigs(config);
      } catch (err) {
        return handlers.onReject(err);
      }

      this.#request(path, method, config, handlers);
    });
  }

  write(
    path = defaults.path,
    method = defaults.method["write"],
    body,
    configOrCb,
    cb,
  ) {
    return new Promise((resolve, reject) => {
      // Resolve callback & merge configs
      let [config, callback] = this.#handleCallbackConfig(configOrCb, cb);

      // Pre-defines data & headers
      //    Cause handleRequest method uses data
      let data, headers;

      const handlers = this.#generateHandlers(resolve, reject, callback);
      handlers.onRequest = async function handleRequest(req) {
        if (!data) return req.end();

        // Feeds data to req writable stream
        return await pipeline(Readable.from(data), req);
      };

      try {
        this.#validatePathMethodCallback(path, method, callback);
        config = this.#mergeConfigs(config);

        // Encodes data & merges auto configuration
        [data, headers] = encodeConfigBody(body);
        config = deepMerge({ headers }, config);
      } catch (err) {
        return handlers.onReject(err);
      }

      this.#request(path, method, config, handlers);
    });
  }
}

// Creates read requests
["get", "delete"].forEach(
  (method) =>
    (Nexis.prototype[method] = async function (path, configOrCb, cb) {
      return await this.read(path, method, configOrCb, cb);
    }),
);

// Creates write requests
["post", "put", "patch"].forEach(
  (method) =>
    (Nexis.prototype[method] = async function (path, body, configOrCb, cb) {
      return await this.write(path, method, body, configOrCb, cb);
    }),
);

exports = module.exports = Nexis;
