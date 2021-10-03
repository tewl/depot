import {stat, Stats} from "fs";
import {EventEmitter} from "events";
import {promisifyN, promisify1, promisify2, sequence, getTimerPromise, retry,
        retryWhile, promiseWhile, eventToPromise, conditionalTask, sequentialSettle,
        delaySettle, mapAsync, zipWithAsyncValues, filterAsync, removeAsync, partitionAsync} from "./promiseHelpers";


describe("promisifyN()", () => {


    it("will invoke the wrapped function and provide a successful result", (done) => {
        const promisifiedStat = promisifyN<Stats>(stat);
        promisifiedStat(__filename)
        .then((stats: Stats) => {
            expect(stats).toBeTruthy();
            expect(stats.size).toBeGreaterThan(0);
            done();
        });
    });


    it("will reject with the expected error object", (done) => {
        const promisifiedStat = promisifyN<Stats>(stat);
        promisifiedStat("a_file_that_does_not_exist.txt")
        .catch((err) => {
            expect(err.toString()).toContain("ENOENT");
            done();
        });
    });


});


describe("promisify1()", () => {


    it("will invoke the wrapped function and provide a successful result", (done) => {
        const promisifiedStat = promisify1<Stats, string>(stat);

        promisifiedStat(__filename)
        .then((stats: Stats) => {
            expect(stats).toBeTruthy();
            expect(stats.size).toBeGreaterThan(0);
            done();
        });
    });


    it("will reject with the expected error object", (done) => {
        const promisifiedStat = promisify1<Stats, string>(stat);
        promisifiedStat("a_file_that_does_not_exist.txt")
        .catch((err) => {
            expect(err.toString()).toContain("ENOENT");
            done();
        });
    });


});


describe("promisify2()", () => {


    it("will invoke the wrapped function and provide a successful result", (done) => {

        const nodeFunc = (param1: string, param2: number, cb: (err: unknown, result?: number) => void) => {
            // This function always succeeds.
            cb(undefined, param1.length + param2);
        };

        const promisifiedFunc = promisify2<number, string, number>(nodeFunc);

        promisifiedFunc("foo", 4)
        .then((result: number) => {
            expect(result).toEqual(7);
            done();
        });
    });


    it("will reject with the expected error object", (done) => {
        const nodeFunc = (param1: string, param2: number, cb: (err: unknown, result?: number) => void) => {
            // This function always succeeds.
            cb("Error: xyzzy");
        };

        const promisifiedFunc = promisify2<number, string, number>(nodeFunc);
        promisifiedFunc("foo", 4)
        .catch((err) => {
            expect(err.toString()).toContain("xyzzy");
            done();
        });
    });


});


describe("sequence()", () => {


    it("should execute the functions in order", (done) => {

        const tasks: Array<(previousValue: number) => Promise<number>> = [
            (previousResult) => {
                expect(previousResult).toEqual(100);
                return Promise.resolve(200);
            },
            (previousResult) => {
                expect(previousResult).toEqual(200);
                return Promise.resolve(300);
            },
            (previousResult) => {
                expect(previousResult).toEqual(300);
                return Promise.resolve(400);
            }
        ];

        sequence(tasks, 100)
        .then((result) => {
            expect(result).toEqual(400);
            done();
        });

    });


    it("will wrap the returned values in a Promise if the functions do not", (done) => {
        const tasks: Array<(previousValue: number) => number> = [
            (previousResult) => {
                expect(previousResult).toEqual(100);
                return 200;
            },
            (previousResult) => {
                expect(previousResult).toEqual(200);
                return 300;
            },
            (previousResult) => {
                expect(previousResult).toEqual(300);
                return 400;
            }
        ];

        sequence(tasks, 100)
        .then((result) => {
            expect(result).toEqual(400);
            done();
        });
    });


    it("will reject the returned promise whenever a function throws", (done) => {
        const tasks: Array<(previousValue: number) => number> = [
            (previousResult: number): number => {
                expect(previousResult).toEqual(100);
                return 200;
            },
            (previousResult: number): number => {
                expect(previousResult).toEqual(200);
                if (previousResult === 200) {
                    throw new Error("error message");
                }
                return 300;
            },
            (): number => {
                expect(false).toBeTruthy();  // This line should never be executed
                return 400;
            }
        ];

        sequence(tasks, 100)
        .then(() => {
            expect(false).toBeTruthy();  // This line should never be executed
        })
        .catch((err) => {
            expect(err.message).toEqual("error message");
            done();
        });


    });


});


