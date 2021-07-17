import {evaluate, symbolToTraits, IExpressionTokenNumber, IExpressionTokenOperator, tokenize, toPostfix} from "./expression";
import {Fraction} from "./fraction";
import {succeeded, failed} from "./result";


describe("symbolToTraits", () => {


    it("left parenthesis", () => {
        const traits = symbolToTraits("(");
        expect(traits.symbol).toEqual("(");
        expect(traits.precedence).toEqual(21);
        expect(traits.associativity).toEqual("n/a");
        expect(traits.numArguments).toBeUndefined();
    });


    it("right parenthesis", () => {
        const traits = symbolToTraits(")");
        expect(traits.symbol).toEqual(")");
        expect(traits.precedence).toEqual(21);
        expect(traits.associativity).toEqual("n/a");
        expect(traits.numArguments).toBeUndefined();
    });


    it("multiply", () => {
        const traits = symbolToTraits("*");
        expect(traits.symbol).toEqual("*");
        expect(traits.precedence).toEqual(15);
        expect(traits.associativity).toEqual("left-to-right");
        expect(traits.numArguments).toEqual(2);
    });


    it("divide", () => {
        const traits = symbolToTraits("/");
        expect(traits.symbol).toEqual("/");
        expect(traits.precedence).toEqual(15);
        expect(traits.associativity).toEqual("left-to-right");
        expect(traits.numArguments).toEqual(2);
    });


    it("add", () => {
        const traits = symbolToTraits("+");
        expect(traits.symbol).toEqual("+");
        expect(traits.precedence).toEqual(14);
        expect(traits.associativity).toEqual("left-to-right");
        expect(traits.numArguments).toEqual(2);
    });


    it("subtract", () => {
        const traits = symbolToTraits("-");
        expect(traits.symbol).toEqual("-");
        expect(traits.precedence).toEqual(14);
        expect(traits.associativity).toEqual("left-to-right");
        expect(traits.numArguments).toEqual(2);
    });

});


