"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Advances an Iterator the specified number of times.
 * @param it - The Iterator to advance
 * @param offset - The number of times the iterator should be advanced.
 */
function advance(it, offset) {
    "use strict";
    var fn = offset < 0 ? it.prev.bind(it) : it.next.bind(it);
    var numIterations = Math.abs(offset);
    for (var i = 0; i < numIterations; ++i) {
        fn();
    }
}
exports.advance = advance;
/**
 * Calculates the distance between two (ordered) iterators.
 * @param itA - The lower Iterator
 * @param itB - The upper Iterator
 * @returns The distance from itA to itB
 */
function distance(itA, itB) {
    "use strict";
    var distance = 0;
    var itCur = itA.offset(0);
    while (!itCur.equals(itB)) {
        itCur.next();
        ++distance;
    }
    return distance;
}
exports.distance = distance;
/**
 * Attempts to find the specified value in the range [itBegin, itEnd)
 * @param itBegin - The beginning of the range to search (inclusive)
 * @param itEnd - The end of the range to search (exclusive)
 * @param value - The value to search for
 * @returns If successful, an Iterator pointing to the first element in
 * [itBegin, itEnd) whose value equals value.  If a matching element was not
 * found, itEnd is returned.
 */
function find(itBegin, itEnd, value) {
    "use strict";
    var itCur = itBegin;
    while (!itCur.equals(itEnd)) {
        if (itCur.value === value) {
            break;
        }
        itCur.next();
    }
    return itCur;
}
exports.find = find;
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
function partition(itFirst, itLast, pred) {
    "use strict";
    // If the range specified has 0 size, just return.
    if (itFirst.equals(itLast)) {
        return itFirst;
    }
    var itLeft = itFirst.offset(0);
    var itRight = itLast.offset(-1);
    while (!itLeft.equals(itRight)) {
        // Advance left towards the right as long as the predicate is returning true.
        while (!itLeft.equals(itRight) && pred(itLeft.value)) {
            itLeft.next();
        }
        // Advance right towards the left as long as the predicate is returning false.
        while (!itRight.equals(itLeft) && !pred(itRight.value)) {
            itRight.prev();
        }
        if (!itLeft.equals(itRight)) {
            swap(itLeft, itRight);
        }
    }
    // At this point itLeft and itRight are pointing at the same element.  We
    // need to figure out which range that element belongs to.
    if (pred(itLeft.value)) {
        // The second range (of false yielding values) will begin one to the right.
        return itLeft.offset(1);
    }
    else {
        // The second range (of false yielding values) begins here.
        return itRight;
    }
    function swap(itA, itB) {
        var tmpVal = itA.value;
        itA.value = itB.value;
        itB.value = tmpVal;
    }
}
exports.partition = partition;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q3pFLDBEQUEwRDtJQUMxRCxJQUFJLElBQUksQ0FBQyxNQUFNLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDcEIsMkVBQTJFO1FBQzNFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQztLQUMzQjtTQUFNO1FBQ0gsMkRBQTJEO1FBQzNELE9BQU8sT0FBTyxDQUFDO0tBQ2xCO0lBRUQsU0FBUyxJQUFJLENBQUMsR0FBd0IsRUFBRSxHQUF3QjtRQUM1RCxJQUFNLE1BQU0sR0FBYyxHQUFHLENBQUMsS0FBSyxDQUFDO1FBQ3BDLEdBQUcsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFDLEtBQUssQ0FBQztRQUN0QixHQUFHLENBQUMsS0FBSyxHQUFHLE1BQU0sQ0FBQztJQUN2QixDQUFDO0FBQ0wsQ0FBQztBQTNDRCw4QkEyQ0MiLCJmaWxlIjoiYWxnb3JpdGhtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtJdGVyYXRvcn0gZnJvbSBcIi4vbGlzdFwiO1xuXG5cbi8qKlxuICogQWR2YW5jZXMgYW4gSXRlcmF0b3IgdGhlIHNwZWNpZmllZCBudW1iZXIgb2YgdGltZXMuXG4gKiBAcGFyYW0gaXQgLSBUaGUgSXRlcmF0b3IgdG8gYWR2YW5jZVxuICogQHBhcmFtIG9mZnNldCAtIFRoZSBudW1iZXIgb2YgdGltZXMgdGhlIGl0ZXJhdG9yIHNob3VsZCBiZSBhZHZhbmNlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkdmFuY2U8VmFsdWVUeXBlPihpdDogSXRlcmF0b3I8VmFsdWVUeXBlPiwgb2Zmc2V0OiBudW1iZXIpOiB2b2lkIHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGNvbnN0IGZuOiAoKSA9PiB2b2lkID0gb2Zmc2V0IDwgMCA/IGl0LnByZXYuYmluZChpdCkgOiBpdC5uZXh0LmJpbmQoaXQpO1xuICAgIGNvbnN0IG51bUl0ZXJhdGlvbnM6IG51bWJlciA9IE1hdGguYWJzKG9mZnNldCk7XG5cbiAgICBmb3IgKGxldCBpOiBudW1iZXIgPSAwOyBpIDwgbnVtSXRlcmF0aW9uczsgKytpKSB7XG4gICAgICAgIGZuKCk7XG4gICAgfVxufVxuXG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGlzdGFuY2UgYmV0d2VlbiB0d28gKG9yZGVyZWQpIGl0ZXJhdG9ycy5cbiAqIEBwYXJhbSBpdEEgLSBUaGUgbG93ZXIgSXRlcmF0b3JcbiAqIEBwYXJhbSBpdEIgLSBUaGUgdXBwZXIgSXRlcmF0b3JcbiAqIEByZXR1cm5zIFRoZSBkaXN0YW5jZSBmcm9tIGl0QSB0byBpdEJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlPFZhbHVlVHlwZT4oaXRBOiBJdGVyYXRvcjxWYWx1ZVR5cGU+LCBpdEI6IEl0ZXJhdG9yPFZhbHVlVHlwZT4pOiBudW1iZXIge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgbGV0IGRpc3RhbmNlOiBudW1iZXIgPSAwO1xuICAgIGNvbnN0IGl0Q3VyOiBJdGVyYXRvcjxWYWx1ZVR5cGU+ID0gaXRBLm9mZnNldCgwKTtcblxuICAgIHdoaWxlICghaXRDdXIuZXF1YWxzKGl0QikpIHtcbiAgICAgICAgaXRDdXIubmV4dCgpO1xuICAgICAgICArK2Rpc3RhbmNlO1xuICAgIH1cblxuICAgIHJldHVybiBkaXN0YW5jZTtcbn1cblxuXG4vKipcbiAqIEF0dGVtcHRzIHRvIGZpbmQgdGhlIHNwZWNpZmllZCB2YWx1ZSBpbiB0aGUgcmFuZ2UgW2l0QmVnaW4sIGl0RW5kKVxuICogQHBhcmFtIGl0QmVnaW4gLSBUaGUgYmVnaW5uaW5nIG9mIHRoZSByYW5nZSB0byBzZWFyY2ggKGluY2x1c2l2ZSlcbiAqIEBwYXJhbSBpdEVuZCAtIFRoZSBlbmQgb2YgdGhlIHJhbmdlIHRvIHNlYXJjaCAoZXhjbHVzaXZlKVxuICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIHNlYXJjaCBmb3JcbiAqIEByZXR1cm5zIElmIHN1Y2Nlc3NmdWwsIGFuIEl0ZXJhdG9yIHBvaW50aW5nIHRvIHRoZSBmaXJzdCBlbGVtZW50IGluXG4gKiBbaXRCZWdpbiwgaXRFbmQpIHdob3NlIHZhbHVlIGVxdWFscyB2YWx1ZS4gIElmIGEgbWF0Y2hpbmcgZWxlbWVudCB3YXMgbm90XG4gKiBmb3VuZCwgaXRFbmQgaXMgcmV0dXJuZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmaW5kPFZhbHVlVHlwZT4oXG4gICAgaXRCZWdpbjogSXRlcmF0b3I8VmFsdWVUeXBlPixcbiAgICBpdEVuZDogSXRlcmF0b3I8VmFsdWVUeXBlPixcbiAgICB2YWx1ZTogVmFsdWVUeXBlXG4pOiBJdGVyYXRvcjxWYWx1ZVR5cGU+IHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIGNvbnN0IGl0Q3VyOiBJdGVyYXRvcjxWYWx1ZVR5cGU+ID0gaXRCZWdpbjtcblxuICAgIHdoaWxlICghaXRDdXIuZXF1YWxzKGl0RW5kKSkge1xuICAgICAgICBpZiAoaXRDdXIudmFsdWUgPT09IHZhbHVlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgICAgICBpdEN1ci5uZXh0KCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGl0Q3VyO1xufVxuXG5cbi8qKlxuICogUGFydGl0aW9ucyB0aGUgcmFuZ2UgW2l0Rmlyc3QsIGl0TGFzdCkgc28gdGhhdCBhbGwgdmFsdWVzIGluIHRoZSByYW5nZSBmb3JcbiAqIHdoaWNoIHRoZSB1bmFyeSBwcmVkaWNhdGUgcHJlZCByZXR1cm5zIHRydWUgd2lsbCBwcmVjZWRlIGFsbCB0aGUgdmFsdWVzIGZvclxuICogd2hpY2ggaXQgcmV0dXJucyBmYWxzZS4gIFRoaXMgaXMgbm90IGEgc3RhYmxlIHBhcnRpdGlvbi5cbiAqIEBwYXJhbSBpdEZpcnN0IC0gVGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhlIHJhbmdlIHRvIGJlIHBhcnRpdGlvbmVkIChpbmNsdXNpdmUpXG4gKiBAcGFyYW0gaXRMYXN0IC0gVGhlIGVuZCBvZiB0aGUgcmFuZ2UgdG8gYmUgcGFydGl0aW9uZWQgKGV4Y2x1c2l2ZSlcbiAqIEBwYXJhbSBwcmVkIC0gVGhlIHVuYXJ5IHByZWRpY2F0ZSB0aGF0IHdpbGwgYmUgaW52b2tlZCBvbiBlYWNoIGVsZW1lbnRcbiAqIEByZXR1cm5zIEFuIEl0ZXJhdG9yIHBvaW50aW5nIHRvIHRoZSBiZWdpbm5pbmcgb2YgdGhlIHJhbmdlIG9mIGZhbHNlIHlpZWxkaW5nXG4gKiBlbGVtZW50cy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBhcnRpdGlvbjxWYWx1ZVR5cGU+KFxuICAgIGl0Rmlyc3Q6IEl0ZXJhdG9yPFZhbHVlVHlwZT4sXG4gICAgaXRMYXN0OiAgSXRlcmF0b3I8VmFsdWVUeXBlPixcbiAgICBwcmVkOiAgICAodmFsOiBWYWx1ZVR5cGUpID0+IGJvb2xlYW5cbik6IEl0ZXJhdG9yPFZhbHVlVHlwZT4ge1xuICAgIFwidXNlIHN0cmljdFwiO1xuXG4gICAgLy8gSWYgdGhlIHJhbmdlIHNwZWNpZmllZCBoYXMgMCBzaXplLCBqdXN0IHJldHVybi5cbiAgICBpZiAoaXRGaXJzdC5lcXVhbHMoaXRMYXN0KSkge1xuICAgICAgICByZXR1cm4gaXRGaXJzdDtcbiAgICB9XG5cbiAgICBjb25zdCBpdExlZnQ6IEl0ZXJhdG9yPFZhbHVlVHlwZT4gPSBpdEZpcnN0Lm9mZnNldCgwKTtcbiAgICBjb25zdCBpdFJpZ2h0OiBJdGVyYXRvcjxWYWx1ZVR5cGU+ID0gaXRMYXN0Lm9mZnNldCgtMSk7XG5cbiAgICB3aGlsZSAoIWl0TGVmdC5lcXVhbHMoaXRSaWdodCkpIHtcblxuICAgICAgICAvLyBBZHZhbmNlIGxlZnQgdG93YXJkcyB0aGUgcmlnaHQgYXMgbG9uZyBhcyB0aGUgcHJlZGljYXRlIGlzIHJldHVybmluZyB0cnVlLlxuICAgICAgICB3aGlsZSAoIWl0TGVmdC5lcXVhbHMoaXRSaWdodCkgJiYgcHJlZChpdExlZnQudmFsdWUpKSB7IGl0TGVmdC5uZXh0KCk7IH1cblxuICAgICAgICAvLyBBZHZhbmNlIHJpZ2h0IHRvd2FyZHMgdGhlIGxlZnQgYXMgbG9uZyBhcyB0aGUgcHJlZGljYXRlIGlzIHJldHVybmluZyBmYWxzZS5cbiAgICAgICAgd2hpbGUgKCFpdFJpZ2h0LmVxdWFscyhpdExlZnQpICYmICFwcmVkKGl0UmlnaHQudmFsdWUpKSB7IGl0UmlnaHQucHJldigpOyB9XG5cbiAgICAgICAgaWYgKCFpdExlZnQuZXF1YWxzKGl0UmlnaHQpKSB7XG4gICAgICAgICAgICBzd2FwKGl0TGVmdCwgaXRSaWdodCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBdCB0aGlzIHBvaW50IGl0TGVmdCBhbmQgaXRSaWdodCBhcmUgcG9pbnRpbmcgYXQgdGhlIHNhbWUgZWxlbWVudC4gIFdlXG4gICAgLy8gbmVlZCB0byBmaWd1cmUgb3V0IHdoaWNoIHJhbmdlIHRoYXQgZWxlbWVudCBiZWxvbmdzIHRvLlxuICAgIGlmIChwcmVkKGl0TGVmdC52YWx1ZSkpIHtcbiAgICAgICAgLy8gVGhlIHNlY29uZCByYW5nZSAob2YgZmFsc2UgeWllbGRpbmcgdmFsdWVzKSB3aWxsIGJlZ2luIG9uZSB0byB0aGUgcmlnaHQuXG4gICAgICAgIHJldHVybiBpdExlZnQub2Zmc2V0KDEpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIFRoZSBzZWNvbmQgcmFuZ2UgKG9mIGZhbHNlIHlpZWxkaW5nIHZhbHVlcykgYmVnaW5zIGhlcmUuXG4gICAgICAgIHJldHVybiBpdFJpZ2h0O1xuICAgIH1cblxuICAgIGZ1bmN0aW9uIHN3YXAoaXRBOiBJdGVyYXRvcjxWYWx1ZVR5cGU+LCBpdEI6IEl0ZXJhdG9yPFZhbHVlVHlwZT4pOiB2b2lkIHtcbiAgICAgICAgY29uc3QgdG1wVmFsOiBWYWx1ZVR5cGUgPSBpdEEudmFsdWU7XG4gICAgICAgIGl0QS52YWx1ZSA9IGl0Qi52YWx1ZTtcbiAgICAgICAgaXRCLnZhbHVlID0gdG1wVmFsO1xuICAgIH1cbn1cbiJdfQ==
