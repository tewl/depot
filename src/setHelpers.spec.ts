import { difference, intersection, union } from "./setHelpers";

describe("union()", () =>
{
    it("returns the exepected result", () =>
    {
        const a = new Set([1, 2, 3]);
        const b = new Set([4, 3, 2]);
        expect(union(a, b)).toEqual(new Set([1, 2, 3, 4]));
    });

    it("returns an empty set when given two empty sets", () =>
    {
        expect(union(new Set([]), new Set([]))).toEqual(new Set([]));
    });

});


describe("intersection()", () =>
{
    it("returns the expected result", () =>
    {
        const a = new Set([1, 2, 3]);
        const b = new Set([4, 3, 2]);
        expect(intersection(a, b)).toEqual(new Set([2, 3]));
    });

    it("returns an empty set when there is no intersection", () =>
    {
        const a = new Set([1, 2, 3]);
        const b = new Set([4, 5, 6]);
        expect(intersection(a, b)).toEqual(new Set([]));
    });
});


describe("difference()", () =>
{
    it("returns the expected result", () =>
    {
        const a = new Set([1, 2, 3]);
        const b = new Set([3, 2, 4]);
        expect(difference(a, b)).toEqual(new Set([1]));
    });


    it("returns an empty set when the two sets are equal", () =>
    {
        const a = new Set([1, 2, 3]);
        const b = new Set([1, 3, 2]);
        expect(difference(a, b)).toEqual(new Set([]));
    });

});
