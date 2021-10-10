import {getEnumErrorClass} from "./enumError";


enum CastleErrors {
    BURNED_DOWN = 1,
    FELL_OVER,
    SANK_INTO_SWAMP
}
const castleError = getEnumErrorClass(CastleErrors);


describe("getEnumErrorClass()", () => {


    it("returns a class that can be used to throw enumerated errors", () => {

        const err = new castleError(CastleErrors.BURNED_DOWN);
        expect(err.errorNum).toEqual(1);
        expect(err.message).toEqual("Error 1 (BURNED_DOWN)");
    });


});
