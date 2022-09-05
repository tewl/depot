import {advance, partition} from "./algorithm";

function link<TValue>(prev: DLNode<TValue>, next: DLNode<TValue>): void {
    prev.next = next;
    next.prev = prev;
}


class DLNodeEnd<TValue> {
    // region Data Members
    private _prev: DLNode<TValue>;
    private _next: DLNode<TValue>;
    // endregion


    constructor() {
        this._prev = this;
        this._next = this;
    }


    // Discriminant.
    public get nodeType(): "DLNodeEnd" {
        return "DLNodeEnd";
    }


    public get prev(): DLNode<TValue> {
        if (this._prev === undefined) {
            throw new Error("DLNodeEnd instance has not been linked to a previous node.");
        }
        return this._prev;
    }

    public set prev(prev: DLNode<TValue>) {
        this._prev = prev;
    }


    public get next(): DLNode<TValue> {
        if (this._next === undefined) {
            throw new Error("DLNodeEnd instance has not been linked to a next node.");
        }
        return this._next;
    }

    public set next(next: DLNode<TValue>) {
        this._next = next;
    }
}


/**
 * Class that represents a node in a doubly linked list.  The nodes form a
 * circle where there is one special "end" node that has a value of undefined.
 */
class DLNodeValue<TValue> {
    // region Data Members
    private _prev: DLNode<TValue> | undefined;
    private _next: DLNode<TValue> | undefined;
    private _value: TValue;
    // endregion


    /**
     * Constructs a new DLNode with the specified value.
     * @param value - The payload to be stored at this node
     */
    constructor(value: TValue) {
        this._value = value;
    }


    // Discriminant.
    public get nodeType(): "DLNodeValue" {
        return "DLNodeValue";
    }


    public get prev(): DLNode<TValue> {
        if (this._prev === undefined) {
            throw new Error("DLNodeValue instance has not been linked to a previous node.");
        }
        return this._prev;
    }

    public set prev(prev: DLNode<TValue>) {
        this._prev = prev;
    }


    public get next(): DLNode<TValue> {
        if (this._next === undefined) {
            throw new Error("DLNodeValue instance has not been linked to a next node.");
        }
        return this._next;
    }

    public set next(next: DLNode<TValue>) {
        this._next = next;
    }


    public get value(): TValue {
        return this._value;
    }


    public set value(val: TValue) {
        this._value = val;
    }


}


// A union type of all possible node types.
// The discriminant is the `nodeType` property.
type DLNode<TValue> = DLNodeEnd<TValue> | DLNodeValue<TValue>;


/**
 * A doubly-linked list.
 *
 * This linked list is implemented as a circular linked list with one node being
 * the "end" node.
 */
export class List<TValue> implements Iterable<TValue> {
    public static fromArray<TValue>(arr: Array<TValue>): List<TValue> {
        const newList = new List<TValue>();
        arr.forEach((curVal) => newList.push(curVal));
        return newList;
    }


    // region Data Members
    private readonly _end: DLNodeEnd<TValue>;
    private _length: number;
    // endregion


    /**
     * Creates a new List object.
     */
    constructor() {
        this._end = new DLNodeEnd<TValue>();
        this._length = 0;
    }


    /**
     * Gets the length of this List.  This operation takes O(1) time.
     * @returns The number of elements in this List
     */
    public get length(): number {
        return this._length;
    }


    /**
     * Determines (in constant time - O(1)) whether this list is empty.
     * @returns true if this list is empty.  false otherwise.
     */
    public get isEmpty(): boolean {
        return this._length === 0;
    }


    /**
     * Makes this collection an Iterable, which enables instances to be used
     * with other language features such as for...of, Array.from() and spread
     * operator.
     */
    [Symbol.iterator](): Iterator<TValue> {
        return this.begin();
    }


    /**
     * Returns an Iterator that points to the first element in this List.
     * @returns An Iterator pointing to the first element in this List.  If this
     * List is empty, the returned iterator will be pointing to end().
     */
    public begin(): Iterator<TValue> {
        return this._length === 0 ?
               new Iterator(this._end, this._end) :
               new Iterator(this._end.next, this._end);
    }


    /**
     * Returns an Iterator that points to an element one past the end of this
     * List.
     * @returns An Iterator pointing to an element one past the end of this
     * list.
     */
    public end(): Iterator<TValue> {
        return new Iterator(this._end, this._end);
    }


