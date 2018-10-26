// tslint:disable-next-line:no-submodule-imports no-var-requires no-require-imports
const uuidv4: () => string = require("uuid/v4");

// This class is a simple wrapper around the uuid package's uuid generator.
// I created this function, because I could not find accurate type definitions
// for this package.

/**
 * Returns a uuid v4 string.
 * @return The generated ID
 */
export function generateId(): string {
    return uuidv4();
}
