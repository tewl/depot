import { failedResult, succeeded, succeededResult } from "./result";
import { mapWhileSuccessful } from "./resultHelpers";

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


    it("returns a failure result with the first failure", () =>
    {
        const arr = [5, 6, 7, 8, 9];
        const squareWithMaxOfFifty = (n: number) =>
        {
            const square = n * n;
            return square < 50 ?
                succeededResult(square) :
                failedResult(`The square of ${n} exceeds the maximum.`);
        };

        const mapRes = mapWhileSuccessful(arr, squareWithMaxOfFifty);
        expect(succeeded(mapRes)).toBeFalsy();
        expect(mapRes.error).toEqual("The square of 8 exceeds the maximum.");
    });


    it("invokes the mapping function once for each success and once for the first failure", () =>
    {
        let numFuncInvocations = 0;
        const arr = [5, 6, 7, 8, 9];
        const squareWithMaxOfFifty = (n: number) =>
        {
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


});
