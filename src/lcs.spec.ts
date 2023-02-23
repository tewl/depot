import {compareStr, compareStrI} from "./compare";
import {createLcsTable, DiffChangeType, Table, DiffItem, getDiff, groupSimilarAdjacentDiffs} from "./lcs";


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
                {optSubproblem: DiffChangeType.Equal, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToY, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToY, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToY, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1}
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.Equal, lcsLength: 2}
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
                {optSubproblem: DiffChangeType.Equal, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToY, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToY, lcsLength: 1},
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.Equal, lcsLength: 2},
                {optSubproblem: DiffChangeType.UniqueToY, lcsLength: 2},
            ],
            [
                {optSubproblem: undefined, lcsLength: 0},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 1},
                {optSubproblem: DiffChangeType.UniqueToX, lcsLength: 2},
                {optSubproblem: DiffChangeType.Equal, lcsLength: 3},
            ]
        ];
        expect(actual).toEqual(expected);
    });


    it("returns a 1 x 1 table when both sequences are empty", () => {
        const actual = createLcsTable([], [], compareStr);
        const expected: Table = [
            [
                {optSubproblem: undefined, lcsLength: 0},
            ]
        ];
        expect(actual).toEqual(expected);
    });

});


describe("getDiff()", () => {

    it("correctly handles unique to x items at the beginning", () => {
        const x = ["1", "2", "a", "b", "c"];
        const y = ["a", "b", "c"];
        const diff = getDiff(x, y, compareStr);
        const expected: Array<DiffItem<string>> = [
            {change: DiffChangeType.UniqueToX, value: "1"},
            {change: DiffChangeType.UniqueToX, value: "2"},
            {change: DiffChangeType.Equal, xValue: "a", yValue: "a"},
            {change: DiffChangeType.Equal, xValue: "b", yValue: "b"},
            {change: DiffChangeType.Equal, xValue: "c", yValue: "c"},
        ];
        expect(diff).toEqual(expected);
    });


    it("correctly handles unique to y items at the beginning", () => {
        const x = ["a", "b", "c"];
        const y = ["1", "2", "a", "b", "c"];
        const diff = getDiff(x, y, compareStr);
        const expected: Array<DiffItem<string>> = [
            {change: DiffChangeType.UniqueToY, value: "1"},
            {change: DiffChangeType.UniqueToY, value: "2"},
            {change: DiffChangeType.Equal, xValue: "a", yValue: "a"},
            {change: DiffChangeType.Equal, xValue: "b", yValue: "b"},
            {change: DiffChangeType.Equal, xValue: "c", yValue: "c"},
        ];
        expect(diff).toEqual(expected);
    });

});
