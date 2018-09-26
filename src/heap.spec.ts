import {Heap, CompareResult} from "./heap";


// A comparison function that compares numbers.
function compareNumbers(a: number, b: number): CompareResult
{
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


    it("is creatable", () => {
        const heap = new Heap(compareNumbers);
        expect(heap).toBeTruthy();
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


    describe("peak()", () => {


        it("returns undefined when the heap is empty", () => {
            const heap = new Heap(compareNumbers);
            expect(heap.peak()).toEqual(undefined);
        });


        it("returns the greatest item without removing it", () => {
            const heap = new Heap(compareNumbers);
            heap.push(3);
            heap.push(6);
            heap.push(11);
            heap.push(2);
            heap.push(1);
            expect(heap.length).toEqual(5);
            expect(heap.peak()).toEqual(11);
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


});



