/**
 * Defines the default values.
 */
const defaults = {
    baseURL: "",
    config: () => ({ 
        port: 80,
        timeout: 10000,
    }),
    res: () => ({ data: null }),
    protocol: "http"
}

exports = module.exports = defaults;