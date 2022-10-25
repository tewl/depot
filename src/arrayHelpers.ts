import * as _ from "lodash";

/**
 * Tests the strings in `strings` and returns the first non-null match.
 * @param strings - The array of strings to search
 * @param regex - The pattern to search for
 * @returns The first match found.  undefined if no match was found.
 */
export function anyMatchRegex(strings: Array<string>, regex: RegExp): RegExpExecArray | undefined {
    for (const curString of strings) {
        const curMatch: RegExpExecArray|null = regex.exec(curString);
        if (curMatch) {
            return curMatch;
        }
    }

    return undefined;
}


/**
 * Returns `items` when `condition` is truthy and returns [] when it is falsy.
 * This function and the array spread operator can be used together to
 * conditionally including array items in an array literal.  Inspired by
 * http://2ality.com/2017/04/conditional-literal-entries.html.
 *
 * @example
 * const arr = [
 *     "always present",
 *     ...insertIf(cond, "a", "b", "c"),
 *     "always present"
 * ];
 *
 * @param condition - The condition that controls whether to insert the items
 * @param items - The items that will be in the returned array if `condition` is
 * truthy
 * @return An array containing `items` if `condition` is truthy.  An empty array
 * if `condition` is falsy.
 */
export function insertIf<TItem>(
    condition: unknown,  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    ...items: Array<TItem>
): Array<TItem> {
    return condition ? items : [];
}


/**
 * Calculates all possible permutations of an array.
 * @param vals - The values for which all permutations will be calculated.
 * @returns An array in which each value is an array representing one
 * permutation of the original array.
 */
export function permutations<T>(vals: Array<T>): Array<Array<T>> {
    if (vals.length === 0) {
        return [];
    }

    if (vals.length === 1) {
        return [vals];
    }

    let allPermutations: Array<Array<T>> = [];

    // To calculate the permutations, calculate the permutations where each
    // element is the first element.
    for (let curIndex = 0; curIndex < vals.length; ++curIndex) {
        const rest = _.filter(vals, (val, index) => index !== curIndex);
        const restPermutations = permutations(rest);
        allPermutations = allPermutations.concat(
            _.map(restPermutations, (curRestPermutation) => [vals[curIndex], ...curRestPermutation])
        );
    }

    return allPermutations;
}


/**
 * If needed, converts the specified value to an array.
 * @param val - The value to convert into an array (if it is not already an
 * array)
 * @returns - The resulting array.
 */
export function toArray<T>(val: undefined | null | T | Array<T>): Array<T> {
    if (val === undefined || val === null) {
        return [];
    }

    return Array.isArray(val) ? val : [val];
}



/**
 * Splits an array into two smaller arrays.
 *
 * @param arr - The source array
 * @param numToTake - Maximum number of elements that will be in the first returned array
 * @returns A tuple containing the two parts of the split array.
 */
export function split<T>(arr: Array<T>, numToTake: number): [Array<T>, Array<T>] {
    const first = _.take(arr, numToTake);
    const second = arr.slice(first.length);
    return [first, second];
}
