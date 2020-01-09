"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * A function that can be called to verify that code is exhaustive in testing
 * for all possible variants.  A compiler error will result if not exhaustive.
 * See: http://www.typescriptlang.org/docs/handbook/advanced-types.html
 *
 * @example
 * function area(s: Shape) {
 *     switch (s.kind) {
 *         case "square":    return s.size * s.size;
 *         case "rectangle": return s.height * s.width;
 *         case "circle":    return Math.PI * s.radius ** 2;
 *         default: return assertNever(s); // error here if there are missing cases
 *     }
 * }
 *
 * @param x - The value to be tested for exhaustiveness
 * @return description
 */
function assertNever(x) {
    throw new Error("Unexpected object: " + x);
}
exports.assertNever = assertNever;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBOzs7Ozs7Ozs7Ozs7Ozs7OztHQWlCRztBQUNILFNBQWdCLFdBQVcsQ0FBQyxDQUFRO0lBQ2hDLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQXFCLEdBQUcsQ0FBQyxDQUFDLENBQUM7QUFDL0MsQ0FBQztBQUZELGtDQUVDIiwiZmlsZSI6Im5ldmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBBIGZ1bmN0aW9uIHRoYXQgY2FuIGJlIGNhbGxlZCB0byB2ZXJpZnkgdGhhdCBjb2RlIGlzIGV4aGF1c3RpdmUgaW4gdGVzdGluZ1xuICogZm9yIGFsbCBwb3NzaWJsZSB2YXJpYW50cy4gIEEgY29tcGlsZXIgZXJyb3Igd2lsbCByZXN1bHQgaWYgbm90IGV4aGF1c3RpdmUuXG4gKiBTZWU6IGh0dHA6Ly93d3cudHlwZXNjcmlwdGxhbmcub3JnL2RvY3MvaGFuZGJvb2svYWR2YW5jZWQtdHlwZXMuaHRtbFxuICpcbiAqIEBleGFtcGxlXG4gKiBmdW5jdGlvbiBhcmVhKHM6IFNoYXBlKSB7XG4gKiAgICAgc3dpdGNoIChzLmtpbmQpIHtcbiAqICAgICAgICAgY2FzZSBcInNxdWFyZVwiOiAgICByZXR1cm4gcy5zaXplICogcy5zaXplO1xuICogICAgICAgICBjYXNlIFwicmVjdGFuZ2xlXCI6IHJldHVybiBzLmhlaWdodCAqIHMud2lkdGg7XG4gKiAgICAgICAgIGNhc2UgXCJjaXJjbGVcIjogICAgcmV0dXJuIE1hdGguUEkgKiBzLnJhZGl1cyAqKiAyO1xuICogICAgICAgICBkZWZhdWx0OiByZXR1cm4gYXNzZXJ0TmV2ZXIocyk7IC8vIGVycm9yIGhlcmUgaWYgdGhlcmUgYXJlIG1pc3NpbmcgY2FzZXNcbiAqICAgICB9XG4gKiB9XG4gKlxuICogQHBhcmFtIHggLSBUaGUgdmFsdWUgdG8gYmUgdGVzdGVkIGZvciBleGhhdXN0aXZlbmVzc1xuICogQHJldHVybiBkZXNjcmlwdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gYXNzZXJ0TmV2ZXIoeDogbmV2ZXIpOiBuZXZlciB7XG4gICAgdGhyb3cgbmV3IEVycm9yKFwiVW5leHBlY3RlZCBvYmplY3Q6IFwiICsgeCk7XG59XG4iXX0=
