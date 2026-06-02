const NexisError = require("../core/NexisError");

exports = module.exports = decodeData;

function decodeData(data, contentType) {
  if (!data || !contentType) return data;
  if (typeof contentType !== "string")
    throw new NexisError("contentType must be string", {
      code: "ERR_NEXIS_INVALID_INPUT_TYPE",
      cause: "contentType must be string",
    });

  try {
    // Decode response data based off content type
    if (contentType === "application/json") return JSON.parse(data);

    if (contentType === "application/x-www-form-urlencoded")
      return new URLSearchParams(data);
  } catch (err) {
    throw new NexisError(
      "data & contentType didn't correlate to the same datatype",
      {
        ...err,
        code: "ERR_NEXIS_INVALID_CONTENT_TYPE",
        cause: "contentType didn't refer to the datatype of data input",
      },
    );
  }

  return data;
}
