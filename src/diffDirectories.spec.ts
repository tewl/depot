import * as _ from "lodash";
import { tmpDir } from "../test/ut/specHelpers";
import { File } from "./file";
import { Directory } from "./directory";
import { diffDirectories } from "./diffDirectories";


describe("diffDirectories()", async () => {

    let leftDir:  Directory;
    let rightDir: Directory;

    describe("", () => {

        beforeEach(() => {
            tmpDir.emptySync();

            leftDir = new Directory(tmpDir, "left");
            rightDir = new Directory(tmpDir, "right");

            //
            // A file that is only in the left directory.
            //
            const leftOnly = new File(leftDir, "leftSubdir", "leftOnly.txt");
            leftOnly.writeSync("left only");

            //
            // A file that is only in the right directory.
            //
            const rightOnly = new File(rightDir, "rightSubdir", "rightOnly.txt");
            rightOnly.writeSync("right only");

            //
            // A file that is in both left and right.
            //
            const leftBoth = new File(leftDir, "both", "both.txt");
            leftBoth.writeSync("left both");

            const rightBoth = new File(rightDir, "both", "both.txt");
            rightBoth.writeSync("right both");

            //
            // A common directory that contains different files in left and right.
            // Setting up this situation will help us check that the returned result
            // will be sorted so that the left and right unique files will appear
            // next to one another.
            //
            const commonDirLeft = new Directory(leftDir, "zCommonDir");
            const commonDirLeftFile = new File(commonDirLeft, "commonDirLeftUnique.txt");
            commonDirLeftFile.writeSync("left common dir unique file");

            const commonDirRight = new Directory(rightDir, "zCommonDir");
            const commonDirRightFile = new File(commonDirRight, "commonDirRightUnique.txt");
            commonDirRightFile.writeSync("right common dir unique file");
        });


        it("returns the expected results", async () => {
            const diffDirFiles = await diffDirectories(leftDir, rightDir);
            expect(diffDirFiles.length).toEqual(5);

            // Note:  All items should be sorted according to their relative path.

            expect(diffDirFiles[0].relativeFilePath).toEqual("both/both.txt");
            expect(diffDirFiles[0].isLeftOnly).toEqual(false);
            expect(diffDirFiles[0].isRightOnly).toEqual(false);
            expect(diffDirFiles[0].isInBoth).toEqual(true);

            expect(diffDirFiles[1].relativeFilePath).toEqual("leftSubdir/leftOnly.txt");
            expect(diffDirFiles[1].isLeftOnly).toEqual(true);
            expect(diffDirFiles[1].isRightOnly).toEqual(false);
            expect(diffDirFiles[1].isInBoth).toEqual(false);

            // This right-only file will only preceded the following left-only file
            // (commonDirLeftUnique.txt) when the results array is sorted.
            expect(diffDirFiles[2].relativeFilePath).toEqual("rightSubdir/rightOnly.txt");
            expect(diffDirFiles[2].isLeftOnly).toEqual(false);
            expect(diffDirFiles[2].isRightOnly).toEqual(true);
            expect(diffDirFiles[2].isInBoth).toEqual(false);

            expect(diffDirFiles[3].relativeFilePath).toEqual("zCommonDir/commonDirLeftUnique.txt");
            expect(diffDirFiles[3].isLeftOnly).toEqual(true);
            expect(diffDirFiles[3].isRightOnly).toEqual(false);
            expect(diffDirFiles[3].isInBoth).toEqual(false);

            expect(diffDirFiles[4].relativeFilePath).toEqual("zCommonDir/commonDirRightUnique.txt");
            expect(diffDirFiles[4].isLeftOnly).toEqual(false);
            expect(diffDirFiles[4].isRightOnly).toEqual(true);
            expect(diffDirFiles[4].isInBoth).toEqual(false);
        });


    });



    describe("", () => {

        let leftDir:  Directory;
        let rightDir: Directory;

        let leftOnly:  File;
        let rightOnly: File;


        beforeEach(() => {
            tmpDir.emptySync();

            leftDir = new Directory(tmpDir, "left");
            rightDir = new Directory(tmpDir, "right");

            // A left-only file that should be sorted after the right-only file.
            leftOnly = new File(leftDir, "bbbLeftOnly.txt");
            leftOnly.writeSync("bbbLeftOnly");

            // A right-only file that should be sorted before the left-only
            // file.
            rightOnly = new File(rightDir, "aaaRightOnly.txt");
            rightOnly.writeSync("aaaRightOnly");
        });


        it("sorts the results according to each file's relative path", async () => {
            const results = await diffDirectories(leftDir, rightDir);

            expect(results.length).toEqual(2);

            expect(results[0].relativeFilePath).toEqual("aaaRightOnly.txt");
            expect(results[1].relativeFilePath).toEqual("bbbLeftOnly.txt");
        });


    });



});