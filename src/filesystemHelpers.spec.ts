import * as path from "path";
import {tmpDir} from "../test/ut/specHelpers";
import {getFilesystemItem} from "./filesystemHelpers";
import {File} from "./file";
import {Directory} from "./directory";


describe("getFilesystemItem()", () => {


    beforeEach(() => {
        tmpDir.emptySync();
    });


    it("resolves with a File when the path represents a file", async () => {
        const file = new File(tmpDir, "test.txt");
        file.writeSync("hello");

        const fsItem = await getFilesystemItem(path.join("tmp", "test.txt"));
        expect(fsItem instanceof File).toBeTruthy();
    });


    it("resolves with a Directory when the path represents a directory", async () => {
        const dir = new Directory(tmpDir, "test");
        dir.ensureExistsSync();

        const fsItem = await getFilesystemItem(path.join("tmp", "test"));
        expect(fsItem instanceof Directory).toBeTruthy();
    });


    it("rejects when the specified item does not exist", async () => {
        try {
            await getFilesystemItem(path.join("tmp", "does-not-exist"));
            fail("The preceding line should have rejected.");
        }
        catch (err) {
        }
    });


});
