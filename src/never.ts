/**
 * A function that can be called to verify that code is exhaustive in testing
 * for all possible variants.  A compiler error will result if not exhaustive.
 * See: https://basarat.gitbooks.io/typescript/docs/types/discriminated-unions.html
 *
 * @example
 * function area(s: Shape) {
 *     switch (s.kind) {
 *         case "square":    return s.size * s.size;
 *         case "rectangle": return s.height * s.width;
 *         case "circle":    return Math.PI * s.radius ** 2;
 *         default:          return assertNever(s); // error here if there are missing cases
 *     }
 * }
 *
 * @param x - The value to be tested for exhaustiveness
 * @return Nothing is returned.  This function always throws an Error.
 */
export function assertNever(x: never): never {
    throw new Error("Object failed exhaustiveness check: " + JSON.stringify(x, undefined, 4));
}
