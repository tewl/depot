export declare class Deferred<ResolveType> {
    promise: Promise<ResolveType>;
    resolve: (result: ResolveType) => void;
    reject: (err: any) => void;
    constructor();
}
/**
 * Connects a (source) Promise to a Deferred (sink).
 * @param thePromise - The promise that will serve as input to `theDeferred`
 * @param theDeferred - The Deferred that will sink the output from `thePromise`
 * @return description
 */
export declare function connectPromiseToDeferred<ResolveType>(thePromise: Promise<ResolveType>, theDeferred: Deferred<ResolveType>): void;
