import {getEnumErrorClass} from "./enumError";


enum CastleErrors {
    BurnedDown = 1,
    FellOver,
    SankIntoSwamp
}
const castleError = getEnumErrorClass(CastleErrors);


describe("getEnumErrorClass()", () => {

    it("returns a class that can be used to throw enumerated errors", () => {
        const err = new castleError(CastleErrors.BurnedDown);
        expect(err.errorNum).toEqual(1);
        expect(err.message).toEqual("Error 1 (BurnedDown)");
    });


});
