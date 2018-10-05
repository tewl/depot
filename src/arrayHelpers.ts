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
