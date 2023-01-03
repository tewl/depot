import { File } from "./file";
import { launch } from "./launch";


/**
 * Open the specified file in Emacs.
 *
 * @param file - The file to be opened
 * @param openInExistingEditor - Whether to reuse an existing Emacs instance.
 *     Note: You must start the Emacs server using M-x server-start for this to
 *     work.
 */
export function openInEmacs(file: File, openInExistingEditor: boolean = false): void {
    let cmd: string;
    const args: Array<string> = [];

    if (openInExistingEditor) {
        cmd = "emacsclient";
        args.push("-n");
    }
    else {
        cmd = "emacs";
    }

    args.push(file.absPath());
    launch(cmd, args);
}
