import { Logger, LogLevel } from "./logger";
import { continuePollingNo, ContinuePollingPredicate, continuePollingYes, poll } from "./poll";
import { getTimerPromise } from "./promiseHelpers";


describe("poll()", () => {

    it("will poll until the predicate says to stop", async () => {

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
        // function rejects or the resolved value exceeds 6.
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


    it("will timeout and return the configured value", async () => {
        const startTime = Date.now();
        const timeoutMs = 1000 * 2;
        let numInvocations = 0;
        const result = await poll(
            () => {
                numInvocations++;
                return 5;
            },
            async () => continuePollingYes(100),
            {timeoutPeriodMs: timeoutMs, timeoutValue: 60}
        );

        expect(result).toEqual(60);
        expect(Date.now() - startTime).toBeGreaterThanOrEqual(timeoutMs);
        expect(numInvocations).toBeGreaterThanOrEqual(18);
    });

});
