import {IExpressionTokenNumber, IExpressionTokenOperator, tokenize} from "./expression";
import {Fraction} from "./fraction";
import {succeeded, failed} from "./result";

fdescribe("tokenize()", () => {


    it("successfully tokenizes a whole number", () => {
        const tokenizeResult = tokenize("3");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully tokenizes an expression with leading whitespace", () =>
    {
        const tokenizeResult = tokenize("   \t  3");
        expect(succeeded(tokenizeResult)).toBeTruthy();
        const tokens = tokenizeResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully tokenizes an expression with trailing whitespace", () =>
    {
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


    it("successfully tokenizes a fraction that contains a whole number and a fractional part", () =>
    {
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
        expect((tokens[1] as IExpressionTokenOperator).operator).toEqual("+");
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
        expect((tokens[1] as IExpressionTokenOperator).operator).toEqual("+");
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


    it("successfully tokenizes an expression that contains fractions and a minus operator", () =>
    {
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
        expect((tokens[1] as IExpressionTokenOperator).operator).toEqual("-");
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


    it("successfully tokenizes an expression that contains fractions and a multiplication operator", () =>
    {
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
        expect((tokens[1] as IExpressionTokenOperator).operator).toEqual("*");
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


    it("successfully tokenizes an expression that contains fractions and a division operator", () =>
    {
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
        expect((tokens[1] as IExpressionTokenOperator).operator).toEqual("/");
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
        expect((tokens[1] as IExpressionTokenOperator).operator).toEqual("+");
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
        expect((tokens[3] as IExpressionTokenOperator).operator).toEqual("*");
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

});
