import chalk = require("chalk");


/**
 * Highlights substrings within the specified string.
 * @param str - The string in which matches will be highlighted
 * @param regex - A regex defining the substring(s) to be highlighted.  This
 * regex should have the "g" (global) flag set to highlight multiple occurrences
 * within _str_.
 * @param highlightStyle - The coloring to use for the highlight
 * @returns A tuple containing the number of highlights applied and the
 * resulting highlighted copy of _str_.
 */
export function highlightMatches(
    str: string,
    regex: RegExp,
    highlightStyle: chalk.Chalk
): [numHighlights: number, highlightedStr: string] {
    let numReplacements = 0;
    const highlightedStr = str.replace(regex, (matchedText) => {
        numReplacements += 1;
        return highlightStyle(matchedText);
    });

    return [numReplacements, highlightedStr];
}
