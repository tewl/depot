import * as _ from "lodash";

/**
 * A RegExp that will match newlines in a platform independent way (i.e. Linux,
 * Mac and Windows).
 */
export const piNewline: RegExp = /\r?\n/;


/**
 * Determines whether the specified string matches any of the specified regular
 * expressions.
 * @param str - The string to test.
 * @param regexes - The regexes to test.
 * @return true if one or more of the regular expressions match `str`; false
 * otherwise.
 */
export function matchesAny(str: string, regexes: Array<RegExp>): boolean
{
    const matchesAny = _.some(regexes, (curRegex) => str.match(curRegex));
    return matchesAny;
}
