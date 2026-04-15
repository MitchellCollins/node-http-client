const { describe, it } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const customHttp = require("../lib/utils/header-methods");

describe("custom IncomingMessage header methods", () => {
    it("should be built off http module", () => {
        Object.entries(http).forEach(([key, value]) => {
            assert.deepStrictEqual(customHttp[key], value);
        });
    });

    it("should have getHeader method", () => {
        assert.strictEqual(typeof customHttp.IncomingMessage.prototype.getHeader, "function");
    });

    it("should have getHeaders method", () => {
        assert.strictEqual(typeof customHttp.IncomingMessage.prototype.getHeaders, "function");
    });

    it("should have getHeaderNames method", () => {
        assert.strictEqual(typeof customHttp.IncomingMessage.prototype.getHeaderNames, "function");
    });

    it("should have hasHeader method", () => {
        assert.strictEqual(typeof customHttp.IncomingMessage.prototype.hasHeader, "function");
    });
});