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

            req.on("end", () => {
                if (chunks.length > 0)
                    req.body = Buffer.concat(chunks).toString();
                
                // Basic get request
                if (req.url === "/" && req.method === "GET") {
                    res.writeHead(200, { "content-type": "text/plain" });
                    res.end("Hello, World!");
                    return;
                }

                // Get auth request
                if (req.url === "/auth" && req.method === "GET") {
                    res.writeHead(200, { "content-type": "application/json" });
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
                    res.writeHead(200, { "content-type": "text/plain" });
                    res.end("New Resource");
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
                    res.writeHead(200, { "content-type": "application/x-www-form-urlencoded" });
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
                    const data = JSON.stringify({ id: parseInt(req.url.slice(1, req.url.length)) });
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
            console.log(`Test server listening at: ${server.address().address}:${port}`);
        });

        server.on("error", (err) => {
            console.log("Test Server Error:", err);
        });

        server.listen(port);
    });

    after(() => {
        server.close();
    });
    
    const client = nexis.create({ port });

    it("read get request", async () => {
        const response = await client.read("/", "get");
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.data, "Hello, World!");
    });

    it("write post request", async () => {
        const data = { message: "Hello, World!" };
        const response = await client.write("/", "post", data);
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.data, data);
    });
    
    it("basic get request promise response", async () => {
        const response = await client.get("/");
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.data, "Hello, World!");
    });

    it("basic get request callback response", async () => {
        client.get("/", (response, err) => {
            assert.strictEqual(response.statusCode, 200);
            assert.strictEqual(response.data, "Hello, World!");
        });
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
        const data = new URLSearchParams({ "id": "1", "message": "Hello" });
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
        assert.strictEqual(response.data, Buffer.from(view.buffer, view.byteOffset, view.byteLength).toString());
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

    it("get authorization request", async () => {
        const authroization = { username: "Test", password: "1234" };
        const response = await client.get("/auth", { headers: { authroization } });
        assert.strictEqual(response.statusCode, 200);
        assert.deepStrictEqual(response.data, authroization);
    });

    it("get date request", async () => {
        // Auto generate date
        const autoResponse = await client.get("/date");
        assert.strictEqual(autoResponse.statusCode, 200);
        assert.strictEqual(typeof autoResponse.data, "string");
        assert.strictEqual(autoResponse.data !== "", true, "Expected non empty string");

        // Manuelly assign date
        const date = new Date("April 11, 2026 15:10:00").toUTCString();
        const manuelResponse = await client.get("/date", { headers: { date }});
        assert.strictEqual(manuelResponse.statusCode, 200);
        assert.strictEqual(manuelResponse.data, date);
    });

    it("get redirect request", async () => {
        const response = await client.get("/resource");
        assert.strictEqual(response.statusCode, 200);
        assert.strictEqual(response.data, "New Resource");
    });
});