describe("getTimerPromise()", () => {


    it("should resolve after the specified amount of time", (done) => {
        const start = Date.now();
        const delayMs = 200;

        getTimerPromise(delayMs, "foo")
        .then((val) => {
            expect(val).toEqual("foo");
            expect(Date.now()).toBeGreaterThanOrEqual(start + delayMs);
            done();
        });
    });


});


describe("conditionalTask", () => {


    it("will run the task when the condition is truthy", (done) => {

        let taskWasRun = false;
        const task = () => {
            taskWasRun = true;
            return Promise.resolve(5);
        };

        conditionalTask(true, task, 10)
        .then((result) => {
            expect(result).toEqual(5);
            expect(taskWasRun).toEqual(true);
            done();
        });

    });


    it("will not run the task when the condition is falsy", (done) => {

        let taskWasRun = false;
        const task = () => {
            taskWasRun = true;
            return Promise.resolve(5);
        };

        conditionalTask(false, task, 10)
        .then((result) => {
            expect(result).toEqual(10);
            expect(taskWasRun).toEqual(false);
            done();
        });

    });


});


describe("eventToPromise()", () => {

    const ee = new EventEmitter();


    it("will resolve with the resolve event's payload", (done) => {
        eventToPromise(ee, "resolve", "reject")
        .then((result) => {
            expect(result).toEqual(5);
            done();
        });

        ee.emit("resolve", 5);
    });


    it("once resolved, there will be no listeners", (done) => {
        eventToPromise(ee, "resolve", "reject")
        .then(() => {
            expect(ee.listenerCount("resolve")).toEqual(0);
            expect(ee.listenerCount("reject")).toEqual(0);
            done();
        });

        ee.emit("resolve", 5);
    });


    it("other events will not cause the returned promise to resolve or reject", (done) => {
        let promiseResolved = false;
        let promiseRejected = false;
        eventToPromise(ee, "resolve", "reject")
        .then(
            () => {
                promiseResolved = true;
            },
            () => {
                promiseRejected = true;
            }
        );

        ee.emit("other", 5);
        getTimerPromise(10, 0)
        .then(() => {
            expect(promiseResolved).toEqual(false);
            expect(promiseRejected).toEqual(false);
            done();
        });
    });


    it("will reject with the reject event's payload", (done) => {
        eventToPromise(ee, "resolve", "reject")
        .catch((err) => {
            expect(err).toEqual("error message");
            done();
        });

        ee.emit("reject", "error message");
    });


    it("once rejected, there will be no listeners", (done) => {
        eventToPromise(ee, "resolve", "reject")
        .catch(() => {
            expect(ee.listenerCount("resolve")).toEqual(0);
            expect(ee.listenerCount("reject")).toEqual(0);
            done();
        });

        ee.emit("reject", "error message");
    });


});


describe("retry()", () => {


    it("should resolve if the given function eventually succeeds", (done) => {
        const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(2, "foo", "rejected");

        retry(theFunc, 3)
        .then(
            (val) => {
                expect(val).toEqual("foo");
                done();
            },
            () => {
                fail("The promise should not have rejected.");
            }
        );
    });


    it("should reject if the given function never succeeds", (done) => {
        const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(5, "bar", "rejected");

        retry(theFunc, 3)
        .then(
            () => {
                fail("The promise should not have resolved.");
            },
            (err) => {
                expect(err).toEqual("rejected");
                done();
            }
        );
    });


});


/**
 * A factory that returns a function that returns a promise. The first n times
 * the function is called, it will return a rejected promise.  After that, it
 * will return resolved promises.
 *
 * @param numFailures - The number of times the returned function
 * should return a rejected promise.
 *
 * @param resolveValue - The value that the returned promise will be
 * resolved with
 *
 * @param rejectValue - The value that the returned promise will reject with
 *
 * @returns A function that will return a rejected promise the first n times it
 * is called.
 */
function getFuncThatWillRejectNTimes<T, U>(numFailures: number, resolveValue: T, rejectValue: U): () => Promise<T> {
    "use strict";

    let numFailuresRemaining: number = numFailures;

    return () => {
        if (numFailuresRemaining > 0) {
            --numFailuresRemaining;
            return Promise.reject(rejectValue);
        }
        return Promise.resolve(resolveValue);
    };
}


describe("retryWhile()", () => {


    it("will reject immediately if the while predicate says to stop trying", (done) => {
        const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(5, "bar", "rejected");

        retryWhile(theFunc, () => false, 1000)
        .then(
            () => {
                fail("The promise should not have resolved.");
            },
            (err) => {
                expect(err).toEqual("rejected");
                done();
            }
        );
    });


    it("will eventually resolve if the while predicate always returns true", (done) => {
        const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(5, "bar", "rejected");

        retryWhile(
            theFunc,
            (err) => {
                expect(err).toEqual("rejected");
                return true;
            },
            1000
        )
        .then(
            (value) => {
                expect(value).toEqual("bar");
                done();
            },
            () => {
                fail("The promise should not have rejected.");
            }
        );
    });


});


