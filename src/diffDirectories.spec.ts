import * as path from "path";
import * as _ from "lodash";
import * as BBPromise from "bluebird";
import { tmpDir } from "../test/ut/specHelpers";
import { File } from "./file";
import { Directory } from "./directory";
import { diffDirectories, ActionPriority, FileCompareActionType } from "./diffDirectories";


describe("diffDirectories()", async () => {


    describe("", () => {

        let leftDir: Directory;
        let rightDir: Directory;

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

            expect(diffDirFiles[0].relativeFilePath).toEqual(path.join("both", "both.txt"));
            expect((await diffDirFiles[0].isLeftOnly())).toEqual(false);
            expect((await diffDirFiles[0].isRightOnly())).toEqual(false);
            expect((await diffDirFiles[0].isInBoth())).toEqual(true);

            expect(diffDirFiles[1].relativeFilePath).toEqual(path.join("leftSubdir", "leftOnly.txt"));
            expect((await diffDirFiles[1].isLeftOnly())).toEqual(true);
            expect((await diffDirFiles[1].isRightOnly())).toEqual(false);
            expect((await diffDirFiles[1].isInBoth())).toEqual(false);

            // This right-only file will only preceded the following left-only file
            // (commonDirLeftUnique.txt) when the results array is sorted.
            expect(diffDirFiles[2].relativeFilePath).toEqual(path.join("rightSubdir", "rightOnly.txt"));
            expect((await diffDirFiles[2].isLeftOnly())).toEqual(false);
            expect((await diffDirFiles[2].isRightOnly())).toEqual(true);
            expect((await diffDirFiles[2].isInBoth())).toEqual(false);

            expect(diffDirFiles[3].relativeFilePath).toEqual(path.join("zCommonDir", "/commonDirLeftUnique.txt"));
            expect((await diffDirFiles[3].isLeftOnly())).toEqual(true);
            expect((await diffDirFiles[3].isRightOnly())).toEqual(false);
            expect((await diffDirFiles[3].isInBoth())).toEqual(false);

            expect(diffDirFiles[4].relativeFilePath).toEqual(path.join("zCommonDir", "commonDirRightUnique.txt"));
            expect((await diffDirFiles[4].isLeftOnly())).toEqual(false);
            expect((await diffDirFiles[4].isRightOnly())).toEqual(true);
            expect((await diffDirFiles[4].isInBoth())).toEqual(false);
        });


    });


    describe("", () => {

        let leftDir: Directory;
        let rightDir: Directory;

        beforeEach(() => {
            tmpDir.emptySync();

            leftDir = new Directory(tmpDir, "left");
            rightDir = new Directory(tmpDir, "right");

            // The left version of the file.
            const leftFile = new File(leftDir, "theFile.txt");
            leftFile.writeSync("theFile");

            // The (identical) right version of the file.
            const rightFile = leftFile.copySync(rightDir);
        });


        it("omits identical files by default",  async () => {
            const diffDirFiles = await diffDirectories(leftDir, rightDir);
            expect(diffDirFiles.length).toEqual(0);
        });


        it("will return an item with no actions for identical files",  async () => {
            const diffDirFiles = await diffDirectories(leftDir, rightDir, true);
            expect(diffDirFiles.length).toEqual(1);
            expect((await diffDirFiles[0].isInBoth())).toEqual(true);
            expect((await diffDirFiles[0].bothExistAndIdentical())).toEqual(true);
            expect((await diffDirFiles[0].actions(ActionPriority.PRESERVE)).length).toEqual(0);
        });

    });


    describe("when the left directory doesn't exist", () => {

        let leftDir: Directory;
        let rightDir: Directory;

        beforeEach(() => {
            tmpDir.emptySync();

            leftDir = new Directory(tmpDir, "left");  // Does not exist.

            rightDir = new Directory(tmpDir, "right");
            const rightFile = new File(rightDir, "rightOnly.txt");
            rightFile.writeSync("rightOnly");
        });


        it("returns the expected results", async () => {
            const diffDirFiles = await diffDirectories(leftDir, rightDir);
            expect(diffDirFiles.length).toEqual(1);
        });


    });


    describe("when the right directory doesn't exist", () => {

        let leftDir: Directory;
        let rightDir: Directory;

        beforeEach(() => {
            tmpDir.emptySync();

            leftDir = new Directory(tmpDir, "left");
            const leftFile = new File(leftDir, "leftOnly.txt");
            leftFile.writeSync("leftOnly");

            rightDir = new Directory(tmpDir, "right");  // Does not exist.
        });


        it("returns the expected results", async () => {
            const diffDirFiles = await diffDirectories(leftDir, rightDir);
            expect(diffDirFiles.length).toEqual(1);
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


    describe("", () => {

        let leftDir:  Directory;
        let rightDir: Directory;

        let leftOnlyFile:  File;
        let bothFileLeft:  File;
        let bothFileRight: File;
        let rightOnlyFile: File;

        beforeEach(() => {
            tmpDir.emptySync();

            leftDir  = new Directory(tmpDir, "left");
            rightDir = new Directory(tmpDir, "right");

            // A left-only file.
            leftOnlyFile = new File(leftDir, "leftOnly.txt");
            leftOnlyFile.writeSync("leftOnly");

            // A file that is in both left and right.
            bothFileLeft = new File(leftDir, "both.txt");
            bothFileLeft.writeSync("both - left");
            bothFileRight = new File(rightDir, "both.txt");
            bothFileRight.writeSync("both - right");

            // A right-only file.
            rightOnlyFile = new File(rightDir, "rightOnly.txt");
            rightOnlyFile.writeSync("rightOnly");

        });


        it("prioritizes actions appropriately when doing a left-to-right sync", async () => {
            const diffDirFileItems = await diffDirectories(leftDir, rightDir);

            expect(diffDirFileItems.length).toEqual(3);

            expect(diffDirFileItems[0].relativeFilePath).toEqual("both.txt");
            let actions = await diffDirFileItems[0].actions(ActionPriority.L_TO_R);
            expect(actions.length).toEqual(4);
            expect(actions[0].type).toEqual(FileCompareActionType.COPY_RIGHT);
            expect(actions[1].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[2].type).toEqual(FileCompareActionType.COPY_LEFT);
            expect(actions[3].type).toEqual(FileCompareActionType.DELETE_BOTH);

            expect(diffDirFileItems[1].relativeFilePath).toEqual("leftOnly.txt");
            actions = await diffDirFileItems[1].actions(ActionPriority.L_TO_R);
            expect(actions.length).toEqual(3);
            expect(actions[0].type).toEqual(FileCompareActionType.COPY_RIGHT);
            expect(actions[1].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[2].type).toEqual(FileCompareActionType.DELETE_LEFT);

            expect(diffDirFileItems[2].relativeFilePath).toEqual("rightOnly.txt");
            actions = await diffDirFileItems[2].actions(ActionPriority.L_TO_R);
            expect(actions.length).toEqual(3);
            expect(actions[0].type).toEqual(FileCompareActionType.DELETE_RIGHT);
            expect(actions[1].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[2].type).toEqual(FileCompareActionType.COPY_LEFT);
        });


        it("performs actions appropriately when doing a left-to-right sync", async () => {
            const diffDirFileItems = await diffDirectories(leftDir, rightDir);

            expect(diffDirFileItems.length).toEqual(3);
            const promises = _.map(diffDirFileItems, async (curDiffDirFileItem) => {
                // Execute the first action for each file item.
                return (await curDiffDirFileItem.actions(ActionPriority.L_TO_R))[0].execute();
            });

            await BBPromise.all(promises);

            // Check the state of the left directory.  It should be unchanged.
            expect(new File(leftDir, "leftOnly.txt").readSync()).toEqual("leftOnly");
            expect(new File(leftDir, "both.txt").readSync()).toEqual("both - left");
            expect(new File(leftDir, "rightOnly.txt").existsSync()).toEqual(undefined);

            // Check the state of the resulting right directory.
            expect(new File(rightDir, "leftOnly.txt").readSync()).toEqual("leftOnly");    // copied
            expect(new File(rightDir, "both.txt").readSync()).toEqual("both - left");     // copied
            expect(new File(rightDir, "rightOnly.txt").existsSync()).toEqual(undefined);  // deleted
        });


        it("prioritizes actions appropriately when doing a right-to-left sync", async () => {
            const diffDirFileItems = await diffDirectories(leftDir, rightDir);

            expect(diffDirFileItems.length).toEqual(3);

            expect(diffDirFileItems[0].relativeFilePath).toEqual("both.txt");
            let actions = await diffDirFileItems[0].actions(ActionPriority.R_TO_L);
            expect(actions.length).toEqual(4);
            expect(actions[0].type).toEqual(FileCompareActionType.COPY_LEFT);
            expect(actions[1].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[2].type).toEqual(FileCompareActionType.COPY_RIGHT);
            expect(actions[3].type).toEqual(FileCompareActionType.DELETE_BOTH);

            expect(diffDirFileItems[1].relativeFilePath).toEqual("leftOnly.txt");
            actions = await diffDirFileItems[1].actions(ActionPriority.R_TO_L);
            expect(actions.length).toEqual(3);
            expect(actions[0].type).toEqual(FileCompareActionType.DELETE_LEFT);
            expect(actions[1].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[2].type).toEqual(FileCompareActionType.COPY_RIGHT);

            expect(diffDirFileItems[2].relativeFilePath).toEqual("rightOnly.txt");
            actions = await diffDirFileItems[2].actions(ActionPriority.R_TO_L);
            expect(actions.length).toEqual(3);
            expect(actions[0].type).toEqual(FileCompareActionType.COPY_LEFT);
            expect(actions[1].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[2].type).toEqual(FileCompareActionType.DELETE_RIGHT);
        });


        it("performs actions appropriately when doing a right-to-left sync", async () => {
            const result = await diffDirectories(leftDir, rightDir);

            expect(result.length).toEqual(3);
            const promises = _.map(result, async (curDiffDirFileItem) => {
                // Execute the first action for each file item.
                return (await curDiffDirFileItem.actions(ActionPriority.R_TO_L))[0].execute();
            });

            await BBPromise.all(promises);

            // Check the state of the left directory.
            expect(new File(leftDir, "leftOnly.txt").existsSync()).toEqual(undefined);   // deleted
            expect(new File(leftDir, "both.txt").readSync()).toEqual("both - right");    // copied
            expect(new File(leftDir, "rightOnly.txt").readSync()).toEqual("rightOnly");  // copied

            // Check the state of the resulting right directory.  It should be unchanged.
            expect(new File(rightDir, "leftOnly.txt").existsSync()).toEqual(undefined);
            expect(new File(rightDir, "both.txt").readSync()).toEqual("both - right");
            expect(new File(rightDir, "rightOnly.txt").readSync()).toEqual("rightOnly");
        });


        it("prioritizes keeping files when ActionPriority.PRESERVE is specified", async () => {
            const result = await diffDirectories(leftDir, rightDir);

            expect(result.length).toEqual(3);

            expect(result[0].relativeFilePath).toEqual("both.txt");
            let actions = await result[0].actions(ActionPriority.PRESERVE);
            expect(actions.length).toEqual(4);
            expect(actions[0].type).toEqual(FileCompareActionType.COPY_RIGHT);
            expect(actions[1].type).toEqual(FileCompareActionType.COPY_LEFT);
            expect(actions[2].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[3].type).toEqual(FileCompareActionType.DELETE_BOTH);

            expect(result[1].relativeFilePath).toEqual("leftOnly.txt");
            actions = await result[1].actions(ActionPriority.PRESERVE);
            expect(actions.length).toEqual(3);
            expect(actions[0].type).toEqual(FileCompareActionType.COPY_RIGHT);
            expect(actions[1].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[2].type).toEqual(FileCompareActionType.DELETE_LEFT);

            expect(result[2].relativeFilePath).toEqual("rightOnly.txt");
            actions = await result[2].actions(ActionPriority.PRESERVE);
            expect(actions.length).toEqual(3);
            expect(actions[0].type).toEqual(FileCompareActionType.COPY_LEFT);
            expect(actions[1].type).toEqual(FileCompareActionType.SKIP);
            expect(actions[2].type).toEqual(FileCompareActionType.DELETE_RIGHT);
        });


        it("performs actions appropriately when doing a sync ActionPriority.PRESERVE is specified.",  async () => {
            const result = await diffDirectories(leftDir, rightDir);

            expect(result.length).toEqual(3);
            const promises = _.map(result, async (curDiffDirFileItem) => {
                // Execute the first action for each file item.
                return (await curDiffDirFileItem.actions(ActionPriority.PRESERVE))[0].execute();
            });

            await BBPromise.all(promises);

            // Check the state of the left directory.
            expect(new File(leftDir, "leftOnly.txt").readSync()).toEqual("leftOnly");    // unchanged
            expect(new File(leftDir, "both.txt").readSync()).toEqual("both - left");     // unchanged
            expect(new File(leftDir, "rightOnly.txt").readSync()).toEqual("rightOnly");  // copied

            // Check the state of the resulting right directory.
            expect(new File(rightDir, "leftOnly.txt").readSync()).toEqual("leftOnly");   // copied
            expect(new File(rightDir, "both.txt").readSync()).toEqual("both - left");    // copied
            expect(new File(rightDir, "rightOnly.txt").readSync()).toEqual("rightOnly"); // unchanged
        });


    });


});
