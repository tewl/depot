import * as _ from "lodash";
import { getCdata, getCdataRegex } from "./cdataHelpers";


describe("getCdataRegex()", () => {

    it("returns a RegExp", () => {
        const regex = getCdataRegex();
        expect(_.isRegExp(regex)).toBeTrue();

    });


    it("returns a regex that has a 'charData' named capture group", () => {
        const regex = getCdataRegex();
        const matches = regex.exec("<![CDATA[foo]]>");
        expect(matches!.groups!.charData).toEqual("foo");
    });

});


describe("getCdata()", () => {


    it("returns undefined when given bad input text", () => {
        expect(getCdata("<![CDATAX[foo]]>")).toBeUndefined();
    });


    it("returns the expected character data as a string", () => {
        expect(getCdata("<![CDATA[foo]]>")).toEqual("foo");
    });


    it("returns the expected character data when it is multiline", () => {
        const charData = `foo
        bar
        quux
        `;
        expect(getCdata(`<![CDATA[${charData}]]>`)).toEqual(charData);
    });


});
