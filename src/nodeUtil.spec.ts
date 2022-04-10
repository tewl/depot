import {constants} from "fs";
import * as _ from "lodash";
import {tmpDir} from "../test/ut/specHelpers";
import {File} from "./file";
import {makeNodeScriptExecutable, createCmdLaunchScript} from "./nodeUtil";
import {splitIntoLines} from "./stringHelpers";
import {getOs, OperatingSystem} from "./os";

describe("makeNodeScriptExecutable()", () => {

    const scriptFile = new File(tmpDir, "hello.js");
    beforeEach(() => {
        tmpDir.emptySync();

        // language=JavaScript
        scriptFile.writeSync("console.log(\"hello\");");
    });


    it("will add the shebang line to the beginning of the script", (done) => {
        makeNodeScriptExecutable(scriptFile)
        .then((scriptFile) => {
            const text = scriptFile.readSync();
            const lines = splitIntoLines(text);
            expect(lines.length).toEqual(2);
            expect(_.startsWith(lines[0], "#!")).toEqual(true);
            expect(_.startsWith(lines[1], "console.log")).toEqual(true);
            done();
        });
    });


    it("will make the file executable", (done) => {
        // The Node.js documentation states "on Windows only the write
        // permission can be changed."  Therefore, this test will not be run on
        // Windows.
        if (getOs() === OperatingSystem.Windows) {
            done();
        }
        else {
            // Before making it executable, none of the executable bits should be
            // set.
            const beforeStats = scriptFile.existsSync();
            expect(beforeStats).toBeTruthy();
            expect(beforeStats!.mode & constants.S_IXUSR).toEqual(0);
            expect(beforeStats!.mode & constants.S_IXGRP).toEqual(0);
            expect(beforeStats!.mode & constants.S_IXOTH).toEqual(0);

            makeNodeScriptExecutable(scriptFile)
            .then((scriptFile) => {
                // After making it executable, all execute bits should be set.
                const afterStats = scriptFile.existsSync();
                expect(afterStats).toBeTruthy();
                expect(afterStats!.mode & constants.S_IXUSR).toEqual(constants.S_IXUSR);
                expect(afterStats!.mode & constants.S_IXGRP).toEqual(constants.S_IXGRP);
                expect(afterStats!.mode & constants.S_IXOTH).toEqual(constants.S_IXOTH);
                done();
            });
        }
    });


});


describe("createCmdLaunchScript()", () => {

    const jsScriptFile = new File(tmpDir, "nodeScript.js");


    beforeEach(() => {
        tmpDir.emptySync();
        jsScriptFile.writeSync("console.log(\"hello\");");
    });


    it("will create the associated .cmd file", async () => {
        const cmdFile = await createCmdLaunchScript(jsScriptFile);
        expect(cmdFile.existsSync()).toBeDefined();
    });


    it("will create a .cmd file that contains code to launch the specified js file", async () => {
        const cmdFile = await createCmdLaunchScript(jsScriptFile);
        const cmdContents = cmdFile.readSync();

        expect(_.includes(cmdContents, jsScriptFile.fileName)).toBeTruthy();
    });


    it("returns a file representing the newly created .cmd file", async () => {
        const cmdFile = await createCmdLaunchScript(jsScriptFile);
        expect(cmdFile).toBeDefined();
        expect(cmdFile.directory.toString()).toEqual(jsScriptFile.directory.toString());
        expect(cmdFile.fileName).toEqual(jsScriptFile.baseName + ".cmd");
    });


    it("will overwrite and existing .cmd file", async () => {
        const preexistingCmdFile = new File(jsScriptFile.directory, jsScriptFile.baseName + ".cmd");
        const preexistingText = "preexisting";
        preexistingCmdFile.writeSync(preexistingText);

        const newCmdFile = await createCmdLaunchScript(jsScriptFile);
        const newText = newCmdFile.readSync();
        expect(newText).not.toEqual(preexistingText);
    });


});
