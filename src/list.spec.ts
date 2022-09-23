import {List, Iterator} from "./list";
import {randomizedArray} from "./random_data.spec";


describe("List", () => {

    describe("static", () => {

        it("fromArray() can be used to populate a list", () => {
            const list = List.fromArray([1, 2, 3]);

            expect(list.getAt(0)).toEqual(1);
            expect(list.getAt(1)).toEqual(2);
            expect(list.getAt(2)).toEqual(3);
        });

    });


    it("can be constructed", () => {
        const list = new List<number>();
        expect(list).toBeDefined();
    });


    it("initially length should be 0", () => {
        const list = new List<number>();
        expect(list.length).toEqual(0);
    });


    it("isEmpty() should return true for an empty list", () => {
        const list = new List<number>();
        expect(list.length).toEqual(0);
        expect(list.isEmpty).toEqual(true);
    });


    it("isEmpty() should return false for a non-empty list", () => {
        const list = new List<number>();
        list.push(1);
        expect(list.length).toEqual(1);
        expect(list.isEmpty).toEqual(false);
    });


    it("begin(), end() and value() can be used to iterate values in a List", () => {
        const list = new List<number>();
        list.push(1);
        list.push(2);
        list.push(3);

        let expected = 1;

        for (const it = list.begin(); !it.equals(list.end()); it.next()) {
            expect(it.value).toEqual(expected);
            ++expected;
        }
    });


    it("push() should add an item to the end of the list", () => {
        const list: List<number> = new List<number>();
        list.push(1);
        expect(list.length).toEqual(1);
        expect(list.getAt(0)).toEqual(1);

        // Should allow chaining.
        list.push(2).push(3);
        expect(list.length).toEqual(3);
        expect(list.getAt(1)).toEqual(2);
        expect(list.getAt(2)).toEqual(3);
    });


    it("pop() should remove an item from the end of the list", () => {
        const list: List<number> = new List<number>();
        list.push(1).push(2).push(3);
        expect(list.length).toEqual(3);

        expect(list.pop()).toEqual(3);
        expect(list.length).toEqual(2);
        expect(list.pop()).toEqual(2);
        expect(list.length).toEqual(1);
        expect(list.pop()).toEqual(1);
        expect(list.length).toEqual(0);
    });


    it("pop() will throw when the list is empty", () => {
        const list = new List<number>();
        expect(list.length).toEqual(0);
        expect(() => {
            list.pop();
        }).toThrowError("Attempted to pop() an empty List.");
        expect(list.length).toEqual(0);
    });


    it("getAt() should return the value at the specified index", () => {
        const list: List<number> = new List<number>();
        list.push(1).push(2).push(3);

        expect(list.getAt(0)).toEqual(1);
        expect(list.getAt(1)).toEqual(2);
        expect(list.getAt(2)).toEqual(3);
    });


    it("getAt() should throw if the index specified is too low", () => {
        const list = new List<number>();
        list.push(1).push(2).push(3);

        expect(() => {
            list.getAt(-1);
        }).toThrowError("Index cannot be negative.");
    });


    it("getAt() should throw if the index specified is too high", () => {
        const list = new List<number>();
        list.push(1).push(2).push(3);

        expect(() => {
            list.getAt(3);
        }).toThrowError("Index out of range.");

        expect(() => {
            list.getAt(5);
        }).toThrowError("Index out of range.");
    });


    it("iterator protocol allows Array.from to work", () => {
        const list = List.fromArray([1, 2, 3]);
        const arr = Array.from(list);

        expect(arr).toEqual([1, 2, 3]);
    });


    describe("splice()", () => {

        it("will do nothing when the delete count is zero and no items to insert are specified", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            const deleted = list.splice(list.begin().offset(1), 0);
            expect(Array.from(list)).toEqual([1, 2, 3, 4, 5]);
            expect(deleted.length).toEqual(0);
        });


        it("can remove the specified number of items from the beginning of the list", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            const deleted = list.splice(list.begin(), 2);
            expect(Array.from(list)).toEqual([3, 4, 5]);
            expect(deleted).toEqual([1, 2]);
        });


        it("can remove the specified number of items in the middle of the list", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            const deleted = list.splice(list.begin().offset(1), 3);
            expect(Array.from(list)).toEqual([1, 5]);
            expect(deleted).toEqual([2, 3, 4]);
        });


        it("will only remove items to the end when the delete count is too high", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            const deleted = list.splice(list.begin().offset(3), 3);
            expect(Array.from(list)).toEqual([1, 2, 3]);
            expect(deleted).toEqual([4, 5]);
        });


        it("will not delete any items when the end node is specified", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            const deleted = list.splice(list.end(), 3);
            expect(Array.from(list)).toEqual([1, 2, 3, 4, 5]);
            expect(deleted.length).toEqual(0);
        });


        it("can insert the specified items at the beginning of the list", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            const deleted = list.splice(list.begin(), 0, 0.1, 0.2, 0.3);
            expect(Array.from(list)).toEqual([0.1, 0.2, 0.3, 1, 2, 3, 4, 5]);
            expect(deleted.length).toEqual(0);
        });


        it("can insert the specified items in the middle of the list", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            const deleted = list.splice(list.begin().offset(2), 0, 2.1, 2.2, 2.3);
            expect(Array.from(list)).toEqual([1, 2, 2.1, 2.2, 2.3, 3, 4, 5]);
            expect(deleted.length).toEqual(0);
        });


        it("can insert the specified items at the end of the list", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            const deleted = list.splice(list.end(), 0, 5.1, 5.2, 5.3);
            expect(Array.from(list)).toEqual([1, 2, 3, 4, 5, 5.1, 5.2, 5.3]);
            expect(deleted.length).toEqual(0);
        });


        it("can remove and insert items at the beginning of the list", () => {
            const list = List.fromArray(["xxx", "xxx", "xxx", "3", "4", "5"]);
            const deleted = list.splice(list.begin(), 3, "1", "2");
            expect(Array.from(list)).toEqual(["1", "2", "3", "4", "5"]);
            expect(deleted).toEqual(["xxx", "xxx", "xxx"]);
        });


        it("can remove and insert items in the middle of the list", () => {
            const list = List.fromArray(["1", "xxx", "xxx", "xxx", "5"]);
            const deleted = list.splice(list.begin().offset(1), 3, "2", "3", "4");
            expect(Array.from(list)).toEqual(["1", "2", "3", "4", "5"]);
            expect(deleted).toEqual(["xxx", "xxx", "xxx"]);
        });


        it("can remove and insert items at the end of the list", () => {
            const list = List.fromArray(["1", "2", "xxx", "xxx", "xxx"]);
            const deleted = list.splice(list.begin().offset(2), 3, "3", "4", "5");
            expect(Array.from(list)).toEqual(["1", "2", "3", "4", "5"]);
            expect(deleted).toEqual(["xxx", "xxx", "xxx"]);
        });

    });


    describe("quicksort()", () => {

        it("can sort a List of numbers", () => {
            const list: List<number> = List.fromArray([8, 3, 6, 1, 5, 4, 9, 2, 7]);
            list.quicksort();

            expect(list.length).toEqual(9);

            expect(list.getAt(0)).toEqual(1);
            expect(list.getAt(1)).toEqual(2);
            expect(list.getAt(2)).toEqual(3);
            expect(list.getAt(3)).toEqual(4);
            expect(list.getAt(4)).toEqual(5);
            expect(list.getAt(5)).toEqual(6);
            expect(list.getAt(6)).toEqual(7);
            expect(list.getAt(7)).toEqual(8);
            expect(list.getAt(8)).toEqual(9);
        });


        it("can sort a very large List", () => {
            const list = List.fromArray(randomizedArray);
            list.quicksort();

            expect(list.length).toEqual(1000);

            for (let i = 0; i < 1000; ++i) {
                expect(list.getAt(i)).toEqual(i);
            }
        });


    });


    it("can survive being emptied and then repopulated", () => {
        const list = List.fromArray([1, 2]);
        list.pop();
        list.pop();
        expect(list.length).toEqual(0);

        list.splice(list.end(), 0, 1, 2, 3);
        expect(list.length).toEqual(3);

        const it = list.begin();
        expect(it.value).toEqual(1);
        it.next();
        expect(it.value).toEqual(2);
        it.next();
        expect(it.value).toEqual(3);
        it.next();
        expect(it.equals(list.end())).toBeTruthy();
    });


    describe("Iterator", () => {

        it("can traverse a 0-length list", () => {
            const list = new List<number>();
            const it = list.begin();
            expect(it.next().done).toBeTruthy();
        });


        it("is equal to another iterator that is pointing at the same node", () => {
            const list = new List<number>();
            list.push(1);
            expect(list.length).toEqual(1);

            const it1 = list.begin();
            const it2 = list.begin();

            expect(it1.equals(it2)).toBeTruthy();
        });


        it("is not euqal to another iterator pointing at a different node", () => {
            const list = new List<number>();
            list.push(1);
            expect(list.length).toEqual(1);

            const it1 = list.begin();
            const it2 = list.end();

            expect(it1.equals(it2)).toBeFalsy();
        });


        it("offset(0) will create an equal but independent Iterator", () => {
            const list = List.fromArray([1, 2, 3]);
            const itA = list.begin();
            const itB = itA.offset(0);

            // The clone is equivalent.
            expect(itA.equals(itB)).toBeTruthy();
            expect(itA.value).toEqual(itB.value);

            // Advancing the clone will not advance the original, proving they are independent.
            itB.next();
            expect(itA.equals(itB)).toBeFalsy();
            expect(itA.value).not.toEqual(itB.value);
        });


        it("offset() will create an appropriate Iterator when given positive offsets", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            let it = list.begin().offset(1);
            expect(it.value).toEqual(2);

            it = list.begin().offset(4);
            expect(it.value).toEqual(5);

            it = list.begin().offset(5);
            expect(it.equals(list.end())).toBeTruthy();

            it = list.begin().offset(7);
            expect(it.equals(list.end())).toBeTruthy();
        });


        it("offset() will create an appropriate Iterator when given negative offsets", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);

            let it = list.end().offset(0);
            expect(it.equals(list.end())).toBeTruthy();

            it = list.end().offset(-1);
            expect(it.value).toEqual(5);

            it = list.end().offset(-4);
            expect(it.value).toEqual(2);

            it = list.end().offset(-5);
            expect(it.value).toEqual(1);

            it = list.end().offset(-6);
            expect(it.value).toEqual(1);

            it = list.end().offset(-7);
            expect(it.value).toEqual(1);
        });


        it("can traverse a 1-element list", () => {
            const list = new List<number>();
            list.push(1);
            expect(list.length).toEqual(1);

            const it = list.begin();

            let res = it.next();
            expect(res.done).toEqual(false);
            if (!res.done) {
                expect(res.value).toEqual(1);
            }

            res = it.next();
            expect(res.done).toEqual(true);
        });


        it("can traverse a 3-element list", () => {
            const list = new List<number>();
            list.push(1);
            list.push(2);
            list.push(3);
            expect(list.length).toEqual(3);

            const it: Iterator<number> = list.begin();

            let res = it.next();
            expect(res.done).toEqual(false);
            if (!res.done) {
                expect(res.value).toEqual(1);
            }

            res = it.next();
            expect(res.done).toEqual(false);
            if (!res.done) {
                expect(res.value).toEqual(2);
            }

            res = it.next();
            expect(res.done).toEqual(false);
            if (!res.done) {
                expect(res.value).toEqual(3);
            }

            res = it.next();
            expect(res.done).toEqual(true);
        });


        it("can move to previous element", () => {
            const list = List.fromArray([1, 2, 3, 4, 5]);
            let it = list.begin();

            it.prev();
            expect(list.begin().equals(it)).toBeTruthy();  // Will to move in front of the beginning node.

            it = list.end();
            expect(() => {
                it.value;   // eslint-disable-line @typescript-eslint/no-unused-expressions
            }).toThrowError("Attempted to get value from an iterator at end().");

            it.prev();
            expect(it.value).toEqual(5);
            it.prev();
            expect(it.value).toEqual(4);
            it.prev();
            expect(it.value).toEqual(3);
            it.prev();
            expect(it.value).toEqual(2);
            it.prev();
            expect(it.value).toEqual(1);
            it.prev();
            expect(it.value).toEqual(1);
        });


    });


});
