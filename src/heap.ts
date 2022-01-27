import * as _ from "lodash";
import { CompareFunc, CompareResult } from "./compare";


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
export class Heap<T>
{
    // region Instance Data Members

    private readonly _compareFunc: CompareFunc<T>;

    // Backing store for the items stored in this heap. The element at index 0
    // is always undefined.
    private readonly _store: Array<T | undefined>;

    // endregion


    /**
     * Creates a new Heap instance.
     * @param compareFunc - A function that will be used to sort items in this
     * @param inputArr - An array of values that will be used to populate the
     * new heap instance.
     */
    public constructor(compareFunc: CompareFunc<T>, inputArr?: Array<T>)
    {
        this._compareFunc = compareFunc;

        // The element at index 0 is not used.  The root of the binary tree is
        // at index 1.
        this._store = [undefined];
        if (inputArr !== undefined && inputArr.length > 0)
        {
            // Initial values have been specified.  The first index of a leaf
            // node is at *heap* index Math.floor(inputArr.length / 2) + 1.  All
            // of those leaf nodes can be thought of as a 1-element heap.  So
            // all we have to do is go through the remaining (parent) nodes, and
            // sink each one to its proper location.  We step through the
            // remaining nodes backwards so that the subtrees rooted at each are
            // already heaps.  This is more efficient than pushing every element
            // into the heap, because we only have to process half the elements.
            const heapIndexLastParent = Math.floor(inputArr.length / 2);
            this._store = _.concat(this._store, inputArr);
            for (let curHeapIndex = heapIndexLastParent; curHeapIndex > 0; curHeapIndex--)
            {
                this.sink(curHeapIndex);
            }
        }
    }


    /**
     * Returns the number of items in this heap
     * @return The number of items in this heap
     */
    public get length(): number
    {
        // Subtract 1, because element 0 is never used.
        return this._store.length - 1;
    }


    /**
     * Determines whether this heap is empty.
     * @return true if this heap is empty; false otherwise
     */
    public get isEmpty(): boolean
    {
        return this.length === 0;
    }


    /**
     * Calculates the maximum depth of this heap.
     * @return The maximum depth of the this heap
     */
    public get depth(): number
    {
        if (this.length === 0)
        {
            return 0;
        }

        // Because this tree is filled in from left to right, the maximum depth
        // can be obtained by walking down the leftmost branches of this tree.
        let curDepth = 0;
        let curIndex: number | undefined = 1;

        while (curIndex !== undefined)
        {
            curDepth++;
            curIndex = this.leftChild(curIndex);
        }

        return curDepth;
    }


    /**
     * Adds a new value to this heap
     * @param val - The value to be added to this heap
     */
    public push(val: T): void
    {
        // Push the new value onto the end of the array.  It will become the new
        // rightmost leaf.
        this._store.push(val);
        this.float(this._store.length - 1);
    }


    /**
     * Gets the greatest item from this heap (without removing it)
     * @return The item with the greatest value (as determined by compareFunc)
     */
    public peek(): T | undefined
    {
        if (this._store.length === 0)
        {
            return undefined;
        }

        return this._store[1];
    }


    /**
     * Gets the greatest item from this heap
     * @return The item with the greatest value (as determined by compareFunc)
     */
    public pop(): T | undefined
    {
        // The length of the backing store upon start.
        const origStoreLength = this._store.length;

        if (origStoreLength <= 1)
        {
            // Only the unused item at index 0 exists. This heap is empty.
            return undefined;
        }

        // Store a copy of the root value.
        const retVal: T = this._store[1]!;

        // Move the last leaf up to the root.
        this._store[1] = this._store[origStoreLength - 1];
        this._store.length = origStoreLength - 1;

        // If this heap is not empty, sink the root item to its proper location.
        if (this._store.length > 1)
        {
            this.sink(1);
        }

        return retVal;
    }


    ////////////////////////////////////////////////////////////////////////////
    // Helper Methods
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Iteratively compares the value at the specified index with its parent and
     * swaps them if the child value is greater.
     * @param index - The index of the item to float.
     */
    private float(index: number): void
    {
        if (!this.isRoot(index))
        {
            const parentIndex = this.parentIndex(index)!;
            if (this.compare(parentIndex, index) === CompareResult.LESS)
            {
                this.swap(parentIndex, index);
                this.float(parentIndex);
            }
        }
    }


