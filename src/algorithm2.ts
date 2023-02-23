import * as _ from "lodash";


/**
 * Defines a function type that can take two arguments and decide whether they
 * are similar.
 */
export type BinaryPredicate<T> = (a: T, b: T) => boolean;


/**
 * Takes an input array and groups consecutive similar items together (as
 * determined by _isSimilarFn_).
 *
 * @param items - Items to be grouped
 * @param isSimilarFn - A function that determines whether any two items can be
 * grouped together
 * @return An array of arrays.  Each inner array is a grouping of consecutive
 * items from the source array that are considered similar.  The order of the
 * items is unchanged from the input.
 */
export function groupConsecutiveBy<T>(
    items: readonly T[],
    isSimilarFn: BinaryPredicate<T>
): Array<Array<T>> {

    const groups: Array<Array<T>> = [];
    let prevItem: T | undefined = undefined;

    for (const curItem of items) {

        // If there is a previous item and it is similar to the current item,
        // then add it to the current group.
        if (prevItem !== undefined &&
            isSimilarFn(prevItem, curItem)) {

            const lastGroup = _.last(groups)!;
            lastGroup.push(curItem);
        }
        else {
            // There is either no previous item, or it is not similar.  Either
            // way, start a new group.
            groups.push([curItem]);
        }

        prevItem = curItem;
    }

    return groups;
}
