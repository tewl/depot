import { errorToString } from "./errorHelpers";


describe("errorToString()", () => {

    it("returns the string when given a string", () => {
        expect(errorToString("baz")).toEqual("baz");
    });

    it("returns the message property when given an Error instance", () => {
        expect(errorToString(new Error("quux"))).toEqual("quux");
    });


    it("returns the message property when given a non-Error object that has a string 'message' property", () => {
        expect(errorToString({message: "foo"})).toEqual("foo");
    });


    it("returns the JSON representation of the error when no 'message' property is present", () => {
        expect(errorToString({first: "Fred"})).toEqual('{"first":"Fred"}');
    });

});
