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
                {optSubproblem: OptimalSubproblem.Common, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.YInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.YInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.YInserted, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.Common, lcsLength: 2}
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
                {optSubproblem: OptimalSubproblem.Common, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.YInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.YInserted, lcsLength: 1},
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.Common, lcsLength: 2},
                {optSubproblem: OptimalSubproblem.YInserted, lcsLength: 2},
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 1},
                {optSubproblem: OptimalSubproblem.XInserted, lcsLength: 2},
                {optSubproblem: OptimalSubproblem.Common, lcsLength: 3},
            ]
        ];
        expect(actual).toEqual(expected);
    });

});
