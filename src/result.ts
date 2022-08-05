/* eslint-disable @typescript-eslint/no-namespace */
/* eslint-disable max-len */


interface IResult<TSuccess, TError> {
    /**
     * Determines whether this object is a successful Result.
     */
    readonly succeeded: boolean;
    /**
     * Gets the value associated with this successful Result.  The `succeeded`
     * property should always be checked first.  If this is a failure Result,
     * this property will be `undefined`.
     */
    readonly value: TSuccess | undefined;
    /**
     * Determines whether this object is a failed Result.
     */
    readonly failed: boolean;
    /**
     * Gets the error associated with this failure Result.  The `failed`
     * property should always be checked first.  If this is a successful Result,
     * this property will be `undefined`.
     */
    readonly error: TError | undefined;
}

/**
 * Represents a successful result returned from a function.
 */
export class SucceededResult<TSuccess> implements IResult<TSuccess, undefined> {

    private readonly _value: TSuccess;

    /**
     * Creates a new SucceededResult instance.
     * @param value - The successful result value
     */
    public constructor(value: TSuccess) {
        this._value = value;
    }

    public get succeeded(): true {
        return true;
    }

    public get value(): TSuccess {
        return this._value;
    }

    public get failed(): false {
        return false;
    }

    public get error(): undefined {
        return undefined;
    }

    public toString(): string {
        return `Successful Result (${this._value})`;
    }
}

export class FailedResult<TError> implements IResult<undefined, TError> {

    private readonly _error: TError;

    public constructor(error: TError) {
        this._error = error;
    }

    public get succeeded(): false {
        return false;
    }

    public get value(): undefined {
        return undefined;
    }

    public get failed(): true {
        return true;
    }

    public get error(): TError {
        return this._error;
    }

    public toString(): string {
        return `Failed Result (${this._error})`;
    }
}


/**
 * Represents the successful or failure result of an operation.
 */
export type Result<TSuccess, TError> = SucceededResult<TSuccess> | FailedResult<TError>;


