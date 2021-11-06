import * as path from "path";
import * as cp from "child_process";
import * as fs from "fs";
import * as _ from "lodash";
import {isISpawnExitError, isISpawnSystemError, spawn} from "./spawn2";
import {tmpDir} from "../test/ut/specHelpers";
import {getOs, OperatingSystem} from "./os";
import {failed, succeeded} from "./result";
import {File} from "./file";


describe("spawn", () => {

    beforeEach(() =>
    {
        tmpDir.emptySync();
    });


    it("will run the specified command", async () =>
    {
        const os = getOs();
        const options: cp.SpawnOptions = { cwd: tmpDir.absPath() };
        let cmd = "ls";
        if (os === OperatingSystem.Windows)
        {
            options.shell = true;
            cmd = "dir";
        }
        const testFilePath = path.join(tmpDir.absPath(), "foo.txt");
        const spawnResult = await spawn(cmd, [">", "foo.txt"], options).closePromise;
        expect(succeeded(spawnResult)).toBeTruthy();
        const stats = fs.statSync(testFilePath);
        expect(stats.isFile()).toBeTruthy();
    });


    it("will resolve with the stdout text", async () =>
    {
        const existingFile = new File(tmpDir, "existingfile.txt");
        existingFile.writeSync("This is an existing file that should appear in the following ls.");

        const os = getOs();
        const options: cp.SpawnOptions = { cwd: tmpDir.absPath() };
        let lsCmd = "ls";
        if (os === OperatingSystem.Windows)
        {
            options.shell = true;
            lsCmd = "dir";
        }

        const spawnResult = await spawn(lsCmd, [], options).closePromise;
        expect(succeeded(spawnResult)).toBeTruthy();
        expect(spawnResult.value).toContain("existingfile.txt");
    });


    it("provides access to the underlying child process", async () =>
    {
        let cmd: string;
        let args: Array<string>;

        if (getOs() === OperatingSystem.Windows) {
            cmd = "c:\\Program Files\\Git\\bin\\sh.exe";
            args = [
                "-c ",
                "sleep 10"   // Must be supplied as a single argument
            ];
        }
        else {
            cmd = "sleep";
            args = ["10"];
        }

        const output = spawn(cmd, args, {cwd: tmpDir.absPath()});
        output.childProcess.kill();
        const result = await output.closePromise;
        expect(failed(result)).toBeTruthy();

        if (!isISpawnExitError(result.error)) {
            throw new Error("Unexpected type.");
        }

        expect(result.error.exitCode).toEqual(null);
        expect(result.error.stderr).toEqual("");
    });


    it("provides the exit code and stderr when the command fails", async () =>
    {
        const nonExistantFilePath = path.join(tmpDir.absPath(), "xyzzy.txt");
        const os = getOs();
        const lsCmd = os === OperatingSystem.Windows ? "dir" : "ls";
        const options = os === OperatingSystem.Windows ? {shell: true} : undefined;
        const result = await spawn(lsCmd, [nonExistantFilePath], options).closePromise;
        expect(failed(result)).toBeTruthy();

        if (!isISpawnExitError(result.error))
        {
            throw new Error("Unexpected type.");
        }

        expect(result.error.exitCode).not.toEqual(0);
        const windowsMsgRegex = "File Not Found";
        const macMsgRegex = "No such file or directory";
        expect(
            result.error.stderr.includes(windowsMsgRegex) ||
            result.error.stderr.includes(macMsgRegex)
        ).toBeTruthy();
    });


    it("provides the expected system error information when the process fails to start", async () =>
    {
        const result = await spawn("notarealcommand.exe", []).closePromise;
        expect(failed(result)).toBeTruthy();

        if (!isISpawnSystemError(result.error)) {
            throw new Error("Unexpected type.");
        }

        expect(result.error.code).toEqual("ENOENT");
    });


    it("will set the specified environment variables", async () =>
    {
        const env = _.assign({}, process.env, {xyzzy: "xyzzy-xyzzy"});
        const result =
            await spawn("node", ["-e", "console.log(process.env.xyzzy);"], {env: env})
            .closePromise;

        expect(succeeded(result)).toBeTruthy();
        expect(result.value).toEqual("xyzzy-xyzzy");
    });


});
