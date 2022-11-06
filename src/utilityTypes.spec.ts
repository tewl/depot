import { indexed } from "./utilityTypes";

describe("indexed()", () => {

    it("causes a sequence of items to become an indexed sequence of items", () => {
        const arr = ["fred", "wilma", "betty", "barney"];
        const i = Array.from(indexed(arr));
        expect(i).toEqual([
            {index: 0, item: "fred"},
            {index: 1, item: "wilma"},
            {index: 2, item: "betty"},
            {index: 3, item: "barney"}
        ]);
    });


    it("can be used easily in a for...of loop", () => {
        const arr = ["fred", "wilma", "betty", "barney"];
        for (const cur of indexed(arr)) {
            expect(typeof cur.index === "number").toBeTrue();
            expect(typeof cur.item === "string").toBeTrue();
        }
    });


});
