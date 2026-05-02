const { describe, it, before, after } = require("node:test");
const assert = require("node:assert");
const http = require("node:http");
const Stream = require("node:stream");
const nexis = require("../index");

describe("requests on test server", () => {
  let server;
  const port = 3000;

  before(async () => {
    server = http.createServer((req, res) => {
      const chunks = [];
      req.on("data", (chunk) => {
        chunks.push(chunk);
      });

      req.on("end", async () => {
        if (chunks.length > 0) req.body = Buffer.concat(chunks).toString();

        // Basic get request
        if (req.url === "/" && req.method === "GET") {
          res.writeHead(200, { "content-type": "text/plain" });
          res.end("Hello, World!");
          return;
        }

        // Get auth request
        if (req.url === "/auth" && req.method === "GET") {
          res.writeHead(200, { "content-type": "text/plain" });
          res.end(req.headers.authorization);
          return;
        }

        // Get date request
        if (req.url === "/date" && req.method === "GET") {
          res.writeHead(200, { "content-type": "text/plain" });
          res.end(req.headers.date);
          return;
        }

        // Get redirect request
        if (req.url === "/resource" && req.method === "GET") {
          res.writeHead(301, { location: "/new-resource" });
          res.end();
          return;
        }
        if (req.url === "/new-resource" && req.method === "GET") {
          res.writeHead(301, { location: "/newer-resource" });
          res.end();
          return;
        }
        if (req.url === "/newer-resource" && req.method === "GET") {
          res.writeHead(200, { "content-type": "text/plain" });
          res.end("Newer Resource");
          return;
        }

        // Get case-insenitive request
        if (req.url === "/case" && req.method === "GET") {
          res.writeHead(200, { "Content-Type": "application/json" });
          res.end(JSON.stringify({ message: "Hello" }));
          return;
        }

        // Get timeout request
        if (req.url === "/timeout" && req.method === "GET") {
          /* eslint no-empty: "off" */
          async function timeout() {
            return setTimeout(() => res.end(), 1);
          }
          await timeout();
          return;
        }

        // Get events request
        if (req.url === "/events" && req.method === "GET") {
          res.writeHead(200);
          res.end(req.getHeader("content-type"));
          return;
        }

        // Post object request
        if (req.url === "/" && req.method === "POST") {
          res.writeHead(200, { "content-type": "application/json" });
          res.end(req.body);
          return;
        }

        // Post plain text request
        if (req.url === "/text" && req.method === "POST") {
          res.writeHead(200, { "content-type": "text/plain" });
          res.end(req.body);
          return;
        }

        // Post URLSearchParams request
        if (req.url === "/search-params" && req.method === "POST") {
          res.writeHead(200, {
            "content-type": "application/x-www-form-urlencoded",
          });
          res.end(req.body);
          return;
        }

        // Post buffer request
        if (req.url === "/buffer" && req.method === "POST") {
          res.writeHead(200, { "content-type": "application/octet-stream" });
          res.end(req.body);
          return;
        }

        // Post array buffer request
        if (req.url === "/arraybuffer" && req.method === "POST") {
          res.writeHead(200, { "content-type": "application/octet-stream" });
          res.end(req.body);
          return;
        }

        // Post array buffer view request
        if (req.url === "/view" && req.method === "POST") {
          res.writeHead(200, { "content-type": "application/octet-stream" });
          res.end(req.body);
          return;
        }

        // Post stream request
        if (req.url === "/stream" && req.method === "POST") {
          res.writeHead(200, { "content-type": "application/octet-stream" });
          res.end(req.body);
          return;
        }

        // Delete path variable request
        if (req.url.includes("/") && req.method === "DELETE") {
          const data = JSON.stringify({
            id: parseInt(req.url.slice(1, req.url.length)),
          });
          res.writeHead(200, { "content-type": "application/json" });
          res.end(data);
          return;
        }

        // Put param request
        if (req.url.includes("/") && req.method === "PUT") {
          const equalIndex = req.url.indexOf("=");
          const key = req.url.slice(req.url.indexOf("?") + 1, equalIndex);
          const value = req.url.slice(equalIndex + 1, req.url.length);
          const data = JSON.stringify({ [key]: value });
          res.writeHead(200, { "content-type": "application/json" });
          res.end(data);
          return;
        }

        res.writeHead(404);
        res.end();
      });
    });

    server.on("listening", () => {
      console.log(
        `Test server listening at: ${server.address().address}:${port}`,
      );
    });

    server.on("error", (err) => {
      console.log("Test Server Error:", err);
    });

    server.listen(port);
  });

  after(() => {
    server.close();
  });

  const client = nexis.create({ port, maxRedirects: 2 });
  const timeout = 500; // Test timeout

  it("read get request", async () => {
    const response = await client.read("/", "get");
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, "Hello, World!");
  });

  it("read get request default params", async () => {
    const response = await client.read();
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, "Hello, World!");
  });

  it("write post request", async () => {
    const data = { message: "Hello, World!" };
    const response = await client.write("/", "post", data);
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.data, data);
  });

  it("write post request default params", async () => {
    const response = await client.write();
    assert.strictEqual(response.statusCode, 200);
  });

  it("basic get request promise response", async () => {
    const response = await client.get("/");
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, "Hello, World!");
  });

  it("basic get request callback response", async () => {
    client.get("/", (response) => {
      assert.strictEqual(response.statusCode, 200);
      assert.strictEqual(response.data, "Hello, World!");
    });
  });

  it("basic get request default params", async () => {
    const response = await client.get();
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, "Hello, World!");
  });

  it("basic post request default params", async () => {
    const response = await client.post();
    assert.strictEqual(response.statusCode, 200);
  });

  it("post object request", async () => {
    const data = { message: "Hello, World!" };
    const response = await client.post("/", data);
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.data, data);
  });

  it("post plain text request", async () => {
    const data = "Hello, World!";
    const response = await client.post("/text", data);
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, data);
  });

  it("post URLSearchParam request", async () => {
    const data = new URLSearchParams({ id: "1", message: "Hello" });
    const response = await client.post("/search-params", data);
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.data, data);
  });

  it("post buffer request", async () => {
    const buf = Buffer.from("Hello");
    const response = await client.post("/buffer", buf);
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, buf.toString());
  });

  it("post array buffer request", async () => {
    const arrayBuffer = Buffer.from("Hello").buffer;
    const response = await client.post("/arraybuffer", arrayBuffer);
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, Buffer.from(arrayBuffer).toString());
  });

  it("post array buffer view request", async () => {
    const view = new Uint8Array(Buffer.from("Hello"));
    const response = await client.post("/view", view);
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(
      response.data,
      Buffer.from(view.buffer, view.byteOffset, view.byteLength).toString(),
    );
  });

  it("post stream request", async () => {
    const data = Stream.Readable.from(["Hello"]);
    const response = await client.post("/stream", data);
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, "Hello");
  });

  it("delete path variable request", async () => {
    const id = 1;
    const response = await client.delete(`/${id}`);
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.data, { id });
  });

  it("put param request", async () => {
    const key = "name";
    const value = "test";
    const response = await client.put(`/?${key}=${value}`, {});
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.data, { [key]: value });
  });

  it("basic authorization request", async () => {
    const authorization = {
      scheme: "basic",
      username: "test",
      password: "1234",
    };
    const { username, password } = authorization;
    const response = await client.get("/auth", { headers: { authorization } });
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(
      response.data,
      `Basic ${btoa(`${username}:${password}`)}`,
    );
  });

  it("bearer authorization request", async () => {
    const authorization = { scheme: "bearer", token: "hfghe7373rdgf" };
    const response = await client.get("/auth", { headers: { authorization } });
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, `Bearer ${authorization.token}`);
  });

  it("digest authorization request", async () => {
    const authorization = { scheme: "digest", username: "test", realm: "test" };
    const response = await client.get("/auth", { headers: { authorization } });
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.data, "Digest username=test,realm=test");
  });

  it("unformatted bearer request", async () => {
    const authorization = "Bearer hfghe7373rdgf";
    const response = await client.get("/auth", { headers: { authorization } });
    assert.strictEqual(response.statusCode, 200);
    assert.strictEqual(response.data, authorization);
  });

  it("invalid authorization scheme error thrown", { timeout }, (t, done) => {
    const authorization = { scheme: "invalid", username: "test" };
    client.get("/auth", { headers: { authorization } }).catch((error) => {
      try {
        assert.ok(error.req, "should provide request object");
        assert.ok(error.res, "should provide response object");
        assert.strictEqual(
          error instanceof nexis.NexisError,
          true,
          "should reject NexisError",
        );
        assert.strictEqual(
          error.message.includes("Invalid Auth Scheme"),
          true,
          "error message should include 'Invalid Auth Scheme'",
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("get date request", async () => {
    // Auto generate date
    const autoResponse = await client.get("/date");
    assert.strictEqual(autoResponse.statusCode, 200);
    assert.strictEqual(typeof autoResponse.data, "string");
    assert.strictEqual(
      autoResponse.data !== "",
      true,
      "Expected non empty string",
    );

    // Manuelly assign date
    const date = new Date("April 11, 2026 15:10:00").toUTCString();
    const manuelResponse = await client.get("/date", { headers: { date } });
    assert.strictEqual(manuelResponse.statusCode, 200);
    assert.strictEqual(manuelResponse.data, date);
  });

  it("get redirect request", async () => {
    const redirectResponse = await client.get("/resource");
    assert.strictEqual(
      redirectResponse.statusCode,
      200,
      "should redirect to /newer-resource",
    );
    assert.strictEqual(
      redirectResponse.data,
      "Newer Resource",
      "should redirect to /newer-resource",
    );

    // Checks that the maxRedirect config isn't updated by reference
    //      When the request subtracts it and passes it as the config to the next request
    assert.strictEqual(
      client.getConfig().maxRedirects,
      2,
      "maxRedirects should remain as set",
    );

    // Shouldn't redirect when set to 0
    client.setConfig({ port, maxRedirects: 0 });
    const nonRedirectResponse = await client.get("/resource");
    assert.strictEqual(
      nonRedirectResponse.statusCode,
      301,
      "shouldn't redirect when set to 0",
    );
    assert.strictEqual(
      nonRedirectResponse.headers.location,
      "/new-resource",
      "shouldn't redirect when set to 0",
    );
  });

  it("get request case-insenitive", async () => {
    const response = await client.get("/case");
    assert.strictEqual(response.statusCode, 200);
    assert.deepStrictEqual(response.data, { message: "Hello" });

    // Test getHeaders method
    assert.deepStrictEqual(
      response.getHeaders(["content-type", "connection"]),
      { "content-type": "application/json", connection: "keep-alive" },
      "response should have getHeaders method",
    );

    // Test getHeaderNames method
    assert.deepStrictEqual(
      response.getHeaderNames(),
      ["content-type", "date", "connection", "keep-alive", "transfer-encoding"],
      "response should have getHeaderNames method",
    );

    // Test hasHeader method
    assert.strictEqual(
      response.hasHeader("Content-Type"),
      true,
      "response should have hasHeader method",
    );
  });

  it("get timeout request", { timeout }, (t, done) => {
    client.get("/timeout", { timeout: 1 }).catch((error) => {
      try {
        assert.ok(error.req, "should provide request object");
        assert.ok(error.res, "should provide response object");
        assert.strictEqual(error instanceof Error, true, "should reject Error");
        assert.strictEqual(
          error.message.includes("Socket Connection Timeout"),
          true,
          "error message should include 'Socket Connection Timeout'",
        );
        done();
      } catch (err) {
        done(err);
      }
    });
  });

  it("get events request", { timeout }, (t, done) => {
    const contentType = "Hello";
    client.once("request", (req) => {
      req.setHeader("content-type", contentType);
    });
    client.once("data", (data) => {
      assert.strictEqual(data, contentType);
    });
    client.once("response", (res) => {
      try {
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(res.data, contentType);
        done();
      } catch (err) {
        done(err);
      }
    });
    client.get("/events");
  });

  it("get event redirect request", { timeout }, (t, done) => {
    client.once("redirect", (res, config) => {
      try {
        assert.strictEqual(res.statusCode, 301);
        assert.strictEqual(res.getHeader("location"), "/new-resource");
        assert.strictEqual(config.port, port);
        assert.strictEqual(config.maxRedirects, 1);
      } catch (err) {
        done(err);
      }
    });
    client.once("response", () => {
      done();
    });
    client.get("/resource", { maxRedirects: 1 });
  });

  it("get events error request", { timeout }, (t, done) => {
    client.once("error", (error) => {
      try {
        assert.ok(error.req, "should provide request object");
        assert.ok(error.res, "should provide response object");
        assert.strictEqual(error instanceof Error, true, "should reject Error");
        done();
      } catch (err) {
        done(err);
      }
    });

    // Creates timeout error
    client.get("/timeout", { timeout: 1 }).catch(() => null);
  });

  it("get events error request async", { timeout }, async () => {
    client.once("error", (error) => error);
    await client.get("/timeout", { timeout: 1 }).catch(() => null);
  });
});
