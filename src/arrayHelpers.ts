/**
 * Tests the strings in `strings` and returns the first non-null match.
 * @param strings - The array of strings to search
 * @param regex - The pattern to search for
 * @returns The first match found.  null if no match was found.
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
 * Returns `items` when `condition` is true and returns [] when it is false.
 * This function and the array spread operator can be used together to
 * conditionally including array items in an array literal.  Inspired by
 * http://2ality.com/2017/04/conditional-literal-entries.html.
 *
 * @example
 * const arr = [
 *     ...insertIf(cond, "a", "b", "c")
 * ];
 *
 * @param condition - The condition that controls whether to insert the items
 * @param items - The items that will be in the returned array if `condition` is
 * true
 * @return An array containing `items` if `condition` is true.  An empty array
 * if `condition` is false.
 */
export function insertIf<ItemType>(condition: boolean, ...items: Array<ItemType>): Array<ItemType> {
    return condition ? items : [];
}
