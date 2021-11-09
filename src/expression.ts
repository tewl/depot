import * as _ from "lodash";
import { Fraction } from "./fraction";
import { Result, failedResult, succeededResult, failed } from "./result";
import {find} from "./collection";
import { assertNever } from "./never";
import { IDuMember } from "./discriminatedUnion";


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
export interface IExpressionTokenNumber extends IDuMember, IExpressionToken
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
    numArguments?: number;
    evaluate?(args: Array<Fraction>): Fraction;
}


export interface IExpressionTokenOperator extends IDuMember, IExpressionToken
{
    type: "IExpressionTokenOperator";
    symbol: OperatorSymbol;
    precedence: number;
    associativity: OperatorAssociativity;
}


export function symbolToTraits(symbol: OperatorSymbol): IOperatorTraits
{
    switch (symbol)
    {
        case "(":
            return {
                symbol:        "(",
                precedence:    21,
                associativity: "n/a"
            };

        case ")":
            return {
                symbol:        ")",
                precedence:    21,
                associativity: "n/a"
            };

        case "*":
            return {
                symbol:        "*",
                precedence:    15,
                associativity: "left-to-right",
                numArguments:  2,
                evaluate(args: Array<Fraction>): Fraction
                {
                    const first = args.pop()!;
                    const second = args.pop()!;
                    return second.multiply(first);
                }
            };

        case "/":
            return {
                symbol:        "/",
                precedence:    15,
                associativity: "left-to-right",
                numArguments:  2,
                evaluate(args: Array<Fraction>): Fraction
                {
                    const first = args.pop()!;
                    const second = args.pop()!;
                    return second.divide(first);
                }
            };

        case "+":
            return {
                symbol:        "+",
                precedence:    14,
                associativity: "left-to-right",
                numArguments:  2,
                evaluate(args: Array<Fraction>): Fraction
                {
                    const first = args.pop()!;
                    const second = args.pop()!;
                    return second.add(first);
                }
            };

        case "-":
            return {
                symbol:        "-",
                precedence:    14,
                associativity: "left-to-right",
                numArguments:  2,
                evaluate(args: Array<Fraction>): Fraction
                {
                    const first = args.pop()!;
                    const second = args.pop()!;
                    return second.subtract(first);
                }
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
    tokenCreatorFn(
        match: RegExpExecArray,
        fullExpression: string,
        startIndex: number,
        endIndex: number): ExpressionToken;
}


function getTokenizers(): Array<ITokenizer>
{
    return [

        // Number tokenizer
        {
            matcherFn: (remainingText: string) =>
            {
                //
                // TODO: Replace the following regular expressions with those in fraction.ts
                //
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
                    value:              Fraction.from(match[0]).value!,
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
                const regexPlus = /^(?<leadingws>\s*)(?<operator>[()*/+-])(?<trailingws>\s*)/;
                return regexPlus.exec(remainingText);
            },
            tokenCreatorFn: (match: RegExpExecArray, fullExpression: string, startIndex: number, endIndex: number) =>
            {
                const traits = symbolToTraits(match.groups!.operator as OperatorSymbol);
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

    while (remainingExpression.length > 0)
    {

        // eslint-disable-next-line @typescript-eslint/no-loop-func
        const foundTokenizer = find(tokenizers, (curTokenizer) => curTokenizer.matcherFn(remainingExpression));
        if (foundTokenizer)
        {
            const matchedText = foundTokenizer.predicateReturn[0];
            const matchedLength = matchedText.length;
            const endIndex = foundTokenizer.predicateReturn.index + matchedLength;

            const token = foundTokenizer.item.tokenCreatorFn(
                foundTokenizer.predicateReturn,
                originalExpression,
                remainingExpressionStartIndex,
                remainingExpressionStartIndex + matchedLength
            );
            tokens.push(token);

            remainingExpression = remainingExpression.slice(endIndex);
            remainingExpressionStartIndex = token.endIndex;
        }
        else
        {
            return failedResult(`Failed to parse expression at index ${remainingExpressionStartIndex} of "${originalExpression}".`);
        }
    }


    return succeededResult(tokens);
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
            if (_.isEmpty(operatorStack))
            {
                return failedResult(`Operator stack exhaused while finding "(".  Mismatched parenthesis.`);
            }
            let firstInOperatorStack = _.last(operatorStack)!;
            while (firstInOperatorStack.symbol !== "(")
            {
                output.push(operatorStack.pop()!);      // Move the operator from the top of the operator stack to the output queue.

                if (_.isEmpty(operatorStack))
                {
                    return failedResult(`Operator stack exhaused while finding "(".  Mismatched parenthesis.`);
                }
                firstInOperatorStack = _.last(operatorStack)!;
            }

            const topOperator = operatorStack.pop();
            if (topOperator === undefined || topOperator.symbol !== "(")
            {
                return failedResult(`Operator stack invalid after finding "(".`);
            }
            // We intentionally do nothing with the popped "(".  Discard it.
        }
        else if (curToken.type === "IExpressionTokenOperator")
        {
            let firstInOperatorStack = _.last(operatorStack);
            while (firstInOperatorStack !== undefined &&                     // While there is an operator on the operator stack AND
                firstInOperatorStack.symbol !== "(" &&                       // it is not a left parenthesis AND
                (firstInOperatorStack.precedence > curToken.precedence ||    // (it has greater precedence than the current token OR
                                                                             //  the same precedence AND the current token is left-associative)
                    (firstInOperatorStack.precedence === curToken.precedence && curToken.associativity === "left-to-right"))
            )
            {
                output.push(operatorStack.pop()!);
                firstInOperatorStack = _.last(operatorStack);
            }
            operatorStack.push(curToken);
        }
    }

    // Move the remaining operators to the output queue.
    while (!_.isEmpty(operatorStack))
    {
        const curOperator = operatorStack.pop()!;
        if (curOperator.symbol === "(")
        {
            return failedResult(`"(" found while emptying operator stack.  Mismatched parenthesis.`);
        }
        output.push(curOperator);
    }

    return succeededResult(output);
}


export function evaluate(input: string): Result<Fraction, string>
{
    const tokenizeResult = tokenize(input);
    if (failed(tokenizeResult))
    {
        return tokenizeResult;
    }

    const postfixResult = toPostfix(tokenizeResult.value);
    if (failed(postfixResult))
    {
        return postfixResult;
    }

    const stack: Array<Fraction> = [];
    for (const curToken of postfixResult.value)
    {
        if (curToken.type === "IExpressionTokenNumber")
        {
            stack.push(curToken.value);
        }
        else if (curToken.type === "IExpressionTokenOperator")
        {
            const traits = symbolToTraits(curToken.symbol);

            // The stack should have enough values on it to provide a value for
            // each operator argument.
            if (stack.length < traits.numArguments!)
            {
                return failedResult(`Not enough arguments for operator ${curToken.symbol} at index ${curToken.startIndex}.`);
            }

            const resultVal = traits.evaluate!(stack);
            stack.push(resultVal);
        }
        else
        {
            assertNever(curToken);
        }
    }

    // The stack should contain only 1 value.
    const stackLength = stack.length;
    if (stackLength === 1)
    {
        return succeededResult(stack[0]);
    }
    else if (stackLength < 1)
    {
        return failedResult(`No expression.`);
    }
    else
    {
        return failedResult(`Expression finished evaluating with items still on the stack.`);
    }
}
