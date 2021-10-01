import {Validator} from "./validator";


function dotNotAllowedAsync(subject: string): Promise<boolean> {
    const dotFound = subject.indexOf(".") >= 0;
    return Promise.resolve(!dotFound);
}


function dollarNotAllowedSync(subject: string): boolean {
    const dollarFound = subject.indexOf("$") >= 0;
    return !dollarFound;
}


function containsSecretAsync(subject: string): Promise<boolean> {
    const containsSecret = subject.indexOf("xyzzy") >= 0;
    return Promise.resolve(containsSecret);
}


describe("Validator", () => {


    describe("static", () => {


        describe("constructor", () => {


            it("will create a new instance", () => {
                expect(new Validator([dotNotAllowedAsync])).toBeTruthy();
            });


        });
    });


    describe("instance", () => {


        describe("isValid()", () => {


            it("will return false when a sync validator finds a problem", async () => {
                const validator = new Validator([dotNotAllowedAsync, dollarNotAllowedSync, containsSecretAsync]);
                expect(await validator.isValid("this $ is invalid")).toBeFalsy();
            });


            it("will return false when an async validator finds a problem", async () => {
                const validator = new Validator([dotNotAllowedAsync, dollarNotAllowedSync, containsSecretAsync]);
                expect(await validator.isValid("this . is invalid")).toBeFalsy();
            });


            it("will return true when all validators succeed", async () => {
                const validator = new Validator([dotNotAllowedAsync, dollarNotAllowedSync, containsSecretAsync]);
                expect(await validator.isValid("no dots, no dollars, contains secrety xyzzy")).toBeTruthy();
            });


        });


    });


});
