import {numInitial, outdent, trimBlankLines} from "./stringHelpers";


describe("numInitial()", () => {


    it("returns 0 if the pad string is an empty string", () => {
        expect(numInitial("xxxyyy", "")).toEqual(0);
    });


    it("returns the number of pad repitions", () => {
        expect(numInitial("xxxxABC", "x")).toEqual(4);
    });


    it("returns 0 when padChar does not occur at beginning", () => {
        expect(numInitial("xxxxABC", "y")).toEqual(0);
    });


    it("returns the corrent number when the whole string is the pad", () => {
        expect(numInitial("xxxxx", "x")).toEqual(5);
    });


});


describe("outdent()", () => {


    it("removes the leading pad from a single line string", () => {
        expect(outdent("xxxx1234", "x")).toEqual("1234");
    });


    it("removes leading spaces by default", () => {
        const lines = [
            "    line 1",
            "    line 2",
            "    line 3"
        ];
        expect(outdent(lines.join("\n"))).toEqual("line 1\nline 2\nline 3");
    });


    it("will shorten all lines by the amount of the least indented line", () => {
        const lines = [
            "    line 1",
            "   line 2",
            "  line 3"
        ];
        expect(outdent(lines.join("\n"))).toEqual("  line 1\n line 2\nline 3");
    });


});


describe("trimBlankLines()", () => {


    it("removes leading and trailing blank lines", () => {
        const lines = [
            "",
            "",
            "line 1",
            "line 2",
            "",
            "",
            ""
        ];
        expect(trimBlankLines(lines.join("\n"))).toEqual("line 1\nline 2");
    });


    it("returns the original string when there are no blank lines", () => {
        expect(trimBlankLines("line 1\nline 2")).toEqual("line 1\nline 2");
    });


});
