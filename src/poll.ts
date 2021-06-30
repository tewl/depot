import { getTimerPromise } from "./promiseHelpers";


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
    (iterationNum: number, startTime: number, retVal: TReturn) => ContinuePollingResult<TResult> | Promise<ContinuePollingResult<TResult>>;

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
