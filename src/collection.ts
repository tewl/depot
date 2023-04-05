export interface IFindResult<TCollectionItem, TPredicateReturn> {
    item: TCollectionItem;
    predicateReturn: TPredicateReturn;
}


/**
 * Finds the first item for which the predicate returns a truthy value.
 * @param collection - The collection to iterate over
 * @param predicate - The predicate.  It is recommended that this function
 * return null or undefined when unsuccessful to allow for maximum type checking
 * (this implementation cannot remove false from the returned result's
 * predicateReturn property).
 * @return The item and the predicate return value associated with the first
 * truthy invocation of the predicate. _undefined_ if the predicate returned a
 * falsy value for every item.
 */
export function find<TCollectionItem, TPredicateReturn>(
    collection: Array<TCollectionItem>,
    predicate: (item: TCollectionItem, index: number, collection: Array<TCollectionItem>) => TPredicateReturn
): undefined | IFindResult<TCollectionItem, NonNullable<TPredicateReturn>> {
    let index = 0;
    for (const curItem of collection) {
        const result = predicate(curItem, index, collection);
        if (result) {
            return {item: curItem, predicateReturn: result!};
        }
        else {
            index++;
        }
    }

    // If we made it this far, we did not find an item for which the predicate
    // returned a truthy value.
    return undefined;
}
