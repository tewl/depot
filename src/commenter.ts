import * as _ from "lodash";
import {removeBlankLines, splitIntoLines, numInitial, isBlank, getEol} from "./stringHelpers";


function getCommentToken(): string
{
    return "//";
}


/**
 * Transform `linesToComment` into lines that are properly commented out.
 * @param linesToComment - The source to be commented
 * @param precedingLine - The line preceding the source to be commented.  Used
 *     to infer preceding comment indentation.
 * @return A new string representing the commented version of the source
 */
export function comment(
    linesToComment: string,
    precedingLine?: string
): string
{
    if (linesToComment.length === 0) {
        return "";
    }

    const sourceLines = splitIntoLines(linesToComment, true);
    const nonEmptyLines = splitIntoLines(removeBlankLines(linesToComment), true);
    if (nonEmptyLines.length === 0) {
        return "";
    }

    const indentChar = nonEmptyLines[0][0];
    const numIndentChars = _.chain(nonEmptyLines)
    .map((curLine) => numInitial(curLine, indentChar))
    .min()
    .value();

    const indentStr = _.repeat(indentChar, numIndentChars);

    const result: string = _.chain(sourceLines)
    .map((curLine) => {
        // The original text that will follow the comment token.
        // If the current line is a blank one, it may be zero-length, so we will
        // use the whole line in order to get the EOL.  If it is not blank, it
        // will be everything following the common indent.
        const blank = isBlank(curLine);
        const sourceText = blank ? getEol(curLine) :
                                   curLine.slice(indentStr.length);

        // The whitespace that will follow the comment token.
        const postCommentSpace = blank ? "" : " ";

        return `${indentStr}${getCommentToken()}${postCommentSpace}${sourceText}`;
    })
    .join("")
    .value();

    return result;

}
