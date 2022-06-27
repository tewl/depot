import * as _ from "lodash";
import { FailedResult, Result, SucceededResult } from "./result";
import { IIndexedItem } from "./utilityTypes";


/**
 * Converts a Promise<Result<>> to a Promise.
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


////////////////////////////////////////////////////////////////////////////////
// all()
////////////////////////////////////////////////////////////////////////////////
export async function all<TSA, TFA, TSB, TFB>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>
): Promise<Result<
    [TSA, TSB],
    IIndexedItem<TFA | TFB>
>>;

export async function all<TSA, TFA, TSB, TFB, TSC, TFC>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>
): Promise<Result<
    [TSA, TSB, TSC],
    IIndexedItem<TFA | TFB | TFC>
>>;

export async function all<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>
): Promise<Result<
    [TSA, TSB, TSC, TSD],
    IIndexedItem<TFA | TFB | TFC | TFD>
>>;

export async function all<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE>(
    a: Promise<Result<TSA, TFA>>,
    b: Promise<Result<TSB, TFB>>,
    c: Promise<Result<TSC, TFC>>,
    d: Promise<Result<TSD, TFD>>,
    e: Promise<Result<TSE, TFE>>
): Promise<Result<
    [TSA, TSB, TSC, TSD, TSE],
    IIndexedItem<TFA | TFB | TFC | TFD | TFE>
>>;

export async function all<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF>(
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

export async function all<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF, TSG, TFG>(
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

export async function all<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF, TSG, TFG, TSH, TFH>(
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

export async function all<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF, TSG, TFG, TSH, TFH, TSI, TFI>(
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

export async function all<TSA, TFA, TSB, TFB, TSC, TFC, TSD, TFD, TSE, TFE, TSF, TFF, TSG, TFG, TSH, TFH, TSI, TFI,
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
export function all(
    ...promises: Array<Promise<Result<unknown, unknown>>>
): Promise<Result<Array<unknown>, IIndexedItem<unknown>>> {
    return allArray<unknown, unknown>(promises);
}


/**
 * A version of all() that accepts the input Promise-Result objects as an array.
 * This has the advantage that higher order functions can be used to create the
 * array (i.e. _.map()), but has the disadvantage that there can only be one
 * Result success type and one Result failure type.
 * @param param - Description
 * @return Description
 */
export function allArray<TSuccess, TFail>(
    promises: Array<Promise<Result<TSuccess, TFail>>>
): Promise<Result<Array<TSuccess>, IIndexedItem<TFail>>> {
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
                    // resolve(curResult);
                    const indexed: IIndexedItem<TFail> = {
                        index: index,
                        item:  curResult.error
                    };
                    resolve(new FailedResult(indexed));
                }
            })
            .catch((err) => {
                // This should never happen, because failure is supposed to be
                // communicated with a Promise that resolves (not rejects) with
                // a failed Result object.
                reject(`Promise for Result unexpectedly rejected. ${JSON.stringify(err)}`);
            });
        });
    });
}
