import { IHashable } from "./hashable";
import { hash } from "./hash";
import { VoMap } from "./voMap";

class Person {
    public constructor(public readonly first: string, public readonly last: string) {
    }
}


/**
 * Creates a VoMap<Person, number> where Person keys are considered equal if they
 * have the same first and last names.
 *
 * @param iterable - The values to initialize the map with.
 * @returns The new Person map.
 */

function createPersonMap(iterable?: Iterable<[Person, number]>): VoMap<Person, number> {
    return new VoMap<Person, number>(personNameHash, iterable);

    function personNameHash(p: Person) {
        const intrinsics = { first: p.first, last: p.last };
        return hash(JSON.stringify(intrinsics), false, "sha256", "base64");
    }
}


const fred1 = new Person("Fred", "Flintstone");
const fred2 = new Person("Fred", "Flintstone");
const wilma1 = new Person("Wilma", "Flintstone");
const wilma2 = new Person("Wilma", "Flintstone");
const barney1 = new Person("Barney", "Rubble");
const barney2 = new Person("Barney", "Rubble");
const betty1 = new Person("Betty", "Rubble");
const betty2 = new Person("Betty", "Rubble");



describe("VoMap", () => {

    describe("constructor", () => {

        it("creates an empty map when no values are specified", () => {
            const map = createPersonMap();
            expect(map.size).toEqual(0);
        });


        it("creates a prepopulated map when an iterable is specified", () => {
            const map = createPersonMap([
                [fred1, 40],
                [wilma1, 41],
                [barney1, 42],
                [betty1, 43],
            ]);
            expect(map.size).toEqual(4);
        });
    });


    describe("instance", () => {


        describe("size property", () => {

            it("has expected value while mutating the collection", () => {
                const map = createPersonMap();
                expect(map.size).toEqual(0);
                map.set(fred1, 40);
                expect(map.size).toEqual(1);
                map.set(wilma1, 41);
                expect(map.size).toEqual(2);
                map.set(barney1, 42);
                expect(map.size).toEqual(3);
                map.set(betty1, 43);
                expect(map.size).toEqual(4);

                expect(map.delete(fred2)).toBeTrue();
                expect(map.size).toEqual(3);
                expect(map.delete(barney2)).toBeTrue();
                expect(map.size).toEqual(2);
                expect(map.delete(wilma2)).toBeTrue();
                expect(map.size).toEqual(1);
                expect(map.delete(betty2)).toBeTrue();
                expect(map.size).toEqual(0);
            });

        });


        describe("iterator", () => {

            it("iterates over the items in the expected order", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);
                expect(Array.from(map)).toEqual([[fred1, 40], [wilma1, 41], [barney1, 42], [betty1, 43]]);
            });


            it("supports concurrent iteration", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const iter1 = map[Symbol.iterator]();

                expect(iter1.next().value).toEqual([fred1, 40]);
                expect(iter1.next().value).toEqual([wilma1, 41]);

                const iter2 = map[Symbol.iterator]();

                expect(iter2.next().value).toEqual([fred1, 40]);
                expect(iter1.next().value).toEqual([barney1, 42]);
                expect(iter2.next().value).toEqual([wilma1, 41]);
                expect(iter1.next().value).toEqual([betty1, 43]);
                expect(iter2.next().value).toEqual([barney1, 42]);
                expect(iter2.next().value).toEqual([betty1, 43]);
            });


            it("makes the map an Iterable that can be used directly in a for...of loop", () => {
                const map1 = createPersonMap();
                map1.set(fred1, 40);
                map1.set(wilma1, 41);
                map1.set(barney1, 42);
                map1.set(betty1, 43);

                let loopInvocations = 0;
                for (const [key, value] of map1) {

                    if (loopInvocations === 0) {
                        expect(key).toEqual(fred1);
                        expect(value).toEqual(40);
                    }

                    if (loopInvocations === 1) {
                        expect(key).toEqual(wilma1);
                        expect(value).toEqual(41);
                    }

                    if (loopInvocations === 2) {
                        expect(key).toEqual(barney1);
                        expect(value).toEqual(42);
                    }

                    if (loopInvocations === 3) {
                        expect(key).toEqual(betty1);
                        expect(value).toEqual(43);
                    }

                    loopInvocations++;
                }

                expect(loopInvocations).toEqual(4);
            });

        });


        describe("entries()", () => {

            it("iterates over the items in the expected order", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const iter = map.entries();
                expect(iter.next()).toEqual({done: false, value: [fred1, 40]});
                expect(iter.next()).toEqual({done: false, value: [wilma1, 41]});
                expect(iter.next()).toEqual({done: false, value: [barney1, 42]});
                expect(iter.next()).toEqual({done: false, value: [betty1, 43]});
            });


            it("supports concurrent iteration", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const iter1 = map.entries();

                expect(iter1.next().value).toEqual([fred1, 40]);
                expect(iter1.next().value).toEqual([wilma1, 41]);

                const iter2 = map.entries();

                expect(iter2.next().value).toEqual([fred1, 40]);
                expect(iter1.next().value).toEqual([barney1, 42]);
                expect(iter2.next().value).toEqual([wilma1, 41]);
                expect(iter1.next().value).toEqual([betty1, 43]);
                expect(iter2.next().value).toEqual([barney1, 42]);
                expect(iter2.next().value).toEqual([betty1, 43]);
            });


            it("is an Iterable and can be used directly in a for...of loop", () => {
                const map1 = createPersonMap();
                map1.set(fred1, 40);
                map1.set(wilma1, 41);
                map1.set(barney1, 42);
                map1.set(betty1, 43);

                let loopInvocations = 0;
                for (const [key, value] of map1.entries()) {

                    if (loopInvocations === 0) {
                        expect(key).toEqual(fred1);
                        expect(value).toEqual(40);
                    }

                    if (loopInvocations === 1) {
                        expect(key).toEqual(wilma1);
                        expect(value).toEqual(41);
                    }

                    if (loopInvocations === 2) {
                        expect(key).toEqual(barney1);
                        expect(value).toEqual(42);
                    }

                    if (loopInvocations === 3) {
                        expect(key).toEqual(betty1);
                        expect(value).toEqual(43);
                    }

                    loopInvocations++;
                }
                expect(loopInvocations).toEqual(4);
            });

        });


        describe("keys()", () => {

            it("iterates over the keys in the expected order", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const iter = map.keys();
                expect(iter.next()).toEqual({done: false, value: fred1});
                expect(iter.next()).toEqual({done: false, value: wilma1});
                expect(iter.next()).toEqual({done: false, value: barney1});
                expect(iter.next()).toEqual({done: false, value: betty1});
            });


            it("supports concurrent iteration", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const iter1 = map.keys();

                expect(iter1.next().value).toEqual(fred1);
                expect(iter1.next().value).toEqual(wilma1);

                const iter2 = map.keys();

                expect(iter2.next().value).toEqual(fred1);
                expect(iter1.next().value).toEqual(barney1);
                expect(iter2.next().value).toEqual(wilma1);
                expect(iter1.next().value).toEqual(betty1);
                expect(iter2.next().value).toEqual(barney1);
                expect(iter2.next().value).toEqual(betty1);
            });


            it("is an Iterable and can be used directly in a for...of loop", () => {
                const map1 = createPersonMap();
                map1.set(fred1, 40);
                map1.set(wilma1, 41);
                map1.set(barney1, 42);
                map1.set(betty1, 43);

                let loopInvocations = 0;
                for (const key of map1.keys()) {

                    if (loopInvocations === 0) {
                        expect(key).toEqual(fred1);
                    }

                    if (loopInvocations === 1) {
                        expect(key).toEqual(wilma1);
                    }

                    if (loopInvocations === 2) {
                        expect(key).toEqual(barney1);
                    }

                    if (loopInvocations === 3) {
                        expect(key).toEqual(betty1);
                    }

                    loopInvocations++;
                }
                expect(loopInvocations).toEqual(4);
            });
        });


        describe("values()", () => {

            it("iterates over the values in the expected order", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const iter = map.values();
                expect(iter.next()).toEqual({done: false, value: 40});
                expect(iter.next()).toEqual({done: false, value: 41});
                expect(iter.next()).toEqual({done: false, value: 42});
                expect(iter.next()).toEqual({done: false, value: 43});
            });


            it("supports concurrent iteration", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const iter1 = map.values();

                expect(iter1.next().value).toEqual(40);
                expect(iter1.next().value).toEqual(41);

                const iter2 = map.values();

                expect(iter2.next().value).toEqual(40);
                expect(iter1.next().value).toEqual(42);
                expect(iter2.next().value).toEqual(41);
                expect(iter1.next().value).toEqual(43);
                expect(iter2.next().value).toEqual(42);
                expect(iter2.next().value).toEqual(43);
            });


            it("is an Iterable and can be used directly in a for...of loop", () => {
                const map1 = createPersonMap();
                map1.set(fred1, 40);
                map1.set(wilma1, 41);
                map1.set(barney1, 42);
                map1.set(betty1, 43);

                let loopInvocations = 0;
                for (const value of map1.values()) {

                    if (loopInvocations === 0) {
                        expect(value).toEqual(40);
                    }

                    if (loopInvocations === 1) {
                        expect(value).toEqual(41);
                    }

                    if (loopInvocations === 2) {
                        expect(value).toEqual(42);
                    }

                    if (loopInvocations === 3) {
                        expect(value).toEqual(43);
                    }

                    loopInvocations++;
                }
            });

        });


        describe("set()", () => {

            it("sets the entry when it does not already exist", () => {
                const map = createPersonMap();
                expect(map.size).toEqual(0);
                map.set(fred1, 40);
                expect(map.size).toEqual(1);
                expect(map.get(fred1)).toEqual(40);
            });


            it("when the same key instance is used to set the value a second time, the first is overwritten", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(fred1, 42);
                expect(map.get(fred1)).toEqual(42);
                expect(map.size).toEqual(1);
            });


            it("when a different but equal instance is used to set the value a second time, the first is overwritten", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(fred2, 42);
                expect(map.get(fred1)).toEqual(42);
                expect(map.size).toEqual(1);
            });

        });


        describe("get()", () => {

            it("returns undefined when the key does not exist", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                expect(map.get(barney1)).toBeUndefined();
            });


            it("returns the expected value when the key is the same instance used when set", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                expect(map.get(barney1)).toEqual(42);
            });


            it("returns the expected value when the key is NOT the same instance used when set", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                expect(map.get(barney2)).toEqual(42);
            });

        });


        describe("has()", () => {

            it("returns true when called with the same instance used when set", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                expect(map.has(fred1)).toBeTrue();
                expect(map.has(wilma1)).toBeTrue();
                expect(map.has(barney1)).toBeTrue();
                expect(map.has(betty1)).toBeTrue();
            });


            it("returns true when called with a different instance as used when set", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                expect(map.has(fred2)).toBeTrue();
                expect(map.has(wilma2)).toBeTrue();
                expect(map.has(barney2)).toBeTrue();
                expect(map.has(betty2)).toBeTrue();
            });


            it("returns false when no equal key exists in the map", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const mrSlate = new Person("Unknown", "Slate");
                expect(map.has(mrSlate)).toBeFalse();
            });

        });


        describe("delete()", () => {

            it("returns true when an existing item in the map was deleted using the same instance", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                expect(map.size).toEqual(4);
                expect(map.delete(fred1)).toBeTrue();
                expect(map.size).toEqual(3);
                expect(map.delete(barney1)).toBeTrue();
                expect(map.size).toEqual(2);
                expect(map.delete(wilma1)).toBeTrue();
                expect(map.size).toEqual(1);
                expect(map.delete(betty1)).toBeTrue();
                expect(map.size).toEqual(0);
            });


            it("returns true when an existing item in the map was deleted using a different instance", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                expect(map.size).toEqual(4);
                expect(map.delete(fred2)).toBeTrue();
                expect(map.size).toEqual(3);
                expect(map.delete(barney2)).toBeTrue();
                expect(map.size).toEqual(2);
                expect(map.delete(wilma2)).toBeTrue();
                expect(map.size).toEqual(1);
                expect(map.delete(betty2)).toBeTrue();
                expect(map.size).toEqual(0);
            });


            it("returns false when the specified key does not exist in the map", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                const mrSlate = new Person("Unknown", "Slate");
                expect(map.delete(mrSlate)).toBeFalse();
            });

        });


        describe("clear()", () => {


            it("does nothing when the collection is empty", () => {
                const map = createPersonMap();
                expect(map.size).toEqual(0);
                map.clear();
                expect(map.size).toEqual(0);
            });


            it("removes all items from the collection when not empty", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                expect(map.size).toEqual(4);
                map.clear();
                expect(map.size).toEqual(0);
            });

        });


        describe("forEach", () => {

            it("invokes the function with the specified arguments in the expected order", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                let cbInvocations = 0;

                map.forEach((val, key, theMap) => {

                    if (cbInvocations === 0) {
                        expect(key).toEqual(fred1);
                        expect(val).toEqual(40);
                    }

                    if (cbInvocations === 1) {
                        expect(key).toEqual(wilma1);
                        expect(val).toEqual(41);
                    }

                    if (cbInvocations === 2) {
                        expect(key).toEqual(barney1);
                        expect(val).toEqual(42);
                    }

                    if (cbInvocations === 3) {
                        expect(key).toEqual(betty1);
                        expect(val).toEqual(43);
                    }

                    expect(theMap).toEqual(map);

                    cbInvocations++;
                });
            });


            it("invokes the function with the specified this argument", () => {
                const map = createPersonMap();
                map.set(fred1, 40);
                map.set(wilma1, 41);
                map.set(barney1, 42);
                map.set(betty1, 43);

                map.forEach(
                    function (this: Person, val, key, theMap) {
                        expect(this).toEqual(fred2);
                    },
                    fred2
                );
            });

        });

    });

});
