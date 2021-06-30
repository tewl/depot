import {find} from "./collection";


describe("find", () => {


    it("returns undefined if the predicate returns falsy for all items", () => {
        const res = find([1, 2, 3, 4], () => false);
        expect(res).toEqual(undefined);
    });


    it("return the expected item when the item is found", () => {
        const res = find([1, 2, 3, 4], (item) => item === 3 ? 6 : false);
        expect(res).toBeDefined();
        expect(res?.item).toEqual(3);
    });


    it("returns the expected predicate return value when the item is found", () => {
        const res = find([1, 2, 3, 4], (item) => item === 3 ? 6 : false);
        expect(res).toBeDefined();
        expect(res?.predicateReturn).toEqual(6);
    });


    it("passes the expected parameters to the predicate", () => {
        const res = find([1, 2, 3], (item, index, collection) => {
            if (item === 1) {
                expect(index).toEqual(0);
            }
            else if (item === 2) {
                expect(index).toEqual(1);
            }
            else if (item === 3) {
                expect(index).toEqual(2);
            }
            else {
                expect(false).toBeTruthy();
            }

            expect(collection).toEqual([1, 2, 3]);
        });
    });
});
