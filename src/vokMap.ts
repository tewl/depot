import { IHashable } from "./hashable";


interface IMapData<TKey extends IHashable, TVal> {
    clientKey: TKey;
    clientValue: TVal;
}


/**
 * To use this map
 *   - The key type must implement IHashable.  Values considered equal must
 *     hash to the same value.
 *   - Keys must not mutate after they have been set.  This collection does not
 *     enforce immutability itself.
 */
export class VokMap<TKey extends IHashable, TVal> implements Iterable<[TKey, TVal]> {

    private readonly _backingStore: Map<string, IMapData<TKey, TVal>>;

    [Symbol.toStringTag] = "VokMap";

    /**
     * Constructor
     *
     * @param iterable - An array or other iterable containing key-value pairs
     * that will be added to the new map.
     */
    public constructor(iterable?: Iterable<[TKey, TVal]>) {
        this._backingStore = new Map<string, IMapData<TKey, TVal>>();

        if (iterable) {
            for (const [key, val] of iterable) {
                this.set(key, val);
            }
        }
    }


    /**
     * The number of elements in this map.
     */
    public get size(): number {
        return this._backingStore.size;
    }


    /**
     * Makes this collection an Iterable, which enables instances to be used
     * with other language features such as for...of, Array.from() and spread
     * operator.
     */
    *[Symbol.iterator](): Iterator<[TKey, TVal]> {
        // Get an iterator to the backing store's map, and use it in this
        // implementation.
        const iter = this._backingStore[Symbol.iterator]();

        while (true) {
            const nextResult = iter.next();
            if (nextResult.done) {
                break;
            }

            const [__hash, clientData] = nextResult.value;
            yield [clientData.clientKey, clientData.clientValue];
        }
    }


    /**
     * Returns an Iterator the yields this map's key-value pairs.
     */
    *entries(): IterableIterator<[TKey, TVal]> {
        // Get an iterator to the backing store's map, and use it in this
        // implementation.
        const iter = this._backingStore[Symbol.iterator]();

        while (true) {
            const nextResult = iter.next();
            if (nextResult.done) {
                break;
            }

            const [__hash, clientData] = nextResult.value;
            yield [clientData.clientKey, clientData.clientValue];
        }
    }


    /**
     * Returns an Iterator that yields this map's keys.
     */
    *keys(): IterableIterator<TKey> {
        const iter = this._backingStore[Symbol.iterator]();

        while (true) {
            const nextResult = iter.next();
            if (nextResult.done) {
                break;
            }

            const [__hash, clientData] = nextResult.value;
            yield clientData.clientKey;
        }
    }


    /**
     * Returns an Iterator that yields this map's values.
     */
    *values(): IterableIterator<TVal> {
        const iter = this._backingStore[Symbol.iterator]();

        while (true) {
            const nextResult = iter.next();
            if (nextResult.done) {
                break;
            }

            const [__hash, clientData] = nextResult.value;
            yield clientData.clientValue;
        }
    }

    /**
     * Adds or updates an element within this map.
     *
     * @param key - The key of the element to add or replace.
     * @param val - The value of the element to set.
     * @returns This map instance (for chaining)
     */
    public set(key: TKey, val: TVal): this {
        const hash = key.getHash();
        this._backingStore.set(hash, {clientKey: key, clientValue: val});
        return this;
    }


    /**
     * Returns the value associated with the specified key from this map.
     *
     * @param key - The key of the element to get
     * @returns If found, a reference to the key's associated value.  undefined
     * is returned if the specified key does not exist in this map.
     */
    public get(key: TKey): TVal | undefined {
        const hash = key.getHash();
        const clientData = this._backingStore.get(hash);
        return clientData?.clientValue;
    }

    /**
     * Determines whether an element with the specified key exists in this map
     *
     * @param key - The key of the element to check
     * @returns true if the key was found; false otherwise.
     */
    public has(key: TKey): boolean {
        const hash = key.getHash();
        return this._backingStore.has(hash);
    }

    /**
     * Removes the specified element from this map.
     *
     * @param key - The key of the element to remove
     * @returns true if the element was found and removed; false if the element
     * could not be found.
     */
    public delete(key: TKey): boolean {
        const hash = key.getHash();
        const wasDeleted = this._backingStore.delete(hash);
        return wasDeleted;
    }

    /**
     * Removes all elements from this map.
     */
    public clear(): void {
        this._backingStore.clear();
    }


    /**
     * Executes a function once per each key-value pair in this map.
     * @param fn - Function that will be called with the following arguments:
     *     value, key, map
     * @param thisArg - Value to be used as this when executing the callback
     *     function.
     */
    public forEach(
        fn: (value: TVal, key: TKey, map: VokMap<TKey, TVal>) => void,
        thisArg?: unknown
    ): void {
        const cbFn = fn.bind(thisArg);
        for (const [key, val] of this) {
            cbFn(val, key, this);
        }
    }

}
