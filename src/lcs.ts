import * as _ from "lodash";
import { CompareFunc, CompareResult } from "./compare";


export enum OptimalSubproblem {
    XInserted,   // Up
    YInserted,   // Left
    Common       // Diagonal
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
                        optSubproblem: OptimalSubproblem.Common,
                        lcsLength:     table[tableRow - 1][tableCol - 1]!.lcsLength + 1
                    };
            }
            else if (table[tableRow - 1][tableCol]!.lcsLength >= table[tableRow][tableCol - 1]!.lcsLength ) {
                // The subproblem above has a longer (or equal) LCS, so point at
                // it, and keep the LCS length the same.
                table[tableRow][tableCol] =
                    {
                        optSubproblem: OptimalSubproblem.XInserted,
                        lcsLength:     table[tableRow - 1][tableCol]!.lcsLength
                    };
            }
            else {
                // The subproblem to the left has a longer LCS, so point at it,
                // and keep the LCS length the same.
                table[tableRow][tableCol] =
                    {
                        optSubproblem: OptimalSubproblem.YInserted,
                        lcsLength:     table[tableRow][tableCol - 1]!.lcsLength
                    };
            }
        }
    }

    return table;
}
