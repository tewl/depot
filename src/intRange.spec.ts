import { IntRange } from "./intRange";

describe("IntRange", () => {

    it("generates the expected range of integers", () => {
        expect(Array.from(new IntRange(0, 3))).toEqual([0, 1, 2]);
    });


    it("supports concurrent iteration", () => {
        const range = new IntRange(1, 11);

        const iter1 = range[Symbol.iterator]();

        expect(iter1.next().value).toEqual(1);
        expect(iter1.next().value).toEqual(2);
        expect(iter1.next().value).toEqual(3);

        const iter2 = range[Symbol.iterator]();

        expect(iter2.next().value).toEqual(1);
        expect(iter1.next().value).toEqual(4);
        expect(iter2.next().value).toEqual(2);
        expect(iter1.next().value).toEqual(5);
    });

});
