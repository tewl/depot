import { assertNever } from "./never";
import {bindOption, boolToOption, isNone, isSome, mapSome, noneOption, Option, someOption} from "./option";
import { pipe } from "./pipe";

////////////////////////////////////////////////////////////////////////////////
// Test Infrastructure

function someOperation(): Option<number>
{
    return someOption(5);
}


function noneOperation(): Option<number>
{
    return noneOption();
}


////////////////////////////////////////////////////////////////////////////////


describe("example", () =>
{
    it("of exhaustiveness checking", () =>
    {
        const opt = someOperation();
        switch (opt.state)
        {
            // If this switch is made non-exhaustive, this code will no longer
            // compile.
            case "some":
                break;

            case "none":
                break;

            default:
                return assertNever(opt);
        }

        return undefined;
    });
});


describe("someOption()", () =>
{
    it("returns an object describing an option with a value", () =>
    {
        const opt = someOption(5);
        expect(opt.state).toEqual("some");
        expect(opt.value).toEqual(5);
    });
});


describe("noneOption()", () =>
{
    it("returns an object describing an option with no value", () =>
    {
        const opt = noneOption();
        expect(opt.state).toEqual("none");
        expect(opt.value).toEqual(undefined);
    });
});


describe("isSome()", () =>
{
    it("returns true when given an option with a value", () =>
    {
        expect(isSome(someOperation())).toBeTruthy();
    });


    it("returns false when given an option with no value", () =>
    {
        expect(isSome(noneOperation())).toBeFalsy();
    });
});


describe("isNone()", () =>
{
    it("returns true when given an option with no value", () =>
    {
        expect(isNone(noneOperation())).toBeTruthy();
    });


    it("returns false when given an option with a value", () =>
    {
        expect(isNone(someOperation())).toBeFalsy();
    });
});


describe("bindOption", () =>
{
    it("with none input the option is passed along and the function is not invoked", () =>
    {
        let numInvocations = 0;
        const fn = (x: number) => { numInvocations++; return someOption(x + 1); };

        const opt = bindOption(fn, noneOption());
        expect(isNone(opt)).toBeTruthy();
        expect(numInvocations).toEqual(0);
    });


    it("with some input the function is invoked and the returned option is returned", () =>
    {
        let numInvocations = 0;
        const fn = (x: number) => { numInvocations++; return someOption(x + 1); };

        const opt = bindOption(fn, someOption(3));
        expect(isSome(opt)).toBeTruthy();
        expect(opt.value).toEqual(4);
        expect(numInvocations).toEqual(1);
    });


    it("can be used easily with pipe()", () =>
    {
        const subtract1 = (x: number) => x <= 0 ? noneOption() : someOption(x - 1);

        const opt1 = pipe(
            2,
            subtract1,                              // 1
            (o) => bindOption(subtract1, o),        // 0
            (o) => bindOption(subtract1, o)         // none
        );
        expect(isNone(opt1)).toBeTruthy();

        const opt2 = pipe(
            2,
            subtract1,                              // 1
            (o) => bindOption(subtract1, o)         // 0
        );
        expect(isSome(opt2)).toBeTruthy();
        expect(opt2.value).toEqual(0);

    });
});


describe("mapSome()", () =>
{
    it("with none input the option is passed along and the function is not invoked", () =>
    {
        let numInvocations = 0;
        const add1 = (x: number) => { numInvocations++; return x + 1; };

        const opt = mapSome(add1, noneOption());
        expect(isNone(opt)).toBeTruthy();
        expect(numInvocations).toEqual(0);
    });


    it("with some input the function is invoked and its return values is wrapped in a some option", () =>
    {
        let numInvocations = 0;
        const add1 = (x: number) => { numInvocations++; return x + 1; };

        const opt = mapSome(add1, someOption(3));
        expect(isSome(opt)).toBeTruthy();
        expect(opt.value).toEqual(4);
        expect(numInvocations).toEqual(1);
    });


    it("can be used easily with pipe()", () =>
    {
        const add1 = (x: number) => x + 1;

        const opt = pipe(
            someOption(3),
            (o) => mapSome(add1, o),        // 4
            (o) => mapSome(add1, o),        // 5
            (o) => mapSome(add1, o)         // 6
        );

        expect(isSome(opt)).toBeTruthy();
        expect(opt.value).toEqual(6);
    });
});


describe("boolToOption()", () =>
{
    it("returns some value when condition is true", () =>
    {
        expect(boolToOption(true, 5)).toEqual(someOption(5));
    });


    it("returns none value when condition is false", () =>
    {
        expect(boolToOption(false, 5)).toEqual(noneOption());
    });
});
