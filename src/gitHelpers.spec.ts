import {gitUrlToProjectName} from "./gitHelpers";


describe("gitUrlToProjectName()", () => {

    it("returns the expected project name", () => {
        expect(gitUrlToProjectName("git+https://github.com/tewl/depot.git")).toEqual("depot");
    });


    it("throws when given an invalid Git URL", () => {
        expect(() => {
            gitUrlToProjectName("not a valid git url");
        }).toThrow();
    });


});
