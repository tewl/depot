import {anyMatchRegex, insertIf, permutations} from "./arrayHelpers";

describe("anyMatchRegex()", () => {


    it("will return the a truthy match object when there is a match", () => {
        const strings = ["abc", "a-b-c"];
        const match = anyMatchRegex(strings, /a.b.c/);
        expect(match).toBeTruthy();
        expect(match![0]).toEqual("a-b-c");

    });


    it("will return undefined when there is no match", () => {
        const strings = ["abc", "a-b-c"];
        const match = anyMatchRegex(strings, /a_b_c/);
        expect(match).toEqual(undefined);
    });


});


describe("insertIf", () => {

    it("returns an empty array when the condition is false", () => {
        expect(insertIf(false, 1, 2, 3)).toEqual([]);
    });


    it("returns an empty containing the items when the condition is true", () => {
        expect(insertIf(true, 1, 2, 3)).toEqual([1, 2, 3]);
    });

});


describe("permutations()", () => {


    it("returns expected results for a zero length array", () => {
        expect(permutations([])).toEqual([]);
    });


    it("returns expected results for a 1-element array", () => {
        expect(permutations([1])).toEqual([[1]]);
    });


    it("returns expected results for a 2-element array", () => {
        const perms = permutations([1, 2]);
        expect(perms).toEqual([[1, 2], [2, 1]]);
    });


    it("returns expected results for a 3-element array", () => {
        expect(permutations([1, 2, 3])).toEqual([
                                                    [1, 2, 3],
                                                    [1, 3, 2],
                                                    [2, 1, 3],
                                                    [2, 3, 1],
                                                    [3, 1, 2],
                                                    [3, 2, 1]
                                                ]);
    });

    it("returns expected results for a 4-element array", () => {
        expect(permutations([1, 2, 3, 4])).toEqual([
                                                       [1, 2, 3, 4],
                                                       [1, 2, 4, 3],
                                                       [1, 3, 2, 4],
                                                       [1, 3, 4, 2],
                                                       [1, 4, 2, 3],
                                                       [1, 4, 3, 2],

                                                       [2, 1, 3, 4],
                                                       [2, 1, 4, 3],
                                                       [2, 3, 1, 4],
                                                       [2, 3, 4, 1],
                                                       [2, 4, 1, 3],
                                                       [2, 4, 3, 1],

                                                       [3, 1, 2, 4],
                                                       [3, 1, 4, 2],
                                                       [3, 2, 1, 4],
                                                       [3, 2, 4, 1],
                                                       [3, 4, 1, 2],
                                                       [3, 4, 2, 1],

                                                       [4, 1, 2, 3],
                                                       [4, 1, 3, 2],
                                                       [4, 2, 1, 3],
                                                       [4, 2, 3, 1],
                                                       [4, 3, 1, 2],
                                                       [4, 3, 2, 1]
                                                ]);
    });


});
