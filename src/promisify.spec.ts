import { getTimerPromise } from ".";
import { promisify0, promisify1, promisify2, promisify3, promisify4, promisify5 } from "./promisify";


describe("promisify0()", () =>
{
    function fn0Resolve(cb: (err?: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(undefined, 4);
        });
    }

    function fn0Reject(cb: (err: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(new Error("error"), undefined);
        });
    }

    it("when the returned function is invoked the promise resolves with the expected value", async () =>
    {
        const promisified = promisify0(fn0Resolve);

        try
        {
            const result = await promisified();
            expect(result).toEqual(4);
        }
        catch (error)
        {
            fail("Should not have thrown.");
        }
    });


    it("when the returned function is invoke the promise rejects with the expected value", async () =>
    {
        const promisified = promisify0(fn0Reject);

        try
        {
            const result = await promisified();
            fail("Should not have resolved.");
        } catch (error)
        {
            expect((error as Error).message).toEqual("error");
        }
    });
});


describe("promisify1()", () =>
{
    function fn1Resolve(arg1: number, cb: (err?: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(undefined, arg1);
        });
    }

    function fn1Reject(arg1: number, cb: (err: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(new Error(`error - ${arg1}`), undefined);
        });
    }

    it("when the returned function is invoked the promise resolves with the expected value", async () =>
    {
        const promisified = promisify1(fn1Resolve);

        try
        {
            const result = await promisified(3);
            expect(result).toEqual(3);
        }
        catch (error)
        {
            fail("Should not have thrown.");
        }
    });


    it("when the returned function is invoke the promise rejects with the expected value", async () =>
    {
        const promisified = promisify1(fn1Reject);

        try
        {
            const result = await promisified(6);
            fail("Should not have resolved.");
        } catch (error)
        {
            expect((error as Error).message).toEqual("error - 6");
        }
    });
});


describe("promisify2()", () =>
{
    function fn2Resolve(arg1: number, arg2: number, cb: (err?: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(undefined, arg1 + arg2);
        });
    }

    function fn2Reject(arg1: number, arg2: number, cb: (err: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(new Error(`error - ${arg1}, ${arg2}`), undefined);
        });
    }

    it("when the returned function is invoked the promise resolves with the expected value", async () =>
    {
        const promisified = promisify2(fn2Resolve);

        try
        {
            const result = await promisified(2, 4);
            expect(result).toEqual(6);
        }
        catch (error)
        {
            fail("Should not have thrown.");
        }
    });


    it("when the returned function is invoke the promise rejects with the expected value", async () =>
    {
        const promisified = promisify2(fn2Reject);

        try
        {
            const result = await promisified(2, 4);
            fail("Should not have resolved.");
        } catch (error)
        {
            expect((error as Error).message).toEqual("error - 2, 4");
        }
    });
});


describe("promisify3()", () =>
{
    function fn3Resolve(arg1: number, arg2: number, arg3: number, cb: (err?: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(undefined, arg1 + arg2 + arg3);
        });
    }

    function fn3Reject(arg1: number, arg2: number, arg3: number, cb: (err: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(new Error(`error - ${arg1}, ${arg2}, ${arg3}`), undefined);
        });
    }

    it("when the returned function is invoked the promise resolves with the expected value", async () =>
    {
        const promisified = promisify3(fn3Resolve);

        try
        {
            const result = await promisified(2, 4, 1);
            expect(result).toEqual(7);
        }
        catch (error)
        {
            fail("Should not have thrown.");
        }
    });


    it("when the returned function is invoke the promise rejects with the expected value", async () =>
    {
        const promisified = promisify3(fn3Reject);

        try
        {
            const result = await promisified(2, 4, 1);
            fail("Should not have resolved.");
        } catch (error)
        {
            expect((error as Error).message).toEqual("error - 2, 4, 1");
        }
    });
});


describe("promisify4()", () =>
{
    function fn4Resolve(arg1: number, arg2: number, arg3: number, arg4: number,
                        cb: (err?: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(undefined, arg1 + arg2 + arg3 + arg4);
        });
    }

    function fn4Reject(arg1: number, arg2: number, arg3: number, arg4: number,
                       cb: (err: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(new Error(`error - ${arg1}, ${arg2}, ${arg3}, ${arg4}`), undefined);
        });
    }

    it("when the returned function is invoked the promise resolves with the expected value", async () =>
    {
        const promisified = promisify4(fn4Resolve);

        try
        {
            const result = await promisified(2, 4, 1, 4);
            expect(result).toEqual(11);
        }
        catch (error)
        {
            fail("Should not have thrown.");
        }
    });


    it("when the returned function is invoke the promise rejects with the expected value", async () =>
    {
        const promisified = promisify4(fn4Reject);

        try
        {
            const result = await promisified(2, 4, 1, 4);
            fail("Should not have resolved.");
        } catch (error)
        {
            expect((error as Error).message).toEqual("error - 2, 4, 1, 4");
        }
    });
});


describe("promisify5()", () =>
{
    function fn4Resolve(arg1: number, arg2: number, arg3: number, arg4: number, arg5: number,
                        cb: (err?: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(undefined, arg1 + arg2 + arg3 + arg4 + arg5);
        });
    }

    function fn4Reject(arg1: number, arg2: number, arg3: number, arg4: number, arg5: number,
                       cb: (err: Error, result?: number) => void): void
    {
        getTimerPromise(10, undefined)
        .then(() =>
        {
            cb(new Error(`error - ${arg1}, ${arg2}, ${arg3}, ${arg4}, ${arg5}`), undefined);
        });
    }

    it("when the returned function is invoked the promise resolves with the expected value", async () =>
    {
        const promisified = promisify5(fn4Resolve);

        try
        {
            const result = await promisified(2, 4, 1, 4, 3);
            expect(result).toEqual(14);
        }
        catch (error)
        {
            fail("Should not have thrown.");
        }
    });


    it("when the returned function is invoke the promise rejects with the expected value", async () =>
    {
        const promisified = promisify5(fn4Reject);

        try
        {
            const result = await promisified(2, 4, 1, 4, 3);
            fail("Should not have resolved.");
        } catch (error)
        {
            expect((error as Error).message).toEqual("error - 2, 4, 1, 4, 3");
        }
    });
});
