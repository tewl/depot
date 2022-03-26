import chalk = require("chalk");


export function highlightMatches(
    str: string,
    regex: RegExp,
    highlightStyle: chalk.Chalk
): [numHighlights: number, highlightedStr: string]
{
    const flagsWithGlobal = regex.flags.replace("g", "") + "g";
    const globalRegex = new RegExp(regex, flagsWithGlobal);
    let numReplacements = 0;
    const highlightedStr = str.replace(globalRegex, (matchedText) =>
    {
        numReplacements += 1;
        return highlightStyle(matchedText);
    });

    return [numReplacements, highlightedStr];
}
