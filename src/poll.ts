import { getTimerPromise } from "./promiseHelpers";
import { failedResult, Result, succeeded } from "./result";


interface IContinuePollingYes
{
    continuePolling: true;
    delayMs: number;
}


interface IContinuePollingNo<TResult>
{
    continuePolling: false;
    result: TResult;
}


export function continuePollingYes(delayMs: number): IContinuePollingYes {
    return { continuePolling: true, delayMs: delayMs };
}

export function continuePollingNo<TResult>(result: TResult): IContinuePollingNo<TResult> {
    return { continuePolling: false, result: result };
}


type ContinuePollingResult<TResult> = IContinuePollingYes | IContinuePollingNo<TResult>;


/**
 * Defines a (possibly asynchronous) predicate function that determines whether
 * polling should continue.
 */
export type ContinuePollingPredicate<TReturn, TResult> =
    (iterationNum: number, startTime: number, retVal: TReturn) =>
        ContinuePollingResult<TResult> | Promise<ContinuePollingResult<TResult>>;

type Func<TReturn> = (() => TReturn);


/**
 * Performs an operation until a predicate returns true.
 * @param func - The operation to be performed periodically.  This function
 * takes no parameters and returns TReturn.  Any thrown exceptions should be
 * caught within this function, because it will not be called within a try/catch
 * block.
 * @param continuePollingPredicate - The predicate which determines whether
 * polling will continue.  This function is called with the iteration number,
 * the number of milliseconds since polling began, and _func_'s return value for
 * the current iteration.  This function must return an _IContinuePollingYes_ or
 * an _IContinuePollingNo_ or a Promise for one.  To facilitate the creation of
 * these objects, use the _continuePollingYes()_ and _continuePollingNo()_
 * functions.  When _IContinuePollingNo_ is returned, the value specified for
 * _result_ will be returned.
 * @return The _result_ value the predicate specified when returning
 * _IContinuePollingNo_.
 */
export async function poll<TReturn, TResult>(
    func: Func<TReturn>,
    continuePollingPredicate: ContinuePollingPredicate<TReturn, TResult>
): Promise<TResult>
{
    const startTime = Date.now();
    let   iterationNum = 1;

    // eslint-disable-next-line no-constant-condition
    while (true) {
        const retVal = func();

        // Invoke the predicate to see if polling should continue.  Wrap the
        // returned value in a Promise so that it can be handled the same as
        // cases where a Promise is returned.
        const continueResult = await Promise.resolve(continuePollingPredicate(iterationNum, startTime, retVal));

        if (continueResult.continuePolling) {
            await getTimerPromise(continueResult.delayMs, undefined);
            iterationNum++;
        }
        else {
            return continueResult.result;
        }
    }
}


/**
 * A class for representing polling timeout errors.
 */
export class PollingTimeoutError<TSuccess, TError> extends Error
{
    public readonly lastResult: Result<TSuccess, TError>;

    public constructor(message: string, lastResult: Result<TSuccess, TError>)
    {
        super(message);
        this.lastResult = lastResult;
    }
}


/**
 * Performs an asynchronous operation that returns a Promise for a Result until
 * the returned result is successful or a timeout period elapses.
 * @param asyncResultOp - The Result-returning asynchronous operation.
 * @param donePollingPredicate - A function that will be called if the current
 *      iteration is successful.  This predicate should return true if polling
 *      should stop or false to stop continue.  This parameter is useful when
 *      the asynchronous operation succeeds but the desired side effects are not
 *      yet present in the returned result value.
 * @param pollIntervalMs - The number of milliseconds to delay between failed
 *      invocations of _asyncResultop_.
 * @param timeoutMs - Number of milliseconds from the start time to give up and
 *      return the most recent failure result.
 * @return A Result for the polling operation.  If the async operation succeeded
 * and the donePollingPredicate returned true (if specified) the async
 * operation's successful result is returned.  If polling times out, a
 * PollingTimeoutError is returned.  That error will contain the async
 * operation's last result, which may be successful in cases where the predicate
 * returned false).
 */
export async function pollAsyncResult<TSuccess, TError>(
    asyncResultOp: () => Promise<Result<TSuccess, TError>>,
    donePollingPredicate: undefined | ((iterationNum: number, startTime: number, retVal: TSuccess) => boolean),
    pollIntervalMs: number,
    timeoutMs: number
): Promise<Result<TSuccess, PollingTimeoutError<TSuccess, TError>>>
{
    const result = await poll(
        asyncResultOp,
        // tslint:disable-next-line: max-line-length
        async (
            iterationNum,
            startTime,
            asyncResultPromise)
        : Promise<ContinuePollingResult<Result<TSuccess, PollingTimeoutError<TSuccess, TError>>>> =>
        {
            const result = await asyncResultPromise;
            if (succeeded(result)) {
                let donePolling = true;
                if (donePollingPredicate) {
                    donePolling = donePollingPredicate(iterationNum, startTime, result.value);
                }

                if (donePolling) {
                    return continuePollingNo(result);
                }
            }

            if (Date.now() - startTime > timeoutMs) {
                return continuePollingNo(failedResult(new PollingTimeoutError(`Polling timed out after ${timeoutMs} ms.`, result)));
            }
            else {
                return continuePollingYes(pollIntervalMs);
            }
        }
    );
    return result;
}
