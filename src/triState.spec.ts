import {TriState} from "./triState";


describe("TriState", () =>
{
    it("provides static properties representing all values", () =>
    {
        expect(TriState.false).toBeDefined();
        expect(TriState.true).toBeDefined();
        expect(TriState.indeterminate).toBeDefined();
    });


    describe("toString()", () =>
    {
        it("returns the expected strings", () =>
        {
            expect(TriState.false.toString()).toEqual("false");
            expect(TriState.true.toString()).toEqual("true");
            expect(TriState.indeterminate.toString()).toEqual("indeterminate");
        });
    });

});
