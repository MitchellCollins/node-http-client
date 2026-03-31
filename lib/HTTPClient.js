const http = require("http");
const Stream = require("stream");
const defaults = require("./defaults");
const { deepMerge, encodeConfigBody } = require("./utils");

class HTTPClient {
    #baseURL = defaults.baseURL;
    #config = defaults.config();

    constructor(baseURL, config) {
        this.#baseURL = baseURL ?? defaults.baseURL;
        this.#config = config ?? defaults.config();
    }

    getBaseURL() {
        return this.#baseURL;
    }

    getConfig() {
        return this.#config;
    }

    setBaseURL(newBaseURL = defaults.baseURL) {
        this.#baseURL = newBaseURL;
    }

    setConfig(newConfig = defaults.config()) {
        this.#config = newConfig;
    }
}

// Inherit methods from http
["Agent", "ClientRequest", "IncomingMessage", "OutgoingMessage", "METHODS", "STATUS_CODES", "globalAgent", "maxHeaderSize", "request", "validateHeaderName", "validateHeaderValue"].forEach((property) => 
    HTTPClient[property] = HTTPClient.prototype[property] = http[property]
);

// Creates read requests
["get", "delete"].forEach((method) => HTTPClient.prototype[method] = function (path, configOrCb, cb) {
    return new Promise((resolve, reject) => {
        // Resolve callback and config params
        let config = deepMerge(defaults.config(), this.getConfig());
        if (typeof configOrCb === "function") {
            cb = configOrCb;
        } else if (configOrCb) {
            config = deepMerge(config, configOrCb);
        }
        
        const req = http.request({ 
            hostname: this.getBaseURL(),
            path,
            method,
            ...config
        }, (res) => {
            res.data = "";

            res.on("data", (chunk) => {
                res.data += chunk;
            });

            res.on("end", () => {
                cb && cb(res);
                resolve(res);
            });
        });

        req.on("error", (err) => {
            cb && cb(defaults.res(), err);
            reject(err);
        });

        req.end();
    });
});

// Creates write requests
["post", "put", "patch"].forEach((method) => HTTPClient.prototype[method] = function (path, body, configOrCb, cb) {
    return new Promise((resolve, reject) => {
        // Auto encodes body and configures content type and length
        //      Based off the body param
        const [data, headers] = encodeConfigBody(body);
        
        // Resolve callback and merge configs
        let config = deepMerge(defaults.config(), { headers });
        config = deepMerge(config, this.getConfig());
        if (typeof configOrCb === "function") {
            cb = configOrCb;
        } else if (configOrCb) {
            config = deepMerge(config, configOrCb);
        }

        const req = http.request({
            hostname: this.getBaseURL(), 
            path,
            method,
            ...config
        }, (res) => {
            res.data = "";

            res.on("data", (chunk) => {
                res.data += chunk;
            });

            res.on("end", () => {
                cb && cb(res);
                resolve(res);
            });
        });

        req.on("error", (err) => {
            cb && cb(defaults.res(), err);
            reject(err);
        });
        
        if (data instanceof Stream) {
            data.pipe(req);
            data.on("error", (err) => {
                cb && cb(defaults.res(), err);
                reject(err);
            });
            return;
        }

        // Sends body data
        req.write(data, (err) => {
            if (err) {
                cb && cb(defaults.res(), err);
                reject(err);
            }
        });

        req.end();
    });
});

exports = module.exports = HTTPClient;