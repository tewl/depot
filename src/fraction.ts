import * as _ from "lodash";
import { Result, failed, failedResult, succeededResult } from "./result";


// Regular expressions used to parse fraction strings.
const justWhole = /^(?<whole>\d+)$/;
const justFrac  = /^(?<num>\d+)\/(?<den>\d+)$/;
const allParts  = /^(?<whole>\d+) (?<num>\d+)\/(?<den>\d+)$/;


export class Fraction {
    public static from(val: number | Fraction | string): Result<Fraction, string> {
        if (typeof val === "number") {
            return succeededResult(Fraction.fromNumber(val));
        }
        else if (typeof val === "string") {
            return Fraction.fromString(val);
        }
        else {
            return succeededResult(val);
        }
    }


    public static fromParts(whole: number, num: number, den: number): Result<Fraction, string>;
    public static fromParts(num: number, den: number): Result<Fraction, string>;
    public static fromParts(whole: number): Result<Fraction, string>;
    public static fromParts(first: number, second?: number, third?: number): Result<Fraction, string> {
        let whole: number;
        let num: number;
        let den: number;

        if (second === undefined && third === undefined) {
            // 1 number provided.  It's the whole part.
            whole = first;
            num = 0;
            den = 1;
        }
        else if (second !== undefined && third === undefined) {
            // 2 numbers provided.  They are num and den.
            whole = 0;
            num = first;
            den = second;
        }
        else {
            // 3 numbers provided.
            whole = first;
            num   = second!;
            den   = third!;
        }

        //
        // Make sure all values are integers.
        //
        if (!_.isSafeInteger(whole)) {
            return failedResult(`Fractions can only be created using integer values: whole=${whole}, num=${num}, den=${den}`);
        }
        if (!_.isSafeInteger(num)) {
            return failedResult(`Fractions can only be created using integer values: whole=${whole}, num=${num}, den=${den}`);
        }
        if (!_.isSafeInteger(den)) {
            return failedResult(`Fractions can only be created using integer values: whole=${whole}, num=${num}, den=${den}`);
        }

        //
        // Make sure the denominator is valid.
        //
        if (den === 0) {
            return failedResult(`The denominator of a Fraction cannot be zero: whole=${whole}, num=${num}, den=${den}`);
        }
        if (den < 0) {
            return failedResult(`The denominator of a Fraction cannot be negative: whole=${whole}, num=${num}, den=${den}`);
        }

        //
        // Make sure the negativity of the value makes sense.
        //
        let isPositive: boolean;
        if (whole === 0) {
            // The numerator is allowed to be positive or negative.
            isPositive = num >= 0;
        }
        else {
            // When there is a whole component, the numerator can only be
            // positive.
            if (num < 0) {
                return failedResult(`Fractions with a whole part cannot have a negative numerator: whole=${whole}, num=${num}, den=${den}`);
            }
            isPositive = whole >= 0;
        }

        whole = Math.abs(whole);
        num   = Math.abs(num);
        den   = Math.abs(den);

        num = den * whole + num;
        if (!isPositive) {
            num = num * -1;
        }
        return succeededResult(new Fraction(num, den));
    }


    public static fromString(str: string): Result<Fraction, string> {
        str = _.trim(str);

        let negativeAdjuster = 1;   // If positive, multiply by 1
        if (str.startsWith("-")) {
            negativeAdjuster = -1;  // If negative, will multiply by -1
            str = str.slice(1);
        }

        let matches: RegExpExecArray | null;
        matches = justWhole.exec(str);
        if (matches) {
            const whole = parseInt(matches.groups!.whole, 10) * negativeAdjuster;
            return Fraction.fromParts(whole);
        }

        matches = justFrac.exec(str);
        if (matches) {
            const num = parseInt(matches.groups!.num, 10) * negativeAdjuster;
            const den = parseInt(matches.groups!.den, 10);
            return Fraction.fromParts(num, den);
        }

        matches = allParts.exec(str);
        if (matches) {
            const whole = parseInt(matches.groups!.whole, 10) * negativeAdjuster;
            const num   = parseInt(matches.groups!.num,   10);
            const den   = parseInt(matches.groups!.den,   10);
            return Fraction.fromParts(whole, num, den);
        }

        return failedResult(`The string '${str}' cannot be converted into a Fraction.`);
    }


