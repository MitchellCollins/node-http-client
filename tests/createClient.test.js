const { describe, it } = require("node:test");
const assert = require("node:assert");
const createClient = require("../lib/core/createClient");
const Nexis = require("../lib/core/Nexis");
const defaults = require("../lib/defaults");

describe("client creator", () => {
  const defaultConfig = { baseURL: "http://localhost/", port: 3000 };
  const client = createClient(defaultConfig);
  defaultConfig.baseURL = new URL(defaultConfig.baseURL);

  it("should be a function", () => {
    assert.strictEqual(typeof createClient, "function");
  });

  it("should return client", () => {
    assert.strictEqual(client instanceof Nexis, true);
  });

  it("should return client without optional params", () => {
    assert.strictEqual(createClient() instanceof Nexis, true);
  });

  it("should return client with extended creation", () => {
    assert.strictEqual(typeof client.create, "function");

    const instanceConfig = { port: 4000 };
    const extendedClient = client.create(instanceConfig);
    assert.strictEqual(extendedClient instanceof Nexis, true);
    assert.strictEqual(typeof extendedClient.create, "function");
    assert.deepStrictEqual(
      { baseURL: extendedClient.getBaseURL(), ...extendedClient.getConfig() },
      { ...defaults.config(), ...defaultConfig, ...instanceConfig },
    );
  });
});
