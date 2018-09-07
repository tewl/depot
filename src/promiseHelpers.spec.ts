import {stat, Stats} from "fs";
import {promisifyN, promisify1, promisify2, sequence} from "./promiseHelpers";
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

