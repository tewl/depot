
export class SuccessResult<TSuccess> {

    private readonly _value: TSuccess;


    public constructor(value: TSuccess) {
        this._value = value;
    }

    public get value(): TSuccess {
        return this._value;
    }

    public get error(): undefined {
        return undefined;
    }

    public get succeeded(): true {
        return true;
    }

    public get failed(): false {
        return false;
    }

    public toString(): string {
        return `Successful Result (${this._value})`;
    }
}

export class FailedResult<TError> {

    private readonly _error: TError;

    public constructor(error: TError) {
        this._error = error;
    }

    public get value(): undefined {
        return undefined;
    }

    public get error(): TError {
        return this._error;
    }

    public get succeeded(): false {
        return false;
    }

    public get failed(): true {
        return true;
    }

    public toString(): string {
        return `Failed Result (${this._error})`;
    }

}


export type Result<TSuccess, TError> = SuccessResult<TSuccess> | FailedResult<TError>;

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
            (curResult): curResult is FailedResult<TError> => curResult instanceof FailedResult
        );

        const retVal = firstFailure ?
            firstFailure :
            new SuccessResult(resultsCollection.map((curResult): TSuccess => curResult.value!));
        return retVal;
    }

}
