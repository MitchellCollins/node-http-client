const Stream = require("node:stream");
const protocols = require("../protocols");
const defaults = require("../defaults");
const deepMerge = require("../utils/deepMerge");
const encodeConfigBody = require("../utils/encodeConfigBody");
const decodeData = require("../utils/decodeData");

class Nexis {
    #baseURL = defaults.baseURL;
    #protocol = defaults.protocol;
    #config = defaults.config();

    constructor(config) {
        const { baseURL, protocol, ...otherConfig } = config;
        
        this.setBaseURL(baseURL);
        this.setProtocol(protocol);
        this.setConfig(otherConfig);
    }

    getBaseURL() {
        return this.#baseURL;
    }

    getProtocol() {
        return this.#protocol;
    }

    getConfig() {
        return this.#config;
    }

    setBaseURL(newBaseURL = defaults.baseURL) {
        this.#baseURL = newBaseURL;
    }

    setProtocol(newProtocol = defaults.protocol) {
        this.#protocol = newProtocol;

        // Inherit methods from new protocol
        ["Agent", "ClientRequest", "IncomingMessage", "OutgoingMessage", "METHODS", "STATUS_CODES", "globalAgent", "maxHeaderSize", "request", 
            "validateHeaderName", "validateHeaderValue"].forEach((property) => 
            Nexis.prototype[property] = protocols[newProtocol][property]
        );
    }

    setConfig(newConfig = defaults.config()) {
        this.#config = deepMerge(defaults.config(), newConfig);
    }
}

// Creates read requests
["get", "delete"].forEach((method) => Nexis.prototype[method] = function (path, configOrCb, cb) {
    return new Promise((resolve, reject) => {
        // Resolve callback and config params
        let config = deepMerge(defaults.config(), this.getConfig());
        if (typeof configOrCb === "function") {
            cb = configOrCb;
        } else if (configOrCb) {
            config = deepMerge(config, configOrCb);
        }
        
        const req = protocols[this.getProtocol()].request({ 
            hostname: this.getBaseURL(),
            path,
            method,
            ...config
        }, (res) => {
            res.data = "";

            const chunks = [];
            res.on("data", (chunk) => {
                if (typeof chunk === "string") {
                    res.data += chunk;
                    return;
                }

                chunks.push(chunk);
            });

            res.on("end", () => {
                // Combines chunks
                if (chunks.length > 0)
                    res.data = Buffer.concat(chunks).toString();

                // Converts response data based off headers
                //      Parse json object or construct URLSearchParams
                res.data = decodeData(res.data, res.headers["content-type"]);
                
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
["post", "put", "patch"].forEach((method) => Nexis.prototype[method] = function (path, body, configOrCb, cb) {
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

        const req = protocols[this.getProtocol()].request({
            hostname: this.getBaseURL(), 
            path,
            method,
            ...config
        }, (res) => {
            res.data = "";

            const chunks = [];
            res.on("data", (chunk) => {
                if (typeof chunk === "string") {
                    res.data += chunk;
                    return;
                }

                chunks.push(chunk);
            });

            res.on("end", () => {
                // Combines chunks
                if (chunks.length > 0)
                    res.data = Buffer.concat(chunks).toString();
                
                // Converts response data based off headers
                //      Parse json object or construct URLSearchParams
                res.data = decodeData(res.data, res.headers["content-type"]);
                
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

exports = module.exports = Nexis;