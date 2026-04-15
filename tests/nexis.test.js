const { describe, it } = require("node:test");
const assert = require("node:assert");
const nexis = require("../lib/nexis");
const Nexis = require("../lib/core/Nexis");
const defaults = require("../lib/defaults");

describe("nexis interface", () => {
  it("should be a client", () => {
    assert.strictEqual(nexis instanceof Nexis, true);
  });

  it("should return client with extended creation", () => {
    assert.strictEqual(typeof nexis.create, "function");

    const instanceConfig = { port: 4000 };
    const extendedClient = nexis.create(instanceConfig);
    assert.strictEqual(extendedClient instanceof Nexis, true);
    assert.strictEqual(typeof extendedClient.create, "function");
    assert.deepStrictEqual(
      { baseURL: extendedClient.getBaseURL(), ...extendedClient.getConfig() },
      {
        baseURL: new URL(defaults.baseURL),
        ...defaults.config(),
        ...instanceConfig,
      },
    );
  });
});
