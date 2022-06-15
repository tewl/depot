import * as _ from "lodash";
import { assertNever } from "./never";
import { Result, succeededResult, failedResult, succeeded, failed } from "./result";


////////////////////////////////////////////////////////////////////////////////
// Test Infrastructure

enum OperationError {
    Timeout,
    ServiceNotAvailable
}

const successfulOperation = (): Result<number, OperationError> => {
    return succeededResult(5);
};

const failureOperation = (): Result<number, OperationError> => {
    return failedResult(OperationError.ServiceNotAvailable);
};

////////////////////////////////////////////////////////////////////////////////


describe("example", () => {

    it("of exhaustiveness checking", (): void => {
        const result = successfulOperation();
        switch (result.state) {
            case "succeeded":
                break;

            // Commenting out the following case will cause a compiler error for
            // the call to assertNever() below.
            case "failed":
                break;

            default:
                return assertNever(result);
        }
    });
});


describe("succeededResult()", () => {

    it("returns an object describing a successful result", () => {
        const result = succeededResult(5);
        expect(result.state).toEqual("succeeded");
        expect(result.value).toEqual(5);
    });

});


describe("failedResult()", () => {

    it("returns an object describing a failed result", () => {
        const result = failedResult(3);
        expect(result.state).toEqual("failed");
        expect(result.error).toEqual(3);
    });

});


describe("succeeded()", () => {

    it("returns true when given a successful result", () => {
        const result = successfulOperation();
        expect(succeeded(result)).toBeTruthy();
    });


    it("returns false when given a failure result", () => {
        const result = failureOperation();
        expect(succeeded(result)).toBeFalsy();
    });

});


describe("failed()", () => {

    it("returns true when given a failure result", () => {
        const result = failureOperation();
        expect(failed(result)).toBeTruthy();
    });


    it("returns false when given a successful result", () => {
        const result = successfulOperation();
        expect(failed(result)).toBeFalsy();
    });

});


describe("Result namespace", () => {

    describe("all()", () => {

        it("when given successful results, returns an array of their values", () => {
            const results = [
                succeededResult(10),
                succeededResult(20),
                succeededResult(30)
            ];
            expect(Result.all(results)).toEqual(succeededResult([10, 20, 30]));
        });


        it("when given successful results of different types, returns an array of their values", () => {
            const results = [
                succeededResult(10),
                succeededResult(20),
                succeededResult(undefined)
            ];
            expect(Result.all(results)).toEqual(succeededResult([10, 20, undefined]));
        });


        it("when given a collection containing failures, returns the first failure", () => {
            const results = [
                succeededResult(10),
                succeededResult(20),
                failedResult("Error msg")
            ];
            expect(Result.all(results)).toEqual(failedResult("Error msg"));
        });

    });

});
