import {List, Iterator} from "./list";
import {advance, find, distance, partition} from "./algorithm";


describe("advance()", () => {


    it("will properly advance 0 times", () => {
        const list: List<number> = List.fromArray([1, 2, 3, 4, 5, 6, 7, 8]);
        const it: Iterator<number> = list.begin();
        advance(it, 0);

        expect(it.equals(list.begin())).toBeTruthy();
        expect(it.value).toEqual(1);
    });


    it("will properly advance the specified number of times", () => {
        const list: List<number> = List.fromArray([1, 2, 3, 4, 5, 6, 7, 8]);
        const it: Iterator<number> = list.begin();
        advance(it, 4);

        const itExpected: Iterator<number> = list.begin();
        itExpected.next();
        itExpected.next();
        itExpected.next();
        itExpected.next();

        expect(it.equals(itExpected)).toBeTruthy();
        expect(it.value).toEqual(5);
    });


    it("will properly advance and hit the end() element", () => {
        const list: List<number> = List.fromArray([1, 2, 3, 4, 5, 6, 7, 8]);
        const it: Iterator<number> = list.begin();
        advance(it, 10);
        expect(it.equals(list.end())).toBeTruthy();
    });


    it("will properly advance when given a negative offset", () => {
        const list: List<number> = List.fromArray([1, 2, 3, 4, 5, 6, 7, 8]);
        const it: Iterator<number> = list.begin();
        advance(it, 5);
        expect(it.value).toEqual(6);
        advance(it, -4);
        expect(it.value).toEqual(2);
        advance(it, -4);
        expect(it.value).toEqual(1);
    });


});


describe("distance()", () => {


    it("will return 0 when passed equivalent iterators", () => {
        const list: List<number> = List.fromArray([1, 2, 3, 4, 5, 6, 7, 8]);
        const itA: Iterator<number> = list.begin();
        const itB: Iterator<number> = list.begin();

        expect(distance(itA, itB)).toEqual(0);
        expect(distance(itB, itA)).toEqual(0);
    });


    it("can correctly calculate the distance", () => {
        const list: List<number> = List.fromArray([1, 2, 3, 4, 5, 6, 7, 8]);
        const itA: Iterator<number> = list.begin();
        const itB: Iterator<number> = list.begin();
        advance(itB, 5);

        expect(distance(itA, itB)).toEqual(5);
    });


});


describe("find()", () => {


    it("can find an element in a List", () => {
        const list: List<number> = List.fromArray([1, 2, 3, 4, 5, 6, 7, 8]);

        const itFound: Iterator<number> = find(list.begin(), list.end(), 4);
        expect(itFound.value).toEqual(4);

        const itExpected: Iterator<number> = list.begin();
        advance(itExpected, 3);
        expect(itFound.equals(itExpected)).toBeTruthy();
    });


    it("returns the end element when the value is not found", () => {
        const list: List<number> = List.fromArray([1, 2, 3, 4, 5, 6, 7, 8]);

        const itFound = find(list.begin(), list.end(), 100);
        expect(itFound.equals(list.end())).toBeTruthy();
    });

});



describe("partition()", () => {


    it("can partition a range with an even number of elements", () => {
        const list: List<number> = List.fromArray([8, 3, 6, 1, 5, 4, 9, 2, 7]);
        // First element is not included in range to partition.
        const itSecondRange: Iterator<number> = partition(list.begin().offset(1), list.end(), (curElem) => curElem <= 5);

        expect(list.getAt(0)).toEqual(8);
        expect(list.getAt(1)).toEqual(3);
        expect(list.getAt(2)).toEqual(2);
        expect(list.getAt(3)).toEqual(1);
        expect(list.getAt(4)).toEqual(5);
        expect(list.getAt(5)).toEqual(4);
        expect(list.getAt(6)).toEqual(9);
        expect(list.getAt(7)).toEqual(6);
        expect(list.getAt(8)).toEqual(7);
        expect(itSecondRange.equals(list.begin().offset(6))).toBeTruthy();
    });


    it("can partition a range with an odd number of elements", () => {
        const list: List<number> = List.fromArray([8, 3, 10, 6, 1, 5, 4, 9, 2, 7]);
        // First element is not included in range to partition.
        const itSecondRange: Iterator<number> = partition(list.begin().offset(1), list.end(), (curElem) => curElem <= 5);

        expect(list.getAt(0)).toEqual(8);
        expect(list.getAt(1)).toEqual(3);
        expect(list.getAt(2)).toEqual(2);
        expect(list.getAt(3)).toEqual(4);
        expect(list.getAt(4)).toEqual(1);
        expect(list.getAt(5)).toEqual(5);
        expect(list.getAt(6)).toEqual(6);
        expect(list.getAt(7)).toEqual(9);
        expect(list.getAt(8)).toEqual(10);
        expect(list.getAt(9)).toEqual(7);
        expect(itSecondRange.equals(list.begin().offset(6))).toBeTruthy();
    });


});
