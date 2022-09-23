export enum CompareResult {
    LESS    = -1,  // First item is less, or this instance is less
    EQUAL   = 0,   // The instances are equal
    GREATER = 1    // Second item is less, or this instance is greater
}


export type CompareFunc<T> = (a: T, b: T) => CompareResult;


export interface IComparable<T> {
    compareTo(other: T): CompareResult;
}


////////////////////////////////////////////////////////////////////////////////
// Reusable compare functions

/**
 * Compares two strings.
 *
 * @param x - The first string
 * @param y - The second string
 * @return The result of the comparison
 */
export function compareStr(x: string, y: string): CompareResult {
    if (x < y) {
        return CompareResult.LESS;
    }
    else if (x > y) {
        return CompareResult.GREATER;
    }
    else {
        return CompareResult.EQUAL;
    }
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
