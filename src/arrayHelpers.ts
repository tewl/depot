import * as _ from "lodash";

/**
 * Tests the strings in `strings` and returns the first non-null match.
 * @param strings - The array of strings to search
 * @param regex - The pattern to search for
 * @returns The first match found.  undefined if no match was found.
 */
export function anyMatchRegex(strings: Array<string>, regex: RegExp): RegExpExecArray | undefined {
    "use strict";

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
export function insertIf<ItemType>(condition: any, ...items: Array<ItemType>): Array<ItemType> {
    return condition ? items : [];
}


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
        allPermutations = allPermutations.concat(_.map(restPermutations, (curRestPermutation) => [vals[curIndex], ...curRestPermutation]));
    }

    return allPermutations;
}
