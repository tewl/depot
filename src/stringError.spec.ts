// import {isStringError, StringError} from "./stringError";
// import {assertNever} from "./never";
//
//
// // A union of string literals that represent all possible errors.
// type BuildCastleError = "BURNED_DOWN" | "FELL_OVER" | "SANK_INTO_SWAMP";
//
//
// function buildCastle(): Promise<void> {
//     return reject("FELL_OVER");
//
//     // A helper function to make sure that we only return errors of the desired
//     // type (since promises always treat errors as `any`).
//     function reject(err: BuildCastleError): Promise<never> {
//         return Promise.reject(new StringError<BuildCastleError>(err));
//     }
// }
//
//
// describe("StringError", () => {
//
//
//     it("Will emit compile-time errors as expected", (done) => {
//
//         //
//         // This unit test is here in order to experiment with code and to make
//         // sure the expected compiler errors are observed.  This unit test does
//         // not test any behavior.
//         //
//
//         buildCastle()
//         .catch((err: StringError<BuildCastleError>) => {
//
//             // The following is needed if you don't define the type of err
//             // above.
//             //
//             // if (!isStringError<BuildCastleError>(err)) {
//             //     // Rethrow if we got an unexpected error type.
//             //     throw err;
//             // }
//
//             switch (err.errorCode)
//             {
//                 case "BURNED_DOWN":
//                     break;
//
//                 case "FELL_OVER":
//                     break;
//
//                 // If you comment out the following case...break, there should
//                 // be an error on the assertNever() call stating that "Arugment
//                 // of type "SANK_INTO_SWAMP" is not assignable to parameter of
//                 // type 'never'."
//                 case "SANK_INTO_SWAMP":
//                     break;
//
//                 default:
//                     assertNever(err.errorCode);
//             }
//
//             done();
//         });
//     });
//
//
//     describe("instances", () => {
//
//         it("are Error objects", () => {
//             const err = new StringError<BuildCastleError>("FELL_OVER");
//             expect(err instanceof Error).toEqual(true);
//         });
//
//
//         it("will have a `errorCode` property set to the specified value", () => {
//             const err = new StringError<BuildCastleError>("FELL_OVER");
//             expect(err.errorCode).toEqual("FELL_OVER");
//         });
//
//
//         it("will have the expected `message` value when one is not specified", () => {
//             const err = new StringError<BuildCastleError>("FELL_OVER");
//             expect(err.message).toEqual("FELL_OVER");
//         });
//
//
//         it("will have the expected `message` value when one is specified", () => {
//             const err = new StringError<BuildCastleError>("FELL_OVER", "foo");
//             expect(err.message).toEqual("foo");
//         });
//
//
//     });
//
// });
//
//
// describe("isStringError()", () => {
//
//
//     it("returns true when given a StringError", () => {
//         const err = new StringError<BuildCastleError>("FELL_OVER");
//         expect(isStringError(err)).toEqual(true);
//     });
//
//
//     it("returns false when given something that is not a StringError", () => {
//         const err = new Error("foo");
//         expect(isStringError(err)).toEqual(false);
//     });
//
//
// });
