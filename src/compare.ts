export enum CompareResult {
    /// First item is less, or this instance is less
    LESS    = -1,
    /// The instances are equal
    EQUAL   = 0,
    /// Second item is less, or this instance is greater
    GREATER = 1
}


export type CompareFunc<T> = (a: T, b: T) => CompareResult;


export interface IComparable<T> {
    compareTo(other: T): CompareResult;
}


////////////////////////////////////////////////////////////////////////////////
// Reusable compare functions

/**
 * Compares two items using the less than operator.
 *
 * @param x - The first item
 * @param y - The second item
 * @return The result of the comparison
 */
export function compareIntrinsic<T>(x: T, y: T): CompareResult {
    if (x < y) {
        return CompareResult.LESS;
    }
    else if (y < x) {
        return CompareResult.GREATER;
    }
    else {
        return CompareResult.EQUAL;
    }
}


/**
 * Compares two strings.
 *
 * @param x - The first string
 * @param y - The second string
 * @return The result of the comparison
 */
export function compareStr(x: string, y: string): CompareResult {
    return compareIntrinsic(x, y);
}


/**
 * Compares two strings in a case insensitive way.
 *
 * @param x - The first string
 * @param y - The second string
 * @return The result of the comparison
 */
export function compareStrI(x: string, y: string): CompareResult {
    const res = x.localeCompare(y, "en", {sensitivity: "base"});
    if (res === 0) {
        return CompareResult.EQUAL;
    }
    else if (res < 0) {
        return CompareResult.LESS;
    }
    else {
        return CompareResult.GREATER;
    }
}
