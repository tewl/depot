import {constants} from "fs";
import {EOL} from "os";
import * as _ from "lodash";
import {Directory} from "./directory";
import {File} from "./file";
import {getOs, OperatingSystem} from "./os";
import {mapAsync} from "./promiseHelpers";


const NODEJS_SHEBANG = "#!/usr/bin/env node";

/**
 * Makes the specified script file executable by prepending a shebang line and
 * setting file permissions.
 * @param file - The file to make executable
 * @return A promise that resolves with the file that was made executable
 */
export function makeNodeScriptExecutable(file: File): Promise<File>
{
    return file.read()
    .then((text) => {
        const newText = NODEJS_SHEBANG + EOL + text;
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


/**
 * Makes all .js files in the specified directory executable.
 * @param dir - The directory containing the .js files
 * @param recursive - Whether to search `dir` recursively for .js files
 * @return A promise that resolves with an array of files that were made
 * executable.
 */
export function makeAllJsScriptsExecutable(dir: Directory, recursive = false): Promise<Array<File>>
{
    return dir.contents(recursive)
    .then((contents) => {
        const scriptFiles = _.filter(contents.files, (curFile) => curFile.extName === ".js");
        return mapAsync(scriptFiles, (curScriptFile) => makeNodeScriptExecutable(curScriptFile))
        .then(() => {
            return scriptFiles;
        });
    });
}


/**
 * Converts the specified `node_modules/.bin/` script file name to the one
 * that should be executed on the current OS.  On Windows, this means the file
 * with the `.cmd` extension.
 * @param nodeBinFile - The node binary symbolic link file that exists in
 * `node_modules/.bin/`.
 * @return The node script file that should be executed for the current OS.
 */
export function nodeBinForOs(nodeBinFile: File | string): File
{
    const inputFile: File = nodeBinFile instanceof File ? nodeBinFile : new File(nodeBinFile);

    if (getOs() === OperatingSystem.WINDOWS)
    {
        return new File(inputFile.directory, inputFile.baseName + ".cmd");
    }
    else
    {
        return inputFile;
    }
}

