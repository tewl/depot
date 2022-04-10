import {toGulpError, IGulpError} from "./gulpHelpers";


describe("toGulpError", () => {

    it("sets showStack to false", () => {
        const err = new Error("foo") as IGulpError;
        expect(toGulpError(err).showStack).toEqual(false);
    });


    it("uses the message when the error object has one", () => {
        const err = new Error("foo");
        expect(toGulpError(err).message).toEqual("foo");
    });


    it("uses the default error message when the error object does not have one", () => {
        const err = new Error();
        expect(toGulpError(err).message).toEqual("Gulp encountered one or more errors.");
    });


});
