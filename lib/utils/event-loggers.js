const defaults = require("../defaults");

exports = module.exports = { error, request, response };

function getURL(req) {
  const { protocol = "", path = "" } = req;
  const host = req?.getHeader ? req.getHeader("host") : defaults.unknown;

  return protocol + host + path;
}

function requestInfo(req = defaults.req()) {
  return {
    method: req.method ?? defaults.unknown,
    url: getURL(req),
    timestamp: new Date(),
  };
}

function responseInfo(res = defaults.res()) {
  const { statusCode, statusMessage } = res;
  return {
    status:
      !statusCode || !statusMessage
        ? defaults.unknown
        : `${statusCode} ${statusMessage}`,
    timestamp: new Date(),
  };
}

function error(err) {
  err.req = requestInfo(err?.req);
  err.res = responseInfo(err?.res);
  console.error("[Nexis Error]:", err);
}

function request(req) {
  console.info("[Nexis Request]:", requestInfo(req));
}

function response(res) {
  console.info("[Nexis Response]:", {
    ...responseInfo(res),
    ...requestInfo(res?.req),
  });
}
