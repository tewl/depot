import {constants} from "fs";
import {File} from "./file";


const NODEJS_SHEBANG = "#!/usr/bin/env node";

export function makeNodeScriptExecutable(file: File): Promise<File> {
    return file.read()
    .then((text) => {
        const newText = NODEJS_SHEBANG + "\n" + text;
        return file.write(newText);
    })
    .then(() => {
        // We need to set the access mode of the file to the current mode with
        // execute permissions OR'ed in (for owner, group and other).  So first
        // get the current mode bits.
        return file.exists();
    })
    .then((stats) => {
        // Turn on all execute bits.
        const newMode = stats!.mode | constants.S_IXUSR | constants.S_IXGRP | constants.S_IXOTH;
        return file.chmod(newMode);
    })
    .then(() => {
        return file;
    });
}
