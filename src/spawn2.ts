import * as _ from "lodash";
import * as os from "os";
import {CollectorStream} from "./collectorStream";
import * as cp from "child_process";
import * as stream from "stream";
import {NullStream} from "./nullStream";
import {eventToPromise} from "./promiseHelpers";
import { assertNever } from "./never";
import { FailedResult, Result, SucceededResult } from "./result";


/**
 * A Node.js error type that is not defined within the Node.js type definitions.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33217
 */
export interface ISystemError {
    address?: string;  // If present, the address to which a network connection failed
    code?:    string;  // The string error code
    dest?:    string;  // If present, the file path destination when reporting a file system error
    errno?:   number;  // The system-provided error number
    // eslint-disable-next-line @typescript-eslint/ban-types
    info?:    object;  // If present, extra details about the error condition
    message?: string;  // A system-provided human - readable description of the error
    path?:    string;  // If present, the file path when reporting a file system error
    port?:    number;  // If present, the network connection port that is not available
    syscall?: string;  // The name of the system call that triggered the error
}


/**
 * Describes a spawn failure where the process could not be started.
 */
export interface ISpawnSystemError extends ISystemError {
    type: "ISpawnSystemError";
}

export function isISpawnSystemError(a: unknown): a is ISpawnSystemError {
    return (a as ISpawnSystemError).type === "ISpawnSystemError";
}


/**
 * Describes a spawn failure where the process returned a non-zero exit code.
 */
export interface ISpawnExitError {
    type:     "ISpawnExitError";
    /**
     * The process's exit code.  May be _null_ if the process was killed.
     */
    exitCode: number | null;
    stderr:   string;
    stdout:   string;
}

export function isISpawnExitError(a: unknown): a is ISpawnExitError {
    return (a as ISpawnExitError).type === "ISpawnExitError";
}

/**
 * A union type of all spawn failures.
 */
export type SpawnError = ISpawnSystemError | ISpawnExitError;


/**
 * Converts a SpawnError to its string representation.
 * @param err - The error to convert
 * @return The string representation
 */
export function spawnErrorToString(err: SpawnError): string {
    switch (err.type) {
        case "ISpawnSystemError":
            return `System error: ${JSON.stringify(err)}`;

        case "ISpawnExitError":
            return `Process failed with code ${err.exitCode}.${os.EOL}${err.stdout}${err.stderr}`;

        default:
            return assertNever(err);
    }
}


/**
 * The return value when calling spawn().
 */
export interface ISpawnOutput {
    /**
     * The underlying child process.  This is provided so that clients can do
     * things like kill() them.
     */
    childProcess: cp.ChildProcess;

    /**
     * A Promise that always resolves with the result of the child process's execution.
     * When successful, the Result contains the trimmed output.  When it fails,
     * the result contains information about the specific failure.
     */
    closePromise: Promise<Result<string, SpawnError>>;
}


/**
 * Spawns a child process.  Each stdout and stderr output line is prefixed with
 * the specified label.
 * @param cmd - The command to run
 * @param args - An array of arguments for _cmd_
 * @param options - Spawn options.  See child_process.spawn for more info.
 * @param description - A textual description of the command that is output when
 *     the child process starts
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
    cmd:           string,
    args:          Array<string>,
    options?:      cp.SpawnOptions,
    description?:  string,
    stdoutStream?: stream.Writable,
    stderrStream?: stream.Writable
): ISpawnOutput {
    const cmdLineRepresentation = getCommandLineRepresentation(cmd, args);

    if (description) {
        console.log("--------------------------------------------------------------------------------");
        console.log(`${description}`);
        console.log(`    ${cmdLineRepresentation}`);
        console.log("--------------------------------------------------------------------------------");
    }

    const stdoutCollector = new CollectorStream();
    const stderrCollector = new CollectorStream();
    let childProcess: cp.ChildProcess;

    const closePromise = new Promise(
        (resolve: (result: Result<string, SpawnError>) => void) => {
            const spawnOptions: cp.SpawnOptions = _.defaults(
                {},
                options,
                {stdio: [process.stdin, "pipe", "pipe"]}
            );

            childProcess = cp.spawn(cmd, args, spawnOptions);

            const outputStream = stdoutStream || new NullStream();

            childProcess.stdout!
            .pipe(stdoutCollector)
            .pipe(outputStream);

            const errorStream = stderrStream || new NullStream();

            childProcess.stderr!
            .pipe(stderrCollector)  // to capture stderr in case child process errors
            .pipe(errorStream);

            childProcess.once("error", (err: ISystemError) => {
                resolve(new FailedResult({ type: "ISpawnSystemError", ...err }));
            });

            childProcess.once("exit", (exitCode: number) => {
                // Wait for all steams to flush before reporting that the child
                // process has finished.
                eventToPromise(childProcess, "close")
                .then(() => {
                    if (exitCode === 0) {
                        if (description) {
                            console.log(`Child process succeeded: ${cmdLineRepresentation}`);
                        }
                        resolve(new SucceededResult(_.trim(stdoutCollector.collected)));
                    }
                    else {
                        if (description) {
                            console.log(`Child process failed: ${cmdLineRepresentation}`);
                        }
                        resolve(new FailedResult({
                            type:     "ISpawnExitError",
                            exitCode: exitCode,
                            stderr:   _.trim(stderrCollector.collected),
                            stdout:   _.trim(stdoutCollector.collected)
                        }));
                    }
                });
            });

        }
    );

    return {
        childProcess: childProcess!,
        closePromise: closePromise
    };
}


function getCommandLineRepresentation(cmd: string, args: Array<string>): string {
    args = args.map((curArg) => {
        if (_.includes(curArg, " ")) {
            return `"${curArg}"`;
        }
        else {
            return curArg;
        }
    });

    return `${cmd} ${args.join(" ")}`;
}