describe("promiseWhile()", () => {


    it("will loop until the predicate returns false", (done) => {
        let val = "";
        promiseWhile(
            () => {
                return val.length < 5;
            },
            () => {
                return new Promise<void>((resolve: () => void) => {
                    setTimeout(
                        () => {
                            val = val + "a";
                            resolve();
                        },
                        0
                    );
                });
            }
        ).then(() => {
            expect(val).toEqual("aaaaa");
            done();
        });
    });


    it("the returned promise will reject with the same error the body function rejects with", (done) => {
        let val = "";
        promiseWhile(
            (): boolean => val.length < 5,
            (): Promise<void> => {
                return new Promise<void>((resolve, reject) => {
                    setTimeout(
                        () => {
                            if (val === "aaa")
                            {
                                reject("xyzzy");
                                return;
                            }

                            val = val + "a";
                            resolve();
                        },
                        0
                    );
                });
            }
        )
        .catch((err) => {
            expect(err).toEqual("xyzzy");
            done();
        });
    });


});


describe("sequentialSettle()", () => {


    it("will return an array of promises that settle in index order", (done) => {

        const settledFlags = [false, false, false];

        let promises: Array<Promise<number>> = [
            getTimerPromise<number>(400, 1),
            getTimerPromise<number>(200, 2),
            getTimerPromise<number>(100, 3)
        ];

        promises = sequentialSettle(promises);
        promises[0].then(() => { settledFlags[0] = true; });
        promises[1].then(() => { settledFlags[1] = true; });
        promises[2].then(() => { settledFlags[2] = true; });

        promises[0]
        .then(() => {
            expect(settledFlags[1]).toBeFalsy();
            expect(settledFlags[2]).toBeFalsy();
        });

        promises[1]
        .then(() => {
            expect(settledFlags[0]).toBeTruthy();
            expect(settledFlags[2]).toBeFalsy();
        });

        promises[2]
        .then(() => {
            expect(settledFlags[0]).toBeTruthy();
            expect(settledFlags[1]).toBeTruthy();
            done();
        });
    });


});



