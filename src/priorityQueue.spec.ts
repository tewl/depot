import {PriorityQueue} from "./priorityQueue";


describe("PriorityQueue", () => {

    it("can be created", () => {
        const priorityQueue = new PriorityQueue<string>();
        expect(priorityQueue).toBeDefined();
    });


    describe("length", () => {

        it("is 0 after construction", () => {
            const priorityQueue = new PriorityQueue<string>();
            expect(priorityQueue.length).toEqual(0);
        });


        it("increments as items are added", () => {
            const priorityQueue = new PriorityQueue<string>();
            expect(priorityQueue.length).toEqual(0);
            priorityQueue.push("Fred", 6);
            expect(priorityQueue.length).toEqual(1);
            priorityQueue.push("Barney", 5);
            expect(priorityQueue.length).toEqual(2);
        });
    });


    describe("peek()", () => {

        it("returns undefined when emtpty", () => {
            const priorityQueue = new PriorityQueue<string>();
            expect(priorityQueue.length).toEqual(0);
            expect(priorityQueue.peek()).toEqual(undefined);
        });


        it("returns the hightest priority item without removing it", () => {
            const priorityQueue = new PriorityQueue<string>();
            priorityQueue.push("Fred", 6);
            priorityQueue.push("Barney", 4);
            priorityQueue.push("Dino", 2);
            priorityQueue.push("Wilma", 7);
            expect(priorityQueue.length).toEqual(4);
            expect(priorityQueue.peek()).toEqual("Wilma");
            expect(priorityQueue.length).toEqual(4);
        });


    });


    describe("pop()", () => {

        it("returns undefined when emtpty", () => {
            const priorityQueue = new PriorityQueue<string>();
            expect(priorityQueue.length).toEqual(0);
            expect(priorityQueue.pop()).toEqual(undefined);
        });


        it("returns the hightest priority item and removes it", () => {
            const priorityQueue = new PriorityQueue<string>();
            priorityQueue.push("Fred", 6);
            priorityQueue.push("Barney", 4);
            priorityQueue.push("Dino", 2);
            priorityQueue.push("Wilma", 7);
            expect(priorityQueue.length).toEqual(4);
            expect(priorityQueue.pop()).toEqual("Wilma");
            expect(priorityQueue.length).toEqual(3);
            expect(priorityQueue.pop()).toEqual("Fred");
            expect(priorityQueue.length).toEqual(2);
            expect(priorityQueue.pop()).toEqual("Barney");
            expect(priorityQueue.length).toEqual(1);
            expect(priorityQueue.pop()).toEqual("Dino");
            expect(priorityQueue.length).toEqual(0);
        });


    });


    describe("isEmtpy", () => {

        it("returns true when empty", () => {
            const priorityQueue = new PriorityQueue<string>();
            expect(priorityQueue.isEmpty).toEqual(true);
        });


        it("returns false when it has items", () => {
            const priorityQueue = new PriorityQueue<string>();
            expect(priorityQueue.isEmpty).toEqual(true);
            priorityQueue.push("Fred", 6);
            expect(priorityQueue.isEmpty).toEqual(false);
        });
    });



});
