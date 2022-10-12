import * as os from "os";
import * as crypto from "crypto";
import * as _ from "lodash";
import {createEolRegex} from "./regexpHelpers";
import { FailedResult, Result, SucceededResult } from "./result";


/**
 * Counts the number of times _padStr_ occurs at the beginning of str.
 * @param str - The string to inspect
 * @param padStr - The substring to count occurrences of
 * @return The number of times _padStr_ occurs at the beginning of _str_
 */
export function numInitial(str: string, padStr: string): number {
    if (padStr === "") {
        return 0;
    }

    let curStr = str;
    let numOccurrences = 0;

    while (_.startsWith(curStr, padStr)) {
        ++numOccurrences;
        curStr = curStr.slice(padStr.length);
    }

    return numOccurrences;
}


/**
 * Creates a string where each line of _src_ is indented.
 * @param src - The string to be indented
 * @param numSpacesOrPad - The number of spaces to indent each line
 * @param skipFirstLine - If truthy, the first line will not be indented
 * @return A new string where each line is indented
 */
export function indent(
    src: string,
    numSpacesOrPad: number | string,
    skipFirstLine = false
): string {
    if (numSpacesOrPad === 0) {
        return src;
    }
    else {
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
export function outdent(str: string, padStr = " ", greedy = true): string {
    const lines = splitIntoLines(str, true);
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
    return resultLines.join("");
}


const blankLineRegex = /^\s*$/;


/**
 * Creates a new version of str without leading and trailing blank lines
 * @param str - The original string
 * @return A version of str without leading and trailing blank lines
 */
export function trimBlankLines(str: string): string {
    const lines = splitIntoLines(str, true);

    while ((lines.length > 0) &&
          blankLineRegex.test(lines[0])) {
        lines.shift();
    }

    while ((lines.length > 0) &&
          blankLineRegex.test(_.last(lines)!)) {
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
export function removeBlankLines(str: string): string {
    if (str.length === 0) {
        return "";
    }

    let lines = splitIntoLines(str, true);
    lines = _.filter(lines, (curLine) => !isBlank(curLine));

    // If all processed lines were blank, just return an empty string.
    if (lines.length === 0) {
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
export function isBlank(text: string): boolean {
    return blankLineRegex.test(text);
}


/**
 * Determines whether the specified value is a string containing one or more
 * non-whitespace characters.  Suitable for dto or input validation.
 *
 * @param val - The value to test
 * @param errMsg - The error message that will be returned if _val_ is not a
 * string or is blank.
 * @return Whether the value is a string containing one or more non-whitespace
 * characters.
 */
export function isNonBlankString(val: unknown, errMsg: string): Result<string, string> {
    return typeof val === "string" && !isBlank(val) ?
        new SucceededResult(val) :
        new FailedResult(errMsg);
}


const whitespaceRegex = /\s+/g;


/**
 * Creates a new string in which all whitespace has been removed from str.
 * @param str - The original string to remove whitespace from
 * @return A new string in which all whitespace has been removed.
 */
export function removeWhitespace(str: string): string {
    return str.replace(whitespaceRegex, "");
}


/**
 * Splits a string into its individual lines.
 * @param text - The text to be split into individual lines
 * @param retainLineEndings - Whether each line should include the original line endings
 * @return An array containing the individual lines from `text`.
 */
export function splitIntoLines(text: string, retainLineEndings = false): Array<string> {
    if (text.length === 0) {
        return [];
    }

    const lines: Array<string> = [];
    const eolRegex = createEolRegex("g");
    let done = false;

    while (!done) {

        const startIndex = eolRegex.lastIndex;

        const match = eolRegex.exec(text);
        if (match) {

            let line: string = text.slice(startIndex, match.index);
            if (retainLineEndings) {
                line += match[0];
            }
            lines.push(line);

        }
        else {
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
export function splitLinesOsIndependent(src: string): Array<string> {
    let lines = _.split(src, "\n");
    lines = _.map(lines, (curLine) => {
        return _.trimEnd(curLine, "\r");
    });
    return lines;
}


export function padLeft(src: string, pad: string, desiredLength: number): string {
    const numPadChars = desiredLength - src.length;
    if (numPadChars <= 0) {
        return src;
    }

    let fullPad = "";
    while (fullPad.length < numPadChars) {
        fullPad = fullPad + pad;
    }

    fullPad = fullPad.slice(0, numPadChars);
    return fullPad + src;
}


export function padRight(src: string, pad: string, desiredLength: number): string {
    const numPadChars = desiredLength - src.length;
    if (numPadChars <= 0) {
        return src;
    }

    let fullPad = "";
    while (fullPad.length < numPadChars) {
        fullPad = fullPad + pad;
    }

    fullPad = fullPad.slice(0, numPadChars);
    return src + fullPad;
}


/**
 * Figures our what EOL string is being used in the specified string.
 * @param text - The string to analyze
 * @return A string representing the EOL characters being used in `text`.  If no
 * end-of-line is found, undefined is returned.
 */
export function getEol(text: string): string | undefined {
    const match = createEolRegex().exec(text);
    if (!match) {
        return undefined;
    }
    else {
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
export function concatStrings(strings: Array<string>, sep: string = os.EOL): string {
    return strings.join(sep);
}


/**
 * Repeats _str_ to build a new string containing `numChars` characters.
 * @param str - The string to repeat until the given length is achieved
 * @param numChars - The desired length of the returned string.
 * @return A new string containing _str_ repeated until the specified length is
 * achieved.
 */
export function repeat(str: string, numChars: number): string {
    const repeatCount = Math.ceil(numChars / str.length);
    const tooLong = _.repeat(str, repeatCount);
    const res = tooLong.slice(0, numChars);
    return res;
}


/**
 * Removes and inserts characters at a specified index.
 * @param str - The string to operate on
 * @param index - The index where to delete and insert characters
 * @param numCharsToDelete - The number of chars to delete
 * @param insert - The string to be inserted
 * @returns The resulting string
 */
export function splice(str: string, index: number, numCharsToDelete: number, insert: string): string {
    // We cannot pass negative indexes directly to the 2nd slicing operation.
    if (index < 0) {
        index = str.length + index;
        if (index < 0) {
            index = 0;
        }
    }

    return str.slice(0, index) + (insert || "") + str.slice(index + numCharsToDelete);
}


/**
 * Hashes the specified string
 * @param str - The string to be hashed
 * @param algorithm - The hashing algorithm to use (e.g. "md5", "sha1", "sha256", "sha512")
 * @param encoding - The encoding used in the returned string ("base64" or "hex")
 * @returns The hashed value of the string
 */
export function hash(str: string, algorithm: string = "sha256", encoding: crypto.BinaryToTextEncoding = "hex"): string {
    const hash = crypto.createHash(algorithm).update(str).digest(encoding);
    return hash;
}


/**
 * Attempts to parse a decimal string as an integer. This can be useful when the
 * input may be the string representation of a 64-bit integer, which cannot be
 * represented by JavaScript's number type (which only uses 53 bits for the
 * integer portion of the number).  If this function returns an error Result,
 * the client may want to fall back and use _BigInt_ or a library such as "long"
 * to handle the value.
 * @param intStr - The string to be parsed.
 * @returns
 */
export function parseDecInt(intStr: string): Result<number, string> {
    const num = parseInt(intStr, 10);
    const backToStr = num.toString();
    return backToStr === intStr ?
        new SucceededResult(num) :
        new FailedResult(`The string '${intStr}' has a lossy parsing of '${backToStr}'.`);

}
