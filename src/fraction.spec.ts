import {Fraction, greatestCommonDivisor, leastCommonMultiple} from "./fraction";


describe("Fraction", () => {


    describe("static", () => {


        describe("fromParts()", () => {


            it("throws when any of the values is a non-integer", () => {
                expect(() => { Fraction.fromParts(1.1, 2,   3  ); }).toThrow();
                expect(() => { Fraction.fromParts(1,   2.1, 3  ); }).toThrow();
                expect(() => { Fraction.fromParts(1,   2,   3.1); }).toThrow();
            });


            it("throws when the denominator is zero", () => {
                expect(() => {
                    Fraction.fromParts(1, 2, 0);
                }).toThrow();
            });


            it("throws when the denominator is negative", () => {
                expect(() => {
                    Fraction.fromParts(1, 1, -2);
                }).toThrow();

                expect(() => {
                    Fraction.fromParts(1, -2);
                }).toThrow();
            });


            it("throws when a whole part is specified and the numerator is negative", () => {
                expect(() => {
                    Fraction.fromParts(1, -1, 2);
                }).toThrow();

                expect(() => {
                    Fraction.fromParts(-1, -1, 2);
                }).toThrow();

            });


            it("creates the expected value when given 1 number", () => {
                expect(Fraction.fromParts(3).toString()).toEqual("3");
                expect(Fraction.fromParts(0).toString()).toEqual("0");
                expect(Fraction.fromParts(-3).toString()).toEqual("-3");
            });


            it("creates the expected value when given 2 numbers", () => {
                expect(Fraction.fromParts(3, 2).toString()).toEqual("1 1/2");
                expect(Fraction.fromParts(48, 32).toString()).toEqual("1 16/32");
                expect(Fraction.fromParts(0, 2).toString()).toEqual("0");
                expect(Fraction.fromParts(-1, 2).toString()).toEqual("-1/2");
            });


            it("creates the expected value when given 3 numbers", () => {
                expect(Fraction.fromParts(4, 3, 2).toString()).toEqual("5 1/2");
                expect(Fraction.fromParts(4, 2, 2).toString()).toEqual("5");
                expect(Fraction.fromParts(4, 12, 8).toString()).toEqual("5 4/8");

                expect(Fraction.fromParts(0, 3, 2).toString()).toEqual("1 1/2");
                expect(Fraction.fromParts(0, 1, 2).toString()).toEqual("1/2");

                expect(Fraction.fromParts(0, -3, 2).toString()).toEqual("-1 1/2");
                expect(Fraction.fromParts(0, -1, 2).toString()).toEqual("-1/2");

                expect(Fraction.fromParts(-1, 1, 2).toString()).toEqual("-1 1/2");
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
                expect(Fraction.fromString("0").toString()).toEqual("0");
                expect(Fraction.fromString("3").toString()).toEqual("3");
                expect(Fraction.fromString("-3").toString()).toEqual("-3");

                expect(Fraction.fromString("3/2").toString()).toEqual("1 1/2");
                expect(Fraction.fromString("1/2").toString()).toEqual("1/2");
                expect(Fraction.fromString("0/2").toString()).toEqual("0");
                expect(Fraction.fromString("-1/2").toString()).toEqual("-1/2");
                expect(Fraction.fromString("-3/2").toString()).toEqual("-1 1/2");

                expect(Fraction.fromString("3 3/2").toString()).toEqual("4 1/2");
                expect(Fraction.fromString("3 1/2").toString()).toEqual("3 1/2");
                expect(Fraction.fromString("0 3/2").toString()).toEqual("1 1/2");
                expect(Fraction.fromString("0 1/2").toString()).toEqual("1/2");
                expect(Fraction.fromString("-3 1/2").toString()).toEqual("-3 1/2");
                expect(Fraction.fromString("-3 3/2").toString()).toEqual("-4 1/2");
            });





        });


        describe("fromNumber()", () => {


            it("returns the expected value", () => {
                expect(Fraction.fromNumber(0).toString()).toEqual("0");
                expect(Fraction.fromNumber(1).toString()).toEqual("1");
                expect(Fraction.fromNumber(-1).toString()).toEqual("-1");
                expect(Fraction.fromNumber(2).toString()).toEqual("2");
                expect(Fraction.fromNumber(-2).toString()).toEqual("-2");
                expect(Fraction.fromNumber(2.5).toString()).toEqual("2 5/10");
                expect(Fraction.fromNumber(-2.5).toString()).toEqual("-2 5/10");
                expect(Fraction.fromNumber(2.1234).toString()).toEqual("2 1234/10000");
                expect(Fraction.fromNumber(-2.1234).toString()).toEqual("-2 1234/10000");
            });


        });


        describe("compare()", () => {


            it("will return the expected result", () => {
                expect(Fraction.compare(Fraction.fromParts(0), Fraction.fromParts(0))).toEqual(0);
                expect(Fraction.compare(Fraction.fromParts(-0), Fraction.fromParts(0))).toEqual(0);
                expect(Fraction.compare(Fraction.fromParts(0), Fraction.fromParts(-0))).toEqual(0);

                expect(Fraction.compare(Fraction.fromParts(3), Fraction.fromParts(3))).toEqual(0);

                expect(Fraction.compare(Fraction.fromParts(-3), Fraction.fromParts(-3))).toEqual(0);

                expect(Fraction.compare(Fraction.fromParts(0), Fraction.fromParts(1))).toEqual(-1);
                expect(Fraction.compare(Fraction.fromParts(1), Fraction.fromParts(0))).toEqual(1);

                expect(Fraction.compare(Fraction.fromParts(0), Fraction.fromParts(-1))).toEqual(1);
                expect(Fraction.compare(Fraction.fromParts(-1), Fraction.fromParts(0))).toEqual(-1);

                expect(Fraction.compare(Fraction.fromParts(-2), Fraction.fromParts(1))).toEqual(-1);
                expect(Fraction.compare(Fraction.fromParts(1), Fraction.fromParts(-2))).toEqual(1);

                expect(Fraction.compare(Fraction.fromParts(2, 3), Fraction.fromParts(3, 4))).toEqual(-1);
                expect(Fraction.compare(Fraction.fromParts(3, 4), Fraction.fromParts(2, 3))).toEqual(1);

                expect(Fraction.compare(Fraction.fromParts(-2, 3), Fraction.fromParts(-3, 4))).toEqual(1);
                expect(Fraction.compare(Fraction.fromParts(-3, 4), Fraction.fromParts(-2, 3))).toEqual(-1);
            });


            it("will compare Fractions and numbers", () => {
                expect(Fraction.compare(Fraction.fromString("1 1/16"), 1)).toEqual(1);
                expect(Fraction.compare(1, Fraction.fromString("1 1/16"))).toEqual(-1);
            });


        });


    });


    describe("instance", () => {


        describe("toString()", () => {


            it("returns '0' when there is no whole part and no fractional part", () => {
                expect(Fraction.fromParts(0, 0, 1).toString()).toEqual("0");
            });


            it("returns the expected string", () => {
                expect(Fraction.fromParts(3).toString()).toEqual("3");
                expect(Fraction.fromParts(3, 2).toString()).toEqual("1 1/2");
                expect(Fraction.fromParts(1, 3, 2).toString()).toEqual("2 1/2");
            });


            it("returns the expected value when asking for improper string", () => {
                expect(Fraction.fromString("0").toString(true)).toEqual("0");
                expect(Fraction.fromString("3").toString(true)).toEqual("3/1");
                expect(Fraction.fromString("-3").toString(true)).toEqual("-3/1");

                expect(Fraction.fromString("3/2").toString(true)).toEqual("3/2");
                expect(Fraction.fromString("1/2").toString(true)).toEqual("1/2");
                expect(Fraction.fromString("0/2").toString(true)).toEqual("0");
                expect(Fraction.fromString("-1/2").toString(true)).toEqual("-1/2");
                expect(Fraction.fromString("-3/2").toString(true)).toEqual("-3/2");

                expect(Fraction.fromString("3 3/2").toString(true)).toEqual("9/2");
                expect(Fraction.fromString("3 1/2").toString(true)).toEqual("7/2");
                expect(Fraction.fromString("0 3/2").toString(true)).toEqual("3/2");
                expect(Fraction.fromString("0 1/2").toString(true)).toEqual("1/2");
                expect(Fraction.fromString("-3 1/2").toString(true)).toEqual("-7/2");
                expect(Fraction.fromString("-3 3/2").toString(true)).toEqual("-9/2");
            });


        });


        describe("wholePart()", () => {


            it("will return the expected value", () => {
                expect(Fraction.fromParts(0).wholePart()).toEqual(0);

                expect(Fraction.fromParts(3).wholePart()).toEqual(3);
                expect(Fraction.fromParts(1, 2).wholePart()).toEqual(0);
                expect(Fraction.fromParts(3, 1, 2).wholePart()).toEqual(3);

                expect(Fraction.fromParts(-3).wholePart()).toEqual(-3);
                expect(Fraction.fromParts(-1, 2).wholePart()).toEqual(0);
                expect(Fraction.fromParts(-3, 1, 2).wholePart()).toEqual(-3);
            });


        });


        describe("fractionalPart()", () => {


            it("will return the expected value", () => {
                expect(Fraction.fromParts(0).fractionalPart().toString()).toEqual("0");
                expect(Fraction.fromParts(-0).fractionalPart().toString()).toEqual("0");
                expect(Fraction.fromParts(3).fractionalPart().toString()).toEqual("0");
                expect(Fraction.fromParts(-3).fractionalPart().toString()).toEqual("0");

                expect(Fraction.fromParts(3, 2).fractionalPart().toString()).toEqual("1/2");
                expect(Fraction.fromParts(1, 2).fractionalPart().toString()).toEqual("1/2");
                expect(Fraction.fromParts(4, 8).fractionalPart().toString()).toEqual("4/8");

                expect(Fraction.fromParts(-3, 2).fractionalPart().toString()).toEqual("-1/2");
                expect(Fraction.fromParts(-1, 2).fractionalPart().toString()).toEqual("-1/2");
                expect(Fraction.fromParts(-4, 8).fractionalPart().toString()).toEqual("-4/8");
            });


        });


        describe("setDenominator()", () => {


            it("throws when the denominator specified is 0", () => {
                expect(() => {
                    Fraction.fromParts(9, 10).changeDenominator(0);
                }).toThrow();
            });


            it("throws when the denominator specified is negative", () => {
                expect(() => {
                    Fraction.fromParts(9, 10).changeDenominator(-10);
                }).toThrow();
            });


            it("throws when the denominator specified is not an integer", () => {
                expect(() => {
                    Fraction.fromParts(9, 10).changeDenominator(1.2);
                }).toThrow();
            });


            it("throws when a denominator is specified that the fraction cannot scale to", () => {
                expect(() => {
                    Fraction.fromParts(9, 10).changeDenominator(11);
                }).toThrow();
            });


            it("Results in the expected value", () => {
                expect(Fraction.fromParts(0, 8).changeDenominator(4).toString()).toEqual("0");
                expect(Fraction.fromParts(-0, 8).changeDenominator(4).toString()).toEqual("0");

                expect(Fraction.fromParts(4, 8).changeDenominator(4).toString()).toEqual("2/4");
                expect(Fraction.fromParts(4, 8).changeDenominator(2).toString()).toEqual("1/2");
                expect(Fraction.fromParts(4, 8).changeDenominator(16).toString()).toEqual("8/16");
                expect(Fraction.fromParts(4, 8).changeDenominator(32).toString()).toEqual("16/32");

                expect(Fraction.fromParts(-4, 8).changeDenominator(4).toString()).toEqual("-2/4");
                expect(Fraction.fromParts(-4, 8).changeDenominator(2).toString()).toEqual("-1/2");
                expect(Fraction.fromParts(-4, 8).changeDenominator(16).toString()).toEqual("-8/16");
                expect(Fraction.fromParts(-4, 8).changeDenominator(32).toString()).toEqual("-16/32");
            });


        });


        describe("reduce()", () => {


            it("returns an identical value when it cannot be reduced", () => {
                expect(Fraction.fromParts(3, 4).reduce().toString()).toEqual("3/4");
            });


            it("returns a reduced value", () => {
                expect(Fraction.fromParts(4, 4).reduce().toString()).toEqual("1");
                expect(Fraction.fromParts(6, 4).reduce().toString()).toEqual("1 1/2");
                expect(Fraction.fromParts(6, 8).reduce().toString()).toEqual("3/4");
                expect(Fraction.fromParts(14, 8).reduce().toString()).toEqual("1 3/4");
                expect(Fraction.fromParts(-14, 8).reduce().toString()).toEqual("-1 3/4");
                expect(Fraction.fromParts(0, 8).reduce().toString()).toEqual("0");
                expect(Fraction.fromParts(-0, 8).reduce().toString()).toEqual("0");
            });


        });


        describe("equals()", () => {


            it("returns true when the values are equal", () => {
                expect(Fraction.fromParts(0, 1).equals(0)).toEqual(true);
                expect(Fraction.fromParts(0, 1).equals(Fraction.fromParts(0, 3))).toEqual(true);

                expect(Fraction.fromParts(1, 1, 2).equals(1.5)).toEqual(true);
                expect(Fraction.fromParts(1, 1, 2).equals(Fraction.fromParts(1, 2, 4))).toEqual(true);

                expect(Fraction.fromParts(-1, 1, 2).equals(-1.5)).toEqual(true);
                expect(Fraction.fromParts(-1, 1, 2).equals(Fraction.fromParts(-1, 2, 4))).toEqual(true);
            });


            it("returns false when the values are not equal", () => {
                expect(Fraction.fromParts(0, 1).equals(1)).toEqual(false);
                expect(Fraction.fromParts(0, 1).equals(Fraction.fromParts(2, 2))).toEqual(false);

                expect(Fraction.fromParts(1, 1).equals(-1)).toEqual(false);
                expect(Fraction.fromParts(1, 1).equals(Fraction.fromParts(-2, 2))).toEqual(false);
            });


        });


        describe("isLessThan()", () => {


            it("returns true when this value is less", () => {
                expect(Fraction.fromParts(0, 1).isLessThan(1.5)).toEqual(true);
                expect(Fraction.fromParts(0, 1).isLessThan(Fraction.fromParts(1, 1, 2))).toEqual(true);

                expect(Fraction.fromParts(1, 1).isLessThan(1.5)).toEqual(true);
                expect(Fraction.fromParts(1, 1).isLessThan(Fraction.fromParts(1, 1, 2))).toEqual(true);

                expect(Fraction.fromParts(-1, 1).isLessThan(0)).toEqual(true);
                expect(Fraction.fromParts(-1, 1).isLessThan(Fraction.fromParts(0, 2))).toEqual(true);
            });


            it("returns false when this value is greater", () => {
                expect(Fraction.fromParts(0, 1).isLessThan(-0.5)).toEqual(false);
                expect(Fraction.fromParts(0, 1).isLessThan(Fraction.fromParts(-1, 2))).toEqual(false);

                expect(Fraction.fromParts(1).isLessThan(0)).toEqual(false);
                expect(Fraction.fromParts(1, 1).isLessThan(Fraction.fromParts(0, 2))).toEqual(false);
            });


        });


        describe("isGreaterThan()", () => {


            it("returns true when this value is greater", () => {
                expect(Fraction.fromParts(0, 1).isGreaterThan(-1.5)).toEqual(true);
                expect(Fraction.fromParts(0, 1).isGreaterThan(Fraction.fromParts(-1, 1, 2))).toEqual(true);

                expect(Fraction.fromParts(1, 1).isGreaterThan(0)).toEqual(true);
                expect(Fraction.fromParts(1, 1).isGreaterThan(Fraction.fromParts(0, 2))).toEqual(true);

                expect(Fraction.fromParts(-1, 1).isGreaterThan(-2)).toEqual(true);
                expect(Fraction.fromParts(-1, 1).isGreaterThan(Fraction.fromParts(-4, 2))).toEqual(true);
            });


            it("returns false when this value is less", () => {
                expect(Fraction.fromParts(0, 1).isGreaterThan(0.5)).toEqual(false);
                expect(Fraction.fromParts(0, 1).isGreaterThan(Fraction.fromParts(1, 2))).toEqual(false);

                expect(Fraction.fromParts(-1).isGreaterThan(0)).toEqual(false);
                expect(Fraction.fromParts(-1, 1).isGreaterThan(Fraction.fromParts(0, 2))).toEqual(false);
            });


        });


        describe("add()", () => {


            it("returns the expected value", () => {
                expect(Fraction.fromString("0").add(Fraction.fromString("0")).toString()).toEqual("0");
                expect(Fraction.fromString("0").add(Fraction.fromString("1/4")).toString()).toEqual("1/4");
                expect(Fraction.fromString("1/4").add(Fraction.fromString("0")).toString()).toEqual("1/4");

                expect(Fraction.fromString("1/4").add(Fraction.fromString("1/4")).toString()).toEqual("2/4");
                expect(Fraction.fromString("1/4").add(Fraction.fromString("-1/4")).toString()).toEqual("0");
                expect(Fraction.fromString("1/4").add(Fraction.fromString("-1/8")).toString()).toEqual("1/8");
                expect(Fraction.fromString("1/8").add(Fraction.fromString("-1/4")).toString()).toEqual("-1/8");

                expect(Fraction.fromString("-1/8").add(Fraction.fromString("-1/4")).toString()).toEqual("-3/8");
            });


        });


        describe("subtract()", () => {


            it("returns the expected value", () => {
                expect(Fraction.fromString("0").subtract(Fraction.fromString("0")).toString()).toEqual("0");
                expect(Fraction.fromString("0").subtract(Fraction.fromString("1/4")).toString()).toEqual("-1/4");
                expect(Fraction.fromString("1/4").subtract(Fraction.fromString("0")).toString()).toEqual("1/4");


                expect(Fraction.fromString("1/4").subtract(Fraction.fromString("1/4")).toString()).toEqual("0");
                expect(Fraction.fromString("1/4").subtract(Fraction.fromString("-1/4")).toString()).toEqual("2/4");
                expect(Fraction.fromString("1/4").subtract(Fraction.fromString("-1/8")).toString()).toEqual("3/8");
                expect(Fraction.fromString("1/8").subtract(Fraction.fromString("-1/4")).toString()).toEqual("3/8");

                expect(Fraction.fromString("-1/8").subtract(Fraction.fromString("-1/4")).toString()).toEqual("1/8");
            });


        });


        describe("multiply()", () => {


            it("returns the expected value", () => {
                expect(Fraction.fromString("0").multiply(Fraction.fromString("0")).toString()).toEqual("0");
                expect(Fraction.fromString("1").multiply(Fraction.fromString("0")).toString()).toEqual("0");
                expect(Fraction.fromString("0").multiply(Fraction.fromString("1")).toString()).toEqual("0");

                expect(Fraction.fromString("1/2").multiply(Fraction.fromString("1/2")).toString()).toEqual("1/4");
                expect(Fraction.fromString("-1/2").multiply(Fraction.fromString("1/2")).toString()).toEqual("-1/4");
                expect(Fraction.fromString("1/2").multiply(Fraction.fromString("-1/2")).toString()).toEqual("-1/4");
                expect(Fraction.fromString("-1/2").multiply(Fraction.fromString("-1/2")).toString()).toEqual("1/4");

                // The answer should be reduced.
                expect(Fraction.fromString("4/8").multiply(Fraction.fromString("2/12")).toString()).toEqual("1/12");
            });


        });


        describe("divide()", () => {


            it("will throw when asked to divide by zero", () => {
                expect(() => {
                    Fraction.fromString("3/4").divide(Fraction.fromString("0/1"));
                }).toThrow();

                expect(() => {
                    Fraction.fromString("3/4").divide(0);
                }).toThrow();
            });


            it("returns the expected value", () => {
                expect(Fraction.fromString("0/1").divide(Fraction.fromString("1/1")).toString()).toEqual("0");
                expect(Fraction.fromString("1/1").divide(Fraction.fromString("1/2")).toString()).toEqual("2");
                expect(Fraction.fromString("-1/1").divide(Fraction.fromString("1/2")).toString()).toEqual("-2");
                expect(Fraction.fromString("1/1").divide(Fraction.fromString("-1/2")).toString()).toEqual("-2");

                // TODO: Repeat the above tests with an integer divisor.
                expect(Fraction.fromString("0/1").divide(1).toString()).toEqual("0");
                expect(Fraction.fromString("1").divide(2).toString()).toEqual("1/2");
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
