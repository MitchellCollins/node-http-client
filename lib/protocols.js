const http = require("node:http");
const https = require("node:https");

/**
 * All the protocols that the client handles.
 */
const protocols = {
    "http": http,
    "https": https
}

exports = module.exports = protocols;