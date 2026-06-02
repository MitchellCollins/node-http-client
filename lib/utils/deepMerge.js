const NexisError = require("../core/NexisError");

exports = module.exports = deepMerge;

function deepMerge(object1, object2) {
  if (!object1) object1 = {};
  else if (typeof object1 !== "object")
    throw new NexisError("object1 must be object", {
      code: "ERR_NEXIS_INVALID_INPUT_TYPE",
      cause: "object1 must be object",
    });

  if (!object2) return object1;
  if (typeof object2 !== "object")
    throw new NexisError("object2 must be object", {
      code: "ERR_NEXIS_INVALID_INPUT_TYPE",
      cause: "object2 must be object",
    });

  Object.keys(object2).forEach((property) => {
    // Recursion to merge deeper object
    if (typeof object2[property] === "object") {
      if (typeof object1[property] !== "object")
        object1[property] = object2[property];
      else object1[property] = deepMerge(object1[property], object2[property]);
      return;
    }

    object1[property] = object2[property];
  });

  return object1;
}
