import * as fs from "fs";
import * as _ from "lodash";
import {Directory} from "./directory";
import {File} from "./file";
import { failedResult, Result, succeeded, succeededResult } from "./result";


/**
 * Determines whether `path` represents an existing directory or file.
 * @param path - The path to the filesystem item in question
 * @return A Promise that resolves with a Directory or File object.  The Promise
 *   is rejected if `path` does not exist.
 */
export function getFilesystemItem(path: string): Promise<Directory | File>
{
    return new Promise<Directory | File>((resolve, reject) =>
    {
        fs.stat(path, (err, stats: fs.Stats) =>
        {
            if (err)
            {
                reject(new Error(`"${path}" does not exist.`));
                return;
            }

            if (stats.isDirectory())
            {
                resolve(new Directory(path));
            }
            else if (stats.isFile())
            {
                resolve(new File(path));
            }
            else
            {
                reject(new Error(`"${path}" is not a file or directory.`));
            }
        });

    });
}


/**
 * Locates a file in the specified directory or a parent directory.
 * @param searchFileName - The file being searched for
 * @param startingDir - The directory where to start searching
 * @return A promise that resolves with a result of the search.  If the search
 * succeeded, the result is successful and contains the found file.  If the
 * search failed, the result is a failure and contains a descriptive string.
 * The returned promise only rejects if the search could not be performed.
 */
export async function resolveFileLocation(searchFileName: string, startingDir: Directory): Promise<Result<File, string>>
{
    let curDir = startingDir;
    let done = false;
    while (!done)
    {
        const result = await fileExistsInDir(searchFileName, curDir);
        if (succeeded(result))
        {
            return result;
        }

        const parentDir = curDir.parentDir();
        if (parentDir === undefined)
        {
            done = true;
        }
        else
        {
            curDir = parentDir;
        }
    }

    return failedResult(`${searchFileName} could not be found in ${startingDir.toString()} or any parent directory.`);



    async function fileExistsInDir(searchFileName: string, dir: Directory): Promise<Result<File, string>>
    {
        const contents = await dir.contents(false);
        const files = contents.files;
        const matchingFile = _.find(files, (curExistingFile) => curExistingFile.fileName === searchFileName);
        if (matchingFile === undefined)
        {
            return failedResult(`${searchFileName} could not be found in ${dir.toString()}.`);
        }
        else
        {
            return succeededResult(matchingFile);
        }
    }
}
