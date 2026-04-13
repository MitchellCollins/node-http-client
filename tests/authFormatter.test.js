const { describe, it } = require("node:test");
const assert = require("node:assert");
const authFormatter = require("../lib/utils/authFormatter");

describe("Auth Formatter", () => {
    it("should be a function", () => {
        assert.strictEqual(typeof authFormatter, "function");
    });

    it("should format basic scheme", () => {
        const auth = { scheme: "basic", username: "test", password: "1234" };
        assert.strictEqual(authFormatter(auth), `Basic ${btoa(`${auth.username}:${auth.password}`)}`);
    });

    it("should format bearer scheme", () => {
        const auth = { scheme: "bearer", token: "bfhwf7yr37rd" };
        assert.strictEqual(authFormatter(auth), `Bearer ${auth.token}`);
    });

    it("should format digest scheme", () => {
        const auth = { scheme: "digest", username: "test", realm: "test-realm" };
        assert.strictEqual(authFormatter(auth), `Digest username=${auth.username},realm=${auth.realm}`);
    });

    it("shouldn't format non json auth", () => {
        const auth = "Bearer bfhwf7yr37rd";
        assert.strictEqual(authFormatter(auth), auth);
    });

    it("should reject invalid auth scheme", () => {
        const auth = { scheme: "invalid" };
        assert.rejects(
            () => new Promise((resolve, reject) => authFormatter(auth, (res, err) => reject(err))),
            (err) => err instanceof TypeError && err.message.includes("Invalid Auth Scheme"),
            "should reject invalid auth scheme"
        );
    });
});