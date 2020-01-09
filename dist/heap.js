"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var CompareResult;
(function (CompareResult) {
    CompareResult[CompareResult["LESS"] = -1] = "LESS";
    CompareResult[CompareResult["EQUAL"] = 0] = "EQUAL";
    CompareResult[CompareResult["GREATER"] = 1] = "GREATER";
})(CompareResult = exports.CompareResult || (exports.CompareResult = {}));
/**
 * A heap is a binary tree with two special properties:
 * 1. Order
 *     For every node n, the value in n is greater than or equal to the values
 *     in its children (and thus is also greater than or equal to all of the
 *     values in its subtrees).
 * 2. Shape
 *     A. All leaves are at depth d or d-1.
 *     B. All of the leaves at depth d-1 are to the right of the leaves at depth
 *        d.
 *     C. (1) There is at most 1 node with just 1 child.
 *        (2) That child is the left child of its parent.
 *        (3) It is the rightmost leaf at depth d.
 */
var Heap = /** @class */ (function () {
    // endregion
    /**
     * Creates a new Heap instance.
     * @param compareFunc - A function that will be used to sort items in this
     * heap.
     */
    function Heap(compareFunc) {
        this._compareFunc = compareFunc;
        // The element at index 0 is not used.  The root of the binary tree is
        // at index 1.
        this._store = [undefined];
    }
    Object.defineProperty(Heap.prototype, "length", {
        /**
         * Returns the number of items in this heap
         * @return The number of items in this heap
         */
        get: function () {
            // Subtract 1, because element 0 is never used.
            return this._store.length - 1;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Heap.prototype, "isEmpty", {
        /**
         * Determines whether this heap is empty.
         * @return true if this heap is empty; false otherwise
         */
        get: function () {
            return this.length === 0;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Heap.prototype, "depth", {
        /**
         * Calculates the maximum depth of this heap.
         * @return The maximum depth of the this heap
         */
        get: function () {
            if (this.length === 0) {
                return 0;
            }
            // Because this tree is filled in from left to right, the maximum depth
            // can be obtained by walking down the leftmost branches of this tree.
            var curDepth = 0;
            var curIndex = 1;
            while (curIndex !== undefined) {
                curDepth++;
                curIndex = this.leftChild(curIndex);
            }
            return curDepth;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a new value to this heap
     * @param val - The value to be added to this heap
     */
    Heap.prototype.push = function (val) {
        // Push the new value onto the end of the array.  It will become the new
        // rightmost leaf.
        this._store.push(val);
        this.float(this._store.length - 1);
    };
    /**
     * Gets the greatest item from this heap (without removing it)
     * @return The item with the greatest value (as determined by compareFunc)
     */
    Heap.prototype.peak = function () {
        if (this._store.length === 0) {
            return undefined;
        }
        return this._store[1];
    };
    /**
     * Gets the greatest item from this heap
     * @return The item with the greatest value (as determined by compareFunc)
     */
    Heap.prototype.pop = function () {
        // The length of the backing store upon start.
        var origStoreLength = this._store.length;
        if (origStoreLength <= 1) {
            // Only the unused item at index 0 exists. This heap is empty.
            return undefined;
        }
        // Store a copy of the root value.
        var retVal = this._store[1];
        // Move the last leaf up to the root.
        this._store[1] = this._store[origStoreLength - 1];
        this._store.length = origStoreLength - 1;
        // If this heap is not empty, sink the root item to its proper location.
        if (this._store.length > 1) {
            this.sink(1);
        }
        return retVal;
    };
    ////////////////////////////////////////////////////////////////////////////
    // Helper Methods
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Iteratively compares the value at the specified index with its parent and
     * swaps them if the child value is greater.
     * @param index - The index of the item to float.
     */
    Heap.prototype.float = function (index) {
        if (!this.isRoot(index)) {
            var parentIndex = this.parentIndex(index);
            if (this.compare(parentIndex, index) === CompareResult.LESS) {
                this.swap(parentIndex, index);
                this.float(parentIndex);
            }
        }
    };
    /**
     * Iteratively compares the value at the specified index with its *largest
     * child* and swaps them if the child value is greater.
     * @param index - The index of the item to sink
     */
    Heap.prototype.sink = function (index) {
        var leftChildIndex = this.leftChild(index);
        if (leftChildIndex === undefined) {
            // There are no children.  We are done.
            return;
        }
        // Compare against the greater of the value's children.
        var childIndexToCompareTo;
        var rightChildIndex = this.rightChild(index);
        if (rightChildIndex === undefined) {
            // There is only a left child.  Compare with it.
            childIndexToCompareTo = leftChildIndex;
        }
        else {
            var childCompareResult = this.compare(leftChildIndex, rightChildIndex);
            if (childCompareResult === CompareResult.LESS) {
                // The left child is less, so compare against the right child.
                childIndexToCompareTo = rightChildIndex;
            }
            else {
                // The left child is equal or greater than the right child.
                childIndexToCompareTo = leftChildIndex;
            }
        }
        if (this.compare(index, childIndexToCompareTo) === CompareResult.LESS) {
            this.swap(index, childIndexToCompareTo);
            this.sink(childIndexToCompareTo);
        }
    };
    /**
     * Determines whether the specified index is the root of this heap's tree.
     * @param index - The index of the item to check
     * @return true if the specified index is the root of this heap; false
     * otherwise.
     */
    Heap.prototype.isRoot = function (index) {
        if (!this.isValidIndex(index)) {
            throw new Error("Invalid index passed to isRoot().");
        }
        return index === 1;
    };
    /**
     * Compares the items at the specified indices
     * @param indexA - Index of the left side argument
     * @param indexB - Index of the right sided argument
     * @return The result of comparing the specified items
     */
    Heap.prototype.compare = function (indexA, indexB) {
        if (!this.isValidIndex(indexA) ||
            !this.isValidIndex(indexB)) {
            throw new Error("Invalid index passed to compare().");
        }
        return this._compareFunc(this._store[indexA], this._store[indexB]);
    };
    /**
     * Swaps the items at the specified indices
     * @param indexA - Index of an item to swap
     * @param indexB - Index of an item to swap
     */
    Heap.prototype.swap = function (indexA, indexB) {
        if (!this.isValidIndex(indexA) ||
            !this.isValidIndex(indexB)) {
            throw new Error("Invalid index passed to swap().");
        }
        var tmp = this._store[indexA];
        this._store[indexA] = this._store[indexB];
        this._store[indexB] = tmp;
    };
    /**
     * Determines whether index is a valid index for this heap
     * @param index - The index to check
     * @return true if index is valid; false otherwise
     */
    Heap.prototype.isValidIndex = function (index) {
        if (index === 0) {
            return false;
        }
        var endIndex = this._store.length;
        return index < endIndex;
    };
    /**
     * Finds the parent of the specified item
     * @param index - Index of the item for which the parent index is to be found
     * @return The parent index.  Undefined if index is the root of this heap
     */
    Heap.prototype.parentIndex = function (index) {
        if (!this.isValidIndex(index)) {
            throw new Error("Invalid index passed to parentIndex().");
        }
        else if (index === 1) {
            // It is the root value.
            return undefined;
        }
        else {
            return Math.floor(index / 2);
        }
    };
    /**
     * Finds the left child of the specified item
     * @param index - Index of the item for which the left child index is to be found
     * @return The left child index.  Undefined if index has no left child
     */
    Heap.prototype.leftChild = function (index) {
        if (!this.isValidIndex(index)) {
            throw new Error("Invalid index passed to leftChild().");
        }
        var leftChildIndex = index * 2;
        return this.isValidIndex(leftChildIndex) ? leftChildIndex : undefined;
    };
    /**
     * Finds the right child of the specified item
     * @param index - Index of the item for which the right child index is to be found
     * @return The right child index.  Undefined if index has no right child
     */
    Heap.prototype.rightChild = function (index) {
        if (!this.isValidIndex(index)) {
            throw new Error("Invalid index passed to rightChild().");
        }
        var rightChildIndex = index * 2 + 1;
        return this.isValidIndex(rightChildIndex) ? rightChildIndex : undefined;
    };
    return Heap;
}());
exports.Heap = Heap;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LENBQUMsY0FBYyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDMUUsQ0FBQztJQUdEOzs7O09BSUc7SUFDSyx5QkFBVSxHQUFsQixVQUFtQixLQUFhO1FBRTVCLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxDQUFDLEtBQUssQ0FBQyxFQUFFO1lBQzNCLE1BQU0sSUFBSSxLQUFLLENBQUMsdUNBQXVDLENBQUMsQ0FBQztTQUM1RDtRQUNELElBQU0sZUFBZSxHQUFHLEtBQUssR0FBRyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQ3RDLE9BQU8sSUFBSSxDQUFDLFlBQVksQ0FBQyxlQUFlLENBQUMsQ0FBQyxDQUFDLENBQUMsZUFBZSxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDNUUsQ0FBQztJQUVMLFdBQUM7QUFBRCxDQWxUQSxBQWtUQyxJQUFBO0FBbFRZLG9CQUFJIiwiZmlsZSI6ImhlYXAuanMiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZW51bSBDb21wYXJlUmVzdWx0XG57XG4gICAgTEVTUyAgICA9IC0xLFxuICAgIEVRVUFMICAgPSAwLFxuICAgIEdSRUFURVIgPSAxXG59XG5cblxudHlwZSBDb21wYXJlRnVuYzxUPiA9IChhOiBULCBiOiBUKSA9PiBDb21wYXJlUmVzdWx0O1xuXG5cbi8qKlxuICogQSBoZWFwIGlzIGEgYmluYXJ5IHRyZWUgd2l0aCB0d28gc3BlY2lhbCBwcm9wZXJ0aWVzOlxuICogMS4gT3JkZXJcbiAqICAgICBGb3IgZXZlcnkgbm9kZSBuLCB0aGUgdmFsdWUgaW4gbiBpcyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gdGhlIHZhbHVlc1xuICogICAgIGluIGl0cyBjaGlsZHJlbiAoYW5kIHRodXMgaXMgYWxzbyBncmVhdGVyIHRoYW4gb3IgZXF1YWwgdG8gYWxsIG9mIHRoZVxuICogICAgIHZhbHVlcyBpbiBpdHMgc3VidHJlZXMpLlxuICogMi4gU2hhcGVcbiAqICAgICBBLiBBbGwgbGVhdmVzIGFyZSBhdCBkZXB0aCBkIG9yIGQtMS5cbiAqICAgICBCLiBBbGwgb2YgdGhlIGxlYXZlcyBhdCBkZXB0aCBkLTEgYXJlIHRvIHRoZSByaWdodCBvZiB0aGUgbGVhdmVzIGF0IGRlcHRoXG4gKiAgICAgICAgZC5cbiAqICAgICBDLiAoMSkgVGhlcmUgaXMgYXQgbW9zdCAxIG5vZGUgd2l0aCBqdXN0IDEgY2hpbGQuXG4gKiAgICAgICAgKDIpIFRoYXQgY2hpbGQgaXMgdGhlIGxlZnQgY2hpbGQgb2YgaXRzIHBhcmVudC5cbiAqICAgICAgICAoMykgSXQgaXMgdGhlIHJpZ2h0bW9zdCBsZWFmIGF0IGRlcHRoIGQuXG4gKi9cbmV4cG9ydCBjbGFzcyBIZWFwPFQ+XG57XG4gICAgLy8gcmVnaW9uIERhdGEgTWVtYmVyc1xuXG4gICAgcHJpdmF0ZSByZWFkb25seSBfY29tcGFyZUZ1bmM6IENvbXBhcmVGdW5jPFQ+O1xuXG4gICAgLy8gQmFja2luZyBzdG9yZSBmb3IgdGhlIGl0ZW1zIHN0b3JlZCBpbiB0aGlzIGhlYXAuIFRoZSBlbGVtZW50IGF0IGluZGV4IDBcbiAgICAvLyBpcyBhbHdheXMgdW5kZWZpbmVkLlxuICAgIHByaXZhdGUgcmVhZG9ubHkgX3N0b3JlOiBBcnJheTxUIHwgdW5kZWZpbmVkPjtcblxuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IEhlYXAgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIGNvbXBhcmVGdW5jIC0gQSBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgdXNlZCB0byBzb3J0IGl0ZW1zIGluIHRoaXNcbiAgICAgKiBoZWFwLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3Rvcihjb21wYXJlRnVuYzogQ29tcGFyZUZ1bmM8VD4pXG4gICAge1xuICAgICAgICB0aGlzLl9jb21wYXJlRnVuYyA9IGNvbXBhcmVGdW5jO1xuXG4gICAgICAgIC8vIFRoZSBlbGVtZW50IGF0IGluZGV4IDAgaXMgbm90IHVzZWQuICBUaGUgcm9vdCBvZiB0aGUgYmluYXJ5IHRyZWUgaXNcbiAgICAgICAgLy8gYXQgaW5kZXggMS5cbiAgICAgICAgdGhpcy5fc3RvcmUgPSBbdW5kZWZpbmVkXTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgdGhlIG51bWJlciBvZiBpdGVtcyBpbiB0aGlzIGhlYXBcbiAgICAgKiBAcmV0dXJuIFRoZSBudW1iZXIgb2YgaXRlbXMgaW4gdGhpcyBoZWFwXG4gICAgICovXG4gICAgcHVibGljIGdldCBsZW5ndGgoKTogbnVtYmVyXG4gICAge1xuICAgICAgICAvLyBTdWJ0cmFjdCAxLCBiZWNhdXNlIGVsZW1lbnQgMCBpcyBuZXZlciB1c2VkLlxuICAgICAgICByZXR1cm4gdGhpcy5fc3RvcmUubGVuZ3RoIC0gMTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciB0aGlzIGhlYXAgaXMgZW1wdHkuXG4gICAgICogQHJldHVybiB0cnVlIGlmIHRoaXMgaGVhcCBpcyBlbXB0eTsgZmFsc2Ugb3RoZXJ3aXNlXG4gICAgICovXG4gICAgcHVibGljIGdldCBpc0VtcHR5KCk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENhbGN1bGF0ZXMgdGhlIG1heGltdW0gZGVwdGggb2YgdGhpcyBoZWFwLlxuICAgICAqIEByZXR1cm4gVGhlIG1heGltdW0gZGVwdGggb2YgdGhlIHRoaXMgaGVhcFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGVwdGgoKTogbnVtYmVyXG4gICAge1xuICAgICAgICBpZiAodGhpcy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiAwO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmVjYXVzZSB0aGlzIHRyZWUgaXMgZmlsbGVkIGluIGZyb20gbGVmdCB0byByaWdodCwgdGhlIG1heGltdW0gZGVwdGhcbiAgICAgICAgLy8gY2FuIGJlIG9idGFpbmVkIGJ5IHdhbGtpbmcgZG93biB0aGUgbGVmdG1vc3QgYnJhbmNoZXMgb2YgdGhpcyB0cmVlLlxuICAgICAgICBsZXQgY3VyRGVwdGggPSAwO1xuICAgICAgICBsZXQgY3VySW5kZXg6IG51bWJlciB8IHVuZGVmaW5lZCA9IDE7XG5cbiAgICAgICAgd2hpbGUgKGN1ckluZGV4ICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIGN1ckRlcHRoKys7XG4gICAgICAgICAgICBjdXJJbmRleCA9IHRoaXMubGVmdENoaWxkKGN1ckluZGV4KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBjdXJEZXB0aDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEFkZHMgYSBuZXcgdmFsdWUgdG8gdGhpcyBoZWFwXG4gICAgICogQHBhcmFtIHZhbCAtIFRoZSB2YWx1ZSB0byBiZSBhZGRlZCB0byB0aGlzIGhlYXBcbiAgICAgKi9cbiAgICBwdWJsaWMgcHVzaCh2YWw6IFQpOiB2b2lkXG4gICAge1xuICAgICAgICAvLyBQdXNoIHRoZSBuZXcgdmFsdWUgb250byB0aGUgZW5kIG9mIHRoZSBhcnJheS4gIEl0IHdpbGwgYmVjb21lIHRoZSBuZXdcbiAgICAgICAgLy8gcmlnaHRtb3N0IGxlYWYuXG4gICAgICAgIHRoaXMuX3N0b3JlLnB1c2godmFsKTtcbiAgICAgICAgdGhpcy5mbG9hdCh0aGlzLl9zdG9yZS5sZW5ndGggLSAxKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGdyZWF0ZXN0IGl0ZW0gZnJvbSB0aGlzIGhlYXAgKHdpdGhvdXQgcmVtb3ZpbmcgaXQpXG4gICAgICogQHJldHVybiBUaGUgaXRlbSB3aXRoIHRoZSBncmVhdGVzdCB2YWx1ZSAoYXMgZGV0ZXJtaW5lZCBieSBjb21wYXJlRnVuYylcbiAgICAgKi9cbiAgICBwdWJsaWMgcGVhaygpOiBUIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5fc3RvcmUubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuX3N0b3JlWzFdO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZ3JlYXRlc3QgaXRlbSBmcm9tIHRoaXMgaGVhcFxuICAgICAqIEByZXR1cm4gVGhlIGl0ZW0gd2l0aCB0aGUgZ3JlYXRlc3QgdmFsdWUgKGFzIGRldGVybWluZWQgYnkgY29tcGFyZUZ1bmMpXG4gICAgICovXG4gICAgcHVibGljIHBvcCgpOiBUIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICAvLyBUaGUgbGVuZ3RoIG9mIHRoZSBiYWNraW5nIHN0b3JlIHVwb24gc3RhcnQuXG4gICAgICAgIGNvbnN0IG9yaWdTdG9yZUxlbmd0aCA9IHRoaXMuX3N0b3JlLmxlbmd0aDtcblxuICAgICAgICBpZiAob3JpZ1N0b3JlTGVuZ3RoIDw9IDEpIHtcbiAgICAgICAgICAgIC8vIE9ubHkgdGhlIHVudXNlZCBpdGVtIGF0IGluZGV4IDAgZXhpc3RzLiBUaGlzIGhlYXAgaXMgZW1wdHkuXG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU3RvcmUgYSBjb3B5IG9mIHRoZSByb290IHZhbHVlLlxuICAgICAgICBjb25zdCByZXRWYWw6IFQgPSB0aGlzLl9zdG9yZVsxXSE7XG5cbiAgICAgICAgLy8gTW92ZSB0aGUgbGFzdCBsZWFmIHVwIHRvIHRoZSByb290LlxuICAgICAgICB0aGlzLl9zdG9yZVsxXSA9IHRoaXMuX3N0b3JlW29yaWdTdG9yZUxlbmd0aCAtIDFdO1xuICAgICAgICB0aGlzLl9zdG9yZS5sZW5ndGggPSBvcmlnU3RvcmVMZW5ndGggLSAxO1xuXG4gICAgICAgIC8vIElmIHRoaXMgaGVhcCBpcyBub3QgZW1wdHksIHNpbmsgdGhlIHJvb3QgaXRlbSB0byBpdHMgcHJvcGVyIGxvY2F0aW9uLlxuICAgICAgICBpZiAodGhpcy5fc3RvcmUubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgdGhpcy5zaW5rKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHJldFZhbDtcbiAgICB9XG5cblxuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbiAgICAvLyBIZWxwZXIgTWV0aG9kc1xuICAgIC8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuICAgIC8qKlxuICAgICAqIEl0ZXJhdGl2ZWx5IGNvbXBhcmVzIHRoZSB2YWx1ZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4IHdpdGggaXRzIHBhcmVudCBhbmRcbiAgICAgKiBzd2FwcyB0aGVtIGlmIHRoZSBjaGlsZCB2YWx1ZSBpcyBncmVhdGVyLlxuICAgICAqIEBwYXJhbSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgaXRlbSB0byBmbG9hdC5cbiAgICAgKi9cbiAgICBwcml2YXRlIGZsb2F0KGluZGV4OiBudW1iZXIpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAoIXRoaXMuaXNSb290KGluZGV4KSkge1xuICAgICAgICAgICAgY29uc3QgcGFyZW50SW5kZXggPSB0aGlzLnBhcmVudEluZGV4KGluZGV4KSE7XG4gICAgICAgICAgICBpZiAodGhpcy5jb21wYXJlKHBhcmVudEluZGV4LCBpbmRleCkgPT09IENvbXBhcmVSZXN1bHQuTEVTUykge1xuICAgICAgICAgICAgICAgIHRoaXMuc3dhcChwYXJlbnRJbmRleCwgaW5kZXgpO1xuICAgICAgICAgICAgICAgIHRoaXMuZmxvYXQocGFyZW50SW5kZXgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBJdGVyYXRpdmVseSBjb21wYXJlcyB0aGUgdmFsdWUgYXQgdGhlIHNwZWNpZmllZCBpbmRleCB3aXRoIGl0cyAqbGFyZ2VzdFxuICAgICAqIGNoaWxkKiBhbmQgc3dhcHMgdGhlbSBpZiB0aGUgY2hpbGQgdmFsdWUgaXMgZ3JlYXRlci5cbiAgICAgKiBAcGFyYW0gaW5kZXggLSBUaGUgaW5kZXggb2YgdGhlIGl0ZW0gdG8gc2lua1xuICAgICAqL1xuICAgIHByaXZhdGUgc2luayhpbmRleDogbnVtYmVyKTogdm9pZFxuICAgIHtcbiAgICAgICAgY29uc3QgbGVmdENoaWxkSW5kZXggPSB0aGlzLmxlZnRDaGlsZChpbmRleCk7XG4gICAgICAgIGlmIChsZWZ0Q2hpbGRJbmRleCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAvLyBUaGVyZSBhcmUgbm8gY2hpbGRyZW4uICBXZSBhcmUgZG9uZS5cbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENvbXBhcmUgYWdhaW5zdCB0aGUgZ3JlYXRlciBvZiB0aGUgdmFsdWUncyBjaGlsZHJlbi5cbiAgICAgICAgbGV0IGNoaWxkSW5kZXhUb0NvbXBhcmVUbzogbnVtYmVyO1xuXG4gICAgICAgIGNvbnN0IHJpZ2h0Q2hpbGRJbmRleCA9IHRoaXMucmlnaHRDaGlsZChpbmRleCk7XG4gICAgICAgIGlmIChyaWdodENoaWxkSW5kZXggPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgLy8gVGhlcmUgaXMgb25seSBhIGxlZnQgY2hpbGQuICBDb21wYXJlIHdpdGggaXQuXG4gICAgICAgICAgICBjaGlsZEluZGV4VG9Db21wYXJlVG8gPSBsZWZ0Q2hpbGRJbmRleDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIGNvbnN0IGNoaWxkQ29tcGFyZVJlc3VsdCA9IHRoaXMuY29tcGFyZShsZWZ0Q2hpbGRJbmRleCwgcmlnaHRDaGlsZEluZGV4KTtcbiAgICAgICAgICAgIGlmIChjaGlsZENvbXBhcmVSZXN1bHQgPT09IENvbXBhcmVSZXN1bHQuTEVTUykge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBsZWZ0IGNoaWxkIGlzIGxlc3MsIHNvIGNvbXBhcmUgYWdhaW5zdCB0aGUgcmlnaHQgY2hpbGQuXG4gICAgICAgICAgICAgICAgY2hpbGRJbmRleFRvQ29tcGFyZVRvID0gcmlnaHRDaGlsZEluZGV4O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGxlZnQgY2hpbGQgaXMgZXF1YWwgb3IgZ3JlYXRlciB0aGFuIHRoZSByaWdodCBjaGlsZC5cbiAgICAgICAgICAgICAgICBjaGlsZEluZGV4VG9Db21wYXJlVG8gPSBsZWZ0Q2hpbGRJbmRleDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLmNvbXBhcmUoaW5kZXgsIGNoaWxkSW5kZXhUb0NvbXBhcmVUbykgPT09IENvbXBhcmVSZXN1bHQuTEVTUykge1xuICAgICAgICAgICAgdGhpcy5zd2FwKGluZGV4LCBjaGlsZEluZGV4VG9Db21wYXJlVG8pO1xuICAgICAgICAgICAgdGhpcy5zaW5rKGNoaWxkSW5kZXhUb0NvbXBhcmVUbyk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIERldGVybWluZXMgd2hldGhlciB0aGUgc3BlY2lmaWVkIGluZGV4IGlzIHRoZSByb290IG9mIHRoaXMgaGVhcCdzIHRyZWUuXG4gICAgICogQHBhcmFtIGluZGV4IC0gVGhlIGluZGV4IG9mIHRoZSBpdGVtIHRvIGNoZWNrXG4gICAgICogQHJldHVybiB0cnVlIGlmIHRoZSBzcGVjaWZpZWQgaW5kZXggaXMgdGhlIHJvb3Qgb2YgdGhpcyBoZWFwOyBmYWxzZVxuICAgICAqIG90aGVyd2lzZS5cbiAgICAgKi9cbiAgICBwcml2YXRlIGlzUm9vdChpbmRleDogbnVtYmVyKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRJbmRleChpbmRleCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXggcGFzc2VkIHRvIGlzUm9vdCgpLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gaW5kZXggPT09IDE7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlcyB0aGUgaXRlbXMgYXQgdGhlIHNwZWNpZmllZCBpbmRpY2VzXG4gICAgICogQHBhcmFtIGluZGV4QSAtIEluZGV4IG9mIHRoZSBsZWZ0IHNpZGUgYXJndW1lbnRcbiAgICAgKiBAcGFyYW0gaW5kZXhCIC0gSW5kZXggb2YgdGhlIHJpZ2h0IHNpZGVkIGFyZ3VtZW50XG4gICAgICogQHJldHVybiBUaGUgcmVzdWx0IG9mIGNvbXBhcmluZyB0aGUgc3BlY2lmaWVkIGl0ZW1zXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb21wYXJlKGluZGV4QTogbnVtYmVyLCBpbmRleEI6IG51bWJlcik6IENvbXBhcmVSZXN1bHRcbiAgICB7XG4gICAgICAgIGlmICghdGhpcy5pc1ZhbGlkSW5kZXgoaW5kZXhBKSB8fFxuICAgICAgICAgICAgIXRoaXMuaXNWYWxpZEluZGV4KGluZGV4QikpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXggcGFzc2VkIHRvIGNvbXBhcmUoKS5cIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5fY29tcGFyZUZ1bmModGhpcy5fc3RvcmVbaW5kZXhBXSEsIHRoaXMuX3N0b3JlW2luZGV4Ql0hKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFN3YXBzIHRoZSBpdGVtcyBhdCB0aGUgc3BlY2lmaWVkIGluZGljZXNcbiAgICAgKiBAcGFyYW0gaW5kZXhBIC0gSW5kZXggb2YgYW4gaXRlbSB0byBzd2FwXG4gICAgICogQHBhcmFtIGluZGV4QiAtIEluZGV4IG9mIGFuIGl0ZW0gdG8gc3dhcFxuICAgICAqL1xuICAgIHByaXZhdGUgc3dhcChpbmRleEE6IG51bWJlciwgaW5kZXhCOiBudW1iZXIpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAoIXRoaXMuaXNWYWxpZEluZGV4KGluZGV4QSkgfHxcbiAgICAgICAgICAgICF0aGlzLmlzVmFsaWRJbmRleChpbmRleEIpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbnZhbGlkIGluZGV4IHBhc3NlZCB0byBzd2FwKCkuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgdG1wID0gdGhpcy5fc3RvcmVbaW5kZXhBXTtcbiAgICAgICAgdGhpcy5fc3RvcmVbaW5kZXhBXSA9IHRoaXMuX3N0b3JlW2luZGV4Ql07XG4gICAgICAgIHRoaXMuX3N0b3JlW2luZGV4Ql0gPSB0bXA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgaW5kZXggaXMgYSB2YWxpZCBpbmRleCBmb3IgdGhpcyBoZWFwXG4gICAgICogQHBhcmFtIGluZGV4IC0gVGhlIGluZGV4IHRvIGNoZWNrXG4gICAgICogQHJldHVybiB0cnVlIGlmIGluZGV4IGlzIHZhbGlkOyBmYWxzZSBvdGhlcndpc2VcbiAgICAgKi9cbiAgICBwcml2YXRlIGlzVmFsaWRJbmRleChpbmRleDogbnVtYmVyKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgaWYgKGluZGV4ID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBlbmRJbmRleCA9IHRoaXMuX3N0b3JlLmxlbmd0aDtcbiAgICAgICAgcmV0dXJuIGluZGV4IDwgZW5kSW5kZXg7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyB0aGUgcGFyZW50IG9mIHRoZSBzcGVjaWZpZWQgaXRlbVxuICAgICAqIEBwYXJhbSBpbmRleCAtIEluZGV4IG9mIHRoZSBpdGVtIGZvciB3aGljaCB0aGUgcGFyZW50IGluZGV4IGlzIHRvIGJlIGZvdW5kXG4gICAgICogQHJldHVybiBUaGUgcGFyZW50IGluZGV4LiAgVW5kZWZpbmVkIGlmIGluZGV4IGlzIHRoZSByb290IG9mIHRoaXMgaGVhcFxuICAgICAqL1xuICAgIHByaXZhdGUgcGFyZW50SW5kZXgoaW5kZXg6IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRJbmRleChpbmRleCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXggcGFzc2VkIHRvIHBhcmVudEluZGV4KCkuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGluZGV4ID09PSAxKSB7XG4gICAgICAgICAgICAvLyBJdCBpcyB0aGUgcm9vdCB2YWx1ZS5cbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gTWF0aC5mbG9vcihpbmRleCAvIDIpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBGaW5kcyB0aGUgbGVmdCBjaGlsZCBvZiB0aGUgc3BlY2lmaWVkIGl0ZW1cbiAgICAgKiBAcGFyYW0gaW5kZXggLSBJbmRleCBvZiB0aGUgaXRlbSBmb3Igd2hpY2ggdGhlIGxlZnQgY2hpbGQgaW5kZXggaXMgdG8gYmUgZm91bmRcbiAgICAgKiBAcmV0dXJuIFRoZSBsZWZ0IGNoaWxkIGluZGV4LiAgVW5kZWZpbmVkIGlmIGluZGV4IGhhcyBubyBsZWZ0IGNoaWxkXG4gICAgICovXG4gICAgcHJpdmF0ZSBsZWZ0Q2hpbGQoaW5kZXg6IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRJbmRleChpbmRleCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXggcGFzc2VkIHRvIGxlZnRDaGlsZCgpLlwiKTtcbiAgICAgICAgfVxuICAgICAgICBjb25zdCBsZWZ0Q2hpbGRJbmRleCA9IGluZGV4ICogMjtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNWYWxpZEluZGV4KGxlZnRDaGlsZEluZGV4KSA/IGxlZnRDaGlsZEluZGV4IDogdW5kZWZpbmVkO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRmluZHMgdGhlIHJpZ2h0IGNoaWxkIG9mIHRoZSBzcGVjaWZpZWQgaXRlbVxuICAgICAqIEBwYXJhbSBpbmRleCAtIEluZGV4IG9mIHRoZSBpdGVtIGZvciB3aGljaCB0aGUgcmlnaHQgY2hpbGQgaW5kZXggaXMgdG8gYmUgZm91bmRcbiAgICAgKiBAcmV0dXJuIFRoZSByaWdodCBjaGlsZCBpbmRleC4gIFVuZGVmaW5lZCBpZiBpbmRleCBoYXMgbm8gcmlnaHQgY2hpbGRcbiAgICAgKi9cbiAgICBwcml2YXRlIHJpZ2h0Q2hpbGQoaW5kZXg6IG51bWJlcik6IG51bWJlciB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLmlzVmFsaWRJbmRleChpbmRleCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludmFsaWQgaW5kZXggcGFzc2VkIHRvIHJpZ2h0Q2hpbGQoKS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgcmlnaHRDaGlsZEluZGV4ID0gaW5kZXggKiAyICsgMTtcbiAgICAgICAgcmV0dXJuIHRoaXMuaXNWYWxpZEluZGV4KHJpZ2h0Q2hpbGRJbmRleCkgPyByaWdodENoaWxkSW5kZXggOiB1bmRlZmluZWQ7XG4gICAgfVxuXG59XG4iXX0=
