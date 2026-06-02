const { describe, it } = require("node:test");
const assert = require("node:assert");
const decodeData = require("../lib/utils/decodeData");

describe("data decoder", () => {
  it("should be a function", () => {
    assert.strictEqual(typeof decodeData, "function");
  });

  it("should decode data", () => {
    const json = { message: "Hello" };
    const param = "message=hello";
    assert.deepStrictEqual(
      decodeData(JSON.stringify(json), "application/json"),
      json,
    );
    assert.strictEqual(
      decodeData(param, "application/x-www-form-urlencoded") instanceof
        URLSearchParams,
      true,
    );
  });

  it("should throw invalid input error", () => {
    assert.throws(() => decodeData(JSON.stringify({ message: "success" }), 5), {
      name: "Error",
      code: "ERR_NEXIS_INVALID_INPUT_TYPE",
    });
    assert.throws(() => decodeData("Not_JSON", "application/json"), {
      name: "Error",
      code: "ERR_NEXIS_INVALID_CONTENT_TYPE",
    });
  });

  it("shouldn't throw invalid input error on undefined or null", () => {
    assert.doesNotThrow(() => decodeData(null, null));
  });
});
