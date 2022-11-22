import * as fs from "fs";
import * as path from "path";
import * as _ from "lodash";
import {File} from "./file";
import {promisify1} from "./promisify";
import {sequence, mapAsync} from "./promiseHelpers";
import {PathPart, reducePathParts} from "./pathHelpers";
import { StorageSize } from "./storageSize";
import { matchesAny } from "./regexpHelpers";


const unlinkAsync = promisify1<void, string>(fs.unlink);
const rmdirAsync = promisify1<void, string>(fs.rmdir);
const readdirAsync = promisify1<Array<string>, string>(fs.readdir);
const mkdirAsync = promisify1<void, string>(fs.mkdir);
const lstatAsync  = promisify1<fs.Stats, string>(fs.lstat);


export interface IDirectoryContents {
    subdirs: Array<Directory>;
    files:   Array<File>;
}


export type WalkCallback = (item: Directory | File) => boolean | Promise<boolean>;


export class Directory {

    /**
     * Creates a Directory representing the relative path from `from` to `to`
     * @param from - The starting directory
     * @param to - The ending directory
     * @return A directory representing the relative path from `from` to `to`
     */
    public static relative(
        from: Directory,
        to:   Directory
    ): Directory {
        const relPath = path.relative(from.toString(), to.toString());
        return new Directory(relPath);
    }


    /**
     * Calculates the parts of the relative path from `from` to `to`.
     * @param from - The starting point
     * @param to - The ending point
     * @return An array of strings representing the path segments needed to get
     * from `from` to `to`.
     */
    public static relativeParts(from: Directory, to: Directory): Array<string> {
        const relPath = path.relative(from.toString(), to.toString());
        return relPath.split(path.sep);
    }


    // region Data Members
    private readonly _dirPath: string;
    private _cachedSize: StorageSize | undefined;
    // endregion


    public constructor(pathPart: PathPart, ...pathParts: Array<PathPart>) {
        const allParts: Array<PathPart> = [pathPart].concat(pathParts);
        this._dirPath = reducePathParts(allParts);

        if (this._dirPath === "\\" || this._dirPath === "/") {
            // The path begins with a directory separator, which means that it
            // is a relative path starting from the root of the drive.
            this._dirPath = path.resolve(this._dirPath);
        }

        // Remove trailing directory separator characters.
        while ((this._dirPath.length > 1) &&
               _.endsWith(this._dirPath, path.sep)) {
            this._dirPath = this._dirPath.slice(0, -1);
        }
    }


    /**
     * Gets the name of this directory (without the preceding path)
     */
    public get dirName(): string {
        if (this._dirPath.length === 0) {
            // This directory represents the root of the filesystem.
            return "/";
        }
        else {
            return _.last(this._dirPath.split(path.sep))!;
        }
    }


    public toString(): string {
        return this._dirPath;
    }


    public equals(otherDir: Directory): boolean {
        return this.absPath() === otherDir.absPath();
    }


    /**
     * Gets the parent directory of this directory, if one exists.
     * @return This directory's parent directory.  undefined is returned if this
     * directory is the root of a drive.
     */
    public parentDir(): undefined | Directory {
        const absPath = this.absPath();
        const parts = _.split(absPath, path.sep);

        // If the directory separator was not found, the split will result in a
        // 1-element array.  If this is the case, this directory is the root of
        // the drive.
        if (parts.length === 1) {
            return undefined;
        }

        const parentParts = _.dropRight(parts);
        const [first, ...rest] = parentParts;
        const firstDir = new Directory(first!);
        const parentDir = new Directory(firstDir, ...rest);
        return parentDir;
    }


    /**
     * Determines whether this directory is the root of a drive.
     * @return true if this directory is the root of a drive.  false otherwise.
     */
    public isRoot(): boolean {
        return this.parentDir() === undefined;
    }


    /**
     * Gets the absolute path of this Directory.
     * @return The absolute path of this Directory
     */
    public absPath(): string {
        if (this._dirPath[1] === ":") {
            // The path is a Windows path that already has a drive letter at the
            // beginning.  It is already absolute.
            return this._dirPath;
        }
        else {
            return path.resolve(this._dirPath);
        }
    }


