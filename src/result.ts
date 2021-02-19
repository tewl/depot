////////////////////////////////////////////////////////////////////////////////
//
// Result Types
//
////////////////////////////////////////////////////////////////////////////////

/**
 * Describes a successful result for an operation that may succeed or fail.
 */
export interface ISucceededResult<TSuccess>
{
    state: "succeeded";
    value: TSuccess;
}


/**
 * Describes a failure result for an operation that may succeed or fail.
 */
export interface IFailedResult<TError>
{
    state: "failed";
    error: TError;
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
export function succeededResult<TSuccess>(value: TSuccess): ISucceededResult<TSuccess>
{
    return { state: "succeeded", value: value};
}


/**
 * Convenience function that creates a failure result.
 * @param error - The error payload that will be wrapped
 * @return The failure Result instance
 */
export function failedResult<TError>(error: TError): IFailedResult<TError>
{
    return {state: "failed", error: error};
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
export function succeeded<TSuccess, TError>(result: Result<TSuccess, TError>): result is ISucceededResult<TSuccess>
{
    return result.state === "succeeded";
}


/**
 * User-defined type guard that determines if a Result is a failure one.
 * @param result - The Result instance to inspect
 * @return Whether the Result instance represents a failure.
 */
export function failed<TSuccess, TError>(result: Result<TSuccess, TError>): result is IFailedResult<TError>
{
    return result.state === "failed";
}
