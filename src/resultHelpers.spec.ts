import * as _ from "lodash";
import { pipe } from "./pipe";
import { failed, failedResult, Result, succeeded, succeededResult } from "./result";
import { bindResult, boolToResult, executeWhileSuccessful, pare, mapError, mapSuccess, mapWhileSuccessful } from "./resultHelpers";


describe("bindResult()", () => {

    it("with failed input the error is passed along and the function is not invoked", () => {
        let numInvocations = 0;
        function sqrt(x: number): Result<number, string> {
            numInvocations += 1;
            return x < 0 ? failedResult("Cannot take the square root of a negative numbwer.") :
                           succeededResult(Math.sqrt(x));
        }

        const result = bindResult(sqrt, failedResult("Initial error"));
        expect(failed(result)).toBeTruthy();
        expect(result.error).toEqual("Initial error");
        expect(numInvocations).toEqual(0);
    });


    it("with successful input the function is invoked and its result returned", () => {
        let numInvocations = 0;
        function sqrt(x: number): Result<number, string> {
            numInvocations += 1;
            return x < 0 ? failedResult("Cannot take the square root of a negative numbwer.") :
                           succeededResult(Math.sqrt(x));
        }

        const result = bindResult(sqrt, succeededResult(16));
        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual(4);
        expect(numInvocations).toEqual(1);
    });


    it("can be used easily with pipe()", () => {

        function parse(text: string): Result<number, string> {
            const parsed = parseInt(text, 10);
            return _.isNaN(parsed) ? failedResult(`Invalid integer value "${text}".`) :
                                     succeededResult(parsed);
        }

        function sqrt(x: number): Result<number, string> {
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



describe("mapSuccess()", () => {
    it("with failed input the error is passed along and the function is not invoked", () => {
        let numInvocations = 0;
        const fn = (x: number) => { numInvocations++; return x + 1; };

        const result = mapSuccess(fn, failedResult("failure"));
        expect(failed(result)).toBeTruthy();
        expect(result.error).toEqual("failure");
        expect(numInvocations).toEqual(0);
    });


    it("with successful input the function is invoked and its result is wrapped in a successful Result", () => {
        let numInvocations = 0;
        const fn = (x: number) => { numInvocations++; return x + 1; };

        const result = mapSuccess(fn, succeededResult(1));
        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual(2);
        expect(numInvocations).toEqual(1);
    });
});


describe("mapError()", () => {
    it("with successful input the value is passed along and the function is not invoked", () => {
        let numInvocations = 0;
        const fn = (errMsg: string) => { numInvocations++; return `Error: ${errMsg}`; };

        const result = mapError(fn, succeededResult(1));
        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual(1);
        expect(numInvocations).toEqual(0);
    });


    it("with failed input the function is invoked and its result is wrapped in a failed Result", () => {
        let numInvocations = 0;
        const fn = (errMsg: string) => { numInvocations++; return `Error: ${errMsg}`; };

        const result = mapError(fn, failedResult("fake error message"));
        expect(failed(result)).toBeTruthy();
        expect(result.error).toEqual("Error: fake error message");
        expect(numInvocations).toEqual(1);
    });
});


describe("mapWhileSuccessful()", () => {

    it("returns a successful result with the mapped array when all succeed", () => {
        const arr = [1, 2, 3, 4, 5];
        const squareWithMaxOfFifty = (n: number) => {
            const square = n * n;
            return square < 50 ?
                succeededResult(square) :
                failedResult(`The square of ${n} exceeds the maximum.`);
        };

        const mapRes = mapWhileSuccessful(arr, squareWithMaxOfFifty);
        expect(succeeded(mapRes)).toBeTruthy();
        expect(mapRes.value).toEqual([1, 4, 9, 16, 25]);
    });


    it("returns a failure result with the first failure", () => {
        const arr = [5, 6, 7, 8, 9];
        const squareWithMaxOfFifty = (n: number) => {
            const square = n * n;
            return square < 50 ?
                succeededResult(square) :
                failedResult(`The square of ${n} exceeds the maximum.`);
        };

        const mapRes = mapWhileSuccessful(arr, squareWithMaxOfFifty);
        expect(succeeded(mapRes)).toBeFalsy();
        expect(mapRes.error).toEqual("The square of 8 exceeds the maximum.");
    });


    it("invokes the mapping function once for each success and once for the first failure", () => {
        let numFuncInvocations = 0;
        const arr = [5, 6, 7, 8, 9];
        const squareWithMaxOfFifty = (n: number) => {
            numFuncInvocations++;
            const square = n * n;
            return square < 50 ?
                succeededResult(square) :
                failedResult(`The square of ${n} exceeds the maximum.`);
        };

        const mapRes = mapWhileSuccessful(arr, squareWithMaxOfFifty);
        expect(succeeded(mapRes)).toBeFalsy();
        expect(numFuncInvocations).toEqual(4);
    });


    it("adds each result value to the returned array even when they are arrays", () => {
        const inputs = [1, 2, 3];
        const mapFn = (curInt: number): Result<[number, number], string> => {
            return succeededResult([curInt, curInt + 1]);
        };
        const result = mapWhileSuccessful(inputs, mapFn);
        expect(succeeded(result)).toBeTrue();
        expect(result.value!).toEqual([[1, 2], [2, 3], [3, 4]]);
    });

});


describe("pare()", () => {

    it("when given successful results, returns an array of their values", () => {
        const results = [
            succeededResult(10),
            succeededResult(20),
            succeededResult(30)
        ];
        expect(pare(results)).toEqual(succeededResult([10, 20, 30]));
    });


    it("when given successful results of different types, returns an array of their values", () => {
        const results = [
            succeededResult(10),
            succeededResult(20),
            succeededResult(undefined)
        ];
        expect(pare(results)).toEqual(succeededResult([10, 20, undefined]));
    });


    it("when given a collection containing failures, returns the first failure", () => {
        const results = [
            succeededResult(10),
            succeededResult(20),
            failedResult("Error msg")
        ];
        expect(pare(results)).toEqual(failedResult("Error msg"));
    });

});


describe("executeWhileSuccessful()", () => {
    it("returns a successful result with typed array elements when all functions succeed", () => {
        function boolResultFn(): Result<boolean, string> {
            return succeededResult(true);
        }

        function stringResultFn(): Result<string, string> {
            return succeededResult("xyzzy");
        }

        function numberResultFn(): Result<number, string> {
            return succeededResult(5);
        }

        const result = executeWhileSuccessful(
            boolResultFn,
            stringResultFn,
            numberResultFn
        );

        // The TS compiler knows the individual types for each array/tuple
        // element. You can verify this by hovering over the following variables
        // and checking their type.
        const [boolVal, strVal, numVal] = result.value!;
        expect(boolVal).toEqual(true);
        expect(strVal).toEqual("xyzzy");
        expect(numVal).toEqual(5);
    });
});


describe("boolToResult()", () => {
    it("returns a Result wrapping the truty value when the condition is truthy", () => {
        const result = boolToResult(1, "yes", "no");
        expect(succeeded(result)).toBeTrue();
        expect(result.value).toEqual("yes");
    });


    it("returns a Result wrapping the falsy value when the condition is falsy", () => {
        const result = boolToResult(0, "yes", "no");
        expect(failed(result)).toBeTrue();
        expect(result.error).toEqual("no");
    });
});
