import { assertNever } from "./never";
import { Option, SomeOption, NoneOption } from "./option";
import { pipe } from "./pipe";


////////////////////////////////////////////////////////////////////////////////
// Test Infrastructure

function someOperation(): Option<number> {
    return new SomeOption(5);
}


function noneOperation(): Option<number> {
    return NoneOption.get();
}


////////////////////////////////////////////////////////////////////////////////
// Tests


describe("example", () => {

    it("of exhaustiveness checking", () => {
        const opt = someOperation();
        switch (opt.isSome) {
            // If this switch is made non-exhaustive, this code will no longer
            // compile.
            case true:
                break;

            case false:
                break;

            default:
                return assertNever(opt);
        }

        return undefined;
    });
});


describe("SomeOption()", () => {

    it("returns an object describing an option with a value", () => {
        const opt = new SomeOption(5);
        expect(opt.isSome).toBeTrue();
        expect(opt.isNone).toBeFalse();
        expect(opt.value).toEqual(5);
    });

});


describe("NoneOption.get()", () => {

    it("returns an object describing an option with no value", () => {
        const opt = NoneOption.get();
        expect(opt.isNone).toBeTrue();
        expect(opt.isSome).toBeFalse();
        expect(opt.value).toEqual(undefined);
    });

});


describe("Option namespace", () => {


    describe("all()", () => {

        it("when given all 'some' options, returns an array of their values", () => {
            const options = [
                new SomeOption(1),
                new SomeOption(2),
                new SomeOption(3)
            ];
            expect(Option.all(options)).toEqual(new SomeOption([1, 2, 3]));
        });


        it("when given all 'some' options with different types, returns an array of their values", () => {
            const options: Array<Option<number | string>> = [
                new SomeOption(1),
                new SomeOption("foo"),
                new SomeOption(3)
            ];
            expect(Option.all(options)).toEqual(new SomeOption([1, "foo", 3]));
        });


        it("when given an array with 'none' values, returns a 'none' value", () => {
            const options = [
                new SomeOption(1),
                new SomeOption(2),
                NoneOption.get()
            ];
            expect(Option.all(options)).toEqual(NoneOption.get());
        });

    });


    describe("bind", () => {

        it("with none input the option is passed along and the function is not invoked", () => {
            let numInvocations = 0;
            const fn = (x: number) => { numInvocations++; return new SomeOption(x + 1); };

            const opt = Option.bind(fn, NoneOption.get());
            expect(opt.isNone).toBeTruthy();
            expect(numInvocations).toEqual(0);
        });


        it("with some input the function is invoked and the returned option is returned", () => {
            let numInvocations = 0;
            const fn = (x: number) => { numInvocations++; return new SomeOption(x + 1); };

            const opt = Option.bind(fn, new SomeOption(3));
            expect(opt.isSome).toBeTruthy();
            expect(opt.value).toEqual(4);
            expect(numInvocations).toEqual(1);
        });


        it("can be used easily with pipe()", () => {
            const subtract1 = (x: number) => x <= 0 ? NoneOption.get() : new SomeOption(x - 1);

            const opt1 = pipe(
                2,
                subtract1,                              // 1
                (o) => Option.bind(subtract1, o),        // 0
                (o) => Option.bind(subtract1, o)         // none
            );
            expect(opt1.isNone).toBeTruthy();

            const opt2 = pipe(
                2,
                subtract1,                              // 1
                (o) => Option.bind(subtract1, o)         // 0
            );
            expect(opt2.isSome).toBeTruthy();
            expect(opt2.value).toEqual(0);

        });
    });


    describe("defaultValue()", () => {


        it("when given a Some value returns the wrapped value", () => {
            expect(Option.defaultValue(3, new SomeOption(5))).toEqual(5);
        });


        it("when given a None value returns the specified default value", () => {
            expect(Option.defaultValue(3, NoneOption.get())).toEqual(3);
        });


    });


    describe("fromBool()", () => {

        it("returns some value when condition is true", () => {
            expect(Option.fromBool(true, 5)).toEqual(new SomeOption(5));
        });


        it("returns none value when condition is false", () => {
            expect(Option.fromBool(false, 5)).toEqual(NoneOption.get());
        });
    });


    describe("mapSome()", () => {

        it("with none input the option is passed along and the function is not invoked", () => {
            let numInvocations = 0;
            const add1 = (x: number) => { numInvocations++; return x + 1; };

            const opt = Option.mapSome(add1, NoneOption.get());
            expect(opt.isNone).toBeTruthy();
            expect(numInvocations).toEqual(0);
        });


        it("with some input the function is invoked and its return values is wrapped in a some option", () => {
            let numInvocations = 0;
            const add1 = (x: number) => { numInvocations++; return x + 1; };

            const opt = Option.mapSome(add1, new SomeOption(3));
            expect(opt.isSome).toBeTruthy();
            expect(opt.value).toEqual(4);
            expect(numInvocations).toEqual(1);
        });


        it("can be used easily with pipe()", () => {
            const add1 = (x: number) => x + 1;

            const opt = pipe(
                new SomeOption(3),
                (o) => Option.mapSome(add1, o),        // 4
                (o) => Option.mapSome(add1, o),        // 5
                (o) => Option.mapSome(add1, o)         // 6
            );

            expect(opt.isSome).toBeTruthy();
            expect(opt.value).toEqual(6);
        });
    });


});
