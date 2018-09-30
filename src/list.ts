import {advance, partition} from "./algorithm";

function link<ValueType>(left: DLNodeAny<ValueType>, right: DLNodeAny<ValueType>): void {
    left.next = right;
    right.prev = left;
}


class DLNodeEnd<ValueType> {

    // region Data Members
    private _prev: DLNodeValue<ValueType> | undefined;
    private _next: DLNodeValue<ValueType> | undefined;
    // endregion


    constructor() {
    }


    public get nodeType(): "DLNodeEnd" {
        return "DLNodeEnd";
    }


    public get prev(): DLNodeValue<ValueType> {
        if (this._prev === undefined) {
            throw new Error("DLNodeEnd instance has not been linked to a previous node.");
        }
        return this._prev;
    }

    public set prev(prev: DLNodeValue<ValueType>) {
        this._prev = prev;
    }


    public get next(): DLNodeValue<ValueType> {
        if (this._next === undefined) {
            throw new Error("DLNodeEnd instance has not been linked to a next node.");
        }
        return this._next;
    }

    public set next(next: DLNodeValue<ValueType>) {
        this._next = next;
    }
}


/**
 * Class that represents a node in a doubly linked list.  The nodes form a
 * circle where there is one special "end" node that has a value of undefined.
 */
class DLNodeValue<ValueType> {  // tslint:disable-line:max-classes-per-file

    // region Data Members
    private _prev: DLNodeAny<ValueType> | undefined;
    private _next: DLNodeAny<ValueType> | undefined;
    private _value: ValueType;
    // endregion


    /**
     * Constructs a new DLNode with the specified value.
     * @param value - The payload to be stored at this node
     */
    constructor(value: ValueType) {
        this._value = value;
    }


    public get nodeType(): "DLNodeValue" {
        return "DLNodeValue";
    }


    public get prev(): DLNodeAny<ValueType> {
        if (this._prev === undefined) {
            throw new Error("DLNodeValue instance has not been linked to a previous node.");
        }
        return this._prev;
    }

    public set prev(prev: DLNodeAny<ValueType>) {
        this._prev = prev;
    }


    public get next(): DLNodeAny<ValueType> {
        if (this._next === undefined) {
            throw new Error("DLNodeValue instance has not been linked to a next node.");
        }
        return this._next;
    }

    public set next(next: DLNodeAny<ValueType>) {
        this._next = next;
    }


    public get value(): ValueType {
        return this._value;
    }


    public set value(val: ValueType) {
        this._value = val;
    }


}


// A union type of all possible node types.
// The discriminant is the `nodeType` property.
type DLNodeAny<ValueType> = DLNodeEnd<ValueType> | DLNodeValue<ValueType>;


/**
 * A doubly-linked list.
 *
 * This linked list is implemented as a circular linked list with one node being
 * the "end" node.
 */
export class List<ValueType> // tslint:disable-line:max-classes-per-file
{
    public static fromArray<ValueType>(arr: Array<ValueType>): List<ValueType> {
        const newList = new List<ValueType>();
        arr.forEach((curVal) => newList.push(curVal));
        return newList;
    }


    // region Data Members
    private readonly _end: DLNodeEnd<ValueType>;
    private _length: number;
    // endregion


