import { Iterator } from "./list";
/**
 * Advances an Iterator the specified number of times.
 * @param it - The Iterator to advance
 * @param offset - The number of times the iterator should be advanced.
 */
export declare function advance<ValueType>(it: Iterator<ValueType>, offset: number): void;
/**
 * Calculates the distance between two (ordered) iterators.
 * @param itA - The lower Iterator
 * @param itB - The upper Iterator
 * @returns The distance from itA to itB
 */
export declare function distance<ValueType>(itA: Iterator<ValueType>, itB: Iterator<ValueType>): number;
/**
 * Attempts to find the specified value in the range [itBegin, itEnd)
 * @param itBegin - The beginning of the range to search (inclusive)
 * @param itEnd - The end of the range to search (exclusive)
 * @param value - The value to search for
 * @returns If successful, an Iterator pointing to the first element in
 * [itBegin, itEnd) whose value equals value.  If a matching element was not
 * found, itEnd is returned.
 */
export declare function find<ValueType>(itBegin: Iterator<ValueType>, itEnd: Iterator<ValueType>, value: ValueType): Iterator<ValueType>;
/**
 * Partitions the range [itFirst, itLast) so that all values in the range for
 * which the unary predicate pred returns true will precede all the values for
 * which it returns false.  This is not a stable partition.
 * @param itFirst - The first element in the range to be partitioned (inclusive)
 * @param itLast - The end of the range to be partitioned (exclusive)
 * @param pred - The unary predicate that will be invoked on each element
 * @returns An Iterator pointing to the beginning of the range of false yielding
 * elements.
 */
export declare function partition<ValueType>(itFirst: Iterator<ValueType>, itLast: Iterator<ValueType>, pred: (val: ValueType) => boolean): Iterator<ValueType>;
