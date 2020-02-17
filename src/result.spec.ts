import {Result, failureResult} from "./result";


//
// The Result type is purely a compile-time feature.  The following unit tests
// do not really exercise any behaviors.  These tests are just a convenient
// place to write code that uses the Result type to ensure that the TypeScript
// compiler issues the expected errors.
//

type FailureIds = "ERROR_1" | "ERROR_2" | "ERROR_3";


function failingOperation(): Result<void, FailureIds> {
    return failureResult<FailureIds>("ERROR_1", "Error 1");
}


function successfulOperation(): Result<number, FailureIds> {
    return {
        success: true,
        value:     5
    };
}


describe("Result", () => {


    it("will have the expected fields upon failure", () => {
        const result = failingOperation();
        if (result.success) {
            fail("The operation should not have succeeded");
            return;
        }

        expect(result.error).toEqual("ERROR_1");
    });


    it("will have the expected fields upon success", () => {
        const result = successfulOperation();
        if (!result.success) {
            fail("The operation should have succeeded.");
            return;
        }

        expect(result.value).toEqual(5);
    });


});

