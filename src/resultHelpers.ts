/* eslint-disable max-len */

import * as _ from "lodash";
import { failed, failedResult, Result, succeeded, succeededResult } from "./result";


/**
 * If _input_ is successful, unwraps the value and passes it into _fn_,
 * returning the result.  If _input_ is not successful, returns it.
 * @param fn - The function to invoke on _input.value_ when _input_ is
 * successful.
 * @param input - The input Result.
 * @return Either the passed-through failure Result or the Result returned from
 * _fn_.
 */
export function bindResult<TInputSuccess, TOutputSuccess, TError>(
    fn: (x: TInputSuccess) => Result<TOutputSuccess, TError>,
    input: Result<TInputSuccess, TError>
): Result<TOutputSuccess, TError> {
    if (succeeded(input)) {
        const funcResult = fn(input.value);
        return funcResult;
    }
    else {
        return input;
    }
}


/**
 * When _input_ is successful, maps the wrapped value using _fn_.
 * @param fn - Function that maps the wrapped success value to another value.
 * @param input - The input Result.
 * @return Either the mapped successful Result or the passed-through failure
 * Result.
 */
export function mapSuccess<TInputSuccess, TOutputSuccess, TError>(
    fn: (input: TInputSuccess) => TOutputSuccess,
    input: Result<TInputSuccess, TError>
): Result<TOutputSuccess, TError> {
    if (succeeded(input)) {
        const mappedValue = fn(input.value);
        return succeededResult(mappedValue);
    }
    else {
        return input;
    }
}


/**
 * When _input_ is a failure, maps the wrapped error using _fn_.
 * @param fn - Function that maps the wrapped error value to another value.
 * @param input - The input Result.
 * @return Either the passed-through successful Result or the mapped error
 * Result.
 */
export function mapError<TSuccess, TInputError, TOutputError>(
    fn: (input: TInputError) => TOutputError,
    input: Result<TSuccess, TInputError>
): Result<TSuccess, TOutputError> {
    if (succeeded(input)) {
        return input;
    }
    else {
        const mappedError = fn(input.error);
        return failedResult(mappedError);
    }
}


/**
 * Maps values from a source collection until a failed mapping occurs.  If a
 * failure occurs, the mapping stops immediately.
 * @param srcCollection - The source collection
 * @param mappingFunc - The mapping function. Each element from _srcCollection_
 * is run through this function and it must return a successful result wrapping
 * the mapped value or a failure result wrapping the error.
 * @return A successful result wrapping an array of the mapped values or a
 * failure result wrapping the first failure encountered.
 */
export function mapWhileSuccessful<TInput, TOutput, TError>(
    srcCollection: Array<TInput>,
    mappingFunc: (curItem: TInput) => Result<TOutput, TError>
): Result<Array<TOutput>, TError> {
    return _.reduce(
        srcCollection,
        (acc, curItem) => {
            // If we have already failed, just return the error.
            if (failed(acc)) {
                return acc;
            }

            // We have not yet failed, so process the current item.
            const res = mappingFunc(curItem);
            if (succeeded(res)) {
                // Note:  Do not use array.concat() here, because if the current
                // result's value is an array, it will be flattened.
                acc.value.push(res.value);
                return acc;
            }
            else {
                return res;
            }
        },
        succeededResult([]) as Result<Array<TOutput>, TError>
    );
}


////////////////////////////////////////////////////////////////////////////////
// executeWhileSuccessful()
////////////////////////////////////////////////////////////////////////////////

// Decoder for type parameter names:
// T - Because all type parameters must begin with "T"
// [A-Z] - Ordinal
// [SE] - Success/Error
//
// Examples:
// TAS - The type fnA returns when successful
// TBE - The type fnB returns when failed

