/**
 * Class that provides the ability to start with a single value and pass it
 * through a collection of functions, each function receiving its input from the
 * previous function's output.  Instances of this class can be thought of as a
 * piped value.  All methods are strongly typed.
 */
export class Pipe<T> {

    // This is an alternative way to implement pipe().  The advantage is that it
    // does not require lots of overloads in order to be type safe.  The
    // disadvantages are that (1) every function must be wrapped with pipe,
    // which can obscure the code that's important, and (2) it requires use of
    // .end to unwrap the final value.

    /**
     * Starts a new pipe() chain with the specified value.
     *
     * @param v - The value that will be used to start the pipe chain.
     * @returns A new Pipe instance, representing the specified piped value
     */
    public static begin<T>(v: T): Pipe<T> {
        return new Pipe(v);
    }


    // #region Instance Members
    private readonly _val: T;
    // #endregion


    /**
     * Private constructor.  Use static methods to create instances.
     *
     * @param val - The value wrapped by this instance.
     */
    private constructor(val: T) {
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
    public pipe<TOutput>(fn: (input: T) => TOutput): Pipe<TOutput> {
        const outVal = fn(this._val);
        return new Pipe(outVal);
    }


    /**
     * Used at the end of a pipe() chain to retrieve the resulting value.
     */
    public get end(): T {
        return this._val;
    }
}
