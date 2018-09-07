import * as pathHelpers from "../src/pathHelpers";
import {Directory} from "../src/directory";


describe("reducePathParts()", () => {


    it("should join the path parts", () => {
        const resultPath: string = pathHelpers.reducePathParts(["foo", "bar", "baz.txt"]);
        expect(resultPath).toEqual("foo/bar/baz.txt");
    });


    it("will discard items preceding any Directory object", () => {
        const result: string = pathHelpers.reducePathParts([
            "foo",
            new Directory("bar"),
            "baz.txt"]);
        expect(result).toEqual("bar/baz.txt");
    });


});
