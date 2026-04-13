import { describe, it } from "node:test";
import assert from "node:assert";
import nexis from "../index.js";

describe("esm exports", () => {
    it("export default nexis interface", () => {
        assert.strictEqual(nexis instanceof nexis.Nexis, true);
    });

    it("Nexis class", () => {
        assert.strictEqual(typeof nexis.Nexis, "function");
        assert.match(nexis.Nexis.toString(), /^class\s/);
    });

    it("default values", () => {
        assert.strictEqual(typeof nexis.defaults, "object");
    });

    it("protocol options", () => {
        assert.strictEqual(typeof nexis.protocols, "object");
    });

    it("deepMerge function", () => {
        assert.strictEqual(typeof nexis.deepMerge, "function");
    });

    it("encodeConfigBody function", () => {
        assert.strictEqual(typeof nexis.encodeConfigBody, "function");
    });

    it("decodeData function", () => {
        assert.strictEqual(typeof nexis.decodeData, "function");
    });

    it("authFormatter function", () => {
        assert.strictEqual(typeof nexis.authFormatter, "function");
    });
});