const defaults = {
  baseURL: "http://localhost:80/",
  path: "/",
  method: { read: "get", write: "post" },
  config: () => ({
    port: 80,
    timeout: 10000,
    maxRedirects: 0,
  }),
  res: () => ({ data: null }),
  req: () => ({}),
};

exports = module.exports = defaults;
