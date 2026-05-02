const { describe, it, mock } = require("node:test");
const assert = require("node:assert");
const { error, request, response } = require("../lib/utils/event-loggers");

describe("error event logger", () => {
    it("should be a function", () => {
        assert.strictEqual(typeof error, "function");
    });

    it("should log a error", () => {
        const errorMock = mock.method(console, "error", () => null);
        const err = new Error("Error");

        error(err);

        assert.strictEqual(errorMock.mock.callCount(), 1, "should make console.error call");
        
        const call = errorMock.mock.calls[0];
        assert.strictEqual(call.arguments[0], "[Nexis Error]:", "should label Nexis Error");
        assert.deepStrictEqual(call.arguments[1], err, "should log Nexis Error");

        errorMock.mock.restore();
    });
});

describe("request event logger", () => {
    it("should be a function", () => {
        assert.strictEqual(typeof request, "function");
    });

    it("should log request information", () => {
        const requestMock = mock.method(console, "info", () => null);
        const req = {
            method: "GET",
            protocol: "http:",
            getHeader: (name) => name === "host" ? "localhost:3000" : null,
            path: "/request"
        }

        request(req);

        assert.strictEqual(requestMock.mock.callCount(), 1, "should make console.info call");

        const call = requestMock.mock.calls[0];
        assert.strictEqual(call.arguments[0], "[Nexis Request]:", "should label Nexis Request");
        const loggedInfo = call.arguments[1];
        assert.strictEqual(loggedInfo.method, req.method, "should log request method");
        assert.strictEqual(loggedInfo.url, `${req.protocol}${req.getHeader("host")}${req.path}`, "should log request url");
        assert.ok(loggedInfo.timestamp, "should log request timestamp");

        requestMock.mock.restore();
    });
});

describe("response event logger", () => {
    it("should be a function", () => {
        assert.strictEqual(typeof response, "function");
    });

    it("should log response information", () => {
        const responseMock = mock.method(console, "info", () => null);
        const res = { 
            statusCode: 200, 
            statusMessage: "OK", 
            req: {
                method: "GET", 
                protocol: "http:",
                getHeader: (name) => name === "host" ? "localhost:3000" : null, 
                path: "/response"
            }
        }

        response(res);

        assert.strictEqual(responseMock.mock.callCount(), 1, "should make console.info call");

        const call = responseMock.mock.calls[0];
        assert.strictEqual(call.arguments[0], "[Nexis Response]:", "should label Nexis Response");
        const loggedInfo = call.arguments[1];
        assert.strictEqual(loggedInfo.status, `${res.statusCode} ${res.statusMessage}`, "should log response status");
        assert.ok(loggedInfo.timestamp, "should label response timestamp");

        const req = res.req;
        assert.strictEqual(loggedInfo.method, req.method, "should log response method");
        assert.strictEqual(loggedInfo.url, `${req.protocol}${req.getHeader("host")}${req.path}`, "should log response url");

        responseMock.mock.restore();
    });
});