/**
 * An error class that wraps a string error code defined in a union type.
 * A union of string literal types is used because it has the advantage that
 * TypeScript can check for exhaustiveness.
 *
 * For an example of how to best utilize this class, see the associated spec
 * file.
 */
/**
 * User-defined type guard that determines whether `val` is a StringError<T>.
 * @param val - The value to be tested
 * @return true if `val` is a StringError<T>. false otherwise.
 */
