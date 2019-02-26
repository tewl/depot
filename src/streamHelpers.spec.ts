import {createReadStream} from "fs";
import {tmpDir} from "../test/ut/specHelpers";
import {File} from "./file";
import {readableStreamToText} from "./streamHelpers";


describe("readableStreamToText()", () => {


    it("will resolve with the text in the readable stream", async () => {
        const inputFile = new File(tmpDir, "inputFile.txt");
        inputFile.writeSync("hello xyzzy");
        const theStream = createReadStream(inputFile.toString());

        const text = await readableStreamToText(theStream);
        expect(text).toEqual("hello xyzzy");
    });


});