describe("tokenize()", () => {


    it("fails to tokenize a string that makes no sense", () => {
        const tokenizeResult = tokenize("&");
        expect(failed(tokenizeResult)).toBeTruthy();
        expect(tokenizeResult.error).toEqual("Failed to parse expression at index 0 of &.");
    });


    it("successfully tokenizes a whole number", () => {
        const tokenizeResult = tokenize("3");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully tokenizes an expression with leading whitespace", () => {
        const tokenizeResult = tokenize("   \t  3");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(1);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully tokenizes an expression with trailing whitespace", () => {
        const tokenizeResult = tokenize("3  \t   ");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(1);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully tokenizes a fraction", () => {
        const tokenizeResult = tokenize("1/4");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value.equals(Fraction.from(0.25))).toEqual(true);
    });


    it("successfully tokenizes a fraction that contains a whole number and a fractional part", () => {
        const tokenizeResult = tokenize("2 1/4");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(1);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value.equals(Fraction.from(2.25))).toEqual(true);
    });


    it("successfully tokenizes an expression that contains a plus operator", () => {
        const tokenizeResult = tokenize("2 + 3");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(3);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");

        expect(tokens[1].type).toEqual("IExpressionTokenOperator");
        expect((tokens[1] as IExpressionTokenOperator).symbol).toEqual("+");

        expect(tokens[2].type).toEqual("IExpressionTokenNumber");
    });


    it("successfully tokenizes an expression that contains fractions and a plus operator", () => {
        const tokenizeResult = tokenize("2 3/8 + 2 5/8");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(3);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect(tokens[0].originalExpression).toEqual("2 3/8 + 2 5/8");
        expect(tokens[0].startIndex).toEqual(0);
        expect(tokens[0].endIndex).toEqual(6);
        expect(tokens[0].text).toEqual("2 3/8 ");

        expect(tokens[1].type).toEqual("IExpressionTokenOperator");
        expect((tokens[1] as IExpressionTokenOperator).symbol).toEqual("+");
        expect(tokens[1].originalExpression).toEqual("2 3/8 + 2 5/8");
        expect(tokens[1].startIndex).toEqual(6);
        expect(tokens[1].endIndex).toEqual(8);
        expect(tokens[1].text).toEqual("+ ");

        expect(tokens[2].type).toEqual("IExpressionTokenNumber");
        expect(tokens[2].originalExpression).toEqual("2 3/8 + 2 5/8");
        expect(tokens[2].startIndex).toEqual(8);
        expect(tokens[2].endIndex).toEqual(13);
        expect(tokens[2].text).toEqual("2 5/8");
    });


    it("successfully tokenizes an expression that contains fractions and a minus operator", () => {
        const tokenizeResult = tokenize("2 3/8 - 2 5/8");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(3);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect(tokens[0].originalExpression).toEqual("2 3/8 - 2 5/8");
        expect(tokens[0].startIndex).toEqual(0);
        expect(tokens[0].endIndex).toEqual(6);
        expect(tokens[0].text).toEqual("2 3/8 ");

        expect(tokens[1].type).toEqual("IExpressionTokenOperator");
        expect((tokens[1] as IExpressionTokenOperator).symbol).toEqual("-");
        expect(tokens[1].originalExpression).toEqual("2 3/8 - 2 5/8");
        expect(tokens[1].startIndex).toEqual(6);
        expect(tokens[1].endIndex).toEqual(8);
        expect(tokens[1].text).toEqual("- ");

        expect(tokens[2].type).toEqual("IExpressionTokenNumber");
        expect(tokens[2].originalExpression).toEqual("2 3/8 - 2 5/8");
        expect(tokens[2].startIndex).toEqual(8);
        expect(tokens[2].endIndex).toEqual(13);
        expect(tokens[2].text).toEqual("2 5/8");
    });


    it("successfully tokenizes an expression that contains fractions and a multiplication operator", () => {
        const tokenizeResult = tokenize("2 3/8 * 2 5/8");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(3);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect(tokens[0].originalExpression).toEqual("2 3/8 * 2 5/8");
        expect(tokens[0].startIndex).toEqual(0);
        expect(tokens[0].endIndex).toEqual(6);
        expect(tokens[0].text).toEqual("2 3/8 ");

        expect(tokens[1].type).toEqual("IExpressionTokenOperator");
        expect((tokens[1] as IExpressionTokenOperator).symbol).toEqual("*");
        expect(tokens[1].originalExpression).toEqual("2 3/8 * 2 5/8");
        expect(tokens[1].startIndex).toEqual(6);
        expect(tokens[1].endIndex).toEqual(8);
        expect(tokens[1].text).toEqual("* ");

        expect(tokens[2].type).toEqual("IExpressionTokenNumber");
        expect(tokens[2].originalExpression).toEqual("2 3/8 * 2 5/8");
        expect(tokens[2].startIndex).toEqual(8);
        expect(tokens[2].endIndex).toEqual(13);
        expect(tokens[2].text).toEqual("2 5/8");
    });


    it("successfully tokenizes an expression that contains fractions and a division operator", () => {
        const tokenizeResult = tokenize("2 3/8 / 2 5/8");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(3);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect(tokens[0].originalExpression).toEqual("2 3/8 / 2 5/8");
        expect(tokens[0].startIndex).toEqual(0);
        expect(tokens[0].endIndex).toEqual(6);
        expect(tokens[0].text).toEqual("2 3/8 ");

        expect(tokens[1].type).toEqual("IExpressionTokenOperator");
        expect((tokens[1] as IExpressionTokenOperator).symbol).toEqual("/");
        expect(tokens[1].originalExpression).toEqual("2 3/8 / 2 5/8");
        expect(tokens[1].startIndex).toEqual(6);
        expect(tokens[1].endIndex).toEqual(8);
        expect(tokens[1].text).toEqual("/ ");

        expect(tokens[2].type).toEqual("IExpressionTokenNumber");
        expect(tokens[2].originalExpression).toEqual("2 3/8 / 2 5/8");
        expect(tokens[2].startIndex).toEqual(8);
        expect(tokens[2].endIndex).toEqual(13);
        expect(tokens[2].text).toEqual("2 5/8");
    });


    it("successfully tokenizes an expression that contains multiple operators", () => {
        const tokenizeResult = tokenize("3/1 + 1/2 * 4/1");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(5);

        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect(tokens[0].originalExpression).toEqual("3/1 + 1/2 * 4/1");
        expect(tokens[0].startIndex).toEqual(0);
        expect(tokens[0].endIndex).toEqual(4);
        expect(tokens[0].text).toEqual("3/1 ");

        expect(tokens[1].type).toEqual("IExpressionTokenOperator");
        expect((tokens[1] as IExpressionTokenOperator).symbol).toEqual("+");
        expect(tokens[1].originalExpression).toEqual("3/1 + 1/2 * 4/1");
        expect(tokens[1].startIndex).toEqual(4);
        expect(tokens[1].endIndex).toEqual(6);
        expect(tokens[1].text).toEqual("+ ");

        expect(tokens[2].type).toEqual("IExpressionTokenNumber");
        expect(tokens[2].originalExpression).toEqual("3/1 + 1/2 * 4/1");
        expect(tokens[2].startIndex).toEqual(6);
        expect(tokens[2].endIndex).toEqual(10);
        expect(tokens[2].text).toEqual("1/2 ");

        expect(tokens[3].type).toEqual("IExpressionTokenOperator");
        expect((tokens[3] as IExpressionTokenOperator).symbol).toEqual("*");
        expect(tokens[3].originalExpression).toEqual("3/1 + 1/2 * 4/1");
        expect(tokens[3].startIndex).toEqual(10);
        expect(tokens[3].endIndex).toEqual(12);
        expect(tokens[3].text).toEqual("* ");

        expect(tokens[4].type).toEqual("IExpressionTokenNumber");
        expect(tokens[4].originalExpression).toEqual("3/1 + 1/2 * 4/1");
        expect(tokens[4].startIndex).toEqual(12);
        expect(tokens[4].endIndex).toEqual(15);
        expect(tokens[4].text).toEqual("4/1");
    });


    it("successfully tokenizes an expression that contains parenthesis", () => {
        const tokenizeResult = tokenize("(3/1 + 1/2) * 4/1");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(7);

        expect(tokens[0].type).toEqual("IExpressionTokenOperator");
        expect(tokens[0].originalExpression).toEqual("(3/1 + 1/2) * 4/1");
        expect(tokens[0].startIndex).toEqual(0);
        expect(tokens[0].endIndex).toEqual(1);
        expect(tokens[0].text).toEqual("(");

        expect(tokens[1].type).toEqual("IExpressionTokenNumber");
        expect(tokens[1].originalExpression).toEqual("(3/1 + 1/2) * 4/1");
        expect(tokens[1].startIndex).toEqual(1);
        expect(tokens[1].endIndex).toEqual(5);
        expect(tokens[1].text).toEqual("3/1 ");

        expect(tokens[2].type).toEqual("IExpressionTokenOperator");
        expect((tokens[2] as IExpressionTokenOperator).symbol).toEqual("+");
        expect(tokens[2].originalExpression).toEqual("(3/1 + 1/2) * 4/1");
        expect(tokens[2].startIndex).toEqual(5);
        expect(tokens[2].endIndex).toEqual(7);
        expect(tokens[2].text).toEqual("+ ");

        expect(tokens[3].type).toEqual("IExpressionTokenNumber");
        expect(tokens[3].originalExpression).toEqual("(3/1 + 1/2) * 4/1");
        expect(tokens[3].startIndex).toEqual(7);
        expect(tokens[3].endIndex).toEqual(10);
        expect(tokens[3].text).toEqual("1/2");

        expect(tokens[4].type).toEqual("IExpressionTokenOperator");
        expect(tokens[4].originalExpression).toEqual("(3/1 + 1/2) * 4/1");
        expect(tokens[4].startIndex).toEqual(10);
        expect(tokens[4].endIndex).toEqual(12);
        expect(tokens[4].text).toEqual(") ");

        expect(tokens[5].type).toEqual("IExpressionTokenOperator");
        expect((tokens[5] as IExpressionTokenOperator).symbol).toEqual("*");
        expect(tokens[5].originalExpression).toEqual("(3/1 + 1/2) * 4/1");
        expect(tokens[5].startIndex).toEqual(12);
        expect(tokens[5].endIndex).toEqual(14);
        expect(tokens[5].text).toEqual("* ");

        expect(tokens[6].type).toEqual("IExpressionTokenNumber");
        expect(tokens[6].originalExpression).toEqual("(3/1 + 1/2) * 4/1");
        expect(tokens[6].startIndex).toEqual(14);
        expect(tokens[6].endIndex).toEqual(17);
        expect(tokens[6].text).toEqual("4/1");
    });

});


