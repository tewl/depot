import * as _ from "lodash";
import { Result, succeeded, succeededResult } from "./result";


/**
 * Converts a Promise<Result<>> to a Promise.
 * @param pr - The Promise<Result<>> to be converted.
 * @return Either a resolved promise or a rejected promise based on the input
 */
export async function toPromise<TSuccess, TError>(
    pr: Promise<Result<TSuccess, TError>>
): Promise<TSuccess>
{
    const result = await pr;
    return succeeded(result) ?
        Promise.resolve(result.value) :
        Promise.reject(result.error);
}


////////////////////////////////////////////////////////////////////////////////
// all()
////////////////////////////////////////////////////////////////////////////////
export async function all<SA, FA, SB, FB>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>
): Promise<Result<[SA, SB], FA | FB>>;

export async function all<SA, FA, SB, FB, SC, FC>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>,
    c: Promise<Result<SC, FC>>
): Promise<Result<[SA, SB, SC], FA | FB | FC>>;

export async function all<SA, FA, SB, FB, SC, FC, SD, FD>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>,
    c: Promise<Result<SC, FC>>,
    d: Promise<Result<SD, FD>>
): Promise<Result<[SA, SB, SC, SD], FA | FB | FC | FD>>;

export async function all<SA, FA, SB, FB, SC, FC, SD, FD, SE, FE>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>,
    c: Promise<Result<SC, FC>>,
    d: Promise<Result<SD, FD>>,
    e: Promise<Result<SE, FE>>
): Promise<Result<[SA, SB, SC, SD, SE], FA | FB | FC | FD | FE>>;

export async function all<SA, FA, SB, FB, SC, FC, SD, FD, SE, FE, SF, FF>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>,
    c: Promise<Result<SC, FC>>,
    d: Promise<Result<SD, FD>>,
    e: Promise<Result<SE, FE>>,
    f: Promise<Result<SF, FF>>
): Promise<Result<[SA, SB, SC, SD, SE, SF], FA | FB | FC | FD | FE | FF>>;

export async function all<SA, FA, SB, FB, SC, FC, SD, FD, SE, FE, SF, FF, SG, FG>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>,
    c: Promise<Result<SC, FC>>,
    d: Promise<Result<SD, FD>>,
    e: Promise<Result<SE, FE>>,
    f: Promise<Result<SF, FF>>,
    g: Promise<Result<SG, FG>>
): Promise<Result<[SA, SB, SC, SD, SE, SF, SG], FA | FB | FC | FD | FE | FF | FG>>;

export async function all<SA, FA, SB, FB, SC, FC, SD, FD, SE, FE, SF, FF, SG, FG, SH, FH>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>,
    c: Promise<Result<SC, FC>>,
    d: Promise<Result<SD, FD>>,
    e: Promise<Result<SE, FE>>,
    f: Promise<Result<SF, FF>>,
    g: Promise<Result<SG, FG>>,
    h: Promise<Result<SH, FH>>
): Promise<Result<[SA, SB, SC, SD, SE, SF, SG, SH], FA | FB | FC | FD | FE | FF | FG | FH>>;

export async function all<SA, FA, SB, FB, SC, FC, SD, FD, SE, FE, SF, FF, SG, FG, SH, FH, SI, FI>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>,
    c: Promise<Result<SC, FC>>,
    d: Promise<Result<SD, FD>>,
    e: Promise<Result<SE, FE>>,
    f: Promise<Result<SF, FF>>,
    g: Promise<Result<SG, FG>>,
    h: Promise<Result<SH, FH>>,
    i: Promise<Result<SI, FI>>
): Promise<Result<[SA, SB, SC, SD, SE, SF, SG, SH, SI], FA | FB | FC | FD | FE | FF | FG | FH | FI>>;

export async function all<SA, FA, SB, FB, SC, FC, SD, FD, SE, FE, SF, FF, SG, FG, SH, FH, SI, FI, SJ, FJ>(
    a: Promise<Result<SA, FA>>,
    b: Promise<Result<SB, FB>>,
    c: Promise<Result<SC, FC>>,
    d: Promise<Result<SD, FD>>,
    e: Promise<Result<SE, FE>>,
    f: Promise<Result<SF, FF>>,
    g: Promise<Result<SG, FG>>,
    h: Promise<Result<SH, FH>>,
    i: Promise<Result<SI, FI>>,
    j: Promise<Result<SJ, FJ>>
): Promise<Result<[SA, SB, SC, SD, SE, SF, SG, SH, SI, SJ], FA | FB | FC | FD | FE | FF | FG | FH | FI | FJ>>;

//
// Implementation
//
export async function all(
    ...promises: Array<Promise<Result<unknown, unknown>>>
): Promise<Result<Array<unknown>, unknown>>
{
    return new Promise((resolve, reject) => {

        const numPromises = promises.length;
        let numSuccesses = 0;
        const successfulResults: Array<unknown> = [];
        _.forEach(promises, (curPromise, index) =>
        {
            curPromise
            .then((curResult) =>
            {
                if (succeeded(curResult)) {
                    // The current async operation succeeded.
                    successfulResults[index] = curResult.value;
                    numSuccesses++;

                    // If this is the last successful async operation, resolve
                    // with an array of all the success values.  Otherwise, keep
                    // waiting.
                    if (numSuccesses === numPromises) {
                        resolve(succeededResult(successfulResults));
                    }
                }
                else {
                    // It failed.  Return the failed result.
                    resolve(curResult);
                }
            })
            .catch((err) =>
            {
                // This should never happen, because failure is supposed to be
                // communicated with a Promise that resolves (not rejects) with
                // a failed Result object.
                reject(`Promise for Result unexpectedly rejected. ${JSON.stringify(err)}`);
            });
        });
    });
}
