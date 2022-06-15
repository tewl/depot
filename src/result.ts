////////////////////////////////////////////////////////////////////////////////
//
// Result Types
//
////////////////////////////////////////////////////////////////////////////////

/**
 * Describes a successful result for an operation that may succeed or fail.
 */
export interface ISucceededResult<TSuccess> {
    readonly state: "succeeded";
    readonly value: TSuccess;
    readonly error: undefined;
}


/**
 * Describes a failure result for an operation that may succeed or fail.
 */
export interface IFailedResult<TError> {
    readonly state: "failed";
    readonly value: undefined;
    readonly error: TError;
}


/**
 * Describes the result for an operation that may succeed or fail.
 */
export type Result<TSuccess, TError> = ISucceededResult<TSuccess> | IFailedResult<TError>;


////////////////////////////////////////////////////////////////////////////////
//
// Creation Convenience Functions
//
////////////////////////////////////////////////////////////////////////////////


/**
 * Convenience function that creates a successful result.
 * @param result - The success value that will be wrapped
 * @return The successful Result instance
 */
export function succeededResult<TSuccess>(value: TSuccess): ISucceededResult<TSuccess> {
    return { state: "succeeded", value: value, error: undefined };
}


/**
 * Convenience function that creates a failure result.
 * @param error - The error payload that will be wrapped
 * @return The failure Result instance
 */
export function failedResult<TError>(error: TError): IFailedResult<TError> {
    return { state: "failed", value: undefined, error: error };
}


////////////////////////////////////////////////////////////////////////////////
//
// User-Defined Type Guards
//
////////////////////////////////////////////////////////////////////////////////


/**
 * User-defined type guard that determines if a Result is a successful one.
 * @param result - The Result instance to inspect
 * @return Whether the Result instance represents a success.
 */
export function succeeded<TSuccess, TError>(result: Result<TSuccess, TError>): result is ISucceededResult<TSuccess> {
    return result.state === "succeeded";
}


/**
 * User-defined type guard that determines if a Result is a failure one.
 * @param result - The Result instance to inspect
 * @return Whether the Result instance represents a failure.
 */
export function failed<TSuccess, TError>(result: Result<TSuccess, TError>): result is IFailedResult<TError> {
    return result.state === "failed";
}


// The following Result namespace serves as a place to put functions when we
// want clients to prefix the function with "Result.".

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Result {

    /**
     * When all input Results are successful, returns a successful Result containing
     * an array of the successful values.  If the input contains one (or more)
     * failures, a failed Result is returned containing the first error.
     *
     * @param resultsCollection - The input collection
     * @return Description
     */
    export function all<TSuccess, TError>(
        resultsCollection: Array<Result<TSuccess, TError>>
    ): Result<Array<TSuccess>, TError> {
        const firstFailure = resultsCollection.find(
            (curResult): curResult is IFailedResult<TError> => failed(curResult)
        );

        return firstFailure ?
            firstFailure :
            succeededResult(resultsCollection.map((curResult) => curResult.value!));
    }

}
