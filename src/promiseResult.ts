import * as _ from "lodash";
import { FailedResult, Result, SucceededResult } from "./result";
import { IIndexedItem } from "./utilityTypes";
import { errorToString } from "./errorHelpers";

/**
 * Converts a Promise<Result<>> to a Promise.
 *
 * @param pr - The Promise<Result<>> to be converted.
 * @return Either a resolved promise or a rejected promise based on the input
 */
export async function toPromise<TSuccess, TError>(
    pr: Promise<Result<TSuccess, TError>>
): Promise<TSuccess> {
    const result = await pr;
    return result.succeeded ?
        Promise.resolve(result.value) :
        Promise.reject(result.error);
}


/**
 * Converts a Promise into a Promise<Result<>> that will always resolve with a
 * Result.
 *
 * @param promise - The input Promise
 * @returns A Promise that will always resolve with a Result.  Resolved promises
 * yield a successful Result and rejections yield a failure Result containing a
 * string error message.
 */
export function fromPromise<TSuccess>(
    promise: Promise<TSuccess>
): Promise<Result<TSuccess, string>> {
    return promise.then(
        (val) => {
            return new SucceededResult(val);
        },
        (err) => {
            return new FailedResult(errorToString(err));
        }
    );
}


/**
 * Converts a Promise into a Promise<Result<>> that will always resolve with a
 * Result and rejections will be mapped through the specified function.
 *
 * @param promise - The input Promise
 * @param errMapFn - A function that will convert a rejection error to the
 * Result's failure type.
 * @returns A Promise that will always resolve with a Result.  Resolved promises
 * yield a successful Result and rejections yield a failure Result.
 */
export function fromPromiseWith<TSuccess, TError>(
    promise: Promise<TSuccess>,
    errMapFn: (err: unknown) => TError
): Promise<Result<TSuccess, TError>> {
    return promise.then(
        (val) => {
            return new SucceededResult(val);
        },
        (err: unknown) => {
            const mappedErr = errMapFn(err);
            return new FailedResult(mappedErr);
        }
    );
}


////////////////////////////////////////////////////////////////////////////////
// allM()
////////////////////////////////////////////////////////////////////////////////
export async function allM<TSA, TFA>(
    a: Promise<Result<TSA, TFA>>
): Promise<Result<
    [TSA], IIndexedItem<TFA>
>>;

export async function allM<TSA, TFA, TSB, TFB>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>
): Promise<Result<
    [TSA, TSB],
    IIndexedItem<TFA | TFB>
>>;

export async function allM<TSA, TFA, TSB, TFB, TSC, TFC>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>
): Promise<Result<
    [TSA, TSB, TSC],
    IIndexedItem<TFA | TFB | TFC>
>>;

export async function allM<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>
): Promise<Result<
    [TSA, TSB, TSC, TSD],
    IIndexedItem<TFA | TFB | TFC | TFD>
>>;

export async function allM<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>,
    e: Promise<Result<TSE, TFE>>
): Promise<Result<
    [TSA, TSB, TSC, TSD, TSE],
    IIndexedItem<TFA | TFB | TFC | TFD | TFE>
>>;

export async function allM<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>,
    e: Promise<Result<TSE, TFE>>,
    f: Promise<Result<TSF, TFF>>
): Promise<Result<
    [TSA, TSB, TSC, TSD, TSE, TSF],
    IIndexedItem<TFA | TFB | TFC | TFD | TFE | TFF>
>>;

export async function allM<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF, TSG, TFG>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>,
    e: Promise<Result<TSE, TFE>>,
    f: Promise<Result<TSF, TFF>>,
    g: Promise<Result<TSG, TFG>>
): Promise<Result<
    [TSA, TSB, TSC, TSD, TSE, TSF, TSG],
    IIndexedItem<TFA | TFB | TFC | TFD | TFE | TFF | TFG>
>>;

