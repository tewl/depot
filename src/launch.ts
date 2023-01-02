import {spawn} from "child_process";


export function launch(cmd: string, args: Array<string>): void {

    const childProc = spawn(
        cmd,
        args,
        {
            detached: true,
            // I/O streams must not be inherited to be disconnected from the parent process.
            stdio:    "ignore"
        }
    );

    // Unreference the child process so that it will not prevent this process
    // from exiting.
    childProc.unref();
}
