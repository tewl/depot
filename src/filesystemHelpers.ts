import * as fs from "fs";
import * as _ from "lodash";
import {Directory} from "./directory";
import {File} from "./file";
import { FailedResult, Result, SucceededResult } from "./result";


/**
 * Determines whether `path` represents an existing directory or file.
 * @param path - The path to the filesystem item in question
 * @return A Promise that resolves with a Directory or File object.  The Promise
 *   is rejected if `path` does not exist.
 */
export function getFilesystemItem(path: string): Promise<Directory | File> {
    return new Promise<Directory | File>((resolve, reject) => {
        fs.stat(path, (err, stats: fs.Stats) => {
            if (err) {
                reject(new Error(`"${path}" does not exist.`));
                return;
            }

            if (stats.isDirectory()) {
                resolve(new Directory(path));
            }
            else if (stats.isFile()) {
                resolve(new File(path));
            }
            else {
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
export async function resolveFileLocation(
    searchFileName: string,
    startingDir: Directory
): Promise<Result<File, string>> {
    let curDir = startingDir;
    let done = false;
    while (!done) {
        const result = await fileExistsInDir(searchFileName, curDir);
        if (result.succeeded) {
            return result;
        }

        const parentDir = curDir.parentDir();
        if (parentDir === undefined) {
            done = true;
        }
        else {
            curDir = parentDir;
        }
    }

    return new FailedResult(`${searchFileName} could not be found in ${startingDir.toString()} or any parent directory.`);



    async function fileExistsInDir(searchFileName: string, dir: Directory): Promise<Result<File, string>> {
        const contents = await dir.contents(false);
        const files = contents.files;
        const matchingFile = _.find(files, (curExistingFile) => curExistingFile.fileName === searchFileName);
        if (matchingFile === undefined) {
            return new FailedResult(`${searchFileName} could not be found in ${dir.toString()}.`);
        }
        else {
            return new SucceededResult(matchingFile);
        }
    }
}


////////////////////////////////////////////////////////////////////////////////
//
// getMostRecentlyModified()
//
////////////////////////////////////////////////////////////////////////////////

export interface IFsItemWithModifiedMs<TFsItem> {
    fsItem: TFsItem;
    mtimeMs: number;
}


interface IStatable {
    exists(): Promise<fs.Stats | undefined>;
}


/**
 * Get the most recently modified filesystem item in the specified array.
 *
 * @param fsItems - The filesystem items to consider.  This array may contain
 * Directory instances, File instances or a mixture of the two.
 * @return A Promise for a Result containing the most recently modified item.
 * An failed Result is returned when the input array is empty.
 */
export async function getMostRecentlyModified<TFsItem extends IStatable>(
    fsItems: Array<TFsItem>
): Promise<Result<IFsItemWithModifiedMs<TFsItem>, string>> {

    if (fsItems.length === 0) {
        return new FailedResult(`No filesystem elements were specified, so their modified timestamps cannot be compared.`);
    }

    // Get the stats for all the filesystem items.  We will get back an object
    // containing the filesystem item and its modified timestamp.
    const promises =
        fsItems
        .map((fsItem) => {
            return fsItem.exists()
            .then((stats) => {
                return stats ?
                    {
                        fsItem:  fsItem,
                        mtimeMs: stats.mtimeMs
                    } as IFsItemWithModifiedMs<TFsItem> :
                    undefined;
            });
        });

    const mostRecent =
        (await Promise.all(promises))
        // Remove any items that could not be stated.
        .filter((fsItem): fsItem is IFsItemWithModifiedMs<TFsItem> => fsItem !== undefined)
        // Reduce the array to the one item with the largest modified timestamp.
        .reduce(
            (acc, fsItem) => fsItem.mtimeMs > acc.mtimeMs ? fsItem : acc
        );
    return new SucceededResult(mostRecent);
}
