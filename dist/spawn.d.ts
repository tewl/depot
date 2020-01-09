/// <reference types="node" />
import * as cp from "child_process";
import * as stream from "stream";
export interface ISpawnResult {
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
export declare function spawn(cmd: string, args: Array<string>, options?: cp.SpawnOptions, description?: string, stdoutStream?: stream.Writable, stderrStream?: stream.Writable): ISpawnResult;
