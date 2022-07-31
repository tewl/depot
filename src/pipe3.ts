
export function pipe<T>(startVal: T): PipeValue<T> {
    return new PipeValue(startVal);
}

/**
 * Class that provides the ability to start with a single value and pass it
 * through a collection of functions, each function receiving its input from the
 * previous function's output.  Instances of this class can be thought of as a
 * piped value.  All methods are strongly typed.
 */
class PipeValue<T> {


    // #region Instance Members
    private readonly _val: T;
    // #endregion


    public constructor(val: T) {
        this._val = val;
    }


    /**
     * Pipes this instance's value into the specified function to obtain the
     * output.
     *
     * @param fn - The function this value will be passed into to obtain the
     * output that may eventually be passed into the next piped function.
     * @returns A new piped value.
     */
    public pipe<TOutput>(fn: (input: T) => TOutput): PipeValue<TOutput> {
        const outVal = fn(this._val);
        return new PipeValue(outVal);
    }


    /**
     * Used at the end of a pipe() chain to retrieve the resulting value.
     */
    public get end(): T {
        return this._val;
    }
}
