import * as promiseResult from "./promiseResult";
import { getTimerPromise } from "./promiseHelpers";
import { failed, failedResult, succeeded, succeededResult } from "./result";

describe("all()", () =>
{
    it("when all are successful, the returned promise resolves with a Result containing an array of all the successful values", async () =>
    {
        const op1 = async () => getTimerPromise(25, succeededResult(25));
        const op2 = async () => getTimerPromise(50, succeededResult(50));
        const op3 = async () => getTimerPromise(75, succeededResult(75));

        const result = await promiseResult.all(op1(), op2(), op3());
        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual([25, 50, 75]);
    });


    it("when one result fails, the returned promise resolves with a Result containing the first error", async () =>
    {
        const op1 = async () => getTimerPromise(25, succeededResult(25));
        const op2 = async () => getTimerPromise(50, failedResult("Error 1"));
        const op3 = async () => getTimerPromise(75, succeededResult(75));

        const result = await promiseResult.all(op1(), op2(), op3());
        expect(failed(result)).toBeTruthy();
        expect(result.error).toEqual("Error 1");
    });


    it("when one result fails, the returned promise resolves *immediately* with the failure", async () =>
    {
        const op1 = async () => getTimerPromise(25, succeededResult(25));
        const op2 = async () => getTimerPromise(50, failedResult("Error 1"));
        const op3 = async () => getTimerPromise(75, succeededResult(75));

        const startTime = Date.now();
        const result = await promiseResult.all(op1(), op2(), op3());
        const resolveTime = Date.now();
        expect(resolveTime - startTime).toBeGreaterThanOrEqual(50);
        expect(resolveTime - startTime).toBeLessThanOrEqual(70);
    });
});
