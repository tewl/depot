import { File } from "./file";
import { Directory } from "./directory";
import { launch } from "./launch";


/**
 * Open the specified file in Emacs.
 *
 * @param filesAndDirs - The file to be opened
 * @param openInExistingEditor - Whether to reuse an existing Emacs instance.
 *     Note: You must start the Emacs server using M-x server-start for this to
 *     work.
 */
export function openInEmacs(filesAndDirs: Array<File | Directory>, openInExistingEditor: boolean = false): void {
    let cmd: string;
    let args: Array<string> = [];

    if (openInExistingEditor) {
        cmd = "emacsclient";
        args.push("-n");
    }
    else {
        cmd = "emacs";
    }

    const argsAbsPaths = filesAndDirs.map((fileOrDir) => fileOrDir.absPath());
    args = args.concat(argsAbsPaths);
    launch(cmd, args);
}