    public static fromNumber(num: number): Fraction {
        if (_.isSafeInteger(num)) {
            return new Fraction(num, 1);
        }

        // A regular expression for a number that may be negative and always has
        // a fractional part.
        const numRegex = /^(?<sign>-?)(?<while>\d+)\.(?<decimal>\d+)$/;

        const numStr = String(num);
        const negativeAdjuster = num < 0 ? -1 : 1;
        const whole = Math.floor(Math.abs(num)) * negativeAdjuster;

        const match = numRegex.exec(numStr);
        if (!match) {
            throw new Error("Error converting from number to Fraction.");
        }
        const fracStr = match.groups!.decimal;
        const denominator = Math.pow(10, fracStr.length);
        const numerator   = whole * denominator + parseInt(fracStr, 10) * negativeAdjuster;
        return new Fraction(numerator, denominator);
    }


    public static compare(a: Fraction | number, b: Fraction | number): number {
        // If both are numbers, do it quick and easy.
        if (typeof a === "number" && typeof b === "number") {
            if (a < b) {
                return -1;
            }
            else if (b < a) {
                return 1;
            }
            else {
                return 0;
            }
        }

        const fracAResult = Fraction.from(a);
        if (failed(fracAResult)) {
            throw new Error("Failed to convert number or fraction to a fraction. Should never happen.");
        }
        const fracA = fracAResult.value;
        const fracBResult = Fraction.from(b);
        if (failed(fracBResult)) {
            throw new Error("Failed to convert number or fraction to a fraction. Should never happen.");
        }
        const fracB = fracBResult.value;

        const crossA = fracA._num * fracB._den;
        const crossB = fracA._den * fracB._num;

        if (crossA < crossB) {
            return -1;
        }
        else if (crossB < crossA) {
            return 1;
        }
        else {
            return 0;
        }
    }


    // region Instance Data Members

    /**
     * The numerator always has the sign for the value.
     */
    private readonly _num: number;

    private readonly _den: number;
    // endregion


    private constructor(num: number, den: number) {
        this._num = num;
        this._den = den;

        // Don't let the denominator be negative.  If it is, then flip the sign
        // of both the numerator and denominator.
        if (this._den < 0) {
            this._den = this._den * -1;
            this._num = this._num * -1;
        }
    }


    public toString(improper = false): string {
        if (this._num === 0) {
            return "0";
        }
        else if (improper) {
            return `${this._num}/${this._den}`;
        }
        else {
            const whole = this.wholePart();
            if (whole === 0) {
                return `${this._num}/${this._den}`;
            }
            else {
                // The `whole` variable will contain the sign.
                const remainder = Math.abs(this._num) % this._den;
                const str = remainder === 0 ? `${whole}` : `${whole} ${remainder}/${this._den}`;
                return str;
            }
        }
    }


    public stringRepresentations(): Array<string> {
        let lastUsedValue: Fraction = Fraction.from(this).value!;

        // First, get the standard (possibly improper) form of this fraction.
        const representations = [lastUsedValue.toString(true)];

        // Second, if possible get the reduced (possibly improper) form of this
        // fraction.
        const reduced = this.reduce();
        if (reduced.wasReduced) {
            representations.push(reduced.reducedFraction.toString(true));
            lastUsedValue = reduced.reducedFraction;
        }

        // Third, if possible get the mixed number form of this fraction.
        if (lastUsedValue.isImproper()) {
            representations.push(lastUsedValue.toString(false));
        }

        return representations;
    }


    public isImproper(): boolean {
        return Math.abs(this._num) > this._den;
    }


    /**
     * Returns the whole part of this fraction
     * @return The whole part of this fraction.  If this fraction is negative
     * and the whole part is non-zero, the returned whole part will be negative.
     */
    public wholePart(): number {
        let whole: number = Math.floor(Math.abs(this._num) / this._den);

        // Make the sign correct.  Btw, we are checking for whole !== 0 because
        // 0 * -1 is -0 and we want just plain 0.
        if ((this._num < 0) && (whole !== 0)) {
            whole = whole * -1;
        }
        return whole;
    }