export function executeWhileSuccessful<TAS, TAE>(
    fnA: () => Result<TAS, TAE>
): Result<[TAS], TAE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>
): Result<[TAS, TBS], TAE | TBE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>
): Result<[TAS, TBS, TCS], TAE | TBE | TCE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>
): Result<[TAS, TBS, TCS, TDS], TAE | TBE | TCE | TDE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>
): Result<[TAS, TBS, TCS, TDS, TES], TAE | TBE | TCE | TDE | TEE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>,
    fnF: () => Result<TFS, TFE>
): Result<[TAS, TBS, TCS, TDS, TES, TFS], TAE | TBE | TCE | TDE | TEE | TFE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>,
    fnF: () => Result<TFS, TFE>,
    fnG: () => Result<TGS, TGE>
): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS], TAE | TBE | TCE | TDE | TEE | TFE | TGE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>,
    fnF: () => Result<TFS, TFE>,
    fnG: () => Result<TGS, TGE>,
    fnH: () => Result<THS, THE>
): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>,
    fnF: () => Result<TFS, TFE>,
    fnG: () => Result<TGS, TGE>,
    fnH: () => Result<THS, THE>,
    fnI: () => Result<TIS, TIE>
): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE, TJS, TJE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>,
    fnF: () => Result<TFS, TFE>,
    fnG: () => Result<TGS, TGE>,
    fnH: () => Result<THS, THE>,
    fnI: () => Result<TIS, TIE>,
    fnJ: () => Result<TJS, TJE>
): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS, TJS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE | TJE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE, TJS, TJE, TKS, TKE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>,
    fnF: () => Result<TFS, TFE>,
    fnG: () => Result<TGS, TGE>,
    fnH: () => Result<THS, THE>,
    fnI: () => Result<TIS, TIE>,
    fnJ: () => Result<TJS, TJE>,
    fnK: () => Result<TKS, TKE>
): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS, TJS, TKS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE | TJE | TKE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE, TJS, TJE, TKS, TKE, TLS, TLE>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>,
    fnF: () => Result<TFS, TFE>,
    fnG: () => Result<TGS, TGE>,
    fnH: () => Result<THS, THE>,
    fnI: () => Result<TIS, TIE>,
    fnJ: () => Result<TJS, TJE>,
    fnK: () => Result<TKS, TKE>,
    fnL: () => Result<TLS, TLE>
): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS, TJS, TKS, TLS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE | TJE | TKE | TLE>;

export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE, TJS, TJE, TKS, TKE, TLS, TLE, TMS, TME>(
    fnA: () => Result<TAS, TAE>,
    fnB: () => Result<TBS, TBE>,
    fnC: () => Result<TCS, TCE>,
    fnD: () => Result<TDS, TDE>,
    fnE: () => Result<TES, TEE>,
    fnF: () => Result<TFS, TFE>,
    fnG: () => Result<TGS, TGE>,
    fnH: () => Result<THS, THE>,
    fnI: () => Result<TIS, TIE>,
    fnJ: () => Result<TJS, TJE>,
    fnK: () => Result<TKS, TKE>,
    fnL: () => Result<TLS, TLE>,
    fnM: () => Result<TMS, TME>
): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS, TJS, TKS, TLS, TMS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE | TJE | TKE | TLE | TME>;

export function executeWhileSuccessful(
    // eslint-disable-next-line @typescript-eslint/ban-types
    ...funcs: Array<Function>
): Result<Array<unknown>, unknown> {
    return _.reduce(
        funcs,
        (acc, curFn) => {
            // If we have already failed, just return the error.
            if (failed(acc)) {
                return acc;
            }

            // We have not failed yet, so execute the current function.
            const res = curFn();
            if (succeeded(res)) {
                // Note:  Do not use array.concat() here, because if the current
                // result's value is an array, it will be flattened.
                acc.value.push(res.value);
                return acc;
            }
            else {
                return res;
            }
        },
        succeededResult([]) as Result<Array<unknown>, unknown>
    );
}


/**
 * Converts a boolean value into a successful or failure Result.
 * @param condition - The condition.
 * @param trueSuccessVal - Value to be wrapped in a successful Result when
 * _condition_ is truthy.
 * @param falseErrorVal - Value to be wrapped in a failure Result when
 * _condition_ is falsy.
 * @returns A Result wrapping either of the specified values, determined by
 * _condition_.
 */
export function boolToResult<TSuccess, TError>(
    condition: unknown,
    trueSuccessVal: TSuccess,
    falseErrorVal: TError
): Result<TSuccess, TError> {
    return condition ?
        succeededResult(trueSuccessVal) :
        failedResult(falseErrorVal);
}
