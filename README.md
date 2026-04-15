# Node HTTP Client

A lightweight HTTP request library built on top of the Node.js `http` module.
This package provides a simple API for making HTTP requests and handling responses without external dependencies.

## Features

- Simple API for HTTP requests
- Built on Node.js native `http` module
- Supports common HTTP methods
- Lightweight with no external dependencies
- Promise-based or callback-based responses

## Installation

```bash
npm install node-http-client
```

## Usage

### Import

```js
const HTTPClient = require("node-http-client");
```

---

### GET Request

```js
HTTPClient.get("jsonplaceholder.typicode.com/posts/1")
  .then((response) => {
    console.log(response.status);
    console.log(response.data);
  })
  .catch((err) => {
    console.error(err);
  });
```

---

### POST Request

```js
HTTP.post("jsonplaceholder.typicode.com/posts", {
  title: "Hello",
  body: "Testing request",
  userId: 1,
}).then((response) => {
  console.log(response.data);
});
```

---

### Construct

```js
const client = new HTTPClient({
  baseURL: "jsonplaceholder.typicode.com",
  port: 80,
});

client.get("/posts/1", (res, err) => {
  if (err) {
    console.error("Request Error:", err);
    return;
  }

  console.log("Response:", res);
});
```

## Example Response Object

```js
{
  status: 200,
  headers: {...},
  data: {...}
}
```

---

## API

### `request.get(url, options)`

Sends a GET request.

**Parameters**

- `url` – The request URL
- `options` – Optional request configuration

---

### `request.post(url, body, options)`

Sends a POST request.

**Parameters**

- `url` – The request URL
- `body` – Request body
- `options` – Optional request configuration

---

### Options

```js
{
  headers: {},
  timeout: 5000
}
```

---

## Testing APIs

You can test requests using free public APIs such as:

- https://jsonplaceholder.typicode.com
- https://httpbin.org

Example:

```
GET https://jsonplaceholder.typicode.com/posts/1
```

---

## Example Project

```js
const HTTPClient = require("simple-http-client");

async function run() {
  const res = await HTTPClient.get("http://jsonplaceholder.typicode.com/users");

  console.log(res.data);
}

run();
```

---

## License

ISC
