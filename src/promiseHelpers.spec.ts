import {stat, Stats} from "fs";
import {EventEmitter} from "events";
import {promisifyN, promisify1, promisify2, sequence, getTimerPromise, retry,
    retryWhile, promiseWhile, eventToPromise, conditionalTask} from "./promiseHelpers";
import * as BBPromise from "bluebird";


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
        .catch((err: any) => {
            expect(err.toString()).toContain("ENOENT");
            done();
        });
    });


});


describe("promisify1()", () => {


    it("will invoke the wrapped function and provide a successful result", (done) => {
        const promisifiedStat = promisify1/*<Stats, string>*/(stat);

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
        .catch((err: any) => {
            expect(err.toString()).toContain("ENOENT");
            done();
        });
    });


});


describe("promisify2()", () => {


    it("will invoke the wrapped function and provide a successful result", (done) => {

        const nodeFunc = (param1: string, param2: number, cb: (err: any, result?: number) => void) => {
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
        const nodeFunc = (param1: string, param2: number, cb: (err: any, result?: number) => void) => {
            // This function always succeeds.
            cb("Error: xyzzy");
        };

        const promisifiedFunc = promisify2<number, string, number>(nodeFunc);
        promisifiedFunc("foo", 4)
        .catch((err: any) => {
            expect(err.toString()).toContain("xyzzy");
            done();
        });
    });


});


describe("sequence()", () => {


    it("should execute the functions in order", (done) => {

        const tasks: Array<(previousValue: any) => Promise<any>> = [
            (previousResult) => {
                expect(previousResult).toEqual(100);
                return BBPromise.resolve(200);
            },
            (previousResult) => {
                expect(previousResult).toEqual(200);
                return BBPromise.resolve(300);
            },
            (previousResult) => {
                expect(previousResult).toEqual(300);
                return BBPromise.resolve(400);
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
        const start: number = Date.now();
        const delayMs: number = 200;

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
            return BBPromise.resolve(5);
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
            return BBPromise.resolve(5);
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
            (err: any) => {
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
 * @param {number} numFailures - The number of times the returned function
 * should return a rejected promise.
 *
 * @param {T} resolveValue - The value that the returned promise will be
 * resolved with
 *
 * @param {U} rejectValue - The value that the returned promise will reject with
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
            return BBPromise.reject(rejectValue);
        }
        return BBPromise.resolve(resolveValue);
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
            (err: any) => {
                expect(err).toEqual("rejected");
                done();
            }
        );
    });


    it("will eventually resolve if the while predicate always returns true", (done) => {
        const theFunc: () => Promise<string> = getFuncThatWillRejectNTimes(5, "bar", "rejected");

        retryWhile(
            theFunc,
            (err: string) => {
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
            (/*err: any*/) => {
                fail("The promise should not have rejected.");
            }
        );
    });


});


describe("promiseWhile()", () => {


    it("will loop until the predicate returns false", (done) => {
        let val: string = "";
        promiseWhile(
            () => {
                return val.length < 5;
            },
            () => {
                return new BBPromise<void>((resolve: () => void/*, reject: () => void*/) => {
                    setTimeout(
                        () => {
                            val = val + "a";
                            resolve();
                        },
                        0);
                });
            }
        ).then(() => {
            expect(val).toEqual("aaaaa");
            done();
        });
    });


    it("the returned promise will reject with the same error the body function rejects with", (done) => {
        let val: string = "";
        promiseWhile(
            () => val.length < 5,
            () => {
                return new BBPromise<void>((resolve, reject) => {
                    setTimeout(
                        () => {
                            if (val === "aaa") {
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
