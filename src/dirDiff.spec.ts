import * as fs from "fs/promises";
import { tmpDir } from "../test/ut/specHelpers";
import { DirDiff, DirDiffItemExtantFile, DirDiffItemNonextantFile, FileFingerprint } from "./dirDiff";
import { Directory } from "./directory";
import { File } from "./file";


describe("FileFingerprint", () => {

    describe("instance", () => {

        describe("file property", () => {

            it("returns the file that was specified during construction", () => {
                const file = new File("test.txt");
                const fp = new FileFingerprint(file);
                expect(fp.file.toString()).toEqual("test.txt");
            });

        });


        describe("equals()", () => {

            let fileA: File;
            let fileB: File;

            beforeEach(() => {
                tmpDir.emptySync();
                fileA = new File(tmpDir, "fileA.txt");
                fileA.writeSync("content");
                fileB = fileA.copySync(new File(tmpDir, "fileB.txt"));
            });


            it("returns a failed Result when this instance file does not exist", async () => {
                const fpA = new FileFingerprint(fileA);
                const fpB = new FileFingerprint(fileB);

                await fileA.delete();

                const res = await fpA.equals(fpB);
                expect(res.failed).toBeTrue();
            });


            it("returns a failed Result when other instance file does not exist", async () => {
                const fpA = new FileFingerprint(fileA);
                const fpB = new FileFingerprint(fileB);

                await fileB.delete();

                const res = await fpA.equals(fpB);
                expect(res.failed).toBeTrue();
            });


            it("returns false when the sizes are different", async () => {
                const fpA = new FileFingerprint(fileA);
                const fpB = new FileFingerprint(fileB);

                fpB.file.writeSync("different content");

                const res = await fpA.equals(fpB);
                expect(res.succeeded).toBeTrue();
                expect(res.value).toBeFalse();
            });


            it("returns false when the modified times are different", async () => {
                const fpA = new FileFingerprint(fileA);
                const fpB = new FileFingerprint(fileB);

                fpB.file.writeSync("content");

                const res = await fpA.equals(fpB);
                expect(res.succeeded).toBeTrue();
                expect(res.value).toBeFalse();
            });


            it("returns false when the contents are same size but different", async () => {
                const fpA = new FileFingerprint(fileA);
                const fpB = new FileFingerprint(fileB);

                // Change contents of B.
                fpB.file.writeSync("c0ntent");
                // Force the timestamps of both to those of A. We need to do
                // this for A as well, because the fractional part of the
                // timestamps are truncated by utimes().
                const aStats = (await fpA.file.exists())!;
                await fs.utimes(fpB.file.toString(), aStats.atime, aStats.mtime);
                await fs.utimes(fpA.file.toString(), aStats.atime, aStats.mtime);

                const res = await fpA.equals(fpB);
                expect(res.succeeded).toBeTrue();
                expect(res.value).toBeFalse();
            });


            it("returns true when the files are equivalent", async () => {
                const fpA = new FileFingerprint(fileA);
                const fpB = new FileFingerprint(fileB);

                // Force the timestamps of both to those of A. We need to do
                // this for A as well, because the fractional part of the
                // timestamps are truncated by utimes().
                const aStats = (await fpA.file.exists())!;
                await fs.utimes(fpB.file.toString(), aStats.atime, aStats.mtime);
                await fs.utimes(fpA.file.toString(), aStats.atime, aStats.mtime);

                const res = await fpA.equals(fpB);
                expect(res.succeeded).toBeTrue();
                expect(res.value).toBeTrue();
            });

        });

    });

});


describe("DirDiff", () => {

    describe("static", () => {

        describe("create()", () => {
            // Make the paths absolute to make sure that they are converted to relative
            // paths when their contents are being compared.

            // dirX (dirX)
            //     dirA (dirXA)
            //         file1.txt (fileXA1)
            // dirY (dirY)
            //     dirA (dirYA)
            //         file1.txt (fileYA1)

            const dirX = new Directory(tmpDir, "dirX").absolute();
            const dirXA = new Directory(dirX, "dirA");
            const fileXA1 = new File(dirXA, "file1.txt");

            const dirY = new Directory(tmpDir, "dirY").absolute();
            const dirYA = new Directory(dirY, "dirA");
            const fileYA1 = new File(dirYA, "file1.txt");


            beforeEach(() => {
                tmpDir.emptySync();

                dirX.ensureExistsSync();
                dirXA.ensureExistsSync();
                fileXA1.writeSync("file1");
                dirY.ensureExistsSync();
                dirYA.ensureExistsSync();
                fileYA1.writeSync("file1");
            });


            // TODO: Return a failure Result if either directory does not exist.


            it("can find files that are common", async () => {
                const dirDiff = await DirDiff.create(dirX, dirY);

                expect(dirDiff.items.length).toEqual(1);
                const item = dirDiff.items[0];
                expect(item.x instanceof DirDiffItemExtantFile).toBeTrue();
                expect(item.y instanceof DirDiffItemExtantFile).toBeTrue();
            });


            it("can find files that are unique to X", async () => {
                const fileXA2 = new File(dirXA, "file2.txt");
                fileXA2.writeSync("file2");

                const dirDiff = await DirDiff.create(dirX, dirY);
                const uniqueToX = dirDiff.items.filter((item) => item.y instanceof DirDiffItemNonextantFile);

                expect(uniqueToX.length).toEqual(1);
                expect(uniqueToX[0].x.file.fileName).toEqual("file2.txt");
            });


            it("can find files that are unique to Y", async () => {
                const fileYA2 = new File(dirYA, "file2.txt");
                fileYA2.writeSync("file2");

                const dirDiff = await DirDiff.create(dirX, dirY);
                const uniqueToY = dirDiff.items.filter((item) => item.x instanceof DirDiffItemNonextantFile);

                expect(uniqueToY.length).toEqual(1);
                expect(uniqueToY[0].y.file.fileName).toEqual("file2.txt");
            });
        });

    });

    describe("instance", () => {

        // Make the paths absolute to make sure that they are converted to relative
        // paths when their contents are being compared.

        // dirX (dirX)
        //     dirA (dirXA)
        //         file1.txt (fileXA1)
        // dirY (dirY)
        //     dirA (dirYA)
        //         file1.txt (fileYA1)

        const dirX = new Directory(tmpDir, "dirX").absolute();
        const dirXA = new Directory(dirX, "dirA");
        const fileXA1 = new File(dirXA, "file1.txt");

        const dirY = new Directory(tmpDir, "dirY").absolute();
        const dirYA = new Directory(dirY, "dirA");
        const fileYA1 = new File(dirYA, "file1.txt");


        beforeEach(() => {
            tmpDir.emptySync();

            dirX.ensureExistsSync();
            dirXA.ensureExistsSync();
            fileXA1.writeSync("file1");
            dirY.ensureExistsSync();
            dirYA.ensureExistsSync();
            fileYA1.writeSync("file1");
        });


        describe("syncXToY()", () => {
        });


        describe("syncYToX()", () => {
        });


        describe("flipXY()", () => {
        });

    });

});
