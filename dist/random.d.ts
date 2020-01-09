/**
 * Returns a random (floating point) number between 0 (included) and 1 (excluded)
 * @returns The generated random floating point number
 */
export declare function getRandom(): number;
/**
 * Returns a random (floating point) number.
 * @param minIncluded - The minimum possible value
 * @param maxExcluded - The maximum value
 * @returns The generated random floating point number
 */
export declare function getRandomFloat(minIncluded: number, maxExcluded: number): number;
/**
 * Returns a random integer between minIncluded and maxExcluded
 * @param minIncluded - The minimum possible value
 * @param maxExcluded - The maximum possible value
 * @returns The generated random integer
 */
export declare function getRandomInt(minIncluded: number, maxExcluded: number): number;
/**
 * Returns a random integer between minIncluded and maxIncluded
 * @param minIncluded - The minimum possible value
 * @param maxIncluded - The maximum possible value
 * @returns The generated random integer
 */
export declare function getRandomIntInclusive(minIncluded: number, maxIncluded: number): number;
