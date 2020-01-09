export declare class Fraction {
    static fromParts(whole: number, num: number, den: number): Fraction;
    static fromParts(num: number, den: number): Fraction;
    static fromParts(whole: number): Fraction;
    static fromString(str: string): Fraction;
    static fromNumber(num: number): Fraction;
    static compare(a: Fraction | number, b: Fraction | number): number;
    private readonly _num;
    private readonly _den;
    private constructor();
    toString(improper?: boolean): string;
    /**
     * Returns the whole part of this fraction
     * @return The whole part of this fraction.  If this fraction is negative
     * and the whole part is non-zero, the returned value will be negative.
     */
    wholePart(): number;
    /**
     * Return the fractional part of this fraction
     * @return The fractional part of this fraction.  If this fraction
     */
    fractionalPart(): Fraction;
    changeDenominator(newDenominator: number): Fraction;
    reciprocal(): Fraction;
    reduce(): Fraction;
    equals(other: number): boolean;
    equals(other: Fraction): boolean;
    isLessThan(other: number): boolean;
    isLessThan(other: Fraction): boolean;
    isLessThanOrEqualTo(other: number | Fraction): boolean;
    isGreaterThan(other: number): boolean;
    isGreaterThan(other: Fraction): boolean;
    isGreaterThanOrEqualTo(other: number | Fraction): boolean;
    add(other: Fraction): Fraction;
    add(other: number): Fraction;
    subtract(other: Fraction): Fraction;
    subtract(other: number): Fraction;
    multiply(other: Fraction): Fraction;
    multiply(other: number): Fraction;
    divide(other: number): Fraction;
    divide(other: Fraction): Fraction;
    toNumber(): number;
}
export declare function toFraction(val: number | Fraction | string): Fraction;
export declare function greatestCommonDivisor(a: number, b: number): number;
export declare function leastCommonMultiple(a: number, b: number): number;
