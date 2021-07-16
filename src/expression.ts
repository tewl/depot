import * as _ from "lodash";
import { Fraction } from "./fraction";
import { Result, failedResult, succeededResult } from "./result";
import {find} from "./collection";


export interface IDuType
{
    type: string;
}


export interface IExpressionToken
{
    originalExpression: string;     // The full original expression
    startIndex: number;             // Starting character index in originalExpression
    endIndex: number;               // 1 *past* the last character
    text: string;                   // The text comprising the token
}


export interface IExpressionTokenNumber extends IDuType, IExpressionToken
{
    type: "IExpressionTokenNumber";
    value: Fraction;
}

type ExpressionOperator = "+" | "-" | "*" | "/";
export interface IExpressionTokenOperator extends IDuType, IExpressionToken
{
    type: "IExpressionTokenOperator";
    operator: "+" | "-" | "*" | "/";
    precedence: number;
}


export interface IExpressionTokenLeftParenthesis extends IDuType, IExpressionToken
{
    type: "IExpressionTokenLeftParenthesis";
}


export interface IExpressionTokenRightParenthesis extends IDuType, IExpressionToken
{
    type: "IExpressionTokenRightParenthesis";
}


export type ExpressionToken =
    IExpressionTokenNumber |
    IExpressionTokenOperator |
    IExpressionTokenLeftParenthesis |
    IExpressionTokenRightParenthesis;


type MatcherFn = (remainingText: string) => RegExpExecArray | null;
type TokenCreatorFn = (match: RegExpExecArray, fullExpression: string, startIndex: number, endIndex: number) => ExpressionToken;
interface ITokenizer
{
    matcherFn: MatcherFn;
    tokenCreatorFn: TokenCreatorFn;
}


function getOperatorPrecedenceTable(): Map<ExpressionOperator, number>
{
    const operatorPrecedenceTable = new Map<ExpressionOperator, number>();
    operatorPrecedenceTable.set("*", 15);
    operatorPrecedenceTable.set("/", 15);
    operatorPrecedenceTable.set("+", 14);
    operatorPrecedenceTable.set("-", 14);

    return operatorPrecedenceTable;
}
const operatorPrecedenceTable = getOperatorPrecedenceTable();


function getTokenizers(): Array<ITokenizer>
{
    const numberTokenizer = {
        matcherFn: (remainingText: string) =>
        {
            const regexWhole = /^(?<leadingws>\s*)(?<whole>\d+)(?<trailingws>\s*)/;
            const regexFrac = /^(?<leadingws>\s*)(?<num>\d+)\/(?<den>\d+)(?<trailingws>\s*)/;
            const regexWholeAndFrac = /^(?<leadingws>\s*)(?<whole>\d+)(?<reqws>\s+)(?<num>\d+)\/(?<den>\d+)(?<trailingws>\s*)/;
            return regexWholeAndFrac.exec(remainingText) ||
                regexFrac.exec(remainingText) ||
                regexWhole.exec(remainingText);
        },
        tokenCreatorFn: (match: RegExpExecArray, fullExpression: string, startIndex: number, endIndex: number) =>
        {
            const token: IExpressionTokenNumber = {
                type: "IExpressionTokenNumber" as const,
                value: Fraction.from(match[0]),
                originalExpression: fullExpression,
                startIndex: startIndex,
                endIndex: endIndex,
                text: match[0]
            };
            return token;
        }
    };

    const operatorTokenizer = {
        matcherFn: (remainingText: string) =>
        {
            const regexPlus = /^(?<leadingws>\s*)(?<operator>[+\-*/])(?<trailingws>\s*)/;
            return regexPlus.exec(remainingText);
        },
        tokenCreatorFn: (match: RegExpExecArray, fullExpression: string, startIndex: number, endIndex: number) =>
        {
            const operator = match.groups!.operator as ExpressionOperator;
            const precedence = operatorPrecedenceTable.get(operator)!;

            const token: IExpressionTokenOperator = {
                type: "IExpressionTokenOperator" as const,
                operator: operator,
                precedence: precedence,
                originalExpression: fullExpression,
                startIndex: startIndex,
                endIndex: endIndex,
                text: match[0]
            };
            return token;
        }
    };

    const leftParenthesisTokenizer = {
        matcherFn: (remainingText: string) =>
        {
            const regex = /^(?<leadingws>\s*)(?<leftParen>\()(?<trailingws>\s*)/;
            return regex.exec(remainingText);
        },
        tokenCreatorFn: (match: RegExpExecArray, fullExpression: string, startIndex: number, endIndex: number) =>
        {
            const token: IExpressionTokenLeftParenthesis = {
                type: "IExpressionTokenLeftParenthesis" as const,
                originalExpression: fullExpression,
                startIndex: startIndex,
                endIndex: endIndex,
                text: match[0]
            };
            return token;
        }
    };

    const rightParenthesisTokenizer = {
        matcherFn: (remainingText: string) =>
        {
            const regex = /^(?<leadingws>\s*)(?<rightParen>\))(?<trailingws>\s*)/;
            return regex.exec(remainingText);
        },
        tokenCreatorFn: (match: RegExpExecArray, fullExpression: string, startIndex: number, endIndex: number) =>
        {
            const token: IExpressionTokenRightParenthesis = {
                type: "IExpressionTokenRightParenthesis" as const,
                originalExpression: fullExpression,
                startIndex: startIndex,
                endIndex: endIndex,
                text: match[0]
            };
            return token;
        }
    };

    return [
        numberTokenizer,
        operatorTokenizer,
        leftParenthesisTokenizer,
        rightParenthesisTokenizer
    ];
}

const tokenizers = getTokenizers();

export function tokenize(input: string): Result<Array<ExpressionToken>, string>
{
    const originalExpression = input;
    let remainingExpression = input;
    let remainingExpressionStartIndex = 0;

    const tokens: Array<ExpressionToken> = [];

    while (remainingExpression.length > 0) {

        const foundTokenizer = find(tokenizers, (curTokenizer) => curTokenizer.matcherFn(remainingExpression));
        if (foundTokenizer) {
            const matchedText = foundTokenizer.predicateReturn[0];
            const matchedLength = matchedText.length;
            const endIndex = foundTokenizer.predicateReturn.index + matchedLength;

            const token = foundTokenizer.item.tokenCreatorFn(
                foundTokenizer.predicateReturn,
                originalExpression,
                remainingExpressionStartIndex,
                remainingExpressionStartIndex + matchedLength);
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
