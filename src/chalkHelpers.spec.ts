import chalk = require("chalk");
import { highlightMatches } from "./chalkHelpers";


describe("highlightMatches()", () =>
{
    it("returns zero and the original string when there are no matches", () =>
    {
        const result = highlightMatches("xyzzy", /bar/, chalk.red);
        expect(result).toEqual([0, "xyzzy"]);
    });


    it("highlights a single occurrence", () =>
    {
        const result = highlightMatches("foobarfoo", /bar/, chalk.red);
        expect(result).toEqual([1, "foo\u001b[31mbar\u001b[39mfoo"]);
    });


    it("highlights multiple occurrences", () =>
    {
        const result = highlightMatches("foobarfoobarfoo", /bar/, chalk.red);
        expect(result).toEqual([2, "foo\u001b[31mbar\u001b[39mfoo\u001b[31mbar\u001b[39mfoo"]);
    });
});
