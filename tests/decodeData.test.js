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
        assert.deepStrictEqual(decodeData(JSON.stringify(json), "application/json"), json);
        assert.strictEqual(decodeData(param, "application/x-www-form-urlencoded") instanceof URLSearchParams, true);
    });
});