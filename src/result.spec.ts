import * as _ from "lodash";
import { assertNever } from "./never";
import { pipe } from "./pipe";
import {Result, succeededResult, failedResult, succeeded, failed, bindResult, mapSuccess, mapError} from "./result";


////////////////////////////////////////////////////////////////////////////////
// Test Infrastructure

enum OperationError
{
    Timeout,
    ServiceNotAvailable
}

const successfulOperation = (): Result<number, OperationError> =>
{
    return succeededResult(5);
};

const failureOperation = (): Result<number, OperationError> =>
{
    return failedResult(OperationError.ServiceNotAvailable);
};

////////////////////////////////////////////////////////////////////////////////


describe("example", () => {

    it("of exhaustiveness checking", (): void =>
    {
        const result = successfulOperation();
        switch (result.state)
        {
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


describe("bindResult()", () => {

    it("with failed input the error is passed along and the function is not invoked", () =>
    {
        let numInvocations = 0;
        function sqrt(x: number): Result<number, string>
        {
            numInvocations += 1;
            return x < 0 ? failedResult("Cannot take the square root of a negative numbwer.") :
                           succeededResult(Math.sqrt(x));
        }

        const result = bindResult(sqrt, failedResult("Initial error"));
        expect(failed(result)).toBeTruthy();
        expect(result.error).toEqual("Initial error");
        expect(numInvocations).toEqual(0);
    });


    it("with successful input the function is invoked and its result returned", () =>
    {
        let numInvocations = 0;
        function sqrt(x: number): Result<number, string>
        {
            numInvocations += 1;
            return x < 0 ? failedResult("Cannot take the square root of a negative numbwer.") :
                           succeededResult(Math.sqrt(x));
        }

        const result = bindResult(sqrt, succeededResult(16));
        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual(4);
        expect(numInvocations).toEqual(1);
    });


    it("can be used easily with pipe()", () =>
    {

        function parse(text: string): Result<number, string>
        {
            const parsed = parseInt(text, 10);
            return _.isNaN(parsed) ? failedResult(`Invalid integer value "${text}".`) :
                                     succeededResult(parsed);
        }

        function sqrt(x: number): Result<number, string>
        {
            return x < 0 ? failedResult("Cannot take the square root of a negative number.") :
                           succeededResult(Math.sqrt(x));
        }

        function stringify(x: number): Result<string, string> {
            return succeededResult(`${x}`);
        }

        const resultA = pipe(
            "16",
            parse,
            (r) => bindResult(sqrt, r),
            (r) => bindResult(stringify, r)
        );

        expect(succeeded(resultA)).toBeTruthy();
        expect(resultA.value).toEqual("4");
    });


});



describe("mapSuccess()", () =>
{
    it("with failed input the error is passed along and the function is not invoked", () =>
    {
        let numInvocations = 0;
        const fn = (x: number) => { numInvocations++; return x + 1; };

        const result = mapSuccess(fn, failedResult("failure"));
        expect(failed(result)).toBeTruthy();
        expect(result.error).toEqual("failure");
        expect(numInvocations).toEqual(0);
    });


    it("with successful input the function is invoked and its result is wrapped in a successful Result", () =>
    {
        let numInvocations = 0;
        const fn = (x: number) => { numInvocations++; return x + 1; };

        const result = mapSuccess(fn, succeededResult(1));
        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual(2);
        expect(numInvocations).toEqual(1);
    });
});


describe("mapError()", () =>
{
    it("with successful input the value is passed along and the function is not invoked", () =>
    {
        let numInvocations = 0;
        const fn = (errMsg: string) => { numInvocations++; return `Error: ${errMsg}`; };

        const result = mapError(fn, succeededResult(1));
        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual(1);
        expect(numInvocations).toEqual(0);
    });


    it("with failed input the function is invoked and its result is wrapped in a failed Result", () =>
    {
        let numInvocations = 0;
        const fn = (errMsg: string) => { numInvocations++; return `Error: ${errMsg}`; };

        const result = mapError(fn, failedResult("fake error message"));
        expect(failed(result)).toBeTruthy();
        expect(result.error).toEqual("Error: fake error message");
        expect(numInvocations).toEqual(1);
    });
});
