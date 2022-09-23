import { CompareResult, compareStrI } from "./compare";
import {createLcsTable, OptimalSubproblem, Table} from "./lcs";


fdescribe("createLcsTable()", () => {

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
