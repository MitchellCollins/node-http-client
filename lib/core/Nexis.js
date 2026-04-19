const { Readable } = require("node:stream");
const { pipeline } = require("node:stream/promises");
const protocols = require("../protocols");
const defaults = require("../defaults");
const deepMerge = require("../utils/deepMerge");
const encodeConfigBody = require("../utils/encodeConfigBody");
const decodeData = require("../utils/decodeData");
const authFormatter = require("../utils/authFormatter");
const http = require("../utils/header-methods");

class Nexis {
  #baseURL = defaults.baseURL;
  #config = defaults.config();

  constructor(config) {
    const { baseURL, ...otherConfig } = config;

    this.setBaseURL(baseURL);
    this.setConfig(otherConfig);

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
    this.#baseURL = new URL(newBaseURL, defaults.baseURL);

    // Inherit methods from new protocol
    ["Agent", "globalAgent", "request"].forEach(
      (property) =>
        (Nexis.prototype[property] =
          protocols[this.#baseURL.protocol][property]),
    );
  }

  setConfig(newConfig = defaults.config()) {
    // Validate headers config
    if (newConfig.headers) {
      Object.entries(newConfig.headers).forEach(([name, value]) => {
        http.validateHeaderName(name);
        http.validateHeaderValue(name, value);
      });
    }

    this.#config = deepMerge(defaults.config(), newConfig);
  }

  #handleCallbackConfig(configOrCb, cb) {
    // Resolve callback
    if (typeof configOrCb === "function") {
      cb = configOrCb;
    }

    // Merge configs
    configOrCb = deepMerge(
      deepMerge(defaults.config(), this.#config),
      configOrCb ?? {},
    );

    return [configOrCb, cb];
  }

  #generateHandlers(resolve, reject, cb) {
    const handleResolve = (res) => {
      cb && cb(res);
      resolve(res);
    };

    const handleReject = (res, err) => {
      cb && cb(res, err);
      reject(err);
    };

    return [handleResolve, handleReject];
  }

  #request(path, method, config, onRequest, onResolve, onReject) {
    config = deepMerge({ headers: { date: new Date().toUTCString() } }, config);

    // Formats authorization if in json form
    const newAuth = authFormatter(config?.headers?.authorization, onReject);
    if (newAuth) config.headers.authorization = newAuth;

    const url = new URL(path, this.#baseURL);
    const req = protocols[url.protocol].request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method,
        ...config,
      },
      (res) => {
        res.data = "";

        const chunks = [];
        res.on("data", (chunk) => {
          chunks.push(chunk);
        });

        res.on("end", () => {
          // Combines chunks
          res.data = Buffer.concat(chunks).toString();

          // Converts response data based off headers
          //      Parse json object or construct URLSearchParams
          res.data = decodeData(res.data, res.getHeader("content-type"));

          // Handle redirect
          if (
            config?.maxRedirects > 0 &&
            res.statusCode === 301 &&
            res.getHeader("location")
          ) {
            const { maxRedirects, ...other } = config;
            return this.#request(
              res.getHeader("location"),
              method,
              { ...other, maxRedirects: maxRedirects - 1 },
              onRequest,
              onResolve,
              onReject,
            );
          }

          onResolve(res);
        });
      },
    );

    req.on("error", (err) => {
      req.destroy(err);
      onReject(defaults.res(), err);
    });

    req.on("timeout", () => {
      const err = new Error(
        `Socket Connection Timeout: ${config.timeout}ms Path: ${req.path}`,
        {
          cause: "The server didn't respond before the timeout",
          code: "ERR_HTTP_REQUEST_TIMEOUT",
        },
      );
      req.destroy(err);
      onReject(defaults.res(), err);
    });

    onRequest(req);
  }

  read(path, method, configOrCb, cb) {
    return new Promise((resolve, reject) => {
      // Resolve callback & merge configs
      const [config, callback] = this.#handleCallbackConfig(configOrCb, cb);

      const handleRequest = (req) => req.end();

      this.#request(
        path,
        method,
        config,
        handleRequest,
        ...this.#generateHandlers(resolve, reject, callback),
      );
    });
  }

  write(path, method, body, configOrCb, cb) {
    return new Promise((resolve, reject) => {
      // Resolve callback & merge configs
      let [config, callback] = this.#handleCallbackConfig(configOrCb, cb);

      // Encodes data & merges auto configuration
      const [data, headers] = encodeConfigBody(body);
      config = deepMerge({ headers }, config);

      const handleRequest = (req) => {
        // Feeds data to req writable stream
        pipeline(Readable.from(data), req).catch((err) => {
          callback && callback(defaults.res(), err);
          reject(err);
        });
      };

      this.#request(
        path,
        method,
        config,
        handleRequest,
        ...this.#generateHandlers(resolve, reject, callback),
      );
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
