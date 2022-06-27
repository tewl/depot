import * as path from "path";
import {tmpDir} from "../test/ut/specHelpers";
import {getFilesystemItem, resolveFileLocation} from "./filesystemHelpers";
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
            // Correctly rejected.
        }
    });


});


describe("resolveFileLocation()", () => {

    beforeEach(() => {
        tmpDir.ensureExistsSync();
        tmpDir.emptySync();
    });


    it("resolves with the expected file when the file is found in the starting directory", async () => {
        const searchFile = new File(tmpDir, "foo.txt");
        searchFile.writeSync("search file");

        const result = await resolveFileLocation("foo.txt", tmpDir);
        expect(result.succeeded).toBeTruthy();
        if (result.succeeded) {
            expect(result.value.fileName).toEqual("foo.txt");
            expect(result.value.directory.equals(tmpDir)).toBeTruthy();
        }
    });


    it("resolves with the expected file when the file is found in a parent directory", async () => {
        const searchFile = new File(tmpDir, "foo.txt");
        searchFile.writeSync("search file");

        const dirA = new Directory(tmpDir, "dirA");
        dirA.ensureExistsSync();
        const dirB = new Directory(dirA, "dirB");
        dirB.ensureExistsSync();
        const dirC = new Directory(dirB, "dirC");
        dirC.ensureExistsSync();

        const result = await resolveFileLocation("foo.txt", dirC);
        expect(result.succeeded).toBeTruthy();
        if (result.succeeded) {
            expect(result.value.fileName).toEqual("foo.txt");
            expect(result.value.directory.equals(tmpDir)).toBeTruthy();
        }
    });


    // The following unit test is commented out, because on Windows I get
    // a permissions error when trying to create a file in C:\.
    //
    // xit("resolves with the expected file when the file is found in the drive root", async () => {
    //     const searchFile = new File("c:", "depotUnitTestFile.txt");
    //     searchFile.writeSync("depot unit test file");
    //
    //     const result = await resolveFileLocation(searchFile.fileName, tmpDir);
    //     expect(succeeded(result)).toBeTruthy();
    //     if (succeeded(result)) {
    //         expect(result.value.fileName).toEqual(searchFile.fileName);
    //         expect(result.value.absPath()).toEqual("c:\\depotUnitTestFile.txt");
    //     }
    //
    //     searchFile.deleteSync();
    // });


    it("resolves with a failed result when the file is not found", async () => {
        const result = await resolveFileLocation("aFileThatShouldNeverBeFound.txt", tmpDir);
        expect(result.failed).toBeTruthy();
        if (result.failed) {
            expect(result.error.length).toBeGreaterThan(0);
        }
    });

});
