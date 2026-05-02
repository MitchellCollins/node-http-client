exports = module.exports = { error, request, response }

function error(err) {
    console.error("[Nexis Error]:", err);
}

function request(req) {
    const { method, protocol = "", path = "", query = "" } = req;
    const host = req.getHeader("host") || "";
    console.info("[Nexis Request]:", { method, url: `${protocol}${host}${path}${query}`, timestamp: new Date() });
}

function response(res) {
    const { statusCode, statusMessage, req } = res;
    const { method = "", protocol = "", path = "", query = "" } = req;
    const host = res.req.getHeader("host") || "";
    console.info("[Nexis Response]:", { method, status: `${statusCode} ${statusMessage}`, url: `${protocol}${host}${path}${query}`, timestamp: new Date() });
}