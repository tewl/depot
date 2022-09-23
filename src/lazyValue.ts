

type ComputeFn<T> = () => T;


export class LazyValue<T> {

    ////////////////////////////////////////////////////////////////////////////////
    private readonly _computeFn: ComputeFn<T>;
    private _cachedValue: T | undefined;

    ////////////////////////////////////////////////////////////////////////////////
    public constructor(computeFn: ComputeFn<T>) {
        this._computeFn = computeFn;
    }

    ////////////////////////////////////////////////////////////////////////////////
    public get value(): T {
        if (this._cachedValue === undefined) {
            this._cachedValue = this._computeFn();
        }

        return this._cachedValue;
    }

    ////////////////////////////////////////////////////////////////////////////////
    public invalidate(): void {
        this._cachedValue = undefined;
    }

}
