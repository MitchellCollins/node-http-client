const http = require("node:http");

exports = module.exports = http;

// Implements header methods that are case-insensitive into instances of IncomingMessage
//      which is received in the callback param in http.request method
http.IncomingMessage.prototype.getHeader = function getHeader(name) {
  return this.headers[name.toLowerCase()];
};

http.IncomingMessage.prototype.getHeaders = function getHeaders(names) {
  const headers = {};
  for (let i = 0; i < names.length; i++) {
    const value = this.getHeader(names[i]);
    if (value) {
      headers[names[i].toLowerCase()] = value;
    }
  }

  return headers;
};

http.IncomingMessage.prototype.getHeaderNames = function getHeaderNames() {
  return Object.keys(this.headers);
};

http.IncomingMessage.prototype.hasHeader = function hasHeader(name) {
  return Object.hasOwn(this.headers, name.toLowerCase());
};
