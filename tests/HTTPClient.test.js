const { describe, it } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const HTTPClient = require("../lib/HTTPClient");

describe("static HTTPClient", () => {
    it("should be a class", () => {
        assert.strictEqual(typeof HTTPClient, "function");
        assert.match(HTTPClient.toString(), /^class\s/);
    });

    it("should have inherited static attributes", () => {
        assert.deepStrictEqual(HTTPClient.Agent, http.Agent);
        assert.deepStrictEqual(HTTPClient.ClientRequest, http.ClientRequest);
        assert.deepStrictEqual(HTTPClient.IncomingMessage, http.IncomingMessage);
        assert.deepStrictEqual(HTTPClient.OutgoingMessage, http.OutgoingMessage);
        assert.deepStrictEqual(HTTPClient.METHODS, http.METHODS);
        assert.deepStrictEqual(HTTPClient.STATUS_CODES, http.STATUS_CODES);
        assert.deepStrictEqual(HTTPClient.globalAgent, http.globalAgent);
        assert.deepStrictEqual(HTTPClient.maxHeaderSize, http.maxHeaderSize);
        assert.deepStrictEqual(HTTPClient.request, http.request);
        assert.deepStrictEqual(HTTPClient.validateHeaderName, http.validateHeaderName);
        assert.deepStrictEqual(HTTPClient.validateHeaderValue, http.validateHeaderValue);
    });
});

describe("instance HTTPClient", () => {
    const client = new HTTPClient("localhost", { port: 3000 });
    
    it("should have getter & setter methods", () => {
        assert.strictEqual(typeof client.getBaseURL, "function");
        assert.strictEqual(typeof client.getConfig, "function");
        assert.strictEqual(typeof client.setBaseURL, "function");
        assert.strictEqual(typeof client.setConfig, "function");
    });

    it("should have private attributes", () => {
        assert.strictEqual(client.getBaseURL(), "localhost");
        assert.deepStrictEqual(client.getConfig(), { port: 3000 });

        client.setBaseURL("hello.com");
        client.setConfig({ port: 4000 });

        assert.strictEqual(client.getBaseURL(), "hello.com");
        assert.deepStrictEqual(client.getConfig(), { port: 4000 });
    });

    it("should have request methods", () => {
        assert.strictEqual(typeof client.get, "function");
        assert.strictEqual(typeof client.delete, "function");
        assert.strictEqual(typeof client.post, "function");
        assert.strictEqual(typeof client.put, "function");
        assert.strictEqual(typeof client.patch, "function");
    });

    it("should have inherited instance attributes", () => {
        assert.deepStrictEqual(client.Agent, http.Agent);
        assert.deepStrictEqual(client.ClientRequest, http.ClientRequest);
        assert.deepStrictEqual(client.IncomingMessage, http.IncomingMessage);
        assert.deepStrictEqual(client.OutgoingMessage, http.OutgoingMessage);
        assert.deepStrictEqual(client.METHODS, http.METHODS);
        assert.deepStrictEqual(client.STATUS_CODES, http.STATUS_CODES);
        assert.deepStrictEqual(client.globalAgent, http.globalAgent);
        assert.deepStrictEqual(client.maxHeaderSize, http.maxHeaderSize);
        assert.deepStrictEqual(client.request, http.request);
        assert.deepStrictEqual(client.validateHeaderName, http.validateHeaderName);
        assert.deepStrictEqual(client.validateHeaderValue, http.validateHeaderValue);
    });
});