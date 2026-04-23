const defaults = require("../defaults");

class NexisError extends Error {
  constructor(message, options = {}) {
    const { req = defaults.req(), res = defaults.res(), ...other } = options;

    if (message instanceof Error) {
      const { message: mess, stack } = message;
      super(mess, { stack, ...other });
    } else {
      super(message, other);
    }

    this.code = other.code || message.code || null;

    this.req = req;
    this.res = res;
  }
}

exports = module.exports = NexisError;
