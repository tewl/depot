interface IFailureResult {
    succeeded: false;
    error: string;
}

interface ISucceededResult<T> {
    succeeded: true;
    value: T;
}

export type Result<T> = ISucceededResult<T> | IFailureResult;
