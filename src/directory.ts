import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import * as BBPromise from "bluebird";
import {File} from "./file";
import {promisify1, sequence} from "./promiseHelpers";
import {PathPart, reducePathParts} from "./pathHelpers";


const unlinkAsync = promisify1<void, string>(fs.unlink);
const rmdirAsync = promisify1<void, string>(fs.rmdir);
const readdirAsync = promisify1<Array<string>, string>(fs.readdir);
const mkdirAsync = promisify1<void, string>(fs.mkdir);
const statAsync  = promisify1<fs.Stats, string>(fs.stat);


export interface IDirectoryContents {
    subdirs: Array<Directory>;
    files:   Array<File>;
}


export class Directory
{
    // region Data Members
    private readonly _dirPath: string;
    // endregion


    public constructor(pathPart: PathPart, ...pathParts: Array<PathPart>)
    {
        const allParts: Array<PathPart> = [pathPart].concat(pathParts);
        this._dirPath = reducePathParts(allParts);

        // Remove trailing directory separator characters.
        while (_.endsWith(this._dirPath, path.sep)) {
            this._dirPath = this._dirPath.slice(0, -1);
        }
    }


    /**
     * Gets the name of this directory (without the preceding path)
     */
    public get dirName(): string
    {
        if (this._dirPath.length === 0)
        {
            // This directory represents the root of the filesystem.
            return "/";
        } else {
            return _.last(this._dirPath.split(path.sep))!;
        }
    }


    public toString(): string
    {
        return this._dirPath;
    }


    public equals(otherDir: Directory): boolean
    {
        return this.absPath() === otherDir.absPath();
    }


    public absPath(): string
    {
        return path.resolve(this._dirPath);
    }


    public exists(): Promise<fs.Stats | undefined>
    {
        return new BBPromise<fs.Stats | undefined>((resolve: (result: fs.Stats | undefined) => void) => {
            fs.stat(this._dirPath, (err: any, stats: fs.Stats) => {

                if (!err && stats.isDirectory())
                {
                    resolve(stats);
                }
                else
                {
                    resolve(undefined);
                }

            });
        });
    }


    public existsSync(): fs.Stats | undefined
    {
        try {
            const stats = fs.statSync(this._dirPath);
            return stats.isDirectory() ? stats : undefined;
        }
        catch (err) {
            if (err.code === "ENOENT")
            {
                return undefined;
            }
            else
            {
                throw err;
            }
        }
    }


    public isEmpty(): Promise<boolean>
    {
        return readdirAsync(this._dirPath)
        .then((fsEntries) => {
            return fsEntries.length === 0;
        });
    }


    public isEmptySync(): boolean
    {
        const fsEntries = fs.readdirSync(this._dirPath);
        return fsEntries.length === 0;
    }


