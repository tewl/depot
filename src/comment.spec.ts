import { comment, uncomment } from "./comment";
import {splitIntoLines} from "./stringHelpers";


describe("comment()", () => {

    it("will return undefined when given an empty string", () => {
        expect(comment("")).toEqual(undefined);
    });


    it("will return undefined when given a single line of whitespace", () => {
        expect(comment("  \t  ")).toEqual(undefined);
    });


    it("will return undefined when given multiple lines of whitespace", () => {
        const text = [
            "",
            "    \t",
            "\t\t",
            "        ",
            "",
            "",
            ""
        ];
        const result = comment(text.join("\n"));
        expect(result).toEqual(undefined);
    });


    it("will place a comment token at the beginning when there is no indentation", () => {
        expect(comment("xyzzy")).toEqual("// xyzzy");
    });


    it("will place a comment token between initial whitespace and non-whitespace when there is indentation", () => {
        expect(comment("    xyzzy")).toEqual("    // xyzzy");
    });


    it("will place the comment token at the same place on all lines",  () => {
        const text = [
            "",
            "        one",
            "",
            "    two",
            "",
            "            three",
            ""
        ];
        const result = comment(text.join("\n"));
        const resultLines = splitIntoLines(result!);
        expect(resultLines).toEqual([
            "    //",
            "    //     one",
            "    //",
            "    // two",
            "    //",
            "    //         three",
            "    //"
        ]);
    });


    it("will comment source that already has a comment in it (single line)", () => {
        expect(comment("    // xyzzy")).toEqual("    // // xyzzy");
    });


    it("will comment source that already has a comment in it (multi line)", () => {
        const text = [
            "",
            "        one",
            "",
            "    two",
            "",
            "            // three",
            ""
        ];
        const result = comment(text.join("\n"));
        const resultLines = splitIntoLines(result!);
        expect(resultLines).toEqual([
            "    //",
            "    //     one",
            "    //",
            "    // two",
            "    //",
            "    //         // three",
            "    //"
        ]);
    });


});


describe("uncomment()", () => {

    it("returns undefined when given an empty string", () => {
        expect(uncomment("")).toEqual(undefined);
    });


    it("returns undefined when given a single line of whitespace", () => {
        expect(uncomment("  \t  ")).toEqual(undefined);
    });


    it("returns undefined when given multiple lines of whitespace", () => {
        expect(uncomment("\t\n    \n  \t  \n")).toEqual(undefined);
    });


    it("will remove the comment token when there is no indentation", () => {
        expect(uncomment("// xyzzy")).toEqual("xyzzy");
    });


    it("will remove the comment token when there is indentation", () => {
        expect(uncomment("    // xyzzy")).toEqual("    xyzzy");
    });


    it("will remove the comment token when it appears in different columns", () => {
        const orig = [
            "    // foo",
            "        // bar",
            "            // baz"
        ];

        const result = splitIntoLines(uncomment(orig.join("\n"))!);
        expect(result).toEqual([
            "    foo",
            "        bar",
            "            baz"
        ]);

    });



});
