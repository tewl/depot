import {Fraction, greatestCommonDivisor, leastCommonMultiple} from "./fraction";


fdescribe("Fraction", () => {


    describe("static", () => {


        describe("fromParts()", () => {


            it("throws when the denominator is zero", () => {
                expect(() => {
                    Fraction.fromParts(1, 2, 0);
                }).toThrow();
            });


            it("throws when any of the values is a non-integer", () => {
                expect(() => { Fraction.fromParts(1.1, 2,   3  ); }).toThrow();
                expect(() => { Fraction.fromParts(1,   2.1, 3  ); }).toThrow();
                expect(() => { Fraction.fromParts(1,   2,   3.1); }).toThrow();
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


        describe("fromString()", () => {

            it("throws when given an invalid string", () => {
                expect(() => { Fraction.fromString("abc"); }).toThrow();
                expect(() => { Fraction.fromString("1  2"); }).toThrow();
                expect(() => { Fraction.fromString("1  2/3"); }).toThrow();  // too many spaces
                // Must use whole numbers
                expect(() => { Fraction.fromString("1.2 2/3"); }).toThrow();
                expect(() => { Fraction.fromString("1 2.1/3"); }).toThrow();
                expect(() => { Fraction.fromString("1 2/3.1"); }).toThrow();

            });


            it("returns the expected value", () => {
                expect(Fraction.fromString("0").parts).toEqual({whole: 0, num: 0, den: 1});
                expect(Fraction.fromString("3/4").parts).toEqual({whole: 0, num: 3, den: 4});
                expect(Fraction.fromString("2 3/4").parts).toEqual({whole: 2, num: 3, den: 4});
                expect(Fraction.fromString("10/4").parts).toEqual({whole: 0, num: 10, den: 4});
            });


            it("accepts negative values", () => {
                expect(Fraction.fromString("-3/4").parts).toEqual({whole: 0, num: 0, den: 1});
                expect(Fraction.fromString("-1 3/4").parts).toEqual({whole: 0, num: 0, den: 1});
            });

        });


    });


    describe("instance", () => {


        describe("isProper property", () => {


            it("returns true when the fraction is proper", () => {
                expect(Fraction.fromParts(1, 1, 2).isProper).toEqual(true);
                expect(Fraction.fromParts(1, 2).isProper).toEqual(true);
            });


            it("returns false when the fraction is not proper", () => {
                expect(Fraction.fromParts(4, 4).isProper).toEqual(false);
                expect(Fraction.fromParts(1, 3, 2).isProper).toEqual(false);
                expect(Fraction.fromParts(3, 2).isProper).toEqual(false);
            });


        });


        describe("isImproper property", () => {


            it("returns true when the fraction is not proper", () => {
                expect(Fraction.fromParts(4, 4).isImproper).toEqual(true);
                expect(Fraction.fromParts(1, 3, 2).isImproper).toEqual(true);
                expect(Fraction.fromParts(3, 2).isImproper).toEqual(true);
            });


            it("returns false when the fraction is proper", () => {
                expect(Fraction.fromParts(1, 1, 2).isImproper).toEqual(false);
                expect(Fraction.fromParts(1, 2).isImproper).toEqual(false);
            });


        });


        describe("toString()", () => {


            it("returns '0' when there is no whole part and no fractional part", () => {
                expect(Fraction.fromParts(0, 0, 1).toString()).toEqual("0");
            });


            it("returns the expected string", () => {
                expect(Fraction.fromParts(3).toString()).toEqual("3");
                expect(Fraction.fromParts(3, 2).toString()).toEqual("3/2");
                expect(Fraction.fromParts(1, 3, 2).toString()).toEqual("1 3/2");
            });


        });


        describe("reduce()", () => {


            it("returns an identical value when it cannot be reduced", () => {
                expect(Fraction.fromParts(3, 4).reduce().parts).toEqual({whole: 0, num: 3, den: 4});
            });


            it("returns a reduced value", () => {
                expect(Fraction.fromParts(4, 4).reduce().parts).toEqual({whole: 0, num: 1, den: 1});
                expect(Fraction.fromParts(6, 4).reduce().parts).toEqual({whole: 0, num: 3, den: 2});
                expect(Fraction.fromParts(6, 8).reduce().parts).toEqual({whole: 0, num: 3, den: 4});
            });


        });


        describe("makeProper()", () => {


            it("returns an identical value when it is already proper", () => {
                expect(Fraction.fromParts(1, 7, 8).makeProper().parts).toEqual({whole: 1, num: 7, den: 8});
            });


            it("returns the proper form", () => {
                expect(Fraction.fromParts(10, 8).makeProper().parts).toEqual({whole: 1, num: 2, den: 8});
            });


        });


        describe("makeImproper()", () => {


            it("returns an identical fraction when it cannot be made improper", () => {
                expect(Fraction.fromParts(8, 10).makeImproper().parts).toEqual({whole: 0, num: 8, den: 10});
            });


            it("returns the expected improper form", () => {
                expect(Fraction.fromParts(1, 2, 8).makeImproper().parts).toEqual({whole: 0, num: 10, den: 8});
            });


        });


        describe("simplify()", () => {


            it("returns an identical fraction when it is already simplified", () => {
                expect(Fraction.fromParts(1, 3, 4).simplify().parts).toEqual({whole: 1, num: 3, den: 4});
                expect(Fraction.fromParts(7, 8).simplify().parts).toEqual({whole: 0, num: 7, den: 8});
            });


            it("returns the expected simplified form", () => {
                expect(Fraction.fromParts(6, 8).simplify().parts).toEqual({whole: 0, num: 3, den: 4});
                expect(Fraction.fromParts(9, 8).simplify().parts).toEqual({whole: 1, num: 1, den: 8});
                expect(Fraction.fromParts(10, 8).simplify().parts).toEqual({whole: 1, num: 1, den: 4});
            });


        });


        describe("add()", () => {


            it("can add two fractions that have the same denominator", () => {
                expect(Fraction.fromString("1/8").add(Fraction.fromString("1/8")).toString()).toEqual("2/8");
                expect(Fraction.fromString("1 1/8").add(Fraction.fromString("2 1/8")).toString()).toEqual("3 2/8");
            });


            it("can add two fractions that have the different denominators", () => {
                expect(Fraction.fromString("1/8").add(Fraction.fromString("1/4")).toString()).toEqual("3/8");
                expect(Fraction.fromString("2 1/8").add(Fraction.fromString("1 1/4")).toString()).toEqual("3 3/8");
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
