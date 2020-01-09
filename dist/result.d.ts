export interface IFailureResult<ErrorType> {
    success: false;
    errorId: ErrorType;
    message?: string;
}
export interface ISuccessResult<SuccessType> {
    success: true;
    value: SuccessType;
}
export declare type Result<SuccessType, ErrorType> = ISuccessResult<SuccessType> | IFailureResult<ErrorType>;
export declare function failureResult<ErrorType>(errorId: ErrorType, message?: string): IFailureResult<ErrorType>;
export declare function successResult<SuccessType>(val: SuccessType): ISuccessResult<SuccessType>;
