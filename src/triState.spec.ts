import {TriState} from "./triState";


describe("TriState", () => {
    it("provides static properties representing all values", () => {
        expect(TriState.FALSE).toBeDefined();
        expect(TriState.TRUE).toBeDefined();
        expect(TriState.INDETERMINATE).toBeDefined();
    });


    describe("toString()", () => {
        it("returns the expected strings", () => {
            expect(TriState.FALSE.toString()).toEqual("false");
            expect(TriState.TRUE.toString()).toEqual("true");
            expect(TriState.INDETERMINATE.toString()).toEqual("indeterminate");
        });
    });

});
