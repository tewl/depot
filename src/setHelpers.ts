/**
 * Returns a new set containing all elements from _a_ and _b_.
 * Implementation taken from https://2ality.com/2015/01/es6-set-operations.html.
 * @param a - The first set
 * @param b - The second set
 * @returns A set containing all elements from _a_ and _b_.
 */
export function union<T>(a: Set<T>, b: Set<T>): Set<T> {
    const union = new Set([...a, ...b]);
    return union;
}


/**
 * Returns a new set containing the elements that are in both _a_ and _b_.
 * Implementation taken from https://2ality.com/2015/01/es6-set-operations.html.
 * @param a - The first set
 * @param b - The second set
 * @returns The set containing all common elements.
 */
export function intersection<T>(a: Set<T>, b: Set<T>): Set<T> {
    const intersection = new Set([...a].filter((x) => b.has(x)));
    return intersection;
}


/**
 * Returns a new set with the elements of _b_ removed from _a_.
 * Implementation taken from https://2ality.com/2015/01/es6-set-operations.html.
 * @param a - The set to remove elements from
 * @param b - The set whose elements will be removed from _a_
 * @return The set with the elements of _b_ removed from _a_
 */
export function difference<T>(a: Set<T>, b: Set<T>): Set<T> {
    const difference = new Set([...a].filter((x) => !b.has(x)));
    return difference;
}
