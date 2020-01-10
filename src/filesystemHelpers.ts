import * as fs from "fs";
import {Directory} from "./directory";
import {File} from "./file";


/**
 * Determines whether `path` represents an existing directory or file.
 * @param path - The path to the filesystem item in question
 * @return A Promise that resolves with a Directory or File object.  The Promise
 *   is rejected if `path` does not exist.
 */
export function getFilesystemItem(path: string): Promise<Directory | File>
{
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
