const { describe, it } = require("node:test");
const assert = require("node:assert");
const createClient = require("../lib/core/createClient");
const Nexis = require("../lib/core/Nexis");
const defaults = require("../lib/defaults");

describe("client creator", () => {
    const defaultConfig = { baseURL: "localhost", protocol: "http", port: 3000 };
    const client = createClient(defaultConfig);
    
    it("should be a function", () => {
        assert.strictEqual(typeof createClient, "function");
    });

    it("should return client", () => {
        assert.strictEqual(client instanceof Nexis, true);
    });

    it("should return client with extended creation", () => {
        assert.strictEqual(typeof client.create, "function");

        const instanceConfig = { port: 4000 };
        const extendedClient = client.create(instanceConfig);
        assert.strictEqual(extendedClient instanceof Nexis, true);
        assert.strictEqual(typeof extendedClient.create, "function");
        assert.deepStrictEqual(
            { baseURL: extendedClient.getBaseURL(), protocol: extendedClient.getProtocol(), ...extendedClient.getConfig() }, 
            { ...defaults.config(), ...defaultConfig, ...instanceConfig }
        );
    });
});