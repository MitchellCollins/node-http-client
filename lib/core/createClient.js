const deepMerge = require("../utils/deepMerge");
const Nexis = require("./Nexis");

exports = module.exports = createClient;

function createClient(defaultConfig) {
    const client = new Nexis(defaultConfig);

    client.create = function create(instanceConfig) {
        return createClient(deepMerge(defaultConfig, instanceConfig));
    }

    return client;
}