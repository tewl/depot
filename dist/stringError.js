"use strict";
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

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zdHJpbmdFcnJvci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiO0FBQUEsK0RBQStEO0FBQy9ELDJFQUEyRTtBQUczRTs7Ozs7OztHQU9HO0FBQ0gsaUVBQWlFO0FBQ2pFLElBQUk7QUFDSixVQUFVO0FBQ1YsaURBQWlEO0FBQ2pELFVBQVU7QUFDVix5REFBeUQ7QUFDekQsRUFBRTtBQUNGLEVBQUU7QUFDRixVQUFVO0FBQ1YsK0VBQStFO0FBQy9FLCtDQUErQztBQUMvQyxzRUFBc0U7QUFDdEUsMEVBQTBFO0FBQzFFLG9FQUFvRTtBQUNwRSxVQUFVO0FBQ1Ysa0ZBQWtGO0FBQ2xGLHNDQUFzQztBQUN0QyxrRkFBa0Y7QUFDbEYsd0RBQXdEO0FBQ3hELHlDQUF5QztBQUN6Qyw4REFBOEQ7QUFDOUQsRUFBRTtBQUNGLHdDQUF3QztBQUN4QyxRQUFRO0FBQ1IsSUFBSTtBQUdKOzs7O0dBSUc7QUFDSCxzRUFBc0U7QUFDdEUscUNBQXFDO0FBQ3JDLG1EQUFtRDtBQUNuRCxJQUFJIiwiZmlsZSI6InN0cmluZ0Vycm9yLmpzIiwic291cmNlc0NvbnRlbnQiOlsiLy8gVE9ETzogUmVkZXNpZ24gdGhpcyBjbGFzcyB1c2luZyBsaWtlIHRoZSBleGFtcGxlIHNob3duIGhlcmU6XG4vLyAgICAgaHR0cHM6Ly9iYXNhcmF0LmdpdGJvb2tzLmlvL3R5cGVzY3JpcHQvZG9jcy90eXBlcy9saXRlcmFsLXR5cGVzLmh0bWxcblxuXG4vKipcbiAqIEFuIGVycm9yIGNsYXNzIHRoYXQgd3JhcHMgYSBzdHJpbmcgZXJyb3IgY29kZSBkZWZpbmVkIGluIGEgdW5pb24gdHlwZS5cbiAqIEEgdW5pb24gb2Ygc3RyaW5nIGxpdGVyYWwgdHlwZXMgaXMgdXNlZCBiZWNhdXNlIGl0IGhhcyB0aGUgYWR2YW50YWdlIHRoYXRcbiAqIFR5cGVTY3JpcHQgY2FuIGNoZWNrIGZvciBleGhhdXN0aXZlbmVzcy5cbiAqXG4gKiBGb3IgYW4gZXhhbXBsZSBvZiBob3cgdG8gYmVzdCB1dGlsaXplIHRoaXMgY2xhc3MsIHNlZSB0aGUgYXNzb2NpYXRlZCBzcGVjXG4gKiBmaWxlLlxuICovXG4vLyBleHBvcnQgY2xhc3MgU3RyaW5nRXJyb3I8U3RyaW5nTGl0ZXJhbFVuaW9uVHlwZT4gZXh0ZW5kcyBFcnJvclxuLy8ge1xuLy8gICAgIC8qKlxuLy8gICAgICAqIFRoZSBlcnJvciBzdHJpbmcgcmVwcmVzZW50aW5nIHRoZSBlcnJvclxuLy8gICAgICAqL1xuLy8gICAgIHB1YmxpYyByZWFkb25seSBlcnJvckNvZGU6IFN0cmluZ0xpdGVyYWxVbmlvblR5cGU7XG4vL1xuLy9cbi8vICAgICAvKipcbi8vICAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IFN0cmluZ0Vycm9yIGluc3RhbmNlIHRoYXQgd3JhcHMgdGhlIHNwZWNpZmllZCBzdHJpbmdcbi8vICAgICAgKiBsaXRlcmFsIGZyb20gdGhlIHRlbXBsYXRlZCB1bmlvbiB0eXBlXG4vLyAgICAgICogQHBhcmFtIGVycm9yU3RyaW5nIC0gVGhlIGVycm9yIHN0cmluZyByZXByZXNlbnRpbmcgdGhlIGVycm9yXG4vLyAgICAgICogQHBhcmFtIG1lc3NhZ2UgLSBBbiBvcHRpb25hbCBzdHJpbmcgZnVydGhlciBkZXNjcmliaW5nIHRoZSBlcnJvclxuLy8gICAgICAqIGNvbmRpdGlvbnMuICBJZiBub3Qgc3BlY2lmaWVkLCBgZXJyb3JTdHJpbmdgIHdpbGwgYmUgdXNlZC5cbi8vICAgICAgKi9cbi8vICAgICBwdWJsaWMgY29uc3RydWN0b3IoZXJyb3JTdHJpbmc6IFN0cmluZ0xpdGVyYWxVbmlvblR5cGUsIG1lc3NhZ2U/OiBzdHJpbmcpIHtcbi8vICAgICAgICAgLy8gQ2hhaW4gdG8gdGhlIGJhc2UgY2xhc3MuXG4vLyAgICAgICAgIC8vIFVuZm9ydHVuYXRlbHksIHRoZXJlIGlzIGEgd2VpcmQgaXNzdWUgcmVsYXRlZCB0byBleHRlbmRpbmcgRXJyb3IgYW5kXG4vLyAgICAgICAgIC8vIHRhcmdldGluZyBFUzUuICBTZWU6IGh0dHA6Ly9iaXQubHkvMndEdTBYUFxuLy8gICAgICAgICBzdXBlcihtZXNzYWdlIHx8IGVycm9yU3RyaW5nKTtcbi8vICAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIFN0cmluZ0Vycm9yLnByb3RvdHlwZSk7XG4vL1xuLy8gICAgICAgICB0aGlzLmVycm9yQ29kZSA9IGVycm9yU3RyaW5nO1xuLy8gICAgIH1cbi8vIH1cblxuXG4vKipcbiAqIFVzZXItZGVmaW5lZCB0eXBlIGd1YXJkIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIGB2YWxgIGlzIGEgU3RyaW5nRXJyb3I8VD4uXG4gKiBAcGFyYW0gdmFsIC0gVGhlIHZhbHVlIHRvIGJlIHRlc3RlZFxuICogQHJldHVybiB0cnVlIGlmIGB2YWxgIGlzIGEgU3RyaW5nRXJyb3I8VD4uIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuLy8gZXhwb3J0IGZ1bmN0aW9uIGlzU3RyaW5nRXJyb3I8VD4odmFsOiBhbnkpOiB2YWwgaXMgU3RyaW5nRXJyb3I8VD4ge1xuLy8gICAgIHJldHVybiB2YWwgaW5zdGFuY2VvZiBFcnJvciAmJlxuLy8gICAgICAgICAgICAodmFsIGFzIGFueSkuZXJyb3JDb2RlICE9PSB1bmRlZmluZWQ7XG4vLyB9XG4iXX0=
