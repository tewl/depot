export interface IFailureResult<ErrorType> {
    success: false;
    error:   ErrorType;
}

export interface ISuccessResult<SuccessType> {
    success: true;
    value: SuccessType;
}

export type Result<SuccessType, ErrorType> = ISuccessResult<SuccessType> | IFailureResult<ErrorType>;


export function failureResult<ErrorType>(err: ErrorType): IFailureResult<ErrorType> {
    return {success: false, error: err};
}

export function successResult<SuccessType>(val: SuccessType): ISuccessResult<SuccessType> {
    return {success: true, value: val};
}
