const { describe, it } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const Nexis = require("../lib/core/Nexis");
const defaults = require("../lib/defaults");
const protocols = require("../lib/protocols");
const NexisError = require("../lib/core/NexisError");

const timeout = 500;

const invalidInputType = (err) => {
  assert.strictEqual(
    err instanceof NexisError,
    true,
    "should throw a NexisError",
  );
  assert.strictEqual(err.code, "ERR_NEXIS_INVALID_INPUT_TYPE");

  return true;
};
const generateErrorCheck = (number, done) => {
  let count = 0;
  return (err) => {
    try {
      assert.strictEqual(
        err instanceof NexisError,
        true,
        "should reject a NexisError",
      );
      assert.strictEqual(
        err.code,
        "ERR_NEXIS_INVALID_INPUT_TYPE",
        "should reject with error code: ERR_NEXIS_INVALID_INPUT_TYPE",
      );
      count++;
      if (count >= number) done();
    } catch (error) {
      done(error);
    }
  };
};

describe("Nexis class", () => {
  it("should be a class", () => {
    assert.strictEqual(typeof Nexis, "function");
    assert.match(Nexis.toString(), /^class\s/);
  });

  it("should construct without optional params", () => {
    assert.strictEqual(new Nexis() instanceof Nexis, true);
  });

  it("should throw invalid construct inputs error", () => {
    assert.throws(() => new Nexis("Invalid"), invalidInputType);
  });
});

