import {IExpressionTokenNumber, parse} from "./expression";
import {Fraction} from "./fraction";
import {succeeded, failed} from "./result";

fdescribe("parse", () => {


    it("successfully parses a whole number", () => {
        const parseResult = parse("3");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully parses an expression with leading whitespace", () =>
    {
        const parseResult = parse("   \t  3");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully parses an expression with trailing whitespace", () =>
    {
        const parseResult = parse("3  \t   ");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value).toEqual(Fraction.from(3));
    });


    it("successfully parses a fraction", () => {
        const parseResult = parse("1/4");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value.equals(Fraction.from(0.25))).toEqual(true);
    });


    it("successfully parses a fraction that contains a whole number and a fractional part", () =>
    {
        const parseResult = parse("2 1/4");
        expect(succeeded(parseResult)).toBeTruthy();
        const tokens = parseResult.value!;
        expect(tokens.length).toEqual(1);
        expect(tokens[0].type).toEqual("IExpressionTokenNumber");
        expect((tokens[0] as IExpressionTokenNumber).value.equals(Fraction.from(2.25))).toEqual(true);
    });


    it("successfully parses a fraction that contains a plus operator", () => {

    });


    it("fails to parse an expression with two consecutive numbers", () => {
        const parseResult = parse("2 1/4 1/2");
        expect(failed(parseResult)).toBeTruthy();
        expect(parseResult.error).toEqual(`Illegal consecutive number token "1/2" at index 6.`);
    });

});
