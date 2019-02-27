import {Fraction, greatestCommonDivisor, leastCommonMultiple} from "./fraction";


describe("Fraction", () => {


    describe("static", () => {


        describe("fromParts()", () => {

            it("throws when the denominator is zero", () => {
                expect(() => {
                    Fraction.fromParts(1, 2, 0);
                }).toThrow();
            });


            it("creates the expected value when given 1 number", () => {
                const frac = Fraction.fromParts(3);
                expect(frac.toString()).toEqual("3");
            });


            it("creates the expected value when given 2 numbers", () => {
                let frac = Fraction.fromParts(3, 2);
                expect(frac.toString()).toEqual("3/2");

                frac = Fraction.fromParts(48, 32);
                expect(frac.toString()).toEqual("48/32");
            });


            it("creates the expected value when given 3 numbers", () => {
                let frac = Fraction.fromParts(4, 3, 2);
                expect(frac.toString()).toEqual("4 3/2");

                frac = Fraction.fromParts(4, 2, 2);
                expect(frac.toString()).toEqual("4 2/2");

                frac = Fraction.fromParts(4, 12, 8);
                expect(frac.toString()).toEqual("4 12/8");
            });


        });


    });


    describe("instance", () => {


        // TODO: Write these tests.
        describe("toString()", () => {


            it("will return '0' when there is no whole part and no fractional part", () => {
                expect(Fraction.fromParts(0, 0, 1).toString()).toEqual("0");
            });


        });


    });


});


describe("greatestCommonDivisor()", () => {


    it("will throw when both of the values are 0", () => {
        expect(() => {
            greatestCommonDivisor(0, 0);
        }).toThrow();
    });


    it("will return k when given 0 and k", () => {
        expect(greatestCommonDivisor(0, 5)).toEqual(5);
        expect(greatestCommonDivisor(5, 0)).toEqual(5);
    });


    it("finds the greatest common divisor", () => {


        expect(greatestCommonDivisor(4, 8)).toEqual(4);

        expect(greatestCommonDivisor(8, 4)).toEqual(4);

        expect(greatestCommonDivisor(17, 3)).toEqual(1);
    });

});


describe("leastCommonMultiple()", () => {


    it("find the least common multiple", () => {

        expect(leastCommonMultiple(0, 1)).toEqual(0);

        expect(leastCommonMultiple(4, 6)).toEqual(12);

        expect(leastCommonMultiple(6, 4)).toEqual(12);

        expect(leastCommonMultiple(6, 6)).toEqual(6);
    });


});
