const { describe, it } = require("node:test");
const assert = require("node:assert");
const { Readable } = require("node:stream");
const encodeConfigBody = require("../lib/utils/encodeConfigBody");

describe("body encoder & headers configurer", () => {
  it("should be a function", () => {
    assert.strictEqual(typeof encodeConfigBody, "function");
  });

  it("should handle undefined & null", () => {
    assert.deepStrictEqual(encodeConfigBody(), [
      null,
      { "content-type": null, "content-length": 0 },
    ]);
  });

  it("should handle buffer", () => {
    const buf = Buffer.from("Hello", "utf-8");
    assert.deepStrictEqual(encodeConfigBody(buf), [
      buf,
      {
        "content-type": "application/octet-stream",
        "content-length": buf.length,
      },
    ]);
  });

  it("should handle text", () => {
    const text = "Hello";
    assert.deepStrictEqual(encodeConfigBody(text), [
      text,
      {
        "content-type": "text/plain; charset=utf-8",
        "content-length": Buffer.byteLength(text, "utf8"),
      },
    ]);
  });

  it("should handle instance of URLSearchParams", () => {
    const params = new URLSearchParams({ id: "1", message: "Hello" });
    const expected = params.toString();
    assert.deepStrictEqual(encodeConfigBody(params), [
      expected,
      {
        "content-type": "application/x-www-form-urlencoded; charset=utf-8",
        "content-length": Buffer.byteLength(expected, "utf8"),
      },
    ]);
  });

  it("should handle instance of Stream", () => {
    const stream = Readable.from(["Hello"]);
    assert.deepStrictEqual(encodeConfigBody(stream), [
      stream,
      { "content-type": "application/octet-stream" },
    ]);
  });

  it("should handle array buffer view", () => {
    const view = new Uint8Array(Buffer.from("Hello", "utf8"));
    const expected = Buffer.from(view.buffer, view.byteOffset, view.byteLength);
    assert.deepStrictEqual(encodeConfigBody(view), [
      expected,
      {
        "content-type": "application/octet-stream",
        "content-length": expected.length,
      },
    ]);
  });

  it("should handle array buffer", () => {
    const arrayBuffer = Buffer.from("Hello", "utf8").buffer;
    const expected = Buffer.from(arrayBuffer);
    assert.deepStrictEqual(encodeConfigBody(arrayBuffer), [
      expected,
      {
        "content-type": "application/octet-stream",
        "content-length": expected.length,
      },
    ]);
  });

  it("should handle object", () => {
    const data = { id: 1, message: "Hello" };
    const expected = JSON.stringify(data);
    assert.deepStrictEqual(encodeConfigBody(data), [
      expected,
      {
        "content-type": "application/json; charset=utf-8",
        "content-length": Buffer.byteLength(expected, "utf8"),
      },
    ]);
  });

  it("should convert unhandled data to string", () => {
    const number = 200;
    const expected = String(number);
    assert.deepStrictEqual(encodeConfigBody(number), [
      expected,
      {
        "content-type": "text/plain; charset=utf-8",
        "content-length": Buffer.byteLength(expected, "utf8"),
      },
    ]);
  });
});
