import * as _ from "lodash";


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
): string {
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

export function outdent(str: string, padStr: string = " "): string
{
    const lines = str.split("\n");
    const initOccurrences = _.map(lines, (curLine) => numInitial(curLine, padStr));
    const numToRemove = _.min(initOccurrences);
    const numCharsToRemove = padStr.length * numToRemove!;

    const resultLines = _.map(lines, (curLine) => curLine.slice(numCharsToRemove));
    return resultLines.join("\n");
}


export function trimBlankLines(str: string): string
{
    const BLANK_LINE_REGEX = /^\s*$/;
    const lines = str.split("\n");

    while ((lines.length > 0) &&
          BLANK_LINE_REGEX.test(lines[0]))
    {
        lines.shift();
    }

    while ((lines.length > 0) &&
          BLANK_LINE_REGEX.test(_.last(lines)!))
    {
        lines.pop();
    }

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