    public ensureExists(): Promise<void>
    {
        return this.exists()
        .then((stats) =>
        {
            if (stats)
            {
                return;
            }
            else
            {
                const parts = this._dirPath.split(path.sep);

                // Create an array of successively longer paths, each one adding a
                // new directory onto the end.
                const dirsToCreate = parts.reduce((acc: Array<string>, curPart: string): Array<string> => {
                    if (acc.length === 0)
                    {
                        if (curPart.length === 0)
                        {
                            // The first item is an empty string.  The path must
                            // have started with the directory separator character
                            // (an absolute path was specified).
                            acc.push(path.sep);
                        }
                        else
                        {
                            // The first item contains text.  A relative path must
                            // have been specified.
                            acc.push(curPart);
                        }
                    }
                    else
                    {
                        const last = acc[acc.length - 1];
                        acc.push(path.join(last, curPart));
                    }
                    return acc;
                }, []);

                // Don't attempt to create the root of the filesystem.
                if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep))
                {
                    dirsToCreate.shift();
                }

                // Map each successively longer path to a function that will create
                // it.
                const createFuncs = dirsToCreate.map((dirToCreate: string) =>
                {
                    return (): Promise<void> =>
                    {
                        return mkdirAsync(dirToCreate)
                        .catch((err) =>
                        {
                            // If the directory already exists, just keep going.
                            if (err.code !== "EEXIST")
                            {
                                throw err;
                            }
                        });
                    };
                });

                // Execute the directory creation functions in sequence.
                return sequence(createFuncs, undefined);
            }
        });
    }


    public ensureExistsSync(): void
    {
        if (this.existsSync())
        {
            return;
        }

        const parts = this._dirPath.split(path.sep);

        // Create an array of successively longer paths, each one adding a
        // new directory onto the end.
        const dirsToCreate = parts.reduce((acc: Array<string>, curPart: string): Array<string> => {
            if (acc.length === 0) {
                if (curPart.length === 0) {
                    // The first item is an empty string.  The path must
                    // have started with the directory separator character
                    // (an absolute path was specified).
                    acc.push(path.sep);
                } else {
                    // The first item contains text.  A relative path must
                    // have been specified.
                    acc.push(curPart);
                }
            } else {
                const last = acc[acc.length - 1];
                acc.push(path.join(last, curPart));
            }
            return acc;
        }, []);

        // Don't attempt to create the root of the filesystem.
        if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep)) {
            dirsToCreate.shift();
        }

        dirsToCreate.forEach((curDir) => {
            try {
                fs.mkdirSync(curDir);
            }
            catch (err) {
                // If the directory already exists, just keep going.
                if (err.code !== "EEXIST") {
                    throw err;
                }
            }
        });
    }


    public empty(): Promise<void>
    {
        return this.delete()
        .then(() => {
            return this.ensureExists();
        });
    }


    public emptySync(): void
    {
        this.deleteSync();
        this.ensureExistsSync();
    }


    public delete(): Promise<void>
    {
        return this.exists()
        .then((stats) => {
            if (!stats)
            {
                // The specified directory does not exist.  Do nothing.
                return;
            }
            else
            {
                // First, delete the contents of the specified directory.
                return readdirAsync(this._dirPath)
                .then((items: Array<string>) => {
                    const absPaths = items.map((curItem) => {
                        return path.join(this._dirPath, curItem);
                    });

                    const deletePromises = absPaths.map((curAbsPath: string) => {
                        if (fs.statSync(curAbsPath).isDirectory()) {
                            const subdir = new Directory(curAbsPath);
                            return subdir.delete();
                        } else {
                            return unlinkAsync(curAbsPath);
                        }
                    });

                    return BBPromise.all(deletePromises);
                })
                .then(() => {
                    // Now that all of the items in the directory have been deleted, delete
                    // the directory itself.
                    return rmdirAsync(this._dirPath);
                });
            }
        });
    }


    public deleteSync(): void
    {
        if (!this.existsSync())
        {
            // The directory does not exist.  Do nothing.
            return;
        }

        // First, delete the contents of the specified directory.
        let fsItems: Array<string> = fs.readdirSync(this._dirPath);
        fsItems = fsItems.map((curFsItem) => {
            return path.join(this._dirPath, curFsItem);
        });

        fsItems.forEach((curFsItem) => {
            const stats = fs.statSync(curFsItem);
            if (stats.isDirectory()) {
                const subdir = new Directory(curFsItem);
                subdir.deleteSync();
            }
            else {
                fs.unlinkSync(curFsItem);
            }
        });

        // Now that all of the items in the directory have been deleted, delete the
        // directory itself.
        fs.rmdirSync(this._dirPath);
    }


    /**
     * Reads the contents of this directory.
     * @return The contents of the directory, separated into a list of files and a
     * list of subdirectories.  All paths returned are absolute paths.
     */
    public contents(): Promise<IDirectoryContents>
    {
        const thisAbsPath = this.absPath();

        return readdirAsync(this._dirPath)
        .then((fsEntries) => {
            const absPaths = fsEntries.map((curEntry) => {
                return path.join(thisAbsPath, curEntry);
            });

            const contents: IDirectoryContents = {subdirs: [], files: []};

            const promises = absPaths.map((curAbsPath) => {
                return statAsync(curAbsPath)
                .then((stats) => {
                    if (stats.isFile()) {
                        contents.files.push(new File(curAbsPath));
                    } else if (stats.isDirectory()) {
                        contents.subdirs.push(new Directory(curAbsPath));
                    }
                });
            });

            return BBPromise.all(promises)
            .then(() => {
                return contents;
            });
        });
    }


    /**
     * Reads the contents of this directory.
     * @return The contents of the directory, separated into a list of files and a
     * list of subdirectories.  All paths returned are absolute paths.
     */
    public contentsSync(): IDirectoryContents
    {
        const thisAbsPath = this.absPath();
        let fsEntries = fs.readdirSync(this._dirPath);
        fsEntries = fsEntries.map((curFsEntry) => {
            return path.join(thisAbsPath, curFsEntry);
        });

        const contents: IDirectoryContents = {subdirs: [], files: []};
        fsEntries.forEach((curFsEntry) => {
            const stats = fs.statSync(curFsEntry);
            if (stats.isFile())
            {
                contents.files.push(new File(curFsEntry));
            }
            else if (stats.isDirectory())
            {
                contents.subdirs.push(new Directory(curFsEntry));
            }
        });

        return contents;
    }


    /**
     * Recursively removes empty subdirectories from within this directory.
     * @return A Promise that is resolved when this directory has been pruned.
     */
    public prune(): Promise<void>
    {
        return this.contents()
        .then((contents) => {
            const promises = contents.subdirs.map((curSubdir) => {
                //
                // Prune the current subdirectory.
                //
                return curSubdir.prune()
                .then(() => {
                    //
                    // If the subdirectory is now empty, delete it.
                    //
                    return curSubdir.isEmpty();
                })
                .then((dirIsEmpty) => {
                    if (dirIsEmpty) {
                        return curSubdir.delete();
                    }
                });
            });

            return BBPromise.all(promises)
            .then(() => {
            });
        });
    }


    /**
     * Recursively removes empty subdirectories from this directory.
     */
    public pruneSync(): void
    {
        const contents = this.contentsSync();
        contents.subdirs.forEach((curSubdir) => {

            curSubdir.pruneSync();

            //
            // If the subdirectory is now empty, delete it.
            //
            if (curSubdir.isEmptySync())
            {
                curSubdir.deleteSync();
            }
        });
    }


    public copy(destDir: Directory, copyRoot: boolean): Promise<void>
    {
        if (copyRoot)
        {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            const thisDest: Directory = new Directory(destDir, this.dirName);
            return thisDest.ensureExists()
            .then(() => {
                return this.copy(thisDest, false);
            });
        }

        return this.contents()
        .then((contents: IDirectoryContents) => {
            // Copy the files in this directory to the destination.
            const fileCopyPromises = contents.files.map((curFile) => {
                return curFile.copy(destDir, curFile.fileName);
            });

            const dirCopyPromises = contents.subdirs.map((curSubdir) => {
                return curSubdir.copy(destDir, true);
            });

            return BBPromise.all(_.concat<any>(fileCopyPromises, dirCopyPromises));
        })
        .then(() => {
        });
    }


    public copySync(destDir: Directory, copyRoot: boolean): void
    {
        if (copyRoot)
        {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            const thisDest: Directory = new Directory(destDir, this.dirName);
            thisDest.ensureExistsSync();
            this.copySync(thisDest, false);
            return;
        }

        const contents = this.contentsSync();

        // Copy the files in this directory to the destination.
        contents.files.forEach((curFile) => {
            curFile.copySync(destDir, curFile.fileName);
        });

        contents.subdirs.forEach((curSubdir) => {
            curSubdir.copySync(destDir, true);
        });
    }

}
