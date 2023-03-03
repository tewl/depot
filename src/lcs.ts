import * as _ from "lodash";
import {assertNever} from "./never";
import { CompareFunc, CompareResult } from "./compare";
import { groupConsecutiveBy } from "./arrayHelpers";


export enum DiffChangeType {
    UniqueToX,   // Up (when each item in X is a row in the table)
    UniqueToY,   // Left (when each item in Y is a column in the table)
    Equal        // Diagonal
}


export interface ISubproblemInfo {
    // The direction to travel to find the subproblem with the greatest LCS.
    // undefined if none exists (i.e. you have reached row 0 or column 0, or
    // both).
    optSubproblem: DiffChangeType | undefined;
    // Length of the LCS for the given subproblem.
    lcsLength: number;
}

export type Row = Array<ISubproblemInfo>;

export type Table = Array<Row>;

/**
 * Creates a LCS table where each item in _x_ is represented by a table row and
 * each item in _y_ is represented by a column.  Each cell with coordinate (row,
 * col) contains the longest common subsequence (LCS) for the first row items of
 * _x_ and _col_ items of _y_.
 *
 * @param x - The first sequence, represented by the rows in the returned table
 * @param y - The second sequence, represented by the columns in the returned table
 * @return Description
 */
export function createLcsTable<T>(x: Array<T>, y: Array<T>, compareFn: CompareFunc<T>): Table {

    const xLen = x.length;
    const yLen = y.length;

    const numRows = xLen + 1;
    const numCols = yLen + 1;

    const zeroCell: ISubproblemInfo = {optSubproblem: undefined, lcsLength: 0};

    // Initialize a table with the expected initial row, initial column and (0,
    // 0) cell.
    const table: Table = [];
    for (let row = 0; row < numRows; row++) {
        const newRow: Row = row === 0 ?
                            _.fill(Array(numCols), zeroCell) :
                            [zeroCell];
        table.push(newRow);
    }

    for (let xIndex = 0; xIndex < xLen; xIndex++) {
        const tableRow = xIndex + 1;

        for (let yIndex = 0; yIndex < yLen; yIndex++) {
            const tableCol = yIndex + 1;

            if (compareFn(x[xIndex], y[yIndex]) === CompareResult.EQUAL) {
                // The two sequences have the same value, so point to the
                // subproblem to the upper left and increment the LCS length.
                table[tableRow][tableCol] =
                    {
                        optSubproblem: DiffChangeType.Equal,
                        lcsLength:     table[tableRow - 1][tableCol - 1]!.lcsLength + 1
                    };
            }
            else if (table[tableRow - 1][tableCol]!.lcsLength >= table[tableRow][tableCol - 1]!.lcsLength ) {
                // The subproblem above has a longer (or equal) LCS, so point at
                // it, and keep the LCS length the same.
                table[tableRow][tableCol] =
                    {
                        optSubproblem: DiffChangeType.UniqueToX,
                        lcsLength:     table[tableRow - 1][tableCol]!.lcsLength
                    };
            }
            else {
                // The subproblem to the left has a longer LCS, so point at it,
                // and keep the LCS length the same.
                table[tableRow][tableCol] =
                    {
                        optSubproblem: DiffChangeType.UniqueToY,
                        lcsLength:     table[tableRow][tableCol - 1]!.lcsLength
                    };
            }
        }
    }

    return table;
}


export interface IDiffItemUniqueToX<T> {
    change: DiffChangeType.UniqueToX;
    value: T;
}

export interface IDiffItemUniqueToY<T> {
    change: DiffChangeType.UniqueToY;
    value: T;
}

export interface IDiffItemEqual<T> {
    change: DiffChangeType.Equal;
    // Note:  Even though the x and y values are equal, we keep track of them
    // independently, because they may differ in ways that are ignored by the
    // compare function used (for example, case insensitivity).
    xValue: T;
    yValue: T;
}

export type DiffItem<T> = IDiffItemUniqueToX<T> | IDiffItemUniqueToY<T> | IDiffItemEqual<T>;


/**
 * Compares two sequences and returns the minimal differences.
 *
 * @param x - The first sequence
 * @param y - The second sequence
 * @param compareFn - A function used to compare items in the sequences
 * @return An array of items describing the minimal differences between the two
 */
export function getDiff<T>(x: Array<T>, y: Array<T>, compareFn: CompareFunc<T>): Array<DiffItem<T>> {
    const table = createLcsTable(x, y, compareFn);
    let row = table.length - 1;
    let col = table[0].length - 1;
    const diffItems: Array<DiffItem<T>> = [];

    while (row !== 0 || col !== 0) {

        const change = table[row][col]!.optSubproblem;

        switch (change) {
            case DiffChangeType.UniqueToX:
                diffItems.push({change: DiffChangeType.UniqueToX, value: x[row - 1]});
                row--;
                break;

            case DiffChangeType.UniqueToY:
                diffItems.push({change: DiffChangeType.UniqueToY, value: y[col - 1]});
                col--;
                break;

            case DiffChangeType.Equal:
                diffItems.push({change: DiffChangeType.Equal, xValue: x[row - 1], yValue: y[col - 1]});
                row--;
                col--;
                break;

            case undefined:
                if (row === 0) {
                    diffItems.push({change: DiffChangeType.UniqueToY, value: y[col - 1]});
                    col--;
                }
                else if (col === 0) {
                    diffItems.push({change: DiffChangeType.UniqueToX, value: x[row - 1]});
                    row--;
                }
                break;

            default:
                assertNever(change);
        }
    }

    return diffItems.reverse();
}


interface IAccumulatedParts<T> {
    xParts: Array<T>;
    yParts: Array<T>;
}


/**
 * Accepts the result of a comparison, and returns the values that are unique to
 * the x and y collections while replacing sequences of equal values with the
 * specified value.
 *
 * @param diffItems - The results of comparing the two items
 * @param elidedVal - The value that will replace sequences of equal values
 * @return A tuple containing two arrays. The first array contains the values
 * from the x side of the comparison and the second array contains the values
 * from the y side of the comparison.  In the arrays, sequences of equal values
 * have been replaced with the specified _elidedVal_.
 */
export function elideEqual<T>(
    diffItems: Array<DiffItem<T>>,
    elidedVal: T
): [Array<T>, Array<T>] {

    const groupedDiffItems = groupConsecutiveBy(diffItems, (x, y) => x.change === y.change);

    const resultParts =
        groupedDiffItems.reduce<IAccumulatedParts<T>>(
            (acc, similarDiffItems) => {

                const change = similarDiffItems[0]!.change;

                if (change === DiffChangeType.UniqueToX) {
                    const vals = (similarDiffItems as IDiffItemUniqueToX<T>[]).map((cur) => cur.value);
                    acc.xParts.push(...vals);
                }
                else if (change === DiffChangeType.UniqueToY) {
                    const vals = (similarDiffItems as IDiffItemUniqueToY<T>[]).map((cur) => cur.value);
                    acc.yParts.push(...vals);
                }
                else if (change === DiffChangeType.Equal) {
                    acc.xParts.push(elidedVal);
                    acc.yParts.push(elidedVal);
                }
                else {
                    assertNever(change);
                }
                return acc;
            },
            { xParts: [], yParts: [] }
        );

    return [resultParts.xParts, resultParts.yParts];
}
