exports = module.exports = decodeData;

function decodeData(data, contentType) {
  // Decode response data based off content type
  if (contentType === "application/json") return JSON.parse(data);

  if (contentType === "application/x-www-form-urlencoded")
    return new URLSearchParams(data);

  return data;
}
