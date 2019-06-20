// TODO: Redesign this class using like the example shown here:
//     https://basarat.gitbooks.io/typescript/docs/types/literal-types.html


/**
 * An error class that wraps a string error code defined in a union type.
 * A union of string literal types is used because it has the advantage that
 * TypeScript can check for exhaustiveness.
 *
 * For an example of how to best utilize this class, see the associated spec
 * file.
 */
// export class StringError<StringLiteralUnionType> extends Error
// {
//     /**
//      * The error string representing the error
//      */
//     public readonly errorCode: StringLiteralUnionType;
//
//
//     /**
//      * Constructs a new StringError instance that wraps the specified string
//      * literal from the templated union type
//      * @param errorString - The error string representing the error
//      * @param message - An optional string further describing the error
//      * conditions.  If not specified, `errorString` will be used.
//      */
//     public constructor(errorString: StringLiteralUnionType, message?: string) {
//         // Chain to the base class.
//         // Unfortunately, there is a weird issue related to extending Error and
//         // targeting ES5.  See: http://bit.ly/2wDu0XP
//         super(message || errorString);
//         Object.setPrototypeOf(this, StringError.prototype);
//
//         this.errorCode = errorString;
//     }
// }


/**
 * User-defined type guard that determines whether `val` is a StringError<T>.
 * @param val - The value to be tested
 * @return true if `val` is a StringError<T>. false otherwise.
 */
// export function isStringError<T>(val: any): val is StringError<T> {
//     return val instanceof Error &&
//            (val as any).errorCode !== undefined;
// }
