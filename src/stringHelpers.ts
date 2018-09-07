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
