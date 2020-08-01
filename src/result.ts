export interface IFailureResult<ErrorType> {
    success: false;
    errorId: ErrorType;
    message?: string;
}

export interface ISuccessResult<SuccessType> {
    success: true;
    value: SuccessType;
}

export type Result<SuccessType, ErrorType> = ISuccessResult<SuccessType> | IFailureResult<ErrorType>;

/**
 * User-defined type guard that determines whether the specified result is a
 * successful result.
 * @param result - The result object to inspect.
 * @return True if `result` is a successful result.
 */
export function isSuccess<SuccessType, ErrorType>(result: Result<SuccessType, ErrorType>): result is ISuccessResult<SuccessType> {
    return result.success;
}

/**
 * User-defined type guard that determines whether the specified result is a
 * failure result.
 * @param result - The result object to inspect.
 * @return True if `result` is a failure result.
 */
export function isFailure<SuccessType, ErrorType>(result: Result<SuccessType, ErrorType>): result is IFailureResult<ErrorType> {
    return !result.success;
}

export function failureResult<ErrorType>(errorId: ErrorType, message?: string): IFailureResult<ErrorType> {
    return {success: false, errorId: errorId, message: message};
}

export function successResult<SuccessType>(val: SuccessType): ISuccessResult<SuccessType> {
    return {success: true, value: val};
}
