import * as promiseResult from "./promiseResult";
import { getTimerPromise } from "./promiseHelpers";
import { FailedResult, SucceededResult } from "./result";


describe("toPromise()", () => {
    it("when given an error result returns a rejected promise", async () => {
        const pr = Promise.resolve(new FailedResult("error message"));
        try {
            const val = await promiseResult.toPromise(pr);
            expect(false).toBeTruthy();
        }
        catch (error) {
            expect(error).toEqual("error message");
        }
    });


    it("when given a successful result returns a resolved promise", async () => {
        const pr = Promise.resolve(new SucceededResult("success value"));
        try {
            const val = await promiseResult.toPromise(pr);
            expect(val).toEqual("success value");
        }
        catch (error) {
            expect(false).toBeTruthy();
        }
    });
});


describe("all()", () => {
    it("when all are successful, the returned promise resolves with a Result containing an array of all the successful values", async () => {
        const op1 = () => getTimerPromise(25, new SucceededResult(25));
        const op2 = () => getTimerPromise(50, new SucceededResult(50));
        const op3 = () => getTimerPromise(75, new SucceededResult(75));

        const result = await promiseResult.all(op1(), op2(), op3());
        expect(result.succeeded).toBeTruthy();
        expect(result.value).toEqual([25, 50, 75]);
    });


    it("when one result fails, the returned promise resolves with a Result containing the index of the item that failed and its error", async () => {
        const op1 = () => getTimerPromise(25, new SucceededResult(25));
        const op2 = () => getTimerPromise(50, new FailedResult("Error 1"));
        const op3 = () => getTimerPromise(75, new SucceededResult(75));

        const result = await promiseResult.all(op1(), op2(), op3());
        expect(result.failed).toBeTruthy();
        expect(result.error!.index).toEqual(1);
        expect(result.error!.item).toEqual("Error 1");
    });


    it("when one result fails, the returned promise resolves *immediately* with the failure", async () => {
        const op1 = () => getTimerPromise(25, new SucceededResult(25));
        const op2 = () => getTimerPromise(50, new FailedResult("Error 1"));
        const op3 = () => getTimerPromise(75, new SucceededResult(75));

        const startTime = Date.now();
        const result = await promiseResult.all(op1(), op2(), op3());
        const resolveTime = Date.now();
        expect(resolveTime - startTime).toBeGreaterThanOrEqual(50);
        expect(resolveTime - startTime).toBeLessThanOrEqual(70);
    });
});
