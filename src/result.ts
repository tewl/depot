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

export function failureResult<ErrorType>(errorId: ErrorType, message?: string): IFailureResult<ErrorType> {
    return {success: false, errorId: errorId, message: message};
}

export function successResult<SuccessType>(val: SuccessType): ISuccessResult<SuccessType> {
    return {success: true, value: val};
}
