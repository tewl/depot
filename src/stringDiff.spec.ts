import { elideEqual } from "./stringDiff";


describe("elideEqual()", () => {

    it("uses the specified delimiter to create the parts of the string", () => {
        const [x, y] = elideEqual("a/b/c/d", "e/f/g/h", "/", "...", 4, 4);
        expect(x).toEqual(["a", "b", "c", "d"]);
        expect(y).toEqual(["e", "f", "g", "h"]);
    });


    it("uses the specified elided value", () => {
        const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 1, 1);
        expect(x).toEqual(["a", "...", "e"]);
        expect(y).toEqual(["a", "...", "e"]);
    });


    describe("- initial parts -", () => {

        it("can keep zero initial parts", () => {
            const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 0, 1);
            expect(x).toEqual(["...", "e"]);
            expect(y).toEqual(["...", "e"]);
        });


        it("can keep a nonzero number of initial parts", () => {
            const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 2, 0);
            expect(x).toEqual(["a", "b", "..."]);
            expect(y).toEqual(["a", "b", "..."]);
        });


        it("keeping more initial parts than the input has returns all parts", () => {
            const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 20, 0);
            expect(x).toEqual(["a", "b", "c", "d", "e"]);
            expect(y).toEqual(["a", "b", "c", "d", "e"]);
        });


        it("specifying a negative number of initial parts is the same as specifying 0", () => {
            const [x, y] = elideEqual("a/b/c", "a/b/c", "/", "...", -1, 0);
            expect(x).toEqual(["..."]);
            expect(y).toEqual(["..."]);
        });
    });


    describe("- final parts -", () => {

        it("can keep zero final parts", () => {
            const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 1, 0);
            expect(x).toEqual(["a", "..."]);
            expect(y).toEqual(["a", "..."]);
        });


        it("can keep a nonzero number of final parts", () => {
            const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 0, 2);
            expect(x).toEqual(["...", "d", "e"]);
            expect(y).toEqual(["...", "d", "e"]);
        });


        it("keeping more final parts than the input has returns all parts", () => {
            const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 0, 20);
            expect(x).toEqual(["a", "b", "c", "d", "e"]);
            expect(y).toEqual(["a", "b", "c", "d", "e"]);
        });


        it("specifying a negative number of final parts is the same as specifying 0", () => {
            const [x, y] = elideEqual("a/b/c", "a/b/c", "/", "...", 0, -1);
            expect(x).toEqual(["..."]);
            expect(y).toEqual(["..."]);
        });
    });


    it("can keep zero initial parts and zero final parts", () => {
        const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 0, 0);
        expect(x).toEqual(["..."]);
        expect(y).toEqual(["..."]);
    });


    it("can keep nonzero initial parts and nonzero final parts", () => {
        const [x, y] = elideEqual("a/b/c/d/e", "a/b/c/d/e", "/", "...", 1, 2);
        expect(x).toEqual(["a", "...", "d", "e"]);
        expect(y).toEqual(["a", "...", "d", "e"]);
    });

});
