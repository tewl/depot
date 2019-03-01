import * as _ from "lodash";


interface IFractionParts {
    whole: number;
    num:   number;
    den:   number;
}


const justWhole = /^(\d+)$/;
const justFrac  = /^(\d+)\/(\d+)$/;
const allParts  = /^(\d+) (\d+)\/(\d+)$/;


export class Fraction
{

    public static fromParts(whole: number, num: number, den: number): Fraction; // tslint:disable-line:unified-signatures
    public static fromParts(num: number, den: number): Fraction;                // tslint:disable-line:unified-signatures
    public static fromParts(whole: number): Fraction;
    public static fromParts(first: number,
                            second?: number,
                            third?: number): Fraction
    {
        let fracParts: IFractionParts;

        if (second === undefined && third === undefined)
        {
            // 1 number provided.  It's the whole part.
            const whole = first;
            if (!_.isSafeInteger(whole))
            {
                throw new Error(
                    `The value ${whole} cannot be used when creating Fraction instances.  Only integers can be used.`);
            }
            fracParts = {whole, num: 0, den: 1};
        }
        else if (second !== undefined && third === undefined)
        {
            // 2 numbers provided.  They are num and den.
            const num = first;
            const den = second;
            if (den === 0)
            {
                throw new Error(
                    "The denominator of a fraction cannot be zero.");
            }
            if (!_.isSafeInteger(num))
            {
                throw new Error(
                    `The value ${num} cannot be used when creating Fraction instances.  Only integers can be used.`);
            }
            if (!_.isSafeInteger(den))
            {
                throw new Error(
                    `The value ${den} cannot be used when creating Fraction instances.  Only integers can be used.`);
            }

            fracParts = {whole: 0, num, den};
        }
        else
        {
            // 3 numbers provided.
            const whole = first;
            const num   = second!;
            const den   = third!;
            if (den === 0)
            {
                throw new Error(
                    "The denominator of a fraction cannot be zero.");
            }
            if (!_.isSafeInteger(whole))
            {
                throw new Error(
                    `The value ${whole} cannot be used when creating Fraction instances.  Only integers can be used.`);
            }
            if (!_.isSafeInteger(num))
            {
                throw new Error(
                    `The value ${num} cannot be used when creating Fraction instances.  Only integers can be used.`);
            }
            if (!_.isSafeInteger(den))
            {
                throw new Error(
                    `The value ${den} cannot be used when creating Fraction instances.  Only integers can be used.`);
            }
            fracParts = {whole, num, den};
        }

        return new Fraction(fracParts);
    }


    public static fromString(str: string): Fraction
    {
        let matches: RegExpExecArray | null;
        matches = justWhole.exec(str);
        if (matches)
        {
            const whole = parseInt(matches[1], 10);
            return Fraction.fromParts(whole);
        }

        matches = justFrac.exec(str);
        if (matches)
        {
            const num = parseInt(matches[1], 10);
            const den = parseInt(matches[2], 10);
            return Fraction.fromParts(num, den);
        }

        matches = allParts.exec(str);
        if (matches)
        {
            const whole = parseInt(matches[1], 10);
            const num   = parseInt(matches[2], 10);
            const den   = parseInt(matches[3], 10);
            return Fraction.fromParts(whole, num, den);
        }

        throw new Error(
            `The string '${str}' cannot be converted into a Fraction.`);
    }


    private readonly _val: IFractionParts;


    private constructor(fracParts: IFractionParts)
    {
        this._val = fracParts;
    }


    public get parts(): IFractionParts
    {
        return {whole: this._val.whole, num: this._val.num, den: this._val.den};
    }


    public get isProper(): boolean
    {
        return this._val.num < this._val.den;
    }


    public get isImproper(): boolean
    {
        return this._val.num >= this._val.den;
    }


    public toString(): string
    {
        if (this._val.whole === 0 && this._val.num === 0)
        {
            return "0";
        }
        else
        {
            let str = this._val.whole === 0 ? "" : "" + this._val.whole;
            if (this._val.num !== 0)
            {
                // Insert a space if there was a whole part.
                if (this._val.whole)
                {
                    str += " ";
                }
                str += this._val.num + "/" + this._val.den;
            }
            return str;
        }
    }


    // TODO: Implement this.
    // public equals(other: Fraction): boolean {}


    public reduce(): Fraction
    {
        const gcd = greatestCommonDivisor(this._val.num, this._val.den);
        return new Fraction(
            {
                whole: this._val.whole,
                num:   this._val.num / gcd,
                den:   this._val.den / gcd
            }
        );
    }


    public makeProper(): Fraction
    {
        const additionalWholes = Math.floor(this._val.num / this._val.den);
        const remainder = this._val.num % this._val.den;

        return new Fraction({
            whole: this._val.whole + additionalWholes,
            num:   remainder,
            den:   this._val.den
        });
    }


    /**
     * Returns the improper form of this fraction, if it can be made improper
     * @return The improper form of this fraction, if it can be made improper
     */
    public makeImproper(): Fraction
    {
        return new Fraction(
            {
                whole: 0,
                num: this._val.den * this._val.whole + this._val.num,
                den: this._val.den
            }
        );
    }


    public simplify(): Fraction
    {
        return this.reduce().makeProper();
    }


    public add(other: Fraction): Fraction
    {
        const lcm      = leastCommonMultiple(this._val.den, other._val.den);
        const thisNum  = this._val.num * lcm / this._val.den;
        const otherNum = other._val.num * lcm / other._val.den;

        const result = Fraction.fromParts(
            this._val.whole + other._val.whole,
            thisNum + otherNum,
            lcm).makeProper();
        return result;
    }


    // TODO: Implement this.
    // public subtract(other: Fraction): Fraction;
    // public subtract(other: number): Fraction;


    // TODO: Implement this.
    // public multiply(other: Fraction): Fraction;
    // public multiply(other: number): Fraction;


    // TODO: Implement this.
    // public divide(other: Fraction): Fraction;
    // public divide(other: number): Fraction;


    // TODO: toNumber()
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
        while (true) {
            if (b === 0) { return a; }
            a %= b;
            if (a === 0) { return b; }
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
