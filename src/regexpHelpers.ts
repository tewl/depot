import * as _ from "lodash";

/**
 * Creates a new regular expression capable of detecting EOL.  Because regular
 * expressions have state, a function is used here to create new instances for
 * clients.
 * @param flags - Any RegExp flag that should be used when creating the regex.
 * @return The newly created regex
 */
export function createEolRegex(flags?: string): RegExp
{
    return new RegExp("\\r?\\n", flags);
}


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