describe("delaySettle()", () => {


    it("should delay a resolved Promise until the specified Promise is resolved", (done) => {

        // The order in which these promises will settle:  p2, p1, p2Delayed
        const p1 = getTimerPromise(400, 1);
        const p2 = getTimerPromise(100, 2);
        const p2Delayed = delaySettle(p2, p1);

        let p1State        = "pending";
        let p2State        = "pending";
        let p2DelayedState = "pending";

        p1.then(() => { p1State = "resolved"; });
        p2.then(() => { p2State = "resolved"; });
        p2Delayed.then(() => { p2DelayedState = "resolved"; });

        p2.then(() => {
            expect(p1State).toEqual("pending");
            expect(p2DelayedState).toEqual("pending");
        });

        p1.then(() => {
            expect(p2State).toEqual("resolved");
            expect(p2DelayedState).toEqual("pending");
        });

        p2Delayed.then(() => {
            expect(p1State).toEqual("resolved");
            expect(p2State).toEqual("resolved");
            done();
        });
    });


    it("should delay a resolved Promise until the specified Promise is rejected", (done) => {

        // Expected settle order: p2 (resolved with 2), p1 (rejected), p2Delayed (resolved with 2).
        const p1 = getTimerPromise(400, 1)
        .then(() => {
            throw new Error("rejected");
        });
        const p2 = getTimerPromise(100, 2);
        const p2Delayed = delaySettle(p2, p1);

        let p1State        = "pending";
        let p2State        = "pending";
        let p2DelayedState = "pending";

        p1.then(
            () => { p1State = "resolved"; },
            () => { p1State = "rejected"; }
        );

        p2.then(
            () => { p2State = "resolved"; },
            () => { p2State = "rejected"; }
        );

        p2Delayed.then(
            () => { p2DelayedState = "resolved"; },
            () => { p2DelayedState = "rejected"; }
        );

        p2
        .then(() => {
            expect(p1State).toEqual("pending");
            expect(p2DelayedState).toEqual("pending");
        })
        .catch(() => {
            fail("p2 should not have rejected.");
        });

        p1
        .then(() => {
            fail("p1 should not have resolved.");
        })
        .catch(() => {
            expect(p2State).toEqual("resolved");
            expect(p2DelayedState).toEqual("pending");
        });

        p2Delayed
        .then(() => {
            expect(p1State).toEqual("rejected");
            expect(p2State).toEqual("resolved");
            done();
        })
        .catch(() => {
            fail("p2Delayed should not have rejected.");
        });
    });


    it("should delay a rejected Promise until the specified Promise is resolved", (done) => {
        // Expected settle order: p2 (rejected), p1 (resolved), p2Delayed (rejected).
        const p1 = getTimerPromise(400, 1);
        const p2 = getTimerPromise(100, 2)
        .then(() => {
            throw new Error("rejected");
        });
        const p2Delayed = delaySettle(p2, p1);

        let p1State = "pending";
        let p2State = "pending";
        let p2DelayedState = "pending";

        p1.then(
            () => { p1State = "resolved"; },
            () => { p1State = "rejected"; }
        );
        p2.then(
            () => { p2State = "resolved"; },
            () => { p2State = "rejected"; }
        );
        p2Delayed.then(
            () => { p2DelayedState = "resolved"; },
            () => { p2DelayedState = "rejected"; }
        );

        p2
        .then(() => {
            fail("p2 should never resolve");
        })
        .catch(() => {
            // p1 is not settled
            expect(p1State).toEqual("pending");

            // p2Delayed is not settled
            expect(p2DelayedState).toEqual("pending");
        });

        p1
        .then(() => {
            // p2 is rejected
            expect(p2State).toEqual("rejected");

            // p2Delayed is not settled
            expect(p2DelayedState).toEqual("pending");
        });

        p2Delayed
        .then(() => {
            fail("p2Delayed should not resolve");
        })
        .catch(() => {
            // p1 is resolved
            expect(p1State).toEqual("resolved");

            // p2 is rejected
            expect(p2State).toEqual("rejected");

            done();
        });
    });


    it("should delay a rejected Promise until the specified Promise is rejected", (done) => {

        // Expected settle order: p2 (rejected), p1 (rejected), p2Delayed (rejected)
        const p1: Promise<number> = getTimerPromise(400, 1)
        .then(() => {
            throw new Error("rejected");
        });
        const p2: Promise<number> = getTimerPromise(100, 2)
        .then(() => {
            throw new Error("rejected");
        });
        const p2Delayed: Promise<number> = delaySettle(p2, p1);

        let p1State        = "pending";
        let p2State        = "pending";
        let p2DelayedState = "pending";

        p1.then(
            () => { p1State = "resolved"; },
            () => { p1State = "rejected"; }
        );

        p2.then(
            () => { p2State = "resolved"; },
            () => { p2State = "rejected"; }
        );

        p2Delayed.then(
            () => { p2DelayedState = "resolved"; },
            () => { p2DelayedState = "rejected"; }
        );

        p2
        .then(() => {
            fail("p2 should never resolve");
        })
        .catch(() => {
            // p1 is not settled
            expect(p1State).toEqual("pending");

            // p2 is not settled
            expect(p2DelayedState).toEqual("pending");
        });

        p1
        .then(() => {
            fail("p1 should never resolve.");
        })
        .catch(() => {
            // p2 is rejected
            expect(p2State).toEqual("rejected");

            // p2Delayed is not settled
            expect(p2DelayedState).toEqual("pending");
        });

        p2Delayed
        .then(() => {
            fail("p2Delayed should not resolve");
        })
        .catch(() => {
            // p1 is rejected
            expect(p1State).toEqual("rejected");

            // p2 is rejected
            expect(p2State).toEqual("rejected");

            done();
        });
    });


});


describe("mapAsync()", () =>
{

    it("will resolve with the expected values when all async values are successfully gotten.", async () =>
    {
        const src = [10, 30, 15];

        const mappedValues = await mapAsync(src, (curNum) =>
        {
            return getTimerPromise(curNum, curNum + 1);
        });

        expect(mappedValues.length).toEqual(3);
        expect(mappedValues[0]).toEqual(11);
        expect(mappedValues[1]).toEqual(31);
        expect(mappedValues[2]).toEqual(16);
    });


    it("will reject if obtaining any of the asynchronous values rejects", (done) =>
    {
        const src = [10, 31, 16];

        const valueFunc = (curNum: number): Promise<number> =>
        {
            if (curNum % 2 === 0)
            {
                return getTimerPromise(curNum, curNum + 1);
            }
            else
            {
                return getTimerPromise(curNum, true)
                .then(() =>
                {
                    throw new Error(`${curNum} rejected.`);
                });
            }
        };

        mapAsync(src, valueFunc)
        .catch((err) =>
        {
            expect(err.message).toEqual("31 rejected.");
            done();
        });
    });
});


