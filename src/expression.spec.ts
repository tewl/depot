import {IExpressionTokenNumber, IExpressionTokenOperator, scan} from "./expression";
import {Fraction} from "./fraction";
import {succeeded, failed} from "./result";

describe("scan()", () => {


    it("successfully tokenizes a whole number", () => {
        const parseResult = scan("3");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully tokenizes an expression with leading whitespace", () =>
    {
        const parseResult = scan("   \t  3");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully tokenizes an expression with trailing whitespace", () =>
    {
        const parseResult = scan("3  \t   ");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully tokenizes a fraction", () => {
        const parseResult = scan("1/4");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value.equals(Fraction.from(0.25))).toEqual(true);
    });


    it("successfully tokenizes a fraction that contains a whole number and a fractional part", () =>
    {
        const parseResult = scan("2 1/4");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value.equals(Fraction.from(2.25))).toEqual(true);
    });


    it("successfully tokenizes an expression that contains a plus operator", () => {
        const scanResult = scan("2 + 3");
        expect(succeeded(scanResult)).toBeTruthy();
        const tokens = scanResult.value!;
        expect(tokens.length).toEqual(3);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect(tokens[1].type).toEqual("IExpressionTokenOperator");
        expect((tokens[1] as IExpressionTokenOperator).operator).toEqual("+");
        expect(tokens[2].type).toEqual("IExpressionTokenNumber");
    });

});
