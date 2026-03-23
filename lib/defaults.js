/**
 * Defines the default values.
 */
const defaults = {
    baseURL: "",
    config: () => ({ 
        port: 80,
        timeout: 10000,
    }),
    res: () => ({ data: null })
}

exports = module.exports = defaults;