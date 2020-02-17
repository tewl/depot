/**
 * Defines a failure result.
 */
export interface IFailureResult<ErrorType> {
    success:  false;
    error:    ErrorType;
    message?: string;
}


/**
 * Defines a successful result.
 */
export interface ISuccessResult<SuccessType> {
    success: true;
    value: SuccessType;
}


/**
 * Represents the result of some action that can either succeed or fail.
 */
export type Result<SuccessType, ErrorType> = ISuccessResult<SuccessType> | IFailureResult<ErrorType>;


/**
 * Factory function used to create an IFailureResult.
 * @param error - An error value describing the failure
 * @param message - An (optional) human readable error message.  Should only be
 *     specified when error does not contain an error message.
 * @return The IFailureResult object
 */
export function failureResult<ErrorType>(error: ErrorType, message?: string): IFailureResult<ErrorType> {
    return {success: false, error: error, message: message};
}


/**
 * Factory function used to create an ISuccessResult.
 * @param val - The successful result value
 * @return The ISuccessResult object
 */
export function successResult<SuccessType>(val: SuccessType): ISuccessResult<SuccessType> {
    return {success: true, value: val};
}
