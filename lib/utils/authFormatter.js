const NexisError = require("../core/NexisError");

exports = module.exports = authFormatter;

function authFormatter(auth, onReject) {
  // Only formats if is an object
  if (!auth || typeof auth !== "object") return auth;

  /* eslint no-case-declarations: "off" */
  const { scheme, ...credentials } = auth;
  switch (scheme.toLowerCase()) {
    case "basic":
      const { username, password } = credentials;
      return `Basic ${btoa(`${username}:${password}`)}`;

    case "bearer":
      return `Bearer ${credentials.token}`;

    case "digest":
      let string = "Digest ";
      const entries = Object.entries(credentials);
      for (let i = 0; i < entries.length; i++) {
        const [key, value] = entries[i];
        string += `${key}=${value},`;
      }

      // Removes the comma at the end
      return string.slice(0, string.length - 1);

    default:
      onReject(
        new NexisError("Invalid Auth Scheme", {
          code: "ERR_INVALID_AUTH_SCHEME",
        }),
      );
  }
}
