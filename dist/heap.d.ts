export declare enum CompareResult {
    LESS = -1,
    EQUAL = 0,
    GREATER = 1
}
declare type CompareFunc<T> = (a: T, b: T) => CompareResult;
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
export declare class Heap<T> {
    private readonly _compareFunc;
    private readonly _store;
    /**
     * Creates a new Heap instance.
     * @param compareFunc - A function that will be used to sort items in this
     * heap.
     */
    constructor(compareFunc: CompareFunc<T>);
    /**
     * Returns the number of items in this heap
     * @return The number of items in this heap
     */
    readonly length: number;
    /**
     * Determines whether this heap is empty.
     * @return true if this heap is empty; false otherwise
     */
    readonly isEmpty: boolean;
    /**
     * Calculates the maximum depth of this heap.
     * @return The maximum depth of the this heap
     */
    readonly depth: number;
    /**
     * Adds a new value to this heap
     * @param val - The value to be added to this heap
     */
    push(val: T): void;
    /**
     * Gets the greatest item from this heap (without removing it)
     * @return The item with the greatest value (as determined by compareFunc)
     */
    peak(): T | undefined;
    /**
     * Gets the greatest item from this heap
     * @return The item with the greatest value (as determined by compareFunc)
     */
    pop(): T | undefined;
    /**
     * Iteratively compares the value at the specified index with its parent and
     * swaps them if the child value is greater.
     * @param index - The index of the item to float.
     */
    private float;
    /**
     * Iteratively compares the value at the specified index with its *largest
     * child* and swaps them if the child value is greater.
     * @param index - The index of the item to sink
     */
    private sink;
    /**
     * Determines whether the specified index is the root of this heap's tree.
     * @param index - The index of the item to check
     * @return true if the specified index is the root of this heap; false
     * otherwise.
     */
    private isRoot;
    /**
     * Compares the items at the specified indices
     * @param indexA - Index of the left side argument
     * @param indexB - Index of the right sided argument
     * @return The result of comparing the specified items
     */
    private compare;
    /**
     * Swaps the items at the specified indices
     * @param indexA - Index of an item to swap
     * @param indexB - Index of an item to swap
     */
    private swap;
    /**
     * Determines whether index is a valid index for this heap
     * @param index - The index to check
     * @return true if index is valid; false otherwise
     */
    private isValidIndex;
    /**
     * Finds the parent of the specified item
     * @param index - Index of the item for which the parent index is to be found
     * @return The parent index.  Undefined if index is the root of this heap
     */
    private parentIndex;
    /**
     * Finds the left child of the specified item
     * @param index - Index of the item for which the left child index is to be found
     * @return The left child index.  Undefined if index has no left child
     */
    private leftChild;
    /**
     * Finds the right child of the specified item
     * @param index - Index of the item for which the right child index is to be found
     * @return The right child index.  Undefined if index has no right child
     */
    private rightChild;
}
export {};
