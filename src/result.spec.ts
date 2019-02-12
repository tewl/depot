import {Result} from "./result";


//
// The Result type is purely a compile-time feature.  The following unit tests
// do not really exercise any behaviors.  These tests are just a convenient
// place to write code that uses the Result type to ensure that the TypeScript
// compiler issues the expected errors.
//


function failingOperation(): Result<void, number> {
    return {
        succeeded: false,
        error:     3
    };
}


function successfulOperation(): Result<number, Error> {
    return {
        succeeded: true,
        value:     5
    };
}


describe("Result", () => {


    it("will have the expected fields upon failure", () => {
        const result = failingOperation();
        if (result.succeeded) {
            fail("The operation should not have succeeded");
            return;
        }

        expect(result.error).toEqual(3);
    });


    it("will have the expected fields upon success", () => {
        const result = successfulOperation();
        if (!result.succeeded) {
            fail("The operation should have succeeded.");
            return;
        }

        expect(result.value).toEqual(5);
    });


});

