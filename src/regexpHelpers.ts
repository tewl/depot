import * as _ from "lodash";
import { FailedResult, Result, SucceededResult } from "./result";

/**
 * Creates a new regular expression capable of detecting EOL.  Because regular
 * expressions have state, a function is used here to create new instances for
 * clients.
 * @param flags - Any RegExp flag that should be used when creating the regex.
 * @return The newly created regex
 */
export function createEolRegex(flags?: string): RegExp {
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
export function matchesAny(str: string, regexes: Array<RegExp>): boolean {
    const matchesAny = _.some(regexes, (curRegex) => str.match(curRegex));
    return matchesAny;
}


type RegExpFlag = "d" | "g" | "i" | "m" | "s" | "u" | "y";


/**
 * Creates a new RegExp without the specified flags.
 * @param srcRegex - The source regex
 * @param flagsToClear - The flag to clear
 * @returns A new RegExp without the specified flag.
 */
export function clearFlags(srcRegex: RegExp, flagsToClear: Array<RegExpFlag>): RegExp {
    let newFlags = srcRegex.flags;
    flagsToClear.forEach((curFlag) => {
        newFlags = newFlags.replace(curFlag, "");
    });
    const newRegex = new RegExp(srcRegex, newFlags);
    return newRegex;
}


/**
 * Creates a new RegExp with the specified flags set.
 * @param srcRegex - The source regex
 * @param flagsToSet - The flag to set
 * @returns A new RegExp with the specified flag set
 */
export function setFlags(srcRegex: RegExp, flagsToSet: Array<RegExpFlag>): RegExp {
    let newFlags = srcRegex.flags;
    flagsToSet.forEach((curFlag) => {
        newFlags = newFlags.replace(curFlag, "") + curFlag;
    });
    const newRegex = new RegExp(srcRegex, newFlags);
    return newRegex;
}


/**
 * Gets a RegExp used to match regular expression expressions.  Wrapped in
 * this function to avoid problems with the instance's state.
 * @returns A regular expression that matches regular expression expressions.
 */
function getRegExpStrRegExp(): RegExp {
    const regexStrRegex = /^\/(?<pattern>.*)\/(?<flags>[dgimsuy]*)$/g;
    return regexStrRegex;
}


/**
 * Converts a string to a RegExp instance.
 * @param str - The string to convert to a RegExp.  May be of the form
 * "/<pattern>/<flags>" or "<pattern>".
 * @returns A Result for the RegExp instance.  Upon failure, the error
 * contains a descriptive error message.
 */
export function strToRegExp(str: string): Result<RegExp, string> {
    const matches = getRegExpStrRegExp().exec(str);
    try {
        if (matches) {
            const regex = new RegExp(matches.groups!.pattern, matches.groups!.flags);
            return new SucceededResult(regex);
        }
        else {
            const regex = new RegExp(str);
            return new SucceededResult(regex);
        }
    }
    catch (err) {
        return new FailedResult((err as Error).message);
    }
}