    /**
     * Return the fractional part of this fraction
     * @return The fractional part of this fraction.  If this fraction is
     * negative and the fractional part is non-zero, the returned fractional
     * part will be negative.
     */
    public fractionalPart(): Fraction {
        let num = this._num % this._den;
        // The following assignment seems unnecessary, but it is needed to
        // prevent num from being -0.
        num = num || 0;
        return new Fraction(num, this._den);
    }


    public changeDenominator(newDenominator: number): Fraction {
        if ((newDenominator <= 0) || !_.isSafeInteger(newDenominator)) {
            throw new Error("When changing the denominator, the new value must be a positive integer.");
        }

        const reduced = this.reduce().reducedFraction;
        if (newDenominator % reduced._den) {
            throw new Error(`Cannot change fraction denominator to ${newDenominator} without modifying value.`);
        }

        const scale = newDenominator / reduced._den;
        return new Fraction(reduced._num * scale, reduced._den * scale);
    }


    public reciprocal(): Fraction {
        if (this._num === 0) {
            throw new Error("Cannot create a reciprocal that would result in a denominator value of 0.");
        }
        return new Fraction(this._den, this._num);
    }


    public reduce(): {reducedFraction: Fraction, wasReduced: boolean} {
        const gcd = greatestCommonDivisor(this._num, this._den);
        if (gcd === 1) {
            return {reducedFraction: this, wasReduced: false};
        }
        else {
            const reducedFration = new Fraction(this._num / gcd, this._den / gcd);
            return {reducedFraction: reducedFration, wasReduced: true};
        }
    }


    public equals(other: number): boolean;
    public equals(other: Fraction): boolean;
    public equals(other: Fraction | number): boolean {
        const compareResult = Fraction.compare(this, other);
        return compareResult === 0;
    }


    public isLessThan(other: number): boolean;
    public isLessThan(other: Fraction): boolean;
    public isLessThan(other: Fraction | number): boolean {
        const compareResult = Fraction.compare(this, other);
        return compareResult < 0;
    }


    public isLessThanOrEqualTo(other: number | Fraction): boolean {
        const compareResult = Fraction.compare(this, other);
        return compareResult <= 0;
    }


    public isGreaterThan(other: number): boolean;
    public isGreaterThan(other: Fraction): boolean;
    public isGreaterThan(other: Fraction | number): boolean {
        const compareResult = Fraction.compare(this, other);
        return compareResult > 0;
    }


    public isGreaterThanOrEqualTo(other: number | Fraction): boolean {
        const compareResult = Fraction.compare(this, other);
        return compareResult >= 0;
    }


    public add(other: Fraction): Fraction;
    public add(other: number): Fraction;
    public add(other: Fraction | number): Fraction {
        const otherFrac = Fraction.from(other).value!;
        const lcm = leastCommonMultiple(this._den, otherFrac._den);

        const thisScale = lcm  / this._den;
        const thisNum = this._num * thisScale;

        const otherScale = lcm / otherFrac._den;
        const otherNum = otherFrac._num * otherScale;

        return new Fraction(thisNum + otherNum, lcm);
    }


    public subtract(other: Fraction): Fraction;
    public subtract(other: number): Fraction;
    public subtract(other: Fraction | number): Fraction {
        const otherFrac = Fraction.from(other).value!;
        const lcm = leastCommonMultiple(this._den, otherFrac._den);

        const thisScale = lcm  / this._den;
        const thisNum = this._num * thisScale;

        const otherScale = lcm / otherFrac._den;
        const otherNum = otherFrac._num * otherScale;

        return new Fraction(thisNum - otherNum, lcm);
    }


    public multiply(other: Fraction): Fraction;
    public multiply(other: number): Fraction;
    public multiply(other: Fraction | number): Fraction {
        const otherFrac = Fraction.from(other).value!;
        const num = this._num * otherFrac._num;
        const den = this._den * otherFrac._den;
        const product = new Fraction(num, den);
        const result = product.reduce().reducedFraction;
        return result;
    }


