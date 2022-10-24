import { StringI } from "./stringI";

describe("StringI", () => {

    describe("instance", () => {

        describe("toString()", () => {

            it("returns the same case as the value used during construction", () => {
                const si = new StringI("FooBar");
                expect(si.toString()).toEqual("FooBar");
            });

        });


        describe("equals()", () => {

            describe("when given a StringI", () => {

                it("returns false when the two  are different", () => {
                    const si1 = new StringI("foo");
                    const si2 = new StringI("bar");
                    expect(si1.equals(si2)).toBeFalse();
                });


                it("returns true when the two  are identical", () => {
                    const si1 = new StringI("FooBar");
                    const si2 = new StringI("FooBar");
                    expect(si1.equals(si2)).toBeTrue();
                });


                it("returns true when the two differ only by case", () => {
                    const si1 = new StringI("FooBar");
                    const si2 = new StringI("foobar");
                    expect(si1.equals(si2)).toBeTrue();
                });

            });

            describe("when given a string", () => {

                it("returns false when the two  are different", () => {
                    const si1 = new StringI("foo");
                    expect(si1.equals("bar")).toBeFalse();
                });


                it("returns true when the two  are identical", () => {
                    const si1 = new StringI("FooBar");
                    expect(si1.equals("FooBar")).toBeTrue();
                });


                it("returns true when the two differ only by case", () => {
                    const si1 = new StringI("FooBar");
                    expect(si1.equals("foobar")).toBeTrue();
                });

            });

        });

    });

});
