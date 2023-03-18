import * as promiseResult from "./promiseResult";
import { getTimerPromise } from "./promiseHelpers";
import { FailedResult, SucceededResult } from "./result";
import { pipeAsync } from "./pipeAsync";


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


describe("fromPromise()", () => {

    it("when the Promise resolves a successful Result is returned", async () => {
        const res = await promiseResult.fromPromise(Promise.resolve(5));
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(5);
    });


    it("when the Promise rejects a failure Result with a string is returned", async () => {
        const res = await promiseResult.fromPromise(Promise.reject(new Error("error message")));
        expect(res.failed).toBeTrue();
        expect(res.error).toEqual("error message");
    });

});


describe("fromPromiseWith()", () => {

    const errorMapper = (err: unknown) => {
        return typeof err === "string" ? new Error(`Error: ${err}`) : new Error("unknown error");
    };


    it("when the Promise resolves a successful Result is returned", async () => {
        const res = await promiseResult.fromPromiseWith(Promise.resolve(19), errorMapper);
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(19);
    });


    it("when the Promise rejects a failure Result with a mapped value is returned", async () => {
        const res = await promiseResult.fromPromiseWith(Promise.reject("error 37"), errorMapper);
        expect(res.failed).toBeTrue();
        expect(res.error).toBeInstanceOf(Error);
        expect(res.error!.message).toEqual("Error: error 37");
    });

});



describe("allM()", () => {
    it("when all are successful, the returned promise resolves with a Result containing an array of all the successful values", async () => {
        const op1 = () => getTimerPromise(25, new SucceededResult(25));
        const op2 = () => getTimerPromise(50, new SucceededResult(50));
        const op3 = () => getTimerPromise(75, new SucceededResult(75));

        const result = await promiseResult.allM(op1(), op2(), op3());
        expect(result.succeeded).toBeTruthy();
        expect(result.value).toEqual([25, 50, 75]);
    });


    it("works with an input array of one element", async () => {
        const result = await promiseResult.allM(
            getTimerPromise(25, new SucceededResult(25))
        );
        expect(result.succeeded).toBeTruthy();
        expect(result.value).toEqual([25]);
    });


    it("when one result fails, the returned promise resolves with a Result containing the index of the item that failed and its error", async () => {
        const op1 = () => getTimerPromise(25, new SucceededResult(25));
        const op2 = () => getTimerPromise(50, new FailedResult("Error 1"));
        const op3 = () => getTimerPromise(75, new SucceededResult(75));

        const result = await promiseResult.allM(op1(), op2(), op3());
        expect(result.failed).toBeTruthy();
        expect(result.error!.index).toEqual(1);
        expect(result.error!.item).toEqual("Error 1");
    });


    it("when one result fails, the returned promise resolves *immediately* with the failure", async () => {
        const op1 = () => getTimerPromise(25, new SucceededResult(25));
        const op2 = () => getTimerPromise(50, new FailedResult("Error 1"));
        const op3 = () => getTimerPromise(75, new SucceededResult(75));

        const startTime = Date.now();
        const result = await promiseResult.allM(op1(), op2(), op3());
        const resolveTime = Date.now();
        expect(resolveTime - startTime).toBeGreaterThanOrEqual(50);
        expect(resolveTime - startTime).toBeLessThanOrEqual(70);
    });
});


describe("allArrayA()", () => {

    it("when there are failures, returns IIndexedItems referencing each failure", async () => {
        const start = Date.now();

        const res = await promiseResult.allArrayA([
            getTimerPromise(5, new SucceededResult(0)),
            getTimerPromise(10, new FailedResult("error 1")),
            getTimerPromise(15, new SucceededResult(2)),
            getTimerPromise(20, new FailedResult("error 3")),
            getTimerPromise(25, new SucceededResult(4)),
            getTimerPromise(30, new FailedResult("error 5")),
            getTimerPromise(35, new SucceededResult(6))
        ]);

        const end = Date.now();

        expect(res.failed).toBeTrue();
        expect(res.error).toEqual([
            { index: 1, item: "error 1"},
            { index: 3, item: "error 3"},
            { index: 5, item: "error 5"}
        ]);
        expect(end - start).toBeGreaterThanOrEqual(35);
    });


    it("when all are successful, returns successful Result wrapping all values", async () => {
        const res = await promiseResult.allArrayA([
            getTimerPromise(5, new SucceededResult(0)),
            getTimerPromise(10, new SucceededResult(1)),
            getTimerPromise(15, new SucceededResult(2)),
            getTimerPromise(20, new SucceededResult(3)),
            getTimerPromise(25, new SucceededResult(4)),
            getTimerPromise(30, new SucceededResult(5)),
            getTimerPromise(35, new SucceededResult(6))
        ]);

        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual([0, 1, 2, 3, 4, 5, 6]);
    });

});


describe("allArrayM()", () => {

    it("resolves as soon as possible with the first failure", async () => {

        const start = Date.now();

        const res = await promiseResult.allArrayM([
            getTimerPromise(5, new SucceededResult(1)),
            getTimerPromise(15, new FailedResult("error 1")),
            getTimerPromise(40, new SucceededResult(2)),
            getTimerPromise(50, new SucceededResult(3)),
            getTimerPromise(60, new FailedResult("error 2"))
        ]);

        const end = Date.now();
        const delta = end - start;
        expect(delta).toBeGreaterThanOrEqual(10);
        expect(delta).toBeLessThanOrEqual(35);  // Saw this get as high as 27
        expect(res.failed).toBeTrue();
        expect(res.error!.index).toEqual(1);
        expect(res.error!.item).toEqual("error 1");
    });


    it("when all are successful, returns successful Result wrapping all values", async () => {
        const start = Date.now();
        const res = await promiseResult.allArrayM([
            getTimerPromise(5, new SucceededResult(1)),
            getTimerPromise(10, new SucceededResult(2)),
            getTimerPromise(15, new SucceededResult(3))
        ]);

        const end = Date.now();
        expect(end - start).toBeGreaterThanOrEqual(15);
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual([1, 2, 3]);
    });

});


