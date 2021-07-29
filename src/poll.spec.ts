import { Logger, LogLevel } from "./logger";
import { continuePollingNo, ContinuePollingPredicate, continuePollingYes, poll, pollAsyncResult } from "./poll";
import { getTimerPromise } from "./promiseHelpers";
import { failed, failedResult, succeeded, succeededResult } from "./result";


describe("poll()", () => {


    it("polls until the predicate says to stop", async () => {
        const logger = new Logger();
        logger.pushLogLevel(LogLevel.DEBUG_5);
        // logger.addListener(console.log);

        let nextReturnVal = 1;
        const asyncOperation = async () => {
            await getTimerPromise(100, undefined);
            const thisReturnVal = nextReturnVal;
            nextReturnVal = nextReturnVal + 1;

            if (thisReturnVal % 2) {
                return thisReturnVal;
            }
            else {
                throw new Error("Reject on even values.");
            }
        };

        // A predicate that will instruct the polling to continue while the
        // function rejects or the resolved value is less than or equal to 6.
        const predicate: ContinuePollingPredicate<Promise<number>, string> = async (iterationNum, startTime, retVal) => {
            try {
                logger.debug(`Iteration ${iterationNum} was started at t=${Date.now() - startTime} ms`);
                const num = await retVal;
                if (num > 6) {
                    const resultVal = `${iterationNum}`;
                    logger.debug(`asyncOperation() resulted in ${num} (> 6).  Terminating with value ${resultVal}`);
                    return continuePollingNo(resultVal);
                }
                else {
                    const delayMs = 50;
                    logger.debug(`asyncOperation() resulted in ${num} (<= 6).  Will poll again in ${delayMs} ms.`);
                    return continuePollingYes(delayMs);
                }
            } catch (err) {
                const delayMs = 30;
                logger.debug(`asyncOperation() rejected.  Will poll again in ${delayMs} ms.`);
                return continuePollingYes(delayMs);
            }
        };

        const result = await poll<Promise<number>, string>(asyncOperation, predicate);
        expect(result).toEqual("7");
    });


});


describe("pollAsyncResult()", () => {


    it("when operation succeeds, returns the successful result", async () => {
        const startTime = Date.now();
        let numInvocations = 0;
        const pollingInterval = 100;

        const asyncResultOp = async () =>
        {
            numInvocations++;
            return numInvocations === 4 ? succeededResult(4) : failedResult(0);
        };

        const result = await pollAsyncResult(asyncResultOp, undefined, pollingInterval, 1000);
        expect(succeeded(result)).toBeTruthy();
        expect(Date.now() - startTime).toBeGreaterThan(3 * pollingInterval);
        expect(result.value).toEqual(4);
    });


    it("when timing out returns the most recent failure", async () => {
        const asyncResultOp = async () => {
            return failedResult(5);
        };

        const result = await pollAsyncResult(asyncResultOp, undefined, 100, 1000);
        expect(failed(result)).toBeTruthy();
        expect(result.error!.message).toEqual("Polling timed out after 1000 ms.");
        expect(result.error!.lastResult.error).toEqual(5);
    });


    it("will not stop polling until additional predicate also returns true", async () => {
        let numInvocations = 0;
        const asyncResultOp = async () => {
            numInvocations++;
            return succeededResult(numInvocations);
        };

        const result = await pollAsyncResult(
            asyncResultOp,
            (iterationNum, startTime, retVal) => retVal === 5,  // keep polling while less than 5
            100,
            1000
        );

        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual(5);
    });


    it("when the operation always succeeds but predicate always fails, returns an error with successful lastResult", async () => {
        const asyncResultOp = async () => {
            return succeededResult(3);
        };

        const result = await pollAsyncResult(
            asyncResultOp,
            () => false,
            100,
            500
        );

        expect(failed(result)).toBeTruthy();
        expect(result.error!.message).toEqual("Polling timed out after 500 ms.");
        expect(succeeded(result.error!.lastResult)).toBeTruthy();
        expect(result.error!.lastResult.value).toEqual(3);
    });


});