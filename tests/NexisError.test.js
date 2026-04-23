const { describe, it } = require("node:test");
const assert = require("node:assert");
const NexisError = require("../lib/core/NexisError");

describe("NexisError class", () => {
  it("should be a class", () => {
    assert.strictEqual(typeof NexisError, "function");
    assert.match(NexisError.toString(), /^class\s/);
  });
});

describe("NexisError instance", () => {
  const err = new NexisError("message", {
    code: "ERR",
    cause: "cause",
  });

  it("should be extended from Error", () => {
    assert.strictEqual(err instanceof Error, true, "should extend from Error");
    assert.ok(err.message, "should have message");
    assert.ok(err.code, "should have code");
    assert.ok(err.cause, "should have cause");
    assert.ok(err.stack, "should have stack");
  });

  it("should have request & response objects", () => {
    assert.ok(err.req, "should have request object");
    assert.ok(err.res, "should have response object");
  });
});