    /**
     * Makes another Directory instance that is wrapping this Directory's
     * absolute path.
     * @return A new Directory representing this Directory's absolute path.
     */
    public absolute(): Directory {
        return new Directory(this.absPath());
    }


    public exists(): Promise<fs.Stats | undefined> {
        return new Promise<fs.Stats | undefined>((resolve: (result: fs.Stats | undefined) => void) => {
            fs.stat(this._dirPath, (err: unknown, stats: fs.Stats) => {
                if (!err && stats.isDirectory()) {
                    resolve(stats);
                }
                else {
                    resolve(undefined);
                }

            });
        });
    }


    public existsSync(): fs.Stats | undefined {
        try {
            const stats = fs.statSync(this._dirPath);
            return stats.isDirectory() ? stats : undefined;
        }
        catch (err) {
            if ((err as NodeJS.ErrnoException).code === "ENOENT") {
                return undefined;
            }
            else {
                throw err;
            }
        }
    }


    public isEmpty(): Promise<boolean> {
        return readdirAsync(this._dirPath)
        .then((fsEntries) => {
            return fsEntries.length === 0;
        });
    }


    public isEmptySync(): boolean {
        const fsEntries = fs.readdirSync(this._dirPath);
        return fsEntries.length === 0;
    }


    /**
     * Creates the directory represented by this instance.  If needed,
     * nonexistent parent directories will also be created.
     * @returns A Promise that resolves with this Directory instance (for
     * chaining) when this operation completes.
     */
    public ensureExists(): Promise<Directory> {
        return this.exists()
        .then((stats) => {
            if (stats) {
                return;
            }
            else {
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
                        }
                        else {
                            // The first item contains text.  A relative path must
                            // have been specified.
                            acc.push(curPart);
                        }
                    }
                    else {
                        const last = acc[acc.length - 1]!;
                        acc.push(path.join(last, curPart));
                    }
                    return acc;
                }, []);

