
/**
 * Provides an initial value with which to start a pipeline containing
 * synchronous and asynchronous functions.
 *
 * @param startVal - The value (synchronous or asynchronous) to start the
 * pipeline with.
 * @returns An object wrapping the pipelined value.  Use its end() method to get
 * the value.
 */
export function pipeAsync<T>(startVal: T | Promise<T>): PipeAsyncValue<T> {
    return new PipeAsyncValue(Promise.resolve(startVal));
}


/**
 * Class that represents a Promise whose resolved value can be piped into a
 * subsequent function, forming a pipeline.
 */
class PipeAsyncValue<T> {

    private readonly _val: Promise<T>;


    public constructor(val: Promise<T>) {
        this._val = val;
    }


    /**
     * Passes this instance's (resolved) value into the specified function.
     *
     * @param fn - The next function in the pipeline, which will receive the
     * current (resolved) value as input.  This function may be synchronous or
     * asynchronous.  If a synchronous value is returned, it will automatically
     * be wrapped in a Promise.
     * @returns An object wrapping the new function's asynchronous return value
     * (to allow further piping)
     */
    public pipe<TOutput>(fn: (input: T) => TOutput | Promise<TOutput>): PipeAsyncValue<TOutput> {

        const nextPromise =
            this._val
            .then((thisVal: T) => {
                return Promise.resolve(fn(thisVal));
            });

        return new PipeAsyncValue(nextPromise);
    }


    /**
     * Used at the end of a pipeAsync() chain to retrieve the chain's resolved
     * value.
     *
     * @returns The inner value.
     */
    public async end(): Promise<T> {
        return this._val;
    }
}
