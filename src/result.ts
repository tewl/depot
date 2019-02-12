export interface IFailureResult<ErrorType> {
    succeeded: false;
    error: ErrorType;
}

export interface ISuccessResult<SuccessType> {
    succeeded: true;
    value: SuccessType;
}

export type Result<SuccessType, ErrorType> = ISuccessResult<SuccessType> | IFailureResult<ErrorType>;


export function failureResult<ErrorType>(err: ErrorType): IFailureResult<ErrorType> {
    return {succeeded: false, error: err};
}

export function successResult<SuccessType>(val: SuccessType): ISuccessResult<SuccessType> {
    return {succeeded: true, value: val};
}
