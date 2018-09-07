import * as BBPromise from "bluebird";


export class Deferred<ResolveType>
{
    public promise: Promise<ResolveType>;
    public resolve: (result: ResolveType) => void;
    public reject: (err: any) => void;

    constructor()
    {
        // The following temporary assignments are here to get rid of a bogus TS
        // error: "TS2564: Property 'resolve' has no initializer and is not
        // definitely assigned in the constructor."
        this.resolve = (): void => {};
        this.reject = (): void => {};

        this.promise = new BBPromise((resolve: (result: ResolveType) => void, reject: (err: any) => void) => {
            this.resolve = resolve;
            this.reject = reject;
        });

        // Make this object immutable.
        Object.freeze(this);
    }
}
