import { comment } from "./comment";
import {splitIntoLines} from "./stringHelpers";


describe("comment()", () => {


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
        const resultLines = splitIntoLines(result);
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


});

