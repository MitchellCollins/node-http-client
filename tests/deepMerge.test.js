const { describe, it } = require("node:test");
const assert = require("node:assert");
const deepMerge = require("../lib/utils/deepMerge");

describe("config merger", () => {
  it("should be a function", () => {
    assert.strictEqual(typeof deepMerge, "function");
  });

  it("should merge configs", () => {
    const config1 = {
      port: 3000,
      headers: { "content-type": "application/json" },
    };
    const config2 = {
      timeout: 10000,
      headers: {
        "content-type": "text/plain",
        "content-length": Buffer.byteLength("Hello"),
      },
    };

    const expected1 = {
      port: 3000,
      timeout: 10000,
      headers: {
        "content-type": "text/plain",
        "content-length": Buffer.byteLength("Hello"),
      },
    };

    assert.deepStrictEqual(deepMerge(config1, config2), expected1);

    const config3 = { headers: { accept: "*/*" } };
    const config4 = { headers: { "content-type": "text/plain" } };

    const expected2 = { headers: { ...config3.headers, ...config4.headers } };

    assert.deepStrictEqual(deepMerge(config3, config4), expected2);
  });
});
