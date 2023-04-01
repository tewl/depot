import { HashFn } from "./hash";
import { FailedResult, Result, SucceededResult } from "./result";


/**
 * A set collection that contains value objects that are compared using their
 * hashes.
 *
 * To use this set
 *   - The value type must implement IHashable.  Values considered equal must
 *     hash to the same value.
 */
export class VoSet<TVal> implements Iterable<TVal>, ReadonlySet<TVal> {

    private readonly _backingStore: Map<string, TVal>;
    private readonly _hashFn: HashFn<TVal>;


    [Symbol.toStringTag] = "VoSet";


    public constructor(hashFn: HashFn<TVal>, iterable?: Iterable<TVal>) {
        this._hashFn = hashFn;
        this._backingStore = new Map<string, TVal>();

        if (iterable) {
            for (const val of iterable) {
                this.add(val);
            }
        }
    }


    /**
     * Appends a new element with a specified value to the end of the Set.
     */
    public add(value: TVal): this {

        const hash = this._hashFn(value);
        this._backingStore.set(hash, value);
        return this;
    }


    /**
     * Removes all elements from this set.
     */
    public clear(): void {
        this._backingStore.clear();
    }

    /**
     * Removes a specified value from this set.
     * @returns Returns true if an equal element in the set existed and has been
     * removed, or false if the element does not exist.
     */
    public delete(value: TVal): boolean {
        const hash = this._hashFn(value);
        const wasPresent = this._backingStore.delete(hash);
        return wasPresent;
    }


    /**
     * @returns a boolean indicating whether an equal element exists in the set
     * or not.
     */
    public has(value: TVal): boolean {
        const hash = this._hashFn(value);
        const isPresent = this._backingStore.has(hash);
        return isPresent;
    }


    /**
     * Gets an item from this set that is considered equal to the specified
     * value
     *
     * @param value - The value to search for.
     * @returns If an item was found, a successful Result containing the found
     * value.  Otherwise, a failed Result.
     */
    public get(value: TVal): Result<TVal, void> {
        const hash = this._hashFn(value);

        // Use has() to first determine whether there is an entry with the key
        // we are looking for.  We are doing this extra step so that we can
        // differentiate between the case where there is no entry and the case
        // where there is an entry with a value of undefined.
        if (this._backingStore.has(hash)) {
            const val = this._backingStore.get(hash)!;
            return new SucceededResult(val);
        }
        return new FailedResult(undefined);
    }


    /**
     * The number of elements in this set.
     */
    public get size(): number {
        return this._backingStore.size;
    }


    /**
     * Makes this collection an Iterable, which enables instances to be used
     * with other language features such as for...of, Array.from() and spread
     * operator.
     */
    public *[Symbol.iterator](): IterableIterator<TVal> {
        // Use the backing store Set in this implementation.
        const iter = this._backingStore[Symbol.iterator]();

        while (true) {
            const nextResult = iter.next();
            if (nextResult.done) {
                break;
            }

            const [__hash, val] = nextResult.value;
            yield val;
        }
    }


    /**
     * Returns an Iterator the yields this set's key-value pairs.
     */
    public *entries(): IterableIterator<[TVal, TVal]> {
        // Use the backing store Set for this implementation.
        const iter = this._backingStore[Symbol.iterator]();

        while (true) {
            const nextResult = iter.next();
            if (nextResult.done) {
                break;
            }

            const [__hash, val] = nextResult.value;
            yield [val, val];
        }
    }


    /**
     * Returns an Iterator that yields this set's keys.
     */
    public *keys(): IterableIterator<TVal> {
        const iter = this._backingStore[Symbol.iterator]();

        while (true) {
            const nextResult = iter.next();
            if (nextResult.done) {
                break;
            }

            const [__hash, val] = nextResult.value;
            yield val;
        }
    }


    /**
     * Returns an Iterator that yields this set's values.
     */
    public *values(): IterableIterator<TVal> {
        const iter = this._backingStore[Symbol.iterator]();

        while (true) {
            const nextResult = iter.next();
            if (nextResult.done) {
                break;
            }

            const [__hash, val] = nextResult.value;
            yield val;
        }
    }


    /**
     * Executes a function once for each value in this set, in insertion order.
     *
     * @param callbackFn - A function to execute for each entry in the set.
     * This function is called with the value, the key (same as the value), and
     * the set.
     * @param thisArg - Value to use as _this_ when executing _callbackFn_.
     */
    public forEach(
        callbackFn: (value: TVal, value2: TVal, set: VoSet<TVal>) => void,
        thisArg?: unknown
    ): void {
        const cb = callbackFn.bind(thisArg);
        this._backingStore.forEach(
            (val) => {
                cb(val, val, this);
            }
        );
    }

}