    public divide(other: number): Fraction;
    public divide(other: Fraction): Fraction;
    public divide(other: number | Fraction): Fraction {
        const fracOther = Fraction.from(other).value!;
        const result = this.multiply(fracOther.reciprocal());
        return result;
    }


    public toNumber(): number {
        return this._num / this._den;
    }


    /**
     * Returns the largest integer less than or equal to this number.
     * @return The next smallest integer
     */
    public floor(): number {
        const whole = this.wholePart();
        const frac = this.fractionalPart();

        if (frac._num === 0) {
            return whole;
        }
        else if (this._num < 0) {
            return whole - 1;
        }
        else {
            return whole;
        }
    }


    /**
     * Returns the smallest integer greater than or equal to this value.
     * @return The next largest integer
     */
    public ceil(): number {
        const whole = this.wholePart();
        const frac = this.fractionalPart();

        if (frac._num === 0) {
            return whole;
        }
        else if (this._num < 0) {
            return whole;
        }
        else {
            return whole + 1;
        }
    }


    /**
     * Returns the absolute value of this value
     * @return The absolute value of this value
     */
    public abs(): Fraction {
        const num = Math.abs(this._num);
        const absoluteVal: Fraction = Fraction.fromParts(num, this._den).value!;
        return absoluteVal;
    }


    /**
     * Finds the increment below and above this value.
     * @param increment - The increment size (must be positive)
     * @return The increment below and above this value as well as the increment
     * that is closest.
     */
    public bracket(
        increment: number | Fraction
    ): {floor: Fraction, ceil: Fraction, nearest: Fraction} {
        const incr = Fraction.from(increment).value!;

        // The increment must be a positive value.
        if (incr._num === 0 || incr.toNumber() < 0) {
            throw new Error("bracket() increment must be positive.");
        }

        // 1 must be evenly divisible by the specified increment value (since we
        // will be stepping from floor() to ceil()).
        if (incr.reduce().reducedFraction._num !== 1) {
            throw new Error("bracket() 1 must be divisible by the specified increment.");
        }

        const rangeFloor = Fraction.from(this.floor()).value!;
        const rangeCeil  = Fraction.from(this.ceil()).value!;

        let floorVal: Fraction;

        // Find the floor value by stepping down from rangeCeil.
        for (let curVal = rangeCeil;
            curVal.isGreaterThanOrEqualTo(rangeFloor);
            curVal = curVal.subtract(incr)
        ) {
            if (curVal.isLessThanOrEqualTo(this)) {
                floorVal = curVal;
                break;
            }
        }

        let ceilVal: Fraction;

        // Find the ceil value by stepping up from rangeFloor.
        for (let curVal = rangeFloor; curVal.isLessThanOrEqualTo(rangeCeil); curVal = curVal.add(incr)) {
            if (curVal.isGreaterThanOrEqualTo(this)) {
                ceilVal = curVal;
                break;
            }
        }

        const floorDelta = this.subtract(floorVal!);
        const ceilDelta  = ceilVal!.subtract(this);
        const nearest    = floorDelta.isLessThan(ceilDelta) ? floorVal! : ceilVal!;

        return {
            floor:   floorVal!,
            ceil:    ceilVal!,
            nearest: nearest
        };
    }

}


export function greatestCommonDivisor(a: number, b: number): number {
    if (a === 0 && b === 0) {
        throw new Error("Cannot calculate greatest common divosor of 0.");
    }

    // For information on gcd(0, k) see:
    // http://mfleck.cs.illinois.edu/building-blocks/version-1.0/number-theory.pdf
    if (a === 0) {
        return b;
    }
    else if (b === 0) {
        return a;
    }
    else {
        a = Math.abs(a);
        b = Math.abs(b);
        if (b > a) {
            [a, b] = [b, a];
        }
        while (true) {  // eslint-disable-line no-constant-condition
            if (b === 0) {
                return a;
            }
            a %= b;
            if (a === 0) {
                return b;
            }
            b %= a;
        }
    }
}


export function leastCommonMultiple(a: number, b: number): number {
    if (a === 0 || b === 0) {
        return 0;
    }
    return Math.abs(a * b) / greatestCommonDivisor(a, b);
}
