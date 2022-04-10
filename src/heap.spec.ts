import * as _ from "lodash";
import {CompareResult} from "./compare";
import {Heap} from "./heap";
import {randomizedArray} from "./random_data.spec";


// A comparison function that compares numbers.
function compareNumbers(a: number, b: number): CompareResult {
    if (a < b) {
        return CompareResult.LESS;
    }
    else if (a === b) {
        return CompareResult.EQUAL;
    }
    else {
        return CompareResult.GREATER;
    }
}


describe("Heap", () => {

    describe("constructor()", () => {
        it("creates an empty heap when no values are specified", () => {
            const heap = new Heap(compareNumbers);
            expect(heap).toBeDefined();
        });


        it("creates a heap with the specified values", () => {
            const heap = new Heap(
                compareNumbers,
                [4, 1, 3, 2, 16, 9, 10, 14, 8, 7]
            );

            expect(heap.length).toEqual(10);
        });


        it("orders inital values to preserve heap characteristics", () => {
            const heap = new Heap(
                compareNumbers,
                [4, 1, 3, 2, 16, 9, 10, 14, 8, 7]
            );

            expect(heap.pop()).toEqual(16);
            expect(heap.pop()).toEqual(14);
            expect(heap.pop()).toEqual(10);
            expect(heap.pop()).toEqual(9);
            expect(heap.pop()).toEqual(8);
            expect(heap.pop()).toEqual(7);
            expect(heap.pop()).toEqual(4);
            expect(heap.pop()).toEqual(3);
            expect(heap.pop()).toEqual(2);
            expect(heap.pop()).toEqual(1);
        });
    });


    describe("length", () => {

        it("is 0 after construction", () => {
            const heap = new Heap(compareNumbers);
            expect(heap.length).toEqual(0);
        });


        it("increments when items are added", () => {
            const heap = new Heap(compareNumbers);
            expect(heap.length).toEqual(0);
            heap.push(6);
            expect(heap.length).toEqual(1);
            heap.push(8);
            expect(heap.length).toEqual(2);
        });


    });


    describe("depth", () => {

        it("is 0 after construction", () => {
            const heap = new Heap(compareNumbers);
            expect(heap.depth).toEqual(0);
        });


        it("increases appropriately as items are added", () => {
            const heap = new Heap(compareNumbers);
            expect(heap.depth).toEqual(0);

            heap.push(1);
            expect(heap.depth).toEqual(1);

            heap.push(2);
            expect(heap.depth).toEqual(2);

            heap.push(3);
            expect(heap.depth).toEqual(2);

            heap.push(4);
            expect(heap.depth).toEqual(3);

            heap.push(5);
            expect(heap.depth).toEqual(3);

            heap.push(6);
            expect(heap.depth).toEqual(3);

            heap.push(7);
            expect(heap.depth).toEqual(3);

            heap.push(8);
            expect(heap.depth).toEqual(4);

        });

    });


    describe("peek()", () => {

        it("returns undefined when the heap is empty", () => {
            const heap = new Heap(compareNumbers);
            expect(heap.peek()).toEqual(undefined);
        });


        it("returns the greatest item without removing it", () => {
            const heap = new Heap(compareNumbers);
            heap.push(3);
            heap.push(6);
            heap.push(11);
            heap.push(2);
            heap.push(1);
            expect(heap.length).toEqual(5);
            expect(heap.peek()).toEqual(11);
            expect(heap.length).toEqual(5);
        });


    });


    describe("pop()", () => {

        it("returns undefined when the heap is empty", () => {
            const heap = new Heap(compareNumbers);
            expect(heap.pop()).toEqual(undefined);
        });


        it("pops items in the expected order", () => {
            const heap = new Heap(compareNumbers);

            heap.push(1);
            heap.push(1);
            heap.push(2);
            heap.push(2);
            heap.push(3);
            heap.push(3);
            heap.push(4);
            heap.push(4);
            heap.push(5);
            heap.push(5);
            heap.push(6);
            heap.push(6);
            heap.push(7);
            heap.push(7);
            heap.push(8);
            heap.push(8);
            heap.push(9);
            heap.push(9);
            heap.push(10);
            heap.push(10);

            expect(heap.pop()).toEqual(10);
            expect(heap.pop()).toEqual(10);
            expect(heap.pop()).toEqual(9);
            expect(heap.pop()).toEqual(9);
            expect(heap.pop()).toEqual(8);
            expect(heap.pop()).toEqual(8);
            expect(heap.pop()).toEqual(7);
            expect(heap.pop()).toEqual(7);
            expect(heap.pop()).toEqual(6);
            expect(heap.pop()).toEqual(6);
            expect(heap.pop()).toEqual(5);
            expect(heap.pop()).toEqual(5);
            expect(heap.pop()).toEqual(4);
            expect(heap.pop()).toEqual(4);
            expect(heap.pop()).toEqual(3);
            expect(heap.pop()).toEqual(3);
            expect(heap.pop()).toEqual(2);
            expect(heap.pop()).toEqual(2);
            expect(heap.pop()).toEqual(1);
            expect(heap.pop()).toEqual(1);
            expect(heap.length).toEqual(0);
        });


    });


    describe("isEmpty", () => {

        it("returns true when the heap is empty", () => {
            const heap = new Heap(compareNumbers);
            expect(heap.isEmpty).toEqual(true);
        });


        it("returns false when the heap has items", () => {
            const heap = new Heap(compareNumbers);
            heap.push(5);
            expect(heap.isEmpty).toEqual(false);
        });


    });


    it("can sort a very large array", () => {
        const heap = new Heap(compareNumbers);

        _.forEach(randomizedArray, (curValue) => {
            heap.push(curValue);
        });

        expect(heap.length).toEqual(1000);

        for (let curIndex = 0; curIndex < 1000; ++curIndex) {
            expect(heap.pop()).toEqual(999 - curIndex);
        }

        //
        // Some other ways to sort to see comparative performance.
        //

        // let arr = randomizedArray.slice();
        // console.time("native array sort");
        // arr.sort();
        // console.timeEnd("native array sort");

        // arr = randomizedArray.slice();
        // console.time("lodash array sort");
        // _.sortBy(arr);
        // console.timeEnd("lodash array sort");
    });

});