export async function allM<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF, TSG, TFG, TSH, TFH>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>,
    e: Promise<Result<TSE, TFE>>,
    f: Promise<Result<TSF, TFF>>,
    g: Promise<Result<TSG, TFG>>,
    h: Promise<Result<TSH, TFH>>
): Promise<Result<
    [TSA, TSB, TSC, TSD, TSE, TSF, TSG, TSH],
    IIndexedItem<TFA | TFB | TFC | TFD | TFE | TFF | TFG | TFH>
>>;

export async function allM<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF, TSG, TFG, TSH, TFH, TSI, TFI>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>,
    e: Promise<Result<TSE, TFE>>,
    f: Promise<Result<TSF, TFF>>,
    g: Promise<Result<TSG, TFG>>,
    h: Promise<Result<TSH, TFH>>,
    i: Promise<Result<TSI, TFI>>
): Promise<Result<
    [TSA, TSB, TSC, TSD, TSE, TSF, TSG, TSH, TSI],
    IIndexedItem<TFA | TFB | TFC | TFD | TFE | TFF | TFG | TFH | TFI>
>>;

export async function allM<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF, TSG, TFG, TSH, TFH, TSI, TFI,
                          TSJ, TFJ>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>,
    e: Promise<Result<TSE, TFE>>,
    f: Promise<Result<TSF, TFF>>,
    g: Promise<Result<TSG, TFG>>,
    h: Promise<Result<TSH, TFH>>,
    i: Promise<Result<TSI, TFI>>,
    j: Promise<Result<TSJ, TFJ>>
): Promise<Result<
    [TSA, TSB, TSC, TSD, TSE, TSF, TSG, TSH, TSI, TSJ],
    IIndexedItem<TFA | TFB | TFC | TFD | TFE | TFF | TFG | TFH | TFI | TFJ>
>>;

//
// Implementation
//
export function allM(
    ...promises: Array<Promise<Result<unknown, unknown>>>
): Promise<Result<Array<unknown>, IIndexedItem<unknown>>> {
    return allArrayM<unknown, unknown>(promises);
}



/**
 * Checks to see if all input Promise<Result<>> objects resolve successfully.
 * Returns all failures (the "A" stands for "applicative").
 *
 * @param promises - The input array of Promise<Result<>>s
 * @returns  If all input Promises resolve with successful Results, a successful
 * Result containing an array of those successful values.  Otherwise, a failure
 * Result is returned containing information about each failure.
 */

export async function allArrayA<TSuccess, TError>(
    promises: Array<Promise<Result<TSuccess, TError>>>
): Promise<Result<Array<TSuccess>, Array<IIndexedItem<TError>>>> {

    let results: Array<Result<TSuccess, TError>>;
    try {
        results = await Promise.all(promises);
    }
    catch (err) {
        // This should never happen, because failure is supposed to be
        // communicated with a Promise that *resolves* (not rejects) with a
        // failed Result object.  See promiseResult.forceResult() for a way to
        // wrap a Promise<Result<>> so that it never rejects.
        const errMsg = `Promise for Result unexpectedly rejected. ${errorToString(err)}`;
        throw new Error(errMsg);
    }

    if (results.every((res) => res.succeeded)) {
        // Return a successful Result wrapping all of the successful values.
        return new SucceededResult(results.map((res) => res.value!));
    }
    else {
        // Returns a failure Result wrapping an array of IIndexedItems
        // referencing each error.
        const failures = results.reduce<Array<IIndexedItem<TError>>>(
            (acc, res, idx) => {
                if (res.failed) {
                    acc.push({
                        index: idx,
                        item:  res.error
                    });
                }
                return acc;
            },
            []
        );
        return new FailedResult(failures);
    }
}


/**
 * Checks to see if all input Promise<Result<>> objects resolve successfully.
 * Returns the first failure as soon as possible upon any failure (the "M"
 * stands for "monadic").
 *
 * This function accepts the inputs as an array.  This has the advantage that
 * higher order functions can be used to create the array (i.e. _.map()), but
 * has the disadvantage that there can only be one Result success type and one
 * Result failure type.
 *
 * @param promises - The input array of Promise<Result<>>s.
 * @return If all input Promises resolve with successful Results, a successful
 * Result containing an array of those successful values.  Otherwise, a failure
 * Result is returned as soon as possible containing information about the first
 * error.
 */