/**
 * A namespace that will be merged with the Result type.  Serves as a useful
 * place to create functions that operate on Result objects.
 */
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
            new SucceededResult(resultsCollection.map((curResult): TSuccess => curResult.value!));
        return retVal;
    }


    /**
     * If the input Result is successful, invokes _fn_ with the value.  If a
     * successful Result is returned, the original input value is augmented with
     * the value.  Augment is a lot like bind(), except it automatically
     * includes all of the input's properties.  It can also serve as a reality
     * check or gate when augmenting no additional properties.
     *
     * @param fn - Function that will be invoked if the input Result is
     * successful.  Returns a Result.  If successful, the properties will be
     * added to _input_ and returned as a successful Result.
     * @param input - The input Result
     * @returns An error if the input is an error or _fn_ returns an error.
     * Otherwise, a successful Result containing all properties of the original
     * input and the value returned by _fn_.
     */
    export function augment<TInputSuccess, TInputError, TFnSuccess, TFnError>(
        fn: (input: TInputSuccess) => Result<TFnSuccess, TFnError>,
        input: Result<TInputSuccess, TInputError>
    ): Result<TInputSuccess & TFnSuccess, TInputError | TFnError> {

        if (input.failed) {
            return input;
        }

        // The input is a successful Result.
        const fnRes = fn(input.value);
        if (fnRes.failed) {
            // _fn_ has errored.  Return that error.
            return fnRes;
        }

        // _fn_ has succeeded.  Return an object containing all properties of
        // the original input and the value returned by _fn_.
        const augmented = { ...input.value, ...fnRes.value};
        return new SucceededResult(augmented);
    }


    /**
     * If _input_ is successful, unwraps the value and passes it into _fn_,
     * returning its returned Result.  If _input_ is not successful, returns it.
     *
     * @param fn - The function to invoke on _input.value_ when _input_ is
     * successful.
     * @param input - The input Result.
     * @return Either the passed-through failure Result or the Result returned from
     * _fn_.
     */
    export function bind<TInputSuccess, TOutputSuccess, TError>(
        fn: (x: TInputSuccess) => Result<TOutputSuccess, TError>,
        input: Result<TInputSuccess, TError>
    ): Result<TOutputSuccess, TError> {
        if (input.succeeded) {
            const funcResult = fn(input.value);
            return funcResult;
        }
        else {
            return input;
        }
    }


    /**
     * Maps each input value through the specified mapping function.  If the
     * mapping function returns a successful result, its value is added to the
     * output array; otherwise nothing is added to the output array.
     *
     * @param fn - The function that will map each input value to either a
     * successful value that will be included in the output array or a failure
     * if no value will be contributed to the output array.
     * @param input - The input sequence
     * @returns  The output array
     */
    export function choose<TIn, TOut, TError>(fn: (v: TIn,) => Result<TOut, TError>, input: Iterable<TIn>): Array<TOut> {
        const inputArr = Array.from(input);
        const output =
            inputArr.reduce<Array<TOut>>(
                (acc, cur) => {
                    const res = fn(cur);
                    if (res.succeeded) {
                        acc.push(res.value);
                    }
                    return acc;
                },
                []
            );
        return output;
    }

    /**
     * If the input is a successful value, returns the contained value, else
     * returns the default value.
     *
     * @param defaultValue - The default value to use if input is an error
     * Result
     * @param input - The input Result
     * @returns The contained value if input is successful, else the default
     * value.
     */
    export function defaultValue<TSuccess, TError>(defaultValue: TSuccess, input: Result<TSuccess, TError>): TSuccess {
        return input.succeeded ?
            input.value :
            defaultValue;
    }

    /**
     * If the input is a successful value, returns the contained value, else
     * returns _fn()_.  This function is useful when getting the default value
     * is expensive.
     *
     * @param fn - A function that can be invoked to get the default value.  Not
     * executed unless input is an error.
     * @param input - The input Result
     * @returns The contained value if input is successful, else the value
     * returned by _fn_.
     */
    export function defaultWith<TSuccess, TError>(fn: () => TSuccess, input: Result<TSuccess, TError>): TSuccess {
        return input.succeeded ?
            input.value :
            fn();
    }


    // #region executeWhileSuccessful()


    // Decoder for type parameter names:
    // T - Because all type parameters must begin with "T"
    // [A-Z] - Ordinal
    // [SE] - Success/Error
    //
    // Examples:
    // TAS - The type fnA returns when successful
    // TBE - The type fnB returns when failed

    export function executeWhileSuccessful<TAS, TAE>(
        fnA: () => Result<TAS, TAE>
    ): Result<[TAS], TAE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>
    ): Result<[TAS, TBS], TAE | TBE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>
    ): Result<[TAS, TBS, TCS], TAE | TBE | TCE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>
    ): Result<[TAS, TBS, TCS, TDS], TAE | TBE | TCE | TDE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>
    ): Result<[TAS, TBS, TCS, TDS, TES], TAE | TBE | TCE | TDE | TEE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>,
        fnF: () => Result<TFS, TFE>
    ): Result<[TAS, TBS, TCS, TDS, TES, TFS], TAE | TBE | TCE | TDE | TEE | TFE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>,
        fnF: () => Result<TFS, TFE>,
        fnG: () => Result<TGS, TGE>
    ): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS], TAE | TBE | TCE | TDE | TEE | TFE | TGE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>,
        fnF: () => Result<TFS, TFE>,
        fnG: () => Result<TGS, TGE>,
        fnH: () => Result<THS, THE>
    ): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>,
        fnF: () => Result<TFS, TFE>,
        fnG: () => Result<TGS, TGE>,
        fnH: () => Result<THS, THE>,
        fnI: () => Result<TIS, TIE>
    ): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE, TJS, TJE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>,
        fnF: () => Result<TFS, TFE>,
        fnG: () => Result<TGS, TGE>,
        fnH: () => Result<THS, THE>,
        fnI: () => Result<TIS, TIE>,
        fnJ: () => Result<TJS, TJE>
    ): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS, TJS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE | TJE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE, TJS, TJE, TKS, TKE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>,
        fnF: () => Result<TFS, TFE>,
        fnG: () => Result<TGS, TGE>,
        fnH: () => Result<THS, THE>,
        fnI: () => Result<TIS, TIE>,
        fnJ: () => Result<TJS, TJE>,
        fnK: () => Result<TKS, TKE>
    ): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS, TJS, TKS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE | TJE | TKE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE, TJS, TJE, TKS, TKE, TLS, TLE>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>,
        fnF: () => Result<TFS, TFE>,
        fnG: () => Result<TGS, TGE>,
        fnH: () => Result<THS, THE>,
        fnI: () => Result<TIS, TIE>,
        fnJ: () => Result<TJS, TJE>,
        fnK: () => Result<TKS, TKE>,
        fnL: () => Result<TLS, TLE>
    ): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS, TJS, TKS, TLS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE | TJE | TKE | TLE>;

    export function executeWhileSuccessful<TAS, TAE, TBS, TBE, TCS, TCE, TDS, TDE, TES, TEE, TFS, TFE, TGS, TGE, THS, THE, TIS, TIE, TJS, TJE, TKS, TKE, TLS, TLE, TMS, TME>(
        fnA: () => Result<TAS, TAE>,
        fnB: () => Result<TBS, TBE>,
        fnC: () => Result<TCS, TCE>,
        fnD: () => Result<TDS, TDE>,
        fnE: () => Result<TES, TEE>,
        fnF: () => Result<TFS, TFE>,
        fnG: () => Result<TGS, TGE>,
        fnH: () => Result<THS, THE>,
        fnI: () => Result<TIS, TIE>,
        fnJ: () => Result<TJS, TJE>,
        fnK: () => Result<TKS, TKE>,
        fnL: () => Result<TLS, TLE>,
        fnM: () => Result<TMS, TME>
    ): Result<[TAS, TBS, TCS, TDS, TES, TFS, TGS, THS, TIS, TJS, TKS, TLS, TMS], TAE | TBE | TCE | TDE | TEE | TFE | TGE | THE | TIE | TJE | TKE | TLE | TME>;

    export function executeWhileSuccessful(
        // eslint-disable-next-line @typescript-eslint/ban-types
        ...funcs: Array<Function>
    ): Result<Array<unknown>, unknown> {
        return funcs.reduce<Result<Array<unknown>, unknown>>(
            (acc, curFn) => {
                // If we have already failed, just return the error.
                if (acc.failed) {
                    return acc;
                }

                // We have not failed yet, so execute the current function.
                const res = curFn();
                if (res.succeeded) {
                    // Note:  Do not use array.concat() here, because if the current
                    // result's value is an array, it will be flattened.
                    acc.value.push(res.value);
                    return acc;
                }
                else {
                    return res;
                }
            },
            new SucceededResult([])
        );
    }

    // #endregion


    /**
     * Converts a boolean value into a successful or failure Result.
     *
     * @param condition - The condition.
     * @param trueSuccessVal - Value to be wrapped in a successful Result when
     * _condition_ is truthy.
     * @param falseErrorVal - Value to be wrapped in a failure Result when
     * _condition_ is falsy.
     * @returns A Result wrapping either of the specified values, determined by
     * _condition_.
     */
    export function fromBool<TSuccess, TError>(
        condition: unknown,
        trueSuccessVal: TSuccess,
        falseErrorVal: TError
    ): Result<TSuccess, TError> {
        return condition ?
            new SucceededResult(trueSuccessVal) :
            new FailedResult(falseErrorVal);
    }


    /**
     * When _input_ is a failure, maps the wrapped error using _fn_.
     *
     * @param fn - Function that maps the wrapped error value to another value.
     * @param input - The input Result.
     * @return Either the passed-through successful Result or the mapped error
     * Result.
     */
    export function mapError<TSuccess, TInputError, TOutputError>(
        fn: (input: TInputError) => TOutputError,
        input: Result<TSuccess, TInputError>
    ): Result<TSuccess, TOutputError> {
        if (input.succeeded) {
            return input;
        }
        else {
            const mappedError = fn(input.error);
            return new FailedResult(mappedError);
        }
    }


    /**
     * When _input_ is successful, maps the wrapped value using _fn_.
     *
     * @param fn - Function that maps the wrapped success value to another value.
     * @param input - The input Result.
     * @return Either the mapped successful Result or the passed-through failure
     * Result.
     */
    export function mapSuccess<TInputSuccess, TOutputSuccess, TError>(
        fn: (input: TInputSuccess) => TOutputSuccess,
        input: Result<TInputSuccess, TError>
    ): Result<TOutputSuccess, TError> {
        if (input.succeeded) {
            const mappedValue = fn(input.value);
            return new SucceededResult(mappedValue);
        }
        else {
            return input;
        }
    }


    /**
     * Maps values from a source collection until a failed mapping occurs.  If a
     * failure occurs, the mapping stops immediately.
     *
     * @param srcCollection - The source collection
     * @param mappingFunc - The mapping function. Each element from _srcCollection_
     * is run through this function and it must return a successful result wrapping
     * the mapped value or a failure result wrapping the error.
     * @return A successful result wrapping an array of the mapped values or a
     * failure result wrapping the first failure encountered.
     */
    export function mapWhileSuccessful<TInput, TOutput, TError>(
        srcCollection: Array<TInput>,
        mappingFunc: (curItem: TInput) => Result<TOutput, TError>
    ): Result<Array<TOutput>, TError> {
        return srcCollection.reduce<Result<Array<TOutput>, TError>>(
            (acc, curItem) => {
                // If we have already failed, just return the error.
                if (acc.failed) {
                    return acc;
                }

                // We have not yet failed, so process the current item.
                const res = mappingFunc(curItem);
                if (res.succeeded) {
                    // Note:  Do not use array.concat() here, because if the current
                    // result's value is an array, it will be flattened.
                    acc.value.push(res.value);
                    return acc;
                }
                else {
                    return res;
                }
            },
            new SucceededResult([])
        );
    }


    /**
     * Performs side-effects for the given Result
     *
     * @param fn - The function to invoke, passing the Result
     * @param input - The input Result
     * @returns The original input Result
     */
    export function tap<TSuccess, TError>(
        fn: (res: Result<TSuccess, TError>) => void,
        input: Result<TSuccess, TError>
    ): Result<TSuccess, TError> {
        fn(input);
        return input;
    }


    /**
     * Performs side-effects when the specified Result is a failure
     *
     * @param fn - The function to invoke, passing the failed Result's error
     * @param input - The Input Result
     * @returns The original input Result
     */
    export function tapError<TSuccess, TError>(
        fn: (val: TError) => void,
        input: Result<TSuccess, TError>
    ): Result<TSuccess, TError> {
        if (input.failed) {
            fn(input.error);
        }
        return input;
    }


    /**
     * Performs side-effects when the specified Result is successful
     *
     * @param fn - The function to invoke, passing the successful Result's value
     * @param input - The input Result
     * @returns The original input Result
     */
    export function tapSuccess<TSuccess, TError>(
        fn: (val: TSuccess) => void,
        input: Result<TSuccess, TError>
    ): Result<TSuccess, TError> {
        if (input.succeeded) {
            fn(input.value);
        }
        return input;
    }

}
