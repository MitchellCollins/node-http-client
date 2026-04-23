const { describe, it } = require("node:test");
const assert = require("node:assert");
const nexis = require("../index");
const {
  Nexis,
  NexisError,
  defaults,
  protocols,
  deepMerge,
  encodeConfigBody,
  decodeData,
  authFormatter,
} = require("../index");

describe("cjs exports", () => {
  it("export default nexis interface", () => {
    assert.strictEqual(nexis instanceof Nexis, true);
  });

  it("Nexis class", () => {
    assert.strictEqual(typeof Nexis, "function");
    assert.match(Nexis.toString(), /^class\s/);
  });

  it("NexisError class", () => {
    assert.strictEqual(typeof NexisError, "function");
    assert.match(NexisError.toString(), /^class\s/);
  });

  it("default values", () => {
    assert.strictEqual(typeof defaults, "object");
  });

  it("protocol options", () => {
    assert.strictEqual(typeof protocols, "object");
  });

  it("deepMerge function", () => {
    assert.strictEqual(typeof deepMerge, "function");
  });

  it("encodeConfigBody function", () => {
    assert.strictEqual(typeof encodeConfigBody, "function");
  });

  it("decodeData function", () => {
    assert.strictEqual(typeof decodeData, "function");
  });

  it("authFormatter function", () => {
    assert.strictEqual(typeof authFormatter, "function");
  });
});
