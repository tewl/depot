import { groupConsecutiveBy } from "./algorithm2";

describe("groupAdjacentBy()", () => {

    const isSimilarEvenOdd = (a: number, b: number) => (a % 2) === (b % 2);


    it("returns the original array when no consecutive items are similar", () => {
        expect(groupConsecutiveBy([0, 1, 2, 3, 4, 5], isSimilarEvenOdd)).toEqual(
            [
                [0],
                [1],
                [2],
                [3],
                [4],
                [5]
            ]
        );
    });


    it("groups similar items at the beginning of the input array", () => {
        expect(groupConsecutiveBy([0, 2, 4, 3, 4, 5], isSimilarEvenOdd)).toEqual(
            [
                [0, 2, 4],
                [3],
                [4],
                [5]
            ]
        );
    });


    it("groups similar items in the middle of the input array", () => {
        expect(groupConsecutiveBy([0, 1, 2, 4, 6, 7, 8], isSimilarEvenOdd)).toEqual(
            [
                [0],
                [1],
                [2, 4, 6],
                [7],
                [8]
            ]
        );
    });


    it("groups similar items at the end of the input array", () => {
        expect(groupConsecutiveBy([0, 1, 2, 3, 4, 6, 24], isSimilarEvenOdd)).toEqual(
            [
                [0],
                [1],
                [2],
                [3],
                [4, 6, 24]
            ]
        );
    });


});
