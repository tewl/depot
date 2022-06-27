import {matchesAny, setFlags, clearFlags, strToRegExp} from "./regexpHelpers";

describe("matchesAny()", () => {

    it("returns true when one of the regexes matches", () => {
        const str = "2011-12-23\\IMG_4394.JPG";
        const regexes = [
            /foo/,
            /bar/,
            /^\d/
        ];

        expect(matchesAny(str, regexes)).toEqual(true);
    });


    it("returns false when none of the regexes match", () => {
        const str = "2011-12-23\\IMG_4394.JPG";
        const regexes = [
            /foo/,
            /bar/
        ];

        expect(matchesAny(str, regexes)).toEqual(false);
    });

});


describe("clearFlags", () => {
    it("clears the specified flags", () => {
        const srcRegex = /bar/dig;
        const newRegex = clearFlags(srcRegex, ["i", "g", "y"]);
        expect(newRegex.flags).toEqual("d");
    });
});


describe("setFlags()", () => {
    it("sets the specified flags", () => {
        const srcRegex = /bar/d;
        const newRegex = setFlags(srcRegex, ["i", "g"]);
        expect(newRegex.flags).toEqual("dgi");
    });
});


describe("strToRegExp()", () => {
    it("succeeds when given a valid regex", () => {
        const result = strToRegExp("foo");
        expect(result.succeeded).toBeTrue();
    });


    it("succeeds when given a regex with flags", () => {
        const result = strToRegExp("/foo/i");
        expect(result.succeeded).toBeTrue();
        expect(result.value?.flags).toEqual("i");
    });


    it("fails when given in invalid regex", () => {
        const result = strToRegExp("foo\\");
        expect(result.failed).toBeTrue();
        expect(result.error?.length).toBeGreaterThan(0);
    });
});
