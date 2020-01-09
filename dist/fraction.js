"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
// Regular expressions used to parse fraction strings.
var justWhole = /^(\d+)$/;
var justFrac = /^(\d+)\/(\d+)$/;
var allParts = /^(\d+) (\d+)\/(\d+)$/;
var Fraction = /** @class */ (function () {
    // endregion
    function Fraction(num, den) {
        this._num = num;
        this._den = den;
        // Don't let the denominator be negative.  If it is, then flip the sign
        // of both the numerator and denominator.
        if (this._den < 0) {
            this._den = this._den * -1;
            this._num = this._num * -1;
        }
    }
    Fraction.fromParts = function (first, second, third) {
        var whole;
        var num;
        var den;
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
            num = second;
            den = third;
        }
        //
        // Make sure all values are integers.
        //
        if (!_.isSafeInteger(whole)) {
            throw new Error("Fractions can only be created using integer values: whole=" + whole + ", num=" + num + ", den=" + den);
        }
        if (!_.isSafeInteger(num)) {
            throw new Error("Fractions can only be created using integer values: whole=" + whole + ", num=" + num + ", den=" + den);
        }
        if (!_.isSafeInteger(den)) {
            throw new Error("Fractions can only be created using integer values: whole=" + whole + ", num=" + num + ", den=" + den);
        }
        //
        // Make sure the denominator is valid.
        //
        if (den === 0) {
            throw new Error("The denominator of a Fraction cannot be zero: whole=" + whole + ", num=" + num + ", den=" + den);
        }
        if (den < 0) {
            throw new Error("The denominator of a Fraction cannot be negative: whole=" + whole + ", num=" + num + ", den=" + den);
        }
        //
        // Make sure the negativity of the value makes sense.
        //
        var isPositive;
        if (whole === 0) {
            // The numerator is allowed to be positive or negative.
            isPositive = num >= 0;
        }
        else {
            // When there is a whole component, the numerator can only be
            // positive.
            if (num < 0) {
                throw new Error("Fractions with a whole part cannot have a negative numerator: whole=" + whole + ", num=" + num + ", den=" + den);
            }
            isPositive = whole >= 0;
        }
        whole = Math.abs(whole);
        num = Math.abs(num);
        den = Math.abs(den);
        num = den * whole + num;
        if (!isPositive) {
            num = num * -1;
        }
        return new Fraction(num, den);
    };
    Fraction.fromString = function (str) {
        var negativeAdjuster = 1; // If positive, multiply by 1
        if (str[0] === "-") {
            negativeAdjuster = -1; // If negative, will multiply by -1
            str = str.slice(1);
        }
        var matches;
        matches = justWhole.exec(str);
        if (matches) {
            var whole = parseInt(matches[1], 10) * negativeAdjuster;
            return Fraction.fromParts(whole);
        }
        matches = justFrac.exec(str);
        if (matches) {
            var num = parseInt(matches[1], 10) * negativeAdjuster;
            var den = parseInt(matches[2], 10);
            return Fraction.fromParts(num, den);
        }
        matches = allParts.exec(str);
        if (matches) {
            var whole = parseInt(matches[1], 10) * negativeAdjuster;
            var num = parseInt(matches[2], 10);
            var den = parseInt(matches[3], 10);
            return Fraction.fromParts(whole, num, den);
        }
        throw new Error("The string '" + str + "' cannot be converted into a Fraction.");
    };
    Fraction.fromNumber = function (num) {
        if (_.isSafeInteger(num)) {
            return new Fraction(num, 1);
        }
        // A regular expression for a number that may be negative and always has
        // a fractional part.
        var numRegex = /^(-?)(\d+)\.(\d+)$/;
        var numStr = "" + num;
        var negativeAdjuster = num < 0 ? -1 : 1;
        var whole = Math.floor(Math.abs(num)) * negativeAdjuster;
        var match = numRegex.exec(numStr);
        if (!match) {
            throw new Error("Error converting from number to Fraction.");
        }
        var fracStr = match[3];
        var denominator = Math.pow(10, fracStr.length);
        var numerator = whole * denominator + parseInt(fracStr, 10) * negativeAdjuster;
        return new Fraction(numerator, denominator);
    };
    Fraction.compare = function (a, b) {
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
        var fracA = toFraction(a);
        var fracB = toFraction(b);
        var crossA = fracA._num * fracB._den;
        var crossB = fracA._den * fracB._num;
        if (crossA < crossB) {
            return -1;
        }
        else if (crossB < crossA) {
            return 1;
        }
        else {
            return 0;
        }
    };
    Fraction.prototype.toString = function (improper) {
        if (improper === void 0) { improper = false; }
        if (this._num === 0) {
            return "0";
        }
        else if (improper) {
            return this._num + "/" + this._den;
        }
        else {
            var whole = this.wholePart();
            if (whole === 0) {
                return this._num + "/" + this._den;
            }
            else {
                // The `whole` variable will contain the sign.
                var remainder = Math.abs(this._num) % this._den;
                var str = remainder === 0 ? "" + whole : whole + " " + remainder + "/" + this._den;
                return str;
            }
        }
    };
    /**
     * Returns the whole part of this fraction
     * @return The whole part of this fraction.  If this fraction is negative
     * and the whole part is non-zero, the returned value will be negative.
     */
    Fraction.prototype.wholePart = function () {
        var whole = Math.floor(Math.abs(this._num) / this._den);
        // Make the sign correct.  Btw, we are checking for whole !== 0 because
        // 0 * -1 is -0 and we want just plain 0.
        if ((this._num < 0) && (whole !== 0)) {
            whole = whole * -1;
        }
        return whole;
    };
    /**
     * Return the fractional part of this fraction
     * @return The fractional part of this fraction.  If this fraction
     */
    Fraction.prototype.fractionalPart = function () {
        var num = this._num % this._den;
        // The following assignment seems unnecessary, but it is needed to
        // prevent num from being -0.
        num = num || 0;
        return new Fraction(num, this._den);
    };
    Fraction.prototype.changeDenominator = function (newDenominator) {
        if ((newDenominator <= 0) || !_.isSafeInteger(newDenominator)) {
            throw new Error("When changing the denominator, the new value must be a positive integer.");
        }
        var reduced = this.reduce();
        if (newDenominator % reduced._den) {
            throw new Error("Cannot change fraction denominator to " + newDenominator + " without modifying value.");
        }
        var scale = newDenominator / reduced._den;
        return new Fraction(reduced._num * scale, reduced._den * scale);
    };
    Fraction.prototype.reciprocal = function () {
        if (this._num === 0) {
            throw new Error("Cannot create a reciprocal that would result in a denominator value of 0.");
        }
        return new Fraction(this._den, this._num);
    };
    Fraction.prototype.reduce = function () {
        var gcd = greatestCommonDivisor(this._num, this._den);
        return new Fraction(this._num / gcd, this._den / gcd);
    };
    Fraction.prototype.equals = function (other) {
        var compareResult = Fraction.compare(this, other);
        return compareResult === 0;
    };
    Fraction.prototype.isLessThan = function (other) {
        var compareResult = Fraction.compare(this, other);
        return compareResult < 0;
    };
    Fraction.prototype.isLessThanOrEqualTo = function (other) {
        var compareResult = Fraction.compare(this, other);
        return compareResult <= 0;
    };
    Fraction.prototype.isGreaterThan = function (other) {
        var compareResult = Fraction.compare(this, other);
        return compareResult > 0;
    };
    Fraction.prototype.isGreaterThanOrEqualTo = function (other) {
        var compareResult = Fraction.compare(this, other);
        return compareResult >= 0;
    };
    Fraction.prototype.add = function (other) {
        var otherFrac = toFraction(other);
        var lcm = leastCommonMultiple(this._den, otherFrac._den);
        var thisScale = lcm / this._den;
        var thisNum = this._num * thisScale;
        var otherScale = lcm / otherFrac._den;
        var otherNum = otherFrac._num * otherScale;
        return new Fraction(thisNum + otherNum, lcm);
    };
    Fraction.prototype.subtract = function (other) {
        var otherFrac = toFraction(other);
        var lcm = leastCommonMultiple(this._den, otherFrac._den);
        var thisScale = lcm / this._den;
        var thisNum = this._num * thisScale;
        var otherScale = lcm / otherFrac._den;
        var otherNum = otherFrac._num * otherScale;
        return new Fraction(thisNum - otherNum, lcm);
    };
    Fraction.prototype.multiply = function (other) {
        var otherFrac = toFraction(other);
        var num = this._num * otherFrac._num;
        var den = this._den * otherFrac._den;
        var product = new Fraction(num, den);
        var result = product.reduce();
        return result;
    };
    Fraction.prototype.divide = function (other) {
        var fracOther = toFraction(other);
        var result = this.multiply(fracOther.reciprocal());
        return result;
    };
    Fraction.prototype.toNumber = function () {
        return this._num / this._den;
    };
    return Fraction;
}());
exports.Fraction = Fraction;
function toFraction(val) {
    if (typeof val === "number") {
        return Fraction.fromNumber(val);
    }
    else if (typeof val === "string") {
        return Fraction.fromString(val);
    }
    else {
        return val;
    }
}
exports.toFraction = toFraction;
function greatestCommonDivisor(a, b) {
    var _a;
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
            _a = __read([b, a], 2), a = _a[0], b = _a[1];
        }
        while (true) {
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
exports.greatestCommonDivisor = greatestCommonDivisor;
function leastCommonMultiple(a, b) {
    if (a === 0 || b === 0) {
        return 0;
    }
    return Math.abs(a * b) / greatestCommonDivisor(a, b);
}
exports.leastCommonMultiple = leastCommonMultiple;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LENBQUM7WUFDUCxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7Z0JBQUUsT0FBTyxDQUFDLENBQUM7YUFBRTtZQUMxQixDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ1Y7S0FDSjtBQUNMLENBQUM7QUEzQkQsc0RBMkJDO0FBR0QsU0FBZ0IsbUJBQW1CLENBQUMsQ0FBUyxFQUFFLENBQVM7SUFFcEQsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUU7UUFDcEIsT0FBTyxDQUFDLENBQUM7S0FDWjtJQUNELE9BQU8sSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcscUJBQXFCLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQ3pELENBQUM7QUFORCxrREFNQyIsImZpbGUiOiJmcmFjdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuXG5cbi8vIFJlZ3VsYXIgZXhwcmVzc2lvbnMgdXNlZCB0byBwYXJzZSBmcmFjdGlvbiBzdHJpbmdzLlxuY29uc3QganVzdFdob2xlID0gL14oXFxkKykkLztcbmNvbnN0IGp1c3RGcmFjICA9IC9eKFxcZCspXFwvKFxcZCspJC87XG5jb25zdCBhbGxQYXJ0cyAgPSAvXihcXGQrKSAoXFxkKylcXC8oXFxkKykkLztcblxuXG5leHBvcnQgY2xhc3MgRnJhY3Rpb25cbntcbiAgICBwdWJsaWMgc3RhdGljIGZyb21QYXJ0cyh3aG9sZTogbnVtYmVyLCBudW06IG51bWJlciwgZGVuOiBudW1iZXIpOiBGcmFjdGlvbjsgLy8gdHNsaW50OmRpc2FibGUtbGluZTp1bmlmaWVkLXNpZ25hdHVyZXNcbiAgICBwdWJsaWMgc3RhdGljIGZyb21QYXJ0cyhudW06IG51bWJlciwgZGVuOiBudW1iZXIpOiBGcmFjdGlvbjsgICAgICAgICAgICAgICAgLy8gdHNsaW50OmRpc2FibGUtbGluZTp1bmlmaWVkLXNpZ25hdHVyZXNcbiAgICBwdWJsaWMgc3RhdGljIGZyb21QYXJ0cyh3aG9sZTogbnVtYmVyKTogRnJhY3Rpb247XG4gICAgcHVibGljIHN0YXRpYyBmcm9tUGFydHMoZmlyc3Q6IG51bWJlcixcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzZWNvbmQ/OiBudW1iZXIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdGhpcmQ/OiBudW1iZXIpOiBGcmFjdGlvblxuICAgIHtcbiAgICAgICAgbGV0IHdob2xlOiBudW1iZXI7XG4gICAgICAgIGxldCBudW06IG51bWJlcjtcbiAgICAgICAgbGV0IGRlbjogbnVtYmVyO1xuXG4gICAgICAgIGlmIChzZWNvbmQgPT09IHVuZGVmaW5lZCAmJiB0aGlyZCA9PT0gdW5kZWZpbmVkKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyAxIG51bWJlciBwcm92aWRlZC4gIEl0J3MgdGhlIHdob2xlIHBhcnQuXG4gICAgICAgICAgICB3aG9sZSA9IGZpcnN0O1xuICAgICAgICAgICAgbnVtID0gMDtcbiAgICAgICAgICAgIGRlbiA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAoc2Vjb25kICE9PSB1bmRlZmluZWQgJiYgdGhpcmQgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gMiBudW1iZXJzIHByb3ZpZGVkLiAgVGhleSBhcmUgbnVtIGFuZCBkZW4uXG4gICAgICAgICAgICB3aG9sZSA9IDA7XG4gICAgICAgICAgICBudW0gPSBmaXJzdDtcbiAgICAgICAgICAgIGRlbiA9IHNlY29uZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIDMgbnVtYmVycyBwcm92aWRlZC5cbiAgICAgICAgICAgIHdob2xlID0gZmlyc3Q7XG4gICAgICAgICAgICBudW0gICA9IHNlY29uZCE7XG4gICAgICAgICAgICBkZW4gICA9IHRoaXJkITtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIE1ha2Ugc3VyZSBhbGwgdmFsdWVzIGFyZSBpbnRlZ2Vycy5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKCFfLmlzU2FmZUludGVnZXIod2hvbGUpKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEZyYWN0aW9ucyBjYW4gb25seSBiZSBjcmVhdGVkIHVzaW5nIGludGVnZXIgdmFsdWVzOiB3aG9sZT0ke3dob2xlfSwgbnVtPSR7bnVtfSwgZGVuPSR7ZGVufWApO1xuICAgICAgICB9XG4gICAgICAgIGlmICghXy5pc1NhZmVJbnRlZ2VyKG51bSkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRnJhY3Rpb25zIGNhbiBvbmx5IGJlIGNyZWF0ZWQgdXNpbmcgaW50ZWdlciB2YWx1ZXM6IHdob2xlPSR7d2hvbGV9LCBudW09JHtudW19LCBkZW49JHtkZW59YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKCFfLmlzU2FmZUludGVnZXIoZGVuKSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBGcmFjdGlvbnMgY2FuIG9ubHkgYmUgY3JlYXRlZCB1c2luZyBpbnRlZ2VyIHZhbHVlczogd2hvbGU9JHt3aG9sZX0sIG51bT0ke251bX0sIGRlbj0ke2Rlbn1gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGVub21pbmF0b3IgaXMgdmFsaWQuXG4gICAgICAgIC8vXG4gICAgICAgIGlmIChkZW4gPT09IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGRlbm9taW5hdG9yIG9mIGEgRnJhY3Rpb24gY2Fubm90IGJlIHplcm86IHdob2xlPSR7d2hvbGV9LCBudW09JHtudW19LCBkZW49JHtkZW59YCk7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGRlbiA8IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgVGhlIGRlbm9taW5hdG9yIG9mIGEgRnJhY3Rpb24gY2Fubm90IGJlIG5lZ2F0aXZlOiB3aG9sZT0ke3dob2xlfSwgbnVtPSR7bnVtfSwgZGVuPSR7ZGVufWApO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gTWFrZSBzdXJlIHRoZSBuZWdhdGl2aXR5IG9mIHRoZSB2YWx1ZSBtYWtlcyBzZW5zZS5cbiAgICAgICAgLy9cbiAgICAgICAgbGV0IGlzUG9zaXRpdmU6IGJvb2xlYW47XG4gICAgICAgIGlmICh3aG9sZSA9PT0gMCkge1xuICAgICAgICAgICAgLy8gVGhlIG51bWVyYXRvciBpcyBhbGxvd2VkIHRvIGJlIHBvc2l0aXZlIG9yIG5lZ2F0aXZlLlxuICAgICAgICAgICAgaXNQb3NpdGl2ZSA9IG51bSA+PSAwO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgLy8gV2hlbiB0aGVyZSBpcyBhIHdob2xlIGNvbXBvbmVudCwgdGhlIG51bWVyYXRvciBjYW4gb25seSBiZVxuICAgICAgICAgICAgLy8gcG9zaXRpdmUuXG4gICAgICAgICAgICBpZiAobnVtIDwgMCkge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRnJhY3Rpb25zIHdpdGggYSB3aG9sZSBwYXJ0IGNhbm5vdCBoYXZlIGEgbmVnYXRpdmUgbnVtZXJhdG9yOiB3aG9sZT0ke3dob2xlfSwgbnVtPSR7bnVtfSwgZGVuPSR7ZGVufWApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXNQb3NpdGl2ZSA9IHdob2xlID49IDA7XG4gICAgICAgIH1cblxuICAgICAgICB3aG9sZSA9IE1hdGguYWJzKHdob2xlKTtcbiAgICAgICAgbnVtICAgPSBNYXRoLmFicyhudW0pO1xuICAgICAgICBkZW4gICA9IE1hdGguYWJzKGRlbik7XG5cbiAgICAgICAgbnVtID0gZGVuICogd2hvbGUgKyBudW07XG4gICAgICAgIGlmICghaXNQb3NpdGl2ZSkge1xuICAgICAgICAgICAgbnVtID0gbnVtICogLTE7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihudW0sIGRlbik7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcoc3RyOiBzdHJpbmcpOiBGcmFjdGlvblxuICAgIHtcbiAgICAgICAgbGV0IG5lZ2F0aXZlQWRqdXN0ZXIgPSAxOyAgIC8vIElmIHBvc2l0aXZlLCBtdWx0aXBseSBieSAxXG4gICAgICAgIGlmIChzdHJbMF0gPT09IFwiLVwiKSB7XG4gICAgICAgICAgICBuZWdhdGl2ZUFkanVzdGVyID0gLTE7ICAvLyBJZiBuZWdhdGl2ZSwgd2lsbCBtdWx0aXBseSBieSAtMVxuICAgICAgICAgICAgc3RyID0gc3RyLnNsaWNlKDEpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IG1hdGNoZXM6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gICAgICAgIG1hdGNoZXMgPSBqdXN0V2hvbGUuZXhlYyhzdHIpO1xuICAgICAgICBpZiAobWF0Y2hlcylcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3Qgd2hvbGUgPSBwYXJzZUludChtYXRjaGVzWzFdLCAxMCkgKiBuZWdhdGl2ZUFkanVzdGVyO1xuICAgICAgICAgICAgcmV0dXJuIEZyYWN0aW9uLmZyb21QYXJ0cyh3aG9sZSk7XG4gICAgICAgIH1cblxuICAgICAgICBtYXRjaGVzID0ganVzdEZyYWMuZXhlYyhzdHIpO1xuICAgICAgICBpZiAobWF0Y2hlcylcbiAgICAgICAge1xuICAgICAgICAgICAgY29uc3QgbnVtID0gcGFyc2VJbnQobWF0Y2hlc1sxXSwgMTApICogbmVnYXRpdmVBZGp1c3RlcjtcbiAgICAgICAgICAgIGNvbnN0IGRlbiA9IHBhcnNlSW50KG1hdGNoZXNbMl0sIDEwKTtcbiAgICAgICAgICAgIHJldHVybiBGcmFjdGlvbi5mcm9tUGFydHMobnVtLCBkZW4pO1xuICAgICAgICB9XG5cbiAgICAgICAgbWF0Y2hlcyA9IGFsbFBhcnRzLmV4ZWMoc3RyKTtcbiAgICAgICAgaWYgKG1hdGNoZXMpXG4gICAgICAgIHtcbiAgICAgICAgICAgIGNvbnN0IHdob2xlID0gcGFyc2VJbnQobWF0Y2hlc1sxXSwgMTApICogbmVnYXRpdmVBZGp1c3RlcjtcbiAgICAgICAgICAgIGNvbnN0IG51bSAgID0gcGFyc2VJbnQobWF0Y2hlc1syXSwgMTApO1xuICAgICAgICAgICAgY29uc3QgZGVuICAgPSBwYXJzZUludChtYXRjaGVzWzNdLCAxMCk7XG4gICAgICAgICAgICByZXR1cm4gRnJhY3Rpb24uZnJvbVBhcnRzKHdob2xlLCBudW0sIGRlbik7XG4gICAgICAgIH1cblxuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXG4gICAgICAgICAgICBgVGhlIHN0cmluZyAnJHtzdHJ9JyBjYW5ub3QgYmUgY29udmVydGVkIGludG8gYSBGcmFjdGlvbi5gKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBzdGF0aWMgZnJvbU51bWJlcihudW06IG51bWJlcik6IEZyYWN0aW9uXG4gICAge1xuICAgICAgICBpZiAoXy5pc1NhZmVJbnRlZ2VyKG51bSkpIHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24obnVtLCAxKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEEgcmVndWxhciBleHByZXNzaW9uIGZvciBhIG51bWJlciB0aGF0IG1heSBiZSBuZWdhdGl2ZSBhbmQgYWx3YXlzIGhhc1xuICAgICAgICAvLyBhIGZyYWN0aW9uYWwgcGFydC5cbiAgICAgICAgY29uc3QgbnVtUmVnZXggPSAvXigtPykoXFxkKylcXC4oXFxkKykkLztcblxuICAgICAgICBjb25zdCBudW1TdHIgPSBcIlwiICsgbnVtO1xuICAgICAgICBjb25zdCBuZWdhdGl2ZUFkanVzdGVyID0gbnVtIDwgMCA/IC0xIDogMTtcbiAgICAgICAgY29uc3Qgd2hvbGUgPSBNYXRoLmZsb29yKE1hdGguYWJzKG51bSkpICogbmVnYXRpdmVBZGp1c3RlcjtcblxuICAgICAgICBjb25zdCBtYXRjaCA9IG51bVJlZ2V4LmV4ZWMobnVtU3RyKTtcbiAgICAgICAgaWYgKCFtYXRjaCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiRXJyb3IgY29udmVydGluZyBmcm9tIG51bWJlciB0byBGcmFjdGlvbi5cIik7XG4gICAgICAgIH1cbiAgICAgICAgY29uc3QgZnJhY1N0ciA9IG1hdGNoWzNdO1xuICAgICAgICBjb25zdCBkZW5vbWluYXRvciA9IE1hdGgucG93KDEwLCBmcmFjU3RyLmxlbmd0aCk7XG4gICAgICAgIGNvbnN0IG51bWVyYXRvciAgID0gd2hvbGUgKiBkZW5vbWluYXRvciArIHBhcnNlSW50KGZyYWNTdHIsIDEwKSAqIG5lZ2F0aXZlQWRqdXN0ZXI7XG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24obnVtZXJhdG9yLCBkZW5vbWluYXRvcik7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgc3RhdGljIGNvbXBhcmUoYTogRnJhY3Rpb24gfCBudW1iZXIsIGI6IEZyYWN0aW9uIHwgbnVtYmVyKTogbnVtYmVyXG4gICAge1xuICAgICAgICAvLyBJZiBib3RoIGFyZSBudW1iZXJzLCBkbyBpdCBxdWljayBhbmQgZWFzeS5cbiAgICAgICAgaWYgKHR5cGVvZiBhID09PSBcIm51bWJlclwiICYmIHR5cGVvZiBiID09PSBcIm51bWJlclwiKSB7XG4gICAgICAgICAgICBpZiAoYSA8IGIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gLTE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChiIDwgYSkge1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIDA7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBmcmFjQSA9IHRvRnJhY3Rpb24oYSk7XG4gICAgICAgIGNvbnN0IGZyYWNCID0gdG9GcmFjdGlvbihiKTtcblxuICAgICAgICBjb25zdCBjcm9zc0EgPSBmcmFjQS5fbnVtICogZnJhY0IuX2RlbjtcbiAgICAgICAgY29uc3QgY3Jvc3NCID0gZnJhY0EuX2RlbiAqIGZyYWNCLl9udW07XG5cbiAgICAgICAgaWYgKGNyb3NzQSA8IGNyb3NzQikge1xuICAgICAgICAgICAgcmV0dXJuIC0xO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGNyb3NzQiA8IGNyb3NzQSkge1xuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLy8gcmVnaW9uIEluc3RhbmNlIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX251bTogbnVtYmVyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2RlbjogbnVtYmVyO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKG51bTogbnVtYmVyLCBkZW46IG51bWJlcilcbiAgICB7XG4gICAgICAgIHRoaXMuX251bSA9IG51bTtcbiAgICAgICAgdGhpcy5fZGVuID0gZGVuO1xuXG4gICAgICAgIC8vIERvbid0IGxldCB0aGUgZGVub21pbmF0b3IgYmUgbmVnYXRpdmUuICBJZiBpdCBpcywgdGhlbiBmbGlwIHRoZSBzaWduXG4gICAgICAgIC8vIG9mIGJvdGggdGhlIG51bWVyYXRvciBhbmQgZGVub21pbmF0b3IuXG4gICAgICAgIGlmICh0aGlzLl9kZW4gPCAwKSB7XG4gICAgICAgICAgICB0aGlzLl9kZW4gPSB0aGlzLl9kZW4gKiAtMTtcbiAgICAgICAgICAgIHRoaXMuX251bSA9IHRoaXMuX251bSAqIC0xO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoaW1wcm9wZXI6IGJvb2xlYW4gPSBmYWxzZSk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuX251bSA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIFwiMFwiO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKGltcHJvcGVyKSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7dGhpcy5fbnVtfS8ke3RoaXMuX2Rlbn1gO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgY29uc3Qgd2hvbGUgPSB0aGlzLndob2xlUGFydCgpO1xuICAgICAgICAgICAgaWYgKHdob2xlID09PSAwKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGAke3RoaXMuX251bX0vJHt0aGlzLl9kZW59YDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIC8vIFRoZSBgd2hvbGVgIHZhcmlhYmxlIHdpbGwgY29udGFpbiB0aGUgc2lnbi5cbiAgICAgICAgICAgICAgICBjb25zdCByZW1haW5kZXIgPSBNYXRoLmFicyh0aGlzLl9udW0pICUgdGhpcy5fZGVuO1xuICAgICAgICAgICAgICAgIGNvbnN0IHN0ciA9IHJlbWFpbmRlciA9PT0gMCA/IGAke3dob2xlfWAgOiBgJHt3aG9sZX0gJHtyZW1haW5kZXJ9LyR7dGhpcy5fZGVufWA7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHN0cjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgd2hvbGUgcGFydCBvZiB0aGlzIGZyYWN0aW9uXG4gICAgICogQHJldHVybiBUaGUgd2hvbGUgcGFydCBvZiB0aGlzIGZyYWN0aW9uLiAgSWYgdGhpcyBmcmFjdGlvbiBpcyBuZWdhdGl2ZVxuICAgICAqIGFuZCB0aGUgd2hvbGUgcGFydCBpcyBub24temVybywgdGhlIHJldHVybmVkIHZhbHVlIHdpbGwgYmUgbmVnYXRpdmUuXG4gICAgICovXG4gICAgcHVibGljIHdob2xlUGFydCgpOiBudW1iZXJcbiAgICB7XG4gICAgICAgIGxldCB3aG9sZTogbnVtYmVyID0gTWF0aC5mbG9vcihNYXRoLmFicyh0aGlzLl9udW0pIC8gdGhpcy5fZGVuKTtcblxuICAgICAgICAvLyBNYWtlIHRoZSBzaWduIGNvcnJlY3QuICBCdHcsIHdlIGFyZSBjaGVja2luZyBmb3Igd2hvbGUgIT09IDAgYmVjYXVzZVxuICAgICAgICAvLyAwICogLTEgaXMgLTAgYW5kIHdlIHdhbnQganVzdCBwbGFpbiAwLlxuICAgICAgICBpZiAoKHRoaXMuX251bSA8IDApICYmICh3aG9sZSAhPT0gMCkpIHtcbiAgICAgICAgICAgIHdob2xlID0gd2hvbGUgKiAtMTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gd2hvbGU7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZXR1cm4gdGhlIGZyYWN0aW9uYWwgcGFydCBvZiB0aGlzIGZyYWN0aW9uXG4gICAgICogQHJldHVybiBUaGUgZnJhY3Rpb25hbCBwYXJ0IG9mIHRoaXMgZnJhY3Rpb24uICBJZiB0aGlzIGZyYWN0aW9uXG4gICAgICovXG4gICAgcHVibGljIGZyYWN0aW9uYWxQYXJ0KCk6IEZyYWN0aW9uXG4gICAge1xuICAgICAgICBsZXQgbnVtID0gdGhpcy5fbnVtICUgdGhpcy5fZGVuO1xuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGFzc2lnbm1lbnQgc2VlbXMgdW5uZWNlc3NhcnksIGJ1dCBpdCBpcyBuZWVkZWQgdG9cbiAgICAgICAgLy8gcHJldmVudCBudW0gZnJvbSBiZWluZyAtMC5cbiAgICAgICAgbnVtID0gbnVtIHx8IDA7XG4gICAgICAgIHJldHVybiBuZXcgRnJhY3Rpb24obnVtLCB0aGlzLl9kZW4pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGNoYW5nZURlbm9taW5hdG9yKG5ld0Rlbm9taW5hdG9yOiBudW1iZXIpOiBGcmFjdGlvblxuICAgIHtcbiAgICAgICAgaWYgKChuZXdEZW5vbWluYXRvciA8PSAwKSB8fCAhXy5pc1NhZmVJbnRlZ2VyKG5ld0Rlbm9taW5hdG9yKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiV2hlbiBjaGFuZ2luZyB0aGUgZGVub21pbmF0b3IsIHRoZSBuZXcgdmFsdWUgbXVzdCBiZSBhIHBvc2l0aXZlIGludGVnZXIuXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgcmVkdWNlZCA9IHRoaXMucmVkdWNlKCk7XG4gICAgICAgIGlmIChuZXdEZW5vbWluYXRvciAlIHJlZHVjZWQuX2Rlbikge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY2hhbmdlIGZyYWN0aW9uIGRlbm9taW5hdG9yIHRvICR7bmV3RGVub21pbmF0b3J9IHdpdGhvdXQgbW9kaWZ5aW5nIHZhbHVlLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3Qgc2NhbGUgPSBuZXdEZW5vbWluYXRvciAvIHJlZHVjZWQuX2RlbjtcbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbihyZWR1Y2VkLl9udW0gKiBzY2FsZSwgcmVkdWNlZC5fZGVuICogc2NhbGUpO1xuICAgIH1cblxuXG4gICAgcHVibGljIHJlY2lwcm9jYWwoKTogRnJhY3Rpb25cbiAgICB7XG4gICAgICAgIGlmICh0aGlzLl9udW0gPT09IDApIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkNhbm5vdCBjcmVhdGUgYSByZWNpcHJvY2FsIHRoYXQgd291bGQgcmVzdWx0IGluIGEgZGVub21pbmF0b3IgdmFsdWUgb2YgMC5cIik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbih0aGlzLl9kZW4sIHRoaXMuX251bSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcmVkdWNlKCk6IEZyYWN0aW9uXG4gICAge1xuICAgICAgICBjb25zdCBnY2QgPSBncmVhdGVzdENvbW1vbkRpdmlzb3IodGhpcy5fbnVtLCB0aGlzLl9kZW4pO1xuICAgICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKHRoaXMuX251bSAvIGdjZCwgdGhpcy5fZGVuIC8gZ2NkKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBlcXVhbHMob3RoZXI6IG51bWJlcik6IGJvb2xlYW47XG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogRnJhY3Rpb24pOiBib29sZWFuO1xuICAgIHB1YmxpYyBlcXVhbHMob3RoZXI6IEZyYWN0aW9uIHwgbnVtYmVyKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgY29uc3QgY29tcGFyZVJlc3VsdCA9IEZyYWN0aW9uLmNvbXBhcmUodGhpcywgb3RoZXIpO1xuICAgICAgICByZXR1cm4gY29tcGFyZVJlc3VsdCA9PT0gMDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBpc0xlc3NUaGFuKG90aGVyOiBudW1iZXIpOiBib29sZWFuO1xuICAgIHB1YmxpYyBpc0xlc3NUaGFuKG90aGVyOiBGcmFjdGlvbik6IGJvb2xlYW47XG4gICAgcHVibGljIGlzTGVzc1RoYW4ob3RoZXI6IEZyYWN0aW9uIHwgbnVtYmVyKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgY29uc3QgY29tcGFyZVJlc3VsdCA9IEZyYWN0aW9uLmNvbXBhcmUodGhpcywgb3RoZXIpO1xuICAgICAgICByZXR1cm4gY29tcGFyZVJlc3VsdCA8IDA7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaXNMZXNzVGhhbk9yRXF1YWxUbyhvdGhlcjogbnVtYmVyIHwgRnJhY3Rpb24pOiBib29sZWFuXG4gICAge1xuICAgICAgICBjb25zdCBjb21wYXJlUmVzdWx0ID0gRnJhY3Rpb24uY29tcGFyZSh0aGlzLCBvdGhlcik7XG4gICAgICAgIHJldHVybiBjb21wYXJlUmVzdWx0IDw9IDA7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgaXNHcmVhdGVyVGhhbihvdGhlcjogbnVtYmVyKTogYm9vbGVhbjtcbiAgICBwdWJsaWMgaXNHcmVhdGVyVGhhbihvdGhlcjogRnJhY3Rpb24pOiBib29sZWFuO1xuICAgIHB1YmxpYyBpc0dyZWF0ZXJUaGFuKG90aGVyOiBGcmFjdGlvbiB8IG51bWJlcik6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIGNvbnN0IGNvbXBhcmVSZXN1bHQgPSBGcmFjdGlvbi5jb21wYXJlKHRoaXMsIG90aGVyKTtcbiAgICAgICAgcmV0dXJuIGNvbXBhcmVSZXN1bHQgPiAwO1xuICAgIH1cblxuXG4gICAgcHVibGljIGlzR3JlYXRlclRoYW5PckVxdWFsVG8ob3RoZXI6IG51bWJlciB8IEZyYWN0aW9uKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgY29uc3QgY29tcGFyZVJlc3VsdCA9IEZyYWN0aW9uLmNvbXBhcmUodGhpcywgb3RoZXIpO1xuICAgICAgICByZXR1cm4gY29tcGFyZVJlc3VsdCA+PSAwO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFkZChvdGhlcjogRnJhY3Rpb24pOiBGcmFjdGlvbjtcbiAgICBwdWJsaWMgYWRkKG90aGVyOiBudW1iZXIpOiBGcmFjdGlvbjtcbiAgICBwdWJsaWMgYWRkKG90aGVyOiBGcmFjdGlvbiB8IG51bWJlcik6IEZyYWN0aW9uXG4gICAge1xuICAgICAgICBjb25zdCBvdGhlckZyYWMgPSB0b0ZyYWN0aW9uKG90aGVyKTtcbiAgICAgICAgY29uc3QgbGNtID0gbGVhc3RDb21tb25NdWx0aXBsZSh0aGlzLl9kZW4sIG90aGVyRnJhYy5fZGVuKTtcblxuICAgICAgICBjb25zdCB0aGlzU2NhbGUgPSBsY20gIC8gdGhpcy5fZGVuO1xuICAgICAgICBjb25zdCB0aGlzTnVtID0gdGhpcy5fbnVtICogdGhpc1NjYWxlO1xuXG4gICAgICAgIGNvbnN0IG90aGVyU2NhbGUgPSBsY20gLyBvdGhlckZyYWMuX2RlbjtcbiAgICAgICAgY29uc3Qgb3RoZXJOdW0gPSBvdGhlckZyYWMuX251bSAqIG90aGVyU2NhbGU7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBGcmFjdGlvbih0aGlzTnVtICsgb3RoZXJOdW0sIGxjbSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgc3VidHJhY3Qob3RoZXI6IEZyYWN0aW9uKTogRnJhY3Rpb247XG4gICAgcHVibGljIHN1YnRyYWN0KG90aGVyOiBudW1iZXIpOiBGcmFjdGlvbjtcbiAgICBwdWJsaWMgc3VidHJhY3Qob3RoZXI6IEZyYWN0aW9uIHwgbnVtYmVyKTogRnJhY3Rpb25cbiAgICB7XG4gICAgICAgIGNvbnN0IG90aGVyRnJhYyA9IHRvRnJhY3Rpb24ob3RoZXIpO1xuICAgICAgICBjb25zdCBsY20gPSBsZWFzdENvbW1vbk11bHRpcGxlKHRoaXMuX2Rlbiwgb3RoZXJGcmFjLl9kZW4pO1xuXG4gICAgICAgIGNvbnN0IHRoaXNTY2FsZSA9IGxjbSAgLyB0aGlzLl9kZW47XG4gICAgICAgIGNvbnN0IHRoaXNOdW0gPSB0aGlzLl9udW0gKiB0aGlzU2NhbGU7XG5cbiAgICAgICAgY29uc3Qgb3RoZXJTY2FsZSA9IGxjbSAvIG90aGVyRnJhYy5fZGVuO1xuICAgICAgICBjb25zdCBvdGhlck51bSA9IG90aGVyRnJhYy5fbnVtICogb3RoZXJTY2FsZTtcblxuICAgICAgICByZXR1cm4gbmV3IEZyYWN0aW9uKHRoaXNOdW0gLSBvdGhlck51bSwgbGNtKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBtdWx0aXBseShvdGhlcjogRnJhY3Rpb24pOiBGcmFjdGlvbjtcbiAgICBwdWJsaWMgbXVsdGlwbHkob3RoZXI6IG51bWJlcik6IEZyYWN0aW9uO1xuICAgIHB1YmxpYyBtdWx0aXBseShvdGhlcjogRnJhY3Rpb24gfCBudW1iZXIpOiBGcmFjdGlvblxuICAgIHtcbiAgICAgICAgY29uc3Qgb3RoZXJGcmFjID0gdG9GcmFjdGlvbihvdGhlcik7XG4gICAgICAgIGNvbnN0IG51bSA9IHRoaXMuX251bSAqIG90aGVyRnJhYy5fbnVtO1xuICAgICAgICBjb25zdCBkZW4gPSB0aGlzLl9kZW4gKiBvdGhlckZyYWMuX2RlbjtcbiAgICAgICAgY29uc3QgcHJvZHVjdCA9IG5ldyBGcmFjdGlvbihudW0sIGRlbik7XG4gICAgICAgIGNvbnN0IHJlc3VsdCA9IHByb2R1Y3QucmVkdWNlKCk7XG4gICAgICAgIHJldHVybiByZXN1bHQ7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZGl2aWRlKG90aGVyOiBudW1iZXIpOiBGcmFjdGlvbjtcbiAgICBwdWJsaWMgZGl2aWRlKG90aGVyOiBGcmFjdGlvbik6IEZyYWN0aW9uO1xuICAgIHB1YmxpYyBkaXZpZGUob3RoZXI6IG51bWJlciB8IEZyYWN0aW9uKTogRnJhY3Rpb25cbiAgICB7XG4gICAgICAgIGNvbnN0IGZyYWNPdGhlciA9IHRvRnJhY3Rpb24ob3RoZXIpO1xuICAgICAgICBjb25zdCByZXN1bHQgPSB0aGlzLm11bHRpcGx5KGZyYWNPdGhlci5yZWNpcHJvY2FsKCkpO1xuICAgICAgICByZXR1cm4gcmVzdWx0O1xuICAgIH1cblxuXG4gICAgcHVibGljIHRvTnVtYmVyKCk6IG51bWJlciB7XG4gICAgICAgIHJldHVybiB0aGlzLl9udW0gLyB0aGlzLl9kZW47XG4gICAgfVxuXG5cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gdG9GcmFjdGlvbih2YWw6IG51bWJlciB8IEZyYWN0aW9uIHwgc3RyaW5nKTogRnJhY3Rpb25cbntcbiAgICBpZiAodHlwZW9mIHZhbCA9PT0gXCJudW1iZXJcIikge1xuICAgICAgICByZXR1cm4gRnJhY3Rpb24uZnJvbU51bWJlcih2YWwpO1xuICAgIH1cbiAgICBlbHNlIGlmICh0eXBlb2YgdmFsID09PSBcInN0cmluZ1wiKSB7XG4gICAgICAgIHJldHVybiBGcmFjdGlvbi5mcm9tU3RyaW5nKHZhbCk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gdmFsO1xuICAgIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gZ3JlYXRlc3RDb21tb25EaXZpc29yKGE6IG51bWJlciwgYjogbnVtYmVyKTogbnVtYmVyXG57XG4gICAgaWYgKGEgPT09IDAgJiYgYiA9PT0gMCkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJDYW5ub3QgY2FsY3VsYXRlIGdyZWF0ZXN0IGNvbW1vbiBkaXZvc29yIG9mIDAuXCIpO1xuICAgIH1cblxuICAgIC8vIEZvciBpbmZvcm1hdGlvbiBvbiBnY2QoMCwgaykgc2VlOlxuICAgIC8vIGh0dHA6Ly9tZmxlY2suY3MuaWxsaW5vaXMuZWR1L2J1aWxkaW5nLWJsb2Nrcy92ZXJzaW9uLTEuMC9udW1iZXItdGhlb3J5LnBkZlxuICAgIGlmIChhID09PSAwKSB7XG4gICAgICAgIHJldHVybiBiO1xuICAgIH1cbiAgICBlbHNlIGlmIChiID09PSAwKSB7XG4gICAgICAgIHJldHVybiBhO1xuICAgIH1cbiAgICBlbHNlIHtcbiAgICAgICAgYSA9IE1hdGguYWJzKGEpO1xuICAgICAgICBiID0gTWF0aC5hYnMoYik7XG4gICAgICAgIGlmIChiID4gYSkge1xuICAgICAgICAgICAgW2EsIGJdID0gW2IsIGFdO1xuICAgICAgICB9XG4gICAgICAgIHdoaWxlICh0cnVlKSB7XG4gICAgICAgICAgICBpZiAoYiA9PT0gMCkgeyByZXR1cm4gYTsgfVxuICAgICAgICAgICAgYSAlPSBiO1xuICAgICAgICAgICAgaWYgKGEgPT09IDApIHsgcmV0dXJuIGI7IH1cbiAgICAgICAgICAgIGIgJT0gYTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gbGVhc3RDb21tb25NdWx0aXBsZShhOiBudW1iZXIsIGI6IG51bWJlcik6IG51bWJlclxue1xuICAgIGlmIChhID09PSAwIHx8IGIgPT09IDApIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuICAgIHJldHVybiBNYXRoLmFicyhhICogYikgLyBncmVhdGVzdENvbW1vbkRpdmlzb3IoYSwgYik7XG59XG4iXX0=
