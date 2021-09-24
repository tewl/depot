/**
 * An interface that describes an item that resides in a larger array. For
 * example, this interface could be used to designate a failure in an array of
 * actions.
 */
export interface IIndexedItem<T>
{
    index: number;
    item:  T;
}
