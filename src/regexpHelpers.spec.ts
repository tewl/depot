import {matchesAny} from "./regexpHelpers";

describe("matchesAny()", () => {


    it("returns true when one of the regexes matches", () => {

        const str = "2011-12-23\IMG_4394.JPG";
        const regexes = [
            /foo/,
            /bar/,
            /^\d/
        ];

        expect(matchesAny(str, regexes)).toEqual(true);
    });


    it("returns false when none of the regexes match", () => {
        const str = "2011-12-23\IMG_4394.JPG";
        const regexes = [
            /foo/,
            /bar/
        ];

        expect(matchesAny(str, regexes)).toEqual(false);
    });

});