    /**
     * Iteratively compares the value at the specified index with its *largest
     * child* and swaps them if the child value is greater.
     * @param index - The index of the item to sink
     */
    private sink(index: number): void
    {
        const leftChildIndex = this.leftChild(index);
        if (leftChildIndex === undefined)
        {
            // There are no children.  We are done.
            return;
        }

        // Compare against the greater of the value's children.
        let childIndexToCompareTo: number;

        const rightChildIndex = this.rightChild(index);
        if (rightChildIndex === undefined)
        {
            // There is only a left child.  Compare with it.
            childIndexToCompareTo = leftChildIndex;
        }
        else
        {
            const childCompareResult = this.compare(leftChildIndex, rightChildIndex);
            if (childCompareResult === CompareResult.LESS)
            {
                // The left child is less, so compare against the right child.
                childIndexToCompareTo = rightChildIndex;
            }
            else
            {
                // The left child is equal or greater than the right child.
                childIndexToCompareTo = leftChildIndex;
            }
        }

        if (this.compare(index, childIndexToCompareTo) === CompareResult.LESS)
        {
            this.swap(index, childIndexToCompareTo);
            this.sink(childIndexToCompareTo);
        }
    }


    /**
     * Determines whether the specified index is the root of this heap's tree.
     * @param index - The index of the item to check
     * @return true if the specified index is the root of this heap; false
     * otherwise.
     */
    private isRoot(index: number): boolean
    {
        if (!this.isValidIndex(index))
        {
            throw new Error("Invalid index passed to isRoot().");
        }
        return index === 1;
    }


    /**
     * Compares the items at the specified indices
     * @param indexA - Index of the left side argument
     * @param indexB - Index of the right sided argument
     * @return The result of comparing the specified items
     */
    private compare(indexA: number, indexB: number): CompareResult
    {
        if (!this.isValidIndex(indexA) ||
            !this.isValidIndex(indexB))
        {
            throw new Error("Invalid index passed to compare().");
        }

        return this._compareFunc(this._store[indexA]!, this._store[indexB]!);
    }


    /**
     * Swaps the items at the specified indices
     * @param indexA - Index of an item to swap
     * @param indexB - Index of an item to swap
     */
    private swap(indexA: number, indexB: number): void
    {
        if (!this.isValidIndex(indexA) ||
            !this.isValidIndex(indexB))
        {
            throw new Error("Invalid index passed to swap().");
        }

        const tmp = this._store[indexA];
        this._store[indexA] = this._store[indexB];
        this._store[indexB] = tmp;
    }


    /**
     * Determines whether index is a valid index for this heap
     * @param index - The index to check
     * @return true if index is valid; false otherwise
     */
    private isValidIndex(index: number): boolean
    {
        if (index === 0)
        {
            return false;
        }

        const endIndex = this._store.length;
        return index < endIndex;
    }


    /**
     * Finds the parent of the specified item
     * @param index - Index of the item for which the parent index is to be found
     * @return The parent index.  Undefined if index is the root of this heap
     */
    private parentIndex(index: number): number | undefined
    {
        if (!this.isValidIndex(index))
        {
            throw new Error("Invalid index passed to parentIndex().");
        }
        else if (index === 1)
        {
            // It is the root value.
            return undefined;
        }
        else
        {
            return Math.floor(index / 2);
        }
    }


    /**
     * Finds the left child of the specified item
     * @param index - Index of the item for which the left child index is to be found
     * @return The left child index.  Undefined if index has no left child
     */
    private leftChild(index: number): number | undefined
    {
        if (!this.isValidIndex(index))
        {
            throw new Error("Invalid index passed to leftChild().");
        }
        const leftChildIndex = index * 2;
        return this.isValidIndex(leftChildIndex) ? leftChildIndex : undefined;
    }


    /**
     * Finds the right child of the specified item
     * @param index - Index of the item for which the right child index is to be found
     * @return The right child index.  Undefined if index has no right child
     */
    private rightChild(index: number): number | undefined
    {
        if (!this.isValidIndex(index))
        {
            throw new Error("Invalid index passed to rightChild().");
        }
        const rightChildIndex = index * 2 + 1;
        return this.isValidIndex(rightChildIndex) ? rightChildIndex : undefined;
    }

}
