
interface IFractionParts {
    whole: number;
    num:   number;
    den:   number;
}

export class Fraction {

    public static fromParts(whole: number, num: number, den: number): Fraction; // tslint:disable-line:unified-signatures
    public static fromParts(num: number, den: number): Fraction;                // tslint:disable-line:unified-signatures
    public static fromParts(whole: number): Fraction;
    public static fromParts(first: number, second?: number, third?: number): Fraction {
        let fracParts: IFractionParts;

        if (second === undefined && third === undefined) {
            // 1 number provided.  It's the whole part.
            const whole = first;
            fracParts = {whole, num: 0, den: 1};
        }
        else if (second !== undefined && third === undefined) {
            // 2 numbers provided.  They are num and den.
            const num = first;
            const den = second;
            if (den === 0) {
                throw new Error("The denominator of a fraction cannot be zero.");
            }
            fracParts = {whole: 0, num, den};
        }
        else {
            // 3 numbers provided.
            const whole = first;
            const num = second!;
            const den = third!;
            if (den === 0) {
                throw new Error("The denominator of a fraction cannot be zero.");
            }
            fracParts = {whole, num, den};
        }

        return new Fraction(fracParts);
    }


    public static fromString(str: string): Fraction {
        ////////////////////////////////////////////////////////////////////////////////
        // LEFT OFF HERE: Need to implement this
        ////////////////////////////////////////////////////////////////////////////////
    }


    private readonly _val: IFractionParts;


    private constructor(fracParts: IFractionParts) {
        this._val = fracParts;
    }


    public toString(): string {
        if (this._val.whole === 0 && this._val.num === 0) {
            return "0";
        }
        else {
            let str = this._val.whole === 0 ? "" : "" + this._val.whole;
            if (this._val.num !== 0) {
                // Insert a space if there was a whole part.
                if (this._val.whole) {
                    str += " ";
                }
                str += this._val.num + "/" + this._val.den;
            }
            return str;
        }
    }

}


function makeProper(fracParts: IFractionParts): IFractionParts {
    const additionalWholes = Math.floor(fracParts.num / fracParts.den);
    const remainder = fracParts.num % fracParts.den;

    return {
        whole: fracParts.whole + additionalWholes,
        num:   remainder,
        den:   fracParts.den
    };
}


function reduce(fracParts: IFractionParts): IFractionParts {
    const gcd = greatestCommonDivisor(fracParts.num, fracParts.den);
    return {
        whole: fracParts.whole,
        num:   fracParts.num / gcd,
        den:   fracParts.den / gcd
    };
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
