import * as _ from "lodash";
import { Fraction } from "./fraction";
import { Result, failedResult, succeededResult } from "./result";
import {find} from "./collection";
import { assertNever } from "./never";
import { cond } from "lodash";


export interface IDuType
{
    type: string;
}


////////////////////////////////////////////////////////////////////////////////
// IExpressionToken
////////////////////////////////////////////////////////////////////////////////
export interface IExpressionToken
{
    /// The full original expression
    originalExpression: string;
    /// Starting character index in originalExpression
    startIndex: number;
    /// 1 *past* the last character
    endIndex: number;
    /// The text comprising the token
    text: string;
}


////////////////////////////////////////////////////////////////////////////////
// IExpressionTokenNumber
////////////////////////////////////////////////////////////////////////////////
export interface IExpressionTokenNumber extends IDuType, IExpressionToken
{
    type: "IExpressionTokenNumber";
    value: Fraction;
}


////////////////////////////////////////////////////////////////////////////////
// IExpressionTokenOperator
////////////////////////////////////////////////////////////////////////////////

type OperatorAssociativity = "n/a" | "left-to-right" | "right-to-left";


type OperatorSymbol = "(" | ")" | "*" | "/" | "+" | "-";


interface IOperatorTraits
{
    symbol: OperatorSymbol;
    precedence: number;
    associativity: OperatorAssociativity;

}


export interface IExpressionTokenOperator extends IOperatorTraits, IDuType, IExpressionToken
{
    type: "IExpressionTokenOperator";
}


export function getOperatorTraits(symbol: OperatorSymbol): IOperatorTraits
{
    switch (symbol) {
        case "(":
            return {
                symbol: "(",
                precedence: 21,
                associativity: "n/a"
            };

        case ")":
            return {
                symbol: ")",
                precedence: 21,
                associativity: "n/a"
            };

        case "*":
            return {
                symbol: "*",
                precedence: 15,
                associativity: "left-to-right"
            };

        case "/":
            return {
                symbol: "/",
                precedence: 15,
                associativity: "left-to-right"
            };

        case "+":
            return {
                symbol: "+",
                precedence: 14,
                associativity: "left-to-right"
            };

        case "-":
            return {
                symbol: "-",
                precedence: 14,
                associativity: "left-to-right"
            };

        default:
            assertNever(symbol);
    }
}

////////////////////////////////////////////////////////////////////////////////
// ExpressionToken
////////////////////////////////////////////////////////////////////////////////
export type ExpressionToken =
    IExpressionTokenNumber |
    IExpressionTokenOperator;


////////////////////////////////////////////////////////////////////////////////


interface ITokenizer
{
    matcherFn(remainingText: string): RegExpExecArray | null;
    tokenCreatorFn(match: RegExpExecArray, fullExpression: string, startIndex: number, endIndex: number): ExpressionToken;
}


function getTokenizers(): Array<ITokenizer>
{
    return [

        // Number tokenizer
        {
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
                return {
                    type:               "IExpressionTokenNumber" as const,
                    value:              Fraction.from(match[0]),
                    originalExpression: fullExpression,
                    startIndex:         startIndex,
                    endIndex:           endIndex,
                    text:               match[0]
                };
            }
        },

        // Operator tokenizer
        {
            matcherFn: (remainingText: string) =>
            {
                const regexPlus = /^(?<leadingws>\s*)(?<operator>[()*/+\-])(?<trailingws>\s*)/;
                return regexPlus.exec(remainingText);
            },
            tokenCreatorFn: (match: RegExpExecArray, fullExpression: string, startIndex: number, endIndex: number) =>
            {
                const traits = getOperatorTraits(match.groups!.operator as OperatorSymbol);
                return {
                    type:               "IExpressionTokenOperator" as const,
                    symbol:             traits.symbol,
                    associativity:      traits.associativity,
                    precedence:         traits.precedence,
                    originalExpression: fullExpression,
                    startIndex:         startIndex,
                    endIndex:           endIndex,
                    text:               match[0]
                };
            }
        }
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


function assert(condition: any, failureErrorMsg: string): void
{
    if (!condition) {
        throw new Error(failureErrorMsg);
    }
}


/**
 * Converts a sequence of infix tokens to the postfix version using the
 * Shunting-yard algorithm.
 * @param infixTokens - The infix tokens
 * @return When successful, an array of the token reordered into postfix
 * notation.  If unbalanced parenthesis are found, a failure with a descriptive
 * message is returned.
 */
export function toPostfix(
    infixTokens: Array<ExpressionToken>
): Result<Array<ExpressionToken>, string>
{
    // See https://en.wikipedia.org/wiki/Shunting-yard_algorithm.
    const input: Array<ExpressionToken> = infixTokens.slice();
    input.reverse();

    const output: Array<ExpressionToken> = [];
    const operatorStack: Array<IExpressionTokenOperator> = [];

    try {
        while (!_.isEmpty(input))
        {
            const curToken = input.pop()!;

            if (curToken.type === "IExpressionTokenNumber")
            {
                output.push(curToken);
            }
            else if (curToken.type === "IExpressionTokenOperator" && curToken.symbol === "(")
            {
                operatorStack.push(curToken);
            }
            else if (curToken.type === "IExpressionTokenOperator" && curToken.symbol === ")")
            {
                assert(!_.isEmpty(operatorStack), `Operator stack exhaused while finding "(".  Mismatched parenthesis.`);
                let opStackTop = _.last(operatorStack)!;
                while (opStackTop.symbol !== "(")
                {

                    output.push(operatorStack.pop()!);      // Move the operator from the top of the operator stack to the output queue.

                    assert(!_.isEmpty(operatorStack), `Operator stack exhaused while finding "(".  Mismatched parenthesis.`);
                    opStackTop = _.last(operatorStack)!;
                }

                const topOperator = operatorStack.pop();
                assert(topOperator !== undefined && topOperator.symbol === "(", "");
                // We intentionally do nothing with the popped "(".  Discard it.
            }
            else if (curToken.type === "IExpressionTokenOperator")
            {
                let opStackTop = _.last(operatorStack);
                while (opStackTop !== undefined &&                     // While there is an operator on the operator stack AND
                    opStackTop.symbol !== "(" &&                       // it is not a left parenthesis AND
                    (opStackTop.precedence > curToken.precedence ||    // (it has greater precedence than the current token OR
                                                                       //  the same precedence AND the current token is left-associative)
                        (opStackTop.precedence === curToken.precedence && curToken.associativity === "left-to-right"))
                )
                {
                    output.push(operatorStack.pop()!);
                    opStackTop = _.last(operatorStack);
                }
                operatorStack.push(curToken);
            }
        }

        // Move the remaining operators to the output queue.
        while (!_.isEmpty(operatorStack))
        {
            const curOperator = operatorStack.pop()!;
            assert(curOperator.symbol !== "(", `"(" found while emptying operator stack.  Mismatched parenthesis.`);
            output.push(curOperator);
        }

        return succeededResult(output);
    } catch (error) {
        return failedResult(error.message);
    }
}


export function evaluate(input: string): Result<Fraction, string> {
    return failedResult("foo");
}
