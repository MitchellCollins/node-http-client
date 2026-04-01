exports = module.exports = decodeData;

/**
 * Used to decode response data based off the content type.
 * @param {string} data 
 * @param {string} contentType 
 * @returns {string | object | URLSearchParams}
 */
function decodeData(data, contentType) {
    // Decode response data based off content type
    if (contentType === "application/json")
        return JSON.parse(data);

    if (contentType === "application/x-www-form-urlencoded")
        return new URLSearchParams(data);

    return data;
}