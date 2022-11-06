/**
 * An interface that describes an item that resides in a larger array. For
 * example, this interface could be used to designate a failure in an array of
 * actions.
 */
export interface IIndexedItem<T> {
    index: number;
    item:  T;
}


/**
 * Maps an iterable collection to an indexed iterable collection.  A generator
 * is used so that even infinite sequences can be indexed.
 *
 * Example usage:
 * const arr = ["fred", "wilma", "betty", "barney"];
 * const i = Array.from(indexed(arr));
 *
 * @param col - The collection to be indexed
 */
export function* indexed<T>(col: Iterable<T>): Generator<IIndexedItem<T>> {
    let curIndex = 0;
    const iter = col[Symbol.iterator]();
    while (true) {
        const next = iter.next();
        if (next.done) {
            break;
        }
        yield {
            index: curIndex++,
            item:  next.value
        };
    }

}
