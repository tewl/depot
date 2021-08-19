// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuidv4: () => string = require("uuid/v4");

// This class is a simple wrapper around the uuid package's uuid generator.
// I created this function, because I could not find accurate type definitions
// for this package.

/**
 * Returns a uuid v4 string (e.g. "c17898d0-6c10-46ad-9a50-966f602f73ca").
 * @return The generated uuid
 */
export function generateUuid(): string {
    return uuidv4();
}
