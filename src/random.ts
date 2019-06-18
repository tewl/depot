//
// Note
// ----
// The following functions were taken from:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/random
// These functions do not produce cryptographically strong random values.
//
// To get cryptographically string random numbers, use window.crypto.getRandomValues().
//


/**
 * Returns a random (floating point) number between 0 (included) and 1 (excluded)
 * @returns The generated random floating point number
 */
export function getRandom(): number {
    "use strict";
    return Math.random();
}


/**
 * Returns a random (floating point) number.
 * @param minIncluded - The minimum possible value
 * @param maxExcluded - The maximum value
 * @returns The generated random floating point number
 */
export function getRandomFloat(minIncluded: number, maxExcluded: number): number {
    "use strict";
    return Math.random() * (maxExcluded - minIncluded) + minIncluded;
}


/**
 * Returns a random integer between minIncluded and maxExcluded
 * @param minIncluded - The minimum possible value
 * @param maxExcluded - The maximum possible value
 * @returns The generated random integer
 */
export function getRandomInt(minIncluded: number, maxExcluded: number): number {
    "use strict";
    // Using Math.round() will give you a non-uniform distribution!
    return Math.floor(Math.random() * (maxExcluded - minIncluded)) + minIncluded;
}


/**
 * Returns a random integer between minIncluded and maxIncluded
 * @param minIncluded - The minimum possible value
 * @param maxIncluded - The maximum possible value
 * @returns The generated random integer
 */
export function getRandomIntInclusive(minIncluded: number, maxIncluded: number): number {
    "use strict";
    // Using Math.floor() instead of Math.round(), because Math.round() will
    // give you a non-uniform distribution!
    return Math.floor(Math.random() * (maxIncluded - minIncluded + 1)) + minIncluded;
}


//
// Note: There is no shuffle() here, because it is available in Lodash.
//