describe("Nexis instance", () => {
  let baseURL = "http://localhost:4000/";
  let otherConfig = { port: 3000 };
  const client = new Nexis({ baseURL, ...otherConfig });

  it("should have getter & setter methods", () => {
    assert.strictEqual(typeof client.getBaseURL, "function");
    assert.strictEqual(typeof client.getConfig, "function");
    assert.strictEqual(typeof client.setBaseURL, "function");
    assert.strictEqual(typeof client.setConfig, "function");
  });

  it("should throw invalid set input errors", () => {
    assert.throws(() => client.setBaseURL(5), invalidInputType);
    assert.throws(() => client.setConfig("Invalid"), invalidInputType);
  });

  it("should have private attributes", () => {
    assert.deepStrictEqual(client.getBaseURL(), new URL(baseURL));
    assert.deepStrictEqual(client.getConfig(), {
      ...defaults.config(),
      ...otherConfig,
    });

    baseURL = new URL("https://localhost:3000/");
    otherConfig = { port: 4000 };
    client.setBaseURL(baseURL);
    client.setConfig(otherConfig);

    assert.deepStrictEqual(client.getBaseURL(), baseURL);
    assert.deepStrictEqual(client.getConfig(), {
      ...defaults.config(),
      ...otherConfig,
    });
  });

  it("should set default value", () => {
    client.setBaseURL();
    client.setConfig();

    assert.deepStrictEqual(client.getBaseURL(), new URL(defaults.baseURL));
    assert.deepStrictEqual(client.getConfig(), defaults.config());
  });

  it("should validate request header", async () => {
    // Validate name during set
    assert.throws(
      () =>
        client.setConfig({ headers: { "content type": "application/json" } }),
      (err) =>
        err instanceof TypeError && err.code === "ERR_INVALID_HTTP_TOKEN",
      "should reject invalid header name on set",
    );

    // Validate value during set
    assert.throws(
      () => client.setConfig({ headers: { "content-type": undefined } }),
      (err) =>
        err instanceof TypeError &&
        err.code === "ERR_HTTP_INVALID_HEADER_VALUE",
      "should reject invalid header value on set",
    );

    // Validate header during request
    // Receives errors
    const [nameErr, valueErr] = await Promise.all([
      new Promise((resolve) =>
        client
          .get("/", { headers: { "content type": "application/json" } })
          .catch(resolve),
      ),
      new Promise((resolve) =>
        client
          .get("/", { headers: { "content-type": undefined } })
          .catch(resolve),
      ),
    ]);

    // Invalid name error
    assert.ok(nameErr.req, "should provide request object");
    assert.ok(nameErr.res, "should provide response object");
    assert.strictEqual(
      nameErr instanceof NexisError,
      true,
      "should reject NexisError",
    );
    assert.strictEqual(nameErr.code, "ERR_INVALID_HTTP_TOKEN");

    // Invalid value error
    assert.ok(valueErr.req, "should provide request object");
    assert.ok(valueErr.res, "should provide response object");
    assert.strictEqual(
      valueErr instanceof NexisError,
      true,
      "should reject NexisError",
    );
    assert.strictEqual(valueErr.code, "ERR_HTTP_INVALID_HEADER_VALUE");
  });

  it("should have request methods", () => {
    assert.strictEqual(typeof client.read, "function");
    assert.strictEqual(typeof client.write, "function");
    assert.strictEqual(typeof client.get, "function");
    assert.strictEqual(typeof client.delete, "function");
    assert.strictEqual(typeof client.post, "function");
    assert.strictEqual(typeof client.put, "function");
    assert.strictEqual(typeof client.patch, "function");
  });

  it(
    "should reject invalid path request input errors",
    { timeout },
    (t, done) => {
      const handleError = generateErrorCheck(7, done);

      client.read(5, "get", (res, err) => handleError(err));
      client.write(5, "post", {}, (res, err) => handleError(err));
      client.get(5, (res, err) => handleError(err));
      client.delete(5, (res, err) => handleError(err));
      client.post(5, {}, (res, err) => handleError(err));
      client.put(5, {}, (res, err) => handleError(err));
      client.patch(5, {}, (res, err) => handleError(err));
    },
  );

  it(
    "should reject invalid method request input errors",
    { timeout },
    (t, done) => {
      const handleError = generateErrorCheck(2, done);

      client.read("/", "read", (res, err) => handleError(err));
      client.write("/", "write", {}, (res, err) => handleError(err));
    },
  );

  it(
    "should reject invalid config request input errors",
    { timeout },
    (t, done) => {
      const handleError = generateErrorCheck(7, done);

      client.read("/", "get", "Invalid", (res, err) => handleError(err));
      client.write("/", "post", {}, "Invalid", (res, err) => handleError(err));
      client.get("/", "Invalid", (res, err) => handleError(err));
      client.delete("/", "Invalid", (res, err) => handleError(err));
      client.post("/", {}, "Invalid", (res, err) => handleError(err));
      client.put("/", {}, "Invalid", (res, err) => handleError(err));
      client.patch("/", {}, "Invalid", (res, err) => handleError(err));
    },
  );

  it(
    "should reject invalid callback request input errors",
    { timeout },
    (t, done) => {
      const handleError = generateErrorCheck(7, done);

      client.read("/", "get", {}, "Invalid").catch(handleError);
      client.write("/", "post", {}, {}, "Invalid").catch(handleError);
      client.get("/", {}, "Invalid").catch(handleError);
      client.delete("/", {}, "Invalid").catch(handleError);
      client.post("/", {}, {}, "Inavlid").catch(handleError);
      client.put("/", {}, {}, "Invalid").catch(handleError);
      client.patch("/", {}, {}, "Invalid").catch(handleError);
    },
  );

  it("should have inherited instance attributes", () => {
    const protocol = protocols[client.getBaseURL().protocol];
    assert.deepStrictEqual(client.Agent, protocol.Agent);
    assert.deepStrictEqual(client.globalAgent, protocol.globalAgent);
    assert.deepStrictEqual(client.request, protocol.request);

    // Exclusive http properties
    assert.deepStrictEqual(client.ClientRequest, http.ClientRequest);
    assert.deepStrictEqual(client.IncomingMessage, http.IncomingMessage);
    assert.deepStrictEqual(client.OutgoingMessage, http.OutgoingMessage);
    assert.deepStrictEqual(client.METHODS, http.METHODS);
    assert.deepStrictEqual(client.STATUS_CODES, http.STATUS_CODES);
    assert.deepStrictEqual(client.maxHeaderSize, http.maxHeaderSize);
    assert.deepStrictEqual(client.validateHeaderName, http.validateHeaderName);
    assert.deepStrictEqual(
      client.validateHeaderValue,
      http.validateHeaderValue,
    );

    // Implemented custom header getter methods
    assert.strictEqual(
      typeof client.IncomingMessage.prototype.getHeader,
      "function",
      "inherited IncomingMessage class should have custom getHeader method",
    );
    assert.strictEqual(
      typeof client.IncomingMessage.prototype.getHeaders,
      "function",
      "inherited IncomingMessage class should have custom getHeaders method",
    );
    assert.strictEqual(
      typeof client.IncomingMessage.prototype.getHeaderNames,
      "function",
      "inherited IncomingMessage class should have custom getHeaderNames method",
    );
    assert.strictEqual(
      typeof client.IncomingMessage.prototype.hasHeader,
      "function",
      "inherited IncomingMessage class should have custom hasHeader method",
    );
  });
});
