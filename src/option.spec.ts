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


    describe("augment()", () => {

        it("if the input is None, returns None without invoking the function", () => {
            function step1() {
                return NoneOption.get();
            }

            let numStep2Invocations = 0;
            function step2() {
                numStep2Invocations++;
                return new SomeOption({c: 3, d: 4});
            }

            const res =
                pipe(
                    step1(),
                    (res) => Option.augment(step2, res)
                );
            expect(res).toEqual(NoneOption.get());
            expect(numStep2Invocations).toEqual(0);
        });


        it("if the input is Some, invokes fn", () => {
            function step1() {
                return new SomeOption({a: 1, b: 2});
            }

            let numStep2Invocations = 0;
            function step2(props: {b: number}) {
                numStep2Invocations++;
                return new SomeOption({c: props.b + 1, d: props.b + 2});
            }

            const res =
                pipe(
                    step1(),
                    (res) => Option.augment(step2, res)
                );
            expect(numStep2Invocations).toEqual(1);
        });


        it("if the input is Some and fn returns None, returns None", () => {
            function step1() {
                return new SomeOption({a: 1, b: 2});
            }

            let numStep2Invocations = 0;
            function step2(props: {b: number}) {
                numStep2Invocations++;
                return NoneOption.get();
            }

            const res =
                pipe(
                    step1(),
                    (res) => Option.augment(step2, res)
                );
            expect(res).toEqual(NoneOption.get());
        });


        it("if the input and fn return Some, returns a Some Option containing all properties", () => {
            function step1() {
                return new SomeOption({a: 1, b: 2});
            }

            let numStep2Invocations = 0;
            function step2(props: {b: number}) {
                numStep2Invocations++;
                return new SomeOption({c: props.b + 1, d: props.b + 2});
            }

            const res =
                pipe(
                    step1(),
                    (res) => Option.augment(step2, res)
                );
            expect(res).toEqual(new SomeOption({a: 1, b: 2, c: 3, d: 4}));
        });


        it("properties in the original input can be reassigned", () => {
            function step1() {
                return new SomeOption({a: 1, b: 2});
            }

            let numStep2Invocations = 0;
            function step2(props: {b: number}) {
                numStep2Invocations++;
                return new SomeOption({b: 0});
            }

            const res =
                pipe(
                    step1(),
                    (res) => Option.augment(step2, res)
                );
            expect(res).toEqual(new SomeOption({a: 1, b: 0}));
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


    describe("choose()", () => {


        it("returns an array where only Some mappings are included", () => {

            const result =
                pipe(
                    [1, 2, 3, 4, 5, 6],
                    (input) => Option.choose((n) => n % 2 === 0 ? new SomeOption(n + 1) : NoneOption.get(), input)
                );

            expect(result).toEqual([3, 5, 7]);

        });


    });


    describe("defaultValue()", () => {


        it("when given a Some value returns the contained value", () => {
            expect(Option.defaultValue(3, new SomeOption(5))).toEqual(5);
        });


        it("when given a None value returns the specified default value", () => {
            expect(Option.defaultValue(3, NoneOption.get())).toEqual(3);
        });


    });


    describe("defaultWith()", () => {


        it("when given a Some value returns the contained value", () => {
            let numInvocations = 0;
            function getDefault() {
                numInvocations++;
                return 5;
            }

            expect(Option.defaultWith(getDefault, new SomeOption(3))).toEqual(3);
            expect(numInvocations).toEqual(0);
        });


        it("when given a None value invokes the function and returns the result", () => {
            let numInvocations = 0;
            function getDefault() {
                numInvocations++;
                return 5;
            }

            expect(Option.defaultWith(getDefault, NoneOption.get())).toEqual(5);
            expect(numInvocations).toEqual(1);
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