    /**
     * Adds a new value onto the end of this List.
     * @param value - The value to be appended
     * @returns This list (to allow chaining)
     */
    public push(value: TValue): this {
        this.insertNode(this._end, value);

        // Return this to allow chaining.
        return this;
    }


    /**
     * Removes the element on the end of this List and returns its value.
     * @returns The value associated with the removed element, or undefined if
     * this List is empty.
     */
    public pop(): TValue {
        if (this._length === 0) {
            throw new Error("Attempted to pop() an empty List.");
        }

        // Because this List is not empty, we know for sure that the node
        // before the end node contains a value.
        const lastValueNode = this._end.prev as DLNodeValue<TValue>;
        const val: TValue = lastValueNode.value;

        // Remove the node from the list.
        this.removeNode(lastValueNode);

        return val;
    }


    /**
     * Gets the value at the specified index.
     * @param index - The index of the value to retrieve
     * @returns The value at the specified index
     */
    public getAt(index: number): TValue {
        if (index < 0) {
            // FUTURE: Allow negative indices that are relative to the end.
            throw new Error("Index cannot be negative.");
        }

        const maxIndex = this._length - 1;
        if (index > maxIndex) {
            throw new Error("Index out of range.");
        }

        const it: Iterator<TValue> = this.begin();
        advance(it, index);

        // Because the index was checked previously, we know we are going to
        // finish on a value node (not the end node).  Therefore, reading the
        // value here will not throw an Error.
        return it.value;
    }


    /**
     * Splices items into this list, deleting some existing items and inserting
     * other in their place.
     * @param location - Iterator pointing at the first item to be deleted or
     * the item new items will be inserted in front of.
     * @param deleteCount - The number of items to be deleted
     * @param newItems - The new values to be inserted
     * @returns An array of the deleted items
     */
    public splice(location: Iterator<TValue>, deleteCount: number, ...newItems: Array<TValue>): Array<TValue> {

        // Delete.
        const deletedItems: Array<TValue> = [];
        let curNode = location._getDLNode();
        for (let i = 0; i < deleteCount; i++) {

            if (curNode.nodeType === "DLNodeEnd") {
                break;
            }

            deletedItems.push(curNode.value);
            curNode = this.removeNode(curNode);

        }

        // Insert.
        this.insertNode(curNode, ...newItems);

        return deletedItems;
    }


    public quicksort(): void {
        this.quicksortImpl(this.begin(), this.end());
    }


    /**
     * Helper method that removes a node from this linked list.
     * @param removeNode - The node to be removed.  The type is
     * DLNodeValue<ValueType> because the end node cannot be removed.
     * @returns The node after the removed node
     */
    private removeNode(removeNode: DLNodeValue<TValue>): DLNode<TValue> {
        const prevNode: DLNode<TValue> = removeNode.prev;
        const nextNode: DLNode<TValue> = removeNode.next;

        // Remove the element from the list.
        link(prevNode, nextNode);
        this._length -= 1;

        return nextNode;
    }


    /**
     * Helper method that inserts new elements into this List.
     * @param insertInFrontOf - The new elements will be inserted in front of
     * this element
     * @param values - The values to insert
     * @returns The first inserted DLNode, or `insertInFrontOf` if no values
     * were specified.
     */
    private insertNode(insertInFrontOf: DLNode<TValue>, ...values: Array<TValue>): DLNode<TValue> {

        // If the array of items to insert is empty, we have nothing to do.
        if (values.length === 0) {
            return insertInFrontOf;
        }

        let nodeRet: DLNode<TValue> | undefined;

        for (const curVal of values) {
            const prevNode: DLNode<TValue> = insertInFrontOf.prev;
            const nextNode: DLNode<TValue> = insertInFrontOf;

            const newNode = new DLNodeValue(curVal);

            link(prevNode, newNode);
            link(newNode, nextNode);

            this._length += 1;

            // If this is the first node inserted, remember it so we can return
            // it.
            nodeRet = nodeRet || newNode;
        }

        // Since we checked the size of the `values` array at the beginning of
        // this method, we know that nodeRet will have been set.
        return nodeRet!;
    }


