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
    readonly state: "succeeded";
    readonly value: TSuccess;
    readonly error: undefined;
}


/**
 * Describes a failure result for an operation that may succeed or fail.
 */
export interface IFailedResult<TError>
{
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
export function succeededResult<TSuccess>(value: TSuccess): ISucceededResult<TSuccess>
{
    return { state: "succeeded", value: value, error: undefined };
}


/**
 * Convenience function that creates a failure result.
 * @param error - The error payload that will be wrapped
 * @return The failure Result instance
 */
export function failedResult<TError>(error: TError): IFailedResult<TError>
{
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


////////////////////////////////////////////////////////////////////////////////


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
): Result<TOutputSuccess, TError>
{
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
): Result<TOutputSuccess, TError>
{
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
): Result<TSuccess, TOutputError>
{
    if (succeeded(input)) {
        return input;
    }
    else {
        const mappedError = fn(input.error);
        return failedResult(mappedError);
    }
}
