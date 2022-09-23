import {compareStr, compareStrI} from "./compare";
import {createLcsTable, OptimalSubproblem, Table} from "./lcs";


describe("createLcsTable()", () => {


    it("returns the expected table", () => {
        const actual = createLcsTable(["a", "b", "d", "e"], ["a", "b1", "c", "e"], compareStr);
        const expected: Table = [
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: undefined, lcsLength: 0}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.Equal, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToY, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToY, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToY, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.Equal, lcsLength: 2}
            ]
        ];
        expect(actual).toEqual(expected);
    });


    it("uses the specified compareFn to compare items", () => {

        const actual = createLcsTable(["a", "B", "c"], ["A", "b", "C"], compareStrI);
        const expected: Table = [
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: undefined, lcsLength: 0},
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.Equal, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToY, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToY, lcsLength: 1},
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.Equal, lcsLength: 2},
                {optSubproblem: OptimalSubproblem.UniqueToY, lcsLength: 2},
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.UniqueToX, lcsLength: 2},
                {optSubproblem: OptimalSubproblem.Equal, lcsLength: 3},
            ]
        ];
        expect(actual).toEqual(expected);
    });

});
