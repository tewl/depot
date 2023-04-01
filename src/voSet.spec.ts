import { VoSet } from "./voSet";
import { IHashable } from "./hashable";
import { hash } from "./stringHelpers";


class Person implements IHashable {
    public constructor(
        public readonly first: string,
        public readonly last: string,
        public readonly age: number
    ) {
    }

    public getHash(): string {
        // Two Person instances are equal if their first and last names are
        // equal.
        const intrinsics = { first: this.first, last: this.last };
        return hash(JSON.stringify(intrinsics), "sha256", "base64");
    }
}


const fred1 = new Person("Fred", "Flintstone", 40);
const fred2 = new Person("Fred", "Flintstone", 50);
const wilma1 = new Person("Wilma", "Flintstone", 40);
const wilma2 = new Person("Wilma", "Flintstone", 50);
const barney1 = new Person("Barney", "Rubble", 40);
const barney2 = new Person("Barney", "Rubble", 50);
const betty1 = new Person("Betty", "Rubble", 40);
const betty2 = new Person("Betty", "Rubble", 50);


describe("VoSet", () => {

    describe("constructor", () => {

        it("creates an empty set when no values are specified", () => {
            const set = new VoSet();
            expect(set.size).toEqual(0);
        });


        it("creates a populated set when an iterable is specified", () => {
            const set = new VoSet([fred1, wilma1, barney1, betty1]);
            expect(set.size).toEqual(4);
        });

    });


    describe("instance", () => {


        describe("add()", () => {

            it("adds the item when an equal item does not exist in the set", () => {
                const set = new VoSet<Person>();
                expect(set.size).toEqual(0);
                set.add(fred1);
                expect(set.size).toEqual(1);
            });


            it("overwrites when an equal item exists in the set", () => {
                const set = new VoSet();
                expect(set.size).toEqual(0);

                set.add(fred1);
                expect(set.size).toEqual(1);

                // This new item should overwrite the previous one.
                set.add(fred2);
                expect(set.size).toEqual(1);
            });

        });


        describe("clear()", () => {

            it("does nothing when the collection is empty", () => {
                const set = new VoSet();
                expect(set.size).toEqual(0);

                set.clear();
                expect(set.size).toEqual(0);

                set.clear();
                expect(set.size).toEqual(0);
            });


            it("removes all items from the collection", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(set.size).toEqual(4);

                set.clear();
                expect(set.size).toEqual(0);
            });

        });


        describe("delete()", () => {

            it("returns true when an existing item in the set was deleted using the same instance", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(set.size).toEqual(4);

                expect(set.delete(fred1)).toBeTrue();
                expect(set.size).toEqual(3);
            });


            it("returns true when an existing item in the set was deleted using a different instance", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(set.size).toEqual(4);

                expect(set.delete(fred2)).toBeTrue();
                expect(set.size).toEqual(3);
            });


            it("returns false when the specified item does not exist in the set", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(set.size).toEqual(4);

                const slate = new Person("Mr.", "Slate", 70);
                expect(set.delete(slate)).toBeFalse();
                expect(set.size).toEqual(4);
            });

        });


        describe("has()", () => {

            it("returns true when called with the same instance used when adding", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(set.size).toEqual(4);

                expect(set.has(fred1)).toBeTrue();
            });


            it("returns true when called with a different instance as used when adding", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(set.size).toEqual(4);

                expect(set.has(fred2)).toBeTrue();
            });


            it("returns false when no equal item exists in the set", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(set.size).toEqual(4);

                const slate = new Person("Mr.", "Slate", 70);
                expect(set.has(slate)).toBeFalse();
            });

        });


        describe("get()", () => {

            it("returns a failed result when an equal item is not in the set", () => {
                const set = new VoSet([fred1, wilma1]);
                expect(set.get(betty1).failed).toBeTrue();
            });


            it("returns the expected item when getting using the same instance used when added", () => {
                const set = new VoSet([fred1, wilma1]);
                const retrievedRes = set.get(fred1);
                expect(retrievedRes.succeeded).toBeTrue();
                expect(retrievedRes.value!.first).toEqual("Fred");
                expect(retrievedRes.value!.last).toEqual("Flintstone");
                expect(retrievedRes.value!.age).toEqual(40);
            });


            it("returns the expected item when getting using an equal instance", () => {
                const set = new VoSet([fred1, wilma1]);
                const retrievedRes = set.get(fred2);
                expect(retrievedRes.succeeded).toBeTrue();
                expect(retrievedRes.value!.first).toEqual("Fred");
                expect(retrievedRes.value!.last).toEqual("Flintstone");
                expect(retrievedRes.value!.age).toEqual(40);
            });

        });


        describe("size", () => {

            it("has expected value while mutating the collection", () => {
                const set = new VoSet();
                expect(set.size).toEqual(0);
                set.add(fred1);
                expect(set.size).toEqual(1);
                set.add(wilma1);
                expect(set.size).toEqual(2);
                set.add(barney1);
                expect(set.size).toEqual(3);
                set.add(betty1);
                expect(set.size).toEqual(4);

                set.delete(fred2);
                expect(set.size).toEqual(3);
                set.delete(barney2);
                expect(set.size).toEqual(2);
                set.delete(betty2);
                expect(set.size).toEqual(1);
                set.delete(wilma2);
                expect(set.size).toEqual(0);
            });

        });


        describe("iterator", () => {

            it("iterates over the items in the expected order", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(Array.from(set)).toEqual([fred1, wilma1, barney1, betty1]);
            });


            it("supports concurrent iteration", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);

                const iter1 = set[Symbol.iterator]();

                expect(iter1.next().value).toEqual(fred1);
                expect(iter1.next().value).toEqual(wilma1);

                const iter2 = set[Symbol.iterator]();

                expect(iter2.next().value).toEqual(fred1);
                expect(iter1.next().value).toEqual(barney1);
                expect(iter2.next().value).toEqual(wilma1);
                expect(iter1.next().value).toEqual(betty1);
                expect(iter2.next().value).toEqual(barney1);
                expect(iter2.next().value).toEqual(betty1);
            });


            it("makes the set an Iterable that can be used in a for...of loop", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);

                let loopInvocations = 0;
                for (const val of set) {

                    if (loopInvocations === 0) {
                        expect(val).toEqual(fred1);
                    }

                    if (loopInvocations === 1) {
                        expect(val).toEqual(wilma1);
                    }

                    if (loopInvocations === 2) {
                        expect(val).toEqual(barney1);
                    }

                    if (loopInvocations === 3) {
                        expect(val).toEqual(betty1);
                    }

                    loopInvocations++;
                }
                expect(loopInvocations).toEqual(4);
            });

        });


        describe("entries()", () => {

            it("iterates over the items in the expected order", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(Array.from(set.entries())).toEqual([
                    [fred1, fred1], [wilma1, wilma1], [barney1, barney1], [betty1, betty1]
                ]);
            });


            it("supports concurrent iteration", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);

                const iter1 = set.entries();

                expect(iter1.next().value).toEqual([fred1, fred1]);
                expect(iter1.next().value).toEqual([wilma1, wilma1]);

                const iter2 = set.entries();

                expect(iter2.next().value).toEqual([fred1, fred1]);
                expect(iter1.next().value).toEqual([barney1, barney1]);
                expect(iter2.next().value).toEqual([wilma1, wilma1]);
                expect(iter1.next().value).toEqual([betty1, betty1]);
                expect(iter2.next().value).toEqual([barney1, barney1]);
                expect(iter2.next().value).toEqual([betty1, betty1]);
            });


            it("is an Iterable and can be used in a for...of loop", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);

                let loopInvocations = 0;
                for (const val of set.entries()) {

                    if (loopInvocations === 0) {
                        expect(val).toEqual([fred1, fred1]);
                    }

                    if (loopInvocations === 1) {
                        expect(val).toEqual([wilma1, wilma1]);
                    }

                    if (loopInvocations === 2) {
                        expect(val).toEqual([barney1, barney1]);
                    }

                    if (loopInvocations === 3) {
                        expect(val).toEqual([betty1, betty1]);
                    }

                    loopInvocations++;
                }
                expect(loopInvocations).toEqual(4);
            });
        });


        describe("keys()", () => {

            it("iterates over the keys in the expected order", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(Array.from(set.keys())).toEqual([
                    fred1, wilma1, barney1, betty1
                ]);
            });


            it("supports concurrent iteration", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);

                const iter1 = set.keys();

                expect(iter1.next().value).toEqual(fred1);
                expect(iter1.next().value).toEqual(wilma1);

                const iter2 = set.keys();

                expect(iter2.next().value).toEqual(fred1);
                expect(iter1.next().value).toEqual(barney1);
                expect(iter2.next().value).toEqual(wilma1);
                expect(iter1.next().value).toEqual(betty1);
                expect(iter2.next().value).toEqual(barney1);
                expect(iter2.next().value).toEqual(betty1);
            });


            it("is an Iterable and can be used in a for...of loop", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);

                let loopInvocations = 0;
                for (const val of set.keys()) {

                    if (loopInvocations === 0) {
                        expect(val).toEqual(fred1);
                    }

                    if (loopInvocations === 1) {
                        expect(val).toEqual(wilma1);
                    }

                    if (loopInvocations === 2) {
                        expect(val).toEqual(barney1);
                    }

                    if (loopInvocations === 3) {
                        expect(val).toEqual(betty1);
                    }

                    loopInvocations++;
                }
                expect(loopInvocations).toEqual(4);
            });
        });


        describe("values()", () => {

            it("iterates over the values in the expected order", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);
                expect(Array.from(set.values())).toEqual([
                    fred1, wilma1, barney1, betty1
                ]);
            });


            it("supports concurrent iteration", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);

                const iter1 = set.values();

                expect(iter1.next().value).toEqual(fred1);
                expect(iter1.next().value).toEqual(wilma1);

                const iter2 = set.values();

                expect(iter2.next().value).toEqual(fred1);
                expect(iter1.next().value).toEqual(barney1);
                expect(iter2.next().value).toEqual(wilma1);
                expect(iter1.next().value).toEqual(betty1);
                expect(iter2.next().value).toEqual(barney1);
                expect(iter2.next().value).toEqual(betty1);
            });


            it("is an Iterable and can be used in a for...of loop", () => {
                const set = new VoSet([fred1, wilma1, barney1, betty1]);

                let loopInvocations = 0;
                for (const val of set.values()) {

                    if (loopInvocations === 0) {
                        expect(val).toEqual(fred1);
                    }

                    if (loopInvocations === 1) {
                        expect(val).toEqual(wilma1);
                    }

                    if (loopInvocations === 2) {
                        expect(val).toEqual(barney1);
                    }

                    if (loopInvocations === 3) {
                        expect(val).toEqual(betty1);
                    }

                    loopInvocations++;
                }
                expect(loopInvocations).toEqual(4);
            });
        });


        describe("forEach()", () => {

            it("invokes the function with the specified arguments in the expected order", () => {
                const theSet = new VoSet<Person>([fred1, wilma1, barney1, betty1]);

                let cbInvocations = 0;

                theSet.forEach((val, key, set) => {

                    if (cbInvocations === 0) {
                        expect(key).toEqual(fred1);
                        expect(val).toEqual(fred1);
                    }

                    if (cbInvocations === 1) {
                        expect(key).toEqual(wilma1);
                        expect(val).toEqual(wilma1);
                    }

                    if (cbInvocations === 2) {
                        expect(key).toEqual(barney1);
                        expect(val).toEqual(barney1);
                    }

                    if (cbInvocations === 3) {
                        expect(key).toEqual(betty1);
                        expect(val).toEqual(betty1);
                    }

                    expect(theSet).toEqual(set);

                    cbInvocations++;
                });
            });


            it("invokes the function with the specified _this_ argument", () => {
                const set = new VoSet<Person>([fred1, wilma1, barney1, betty1]);

                set.forEach(
                    function (this: Person, val, key, theSet) {
                        expect(this).toEqual(fred2);
                    },
                    fred2
                );
            });

        });

    });
});
