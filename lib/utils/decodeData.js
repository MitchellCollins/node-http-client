exports = module.exports = decodeData;

function decodeData(data, contentType) {
  if (!data || !contentType) return data;

  // Decode response data based off content type
  if (contentType === "application/json") return JSON.parse(data);

  if (contentType === "application/x-www-form-urlencoded")
    return new URLSearchParams(data);

  return data;
}
