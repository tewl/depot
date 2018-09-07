import * as path from "path";
import * as fs from "fs";
import {spawn} from "./spawn";
import {tmpDir} from "../test/ut/specHelpers";


describe("spawn", () => {

    beforeEach(() => {
        tmpDir.emptySync();
    });


    it("will run the specified command", (done) => {
        const testFilePath = path.join(tmpDir.absPath(), "foo.txt");
        spawn("touch", ["foo.txt"], tmpDir.absPath()).closePromise
        .then(() => {
            const stats = fs.statSync(testFilePath);
            expect(stats.isFile()).toBeTruthy();
            done();
        });
    });


    it("will resolve with the stdout text", (done) => {
        spawn("touch", ["foo.txt"], tmpDir.absPath()).closePromise
        .then(() => {
            return spawn("ls", [], tmpDir.absPath()).closePromise;
        })
        .then((output) => {
            expect(output).toContain("foo.txt");
            done();
        });
    });


    it("provides access to the underlying child process", (done) => {
        const spawnResult = spawn("sleep", ["10"], tmpDir.absPath());
        spawnResult.childProcess.kill();
        spawnResult.closePromise
        .then(() => {
            fail("closePromise should reject when the child process is killed.");
        })
        .catch((reason) => {
            expect(reason.exitCode).toEqual(null);
            expect(reason.stderr).toEqual("");
            done();
        });
    });


    // it("will run multiple child processes at once", (done) => {
    //
    //     // The following examples demonstrate how to use the description string
    //     // and streams to achieve different output scenarios.
    //
    //     // The following example:
    //     // - shows header and footer
    //     // - pipes output through a PrefixStream and then to this process's steams
    //     //
    //     // Promise.all([
    //     //     spawn("ls", ["-a", "."    ], ".", "ls .    ",
    //     //         new CombinedStream(new PrefixStream(".    "), process.stdout),
    //     //         new CombinedStream(new PrefixStream(".    "), process.stderr)),
    //     //     spawn("ls", ["-a", ".."   ], ".", "ls ..   ",
    //     //         new CombinedStream(new PrefixStream("..   "), process.stdout),
    //     //         new CombinedStream(new PrefixStream("..   "), process.stderr)),
    //     //     spawn("ls", ["-a", "../.."], ".", "ls ../..",
    //     //         new CombinedStream(new PrefixStream("../.."), process.stdout),
    //     //         new CombinedStream(new PrefixStream("../.."), process.stdout))
    //     // ])
    //
    //     // The following example:
    //     // - shows header and footer
    //     // - pipes output to this process's streams
    //     //
    //     // Promise.all([
    //     //     spawn("ls", ["-a", "."    ], ".", "ls .    ",
    //     //         process.stdout,
    //     //         process.stderr),
    //     //     spawn("ls", ["-a", ".."   ], ".", "ls ..   ",
    //     //         process.stdout,
    //     //         process.stderr),
    //     //     spawn("ls", ["-a", "../.."], ".", "ls ../..",
    //     //         process.stdout,
    //     //         process.stdout)
    //     // ])
    //
    //     // The following example:
    //     // - shows header and footer
    //     // - does not show command output
    //     //
    //     // Promise.all([
    //     //     spawn("ls", ["-a", "."    ], ".", "ls .    "),
    //     //     spawn("ls", ["-a", ".."   ], ".", "ls ..   "),
    //     //     spawn("ls", ["-a", "../.."], ".", )
    //     // ])
    //
    //     // The following example:
    //     // - does not show a header or footer
    //     // - does not show command output
    //     //
    //     // Promise.all([
    //     //     spawn("ls", ["-a", "."    ], "."),
    //     //     spawn("ls", ["-a", ".."   ], "."),
    //     //     spawn("ls", ["-a", "../.."], ".")
    //     // ])
    //
    //     .then(done);
    // });


    it("provides the exit code and stderr when the command fails", (done) => {
        const nonExistantFilePath = path.join(tmpDir.absPath(), "xyzzy.txt");
        spawn("cat", [nonExistantFilePath], ".").closePromise
        .catch((err) => {
            expect(err).toBeTruthy();
            expect(err.exitCode).not.toEqual(0);
            expect(err.stderr).toContain("No such file or directory");
            done();
        });
    });


});
