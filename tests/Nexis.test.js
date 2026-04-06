const { describe, it } = require("node:test");
const assert = require("node:assert");
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

    it("should have request methods", () => {
        assert.strictEqual(typeof client.get, "function");
        assert.strictEqual(typeof client.delete, "function");
        assert.strictEqual(typeof client.post, "function");
        assert.strictEqual(typeof client.put, "function");
        assert.strictEqual(typeof client.patch, "function");
    });

    it("should have inherited instance attributes", () => {
        const protocol = protocols[client.getBaseURL().protocol];
        assert.deepStrictEqual(client.Agent, protocol.Agent);
        assert.deepStrictEqual(client.ClientRequest, protocol.ClientRequest);
        assert.deepStrictEqual(client.IncomingMessage, protocol.IncomingMessage);
        assert.deepStrictEqual(client.OutgoingMessage, protocol.OutgoingMessage);
        assert.deepStrictEqual(client.METHODS, protocol.METHODS);
        assert.deepStrictEqual(client.STATUS_CODES, protocol.STATUS_CODES);
        assert.deepStrictEqual(client.globalAgent, protocol.globalAgent);
        assert.deepStrictEqual(client.maxHeaderSize, protocol.maxHeaderSize);
        assert.deepStrictEqual(client.request, protocol.request);
        assert.deepStrictEqual(client.validateHeaderName, protocol.validateHeaderName);
        assert.deepStrictEqual(client.validateHeaderValue, protocol.validateHeaderValue);
    });
});