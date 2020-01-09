"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var algorithm_1 = require("./algorithm");
function link(prev, next) {
    prev.next = next;
    next.prev = prev;
}
var DLNodeEnd = /** @class */ (function () {
    // endregion
    function DLNodeEnd() {
        this._prev = this;
        this._next = this;
    }
    Object.defineProperty(DLNodeEnd.prototype, "nodeType", {
        get: function () {
            return "DLNodeEnd";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DLNodeEnd.prototype, "prev", {
        get: function () {
            if (this._prev === undefined) {
                throw new Error("DLNodeEnd instance has not been linked to a previous node.");
            }
            return this._prev;
        },
        set: function (prev) {
            this._prev = prev;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DLNodeEnd.prototype, "next", {
        get: function () {
            if (this._next === undefined) {
                throw new Error("DLNodeEnd instance has not been linked to a next node.");
            }
            return this._next;
        },
        set: function (next) {
            this._next = next;
        },
        enumerable: true,
        configurable: true
    });
    return DLNodeEnd;
}());
/**
 * Class that represents a node in a doubly linked list.  The nodes form a
 * circle where there is one special "end" node that has a value of undefined.
 */
var DLNodeValue = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new DLNode with the specified value.
     * @param value - The payload to be stored at this node
     */
    function DLNodeValue(value) {
        this._value = value;
    }
    Object.defineProperty(DLNodeValue.prototype, "nodeType", {
        get: function () {
            return "DLNodeValue";
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DLNodeValue.prototype, "prev", {
        get: function () {
            if (this._prev === undefined) {
                throw new Error("DLNodeValue instance has not been linked to a previous node.");
            }
            return this._prev;
        },
        set: function (prev) {
            this._prev = prev;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DLNodeValue.prototype, "next", {
        get: function () {
            if (this._next === undefined) {
                throw new Error("DLNodeValue instance has not been linked to a next node.");
            }
            return this._next;
        },
        set: function (next) {
            this._next = next;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DLNodeValue.prototype, "value", {
        get: function () {
            return this._value;
        },
        set: function (val) {
            this._value = val;
        },
        enumerable: true,
        configurable: true
    });
    return DLNodeValue;
}());
/**
 * A doubly-linked list.
 *
 * This linked list is implemented as a circular linked list with one node being
 * the "end" node.
 */
var List = /** @class */ (function () {
    // endregion
    /**
     * Creates a new List object.
     */
    function List() {
        this._end = new DLNodeEnd();
        this._length = 0;
    }
    List.fromArray = function (arr) {
        var newList = new List();
        arr.forEach(function (curVal) { return newList.push(curVal); });
        return newList;
    };
    Object.defineProperty(List.prototype, "length", {
        /**
         * Gets the length of this List.  This operation takes O(1) time.
         * @returns The number of elements in this List
         */
        get: function () {
            return this._length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(List.prototype, "isEmpty", {
        /**
         * Determines (in constant time - O(1)) whether this list is empty.
         * @returns true if this list is empty.  false otherwise.
         */
        get: function () {
            return this._length === 0;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Returns an Iterator that points to the first element in this List.
     * @returns An Iterator pointing to the first element in this List.  If this
     * List is empty, the returned iterator will be pointing to end().
     */
    List.prototype.begin = function () {
        return this._length === 0 ?
            new Iterator(this._end, this._end) :
            new Iterator(this._end.next, this._end);
    };
    /**
     * Returns an Iterator that points to an element one past the end of this
     * List.
     * @returns An Iterator pointing to an element one past the end of this
     * list.
     */
    List.prototype.end = function () {
        return new Iterator(this._end, this._end);
    };
    /**
     * Adds a new value onto the end of this List.
     * @param value - The value to be appended
     * @returns This list (to allow chaining)
     */
    List.prototype.push = function (value) {
        this.insertNode(this._end, value);
        // Return this to allow chaining.
        return this;
    };
    /**
     * Removes the element on the end of this List and returns its value.
     * @returns The value associated with the removed element, or undefined if
     * this List is empty.
     */
    List.prototype.pop = function () {
        if (this._length === 0) {
            throw new Error("Attempted to pop() an empty List.");
        }
        // Because this List is not empty, we know for sure that the node
        // before the end node contains a value.
        var lastValueNode = this._end.prev;
        var val = lastValueNode.value;
        // Remove the node from the list.
        this.removeNode(lastValueNode);
        return val;
    };
    /**
     * Removes the specified element from this List.
     * @param it - Iterator pointing to the element to be removed.  If the
     * iterator passed is end(), an Error will be thrown.
     * @returns An iterator pointing to the element following the removed
     * element, which may be end().
     */
    List.prototype.remove = function (it) {
        var itEnd = this.end();
        if (it.equals(itEnd)) {
            throw new Error("Attempted to remove List elment at end().");
        }
        var nodeToRemove = it._getDLNode();
        var nextNode = this.removeNode(nodeToRemove);
        return new Iterator(nextNode, this._end);
    };
    /**
     * Gets the value at the specified index.
     * @param index - The index of the value to retrieve
     * @returns The value at the specified index
     */
    List.prototype.getAt = function (index) {
        if (index < 0) {
            // FUTURE: Allow negative indices that are relative to the end.
            throw new Error("Index cannot be negative.");
        }
        var maxIndex = this._length - 1;
        if (index > maxIndex) {
            throw new Error("Index out of range.");
        }
        var it = this.begin();
        algorithm_1.advance(it, index);
        // Because the index was checked previously, we know we are going to
        // finish on a value node (not the end node).  Therefore, reading the
        // value here will not throw an Error.
        return it.value;
    };
    /**
     * Inserts new elements into this list.
     * @param insertInFrontOf - The new elements will be inserted in front of this element
     * @param values - The values to insert
     * @returns An Iterator pointing to the first inserted element, or `insertInFrontOf` if
     * no values were specified.
     */
    List.prototype.insert = function (insertInFrontOf) {
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        var firstInsertedNode = this.insertNode.apply(this, __spread([insertInFrontOf._getDLNode()], values));
        return new Iterator(firstInsertedNode, this._end);
    };
    /**
     * Converts this List to an array with the same values.
     * @returns The converted array
     */
    List.prototype.toArray = function () {
        var arr = [];
        var itEnd = this.end();
        for (var it_1 = this.begin(); !it_1.equals(itEnd); it_1.next()) {
            // This for loop ensures that it will only point to value nodes (not
            // the end node), so reading the value here will never throw an
            // Error.
            arr.push(it_1.value);
        }
        return arr;
    };
    List.prototype.quicksort = function () {
        this.quicksortImpl(this.begin(), this.end());
    };
    /**
     * Helper method that removes a node from this linked list.
     * @param removeNode - The node to be removed.  The type is
     * DLNodeValue<ValueType> because the end node cannot be removed.
     * @returns The node after the removed node
     */
    List.prototype.removeNode = function (removeNode) {
        var prevNode = removeNode.prev;
        var nextNode = removeNode.next;
        // Remove the element from the list.
        link(prevNode, nextNode);
        this._length -= 1;
        return nextNode;
    };
    /**
     * Helper method that inserts new elements into this List.
     * @param insertInFrontOf - The new elements will be inserted in front of
     * this element
     * @param values - The values to insert
     * @returns The first inserted DLNode, or `insertInFrontOf` if no values
     * were specified.
     */
    List.prototype.insertNode = function (insertInFrontOf) {
        var e_1, _a;
        var values = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            values[_i - 1] = arguments[_i];
        }
        if (values.length === 0) {
            return insertInFrontOf;
        }
        var nodeRet;
        try {
            for (var values_1 = __values(values), values_1_1 = values_1.next(); !values_1_1.done; values_1_1 = values_1.next()) {
                var curVal = values_1_1.value;
                var prevNode = insertInFrontOf.prev;
                var nextNode = insertInFrontOf;
                var newNode = new DLNodeValue(curVal);
                link(prevNode, newNode);
                link(newNode, nextNode);
                this._length += 1;
                // If this is the first node inserted, remember it so we can return
                // it.
                nodeRet = nodeRet || newNode;
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (values_1_1 && !values_1_1.done && (_a = values_1.return)) _a.call(values_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        // Since we checked the size of the `values` array at the beginning of
        // this method, we know that nodeRet will have been set.
        return nodeRet;
    };
    /**
     * Does an in-place sort of the elements in the range [itFirst, itLast).
     * This algorithm is O(n * log(n)).
     * @param itFirst - The first element in the range to be sorted (included)
     * @param itLast - The last element of the range to be sorted (excluded)
     */
    List.prototype.quicksortImpl = function (itFirst, itLast) {
        // Normally, a random element would be selected as the pivot.  This,
        // however, would require calculating how many elements are in [itFirst,
        // itLast). Because we are operating on a list, that distance()
        // operation is very costly.  So instead, we will just always use the
        // first element as the pivot.
        // If the sequence [itFirst, itLast) has 0 or 1 element, this is the
        // base case and we can return immediately.
        if (itFirst.equals(itLast) || // 0 elements in range
            itFirst.offset(1).equals(itLast) // 1 element in range (at itFirst)
        ) {
            return;
        }
        // Set the pivot.
        var pivotIndex = 0;
        var itPivot = itFirst.offset(pivotIndex);
        var pivotValue = itPivot.value;
        // Because the pivot element is always the first, we will always have to
        // adjust itFirst.
        itFirst = itPivot.offset(1);
        // Remove the pivot element.
        this.remove(itPivot);
        // partition() from itFirst (inclusive) to itLast (exclusive) based on
        // curVal < pivot.  Once the range is partitioned, we will be able to
        // insert the pivot value between the two partitioned ranges.
        var itPartition = algorithm_1.partition(itFirst, itLast, function (curVal) { return curVal < pivotValue; });
        var insertedAtBeginning = itPartition.equals(itFirst);
        var insertedAtEnd = itPartition.equals(itLast);
        // Insert the pivot element at the beginning of the second range (returned from partition()).
        itPartition = this.insert(itPartition, pivotValue);
        if (insertedAtBeginning) {
            // We just inserted the pivot at the beginning of the sequence.  We
            // only have to quicksort() the range following the pivot.
            this.quicksortImpl(itPartition.offset(1), itLast);
        }
        else if (insertedAtEnd) {
            // We just inserted the pivot at the end of the sequence.  We only
            // have to quicksort() the range in front of the pivot.
            this.quicksortImpl(itFirst, itPartition);
        }
        else {
            // We inserted the pivot into the middle of the sequence, so we have
            // to quicksort() the range in front of it and after it.
            this.quicksortImpl(itFirst, itPartition);
            this.quicksortImpl(itPartition.offset(1), itLast);
        }
    };
    return List;
}());
exports.List = List;
/**
 * Implements the iterator protocol for List.
 */
var Iterator = /** @class */ (function () {
    /**
     * Creates a new Iterator
     * @param curNode - The node the Iterator should be pointing to
     * @param endNode - The end node of the linked list
     */
    function Iterator(curNode, endNode) {
        this._curNode = curNode;
        this._endNode = endNode;
    }
    Iterator.prototype._getDLNode = function () {
        return this._curNode;
    };
    Iterator.prototype.equals = function (otherIter) {
        return this._curNode === otherIter._curNode;
    };
    Iterator.prototype.prev = function () {
        var isAtBegin = this._isAtBegin();
        if (!isAtBegin) {
            this._curNode = this._curNode.prev;
        }
    };
    Iterator.prototype.next = function () {
        if (this._curNode.nodeType === "DLNodeEnd") {
            return { done: true };
        }
        else {
            // Get the value to be returned.
            var val = this._curNode.value;
            // Advance the iterator.
            this._curNode = this._curNode.next;
            return {
                done: false,
                value: val
            };
        }
    };
    Object.defineProperty(Iterator.prototype, "value", {
        get: function () {
            if (this._curNode.nodeType === "DLNodeEnd") {
                throw new Error("Attempted to get value from an iterator at end().");
            }
            return this._curNode.value;
        },
        set: function (val) {
            if (this._curNode.nodeType === "DLNodeEnd") {
                throw new Error("Cannot set value of end element.");
            }
            else {
                this._curNode.value = val;
            }
        },
        enumerable: true,
        configurable: true
    });
    Iterator.prototype.offset = function (offset) {
        // Make a copy of this iterator and then advance it.
        var it = new Iterator(this._curNode, this._endNode);
        algorithm_1.advance(it, offset);
        return it;
    };
    Iterator.prototype._isAtBegin = function () {
        var isOnEndOfZeroLengthList = this._curNode.nodeType === "DLNodeEnd" &&
            this._curNode.prev === undefined &&
            this._curNode.next === undefined;
        if (isOnEndOfZeroLengthList) {
            return true;
        }
        // We are at the beginning if we are pointing to a value node and the
        // previous node is the end node.
        var isAtBegin = this._curNode.nodeType === "DLNodeValue" &&
            this._curNode.prev.nodeType === "DLNodeEnd";
        return isAtBegin;
    };
    return Iterator;
}());
exports.Iterator = Iterator;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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SUFBTSx1QkFBdUIsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLFFBQVEsS0FBSyxXQUFXO1lBQ3RDLElBQUksQ0FBQyxRQUFRLENBQUMsSUFBSSxLQUFLLFNBQVM7WUFDaEMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEtBQUssU0FBUyxDQUFDO1FBQ2pFLElBQUksdUJBQXVCLEVBQUU7WUFDekIsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUVELHFFQUFxRTtRQUNyRSxpQ0FBaUM7UUFDakMsSUFBTSxTQUFTLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxRQUFRLEtBQUssYUFBYTtZQUN4QyxJQUFJLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxRQUFRLEtBQUssV0FBVyxDQUFDO1FBQzlELE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFZTCxlQUFDO0FBQUQsQ0E1R0EsQUE0R0MsSUFBQTtBQTVHWSw0QkFBUSIsImZpbGUiOiJsaXN0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHthZHZhbmNlLCBwYXJ0aXRpb259IGZyb20gXCIuL2FsZ29yaXRobVwiO1xuXG5mdW5jdGlvbiBsaW5rPFZhbHVlVHlwZT4ocHJldjogRExOb2RlQW55PFZhbHVlVHlwZT4sIG5leHQ6IERMTm9kZUFueTxWYWx1ZVR5cGU+KTogdm9pZCB7XG4gICAgcHJldi5uZXh0ID0gbmV4dDtcbiAgICBuZXh0LnByZXYgPSBwcmV2O1xufVxuXG5cbmNsYXNzIERMTm9kZUVuZDxWYWx1ZVR5cGU+IHtcblxuICAgIC8vIHJlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIF9wcmV2OiBETE5vZGVBbnk8VmFsdWVUeXBlPjtcbiAgICBwcml2YXRlIF9uZXh0OiBETE5vZGVBbnk8VmFsdWVUeXBlPjtcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgY29uc3RydWN0b3IoKSB7XG4gICAgICAgIHRoaXMuX3ByZXYgPSB0aGlzO1xuICAgICAgICB0aGlzLl9uZXh0ID0gdGhpcztcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgbm9kZVR5cGUoKTogXCJETE5vZGVFbmRcIiB7XG4gICAgICAgIHJldHVybiBcIkRMTm9kZUVuZFwiO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBwcmV2KCk6IERMTm9kZUFueTxWYWx1ZVR5cGU+IHtcbiAgICAgICAgaWYgKHRoaXMuX3ByZXYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRExOb2RlRW5kIGluc3RhbmNlIGhhcyBub3QgYmVlbiBsaW5rZWQgdG8gYSBwcmV2aW91cyBub2RlLlwiKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fcHJldjtcbiAgICB9XG5cbiAgICBwdWJsaWMgc2V0IHByZXYocHJldjogRExOb2RlQW55PFZhbHVlVHlwZT4pIHtcbiAgICAgICAgdGhpcy5fcHJldiA9IHByZXY7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IG5leHQoKTogRExOb2RlQW55PFZhbHVlVHlwZT4ge1xuICAgICAgICBpZiAodGhpcy5fbmV4dCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJETE5vZGVFbmQgaW5zdGFuY2UgaGFzIG5vdCBiZWVuIGxpbmtlZCB0byBhIG5leHQgbm9kZS5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMuX25leHQ7XG4gICAgfVxuXG4gICAgcHVibGljIHNldCBuZXh0KG5leHQ6IERMTm9kZUFueTxWYWx1ZVR5cGU+KSB7XG4gICAgICAgIHRoaXMuX25leHQgPSBuZXh0O1xuICAgIH1cbn1cblxuXG4vKipcbiAqIENsYXNzIHRoYXQgcmVwcmVzZW50cyBhIG5vZGUgaW4gYSBkb3VibHkgbGlua2VkIGxpc3QuICBUaGUgbm9kZXMgZm9ybSBhXG4gKiBjaXJjbGUgd2hlcmUgdGhlcmUgaXMgb25lIHNwZWNpYWwgXCJlbmRcIiBub2RlIHRoYXQgaGFzIGEgdmFsdWUgb2YgdW5kZWZpbmVkLlxuICovXG5jbGFzcyBETE5vZGVWYWx1ZTxWYWx1ZVR5cGU+ICAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm1heC1jbGFzc2VzLXBlci1maWxlXG57XG4gICAgLy8gcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX3ByZXY6IERMTm9kZUFueTxWYWx1ZVR5cGU+IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX25leHQ6IERMTm9kZUFueTxWYWx1ZVR5cGU+IHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX3ZhbHVlOiBWYWx1ZVR5cGU7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIC8qKlxuICAgICAqIENvbnN0cnVjdHMgYSBuZXcgRExOb2RlIHdpdGggdGhlIHNwZWNpZmllZCB2YWx1ZS5cbiAgICAgKiBAcGFyYW0gdmFsdWUgLSBUaGUgcGF5bG9hZCB0byBiZSBzdG9yZWQgYXQgdGhpcyBub2RlXG4gICAgICovXG4gICAgY29uc3RydWN0b3IodmFsdWU6IFZhbHVlVHlwZSkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbHVlO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBub2RlVHlwZSgpOiBcIkRMTm9kZVZhbHVlXCIge1xuICAgICAgICByZXR1cm4gXCJETE5vZGVWYWx1ZVwiO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBwcmV2KCk6IERMTm9kZUFueTxWYWx1ZVR5cGU+IHtcbiAgICAgICAgaWYgKHRoaXMuX3ByZXYgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRExOb2RlVmFsdWUgaW5zdGFuY2UgaGFzIG5vdCBiZWVuIGxpbmtlZCB0byBhIHByZXZpb3VzIG5vZGUuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9wcmV2O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgcHJldihwcmV2OiBETE5vZGVBbnk8VmFsdWVUeXBlPikge1xuICAgICAgICB0aGlzLl9wcmV2ID0gcHJldjtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgbmV4dCgpOiBETE5vZGVBbnk8VmFsdWVUeXBlPiB7XG4gICAgICAgIGlmICh0aGlzLl9uZXh0ID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkRMTm9kZVZhbHVlIGluc3RhbmNlIGhhcyBub3QgYmVlbiBsaW5rZWQgdG8gYSBuZXh0IG5vZGUuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9uZXh0O1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgbmV4dChuZXh0OiBETE5vZGVBbnk8VmFsdWVUeXBlPikge1xuICAgICAgICB0aGlzLl9uZXh0ID0gbmV4dDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgdmFsdWUoKTogVmFsdWVUeXBlIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3ZhbHVlO1xuICAgIH1cblxuXG4gICAgcHVibGljIHNldCB2YWx1ZSh2YWw6IFZhbHVlVHlwZSkge1xuICAgICAgICB0aGlzLl92YWx1ZSA9IHZhbDtcbiAgICB9XG5cblxufVxuXG5cbi8vIEEgdW5pb24gdHlwZSBvZiBhbGwgcG9zc2libGUgbm9kZSB0eXBlcy5cbi8vIFRoZSBkaXNjcmltaW5hbnQgaXMgdGhlIGBub2RlVHlwZWAgcHJvcGVydHkuXG50eXBlIERMTm9kZUFueTxWYWx1ZVR5cGU+ID0gRExOb2RlRW5kPFZhbHVlVHlwZT4gfCBETE5vZGVWYWx1ZTxWYWx1ZVR5cGU+O1xuXG5cbi8qKlxuICogQSBkb3VibHktbGlua2VkIGxpc3QuXG4gKlxuICogVGhpcyBsaW5rZWQgbGlzdCBpcyBpbXBsZW1lbnRlZCBhcyBhIGNpcmN1bGFyIGxpbmtlZCBsaXN0IHdpdGggb25lIG5vZGUgYmVpbmdcbiAqIHRoZSBcImVuZFwiIG5vZGUuXG4gKi9cbmV4cG9ydCBjbGFzcyBMaXN0PFZhbHVlVHlwZT4gLy8gdHNsaW50OmRpc2FibGUtbGluZTptYXgtY2xhc3Nlcy1wZXItZmlsZVxue1xuICAgIHB1YmxpYyBzdGF0aWMgZnJvbUFycmF5PFZhbHVlVHlwZT4oYXJyOiBBcnJheTxWYWx1ZVR5cGU+KTogTGlzdDxWYWx1ZVR5cGU+IHtcbiAgICAgICAgY29uc3QgbmV3TGlzdCA9IG5ldyBMaXN0PFZhbHVlVHlwZT4oKTtcbiAgICAgICAgYXJyLmZvckVhY2goKGN1clZhbCkgPT4gbmV3TGlzdC5wdXNoKGN1clZhbCkpO1xuICAgICAgICByZXR1cm4gbmV3TGlzdDtcbiAgICB9XG5cblxuICAgIC8vIHJlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9lbmQ6IERMTm9kZUVuZDxWYWx1ZVR5cGU+O1xuICAgIHByaXZhdGUgX2xlbmd0aDogbnVtYmVyO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IExpc3Qgb2JqZWN0LlxuICAgICAqL1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLl9lbmQgPSBuZXcgRExOb2RlRW5kPFZhbHVlVHlwZT4oKTtcbiAgICAgICAgdGhpcy5fbGVuZ3RoID0gMDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGxlbmd0aCBvZiB0aGlzIExpc3QuICBUaGlzIG9wZXJhdGlvbiB0YWtlcyBPKDEpIHRpbWUuXG4gICAgICogQHJldHVybnMgVGhlIG51bWJlciBvZiBlbGVtZW50cyBpbiB0aGlzIExpc3RcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXIge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVuZ3RoO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyAoaW4gY29uc3RhbnQgdGltZSAtIE8oMSkpIHdoZXRoZXIgdGhpcyBsaXN0IGlzIGVtcHR5LlxuICAgICAqIEByZXR1cm5zIHRydWUgaWYgdGhpcyBsaXN0IGlzIGVtcHR5LiAgZmFsc2Ugb3RoZXJ3aXNlLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgaXNFbXB0eSgpOiBib29sZWFuIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xlbmd0aCA9PT0gMDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYW4gSXRlcmF0b3IgdGhhdCBwb2ludHMgdG8gdGhlIGZpcnN0IGVsZW1lbnQgaW4gdGhpcyBMaXN0LlxuICAgICAqIEByZXR1cm5zIEFuIEl0ZXJhdG9yIHBvaW50aW5nIHRvIHRoZSBmaXJzdCBlbGVtZW50IGluIHRoaXMgTGlzdC4gIElmIHRoaXNcbiAgICAgKiBMaXN0IGlzIGVtcHR5LCB0aGUgcmV0dXJuZWQgaXRlcmF0b3Igd2lsbCBiZSBwb2ludGluZyB0byBlbmQoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgYmVnaW4oKTogSXRlcmF0b3I8VmFsdWVUeXBlPiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZW5ndGggPT09IDAgP1xuICAgICAgICAgICAgICAgbmV3IEl0ZXJhdG9yKHRoaXMuX2VuZCwgdGhpcy5fZW5kKSA6XG4gICAgICAgICAgICAgICBuZXcgSXRlcmF0b3IodGhpcy5fZW5kLm5leHQsIHRoaXMuX2VuZCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm5zIGFuIEl0ZXJhdG9yIHRoYXQgcG9pbnRzIHRvIGFuIGVsZW1lbnQgb25lIHBhc3QgdGhlIGVuZCBvZiB0aGlzXG4gICAgICogTGlzdC5cbiAgICAgKiBAcmV0dXJucyBBbiBJdGVyYXRvciBwb2ludGluZyB0byBhbiBlbGVtZW50IG9uZSBwYXN0IHRoZSBlbmQgb2YgdGhpc1xuICAgICAqIGxpc3QuXG4gICAgICovXG4gICAgcHVibGljIGVuZCgpOiBJdGVyYXRvcjxWYWx1ZVR5cGU+IHtcbiAgICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcih0aGlzLl9lbmQsIHRoaXMuX2VuZCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbmV3IHZhbHVlIG9udG8gdGhlIGVuZCBvZiB0aGlzIExpc3QuXG4gICAgICogQHBhcmFtIHZhbHVlIC0gVGhlIHZhbHVlIHRvIGJlIGFwcGVuZGVkXG4gICAgICogQHJldHVybnMgVGhpcyBsaXN0ICh0byBhbGxvdyBjaGFpbmluZylcbiAgICAgKi9cbiAgICBwdWJsaWMgcHVzaCh2YWx1ZTogVmFsdWVUeXBlKTogTGlzdDxWYWx1ZVR5cGU+IHtcbiAgICAgICAgdGhpcy5pbnNlcnROb2RlKHRoaXMuX2VuZCwgdmFsdWUpO1xuXG4gICAgICAgIC8vIFJldHVybiB0aGlzIHRvIGFsbG93IGNoYWluaW5nLlxuICAgICAgICByZXR1cm4gdGhpcztcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIGVsZW1lbnQgb24gdGhlIGVuZCBvZiB0aGlzIExpc3QgYW5kIHJldHVybnMgaXRzIHZhbHVlLlxuICAgICAqIEByZXR1cm5zIFRoZSB2YWx1ZSBhc3NvY2lhdGVkIHdpdGggdGhlIHJlbW92ZWQgZWxlbWVudCwgb3IgdW5kZWZpbmVkIGlmXG4gICAgICogdGhpcyBMaXN0IGlzIGVtcHR5LlxuICAgICAqL1xuICAgIHB1YmxpYyBwb3AoKTogVmFsdWVUeXBlIHtcbiAgICAgICAgaWYgKHRoaXMuX2xlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXR0ZW1wdGVkIHRvIHBvcCgpIGFuIGVtcHR5IExpc3QuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQmVjYXVzZSB0aGlzIExpc3QgaXMgbm90IGVtcHR5LCB3ZSBrbm93IGZvciBzdXJlIHRoYXQgdGhlIG5vZGVcbiAgICAgICAgLy8gYmVmb3JlIHRoZSBlbmQgbm9kZSBjb250YWlucyBhIHZhbHVlLlxuICAgICAgICBjb25zdCBsYXN0VmFsdWVOb2RlID0gdGhpcy5fZW5kLnByZXYgYXMgRExOb2RlVmFsdWU8VmFsdWVUeXBlPjtcbiAgICAgICAgY29uc3QgdmFsOiBWYWx1ZVR5cGUgPSBsYXN0VmFsdWVOb2RlLnZhbHVlO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgbm9kZSBmcm9tIHRoZSBsaXN0LlxuICAgICAgICB0aGlzLnJlbW92ZU5vZGUobGFzdFZhbHVlTm9kZSk7XG5cbiAgICAgICAgcmV0dXJuIHZhbDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlbW92ZXMgdGhlIHNwZWNpZmllZCBlbGVtZW50IGZyb20gdGhpcyBMaXN0LlxuICAgICAqIEBwYXJhbSBpdCAtIEl0ZXJhdG9yIHBvaW50aW5nIHRvIHRoZSBlbGVtZW50IHRvIGJlIHJlbW92ZWQuICBJZiB0aGVcbiAgICAgKiBpdGVyYXRvciBwYXNzZWQgaXMgZW5kKCksIGFuIEVycm9yIHdpbGwgYmUgdGhyb3duLlxuICAgICAqIEByZXR1cm5zIEFuIGl0ZXJhdG9yIHBvaW50aW5nIHRvIHRoZSBlbGVtZW50IGZvbGxvd2luZyB0aGUgcmVtb3ZlZFxuICAgICAqIGVsZW1lbnQsIHdoaWNoIG1heSBiZSBlbmQoKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3ZlKGl0OiBJdGVyYXRvcjxWYWx1ZVR5cGU+KTogSXRlcmF0b3I8VmFsdWVUeXBlPiB7XG4gICAgICAgIGNvbnN0IGl0RW5kID0gdGhpcy5lbmQoKTtcbiAgICAgICAgaWYgKGl0LmVxdWFscyhpdEVuZCkpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkF0dGVtcHRlZCB0byByZW1vdmUgTGlzdCBlbG1lbnQgYXQgZW5kKCkuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgbm9kZVRvUmVtb3ZlOiBETE5vZGVWYWx1ZTxWYWx1ZVR5cGU+ID0gaXQuX2dldERMTm9kZSgpIGFzIERMTm9kZVZhbHVlPFZhbHVlVHlwZT47XG4gICAgICAgIGNvbnN0IG5leHROb2RlOiBETE5vZGVBbnk8VmFsdWVUeXBlPiA9IHRoaXMucmVtb3ZlTm9kZShub2RlVG9SZW1vdmUpO1xuICAgICAgICByZXR1cm4gbmV3IEl0ZXJhdG9yPFZhbHVlVHlwZT4obmV4dE5vZGUsIHRoaXMuX2VuZCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSB2YWx1ZSBhdCB0aGUgc3BlY2lmaWVkIGluZGV4LlxuICAgICAqIEBwYXJhbSBpbmRleCAtIFRoZSBpbmRleCBvZiB0aGUgdmFsdWUgdG8gcmV0cmlldmVcbiAgICAgKiBAcmV0dXJucyBUaGUgdmFsdWUgYXQgdGhlIHNwZWNpZmllZCBpbmRleFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRBdChpbmRleDogbnVtYmVyKTogVmFsdWVUeXBlIHtcbiAgICAgICAgaWYgKGluZGV4IDwgMCkge1xuICAgICAgICAgICAgLy8gRlVUVVJFOiBBbGxvdyBuZWdhdGl2ZSBpbmRpY2VzIHRoYXQgYXJlIHJlbGF0aXZlIHRvIHRoZSBlbmQuXG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbmRleCBjYW5ub3QgYmUgbmVnYXRpdmUuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgbWF4SW5kZXggPSB0aGlzLl9sZW5ndGggLSAxO1xuICAgICAgICBpZiAoaW5kZXggPiBtYXhJbmRleCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiSW5kZXggb3V0IG9mIHJhbmdlLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGl0OiBJdGVyYXRvcjxWYWx1ZVR5cGU+ID0gdGhpcy5iZWdpbigpO1xuICAgICAgICBhZHZhbmNlKGl0LCBpbmRleCk7XG5cbiAgICAgICAgLy8gQmVjYXVzZSB0aGUgaW5kZXggd2FzIGNoZWNrZWQgcHJldmlvdXNseSwgd2Uga25vdyB3ZSBhcmUgZ29pbmcgdG9cbiAgICAgICAgLy8gZmluaXNoIG9uIGEgdmFsdWUgbm9kZSAobm90IHRoZSBlbmQgbm9kZSkuICBUaGVyZWZvcmUsIHJlYWRpbmcgdGhlXG4gICAgICAgIC8vIHZhbHVlIGhlcmUgd2lsbCBub3QgdGhyb3cgYW4gRXJyb3IuXG4gICAgICAgIHJldHVybiBpdC52YWx1ZTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEluc2VydHMgbmV3IGVsZW1lbnRzIGludG8gdGhpcyBsaXN0LlxuICAgICAqIEBwYXJhbSBpbnNlcnRJbkZyb250T2YgLSBUaGUgbmV3IGVsZW1lbnRzIHdpbGwgYmUgaW5zZXJ0ZWQgaW4gZnJvbnQgb2YgdGhpcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHZhbHVlcyAtIFRoZSB2YWx1ZXMgdG8gaW5zZXJ0XG4gICAgICogQHJldHVybnMgQW4gSXRlcmF0b3IgcG9pbnRpbmcgdG8gdGhlIGZpcnN0IGluc2VydGVkIGVsZW1lbnQsIG9yIGBpbnNlcnRJbkZyb250T2ZgIGlmXG4gICAgICogbm8gdmFsdWVzIHdlcmUgc3BlY2lmaWVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBpbnNlcnQoaW5zZXJ0SW5Gcm9udE9mOiBJdGVyYXRvcjxWYWx1ZVR5cGU+LCAuLi52YWx1ZXM6IEFycmF5PFZhbHVlVHlwZT4pOiBJdGVyYXRvcjxWYWx1ZVR5cGU+IHtcblxuICAgICAgICBjb25zdCBmaXJzdEluc2VydGVkTm9kZTogRExOb2RlQW55PFZhbHVlVHlwZT4gPSB0aGlzLmluc2VydE5vZGUoaW5zZXJ0SW5Gcm9udE9mLl9nZXRETE5vZGUoKSwgLi4udmFsdWVzKTtcbiAgICAgICAgcmV0dXJuIG5ldyBJdGVyYXRvcihmaXJzdEluc2VydGVkTm9kZSwgdGhpcy5fZW5kKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENvbnZlcnRzIHRoaXMgTGlzdCB0byBhbiBhcnJheSB3aXRoIHRoZSBzYW1lIHZhbHVlcy5cbiAgICAgKiBAcmV0dXJucyBUaGUgY29udmVydGVkIGFycmF5XG4gICAgICovXG4gICAgcHVibGljIHRvQXJyYXkoKTogQXJyYXk8VmFsdWVUeXBlPiB7XG4gICAgICAgIGNvbnN0IGFycjogQXJyYXk8VmFsdWVUeXBlPiA9IFtdO1xuICAgICAgICBjb25zdCBpdEVuZDogSXRlcmF0b3I8VmFsdWVUeXBlPiA9IHRoaXMuZW5kKCk7XG4gICAgICAgIGZvciAoY29uc3QgaXQgPSB0aGlzLmJlZ2luKCk7ICFpdC5lcXVhbHMoaXRFbmQpOyBpdC5uZXh0KCkpIHtcbiAgICAgICAgICAgIC8vIFRoaXMgZm9yIGxvb3AgZW5zdXJlcyB0aGF0IGl0IHdpbGwgb25seSBwb2ludCB0byB2YWx1ZSBub2RlcyAobm90XG4gICAgICAgICAgICAvLyB0aGUgZW5kIG5vZGUpLCBzbyByZWFkaW5nIHRoZSB2YWx1ZSBoZXJlIHdpbGwgbmV2ZXIgdGhyb3cgYW5cbiAgICAgICAgICAgIC8vIEVycm9yLlxuICAgICAgICAgICAgYXJyLnB1c2goaXQudmFsdWUhKTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gYXJyO1xuICAgIH1cblxuXG4gICAgcHVibGljIHF1aWNrc29ydCgpOiB2b2lkIHtcbiAgICAgICAgdGhpcy5xdWlja3NvcnRJbXBsKHRoaXMuYmVnaW4oKSwgdGhpcy5lbmQoKSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgcmVtb3ZlcyBhIG5vZGUgZnJvbSB0aGlzIGxpbmtlZCBsaXN0LlxuICAgICAqIEBwYXJhbSByZW1vdmVOb2RlIC0gVGhlIG5vZGUgdG8gYmUgcmVtb3ZlZC4gIFRoZSB0eXBlIGlzXG4gICAgICogRExOb2RlVmFsdWU8VmFsdWVUeXBlPiBiZWNhdXNlIHRoZSBlbmQgbm9kZSBjYW5ub3QgYmUgcmVtb3ZlZC5cbiAgICAgKiBAcmV0dXJucyBUaGUgbm9kZSBhZnRlciB0aGUgcmVtb3ZlZCBub2RlXG4gICAgICovXG4gICAgcHJpdmF0ZSByZW1vdmVOb2RlKHJlbW92ZU5vZGU6IERMTm9kZVZhbHVlPFZhbHVlVHlwZT4pOiBETE5vZGVBbnk8VmFsdWVUeXBlPiB7XG4gICAgICAgIGNvbnN0IHByZXZOb2RlOiBETE5vZGVBbnk8VmFsdWVUeXBlPiA9IHJlbW92ZU5vZGUucHJldjtcbiAgICAgICAgY29uc3QgbmV4dE5vZGU6IERMTm9kZUFueTxWYWx1ZVR5cGU+ID0gcmVtb3ZlTm9kZS5uZXh0O1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgZWxlbWVudCBmcm9tIHRoZSBsaXN0LlxuICAgICAgICBsaW5rKHByZXZOb2RlLCBuZXh0Tm9kZSk7XG4gICAgICAgIHRoaXMuX2xlbmd0aCAtPSAxO1xuXG4gICAgICAgIHJldHVybiBuZXh0Tm9kZTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCBpbnNlcnRzIG5ldyBlbGVtZW50cyBpbnRvIHRoaXMgTGlzdC5cbiAgICAgKiBAcGFyYW0gaW5zZXJ0SW5Gcm9udE9mIC0gVGhlIG5ldyBlbGVtZW50cyB3aWxsIGJlIGluc2VydGVkIGluIGZyb250IG9mXG4gICAgICogdGhpcyBlbGVtZW50XG4gICAgICogQHBhcmFtIHZhbHVlcyAtIFRoZSB2YWx1ZXMgdG8gaW5zZXJ0XG4gICAgICogQHJldHVybnMgVGhlIGZpcnN0IGluc2VydGVkIERMTm9kZSwgb3IgYGluc2VydEluRnJvbnRPZmAgaWYgbm8gdmFsdWVzXG4gICAgICogd2VyZSBzcGVjaWZpZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBpbnNlcnROb2RlKGluc2VydEluRnJvbnRPZjogRExOb2RlQW55PFZhbHVlVHlwZT4sIC4uLnZhbHVlczogQXJyYXk8VmFsdWVUeXBlPik6IERMTm9kZUFueTxWYWx1ZVR5cGU+IHtcblxuICAgICAgICBpZiAodmFsdWVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIGluc2VydEluRnJvbnRPZjtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCBub2RlUmV0OiBETE5vZGVBbnk8VmFsdWVUeXBlPiB8IHVuZGVmaW5lZDtcblxuICAgICAgICBmb3IgKGNvbnN0IGN1clZhbCBvZiB2YWx1ZXMpIHtcbiAgICAgICAgICAgIGNvbnN0IHByZXZOb2RlOiBETE5vZGVBbnk8VmFsdWVUeXBlPiA9IGluc2VydEluRnJvbnRPZi5wcmV2O1xuICAgICAgICAgICAgY29uc3QgbmV4dE5vZGU6IERMTm9kZUFueTxWYWx1ZVR5cGU+ID0gaW5zZXJ0SW5Gcm9udE9mO1xuXG4gICAgICAgICAgICBjb25zdCBuZXdOb2RlID0gbmV3IERMTm9kZVZhbHVlKGN1clZhbCk7XG5cbiAgICAgICAgICAgIGxpbmsocHJldk5vZGUsIG5ld05vZGUpO1xuICAgICAgICAgICAgbGluayhuZXdOb2RlLCBuZXh0Tm9kZSk7XG5cbiAgICAgICAgICAgIHRoaXMuX2xlbmd0aCArPSAxO1xuXG4gICAgICAgICAgICAvLyBJZiB0aGlzIGlzIHRoZSBmaXJzdCBub2RlIGluc2VydGVkLCByZW1lbWJlciBpdCBzbyB3ZSBjYW4gcmV0dXJuXG4gICAgICAgICAgICAvLyBpdC5cbiAgICAgICAgICAgIG5vZGVSZXQgPSBub2RlUmV0IHx8IG5ld05vZGU7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTaW5jZSB3ZSBjaGVja2VkIHRoZSBzaXplIG9mIHRoZSBgdmFsdWVzYCBhcnJheSBhdCB0aGUgYmVnaW5uaW5nIG9mXG4gICAgICAgIC8vIHRoaXMgbWV0aG9kLCB3ZSBrbm93IHRoYXQgbm9kZVJldCB3aWxsIGhhdmUgYmVlbiBzZXQuXG4gICAgICAgIHJldHVybiBub2RlUmV0ITtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIERvZXMgYW4gaW4tcGxhY2Ugc29ydCBvZiB0aGUgZWxlbWVudHMgaW4gdGhlIHJhbmdlIFtpdEZpcnN0LCBpdExhc3QpLlxuICAgICAqIFRoaXMgYWxnb3JpdGhtIGlzIE8obiAqIGxvZyhuKSkuXG4gICAgICogQHBhcmFtIGl0Rmlyc3QgLSBUaGUgZmlyc3QgZWxlbWVudCBpbiB0aGUgcmFuZ2UgdG8gYmUgc29ydGVkIChpbmNsdWRlZClcbiAgICAgKiBAcGFyYW0gaXRMYXN0IC0gVGhlIGxhc3QgZWxlbWVudCBvZiB0aGUgcmFuZ2UgdG8gYmUgc29ydGVkIChleGNsdWRlZClcbiAgICAgKi9cbiAgICBwcml2YXRlIHF1aWNrc29ydEltcGwoXG4gICAgICAgIGl0Rmlyc3Q6IEl0ZXJhdG9yPFZhbHVlVHlwZT4sXG4gICAgICAgIGl0TGFzdDogSXRlcmF0b3I8VmFsdWVUeXBlPlxuICAgICk6IHZvaWQge1xuICAgICAgICAvLyBOb3JtYWxseSwgYSByYW5kb20gZWxlbWVudCB3b3VsZCBiZSBzZWxlY3RlZCBhcyB0aGUgcGl2b3QuICBUaGlzLFxuICAgICAgICAvLyBob3dldmVyLCB3b3VsZCByZXF1aXJlIGNhbGN1bGF0aW5nIGhvdyBtYW55IGVsZW1lbnRzIGFyZSBpbiBbaXRGaXJzdCxcbiAgICAgICAgLy8gaXRMYXN0KS4gQmVjYXVzZSB3ZSBhcmUgb3BlcmF0aW5nIG9uIGEgbGlzdCwgdGhhdCBkaXN0YW5jZSgpXG4gICAgICAgIC8vIG9wZXJhdGlvbiBpcyB2ZXJ5IGNvc3RseS4gIFNvIGluc3RlYWQsIHdlIHdpbGwganVzdCBhbHdheXMgdXNlIHRoZVxuICAgICAgICAvLyBmaXJzdCBlbGVtZW50IGFzIHRoZSBwaXZvdC5cblxuICAgICAgICAvLyBJZiB0aGUgc2VxdWVuY2UgW2l0Rmlyc3QsIGl0TGFzdCkgaGFzIDAgb3IgMSBlbGVtZW50LCB0aGlzIGlzIHRoZVxuICAgICAgICAvLyBiYXNlIGNhc2UgYW5kIHdlIGNhbiByZXR1cm4gaW1tZWRpYXRlbHkuXG4gICAgICAgIGlmIChpdEZpcnN0LmVxdWFscyhpdExhc3QpIHx8ICAgICAgICAgICAgLy8gMCBlbGVtZW50cyBpbiByYW5nZVxuICAgICAgICAgICAgaXRGaXJzdC5vZmZzZXQoMSkuZXF1YWxzKGl0TGFzdCkgICAgIC8vIDEgZWxlbWVudCBpbiByYW5nZSAoYXQgaXRGaXJzdClcbiAgICAgICAgKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTZXQgdGhlIHBpdm90LlxuICAgICAgICBjb25zdCBwaXZvdEluZGV4ID0gMDtcbiAgICAgICAgY29uc3QgaXRQaXZvdCA9IGl0Rmlyc3Qub2Zmc2V0KHBpdm90SW5kZXgpO1xuICAgICAgICBjb25zdCBwaXZvdFZhbHVlOiBWYWx1ZVR5cGUgPSBpdFBpdm90LnZhbHVlO1xuXG4gICAgICAgIC8vIEJlY2F1c2UgdGhlIHBpdm90IGVsZW1lbnQgaXMgYWx3YXlzIHRoZSBmaXJzdCwgd2Ugd2lsbCBhbHdheXMgaGF2ZSB0b1xuICAgICAgICAvLyBhZGp1c3QgaXRGaXJzdC5cbiAgICAgICAgaXRGaXJzdCA9IGl0UGl2b3Qub2Zmc2V0KDEpO1xuXG4gICAgICAgIC8vIFJlbW92ZSB0aGUgcGl2b3QgZWxlbWVudC5cbiAgICAgICAgdGhpcy5yZW1vdmUoaXRQaXZvdCk7XG5cbiAgICAgICAgLy8gcGFydGl0aW9uKCkgZnJvbSBpdEZpcnN0IChpbmNsdXNpdmUpIHRvIGl0TGFzdCAoZXhjbHVzaXZlKSBiYXNlZCBvblxuICAgICAgICAvLyBjdXJWYWwgPCBwaXZvdC4gIE9uY2UgdGhlIHJhbmdlIGlzIHBhcnRpdGlvbmVkLCB3ZSB3aWxsIGJlIGFibGUgdG9cbiAgICAgICAgLy8gaW5zZXJ0IHRoZSBwaXZvdCB2YWx1ZSBiZXR3ZWVuIHRoZSB0d28gcGFydGl0aW9uZWQgcmFuZ2VzLlxuICAgICAgICBsZXQgaXRQYXJ0aXRpb24gPSBwYXJ0aXRpb24oaXRGaXJzdCwgaXRMYXN0LCAoY3VyVmFsKSA9PiBjdXJWYWwgPCBwaXZvdFZhbHVlKTtcbiAgICAgICAgY29uc3QgaW5zZXJ0ZWRBdEJlZ2lubmluZyA9IGl0UGFydGl0aW9uLmVxdWFscyhpdEZpcnN0KTtcbiAgICAgICAgY29uc3QgaW5zZXJ0ZWRBdEVuZCA9IGl0UGFydGl0aW9uLmVxdWFscyhpdExhc3QpO1xuXG4gICAgICAgIC8vIEluc2VydCB0aGUgcGl2b3QgZWxlbWVudCBhdCB0aGUgYmVnaW5uaW5nIG9mIHRoZSBzZWNvbmQgcmFuZ2UgKHJldHVybmVkIGZyb20gcGFydGl0aW9uKCkpLlxuICAgICAgICBpdFBhcnRpdGlvbiA9IHRoaXMuaW5zZXJ0KGl0UGFydGl0aW9uLCBwaXZvdFZhbHVlKTtcblxuICAgICAgICBpZiAoaW5zZXJ0ZWRBdEJlZ2lubmluZykge1xuICAgICAgICAgICAgLy8gV2UganVzdCBpbnNlcnRlZCB0aGUgcGl2b3QgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgc2VxdWVuY2UuICBXZVxuICAgICAgICAgICAgLy8gb25seSBoYXZlIHRvIHF1aWNrc29ydCgpIHRoZSByYW5nZSBmb2xsb3dpbmcgdGhlIHBpdm90LlxuICAgICAgICAgICAgdGhpcy5xdWlja3NvcnRJbXBsKGl0UGFydGl0aW9uLm9mZnNldCgxKSwgaXRMYXN0KTtcbiAgICAgICAgfSBlbHNlIGlmIChpbnNlcnRlZEF0RW5kKSB7XG4gICAgICAgICAgICAvLyBXZSBqdXN0IGluc2VydGVkIHRoZSBwaXZvdCBhdCB0aGUgZW5kIG9mIHRoZSBzZXF1ZW5jZS4gIFdlIG9ubHlcbiAgICAgICAgICAgIC8vIGhhdmUgdG8gcXVpY2tzb3J0KCkgdGhlIHJhbmdlIGluIGZyb250IG9mIHRoZSBwaXZvdC5cbiAgICAgICAgICAgIHRoaXMucXVpY2tzb3J0SW1wbChpdEZpcnN0LCBpdFBhcnRpdGlvbik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBXZSBpbnNlcnRlZCB0aGUgcGl2b3QgaW50byB0aGUgbWlkZGxlIG9mIHRoZSBzZXF1ZW5jZSwgc28gd2UgaGF2ZVxuICAgICAgICAgICAgLy8gdG8gcXVpY2tzb3J0KCkgdGhlIHJhbmdlIGluIGZyb250IG9mIGl0IGFuZCBhZnRlciBpdC5cbiAgICAgICAgICAgIHRoaXMucXVpY2tzb3J0SW1wbChpdEZpcnN0LCBpdFBhcnRpdGlvbik7XG4gICAgICAgICAgICB0aGlzLnF1aWNrc29ydEltcGwoaXRQYXJ0aXRpb24ub2Zmc2V0KDEpLCBpdExhc3QpO1xuICAgICAgICB9XG5cbiAgICB9XG5cblxufVxuXG5cbi8qKlxuICogRGVzY3JpYmVzIHRoZSByZXR1cm4gdHlwZSBmcm9tIGFuIGl0ZXJhdG9yJ3MgbmV4dCgpIG1ldGhvZC5cbiAqIFNlZTpcbiAqIGh0dHBzOi8vZGV2ZWxvcGVyLm1vemlsbGEub3JnL2VuLVVTL2RvY3MvV2ViL0phdmFTY3JpcHQvUmVmZXJlbmNlL0l0ZXJhdGlvbl9wcm90b2NvbHMjaXRlcmF0b3JcbiAqL1xuZXhwb3J0IHR5cGUgTW92ZUl0ZXJhdG9yUmV0VHlwZTxUPiA9IHtkb25lOiBmYWxzZSwgdmFsdWU6IFR9IHwge2RvbmU6IHRydWV9O1xuXG5cbi8qKlxuICogSW1wbGVtZW50cyB0aGUgaXRlcmF0b3IgcHJvdG9jb2wgZm9yIExpc3QuXG4gKi9cbmV4cG9ydCBjbGFzcyBJdGVyYXRvcjxWYWx1ZVR5cGU+ICAgICAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm1heC1jbGFzc2VzLXBlci1maWxlXG57XG4gICAgcHJpdmF0ZSAgICAgICAgICBfY3VyTm9kZTogRExOb2RlQW55PFZhbHVlVHlwZT47XG4gICAgcHJpdmF0ZSByZWFkb25seSBfZW5kTm9kZTogRExOb2RlRW5kPFZhbHVlVHlwZT47XG5cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgSXRlcmF0b3JcbiAgICAgKiBAcGFyYW0gY3VyTm9kZSAtIFRoZSBub2RlIHRoZSBJdGVyYXRvciBzaG91bGQgYmUgcG9pbnRpbmcgdG9cbiAgICAgKiBAcGFyYW0gZW5kTm9kZSAtIFRoZSBlbmQgbm9kZSBvZiB0aGUgbGlua2VkIGxpc3RcbiAgICAgKi9cbiAgICBjb25zdHJ1Y3RvcihjdXJOb2RlOiBETE5vZGVBbnk8VmFsdWVUeXBlPiwgZW5kTm9kZTogRExOb2RlRW5kPFZhbHVlVHlwZT4pIHtcbiAgICAgICAgdGhpcy5fY3VyTm9kZSA9IGN1ck5vZGU7XG4gICAgICAgIHRoaXMuX2VuZE5vZGUgPSBlbmROb2RlO1xuICAgIH1cblxuXG4gICAgcHVibGljIF9nZXRETE5vZGUoKTogRExOb2RlQW55PFZhbHVlVHlwZT4ge1xuICAgICAgICByZXR1cm4gdGhpcy5fY3VyTm9kZTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBlcXVhbHMob3RoZXJJdGVyOiBJdGVyYXRvcjxWYWx1ZVR5cGU+KTogYm9vbGVhbiB7XG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJOb2RlID09PSBvdGhlckl0ZXIuX2N1ck5vZGU7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcHJldigpOiB2b2lkIHtcbiAgICAgICAgY29uc3QgaXNBdEJlZ2luID0gdGhpcy5faXNBdEJlZ2luKCk7XG5cbiAgICAgICAgaWYgKCFpc0F0QmVnaW4pIHtcbiAgICAgICAgICAgIHRoaXMuX2N1ck5vZGUgPSB0aGlzLl9jdXJOb2RlLnByZXY7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHB1YmxpYyBuZXh0KCk6IE1vdmVJdGVyYXRvclJldFR5cGU8VmFsdWVUeXBlPiB7XG4gICAgICAgIGlmICh0aGlzLl9jdXJOb2RlLm5vZGVUeXBlID09PSBcIkRMTm9kZUVuZFwiKSB7XG4gICAgICAgICAgICByZXR1cm4ge2RvbmU6IHRydWV9O1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gR2V0IHRoZSB2YWx1ZSB0byBiZSByZXR1cm5lZC5cbiAgICAgICAgICAgIGNvbnN0IHZhbDogVmFsdWVUeXBlID0gdGhpcy5fY3VyTm9kZS52YWx1ZTtcblxuICAgICAgICAgICAgLy8gQWR2YW5jZSB0aGUgaXRlcmF0b3IuXG4gICAgICAgICAgICB0aGlzLl9jdXJOb2RlID0gdGhpcy5fY3VyTm9kZS5uZXh0O1xuXG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIGRvbmU6IGZhbHNlLFxuICAgICAgICAgICAgICAgIHZhbHVlOiB2YWxcbiAgICAgICAgICAgIH07XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgdmFsdWUoKTogVmFsdWVUeXBlIHtcblxuICAgICAgICBpZiAodGhpcy5fY3VyTm9kZS5ub2RlVHlwZSA9PT0gXCJETE5vZGVFbmRcIikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQXR0ZW1wdGVkIHRvIGdldCB2YWx1ZSBmcm9tIGFuIGl0ZXJhdG9yIGF0IGVuZCgpLlwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9jdXJOb2RlLnZhbHVlO1xuICAgIH1cblxuICAgIHB1YmxpYyBzZXQgdmFsdWUodmFsOiBWYWx1ZVR5cGUpIHtcbiAgICAgICAgaWYgKHRoaXMuX2N1ck5vZGUubm9kZVR5cGUgPT09IFwiRExOb2RlRW5kXCIpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBzZXQgdmFsdWUgb2YgZW5kIGVsZW1lbnQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgdGhpcy5fY3VyTm9kZS52YWx1ZSA9IHZhbDtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgcHVibGljIG9mZnNldChvZmZzZXQ6IG51bWJlcik6IEl0ZXJhdG9yPFZhbHVlVHlwZT4ge1xuICAgICAgICAvLyBNYWtlIGEgY29weSBvZiB0aGlzIGl0ZXJhdG9yIGFuZCB0aGVuIGFkdmFuY2UgaXQuXG4gICAgICAgIGNvbnN0IGl0OiBJdGVyYXRvcjxWYWx1ZVR5cGU+ID0gbmV3IEl0ZXJhdG9yPFZhbHVlVHlwZT4odGhpcy5fY3VyTm9kZSwgdGhpcy5fZW5kTm9kZSk7XG4gICAgICAgIGFkdmFuY2UoaXQsIG9mZnNldCk7XG4gICAgICAgIHJldHVybiBpdDtcbiAgICB9XG5cblxuICAgIHByaXZhdGUgX2lzQXRCZWdpbigpOiBib29sZWFuIHtcblxuICAgICAgICBjb25zdCBpc09uRW5kT2ZaZXJvTGVuZ3RoTGlzdCA9IHRoaXMuX2N1ck5vZGUubm9kZVR5cGUgPT09IFwiRExOb2RlRW5kXCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLl9jdXJOb2RlLnByZXYgPT09IHVuZGVmaW5lZCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuX2N1ck5vZGUubmV4dCA9PT0gdW5kZWZpbmVkO1xuICAgICAgICBpZiAoaXNPbkVuZE9mWmVyb0xlbmd0aExpc3QpIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gV2UgYXJlIGF0IHRoZSBiZWdpbm5pbmcgaWYgd2UgYXJlIHBvaW50aW5nIHRvIGEgdmFsdWUgbm9kZSBhbmQgdGhlXG4gICAgICAgIC8vIHByZXZpb3VzIG5vZGUgaXMgdGhlIGVuZCBub2RlLlxuICAgICAgICBjb25zdCBpc0F0QmVnaW4gPSB0aGlzLl9jdXJOb2RlLm5vZGVUeXBlID09PSBcIkRMTm9kZVZhbHVlXCIgJiZcbiAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5fY3VyTm9kZS5wcmV2Lm5vZGVUeXBlID09PSBcIkRMTm9kZUVuZFwiO1xuICAgICAgICByZXR1cm4gaXNBdEJlZ2luO1xuICAgIH1cblxuXG4gICAgLy8gVGhlIGZvbGxvd2luZyBtZXRob2QgaXMgbm90IG5lZWRlZCwgYmVjYXVzZSBjaGVja2luZ1xuICAgIC8vIHRoaXMuX2N1ck5vZGUubm9kZVR5cGUgaXMgcHJlZmVyYWJsZSwgYmVjYXVzZSBUUyByZWNvZ25pemVzIHRoZVxuICAgIC8vIGRpc2NyaW1pbmF0aW5nIHVuaW9uIGFuZCB1c2VzIGl0IGFzIGEgdHlwZSBndWFyZC5cbiAgICAvL1xuICAgIC8vIHByaXZhdGUgX2lzQXRFbmQoKTogYm9vbGVhbiB7XG4gICAgLy8gICAgIHJldHVybiB0aGlzLl9jdXJOb2RlLm5vZGVUeXBlID09PSBcIkRMTm9kZUVuZFwiO1xuICAgIC8vICAgICAvLyBDb3VsZCBoYXZlIGFsc28gYmVlbiBpbXBsZW1lbnRlZCBsaWtlOlxuICAgIC8vICAgICAvLyByZXR1cm4gdGhpcy5fY3VyTm9kZSA9PT0gdGhpcy5fZW5kTm9kZTtcbiAgICAvLyB9XG59XG4iXX0=
