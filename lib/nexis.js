const createClient = require("./core/createClient");
const Nexis = require("./core/Nexis");
const defaults = require("./defaults");
const protocols = require("./protocols");
const deepMerge = require("./utils/deepMerge");
const encodeConfigBody = require("./utils/encodeConfigBody");
const decodeData = require("./utils/decodeData");

const nexis = createClient({ baseURL: defaults.baseURL, ...defaults.config() });

nexis.Nexis = Nexis;

nexis.defaults = defaults;
nexis.protocols = protocols;

nexis.deepMerge = deepMerge;
nexis.encodeConfigBody = encodeConfigBody;
nexis.decodeData = decodeData;

exports = module.exports = nexis;