const http = require("node:http");
const https = require("node:https");

const protocols = {
    "http": http,
    "https": https
}

exports = module.exports = protocols;