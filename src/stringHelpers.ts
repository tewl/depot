import * as os from "os";
import * as _ from "lodash";
import {createEolRegex} from "./regexpHelpers";


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
    skipFirstLine = false
): string
{
    if (numSpacesOrPad === 0)
    {
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
        // TODO: Convert the following regex to use named capture groups.
        // eslint-disable-next-line prefer-named-capture-group
        const replaceRegex = /^(.*?)$/gm;
        const replaceFunc = function replaceFunc(
            match: string,
            group1: string,
            offset: number
        ): string
        {
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
export function outdent(str: string, padStr = " ", greedy = true): string
{
    const lines = splitIntoLines(str, true);
    const initOccurrences = _.map(lines, (curLine) => numInitial(curLine, padStr));
    let numToRemove = _.min(initOccurrences);
    if (!greedy)
    {
        // We should not be greedy, so only remove (at most) 1 occurrence of
        // `padStr`.
        numToRemove = _.min([numToRemove, 1]);
    }

    const numCharsToRemove = padStr.length * numToRemove!;

    const resultLines = _.map(lines, (curLine) => curLine.slice(numCharsToRemove));
    // Join the lines back together again.
    return resultLines.join("");
}


const blankLineRegex = /^\s*$/;


/**
 * Creates a new version of str without leading and trailing blank lines
 * @param str - The original string
 * @return A version of str without leading and trailing blank lines
 */
export function trimBlankLines(str: string): string
{
    const lines = splitIntoLines(str, true);

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

    // If lines have been removed from the end, we will have a new last line.
    // We need to make sure that new last line does not have an EOL.
    lines[lines.length - 1] = lines[lines.length - 1].replace(createEolRegex(), "");

    return lines.join("");
}


/**
 * Returns a string that is the same as `str`, but with blank lines removed.
 * @param str - The source string
 * @return A new string with blank lines removed
 */
export function removeBlankLines(str: string): string
{
    if (str.length === 0)
    {
        return "";
    }

    let lines = splitIntoLines(str, true);
    lines = _.filter(lines, (curLine) => !isBlank(curLine));

    // If all processed lines were blank, just return an empty string.
    if (lines.length === 0)
    {
        return "";
    }

    // If lines have been removed from the end, we will have a new last line.
    // We need to make sure that new last line does not have an EOL.
    lines[lines.length - 1] = lines[lines.length - 1].replace(createEolRegex(), "");

    return lines.join("");
}


/**
 * Determines whether `text` consists of nothing but whitespace.
 * @param text - The string to analyze
 * @return true if `text` is nothing but whitespace; false otherwise.
 */
export function isBlank(text: string): boolean
{
    return blankLineRegex.test(text);
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
 * Splits a string into its individual lines.
 * @param text - The text to be split into individual lines
 * @param retainLineEndings - Whether each line should include the original line endings
 * @return An array containing the individual lines from `text`.
 */
export function splitIntoLines(text: string, retainLineEndings = false): Array<string>
{
    if (text.length === 0)
    {
        return [];
    }

    const lines: Array<string> = [];
    const eolRegex = createEolRegex("g");
    let done = false;

    while (!done)
    {

        const startIndex = eolRegex.lastIndex;

        const match = eolRegex.exec(text);
        if (match)
        {

            let line: string = text.slice(startIndex, match.index);
            if (retainLineEndings)
            {
                line += match[0];
            }
            lines.push(line);

        }
        else
        {
            const line = text.slice(startIndex);
            lines.push(line);
            done = true;
        }
    }

    return lines;
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
    lines = _.map(lines, (curLine) =>
    {
        return _.trimEnd(curLine, "\r");
    });
    return lines;
}


export function padLeft(src: string, pad: string, desiredLength: number): string
{
    const numPadChars = desiredLength - src.length;
    if (numPadChars <= 0)
    {
        return src;
    }

    let fullPad = "";
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

    let fullPad = "";
    while (fullPad.length < numPadChars)
    {
        fullPad = fullPad + pad;
    }

    fullPad = fullPad.slice(0, numPadChars);
    return src + fullPad;
}


/**
 * Figures our what EOL string is being used in the specified string.
 * @param text - The string to analyze
 * @return A string representing the EOL characters being used in `text`.  If no
 * end-of-line is found, and empty string is returned.
 */
export function getEol(text: string): string
{
    const match = createEolRegex().exec(text);
    if (!match)
    {
        return "";
    }
    else
    {
        return match[0];
    }
}


/**
 * Concatenates an array of strings into a single string using the specified
 * separator.
 * @param strings - The strings to join
 * @param sep - The separator to insert between each array element
 * @return Description
 */
export function concatStrings(strings: Array<string>, sep: string = os.EOL): string
{
    return strings.join(sep);
}


/**
 * Repeats _str_ to build a new string containing `numChars` characters.
 * @param str - The string to repeat until the given length is achieved
 * @param numChars - The desired length of the returned string.
 * @return A new string containing _str_ repeated until the specified length is
 * achieved.
 */
export function repeat(str: string, numChars: number): string
{
    const repeatCount = Math.ceil(numChars / str.length);
    const tooLong = _.repeat(str, repeatCount);
    const res = tooLong.substr(0, numChars);
    return res;
}