describe("bind()", () => {

    it("allows the input to be a Result<>", async () => {
        const fn = (x: number) => new SucceededResult(x + 1);
        const res = await promiseResult.bind(fn, new SucceededResult(5));
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(6);
    });


    it("allows the input to be a Promise<Result<>>", async () => {
        const fn = (x: number) => Promise.resolve(new SucceededResult(x + 1));
        const res = await promiseResult.bind(fn, Promise.resolve(new SucceededResult(5)));
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(6);
    });


    it("does not invoke the function if the input is a failure", async () => {
        let numInvocations = 0;
        const fn = (x: number) => {
            numInvocations++;
            return Promise.resolve(new SucceededResult(x + 1));
        };

        const res = await promiseResult.bind(fn, new FailedResult("error"));
        expect(res.failed).toBeTrue();
        expect(numInvocations).toEqual(0);
    });


    it("works well in a pipeAsync()", async () => {
        const fn = (x: number) => Promise.resolve(new SucceededResult(x + 1));
        const res =
            await pipeAsync(Promise.resolve(new SucceededResult(5)))
            .pipe((res) => promiseResult.bind(fn, res))
            .pipe((res) => promiseResult.bind(fn, res))
            .pipe((res) => promiseResult.bind(fn, res))
            .end();
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(8);
    });


});


describe("mapError()", () => {

    it("allows the input to be a Result<>", async () => {
        const fn = (x: number) => Promise.resolve(x + 1);
        const res = await promiseResult.mapError(fn, new FailedResult(6));
        expect(res.failed).toBeTrue();
        expect(res.error).toEqual(7);
    });


    it("allows the input to be a Promise<Result<>>", async () => {
        const fn = (x: number) => Promise.resolve(x + 1);
        const res = await promiseResult.mapError(fn, Promise.resolve(new FailedResult(6)));
        expect(res.failed).toBeTrue();
        expect(res.error).toEqual(7);
    });


    it("does not invoke the function if the input is successful", async () => {
        let numInvocations = 0;
        const fn = (x: number) => {
            numInvocations++;
            return Promise.resolve(x + 1);
        };

        const res = await promiseResult.mapError(fn, new SucceededResult(3));
        expect(res.succeeded).toBeTrue();
        expect(numInvocations).toEqual(0);
    });


    it("works well with pipeAsync()", async () => {
        const fn = (x: number) => Promise.resolve(x + 1);
        const res =
            await pipeAsync(Promise.resolve(new FailedResult(5)))
            .pipe((res) => promiseResult.mapError(fn, res))
            .pipe((res) => promiseResult.mapError(fn, res))
            .pipe((res) => promiseResult.mapError(fn, res))
            .end();
        expect(res.failed).toBeTrue();
        expect(res.error).toEqual(8);
    });

});


describe("mapSuccess()", () => {

    it("allows the input to be a Result<>", async () => {
        const fn = (x: number) => Promise.resolve(x + 1);
        const res = await promiseResult.mapSuccess(fn, new SucceededResult(6));
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(7);
    });


    it("allows the input to be a Promise<Result<>>", async () => {
        const fn = (x: number) => Promise.resolve(x + 1);
        const res = await promiseResult.mapSuccess(fn, Promise.resolve(new SucceededResult(6)));
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(7);
    });


    it("does not invoke the function if the input is a failure", async () => {
        let numInvocations = 0;
        const fn = (x: number) => {
            numInvocations++;
            return Promise.resolve(x + 1);
        };

        const res = await promiseResult.mapSuccess(fn, new FailedResult("error"));
        expect(res.failed).toBeTrue();
        expect(numInvocations).toEqual(0);
    });


    it("works well with pipeAsync()", async () => {
        const fn = (x: number) => Promise.resolve(x + 1);
        const res =
            await pipeAsync(Promise.resolve(new SucceededResult(5)))
            .pipe((res) => promiseResult.mapSuccess(fn, res))
            .pipe((res) => promiseResult.mapSuccess(fn, res))
            .pipe((res) => promiseResult.mapSuccess(fn, res))
            .end();
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(8);
    });

});


describe("forceResult()", () => {

    it("When the Promise resolves with a successful Result it is returned", async () => {
        const pr = Promise.resolve(new SucceededResult(21));
        const res = await promiseResult.forceResult(pr);
        expect(res.succeeded).toBeTrue();
        expect(res.value).toEqual(21);
    });


    it("when the Promise resolves with a failure Result it is returned", async () => {
        const pr = Promise.resolve(new FailedResult("Error message 37"));
        const res = await promiseResult.forceResult(pr);
        expect(res.failed).toBeTrue();
        expect(res.error).toEqual("Error message 37");
    });


    it("when the Promise rejects a failure Result containing a string is returned", async () => {
        const pr = Promise.reject("error 34");
        const res = await promiseResult.forceResult(pr);
        expect(res.failed).toBeTrue();
        expect(res.error).toEqual("error 34");
    });


});