describe("zipWithAsyncValues()", () => {

    it("will resolve with the expected tuples when all async values are successfully gotten.", async () => {
        const src = [10, 30, 15];

        const pairs = await zipWithAsyncValues(src, (curNum) => {
            return getTimerPromise(curNum, curNum + 1);
        });

        expect(pairs[0]).toEqual([10, 11]);
        expect(pairs[1]).toEqual([30, 31]);
        expect(pairs[2]).toEqual([15, 16]);
    });


    it("will reject if obtaining any of the asynchronous values rejects", (done) =>
    {
        const src = [10, 31, 16];

        const valueFunc = (curNum: number): Promise<number> =>
        {
            if (curNum % 2 === 0)
            {
                return getTimerPromise(curNum, curNum + 1);
            }
            else
            {
                return getTimerPromise(curNum, true)
                .then(() =>
                {
                    throw new Error(`${curNum} rejected.`);
                });
            }
        };

        zipWithAsyncValues(src, valueFunc)
        .catch((err) =>
        {
            expect(err.message).toEqual("31 rejected.");
            done();
        });
    });
});


describe("filterAsync", () => {

    it("will include values with truthy async values", async () => {
        const src = [10, 31, 16];

        const asyncIsEven = (curNum: number): Promise<boolean> =>
        {
            return getTimerPromise(curNum, curNum % 2 === 0);
        };

        const result = await filterAsync(src, asyncIsEven);
        expect(result[0]).toEqual(10);
        expect(result[1]).toEqual(16);
    });


    it("will reject if any of the async predicate invocations rejects", (done) =>
    {
        const src = [10, 31, 16];

        const asyncRejectIfOdd = async (curNum: number): Promise<boolean> =>
        {
            await getTimerPromise(curNum, curNum);

            if (curNum % 2 === 0) {
                return true;
            }
            else {
                throw new Error(`${curNum} rejected.`);
            }
        };

        filterAsync(src, asyncRejectIfOdd)
        .catch((err) =>
        {
            expect(err.message).toEqual("31 rejected.");
            done();
        });
    });

});


describe("partitionAsync", () =>
{

    it("will separate values based on the result of the async predicate", async () =>
    {
        const src = [10, 31, 16];

        const asyncIsEven = (curNum: number): Promise<boolean> =>
        {
            return getTimerPromise(curNum, curNum % 2 === 0);
        };

        const [evens, odds] = await partitionAsync(src, asyncIsEven);
        expect(evens.length).toEqual(2);
        expect(evens[0]).toEqual(10);
        expect(evens[1]).toEqual(16);

        expect(odds.length).toEqual(1);
        expect(odds[0]).toEqual(31);
    });


    it("will reject if any of the async predicate invocations rejects", (done) =>
    {
        const src = [10, 31, 16];

        const asyncRejectIfOdd = async (curNum: number): Promise<boolean> =>
        {
            await getTimerPromise(curNum, curNum);

            if (curNum % 2 === 0)
            {
                return true;
            }
            else
            {
                throw new Error(`${curNum} rejected.`);
            }
        };

        partitionAsync(src, asyncRejectIfOdd)
        .catch((err) =>
        {
            expect(err.message).toEqual("31 rejected.");
            done();
        });
    });

});



describe("removeAsync", () =>
{

    it("will remove values for which the async predicate resolves truthy", async () =>
    {
        const src = [10, 31, 16];

        const asyncIsOdd = (curNum: number): Promise<boolean> =>
        {
            return getTimerPromise(curNum, curNum % 2 === 1);
        };

        const removed = await removeAsync(src, asyncIsOdd);
        expect(removed.length).toEqual(1);
        expect(removed[0]).toEqual(31);

        expect(src.length).toEqual(2);
        expect(src[0]).toEqual(10);
        expect(src[1]).toEqual(16);
    });


    it("will reject if any of the async predicate invocations rejects", (done) =>
    {
        const src = [10, 31, 16];

        const asyncRejectIfOdd = async (curNum: number): Promise<boolean> =>
        {
            await getTimerPromise(curNum, curNum);

            if (curNum % 2 === 0)
            {
                return true;
            }
            else
            {
                throw new Error(`${curNum} rejected.`);
            }
        };

        removeAsync(src, asyncRejectIfOdd)
        .catch((err) =>
        {
            expect(err.message).toEqual("31 rejected.");
            // `src` should be unmodified.
            expect(src.length).toEqual(3);
            done();
        });
    });

});
