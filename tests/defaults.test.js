const { describe, it } = require("node:test");
const assert = require("node:assert");
const defaults = require("../lib/defaults");

describe("default values", () => {
    it("should have defined default values", () => {
        assert.strictEqual(typeof defaults.baseURL, "string");
        assert.strictEqual(typeof defaults.config, "function");
        assert.strictEqual(typeof defaults.config(), "object");
        assert.strictEqual(typeof defaults.res, "function");
        assert.strictEqual(typeof defaults.res(), "object");
        assert.strictEqual(typeof defaults.protocol, "string");
    });
});