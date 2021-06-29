import _ = require("lodash");
import { Fraction } from "./fraction";
import { Result, failedResult, succeededResult } from "./result";

export interface IDuType
{
    type: string;
}


const regexWhole = /^(?<leadingws>\s*)(?<whole>\d+)(?<trailingws>\s*)/;
const regexFrac = /^(?<leadingws>\s*)(?<num>\d+)\/(?<den>\d+)(?<trailingws>\s*)/;
const regexWholeAndFrac = /^(?<leadingws>\s*)(?<whole>\d+)(?<reqws>\s+)(?<num>\d+)\/(?<den>\d+)(?<trailingws>\s*)/;


export interface IExpressionToken
{
    originalExpression: string;
    startIndex: number;
    endIndex: number;
    text: string;
}


export interface IExpressionTokenNumber extends IDuType, IExpressionToken
{
    type: "IExpressionTokenNumber";
    value: Fraction;
}


export interface IExpressionTokenOperator extends IDuType
{
    type: "IExpressionTokenOperatorPlus";
    precedence: number;
}


export interface IExpressionTokenLeftBracket extends IDuType
{
    type: "IExpressionTokenLeftBracket";
}


export interface IExpressionTokenRightBracket extends IDuType
{
    type: "IExpressionTokenRightBracket";
}


export type ExpressionToken =
    IExpressionTokenNumber |
    IExpressionTokenOperator |
    IExpressionTokenLeftBracket |
    IExpressionTokenRightBracket;


export function parse(input: string): Result<Array<ExpressionToken>, string>
{
    const originalExpression = input;
    let remainingExpression = input;
    let remainingExpressionStartIndex = 0;

    const tokens: Array<ExpressionToken> = [];

    while (remainingExpression.length > 0) {
        const numberMatch =
            regexWholeAndFrac.exec(remainingExpression) ||
            regexFrac.exec(remainingExpression) ||
            regexWhole.exec(remainingExpression);
        if (numberMatch) {
            const matched = numberMatch[0];
            const matchedLength = matched.length;
            const endIndex = numberMatch.index + matchedLength;

            if (_.last(tokens)?.type === "IExpressionTokenNumber") {
                return failedResult(`Illegal consecutive number token "${matched}" at index ${remainingExpressionStartIndex}.`);
            }

            const token = {
                type: "IExpressionTokenNumber" as const,
                value: Fraction.from(matched),
                originalExpression: originalExpression,
                startIndex: remainingExpressionStartIndex,
                endIndex: remainingExpressionStartIndex + matchedLength,
                text: matched
            };
            tokens.push(token);
            remainingExpression = remainingExpression.slice(endIndex);
            remainingExpressionStartIndex = token.endIndex;
        }
        else {
            return failedResult(`Failed to parse expression at index ${remainingExpressionStartIndex} of ${originalExpression}.`);
        }
    }


    return succeededResult(tokens);
}
