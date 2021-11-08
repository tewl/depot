import { failed } from ".";
import {Fraction, greatestCommonDivisor, leastCommonMultiple} from "./fraction";


describe("Fraction", () => {


    describe("static", () => {


        describe("fromParts()", () => {


            it("fails when any of the values is a non-integer", () => {
                expect(failed(Fraction.fromParts(1.1, 2,   3  ))).toBeTrue();
                expect(failed(Fraction.fromParts(1,   2.1, 3  ))).toBeTrue();
                expect(failed(Fraction.fromParts(1,   2,   3.1))).toBeTrue();
            });


            it("fails when the denominator is zero", () => {
                expect(failed(Fraction.fromParts(1, 2, 0))).toBeTrue();
            });


            it("fails when the denominator is negative", () => {
                expect(failed(Fraction.fromParts(1, 1, -2))).toBeTrue();
                expect(failed(Fraction.fromParts(1, -2))).toBeTrue();
            });


            it("fails when a whole part is specified and the numerator is negative", () => {
                expect(failed(Fraction.fromParts(1, -1, 2))).toBeTrue();
                expect(failed(Fraction.fromParts(-1, -1, 2))).toBeTrue();
            });


            it("creates the expected value when given 1 number", () => {
                expect(Fraction.fromParts(3).value!.toString()).toEqual("3");
                expect(Fraction.fromParts(0).value!.toString()).toEqual("0");
                expect(Fraction.fromParts(-3).value!.toString()).toEqual("-3");
            });


            it("creates the expected value when given 2 numbers", () => {
                expect(Fraction.fromParts(3, 2).value!.toString()).toEqual("1 1/2");
                expect(Fraction.fromParts(48, 32).value!.toString()).toEqual("1 16/32");
                expect(Fraction.fromParts(0, 2).value!.toString()).toEqual("0");
                expect(Fraction.fromParts(-1, 2).value!.toString()).toEqual("-1/2");
            });


            it("creates the expected value when given 3 numbers", () => {
                expect(Fraction.fromParts(4, 3, 2).value!.toString()).toEqual("5 1/2");
                expect(Fraction.fromParts(4, 2, 2).value!.toString()).toEqual("5");
                expect(Fraction.fromParts(4, 12, 8).value!.toString()).toEqual("5 4/8");

                expect(Fraction.fromParts(0, 3, 2).value!.toString()).toEqual("1 1/2");
                expect(Fraction.fromParts(0, 1, 2).value!.toString()).toEqual("1/2");

                expect(Fraction.fromParts(0, -3, 2).value!.toString()).toEqual("-1 1/2");
                expect(Fraction.fromParts(0, -1, 2).value!.toString()).toEqual("-1/2");

                expect(Fraction.fromParts(-1, 1, 2).value!.toString()).toEqual("-1 1/2");
            });

        });


        describe("fromString()", () => {

            it("fails when given an invalid string", () => {
                expect(failed(Fraction.fromString("abc"))).toBeTrue();
                expect(failed(Fraction.fromString("1  2"))).toBeTrue();
                expect(failed(Fraction.fromString("1  2/3"))).toBeTrue();  // too many spaces

                // Must use whole numbers
                expect(failed(Fraction.fromString("1.2 2/3"))).toBeTrue();
                expect(failed(Fraction.fromString("1 2.1/3"))).toBeTrue();
                expect(failed(Fraction.fromString("1 2/3.1"))).toBeTrue();

            });


            it("returns the expected value", () => {
                expect(Fraction.fromString("0").value!.toString()).toEqual("0");
                expect(Fraction.fromString("3").value!.toString()).toEqual("3");
                expect(Fraction.fromString("-3").value!.toString()).toEqual("-3");

                expect(Fraction.fromString("3/2").value!.toString()).toEqual("1 1/2");
                expect(Fraction.fromString("1/2").value!.toString()).toEqual("1/2");
                expect(Fraction.fromString("0/2").value!.toString()).toEqual("0");
                expect(Fraction.fromString("-1/2").value!.toString()).toEqual("-1/2");
                expect(Fraction.fromString("-3/2").value!.toString()).toEqual("-1 1/2");

                expect(Fraction.fromString("3 3/2").value!.toString()).toEqual("4 1/2");
                expect(Fraction.fromString("3 1/2").value!.toString()).toEqual("3 1/2");
                expect(Fraction.fromString("0 3/2").value!.toString()).toEqual("1 1/2");
                expect(Fraction.fromString("0 1/2").value!.toString()).toEqual("1/2");
                expect(Fraction.fromString("-3 1/2").value!.toString()).toEqual("-3 1/2");
                expect(Fraction.fromString("-3 3/2").value!.toString()).toEqual("-4 1/2");
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
                expect(Fraction.compare(Fraction.fromParts(0).value!,
                                        Fraction.fromParts(0).value!)).toEqual(0);
                expect(Fraction.compare(Fraction.fromParts(-0).value!,
                                        Fraction.fromParts(0).value!)).toEqual(0);
                expect(Fraction.compare(Fraction.fromParts(0).value!,
                                        Fraction.fromParts(-0).value!)).toEqual(0);

                expect(Fraction.compare(Fraction.fromParts(3).value!,
                                        Fraction.fromParts(3).value!)).toEqual(0);

                expect(Fraction.compare(Fraction.fromParts(-3).value!,
                                        Fraction.fromParts(-3).value!)).toEqual(0);

                expect(Fraction.compare(Fraction.fromParts(0).value!,
                                        Fraction.fromParts(1).value!)).toEqual(-1);
                expect(Fraction.compare(Fraction.fromParts(1).value!,
                                        Fraction.fromParts(0).value!)).toEqual(1);

                expect(Fraction.compare(Fraction.fromParts(0).value!,
                                        Fraction.fromParts(-1).value!)).toEqual(1);
                expect(Fraction.compare(Fraction.fromParts(-1).value!,
                                        Fraction.fromParts(0).value!)).toEqual(-1);

                expect(Fraction.compare(Fraction.fromParts(-2).value!,
                                        Fraction.fromParts(1).value!)).toEqual(-1);
                expect(Fraction.compare(Fraction.fromParts(1).value!,
                                        Fraction.fromParts(-2).value!)).toEqual(1);

                expect(Fraction.compare(Fraction.fromParts(2, 3).value!,
                                        Fraction.fromParts(3, 4).value!)).toEqual(-1);
                expect(Fraction.compare(Fraction.fromParts(3, 4).value!,
                                        Fraction.fromParts(2, 3).value!)).toEqual(1);

                expect(Fraction.compare(Fraction.fromParts(-2, 3).value!,
                                        Fraction.fromParts(-3, 4).value!)).toEqual(1);
                expect(Fraction.compare(Fraction.fromParts(-3, 4).value!,
                                        Fraction.fromParts(-2, 3).value!)).toEqual(-1);
            });


            it("will compare Fractions and numbers", () => {
                expect(Fraction.compare(Fraction.fromString("1 1/16").value!, 1)).toEqual(1);
                expect(Fraction.compare(1, Fraction.fromString("1 1/16").value!)).toEqual(-1);
            });


        });


    });


    describe("instance", () => {


        describe("toString()", () => {


            it("returns '0' when there is no whole part and no fractional part", () => {
                expect(Fraction.fromParts(0, 0, 1).value!.toString()).toEqual("0");
            });


            it("returns the expected string", () => {
                expect(Fraction.fromParts(3).value!.toString()).toEqual("3");
                expect(Fraction.fromParts(3, 2).value!.toString()).toEqual("1 1/2");
                expect(Fraction.fromParts(1, 3, 2).value!.toString()).toEqual("2 1/2");
                expect(Fraction.fromParts(-1, 4).value!.toString()).toEqual("-1/4");
            });


            it("returns the expected value when asking for improper string", () => {
                expect(Fraction.fromString("0").value!.toString(true)).toEqual("0");
                expect(Fraction.fromString("3").value!.toString(true)).toEqual("3/1");
                expect(Fraction.fromString("-3").value!.toString(true)).toEqual("-3/1");

                expect(Fraction.fromString("3/2").value!.toString(true)).toEqual("3/2");
                expect(Fraction.fromString("1/2").value!.toString(true)).toEqual("1/2");
                expect(Fraction.fromString("0/2").value!.toString(true)).toEqual("0");
                expect(Fraction.fromString("-1/2").value!.toString(true)).toEqual("-1/2");
                expect(Fraction.fromString("-3/2").value!.toString(true)).toEqual("-3/2");

                expect(Fraction.fromString("3 3/2").value!.toString(true)).toEqual("9/2");
                expect(Fraction.fromString("3 1/2").value!.toString(true)).toEqual("7/2");
                expect(Fraction.fromString("0 3/2").value!.toString(true)).toEqual("3/2");
                expect(Fraction.fromString("0 1/2").value!.toString(true)).toEqual("1/2");
                expect(Fraction.fromString("-3 1/2").value!.toString(true)).toEqual("-7/2");
                expect(Fraction.fromString("-3 3/2").value!.toString(true)).toEqual("-9/2");
            });


        });


        describe("stringRepresentations()", () =>
        {

            it("returns a single string when it cannot be reduced and is not improper", () =>
            {
                const frac = Fraction.fromParts(5, 8).value!;
                const representations = frac.stringRepresentations();
                expect(representations).toEqual(["5/8"]);
            });


            it("returns two strings when it can be reduced and is not improper", () =>
            {
                const frac = Fraction.fromParts(4, 8).value!;
                const representations = frac.stringRepresentations();
                expect(representations).toEqual(["4/8", "1/2"]);
            });


            it("returns two string when it cannot be reduced and is improper", () =>
            {
                const frac = Fraction.fromParts(12, 8).value!;
                const representations = frac.stringRepresentations();
                expect(representations).toEqual(["12/8", "3/2", "1 1/2"]);
            });


            it("returns three strings when it can be reduced and is improper", () =>
            {
                const frac = Fraction.fromParts(28, 26).value!;
                const representations = frac.stringRepresentations();
                expect(representations).toEqual(["28/26", "14/13", "1 1/13"]);
            });


        });


        describe("isImproper()", () =>
        {

            it("returns true when the numerator is greater than the denominator", () =>
            {
                expect(Fraction.fromParts(4, 3).value!.isImproper()).toBeTrue();
            });


            it("returns false when the numerator equals the denominator", () =>
            {
                expect(Fraction.fromParts(5, 5).value!.isImproper()).toBeFalse();
            });


            it("returns false when the numerator is less than the denominator", () =>
            {
                expect(Fraction.fromParts(5, 6).value!.isImproper()).toBeFalse();
            });


            it("returns true when the numerator is a greater negative number than the denominator", () =>
            {
                expect(Fraction.fromParts(-7, 6).value!.isImproper()).toBeTrue();
            });


            it("returns false when the numerator is equal to the negative of the denominator", () =>
            {
                expect(Fraction.fromParts(-6, 6).value!.isImproper()).toBeFalse();
            });


            it("returns false when the numerator is a lesser negative number than the denominator", () =>
            {
                expect(Fraction.fromParts(-5, 6).value!.isImproper()).toBeFalse();
            });

        });


        describe("wholePart()", () => {


            it("will return the expected value", () => {
                expect(Fraction.fromParts(0).value!.wholePart()).toEqual(0);

                expect(Fraction.fromParts(3).value!.wholePart()).toEqual(3);
                expect(Fraction.fromParts(1, 2).value!.wholePart()).toEqual(0);
                expect(Fraction.fromParts(3, 1, 2).value!.wholePart()).toEqual(3);

                expect(Fraction.fromParts(-3).value!.wholePart()).toEqual(-3);
                expect(Fraction.fromParts(-1, 2).value!.wholePart()).toEqual(0);
                expect(Fraction.fromParts(-3, 1, 2).value!.wholePart()).toEqual(-3);
            });


        });


        describe("fractionalPart()", () => {


            it("will return the expected value", () => {
                expect(Fraction.fromParts(0).value!.fractionalPart().toString()).toEqual("0");
                expect(Fraction.fromParts(-0).value!.fractionalPart().toString()).toEqual("0");
                expect(Fraction.fromParts(3).value!.fractionalPart().toString()).toEqual("0");
                expect(Fraction.fromParts(-3).value!.fractionalPart().toString()).toEqual("0");

                expect(Fraction.fromParts(3, 2).value!.fractionalPart().toString()).toEqual("1/2");
                expect(Fraction.fromParts(1, 2).value!.fractionalPart().toString()).toEqual("1/2");
                expect(Fraction.fromParts(4, 8).value!.fractionalPart().toString()).toEqual("4/8");

                expect(Fraction.fromParts(-3, 2).value!.fractionalPart().toString()).toEqual("-1/2");
                expect(Fraction.fromParts(-1, 2).value!.fractionalPart().toString()).toEqual("-1/2");
                expect(Fraction.fromParts(-4, 8).value!.fractionalPart().toString()).toEqual("-4/8");
            });


        });


        describe("setDenominator()", () => {


            it("throws when the denominator specified is 0", () => {
                expect(() => {
                    Fraction.fromParts(9, 10).value!.changeDenominator(0);
                }).toThrow();
            });


            it("throws when the denominator specified is negative", () => {
                expect(() => {
                    Fraction.fromParts(9, 10).value!.changeDenominator(-10);
                }).toThrow();
            });


            it("throws when the denominator specified is not an integer", () => {
                expect(() => {
                    Fraction.fromParts(9, 10).value!.changeDenominator(1.2);
                }).toThrow();
            });


            it("throws when a denominator is specified that the fraction cannot scale to", () => {
                expect(() => {
                    Fraction.fromParts(9, 10).value!.changeDenominator(11);
                }).toThrow();
            });


            it("Results in the expected value", () => {
                expect(Fraction.fromParts(0, 8).value!.changeDenominator(4).toString()).toEqual("0");
                expect(Fraction.fromParts(-0, 8).value!.changeDenominator(4).toString()).toEqual("0");

                expect(Fraction.fromParts(4, 8).value!.changeDenominator(4).toString()).toEqual("2/4");
                expect(Fraction.fromParts(4, 8).value!.changeDenominator(2).toString()).toEqual("1/2");
                expect(Fraction.fromParts(4, 8).value!.changeDenominator(16).toString()).toEqual("8/16");
                expect(Fraction.fromParts(4, 8).value!.changeDenominator(32).toString()).toEqual("16/32");

                expect(Fraction.fromParts(-4, 8).value!.changeDenominator(4).toString()).toEqual("-2/4");
                expect(Fraction.fromParts(-4, 8).value!.changeDenominator(2).toString()).toEqual("-1/2");
                expect(Fraction.fromParts(-4, 8).value!.changeDenominator(16).toString()).toEqual("-8/16");
                expect(Fraction.fromParts(-4, 8).value!.changeDenominator(32).toString()).toEqual("-16/32");
            });


        });


        describe("reduce()", () => {


            it("returns an identical value when it cannot be reduced", () => {
                const result = Fraction.fromParts(3, 4).value!.reduce();
                expect(result.reducedFraction.toString()).toEqual("3/4");
                expect(result.wasReduced).toBeFalse();
            });


            it("returns a reduced value", () => {
                let result = Fraction.fromParts(4, 4).value!.reduce();
                expect(result.reducedFraction.toString()).toEqual("1");
                expect(result.wasReduced).toBeTrue();

                result = Fraction.fromParts(6, 4).value!.reduce();
                expect(result.reducedFraction.toString()).toEqual("1 1/2");
                expect(result.wasReduced).toBeTrue();

                result = Fraction.fromParts(6, 8).value!.reduce();
                expect(result.reducedFraction.toString()).toEqual("3/4");
                expect(result.wasReduced).toBeTrue();

                result = Fraction.fromParts(14, 8).value!.reduce();
                expect(result.reducedFraction.toString()).toEqual("1 3/4");
                expect(result.wasReduced).toBeTrue();

                result = Fraction.fromParts(-14, 8).value!.reduce();
                expect(result.reducedFraction.toString()).toEqual("-1 3/4");
                expect(result.wasReduced).toBeTrue();

                result = Fraction.fromParts(0, 8).value!.reduce();
                expect(result.reducedFraction.toString()).toEqual("0");
                expect(result.wasReduced).toBeTrue();

                result = Fraction.fromParts(-0, 8).value!.reduce();
                expect(result.reducedFraction.toString()).toEqual("0");
                expect(result.wasReduced).toBeTrue();
            });


        });


        describe("equals()", () => {


            it("returns true when the values are equal", () => {
                expect(Fraction.fromParts(0, 1).value!.equals(0)).toEqual(true);
                expect(Fraction.fromParts(0, 1).value!.equals(Fraction.fromParts(0, 3).value!)).toEqual(true);

                expect(Fraction.fromParts(1, 1, 2).value!.equals(1.5)).toEqual(true);
                expect(Fraction.fromParts(1, 1, 2).value!.equals(Fraction.fromParts(1, 2, 4).value!)).toEqual(true);

                expect(Fraction.fromParts(-1, 1, 2).value!.equals(-1.5)).toEqual(true);
                expect(Fraction.fromParts(-1, 1, 2).value!.equals(Fraction.fromParts(-1, 2, 4).value!)).toEqual(true);
            });


            it("returns false when the values are not equal", () => {
                expect(Fraction.fromParts(0, 1).value!.equals(1)).toEqual(false);
                expect(Fraction.fromParts(0, 1).value!.equals(Fraction.fromParts(2, 2).value!)).toEqual(false);

                expect(Fraction.fromParts(1, 1).value!.equals(-1)).toEqual(false);
                expect(Fraction.fromParts(1, 1).value!.equals(Fraction.fromParts(-2, 2).value!)).toEqual(false);
            });


        });


        describe("isLessThan()", () => {


            it("returns true when this value is less", () => {
                expect(Fraction.fromParts(0, 1).value!.isLessThan(1.5)).toEqual(true);
                expect(Fraction.fromParts(0, 1).value!.isLessThan(Fraction.fromParts(1, 1, 2).value!)).toEqual(true);

                expect(Fraction.fromParts(1, 1).value!.isLessThan(1.5)).toEqual(true);
                expect(Fraction.fromParts(1, 1).value!.isLessThan(Fraction.fromParts(1, 1, 2).value!)).toEqual(true);

                expect(Fraction.fromParts(-1, 1).value!.isLessThan(0)).toEqual(true);
                expect(Fraction.fromParts(-1, 1).value!.isLessThan(Fraction.fromParts(0, 2).value!)).toEqual(true);
            });


            it("returns false when this value is greater", () => {
                expect(Fraction.fromParts(0, 1).value!.isLessThan(-0.5)).toEqual(false);
                expect(Fraction.fromParts(0, 1).value!.isLessThan(Fraction.fromParts(-1, 2).value!)).toEqual(false);

                expect(Fraction.fromParts(1).value!.isLessThan(0)).toEqual(false);
                expect(Fraction.fromParts(1, 1).value!.isLessThan(Fraction.fromParts(0, 2).value!)).toEqual(false);
            });


        });


        describe("isGreaterThan()", () => {


            it("returns true when this value is greater", () => {
                expect(Fraction.fromParts(0, 1).value!.isGreaterThan(-1.5)).toEqual(true);
                expect(Fraction.fromParts(0, 1).value!.isGreaterThan(
                    Fraction.fromParts(-1, 1, 2).value!
                )).toEqual(true);

                expect(Fraction.fromParts(1, 1).value!.isGreaterThan(0)).toEqual(true);
                expect(Fraction.fromParts(1, 1).value!.isGreaterThan(Fraction.fromParts(0, 2).value!)).toEqual(true);

                expect(Fraction.fromParts(-1, 1).value!.isGreaterThan(-2)).toEqual(true);
                expect(Fraction.fromParts(-1, 1).value!.isGreaterThan(Fraction.fromParts(-4, 2).value!)).toEqual(true);
            });


            it("returns false when this value is less", () => {
                expect(Fraction.fromParts(0, 1).value!.isGreaterThan(0.5)).toEqual(false);
                expect(Fraction.fromParts(0, 1).value!.isGreaterThan(Fraction.fromParts(1, 2).value!)).toEqual(false);

                expect(Fraction.fromParts(-1).value!.isGreaterThan(0)).toEqual(false);
                expect(Fraction.fromParts(-1, 1).value!.isGreaterThan(Fraction.fromParts(0, 2).value!)).toEqual(false);
            });


        });


        describe("add()", () => {


            it("returns the expected value", () => {
                expect(Fraction.fromString("0").value!.add(Fraction.fromString("0").value!).toString()).toEqual("0");
                expect(Fraction.fromString("0").value!.add(Fraction.fromString("1/4").value!).toString()).toEqual("1/4");
                expect(Fraction.fromString("1/4").value!.add(Fraction.fromString("0").value!).toString()).toEqual("1/4");

                expect(Fraction.fromString("1/4").value!.add(Fraction.fromString("1/4").value!).toString()).toEqual("2/4");
                expect(Fraction.fromString("1/4").value!.add(Fraction.fromString("-1/4").value!).toString()).toEqual("0");
                expect(Fraction.fromString("1/4").value!.add(Fraction.fromString("-1/8").value!).toString()).toEqual("1/8");
                expect(Fraction.fromString("1/8").value!.add(Fraction.fromString("-1/4").value!).toString()).toEqual("-1/8");

                expect(Fraction.fromString("-1/8").value!.add(Fraction.fromString("-1/4").value!).toString()).toEqual("-3/8");
            });


        });


        describe("subtract()", () => {


            it("returns the expected value", () => {
                expect(Fraction.fromString("0").value!.subtract(Fraction.fromString("0").value!).toString()).toEqual("0");
                expect(Fraction.fromString("0").value!.subtract(Fraction.fromString("1/4").value!).toString()).toEqual("-1/4");
                expect(Fraction.fromString("1/4").value!.subtract(Fraction.fromString("0").value!).toString()).toEqual("1/4");


                expect(Fraction.fromString("1/4").value!.subtract(Fraction.fromString("1/4").value!).toString()).toEqual("0");
                expect(Fraction.fromString("1/4").value!.subtract(Fraction.fromString("-1/4").value!).toString()).toEqual("2/4");
                expect(Fraction.fromString("1/4").value!.subtract(Fraction.fromString("-1/8").value!).toString()).toEqual("3/8");
                expect(Fraction.fromString("1/8").value!.subtract(Fraction.fromString("-1/4").value!).toString()).toEqual("3/8");

                expect(Fraction.fromString("-1/8").value!.subtract(Fraction.fromString("-1/4").value!).toString()).toEqual("1/8");
            });


        });


        describe("multiply()", () => {


            it("returns the expected value", () => {
                expect(Fraction.fromString("0").value!.multiply(Fraction.fromString("0").value!).toString()).toEqual("0");
                expect(Fraction.fromString("1").value!.multiply(Fraction.fromString("0").value!).toString()).toEqual("0");
                expect(Fraction.fromString("0").value!.multiply(Fraction.fromString("1").value!).toString()).toEqual("0");

                expect(Fraction.fromString("1/2").value!.multiply(Fraction.fromString("1/2").value!).toString()).toEqual("1/4");
                expect(Fraction.fromString("-1/2").value!.multiply(Fraction.fromString("1/2").value!).toString()).toEqual("-1/4");
                expect(Fraction.fromString("1/2").value!.multiply(Fraction.fromString("-1/2").value!).toString()).toEqual("-1/4");
                expect(Fraction.fromString("-1/2").value!.multiply(Fraction.fromString("-1/2").value!).toString()).toEqual("1/4");

                // The answer should be reduced.
                expect(Fraction.fromString("4/8").value!.multiply(Fraction.fromString("2/12").value!).toString()).toEqual("1/12");
            });


        });


        describe("divide()", () => {


            it("will throw when asked to divide by zero", () => {
                expect(() => {
                    Fraction.fromString("3/4").value!.divide(Fraction.fromString("0/1").value!);
                }).toThrow();

                expect(() => {
                    Fraction.fromString("3/4").value!.divide(0);
                }).toThrow();
            });


            it("returns the expected value", () => {
                expect(Fraction.fromString("0/1").value!.divide(Fraction.fromString("1/1").value!).toString()).toEqual("0");
                expect(Fraction.fromString("1/1").value!.divide(Fraction.fromString("1/2").value!).toString()).toEqual("2");
                expect(Fraction.fromString("-1/1").value!.divide(Fraction.fromString("1/2").value!).toString()).toEqual("-2");
                expect(Fraction.fromString("1/1").value!.divide(Fraction.fromString("-1/2").value!).toString()).toEqual("-2");

                expect(Fraction.fromString("0/1").value!.divide(1).toString()).toEqual("0");
                expect(Fraction.fromString("1").value!.divide(2).toString()).toEqual("1/2");
                expect(Fraction.fromString("1").value!.divide(-2).toString()).toEqual("-1/2");
                expect(Fraction.fromString("-1").value!.divide(2).toString()).toEqual("-1/2");
            });


        });


        describe("floor()", () => {


            it("rounds down to the next smallest whole integer", () => {
                expect(Fraction.from(5.95).value!.floor()).toEqual(5);
                expect(Fraction.from(5.05).value!.floor()).toEqual(5);
                expect(Fraction.from(5).value!.floor()).toEqual(5);
                expect(Fraction.from(-0.5).value!.floor()).toEqual(-1);
                expect(Fraction.from(-5.05).value!.floor()).toEqual(-6);
            });


        });


        describe("ceil()", () => {

            it("rounds up to the next greatest whole integer", () => {
                expect(Fraction.from(0.95).value!.ceil()).toEqual(1);
                expect(Fraction.from(4).value!.ceil()).toEqual(4);
                expect(Fraction.from(7.004).value!.ceil()).toEqual(8);
                expect(Fraction.from(-0.5).value!.ceil()).toEqual(0);
                expect(Fraction.from(-7.004).value!.ceil()).toEqual(-7);
            });


        });


        describe("abs()", () => {

            it("returns the absolute value when the value is negative", () => {
                const val = Fraction.from(-2.125).value!;
                expect(val.abs().toString()).toEqual("2 125/1000");
            });


            it("returns the absolute value when the value is zero", () =>
            {
                const val = Fraction.from(0).value!;
                expect(val.abs().toString()).toEqual("0");
            });


            it("returns the absolute value when the value is positive", () =>
            {
                const val = Fraction.from(2.125).value!;
                expect(val.abs().toString()).toEqual("2 125/1000");
            });


        });


        describe("bracket()", () => {


            it("throws when the increment is negative", () =>
            {
                const val = Fraction.from(0.5).value!;
                expect(() => { val.bracket(-0.25); }).toThrow();
            });


            it("throws when the increment is zero", () =>
            {
                const val = Fraction.from(0.5).value!;
                expect(() => { val.bracket(-0.25); }).toThrow();
            });


            it("throws when 1 is not divisible by the increment", () =>
            {
                const val = Fraction.from(0.5).value!;
                expect(() => { val.bracket(Fraction.from("7/8").value!); }).toThrow();
            });


            it("will return equal floor and ceil values when the value falls on an increment", () =>
            {
                const val = Fraction.from("1/2").value!.add(Fraction.from("1/32").value!);  // 17/32
                const increment = Fraction.from("1/32").value!;
                const bracketResult = val.bracket(increment);
                expect(bracketResult.floor.toString()).toEqual("17/32");
                expect(bracketResult.ceil.toString()).toEqual("17/32");
                expect(bracketResult.nearest.toString()).toEqual("17/32");
            });


            it("will return equal floor and ceil values when the value is negative and falls on an increment", () => {
                const val = Fraction.from("-1/2").value!.add(Fraction.from("-1/32").value!);  // -17/32
                const increment = Fraction.from("1/32").value!;
                const bracketResult = val.bracket(increment);
                expect(bracketResult.floor.toString()).toEqual("-17/32");
                expect(bracketResult.ceil.toString()).toEqual("-17/32");
                expect(bracketResult.nearest.toString()).toEqual("-17/32");
            });


            it("will return the expected floor and ceil values when the value does not fall on an increment", () =>
            {
                const val = Fraction.from("1/2").value!.add(Fraction.from("1/32").value!);  // 17/32, 4.25/8
                const increment = Fraction.from("1/8").value!;
                const bracketResult = val.bracket(increment);
                expect(bracketResult.floor.toString()).toEqual("4/8");
                expect(bracketResult.ceil.toString()).toEqual("5/8");
                expect(bracketResult.nearest.toString()).toEqual("4/8");
            });


            it("will return the expected floor and ceil values when the value does not fall on an increment and is negative", () =>
            {
                const val = Fraction.from("-1/2").value!.add(Fraction.from("-1/32").value!);
                const increment = Fraction.from("1/8").value!;
                const bracketResult = val.bracket(increment);
                expect(bracketResult.floor.toString()).toEqual("-5/8");
                expect(bracketResult.ceil.toString()).toEqual("-4/8");
                expect(bracketResult.nearest.toString()).toEqual("-4/8");
            });


            it("makes it possible to round to the nearest 1/16", () => {
                expect(Fraction.from("45/64").value!.bracket(Fraction.from("1/16").value!).nearest.toString()).toEqual("11/16");
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
