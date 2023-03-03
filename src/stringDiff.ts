import { compareStr } from "./compare";
import * as lcs from "./lcs";


// TODO: The following function should probably accept a predicate for comparing strings.

// TODO: Make the delimiter a regular expression.
//     - Keep track of each matched delimiter string so it can be reinserted

/**
 * Transforms two input strings into two arrays in which sequences of
 * equal parts are elided (and only include unique parts).
 *
 * @param xStr - The first string to be compared
 * @param yStr - The second string to be compared
 * @param delimiter - The delimiter that is used to separate parts within the
 * string
 * @param elidedVal - String that will replace sequences of equal parts
 * @param initialPartsToKeep - The number of initial parts that will always be
 * present in the output (not elided)
 * @param finalPartsToKeep - The number of final parts that will always be
 * present in the output (not elided)
 * @return A tuple containing the unique parts of each array.  In each,
 * sequences of equal parts are replaced with the specified _elidedVal_.
 */
export function elideEqual(
    xStr: string,
    yStr: string,
    delimiter: string,
    elidedVal: string = "...",
    initialPartsToKeep: number = 0,
    finalPartsToKeep: number = 0
): [Array<string>, Array<string>] {

    initialPartsToKeep = Math.max(0, initialPartsToKeep);
    finalPartsToKeep = Math.max(0, finalPartsToKeep);

    const xParts = xStr.split(delimiter);
    const yParts = yStr.split(delimiter);

    const totalPartsToKeep = initialPartsToKeep + finalPartsToKeep;
    if (xParts.length <= totalPartsToKeep || yParts.length <= totalPartsToKeep) {
        return [xParts, yParts];
    }

    const xBreakdown = getPartBreakdown(xParts, initialPartsToKeep, finalPartsToKeep);
    const yBreakdown = getPartBreakdown(yParts, initialPartsToKeep, finalPartsToKeep);

    // If either string has too few parts, then return the original strings now.
    if (xBreakdown.diffParts.length === 0 || yBreakdown.diffParts.length === 0) {
        return [xParts, yParts];
    }

    const diffItems = lcs.getDiff(xBreakdown.diffParts, yBreakdown.diffParts, (a, b) => compareStr(a, b));
    const [xDiffedParts, yDiffedParts] = lcs.elideEqual(diffItems, elidedVal);
    return [
        [...xBreakdown.initialParts, ...xDiffedParts, ...xBreakdown.finalParts],
        [...yBreakdown.initialParts, ...yDiffedParts, ...yBreakdown.finalParts]
    ];


    function getPartBreakdown(parts: Array<string>, initialPartsToKeep: number, finalPartsToKeep: number) {
        const scratch = [...parts];

        let initialParts: Array<string> = [];
        if (initialPartsToKeep > 0) {
            initialParts = scratch.splice(0, initialPartsToKeep);
        }

        let finalParts: Array<string> = [];
        if (finalPartsToKeep > 0) {
            finalParts = scratch.splice(-1 * finalPartsToKeep, finalPartsToKeep);
        }

        const diffParts = scratch;
        return {
            initialParts,
            diffParts,
            finalParts
        };
    }
}