                // Don't attempt to create the root of the filesystem.
                if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep)) {
                    dirsToCreate.shift();
                }

                // Map each successively longer path to a function that will create
                // it.
                const createFuncs = dirsToCreate.map((dirToCreate: string) => {
                    return (): Promise<void> => {
                        return mkdirAsync(dirToCreate)
                        .catch((err) => {
                            // If the directory already exists, just keep going.
                            if (err.code !== "EEXIST") {
                                throw err;
                            }
                        });
                    };
                });

                // Execute the directory creation functions in sequence.
                return sequence(createFuncs, undefined);
            }
        })
        .then(() => {
            return this;
        });
    }


    /**
     * Creates the directory represented by this instance.  If needed,
     * nonexistent parent directories will also be created.
     * @returns This Directory instance (for chaining)
     */
    public ensureExistsSync(): this {
        if (this.existsSync()) {
            return this;
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
                }
                else {
                    // The first item contains text.  A relative path must
                    // have been specified.
                    acc.push(curPart);
                }
            }
            else {
                const last = acc[acc.length - 1]!;
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
                if ((err as NodeJS.ErrnoException).code !== "EEXIST") {
                    throw err;
                }
            }
        });

        return this;
    }


    /**
     * Deletes the contents of this directory.  This directory is created if it
     * does not exist.
     * @returns A Promise that resolves with this Directory instance when this
     * operation has finished.
     */
    public empty(): Promise<Directory> {
        return this.delete()
        .then(() => {
            return this.ensureExists();
        });
    }


    /**
     * Deletes the contents of this directory.  This directory is created if it
     * does not exist.
     * @returns This Directory instance (to facilitate chaining)
     */
    public emptySync(): this {
        this.deleteSync();
        return this.ensureExistsSync();
    }


    /**
     * Deletes this directory.  Does nothing if this directory does not exist.
     * @returns A Promise that is resolved when this operation has finished.
     */
    public delete(): Promise<void> {
        return this.exists()
        .then((stats) => {
            if (!stats) {
                // The specified directory does not exist.  Do nothing.
                return;
            }
            else {
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
                        }
                        else {
                            return unlinkAsync(curAbsPath);
                        }
                    });

                    return Promise.all(deletePromises);
                })
                .then(() => {
                    // Now that all of the items in the directory have been deleted, delete
                    // the directory itself.
                    return rmdirAsync(this._dirPath);
                });
            }
        });
    }


    /**
     * Deletes this directory.  Does nothing if this directory does not exist.
     */
    public deleteSync(): void {
        if (!this.existsSync()) {
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
     * Determines whether this directory contains the specified file
     * @param file - The file to search for within this directory
     * @param recursiveSearch - Whether to search recursively through
     * subdirectories for the file
     * @returns true if the file was found; false otherwise.
     */
    public contains(file: File, recursiveSearch: boolean): boolean {
        return file.isWithin(this, recursiveSearch);
    }


    /**
     * Reads the contents of this directory.
     * @param recursive - Whether to find subdirectories and files recursively
     * (default is false).
     * @return The contents of the directory, separated into a list of files and
     * a list of subdirectories.  The relative/absolute nature of the returned
     * File and Directory objects will be determined by the relative/absolute
     * nature of this Directory object.
     */
    public contents(recursive = false): Promise<IDirectoryContents> {
        const parentDirPath = this.toString();

        return readdirAsync(this._dirPath)
        .then((fsEntries) => {
            const fsEntryPaths = fsEntries.map((curEntry) => {
                return path.join(parentDirPath, curEntry);
            });

            const contents: IDirectoryContents = {subdirs: [], files: []};

            return mapAsync(fsEntryPaths, (curPath) => {
                return lstatAsync(curPath)
                .then((stats) => {
                    if (stats.isFile()) {
                        contents.files.push(new File(curPath));
                    }
                    else if (stats.isDirectory()) {
                        contents.subdirs.push(new Directory(curPath));
                    }
                    // Note: We are ignoring symbolic links here.
                })
                .catch(() => {
                    // We failed to stat the current item.  This is probably a
                    // permissions error.  Pretend like it's not here.
                });
            })
            .then(() => {
                return contents;
            });
        })
        .then((contents: IDirectoryContents) => {
            if (!recursive) {
                return contents;
            }

            // Get the contents of each subdirectory.
            return Promise.all<IDirectoryContents>(_.map(contents.subdirs, (curSubdir) => curSubdir.contents(true)))
            .then((subdirContents: Array<IDirectoryContents>) => {
                // Put the contents of each subdirectory into the returned
                // `contents` object.
                for (const curContents of subdirContents) {
                    contents.subdirs = _.concat(contents.subdirs, curContents.subdirs);
                    contents.files = _.concat(contents.files, curContents.files);
                }

                return contents;
            });
        });
    }


    /**
     * Reads the contents of this directory.
     * @param recursive - Whether to find subdirectories and files recursively
     * @return The contents of the directory, separated into a list of files and a
     * list of subdirectories.  The relative/absolute nature of the returned
     * File and Directory objects will be determined by the relative/absolute
     * nature of this Directory object.
     */
    public contentsSync(recursive = false): IDirectoryContents {
        const parentDirPath = this.toString();

        let fsEntries = fs.readdirSync(this._dirPath);
        fsEntries = fsEntries.map((curFsEntry) => {
            return path.join(parentDirPath, curFsEntry);
        });

        const contents: IDirectoryContents = {subdirs: [], files: []};
        fsEntries.forEach((curFsEntry) => {
            const stats = fs.lstatSync(curFsEntry);
            if (stats.isFile()) {
                contents.files.push(new File(curFsEntry));
            }
            else if (stats.isDirectory()) {
                contents.subdirs.push(new Directory(curFsEntry));
            }
            // Note: We are ignoring symbolic links here.
        });

        if (recursive) {
            contents.subdirs.forEach((curSubdir) => {
                const subdirContents = curSubdir.contentsSync(true);
                contents.subdirs = _.concat(contents.subdirs, subdirContents.subdirs);
                contents.files   = _.concat(contents.files,   subdirContents.files);
            });
        }

        return contents;
    }


    /**
     * Recursively removes empty subdirectories from within this directory.
     * @return A Promise that is resolved when this directory has been pruned.
     */
    public prune(): Promise<void> {
        return this.contents()
        .then((contents) => {
            return mapAsync(contents.subdirs, (curSubdir) => {
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
                    return undefined;
                });
            })
            .then(() => {
                return;
            });
        });
    }


    /**
     * Recursively removes empty subdirectories from this directory.
     */
    public pruneSync(): void {
        const contents = this.contentsSync();
        contents.subdirs.forEach((curSubdir) => {
            curSubdir.pruneSync();

            //
            // If the subdirectory is now empty, delete it.
            //
            if (curSubdir.isEmptySync()) {
                curSubdir.deleteSync();
            }
        });
    }


    /**
     * Copies this directory to `destDir`.
     * @param destDir - The destination directory
     * @param copyRoot - If true, this directory name will be a subdirectory of
     * `destDir`.  If false, only the contents of this directory will be copied
     * into `destDir`.
     * @return A promise that is resolved with a Directory object representing
     * the destination directory.  If copyRoot is false, this will be `destDir`.
     * If copyRoot is true, this will be this Directory's counterpart
     * subdirectory in `destDir`.
     */
    public copy(destDir: Directory, copyRoot: boolean): Promise<Directory> {
        if (copyRoot) {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            const thisDest: Directory = new Directory(destDir, this.dirName);
            return thisDest.ensureExists()
            .then(() => {
                return this.copy(thisDest, false);
            })
            .then(() => {
                return thisDest;
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

            return Promise.all(_.concat<Array<Promise<File | Directory>>>(fileCopyPromises, dirCopyPromises));
        })
        .then(() => {
            return destDir;
        });
    }


    /**
     * Copies this directory to `destDir`.
     * @param destDir - The destination directory
     * @param copyRoot - If true, this directory name will be a subdirectory of
     * `destDir`.  If false, only the contents of this directory will be copied
     * into `destDir`.
     */
    public copySync(destDir: Directory, copyRoot: boolean): Directory {
        if (copyRoot) {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            const thisDest: Directory = new Directory(destDir, this.dirName);
            thisDest.ensureExistsSync();
            this.copySync(thisDest, false);
            return thisDest;
        }

        const contents = this.contentsSync();

        // Copy the files in this directory to the destination.
        contents.files.forEach((curFile) => {
            curFile.copySync(destDir, curFile.fileName);
        });

        contents.subdirs.forEach((curSubdir) => {
            curSubdir.copySync(destDir, true);
        });

        return destDir;
    }


    /**
     * Copies the selected files and directories to `destDir`.
     * @param destDir
     * @param copyRoot
     */
    public async copyFiltered(
        destDir: Directory,
        copyRoot: boolean,
        includeRegexes: Array<RegExp>,
        excludeRegexes: Array<RegExp>
    ): Promise<Directory> {
        if (copyRoot) {
            const thisDest: Directory = new Directory(destDir, this.dirName);
            await thisDest.ensureExists();
            await this.copyFiltered(thisDest, false, includeRegexes, excludeRegexes);
            return thisDest;
        }

        await this.walk(async (fsItem) => {

            const curItemRelative = fsItem instanceof Directory ?
                Directory.relative(this, fsItem) :
                File.relative(this, fsItem);

            const relativeStr = curItemRelative.toString();
            let shouldRecurse = false;

            if (matchesAny(relativeStr, includeRegexes) &&
                !matchesAny(relativeStr, excludeRegexes)) {
                if (curItemRelative instanceof Directory) {
                    const dstDir = new Directory(destDir, relativeStr);
                    await dstDir.ensureExists();
                    shouldRecurse = true;
                }
                else {
                    const dstFile = new File(destDir, relativeStr);
                    await (fsItem as File).copy(dstFile);
                }
            }

            return shouldRecurse;
        });

        return destDir;
    }


    /**
     * Copies the selected files and directories to `destDir`.
     */
    public async copyFilteredWith(
        destDir: Directory,
        copyRoot: boolean,
        shouldCopyFn: (relFileOrDir: File | Directory) => boolean | Promise<boolean>
    ): Promise<Directory> {
        if (copyRoot) {
            const thisDest: Directory = new Directory(destDir, this.dirName);
            await thisDest.ensureExists();
            await this.copyFilteredWith(thisDest, false, shouldCopyFn);
            return thisDest;
        }

        await this.walk(async (fsItem) => {

            const curItemRelative = fsItem instanceof Directory ?
                Directory.relative(this, fsItem) :
                File.relative(this, fsItem);

            let shouldRecurse = false;

            const shouldCopy = await Promise.resolve(shouldCopyFn(curItemRelative));
            if (shouldCopy) {
                if (curItemRelative instanceof Directory) {
                    const dstDir = new Directory(destDir, curItemRelative.toString());
                    await dstDir.ensureExists();
                    shouldRecurse = true;
                }
                else {
                    const dstFile = new File(destDir, curItemRelative.toString());
                    await (fsItem as File).copy(dstFile);
                }
            }

            return shouldRecurse;
        });

        return destDir;
    }


    /**
     * Moves this Directory or the contents of this Directory to `destDir`.
     * @param destDir - The destination directory
     * @param moveRoot - If true, this directory name will be a subdirectory of
     * `destDir`.  If false, only the contents of this directory will be copied
     * into `destDir`.
     * @return A promise that is resolved with a Directory object representing
     * the destination directory.  If moveRoot is false, this will be `destDir`.
     * If moveRoot is true, this will be this Directory's counterpart
     * subdirectory in `destDir`.
     */
    public move(destDir: Directory, moveRoot: boolean): Promise<Directory> {
        return destDir.ensureExists()
        .then(() => {
            return this.copy(destDir, moveRoot);
        })
        .then((counterpartDestDir) => {
            return this.delete()
            .then(() => {
                return counterpartDestDir;
            });
        });
    }


    /**
     * Walks this Directory in a depth-first manner.
     * @param cb - A callback function that will be called for each subdirectory
     *   and file encountered.  It is invoked with one argument: (item).  When
     *   item is a Directory, the function returns a boolean indicating whether
     *   to recurse into the directory.  When item is a File, the returned value
     *   is ignored.
     * @return A promise that is resolved when the directory tree has been
     *   completely walked.
     */
    public async walk(cb: WalkCallback): Promise<void> {
        const thisDirectoryContents = await this.contents(false);

        // Invoke the callback for all files concurrently.
        const filePromises: Array<Promise<boolean>> = _.map(thisDirectoryContents.files, (curFile: File) => {
            return Promise.resolve(cb(curFile));
        });
        await Promise.all(filePromises);

        // Process each of the subdirectories one at a time.
        for (const curSubDir of thisDirectoryContents.subdirs) {
            const shouldRecurse = await Promise.resolve(cb(curSubDir));
            if (shouldRecurse) {
                await curSubDir.walk(cb);
            }
        }
    }


    /**
     * Calculates the size of this Directory.
     *
     * @returns The size of all files (recursively) in this Directory.
     */
    public async getSize(refresh = true): Promise<StorageSize> {
        // Note: Calling fs.stat() on a directory returns a size of 0.
        // Therefore, we must sum the size of files.

        if (refresh || this._cachedSize === undefined) {
            const {files} = await this.contents(true);
            const totalBytes =
                (await Promise.all(files.map((curFile) => curFile.exists())))
                .filter((stat): stat is fs.Stats => stat !== undefined)
                .reduce((acc, stat) => acc + stat.size, 0);
            this._cachedSize = StorageSize.fromBytes(totalBytes);
        }

        return this._cachedSize!;
    }


    /**
     * Calculates the size of this Directory.
     *
     * @returns The size of all files (recursively) in this Directory.
     */
    public getSizeSync(): StorageSize {
        const {files} = this.contentsSync(true);
        const totalBytes =
            files
            .map((curFile) => curFile.existsSync())
            .filter((stat): stat is fs.Stats => stat !== undefined)
            .reduce((acc, stat) => acc + stat.size, 0);
        return StorageSize.fromBytes(totalBytes);
    }
}
