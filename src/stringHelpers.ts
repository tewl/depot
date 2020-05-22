import * as _ from "lodash";
import {piNewline} from "./regexpHelpers";


/**
 * Counts the number of times padStr occurs at the beginning of str.
 * @param str - The string to inspect
 * @param padStr - The substring to count occurrences of
 * @return The number of times padStr occurs at the beginning of str
 */
export function numInitial(str: string, padStr: string): number
{
    if (padStr === "")
    {
        return 0;
    }

    let curStr = str;
    let numOccurrences = 0;

    while (_.startsWith(curStr, padStr))
    {
        ++numOccurrences;
        curStr = curStr.slice(padStr.length);
    }

    return numOccurrences;
}


/**
 * Creates a string where each line of src is indented.
 * @param src - The string to be indented
 * @param numSpacesOrPad - The number of spaces to indent each line
 * @param skipFirstLine - If truthy, the first line will not be indented
 * @return A new string where each line is indented
 */
export function indent(
    src: string,
    numSpacesOrPad: number | string,
    skipFirstLine: boolean = false
): string
{
    if (numSpacesOrPad === 0) {
        return src;
    }
    else
    {
        // If the caller specified a string, use that as the pad.  Otherwise,
        // treat the number as the number of spaces.
        const pad: string = typeof numSpacesOrPad === "string" ?
                            numSpacesOrPad :
                            _.repeat(" ", numSpacesOrPad);

        // The only way replace() will replace all instances is to use the "g"
        // flag with replace(). Use the m flag so that ^ and $ match within the
        // string.
        const replaceRegex: RegExp = /^(.*?)$/gm;
        const replaceFunc = function replaceFunc(
            match: any,
            group1: string,
            offset: number
        ): string {
            // If told to skip the first line and this is the first line, skip it.
            return skipFirstLine && (offset === 0) ?
                   group1 :
                   pad + group1;
        };

        return _.replace(src, replaceRegex, replaceFunc);
    }
}


/**
 * Creates a new string where lines are no longer indented
 * @param str - The indented string
 * @param padStr - The string that has been used to indent lines in str
 * @param greedy - If `true`, as many occurrences of `padStr` will be removed as
 *     possible.  If `false`, only one occurrence will be removed.
 * @return A new version of str without the indentations
 */
export function outdent(str: string, padStr: string = " ", greedy: boolean = true): string
{
    const lines = str.split(piNewline);
    const initOccurrences = _.map(lines, (curLine) => numInitial(curLine, padStr));
    let numToRemove = _.min(initOccurrences);
    if (!greedy) {
        // We should not be greedy, so only remove (at most) 1 occurrence of
        // `padStr`.
        numToRemove = _.min([numToRemove, 1]);
    }

    const numCharsToRemove = padStr.length * numToRemove!;

    const resultLines = _.map(lines, (curLine) => curLine.slice(numCharsToRemove));
    // Join the lines back together again.
    return resultLines.join("\n");
}


const blankLineRegex = /^\s*$/;


/**
 * Creates a new version of str without leading and trailing blank lines
 * @param str - The original string
 * @return A version of str without leading and trailing blank lines
 */
export function trimBlankLines(str: string): string
{
    const lines = str.split(piNewline);

    while ((lines.length > 0) &&
          blankLineRegex.test(lines[0]))
    {
        lines.shift();
    }

    while ((lines.length > 0) &&
          blankLineRegex.test(_.last(lines)!))
    {
        lines.pop();
    }

    return lines.join("\n");
}


export function removeBlankLines(str: string): string
{
    let lines = str.split(piNewline);
    lines = _.filter(lines, (curLine) => !blankLineRegex.test(curLine));
    return lines.join("\n");
}


const whitespaceRegex = /\s+/g;


/**
 * Creates a new string in which all whitespace has been removed from str.
 * @param str - The original string to remove whitespace from
 * @return A new string in which all whitespace has been removed.
 */
export function removeWhitespace(str: string): string
{
    return str.replace(whitespaceRegex, "");
}


/**
 * Splits a string into individual lines. The source string may contain
 * posix-style newlines, Windows-style newlines, or a mixture of the two.
 * @param src - The string to be split.
 * @return An array of string segments
 */
export function splitLinesOsIndependent(src: string): Array<string>
{
    let lines = _.split(src, "\n");
    lines = _.map(lines, (curLine) => {
        return _.trimEnd(curLine, "\r");
    });
    return lines;
}


export function padLeft(src: string, pad: string, desiredLength: number): string {
    const numPadChars = desiredLength - src.length;
    if (numPadChars <= 0)
    {
        return src;
    }

    let fullPad: string = "";
    while (fullPad.length < numPadChars)
    {
        fullPad = fullPad + pad;
    }

    fullPad = fullPad.slice(0, numPadChars);
    return fullPad + src;
}


export function padRight(src: string, pad: string, desiredLength: number): string
{
    const numPadChars = desiredLength - src.length;
    if (numPadChars <= 0)
    {
        return src;
    }

    let fullPad: string = "";
    while (fullPad.length < numPadChars)
    {
        fullPad = fullPad + pad;
    }

    fullPad = fullPad.slice(0, numPadChars);
    return src + fullPad;
}
