import {CompareResult, compareStr, compareStrI} from "./compare";


describe("compareStr()", () => {

    it("when first is less returns LESS", () => {
        expect(compareStr("abcd", "abdd")).toEqual(CompareResult.LESS);
    });


    it("when string differ only by case the uppercase one is less", () => {
        expect(compareStr("abCd", "abcd")).toEqual(CompareResult.LESS);
    });


    it("when strings are equal returns EQUAL", () => {
        expect(compareStr("abcd", "abcd")).toEqual(CompareResult.EQUAL);
    });


    it("when first is greater returns GREATER", () => {
        expect(compareStr("abcd", "abc")).toEqual(CompareResult.GREATER);
    });

});


describe("compareStrI()", () => {

    it("when first is less returns LESS", () => {
        expect(compareStrI("abcd", "abd")).toEqual(CompareResult.LESS);
    });


    it("when strings differ only by case returns EQUAL", () => {
        expect(compareStrI("abcd", "ABCD")).toEqual(CompareResult.EQUAL);
    });


    it("when strings are equal returns EQUAL", () => {
        expect(compareStrI("abcd", "abcd")).toEqual(CompareResult.EQUAL);
    });


    it("when first is greater returns GREATER", () => {
        expect(compareStrI("abcd", "abad")).toEqual(CompareResult.GREATER);
    });

});
