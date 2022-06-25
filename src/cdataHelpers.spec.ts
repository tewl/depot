import * as _ from "lodash";
import { getCdata, getCdataRegex } from "./cdataHelpers";
import { failed, succeeded } from "./result";


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
        const res = getCdata("<![CDATAX[foo]]>");
        expect(failed(res)).toBeTrue();
    });


    it("returns the expected character data as a string", () => {
        const res = getCdata("<![CDATA[foo]]>");
        expect(succeeded(res)).toBeTrue();
        expect(res.value).toEqual("foo");
    });


    it("returns the expected character data when it is multiline", () => {
        const charData = `foo
        bar
        quux
        `;
        const res = getCdata(`<![CDATA[${charData}]]>`);
        expect(succeeded(res)).toBeTrue();
        expect(res.value).toEqual(charData);
    });


});
