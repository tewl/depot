export class Deferred<TResolve>
{
    public readonly promise: Promise<TResolve>;
    public resolve: (result: TResolve) => void;
    public reject: (err: unknown) => void;

    constructor()
    {
        // The following temporary assignments are here to get rid of a bogus TS
        // error: "TS2564: Property 'resolve' has no initializer and is not
        // definitely assigned in the constructor."
        this.resolve = (): void => { return; };
        this.reject = (): void => { return; };

        this.promise = new Promise((resolve: (result: TResolve) => void, reject: (err: unknown) => void) =>
        {
            this.resolve = resolve;
            this.reject = reject;
        });

        // Make this object immutable.
        Object.freeze(this);
    }
}


/**
 * Connects a (source) Promise to a Deferred (sink).
 * @param thePromise - The promise that will serve as input to `theDeferred`
 * @param theDeferred - The Deferred that will sink the output from `thePromise`
 * @return description
 */
export function connectPromiseToDeferred<TResolve>(
    thePromise: Promise<TResolve>,
    theDeferred: Deferred<TResolve>
): void
{
    thePromise
    .then(
        (result: TResolve) => { theDeferred.resolve(result); },
        (err) => { theDeferred.reject(err); }
    );
}
