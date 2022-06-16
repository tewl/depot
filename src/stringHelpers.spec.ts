import {
    numInitial, outdent, trimBlankLines, indent, removeWhitespace,
    removeBlankLines, splitIntoLines, splitLinesOsIndependent, padLeft, padRight,
    repeat, splice, getEol, hash
} from "./stringHelpers";


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


    it("returns the correct number when the whole string is the pad", () => {
        expect(numInitial("xxxxx", "x")).toEqual(5);
    });


});


describe("indent()", () => {

    it("will indent a single line appropriately", () => {
        expect(indent("foo", 2)).toEqual("  foo");
    });


    it("will indent a multiple lines appropriately", () => {
        expect(indent("foo\nbar\nbaz", 2)).toEqual("  foo\n  bar\n  baz");
    });


    it("can accept an indent string rather than number of spaces", () => {
        expect(indent("foo\nbar", "****")).toEqual("****foo\n****bar");
    });


    it("can optionally skip indenting the first line", () => {
        expect(indent("foo\nbar", 2, true)).toEqual("foo\n  bar");
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
        expect(outdent(lines.join("\n"))).toEqual(
            [
                "line 1",
                "line 2",
                "line 3"
            ].join("\n")
        );
    });


    it("will shorten all lines by the amount of the least indented line", () => {
        const lines = [
            "    line 1",
            "   line 2",
            "  line 3"
        ];
        expect(outdent(lines.join("\n"))).toEqual(
            [
                "  line 1",
                " line 2",
                "line 3"
            ].join("\n")
        );
    });


    it("will not modify the lines when one line does not have the specified indent", () => {
        const lines = [
            "  line 1",
            "  line 2",
            "line 3"
        ];
        const inputStr = lines.join("\n");
        expect(outdent(inputStr)).toEqual(inputStr);
    });


    it("only 1 occurrence will be removed when `greedy` is false", () => {
        const input = [
            "    line 1",
            "    line 2",
            "    line 3"
        ].join("\n");
        const expected = [
            "  line 1",
            "  line 2",
            "  line 3"
        ].join("\n");
        expect(outdent(input, "  ", false)).toEqual(expected);
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


describe("removeBlankLines()", () => {

    it("returns an empty string when given a single blank line", () => {
        expect(removeBlankLines("  \t  ")).toEqual("");
    });


    it("returns an empty string when given multiple blank lines", () => {
        const orig = [
            "  \t  ",
            "\t  \t",
            "\t\t\t",
            "      "
        ].join("\n");

        expect(removeBlankLines(orig)).toEqual("");
    });


    it("removes blank lines from the middle of a string", () => {
        const orig = [
            "line 1",
            "",
            "line 2"
        ].join("\n");

        expect(removeBlankLines(orig)).toEqual("line 1\nline 2");
    });


    it("removes blank lines from the beginning of a string", () => {
        const orig = [
            "",
            "line 1",
            "line 2"
        ].join("\n");

        expect(removeBlankLines(orig)).toEqual("line 1\nline 2");
    });


    it("removes blank lines from the end of a string", () => {
        const orig = [
            "line 1",
            "line 2",
            ""
        ].join("\n");

        expect(removeBlankLines(orig)).toEqual("line 1\nline 2");
    });


});


describe("removeWhitespace", () => {

    it("will remove whitespace from the beginning", () => {
        expect(removeWhitespace(" foo")).toEqual("foo");
    });


    it("will remove whitespace from the middle", () => {
        expect(removeWhitespace("foo bar")).toEqual("foobar");
    });


    it("will remove whitespace from the end", () => {
        expect(removeWhitespace("foo ")).toEqual("foo");
    });


    it("will remove multiple regions of whitespace", () => {
        expect(removeWhitespace(" foo bar ")).toEqual("foobar");
    });


    it("will remove different kinds of whitespace", () => {
        expect(removeWhitespace("\tfoo\t    \tbar\t\t")).toEqual("foobar");
    });


});


describe("splitIntoLines", () => {


    it("properly handles case where there is only one line",  () => {
        expect(splitIntoLines("foo", true)).toEqual(["foo"]);
    });


    it("splits on CRLF", () => {
        const text = "\r\none\r\ntwo\r\nthree\r\n";
        const result = splitIntoLines(text, false);
        expect(result).toEqual([
            "",
            "one",
            "two",
            "three",
            ""
        ]);
    });


    it("splits on LF", () => {
        const text = "\none\ntwo\nthree\n";
        const result = splitIntoLines(text, false);
        expect(result).toEqual([
            "",
            "one",
            "two",
            "three",
            ""
        ]);
    });


    it("retains line endings", () => {
        const text = "\none\r\ntwo\nthree\r\nfour\n";
        const result = splitIntoLines(text, true);
        expect(result).toEqual([
            "\n",
            "one\r\n",
            "two\n",
            "three\r\n",
            "four\n",
            ""
        ]);
    });


    it("will not mess with leading and trailing whitespace", () => {
        const text = "  foo  \n  bar  \r\n\tquux  ";
        const result = splitIntoLines(text);
        expect(result).toEqual([
            "  foo  ",
            "  bar  ",
            "\tquux  "
        ]);
    });


});


describe("splitLinesOsIndependent()", () => {


    it("will split a string with posix-style newlines (\\n)", () => {
        const src = "line 1\nline 2\nline 3";
        const result = splitLinesOsIndependent(src);
        expect(result.length).toEqual(3);
        expect(result[0]).toEqual("line 1");
        expect(result[1]).toEqual("line 2");
        expect(result[2]).toEqual("line 3");
    });


    it("will split a string with windows-style newlines (\\r\\n)", () => {
        const src = "line 1\r\nline 2\r\nline 3";
        const result = splitLinesOsIndependent(src);
        expect(result.length).toEqual(3);
        expect(result[0]).toEqual("line 1");
        expect(result[1]).toEqual("line 2");
        expect(result[2]).toEqual("line 3");
    });


});


describe("padLeft()", () => {

    it("Will insert no pad when the source equals the desired length", () => {
        const padded = padLeft("1234", "x", 4);
        expect(padded).toEqual("1234");
    });


    it("Will insert no pad when the source exceeds the desired length", () => {
        const padded = padLeft("12345", "x", 4);
        expect(padded).toEqual("12345");
    });


    it("Will insert correct pad when the pad string is one character", () => {
        const padded = padLeft("123", "x", 5);
        expect(padded).toEqual("xx123");
    });


    it("Will insert correct pad when the pad string is multiple characters and fits evenly", () => {
        const padded = padLeft("123", "xy", 5);
        expect(padded).toEqual("xy123");
    });


    it("Will insert correct pad when the pad string is multiple characters and does not fit evenly", () => {
        const padded = padLeft("123", "xy", 6);
        expect(padded).toEqual("xyx123");
    });

});


describe("padRight()", () => {

    it("Will insert no pad when the source equals the desired length", () => {
        const padded = padRight("1234", "x", 4);
        expect(padded).toEqual("1234");
    });


    it("Will insert no pad when the source exceeds the desired length", () => {
        const padded = padRight("12345", "x", 4);
        expect(padded).toEqual("12345");
    });


    it("Will insert correct pad when the pad string is one character", () => {
        const padded = padRight("123", "x", 5);
        expect(padded).toEqual("123xx");
    });


    it("Will insert correct pad when the pad string is multiple characters and fits evenly", () => {
        const padded = padRight("123", "xy", 5);
        expect(padded).toEqual("123xy");
    });


    it("Will insert correct pad when the pad string is multiple characters and does not fit evenly", () => {
        const padded = padRight("123", "xy", 6);
        expect(padded).toEqual("123xyx");
    });

});


describe("getEol()", () => {

    it("returns '\r\n' when used as EOL", () => {
        expect(getEol("foo\r\nbar")).toEqual("\r\n");
    });


    it("returns '\n' when used as EOL", () => {
        expect(getEol("foo\nbar")).toEqual("\n");
    });


    it("returns undefined when there is no EOL in the sample string", () => {
        expect(getEol("foobar")).toEqual(undefined);
    });

});


describe("repeat()", () => {
    it("repeats the string as expected when the number of chars requested is a whole multiple", () => {
        expect(repeat("123", 6)).toEqual("123123");
    });


    it("repeats the string as expected when the number of chars requested is not a whole multiple", () => {
        expect(repeat("123", 10)).toEqual("1231231231");
    });
});


describe("splice()", () => {
    it("can remove characters", () => {
        expect(splice("012345", 3, 2, "")).toEqual("0125");
    });


    it("can insert characters", () => {
        expect(splice("012345", 3, 0, "abc")).toEqual("012abc345");
    });


    it("can remove and insert characters", () => {
        expect(splice("012345", 3, 2, "abc")).toEqual("012abc5");
    });


    it("can insert at the beginning", () => {
        expect(splice("012345", 0, 0, "abc")).toEqual("abc012345");
    });


    it("can insert at the end", () => {
        expect(splice("012345", 6, 0, "abc")).toEqual("012345abc");
    });


    it("can delete at the beginning", () => {
        expect(splice("012345", 0, 2, "")).toEqual("2345");
    });


    it("can delete at the end", () => {
        expect(splice("012345", 5, 2, "")).toEqual("01234");
    });


    it("can specify negative index to make relative to the end", () => {
        expect(splice("012345", -1, 1, "")).toEqual("01234");
        expect(splice("012345", -2, 1, "")).toEqual("01235");
    });


    it("operates on the end if the index specified is too large", () => {
        expect(splice("012345", 100, 50, "abc")).toEqual("012345abc");
    });


    it("operates on the beginning of a negative index is too large", () => {
        expect(splice("012345", -100, 2, "abc")).toEqual("abc2345");
    });


});


describe("hash()", () => {

    it("returns a non-empty string", () => {
        const hashVal = hash("foo");
        expect(hashVal.length).toBeGreaterThan(0);
    });


    it("when given an empty string, returns a non-empty string", () => {
        const hashVal = hash("");
        expect(hashVal.length).toBeGreaterThan(0);
    });


    it("returns the same hash for an equal string", () => {
        const hash1 = hash("foo");
        const hash2 = hash("foo");
        expect(hash1).toEqual(hash2);
    });


    it("returns hexadecimal output when requested", () => {
        const hash1 = hash("foo", "sha256", "hex");
        expect(hash1).toEqual("2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae");
    });


    it("returns base64 output when requested", () => {
        const hash1 = hash("foo", "sha256", "base64");
        expect(hash1).toEqual("LCa0a2j/xo/5m0U8HTBBNBNCLXBkg7+g+YpeiGJm564=");
    });
});
