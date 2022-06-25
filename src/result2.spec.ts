import { assertNever } from "./never";
import { FailedResult, Result, SuccessResult } from "./result2";


describe("SuccessResult", () => {

    describe("instance", () => {


        describe("value property", () => {

            it("returns the value specified during creation", () => {
                const res = new SuccessResult(12);
                expect(res.value).toEqual(12);
            });

        });


        describe("succeeded property", () => {

            it("returns true", () => {
                const res = new SuccessResult(12);
                expect(res.succeeded).toBeTrue();
            });

        });

        describe("failed property", () => {

            it("returns false", () => {
                const res = new SuccessResult(12);
                expect(res.failed).toBeFalse();
            });

        });


        describe("failed property", () => {

            it("returns false", () => {
                const res = new SuccessResult(12);
                expect(res.failed).toBeFalse();
            });

        });


        describe("toString()", () => {

            it("returns the expected string", () => {
                const res = new SuccessResult(12);
                expect(res.toString()).toEqual("Successful Result (12)");
            });

        });
    });
});


describe("FailedResult", () => {

    describe("instance", () => {


        describe("error property", () => {

            it("returns the error specified during creation", () => {
                const res = new FailedResult("Error message");
                expect(res.error).toEqual("Error message");
            });

        });


        describe("succeeded property", () => {

            it("returns false", () => {
                const res = new FailedResult("Error message");
                expect(res.succeeded).toBeFalse();
            });

        });


        describe("failed property", () => {

            it("returns true", () => {
                const res = new FailedResult("Error message");
                expect(res.failed).toBeTrue();
            });

        });


        describe("failed property", () => {

            it("returns true", () => {
                const res = new FailedResult("Error message");
                expect(res.failed).toBeTrue();
            });

        });


        describe("toString()", () => {

            it("returns the expected string", () => {
                const res = new FailedResult("Error message");
                expect(res.toString()).toEqual("Failed Result (Error message)");
            });

        });
    });

});


describe("Result", () => {

    function doSomething(): Result<number, string> {
        return new SuccessResult(5);
        // return new FailedResult("Error message.");
    }


    it("status can be easily deciphered", () => {

        const res = doSomething();
        if (res.succeeded) {
            const val = res.value;
        }
        else {
            const val = res.error;
        }
    });


    it("allows compiler exhaustiveness checking", () => {

        // The following code will not compile if res.succeeded cannot be
        // exhaustively checked.

        const res = doSomething();

        switch (res.succeeded) {
            case true:
                return 1;
                break;
            case false:
                return 2;
                break;
            default:
                return assertNever(res);
        }
    });
});
