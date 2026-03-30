const { describe, it } = require("node:test");
const assert = require("node:assert");
const HTTPClient = require("../lib/HTTPClient");

describe("static HTTPClient", () => {
    it("should be a class", () => {
        assert.strictEqual(typeof HTTPClient, "function");
        assert.match(HTTPClient.toString(), /^class\s/);
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
});