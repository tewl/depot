import {anyMatchRegex, insertIf} from "./arrayHelpers";

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
