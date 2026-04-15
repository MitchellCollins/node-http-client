const { describe, it } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const Nexis = require("../lib/core/Nexis");
const defaults = require("../lib/defaults");
const protocols = require("../lib/protocols");

describe("Nexis class", () => {
    it("should be a class", () => {
        assert.strictEqual(typeof Nexis, "function");
        assert.match(Nexis.toString(), /^class\s/);
    });
});

describe("Nexis instance", () => {
    let baseURL = "http://localhost:4000/";
    let otherConfig = { port: 3000 };
    const client = new Nexis({ baseURL, ...otherConfig });

    it("should have getter & setter methods", () => {
        assert.strictEqual(typeof client.getBaseURL, "function");
        assert.strictEqual(typeof client.getConfig, "function");
        assert.strictEqual(typeof client.setBaseURL, "function");
        assert.strictEqual(typeof client.setConfig, "function");
    });

    it("should have private attributes", () => {
        assert.deepStrictEqual(client.getBaseURL(), new URL(baseURL));
        assert.deepStrictEqual(client.getConfig(), { ...defaults.config(), ...otherConfig });

        baseURL = new URL("https://localhost:3000/");
        otherConfig = { port: 4000 };
        client.setBaseURL(baseURL);
        client.setConfig(otherConfig);

        assert.deepStrictEqual(client.getBaseURL(), baseURL);
        assert.deepStrictEqual(client.getConfig(), { ...defaults.config(), ...otherConfig });
    });

    it("should validate request header", () => {
        const invalidTokenErr = (err) => err instanceof TypeError && err.code === "ERR_INVALID_HTTP_TOKEN";
        const invalidValueErr = (err) => err instanceof TypeError && err.code === "ERR_HTTP_INVALID_HEADER_VALUE";
        
        // Validate name during set
        assert.throws(
            () => client.setConfig({ headers: { "content type": "application/json" } }),
            invalidTokenErr,
            "should reject invalid header name on set"
        );

        // Validate value during set
        assert.throws(
            () => client.setConfig({ headers: { "content-type": undefined }}),
            invalidValueErr,
            "should reject invalid header value on set"
        );

        // Validate name during request
        assert.rejects(
            async () => await client.get("/", { headers: { "content type": "application/json" }}),
            invalidTokenErr,
            "should reject invalid header name on request"
        );

        // Validate value during request
        assert.rejects(
            async () => await client.get("/", { headers: { "content-type": undefined }}),
            invalidValueErr,
            "should reject invalid header value on request"
        );
    });

    it("should have request methods", () => {
        assert.strictEqual(typeof client.read, "function");
        assert.strictEqual(typeof client.write, "function");
        assert.strictEqual(typeof client.get, "function");
        assert.strictEqual(typeof client.delete, "function");
        assert.strictEqual(typeof client.post, "function");
        assert.strictEqual(typeof client.put, "function");
        assert.strictEqual(typeof client.patch, "function");
    });

    it("should have inherited instance attributes", () => {
        const protocol = protocols[client.getBaseURL().protocol];
        assert.deepStrictEqual(client.Agent, protocol.Agent);
        assert.deepStrictEqual(client.globalAgent, protocol.globalAgent);
        assert.deepStrictEqual(client.request, protocol.request);

        // Exclusive http properties
        assert.deepStrictEqual(client.ClientRequest, http.ClientRequest);
        assert.deepStrictEqual(client.IncomingMessage, http.IncomingMessage);
        assert.deepStrictEqual(client.OutgoingMessage, http.OutgoingMessage);
        assert.deepStrictEqual(client.METHODS, http.METHODS);
        assert.deepStrictEqual(client.STATUS_CODES, http.STATUS_CODES);
        assert.deepStrictEqual(client.maxHeaderSize, http.maxHeaderSize);
        assert.deepStrictEqual(client.validateHeaderName, http.validateHeaderName);
        assert.deepStrictEqual(client.validateHeaderValue, http.validateHeaderValue);

        // Implemented custom header getter methods
        assert.strictEqual(typeof client.IncomingMessage.prototype.getHeader, "function", "inherited IncomingMessage class should have custom getHeader method");
        assert.strictEqual(typeof client.IncomingMessage.prototype.getHeaders, "function", "inherited IncomingMessage class should have custom getHeaders method");
        assert.strictEqual(typeof client.IncomingMessage.prototype.getHeaderNames, "function", "inherited IncomingMessage class should have custom getHeaderNames method");
        assert.strictEqual(typeof client.IncomingMessage.prototype.hasHeader, "function", "inherited IncomingMessage class should have custom hasHeader method");
    });
});