describe("toPostfix()", () => {

    it("fails when there is a mismatched left parenthesis", () => {
        const tokenizeResult = tokenize("2 * ( 3");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const postfixResult = toPostfix(tokenizeResult.value!);
        expect(failed(postfixResult)).toBeTruthy();
        expect(postfixResult.error).toEqual('"(" found while emptying operator stack.  Mismatched parenthesis.');
    });


    it("fails when there is a mismatched right parenthesis", () => {
        const tokenizeResult = tokenize("2 * ) 3");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const postfixResult = toPostfix(tokenizeResult.value!);
        expect(failed(postfixResult)).toBeTruthy();
        expect(postfixResult.error).toEqual('Operator stack exhaused while finding "(".  Mismatched parenthesis.');
    });


    it("converts an infix expression to a postfix expression", () => {
        const tokenizeResult = tokenize("(1/4 + 1 3/4) * 4");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const postfixResult = toPostfix(tokenizeResult.value!);
        expect(succeeded(postfixResult)).toBeTruthy();
        expect(postfixResult.value!.length).toEqual(5);

        const postfixTokens = postfixResult.value!;

        expect(postfixTokens[0].type).toEqual("IExpressionTokenNumber");
        expect((postfixTokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from("1/4"));

        expect(postfixTokens[1].type).toEqual("IExpressionTokenNumber");
        expect((postfixTokens[1] as IExpressionTokenNumber).value).toEqual(Fraction.from("1 3/4"));

        expect(postfixTokens[2].type).toEqual("IExpressionTokenOperator");
        expect((postfixTokens[2] as IExpressionTokenOperator).symbol).toEqual("+");

        expect(postfixTokens[3].type).toEqual("IExpressionTokenNumber");
        expect((postfixTokens[3] as IExpressionTokenNumber).value).toEqual(Fraction.from("4"));

        expect(postfixTokens[4].type).toEqual("IExpressionTokenOperator");
        expect((postfixTokens[4] as IExpressionTokenOperator).symbol).toEqual("*");
    });

});


describe("evaluate()", () => {


    it("fails to evaluate an empty expression", () => {
        const res = evaluate("");
        expect(failed(res)).toBeTruthy();
        expect(res.error).toEqual("No expression.");
    });


    it("fails to evaluate an expression that cannot be tokenized", () => {
        expect(failed(evaluate("2 3/4 & 6/1"))).toBeTruthy();
    });


    it("fails to evaluate an expression that can be tokenized but cannot be converted to postfix", () => {
        expect(failed(evaluate("1/2 * 2 +"))).toBeTruthy();
    });


    it("successfully evaluates an expression where the order matters", () => {
        const res = evaluate("3 - 2");
        expect(succeeded(res)).toBeTruthy();
        expect(res.value!.equals(1)).toBeTruthy();
    });


    it("successfully evaluates an expression containing parenthesis", () => {
        const res = evaluate("(3/1 + 1/2) * 4/1");
        expect(succeeded(res)).toBeTruthy();
        expect(res.value!.equals(14)).toBeTruthy();
    });

});
