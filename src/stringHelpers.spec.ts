import {
    numInitial, outdent, trimBlankLines, indent, removeWhitespace,
    removeBlankLines, splitIntoLines, splitLinesOsIndependent, padLeft, padRight,
    repeat, splice, getEol, parseDecInt, hexStr, decAndHex, hexStr8, hexStr16,
    hexStr16Array, hexStr32, toExponential, isValidIpAddress, containsNestedPairs,
    getBufferString
} from "./stringHelpers";

describe("string helpers module", () => {

    it("hexStr() should convert a number to a hexadecimal string", () => {
        expect(hexStr(0)).toEqual("0x0");
        expect(hexStr(0xF)).toEqual("0xf");
        expect(hexStr(0x10)).toEqual("0x10");
    });


    it("decAndHex() should convert to an appropriate string", () => {
        expect(decAndHex(0)).toEqual("0 (0x0)");
        expect(decAndHex(0xF)).toEqual("15 (0xf)");
        expect(decAndHex(0x10)).toEqual("16 (0x10)");
    });


    it("hexStr8() should convert to an appropriate string", () => {
        expect(hexStr8(0x00)).toEqual("0x00");
        expect(hexStr8(0x10)).toEqual("0x10");
        expect(hexStr8(0xff)).toEqual("0xff");
    });


    it("hexStr16() should convert to an appropriate string", () => {
        expect(hexStr16(0x0000)).toEqual("0x0000");
        expect(hexStr16(0x0010)).toEqual("0x0010");
        expect(hexStr16(0xffff)).toEqual("0xffff");
    });


    it("hexStr16Array() should convert to an appropriate string", () => {
        expect(hexStr16Array([0x201])).toEqual("0x0201");
        expect(hexStr16Array([0x201, 0x202])).toEqual("0x0201 0x0202");
    });


    it("hexStr32() should convert to an appropriate string", () => {
        expect(hexStr32(0x00000000)).toEqual("0x00000000");
        expect(hexStr32(0x00000010)).toEqual("0x00000010");
        expect(hexStr32(0xffffffff)).toEqual("0xffffffff");
    });


    describe("toExponential()", () => {


        it("will convert 0", () => {
            expect(toExponential(0)).toEqual("0.00000000e+000");
        });


        it("will convert a positive value greater than 10", () => {
            expect(toExponential(12345678)).toEqual("1.23456780e+007");
        });


        it("will convert a positive value between 1 and 10", () => {
            expect(toExponential(1.2345678)).toEqual("1.23456780e+000");
        });


        it("will convert a positive value less than 1", () => {
            expect(toExponential(0.12345678)).toEqual("1.23456780e-001");
        });


        it("will convert a negative value less than -10", () => {
            expect(toExponential(-12345678)).toEqual("-1.23456780e+007");
        });


        it("will convert a negative value between -1 and -10", () => {
            expect(toExponential(-1.2345678)).toEqual("-1.23456780e+000");
        });


        it("will convert a negative value greater than -1", () => {
            expect(toExponential(-0.12345678)).toEqual("-1.23456780e-001");
        });

    });


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


    describe("parseDecInt()", () => {

        const jsUnrepresentable = "18446744073709551615";
        const jsRepresentable = "9007199254740991";


        it("returns successful result with expected value when given a representable string", () => {
            const res = parseDecInt(jsRepresentable);
            expect(res.succeeded).toBeTrue();
            expect(res.value).toEqual(9007199254740991);
        });


        it("returns error result when given an unrepresentable string", () => {
            const res = parseDecInt(jsUnrepresentable);
            expect(res.failed).toBeTrue();
        });

    });


    describe("isValidIpAddress()", () => {


        it("should return false when there is an invalid character", () => {
            expect(isValidIpAddress("-2.0.0.0")).toEqual(false);
            expect(isValidIpAddress("2#0#0#0")).toEqual(false);
            expect(isValidIpAddress("2-0-0-0")).toEqual(false);
            expect(isValidIpAddress("2_0_0_0")).toEqual(false);
        });


        it("should return false for addresses with a value greater than 255", () => {
            expect(isValidIpAddress("256.0.0.0")).toEqual(false);
            expect(isValidIpAddress("0.256.0.0")).toEqual(false);
            expect(isValidIpAddress("0.0.256.0")).toEqual(false);
            expect(isValidIpAddress("0.0.0.256")).toEqual(false);
        });


        it("should return false if not all octets are specified", () => {
            expect(isValidIpAddress("10")).toEqual(false);
            expect(isValidIpAddress("10.")).toEqual(false);
            expect(isValidIpAddress("10.88")).toEqual(false);
            expect(isValidIpAddress("10.88.")).toEqual(false);
            expect(isValidIpAddress("10.88.0")).toEqual(false);
            expect(isValidIpAddress("10.88.0.")).toEqual(false);
        });


        it("should return true for valid addresses", () => {
            expect(isValidIpAddress("10.88.0.0")).toEqual(true);
            expect(isValidIpAddress("192.168.0.0")).toEqual(true);
        });


    });


    it("getBufferString()", () => {
        const buf = Buffer.from([0, 1, 2, 0xa, 0xb, 0xc, 0xd, 0xe, 0xf]);
        expect(getBufferString(buf)).toEqual("00 01 02 0a 0b 0c 0d 0e 0f");
    });


    describe("containsNestedPairs()", () => {


        it("will return true for string with valid nesting", () => {
            const pairings = [
                {begin: "[", end: "]"},
                {begin: "{", end: "}"},
                {begin: "<e>", end: "</e>"}
            ];

            expect(containsNestedPairs(pairings, "")).toBeTruthy();
            expect(containsNestedPairs(pairings, "a")).toBeTruthy();

            expect(containsNestedPairs(pairings, "[]")).toBeTruthy();
            expect(containsNestedPairs(pairings, "{}")).toBeTruthy();
            expect(containsNestedPairs(pairings, "<e></e>")).toBeTruthy();

            expect(containsNestedPairs(pairings, "a[0]")).toBeTruthy();
            expect(containsNestedPairs(pairings, "a[0[1]]")).toBeTruthy();
            expect(containsNestedPairs(pairings, "a[0[1]]<e>[{}]</e>")).toBeTruthy();
        });


        it("will return true for string with valid nesting", () => {
            const pairings = [
                {begin: "[", end: "]"},
                {begin: "{", end: "}"},
                {begin: "<e>", end: "</e>"}
            ];

            expect(containsNestedPairs(pairings, "[")).toBeFalsy();
            expect(containsNestedPairs(pairings, "{")).toBeFalsy();
            expect(containsNestedPairs(pairings, "<e>")).toBeFalsy();

            expect(containsNestedPairs(pairings, "]")).toBeFalsy();
            expect(containsNestedPairs(pairings, "}")).toBeFalsy();
            expect(containsNestedPairs(pairings, "</e>")).toBeFalsy();

            expect(containsNestedPairs(pairings, "][")).toBeFalsy();
            expect(containsNestedPairs(pairings, "}{")).toBeFalsy();
            expect(containsNestedPairs(pairings, "a[5}")).toBeFalsy();
        });


    });
});
