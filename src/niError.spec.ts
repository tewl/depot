import { assertNever } from "./never";
import { NIError } from "./niError";
import { FailedResult, Result } from "./result";


describe("NIError", () => {
    describe("Usage", () => {

        describe("with string error codes", () => {
            function buildCastle1():
                Result<void,
                    NIError<"BurnedDown"> | NIError<"FellOver"> | NIError<"SankIntoSwamp">> {
                return new FailedResult( new NIError("SankIntoSwamp"));
            }


            it("does exhaustiveness checking", () => {
                const res = buildCastle1();
                if (res.failed) {
                    if (res.error.code === "BurnedDown") {
                        // eslint-disable-next-line no-empty
                    }
                    else if (res.error.code === "FellOver") {
                        // eslint-disable-next-line no-empty
                    }
                    else if (res.error.code === "SankIntoSwamp") {
                        // eslint-disable-next-line no-empty
                    }
                    else {
                        // If any of the above cases are omitted, the following code
                        // will fail to compile.
                        assertNever(res.error);
                    }
                }
            });
        });


        describe("with enum error codes", () => {
            enum BuildCastleError {
                BurnedDown,
                FellOver,
                SankIntoSwamp
            }

            function buildCastle2():
                Result<void, NIError<BuildCastleError>> {
                return new FailedResult(new NIError(BuildCastleError.FellOver, "Optional error details."));
            }


            it("does exhaustiveness checking", () => {
                const res = buildCastle2();
                if (res.failed) {
                    if (res.error.code === BuildCastleError.BurnedDown) {
                        // eslint-disable-next-line no-empty
                    }
                    else if (res.error.code === BuildCastleError.FellOver) {
                        // eslint-disable-next-line no-empty
                    }
                    else if (res.error.code === BuildCastleError.SankIntoSwamp) {
                        // eslint-disable-next-line no-empty
                    }
                    else {
                        // If any of the above cases are omitted, the following code
                        // will fail to compile.
                        assertNever(res.error.code);
                    }
                }
            });
        });
    });


    describe("instnace", () => {
        describe("toString()", () => {
            it("Produces expected string when there is no message", () => {
                const errA = new NIError("ERR_A");
                expect(errA.toString()).toEqual("Error ERR_A");
            });


            it("Produces expected string when there is a message", () => {
                const errA = new NIError("ERR_A", "Specific message.");
                expect(errA.toString()).toEqual("Error ERR_A: Specific message.");
            });
        });
    });
});