    /**
     * Does an in-place sort of the elements in the range [itFirst, itLast).
     * This algorithm is O(n * log(n)).
     * @param itFirst - The first element in the range to be sorted (included)
     * @param itLast - The last element of the range to be sorted (excluded)
     */
    private quicksortImpl(
        itFirst: Iterator<TValue>,
        itLast: Iterator<TValue>
    ): void {
        // Normally, a random element would be selected as the pivot.  This,
        // however, would require calculating how many elements are in [itFirst,
        // itLast). Because we are operating on a list, that distance()
        // operation is very costly.  So instead, we will just always use the
        // first element as the pivot.

        // If the sequence [itFirst, itLast) has 0 or 1 element, this is the
        // base case and we can return immediately.
        if (itFirst.equals(itLast) ||            // 0 elements in range
            itFirst.offset(1).equals(itLast)     // 1 element in range (at itFirst)
        ) {
            return;
        }

        // Set the pivot.
        const pivotIndex = 0;
        const itPivot = itFirst.offset(pivotIndex);
        const pivotValue: TValue = itPivot.value;

        // Because the pivot element is always the first, we will always have to
        // adjust itFirst.
        itFirst = itPivot.offset(1);

        // Remove the pivot element.
        this.remove(itPivot);

        // partition() from itFirst (inclusive) to itLast (exclusive) based on
        // curVal < pivot.  Once the range is partitioned, we will be able to
        // insert the pivot value between the two partitioned ranges.
        let itPartition = partition(itFirst, itLast, (curVal) => curVal < pivotValue);
        const insertedAtBeginning = itPartition.equals(itFirst);
        const insertedAtEnd = itPartition.equals(itLast);

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

    }


}


/**
 * Implements the iterator protocol for List.
 */
export class Iterator<TValue> implements Iterator<TValue> {
    private          _curNode: DLNode<TValue>;
    private readonly _endNode: DLNodeEnd<TValue>;


    /**
     * Creates a new Iterator
     * @param curNode - The node the Iterator should be pointing to
     * @param endNode - The end node of the linked list
     */
    constructor(curNode: DLNode<TValue>, endNode: DLNodeEnd<TValue>) {
        this._curNode = curNode;
        this._endNode = endNode;
    }


    public _getDLNode(): DLNode<TValue> {
        return this._curNode;
    }


    public equals(otherIter: Iterator<TValue>): boolean {
        return this._curNode === otherIter._curNode;
    }


    public prev(): void {
        const isAtBegin = this._isAtBegin();

        if (!isAtBegin) {
            this._curNode = this._curNode.prev;
        }
    }


    public next(): IteratorResult<TValue, undefined> {
        if (this._curNode.nodeType === "DLNodeEnd") {
            return {done: true, value: undefined};
        }
        else {
            // Get the value to be returned.
            const val: TValue = this._curNode.value;

            // Advance the iterator.
            this._curNode = this._curNode.next;

            return {
                done:  false,
                value: val
            };
        }
    }


    public get value(): TValue {
        if (this._curNode.nodeType === "DLNodeEnd") {
            throw new Error("Attempted to get value from an iterator at end().");
        }

        return this._curNode.value;
    }

    public set value(val: TValue) {
        if (this._curNode.nodeType === "DLNodeEnd") {
            throw new Error("Cannot set value of end element.");
        }
        else {
            this._curNode.value = val;
        }
    }


    /**
    * Clones the specified iterator and then advances it the specified number of
    * times.
    *
    * @param offset - The number of times to advance the new iterator.
    * @return The new iterator
    */
    public offset(offset: number): Iterator<TValue> {
        // Make a copy of this iterator and then advance it.
        const it: Iterator<TValue> = new Iterator<TValue>(this._curNode, this._endNode);
        advance(it, offset);
        return it;
    }


    private _isAtBegin(): boolean {
        const isOnEndOfZeroLengthList = this._curNode.nodeType === "DLNodeEnd" &&
                                        this._curNode.prev === undefined &&
                                        this._curNode.next === undefined;
        if (isOnEndOfZeroLengthList) {
            return true;
        }

        // We are at the beginning if we are pointing to a value node and the
        // previous node is the end node.
        const isAtBegin = this._curNode.nodeType === "DLNodeValue" &&
                          this._curNode.prev.nodeType === "DLNodeEnd";
        return isAtBegin;
    }


    // The following method is not needed, because checking
    // this._curNode.nodeType is preferable, because TS recognizes the
    // discriminating union and uses it as a type guard.
    //
    // private _isAtEnd(): boolean {
    //     return this._curNode.nodeType === "DLNodeEnd";
    //     // Could have also been implemented like:
    //     // return this._curNode === this._endNode;
    // }
}
