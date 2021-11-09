import {Iterator} from "./list";


/**
 * Advances an Iterator the specified number of times.
 * @param it - The Iterator to advance
 * @param offset - The number of times the iterator should be advanced.
 */
export function advance<TValue>(it: Iterator<TValue>, offset: number): void
{
    const fn: () => void = offset < 0 ? it.prev.bind(it) : it.next.bind(it);
    const numIterations: number = Math.abs(offset);

    for (let i = 0; i < numIterations; ++i)
    {
        fn();
    }
}


/**
 * Calculates the distance between two (ordered) iterators.
 * @param itA - The lower Iterator
 * @param itB - The upper Iterator
 * @returns The distance from itA to itB
 */
export function distance<TValue>(itA: Iterator<TValue>, itB: Iterator<TValue>): number
{
    let distance = 0;
    const itCur: Iterator<TValue> = itA.offset(0);

    while (!itCur.equals(itB))
    {
        itCur.next();
        ++distance;
    }

    return distance;
}


/**
 * Attempts to find the specified value in the range [itBegin, itEnd)
 * @param itBegin - The beginning of the range to search (inclusive)
 * @param itEnd - The end of the range to search (exclusive)
 * @param value - The value to search for
 * @returns If successful, an Iterator pointing to the first element in
 * [itBegin, itEnd) whose value equals value.  If a matching element was not
 * found, itEnd is returned.
 */
export function find<TValue>(
    itBegin: Iterator<TValue>,
    itEnd: Iterator<TValue>,
    value: TValue
): Iterator<TValue>
{
    const itCur: Iterator<TValue> = itBegin;

    while (!itCur.equals(itEnd))
    {
        if (itCur.value === value)
        {
            break;
        }
        itCur.next();
    }

    return itCur;
}


/**
 * Partitions the range [itFirst, itLast) so that all values in the range for
 * which the unary predicate _pred_ returns true will precede all the values for
 * which it returns false.  This is not a stable partition.
 * @param itFirst - The first element in the range to be partitioned (inclusive)
 * @param itLast - The end of the range to be partitioned (exclusive)
 * @param pred - The unary predicate that will be invoked on each element
 * @returns An Iterator pointing to the beginning of the range of false yielding
 * elements.
 */
export function partition<TValue>(
    itFirst: Iterator<TValue>,
    itLast:  Iterator<TValue>,
    pred:    (val: TValue) => boolean
): Iterator<TValue>
{
    // If the range specified has 0 size, just return.
    if (itFirst.equals(itLast))
    {
        return itFirst;
    }

    const itLeft: Iterator<TValue> = itFirst.offset(0);
    const itRight: Iterator<TValue> = itLast.offset(-1);

    while (!itLeft.equals(itRight))
    {
        // Advance left towards the right as long as the predicate is returning true.
        while (!itLeft.equals(itRight) && pred(itLeft.value)) { itLeft.next(); }

        // Advance right towards the left as long as the predicate is returning false.
        while (!itRight.equals(itLeft) && !pred(itRight.value)) { itRight.prev(); }

        if (!itLeft.equals(itRight))
        {
            swap(itLeft, itRight);
        }
    }

    // At this point itLeft and itRight are pointing at the same element.  We
    // need to figure out which range that element belongs to.
    if (pred(itLeft.value))
    {
        // The second range (of false yielding values) will begin one to the right.
        return itLeft.offset(1);
    }
    else
    {
        // The second range (of false yielding values) begins here.
        return itRight;
    }

    function swap(itA: Iterator<TValue>, itB: Iterator<TValue>): void
    {
        const tmpVal: TValue = itA.value;
        itA.value = itB.value;
        itB.value = tmpVal;
    }
}
