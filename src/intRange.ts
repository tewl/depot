
/**
 * Creates an iterable range of numbers that can be iterated over using
 * standard iterator protocol.
 *
 * @example
 * for (const item of new IntRange(0, 10)) {
 *     console.log(item);   // prints 0 to 9
 * }
 */
export class IntRange implements Iterable<number> {
    private readonly _first: number;
    private readonly _last: number;


    /**
     * Creates a new IntRange containing the integers from begin (inclusive) to
     * end (exclusive).
     *
     * @param begin - The first integer (inclusive)
     * @param end - The end integer (exclusive)
     */
    constructor(begin: number, end: number) {
        this._first = begin;
        this._last = end;
    }

    *[Symbol.iterator](): Iterator<number> {
        let current = this._first;
        while (current < this._last) {
            yield current++;
        }
    }

    //
    // An alternative iterator implementation not using generator.
    //

    // [Symbol.iterator](): Iterator<number, undefined> {
    //     let current = this._first;
    //     return {
    //         next: () => {
    //             if (current < this._last) {
    //                 return {value: current++, done: false};
    //             }
    //             else {
    //                 return {value: undefined, done: true};
    //             }
    //         }
    //     };
    // }
}