export function allArrayM<TSuccess, TError>(
    promises: Array<Promise<Result<TSuccess, TError>>>
): Promise<Result<Array<TSuccess>, IIndexedItem<TError>>> {
    return new Promise((resolve, reject) => {

        const numPromises = promises.length;
        let numSuccesses = 0;
        const successfulResults: Array<TSuccess> = [];
        _.forEach(promises, (curPromise, index) => {
            curPromise
            .then((curResult) => {
                if (curResult.succeeded) {
                    // The current async operation succeeded.
                    successfulResults[index] = curResult.value;
                    numSuccesses++;

                    // If this is the last successful async operation, resolve
                    // with an array of all the success values.  Otherwise, keep
                    // waiting.
                    if (numSuccesses === numPromises) {
                        resolve(new SucceededResult(successfulResults));
                    }
                }
                else {
                    // It failed.  Return the failed result immediately.
                    const indexed: IIndexedItem<TError> = {
                        index: index,
                        item:  curResult.error
                    };
                    resolve(new FailedResult(indexed));
                }
            })
            .catch((err) => {
                // This should never happen, because failure is supposed to be
                // communicated with a Promise that *resolves* (not rejects) with
                // a failed Result object. See promiseResult.forceResult() for a
                // way to wrap a Promise<Result<>> so that it never rejects.
                const errMsg = `Promise for Result unexpectedly rejected. ${errorToString(err)}`;
                reject(new Error(errMsg));
            });
        });
    });
}


/**
 * Awaits the input Result.  If successful, unwraps the value and passes it into
 * _fn_, returning its Result or Promise<Result>.  If the input was not
 * successful, returns it.
 *
 * @param fn - The function to invoke when the input is successful.
 * @param input - The input Result or Promise<Result>
 * @returns Either the passed through failure Result or the Result returned from
 * _fn_.
 */
export async function bind<TInSuccess, TOutSuccess, TError>(
    fn: (x: TInSuccess) => Result<TOutSuccess, TError> | Promise<Result<TOutSuccess, TError>>,
    input: Result<TInSuccess, TError> | Promise<Result<TInSuccess, TError>>
): Promise<Result<TOutSuccess, TError>> {

    const awaitedInputRes = await Promise.resolve(input);
    if (awaitedInputRes.succeeded) {

        // Execute the specified fn.
        const output = fn(awaitedInputRes.value);
        return output;
    }
    else {
        return awaitedInputRes;
    }
}


/**
 * Awaits the input Result.  If successful, maps its value using _fn_ (the
 * mapping may also be async).  When the input is a failed Result, it is
 * returned.
 *
 * @param fn - The function to invoke when the input is successful
 * @param input - The input Result or Promise<Result>
 * @returns Either the mapped successful Promise<Result> or the passed-through
 * failure Result or Promise<Result>.
 */
export async function map<TInSuccess, TOutSuccess, TError>(
    fn: (x: TInSuccess) => TOutSuccess | Promise<TOutSuccess>,
    input: Result<TInSuccess, TError> | Promise<Result<TInSuccess, TError>>
): Promise<Result<TOutSuccess, TError>> {

    const awaitedInputRes = await Promise.resolve(input);
    if (awaitedInputRes.succeeded) {
        const outVal = await Promise.resolve(fn(awaitedInputRes.value));
        return new SucceededResult(outVal);
    }
    else {
        return awaitedInputRes;
    }
}

/**
 * Forces a Promise<Result<>> to always resolve (and never reject) with a
 * Result<>.
 *
 * @param pr - The input Promise<Result<>> that may reject
 * @returns A Promise that will always resolve with a Result.
 */
export async function forceResult<TSuccess, TError>(
    pr: Promise<Result<TSuccess, TError>>
): Promise<Result<TSuccess, TError | string>> {
    return pr
    .catch((err) => {
        return new FailedResult(errorToString(err));
    });
}
