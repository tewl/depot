import * as _ from "lodash";
import * as BBPromise from "bluebird";
import {CollectorStream} from "./collectorStream";
import * as cp from "child_process";
import * as stream from "stream";
import {NullStream} from "./nullStream";
import {eventToPromise} from "./promiseHelpers";

export interface ISpawnResult
{
    /**
     * The underlying child process.  This is provided so that clients can do
     * things like kill() them.
     */
    childProcess: cp.ChildProcess;
    /**
     * A Promise that is resolved with the child process's trimmed output when
     * the exit code is 0 and is rejected when it is non-zero.
     */
    closePromise: Promise<string>;
}

/**
 * Spawns a child process.  Each stdout and stderr output line is prefixed with
 * the specified label.
 * @param description - A textual description of the command that is output when
 *     the child process starts
 * @param cmd - The command to run
 * @param args - An array of arguments for cmd
 * @param options - Spawn options.  See child_process.spawn for more info.
 * @param stdoutStream - The stream to receive stdout.  A NullStream if
 *     undefined.
 *     For example:
 *     `new CombinedStream(new PrefixStream("foo"), process.stdout)`
 * @param stderrStream - The stream to receive stderr  A NullStream if
 *     undefined. For example:
 *     `new CombinedStream(new PrefixStream(".    "), process.stderr)`
 * @return An object implementing ISpawnResult.
 */
export function spawn(
    cmd: string,
    args: Array<string>,
    options?: cp.SpawnOptions,
    description?: string,
    stdoutStream?: stream.Writable,
    stderrStream?: stream.Writable
): ISpawnResult {
    const cmdLineRepresentation = getCommandLineRepresentation(cmd, args);

    if (description)
    {
        console.log("--------------------------------------------------------------------------------");
        console.log(`${description}`);
        console.log(`    ${cmdLineRepresentation}`);
        console.log("--------------------------------------------------------------------------------");
    }

    const stdoutCollector = new CollectorStream();
    const stderrCollector = new CollectorStream();
    let childProcess: cp.ChildProcess;

    const closePromise = new BBPromise((resolve: (output: string) => void,
                                        reject: (err: {exitCode: number, stderr: string, stdout: string}) => void) => {

        const spawnOptions: cp.SpawnOptions = _.defaults(
            {},
            options,
            {stdio: [process.stdin, "pipe", "pipe"]});

        childProcess = cp.spawn(cmd, args, spawnOptions);

        const outputStream = stdoutStream || new NullStream();

        childProcess.stdout
        .pipe(stdoutCollector)
        .pipe(outputStream);

        const errorStream = stderrStream || new NullStream();

        childProcess.stderr
        .pipe(stderrCollector)  // to capture stderr in case child process errors
        .pipe(errorStream);

        childProcess.once("exit", (exitCode: number) => {
            // Wait for all steams to flush before reporting that the child
            // process has finished.
            eventToPromise(childProcess, "close")
            .then(() => {
                if (exitCode === 0) {
                    if (description)
                    {
                        console.log(`Child process succeeded: ${cmdLineRepresentation}`);
                    }
                    resolve(_.trim(stdoutCollector.collected));
                } else {
                    if (description)
                    {
                        console.log(`Child process failed: ${cmdLineRepresentation}`);
                    }
                    reject({exitCode: exitCode, stderr: stderrCollector.collected, stdout: stdoutCollector.collected});
                }
            });
        });

    });

    return {
        childProcess: childProcess!,
        closePromise: closePromise
    };
}


function getCommandLineRepresentation(cmd: string, args: Array<string>): string
{
    args = args.map((curArg) =>
    {
        if (_.includes(curArg, " "))
        {
            return `"${curArg}"`;
        } else
        {
            return curArg;
        }
    });

    return `${cmd} ${args.join(" ")}`;
}
