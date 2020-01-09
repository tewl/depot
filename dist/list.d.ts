declare class DLNodeEnd<ValueType> {
    private _prev;
    private _next;
    constructor();
    readonly nodeType: "DLNodeEnd";
    prev: DLNodeAny<ValueType>;
    next: DLNodeAny<ValueType>;
}
/**
 * Class that represents a node in a doubly linked list.  The nodes form a
 * circle where there is one special "end" node that has a value of undefined.
 */
declare class DLNodeValue<ValueType> {
    private _prev;
    private _next;
    private _value;
    /**
     * Constructs a new DLNode with the specified value.
     * @param value - The payload to be stored at this node
     */
    constructor(value: ValueType);
    readonly nodeType: "DLNodeValue";
    prev: DLNodeAny<ValueType>;
    next: DLNodeAny<ValueType>;
    value: ValueType;
}
declare type DLNodeAny<ValueType> = DLNodeEnd<ValueType> | DLNodeValue<ValueType>;
/**
 * A doubly-linked list.
 *
 * This linked list is implemented as a circular linked list with one node being
 * the "end" node.
 */
export declare class List<ValueType> {
    static fromArray<ValueType>(arr: Array<ValueType>): List<ValueType>;
    private readonly _end;
    private _length;
    /**
     * Creates a new List object.
     */
    constructor();
    /**
     * Gets the length of this List.  This operation takes O(1) time.
     * @returns The number of elements in this List
     */
    readonly length: number;
    /**
     * Determines (in constant time - O(1)) whether this list is empty.
     * @returns true if this list is empty.  false otherwise.
     */
    readonly isEmpty: boolean;
    /**
     * Returns an Iterator that points to the first element in this List.
     * @returns An Iterator pointing to the first element in this List.  If this
     * List is empty, the returned iterator will be pointing to end().
     */
    begin(): Iterator<ValueType>;
    /**
     * Returns an Iterator that points to an element one past the end of this
     * List.
     * @returns An Iterator pointing to an element one past the end of this
     * list.
     */
    end(): Iterator<ValueType>;
    /**
     * Adds a new value onto the end of this List.
     * @param value - The value to be appended
     * @returns This list (to allow chaining)
     */
    push(value: ValueType): List<ValueType>;
    /**
     * Removes the element on the end of this List and returns its value.
     * @returns The value associated with the removed element, or undefined if
     * this List is empty.
     */
    pop(): ValueType;
    /**
     * Removes the specified element from this List.
     * @param it - Iterator pointing to the element to be removed.  If the
     * iterator passed is end(), an Error will be thrown.
     * @returns An iterator pointing to the element following the removed
     * element, which may be end().
     */
    remove(it: Iterator<ValueType>): Iterator<ValueType>;
    /**
     * Gets the value at the specified index.
     * @param index - The index of the value to retrieve
     * @returns The value at the specified index
     */
    getAt(index: number): ValueType;
    /**
     * Inserts new elements into this list.
     * @param insertInFrontOf - The new elements will be inserted in front of this element
     * @param values - The values to insert
     * @returns An Iterator pointing to the first inserted element, or `insertInFrontOf` if
     * no values were specified.
     */
    insert(insertInFrontOf: Iterator<ValueType>, ...values: Array<ValueType>): Iterator<ValueType>;
    /**
     * Converts this List to an array with the same values.
     * @returns The converted array
     */
    toArray(): Array<ValueType>;
    quicksort(): void;
    /**
     * Helper method that removes a node from this linked list.
     * @param removeNode - The node to be removed.  The type is
     * DLNodeValue<ValueType> because the end node cannot be removed.
     * @returns The node after the removed node
     */
    private removeNode;
    /**
     * Helper method that inserts new elements into this List.
     * @param insertInFrontOf - The new elements will be inserted in front of
     * this element
     * @param values - The values to insert
     * @returns The first inserted DLNode, or `insertInFrontOf` if no values
     * were specified.
     */
    private insertNode;
    /**
     * Does an in-place sort of the elements in the range [itFirst, itLast).
     * This algorithm is O(n * log(n)).
     * @param itFirst - The first element in the range to be sorted (included)
     * @param itLast - The last element of the range to be sorted (excluded)
     */
    private quicksortImpl;
}
/**
 * Describes the return type from an iterator's next() method.
 * See:
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols#iterator
 */
export declare type MoveIteratorRetType<T> = {
    done: false;
    value: T;
} | {
    done: true;
};
/**
 * Implements the iterator protocol for List.
 */
export declare class Iterator<ValueType> {
    private _curNode;
    private readonly _endNode;
    /**
     * Creates a new Iterator
     * @param curNode - The node the Iterator should be pointing to
     * @param endNode - The end node of the linked list
     */
    constructor(curNode: DLNodeAny<ValueType>, endNode: DLNodeEnd<ValueType>);
    _getDLNode(): DLNodeAny<ValueType>;
    equals(otherIter: Iterator<ValueType>): boolean;
    prev(): void;
    next(): MoveIteratorRetType<ValueType>;
    value: ValueType;
    offset(offset: number): Iterator<ValueType>;
    private _isAtBegin;
}
export {};
