const Stream = require("node:stream");

exports = module.exports = encodeConfigBody;

function encodeConfigBody(body) {
  if (body === undefined || body === null) {
    return [null, { "content-type": null, "content-length": 0 }];
  }

  if (Buffer.isBuffer(body)) {
    return [
      body,
      {
        "content-type": "application/octet-stream",
        "content-length": body.length,
      },
    ];
  }

  if (typeof body === "string") {
    const length = Buffer.byteLength(body, "utf8");
    return [
      body,
      { "content-type": "text/plain; charset=utf-8", "content-length": length },
    ];
  }

  if (body instanceof URLSearchParams) {
    const encoded = body.toString();
    return [
      encoded,
      {
        "content-type": "application/x-www-form-urlencoded; charset=utf-8",
        "content-length": Buffer.byteLength(encoded, "utf8"),
      },
    ];
  }

  if (body instanceof Stream) {
    return [body, { "content-type": "application/octet-stream" }];
  }

  if (ArrayBuffer.isView(body)) {
    const buf = Buffer.from(body.buffer, body.byteOffset, body.byteLength);
    return [
      buf,
      {
        "content-type": "application/octet-stream",
        "content-length": buf.length,
      },
    ];
  }

  if (body instanceof ArrayBuffer) {
    const buf = Buffer.from(body);
    return [
      buf,
      {
        "content-type": "application/octet-stream",
        "content-length": buf.length,
      },
    ];
  }

  if (typeof body === "object") {
    const text = JSON.stringify(body);
    return [
      text,
      {
        "content-type": "application/json; charset=utf-8",
        "content-length": Buffer.byteLength(text, "utf8"),
      },
    ];
  }

  const text = String(body);
  return [
    text,
    {
      "content-type": "text/plain; charset=utf-8",
      "content-length": Buffer.byteLength(text, "utf8"),
    },
  ];
}