    /**
     * Creates a new List object.
     */
    constructor() {
        this._end = new DLNodeEnd<ValueType>();
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
     * Returns an Iterator that points to the first element in this List.
     * @returns An Iterator pointing to the first element in this List.  If this
     * List is empty, the returned iterator will be pointing to end().
     */
    public begin(): Iterator<ValueType> {
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
    public end(): Iterator<ValueType> {
        return new Iterator(this._end, this._end);
    }


    /**
     * Adds a new value onto the end of this List.
     * @param value - The value to be appended
     * @returns This list (to allow chaining)
     */
    public push(value: ValueType): List<ValueType> {
        this.insertNode(this._end, value);

        // Return this to allow chaining.
        return this;
    }


    /**
     * Removes the element on the end of this List and returns its value.
     * @returns The value associated with the removed element, or undefined if
     * this List is empty.
     */
    public pop(): ValueType {
        if (this._length === 0) {
            throw new Error("Attempted to pop() an empty List.");
        }

        // Because this List is not empty, we know for sure that the node
        // before the end node contains a value.
        const lastValueNode: DLNodeValue<ValueType> = this._end.prev;
        const val: ValueType = lastValueNode.value;

        // Remove the node from the list.
        this.removeNode(lastValueNode);

        return val;
    }


    /**
     * Removes the specified element from this List.
     * @param it - Iterator pointing to the element to be removed.  If the
     * iterator passed is end(), an Error will be thrown.
     * @returns An iterator pointing to the element following the removed
     * element, which may be end().
     */
    public remove(it: Iterator<ValueType>): Iterator<ValueType> {
        const itEnd = this.end();
        if (it.equals(itEnd)) {
            throw new Error("Attempted to remove List elment at end().");
        }

        const nodeToRemove: DLNodeValue<ValueType> = it._getDLNode() as DLNodeValue<ValueType>;
        const nextNode: DLNodeAny<ValueType> = this.removeNode(nodeToRemove);
        return new Iterator<ValueType>(nextNode, this._end);
    }


    /**
     * Gets the value at the specified index.
     * @param index - The index of the value to retrieve
     * @returns The value at the specified index
     */
    public getAt(index: number): ValueType {
        if (index < 0) {
            // FUTURE: Allow negative indices that are relative to the end.
            throw new Error("Index cannot be negative.");
        }

        const maxIndex = this._length - 1;
        if (index > maxIndex) {
            throw new Error("Index out of range.");
        }

        const it: Iterator<ValueType> = this.begin();
        advance(it, index);

        // Because the index was checked previously, we know we are going to
        // finish on a value node (not the end node).  Therefore, reading the
        // value here will not throw an Error.
        return it.value;
    }


    /**
     * Inserts new elements into this list.
     * @param insertInFrontOf - The new elements will be inserted in front of this element
     * @param values - The values to insert
     * @returns An Iterator pointing to the first inserted element, or `insertInFrontOf` if
     * no values were specified.
     */
    public insert(insertInFrontOf: Iterator<ValueType>, ...values: Array<ValueType>): Iterator<ValueType> {

        const firstInsertedNode: DLNodeAny<ValueType> = this.insertNode(insertInFrontOf._getDLNode(), ...values);
        return new Iterator(firstInsertedNode, this._end);
    }


    /**
     * Converts this List to an array with the same values.
     * @returns The converted array
     */
    public toArray(): Array<ValueType> {
        const arr: Array<ValueType> = [];
        const itEnd: Iterator<ValueType> = this.end();
        for (const it = this.begin(); !it.equals(itEnd); it.next()) {
            // This for loop ensures that it will only point to value nodes (not
            // the end node), so reading the value here will never throw an
            // Error.
            arr.push(it.value!);
        }
        return arr;
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
    private removeNode(removeNode: DLNodeValue<ValueType>): DLNodeAny<ValueType> {
        const prevNode: DLNodeAny<ValueType> = removeNode.prev;
        const nextNode: DLNodeAny<ValueType> = removeNode.next;

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
    private insertNode(insertInFrontOf: DLNodeAny<ValueType>, ...values: Array<ValueType>): DLNodeAny<ValueType> {

        if (values.length === 0) {
            return insertInFrontOf;
        }

        let nodeRet: DLNodeAny<ValueType> | undefined;

        if (this._length === 0) {
            // In this scenario, insertInFrontOf must be end().
            if (insertInFrontOf.nodeType !== "DLNodeEnd") {
                throw new Error("insertNode() given an invalid iterator.");
            }

            // There are no values in this List.  Adding the first value is a
            // little special.
            const newNode = new DLNodeValue<ValueType>(values.shift()!);
            link(this._end, newNode);
            link(newNode, this._end);
            this._length += 1;

            // This is the first node that we want to return.
            nodeRet = newNode;
        }

        const nextNode = insertInFrontOf;
        let prevNode = nextNode.prev;
        let newNode: DLNodeValue<ValueType>;

        for (const curValue of values) {
            // Create the new node and link with the node to the left.
            newNode = new DLNodeValue<ValueType>(curValue);
            link(prevNode, newNode);

            this._length += 1;

            // We now have a *new* previous node.
            prevNode = newNode;

            // If this is the first, item inserted, remember it so we can return
            // it.
            nodeRet = nodeRet || newNode;
        }

        // Each new node was linked with the node to its left when inserted.
        // Now that we are done inserting them, link the last inserted node with
        // the node to its right.
        link(prevNode, nextNode);

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
        itFirst: Iterator<ValueType>,
        itLast: Iterator<ValueType>
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
        const pivotValue: ValueType = itPivot.value;

        // Because the pivot element is always the first, we will always have to
        // adjust itFirst.
        itFirst = itPivot.offset(1);

        // Remove the pivot element.
        this.remove(itPivot);

        // partition() from itFirst (inclusive) to itLast (exclusive) based on
        // curVal < pivot.  Once the range is partitioned, we will be able to
        // insert the pivot value between the two partitioned ranges.
        let itPartition = partition(itFirst, itLast, (curVal) => curVal! < pivotValue);
        const insertedAtBeginning = itPartition.equals(itFirst);
        const insertedAtEnd = itPartition.equals(itLast);

        // Insert the pivot element at the beginning of the second range (returned from partition()).
        itPartition = this.insert(itPartition, pivotValue);

        if (insertedAtBeginning) {
            // We just inserted the pivot at the beginning of the sequence.  We
            // only have to quicksort() the range following the pivot.
            this.quicksortImpl(itPartition.offset(1), itLast);
        } else if (insertedAtEnd) {
            // We just inserted the pivot at the end of the sequence.  We only
            // have to quicksort() the range in front of the pivot.
            this.quicksortImpl(itFirst, itPartition);
        } else {
            // We inserted the pivot into the middle of the sequence, so we have
            // to quicksort() the range in front of it and after it.
            this.quicksortImpl(itFirst, itPartition);
            this.quicksortImpl(itPartition.offset(1), itLast);
        }

    }


}


/**
 * Describes the return type from an iterator's next() method.
 * See:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterator
 */
export type MoveIteratorRetType<T> = {done: false, value: T} | {done: true};


/**
 * Implements the iterator protocol for List.
 */
export class Iterator<ValueType>     // tslint:disable-line:max-classes-per-file
{
    private          _curNode: DLNodeAny<ValueType>;
    private readonly _endNode: DLNodeEnd<ValueType>;


    /**
     * Creates a new Iterator
     * @param curNode - The node the Iterator should be pointing to
     * @param endNode - The end node of the linked list
     */
    constructor(curNode: DLNodeAny<ValueType>, endNode: DLNodeEnd<ValueType>) {
        this._curNode = curNode;
        this._endNode = endNode;
    }


    public _getDLNode(): DLNodeAny<ValueType> {
        return this._curNode;
    }


    public equals(otherIter: Iterator<ValueType>): boolean {
        return this._curNode === otherIter._curNode;
    }


    public prev(): void {
        const isAtBegin = this._isAtBegin();

        if (!isAtBegin) {
            this._curNode = this._curNode.prev;
        }
    }


    public next(): MoveIteratorRetType<ValueType> {
        if (this._curNode.nodeType === "DLNodeEnd") {
            return {done: true};
        }
        else {
            // Get the value to be returned.
            const val: ValueType = this._curNode.value;

            // Advance the iterator.
            this._curNode = this._curNode.next;

            return {
                done: false,
                value: val
            };
        }
    }


    public get value(): ValueType {

        if (this._curNode.nodeType === "DLNodeEnd") {
            throw new Error("Attempted to get value from an iterator at end().");
        }

        return this._curNode.value;
    }

    public set value(val: ValueType) {
        if (this._curNode.nodeType === "DLNodeEnd") {
            throw new Error("Cannot set value of end element.");
        }
        else {
            this._curNode.value = val;
        }
    }


    public offset(offset: number): Iterator<ValueType> {
        // Make a copy of this iterator and then advance it.
        const it: Iterator<ValueType> = new Iterator<ValueType>(this._curNode, this._endNode);
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
