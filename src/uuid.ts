import { failedResult, Result, succeededResult } from ".";
import { IEquatable } from "./equate";


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
export enum UuidFormat {
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
export function generateUuid(format: UuidFormat = UuidFormat.D): string {
    let uuid = uuidv4();
    if (format === UuidFormat.N) {
        uuid = uuid.replace(/-/g, "");
    }
    return uuid;
}


export class Uuid implements IEquatable<Uuid> {
    /**
     * Creates a standardized representation of the specified UUID string to make
     * validation and comparison simpler.
     *
     * @param uuidStr - The string UUID to be normalized
     * @return The normalized version of the specified UUID string.
     */
    private static toNormalizedString(uuidStr: string): string {
        return uuidStr.toLowerCase().replace(/-/g, "");
    }


    /**
     * Determines whether the specified string is a valid UUID string.
     *
     * @param uuidStr - The UUID string to be validated
     * @returns Whether the specified string is valid
     */
    public static isValid(uuidStr: string): boolean {
        const normalized = Uuid.toNormalizedString(uuidStr);
        const regex = new RegExp(`^${reStrUuidFormatN}$`);
        const isValid = regex.test(normalized);
        return isValid;
    }


    /**
     * Creates a new Uuid instance.
     *
     * @param format - The format that should be used for the generated UUID.
     * @return The new Uuid instance.
     */
    public static create(format: UuidFormat = UuidFormat.D): Uuid {
        const uuidStr = generateUuid(format);
        const instance = new Uuid(uuidStr);
        return instance;
    }


    /**
     * Creates a new Uuid instance that wraps the specified value.
     *
     * @param uuidStr - The raw value of the UUID to be wrapped.
     * @return A successful result containing the new instance or a failed result
     * containing an error message.
     */
    public static fromString(uuidStr: string): Result<Uuid, string> {
        const isValid = Uuid.isValid(uuidStr);
        if (!isValid) {
            return failedResult(`The string "${uuidStr}" is not a valid Uuid string.`);
        }

        const instance = new Uuid(uuidStr);
        return succeededResult(instance);
    }


    private readonly _uuidStr;


    // Private constructor.  Use static methods to create instances.
    protected constructor(uuidStr: string) {
        // Store the uuid using the format and case the caller is using.  If we
        // need to compare it to another Uuid, we will compare a normalized
        // version.
        this._uuidStr = uuidStr;

        // Enforce immutability.
        Object.freeze(this);
    }


    /**
     * Determines whether two Uuid instances are equal.
     *
     * @param other - The Uuid instance to compare this instance to
     * @return Whether this instance equals `other`.
     */
    public equals(other: Uuid): boolean {
        const thisNormalized = Uuid.toNormalizedString(this._uuidStr);
        const otherNormalized = Uuid.toNormalizedString(other._uuidStr);
        return thisNormalized === otherNormalized;
    }


    /**
     * The string representation of this Uuid.
     *
     * @return The string representation of this Uuid.
     */
    public toString(): string {
        return this._uuidStr;
    }
}
