const defaults = {
    baseURL: "http://localhost:80/",
    config: () => ({ 
        port: 80,
        timeout: 10000,
    }),
    res: () => ({ data: null }),
    protocol: "http:"
}

exports = module.exports = defaults;