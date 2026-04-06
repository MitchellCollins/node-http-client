exports = module.exports = deepMerge;

function deepMerge(object1, object2) {
    if (object2) {
        Object.keys(object2).forEach((property) => {
            // Recursion to merge deeper object
            if (typeof object2[property] === "object") {
                object1[property] = {};
                object1[property] = deepMerge(object1[property], object2[property]);
                return;
            }

            object1[property] = object2[property];
        });
    }

    return object1;
}