import * as _ from "lodash";
import {assertNever} from "./never";
import { CompareFunc, CompareResult } from "./compare";


export enum OptimalSubproblem {
    UniqueToX,   // Up
    UniqueToY,   // Left
    Equal        // Diagonal
}


export interface ISubproblemInfo {
    // The direction to travel to find the subproblem with the greatest LCS.
    // undefined if none exists (i.e. you have reached row 0 or column 0, or
    // both).
    optSubproblem: OptimalSubproblem | undefined;
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
                        optSubproblem: OptimalSubproblem.Equal,
                        lcsLength:     table[tableRow - 1][tableCol - 1]!.lcsLength + 1
                    };
            }
            else if (table[tableRow - 1][tableCol]!.lcsLength >= table[tableRow][tableCol - 1]!.lcsLength ) {
                // The subproblem above has a longer (or equal) LCS, so point at
                // it, and keep the LCS length the same.
                table[tableRow][tableCol] =
                    {
                        optSubproblem: OptimalSubproblem.UniqueToX,
                        lcsLength:     table[tableRow - 1][tableCol]!.lcsLength
                    };
            }
            else {
                // The subproblem to the left has a longer LCS, so point at it,
                // and keep the LCS length the same.
                table[tableRow][tableCol] =
                    {
                        optSubproblem: OptimalSubproblem.UniqueToY,
                        lcsLength:     table[tableRow][tableCol - 1]!.lcsLength
                    };
            }
        }
    }

    return table;
}


export interface IDiffItemUniqueToX<T> {
    change: OptimalSubproblem.UniqueToX;
    value: T;
}

export interface IDiffItemUniqueToY<T> {
    change: OptimalSubproblem.UniqueToY;
    value: T;
}

export interface IDiffItemEqual<T> {
    change: OptimalSubproblem.Equal;
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
            case OptimalSubproblem.UniqueToX:
                diffItems.push({change: OptimalSubproblem.UniqueToX, value: x[row - 1]});
                row--;
                break;

            case OptimalSubproblem.UniqueToY:
                diffItems.push({change: OptimalSubproblem.UniqueToY, value: y[col - 1]});
                col--;
                break;

            case OptimalSubproblem.Equal:
                diffItems.push({change: OptimalSubproblem.Equal, xValue: x[row - 1], yValue: y[col - 1]});
                row--;
                col--;
                break;

            case undefined:
                if (row === 0) {
                    diffItems.push({change: OptimalSubproblem.UniqueToY, value: y[col - 1]});
                    col--;
                }
                else if (col === 0) {
                    diffItems.push({change: OptimalSubproblem.UniqueToX, value: x[row - 1]});
                    row--;
                }
                break;

            default:
                assertNever(change);
        }
    }

    return diffItems.reverse();
}
