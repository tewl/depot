// eslint-disable-next-line @typescript-eslint/no-var-requires
const uuidv4: () => string = require("uuid/v4");

// This module is a simple wrapper around the uuid package's uuid generator.
// I created this module, because I could not find accurate type definitions
// for this package.


/**
 * Format specifiers for UUID strings.  These formats were taken from the following
 * page:
 * https://docs.microsoft.com/en-us/dotnet/api/system.guid.tostring?view=net-5.0
 */
export enum UuidFormat
{
    /**
     * Dashed format.  Example: "9f7bc8b7-a483-43a7-8c3a-df36fe59e9b4"
     */
    D = "D",

    /**
     * Normal format.  Example: "9f7bc8b7a48343a78c3adf36fe59e9b4"
     */
    N = "N"
}


/**
 * A string defining a regex that matches UUIDs in the "D" (dashed) format.
 */
export const reStrUuidFormatD = "(?<g1>[0-9a-f]{8})-(?<g2>[0-9a-f]{4})-(?<g3>[0-9a-f]{4})-(?<g4>[0-9a-f]{4})-(?<g5>[0-9a-f]{12})";


/**
 * A string defining a regex that matches UUIDs in the "N" (normal) format.
 */
export const reStrUuidFormatN = "[0-9a-f]{32}";


/**
 * Returns a uuid v4 string in the desired format.
 * @param format - The format of the returned uuid string (default: dashed)
 * @return The generated uuid
 */
export function generateUuid(format: UuidFormat = UuidFormat.D): string
{
    let uuid = uuidv4();
    if (format === UuidFormat.N)
    {
        uuid = uuid.replace(/-/g, "");
    }
    return uuid;
}
