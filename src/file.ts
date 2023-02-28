import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";
import * as readline from "readline";
import * as _ from "lodash";
import {ListenerTracker} from "./listenerTracker";
import {promisify1} from "./promisify";
import {Directory} from "./directory";
import {PathPart, reducePathParts} from "./pathHelpers";
import { FailedResult, Result, SucceededResult } from "./result";


const unlinkAsync = promisify1<void, string>(fs.unlink);
const statAsync   = promisify1<fs.Stats, string>(fs.stat);


/**
 * Callback that is invoked for each line of the file as it is read.  Note:
 * lineText does not contain the trailing \n, \r or \r\n characters.
 */
export type ReadLinesCallback = (lineText: string, lineNum: number) => void;


export class File {

    public static relative(from: Directory, to: File): File {
        const relPath = path.relative(from.toString(), to.toString());
        return new File(relPath);
    }


    /**
     * Calculates the parts of the relative path from `from` to `to`.
     * @param from - The starting point
     * @param to - The ending point
     * @return An array of strings representing the path segments needed to get
     * from `from` to `to`.
     */
    public static relativeParts(from: Directory, to: File): Array<string> {
        const relPath = path.relative(from.toString(), to.toString());
        return relPath.split(path.sep);
    }


    // region Data Members
    private readonly _filePath: string;
    // endregion


    public constructor(pathPart: PathPart, ...pathParts: Array<PathPart>) {
        if (typeof pathPart === "string" && pathPart === "") {
            throw new Error("File instance created with illegal first pathPart.");
        }

        const allParts: Array<PathPart> = [pathPart].concat(pathParts);
        this._filePath = reducePathParts(allParts);
    }


    /**
     * Gets the directory portion of this file's path (everything before the
     * file name and extension).
     * @return The directory portion of this file's path.  This string will
     * always end with the OS's directory separator ("/").
     */
    public get dirName(): string {
        return path.dirname(this._filePath) + path.sep;
    }


    /**
     * Gets this file's base name.  This is the part of the file name preceding
     * the extension.
     * @return This file's base name.
     */
    public get baseName(): string {
        const extName: string = path.extname(this._filePath);
        return path.basename(this._filePath, extName);
    }


    /**
     * Gets the full file name of this file.  This includes both the base name
     * and extension.
     * @return This file's file name
     */
    public get fileName(): string {
        return path.basename(this._filePath);
    }


    /**
     * Gets the extension of this file.  This includes the initial dot (".").
     * If the file has no extension an empty string is returned.
     * @return This file's extension
     */
    public get extName(): string {
        return path.extname(this._filePath);
    }


    /**
     * Gets the directory containing this file
     * @return A Directory object representing this file's directory.
     */
    public get directory(): Directory {
        const dirName: string = path.dirname(this._filePath);
        return new Directory(dirName);
    }


    public toString(): string {
        return this._filePath;
    }


    public equals(otherFile: File): boolean {
        return this.absPath() === otherFile.absPath();
    }


    /**
     * Determines whether this file is within the specified directory
     * @param dir - The directory to search within
     * @param recursiveSearch - Whether to search recursively through
     * subdirectories for this file
     * @returns true if this file was found; false otherwise.
     */
    public isWithin(dir: Directory, recursiveSearch: boolean): boolean {
        if (recursiveSearch) {
            const fileAbsPath = this.absPath();
            const dirAbsPath = dir.absPath();
            const isWithin = fileAbsPath.startsWith(dirAbsPath);
            return isWithin;
        }
        else {
            return this.directory.equals(dir);
        }
    }


    /**
     * Checks to see if this File exists.
     * @return A Promise that is always resolved.  It is resolved with a truthy
     * fs.Stats object if it exists.  Otherwise, it is resolved with undefined.
     */
    public exists(): Promise<fs.Stats | undefined> {
        return new Promise<fs.Stats | undefined>((resolve: (result: fs.Stats | undefined) => void) => {
            fs.stat(this._filePath, (err: unknown, stats: fs.Stats) => {
                if (!err && stats.isFile()) {
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
            const stats = fs.statSync(this._filePath);
            return stats.isFile() ? stats : undefined;
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


    /**
     * Gets the other files in the same directory as this file.
     * @return A promise that resolves with an array of sibling files.  This
     * promise will reject if this file does not exist.  The relative/absolute
     * nature of the returned files' path will match that of this file.
     */
    public getSiblingFiles(): Promise<Array<File>> {
        return this.exists()
        .then((stats) => {
            if (stats === undefined) {
                throw new Error(`Cannot get sibling files for non existent file ${this.absPath}`);
            }

            const parentDir = this.directory;
            return parentDir.contents(false);
        })
        .then((dirContents) => {
            const thisFileName = this.fileName;

            const allFiles = dirContents.files;
            const siblingFiles = _.filter(allFiles, (curFile) => curFile.fileName !== thisFileName);
            return siblingFiles;
        });
    }


    /**
     * Sets the access mode bits for this file
     * @param mode - Numeric value representing the new access modes.  See
     * fs.constants.S_I*.
     * @return A promise for this file (for easy chaining)
     */
    public chmod(mode: number): Promise<File> {
        return new Promise((resolve, reject) => {
            fs.chmod(this._filePath, mode, (err) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(this);
            });
        });
    }


    /**
     * Sets the access mode bits for this file
     * @param mode - Numeric value representing the new access modes.  See
     * fs.constants.S_I*.
     * @return A promise for this file (for easy chaining)
     */
    public chmodSync(mode: number): void {
        fs.chmodSync(this._filePath, mode);
    }


    public absPath(): string {
        return path.resolve(this._filePath);
    }


    public absolute(): File {
        return new File(this.absPath());
    }


    public delete(): Promise<void> {
        return this.exists()
        .then((stats) => {
            if (!stats) {
                return Promise.resolve();
            }
            else {
                return unlinkAsync(this._filePath);
            }
        });
    }


    public deleteSync(): void {
        if (!this.existsSync()) {
            return;
        }

        fs.unlinkSync(this._filePath);
    }


    /**
     * Copies this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A Promise for a File representing the destination file.
     */
    public copy(dstDirOrFile: Directory | File, dstFileName?: string): Promise<File> {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        let destFile: File;

        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        }
        else { // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }

        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        return this.exists()
        .then((stats) => {
            if (!stats) {
                throw new Error(`Source file ${this._filePath} does not exist.`);
            }
        })
        .then(() => {
            //
            // Make sure the directory for the destination file exists.
            //
            return destFile.directory.ensureExists();
        })
        .then(() => {
            //
            // Do the copy.
            //
            return copyFile(this._filePath, destFile.toString(), {preserveTimestamps: true});
        })
        .then(() => {
            return destFile;
        });
    }


    /**
     * Copies this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A File representing the destination file.
     */
    public copySync(dstDirOrFile: Directory | File, dstFileName?: string): File {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        let destFile: File;

        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        }
        else { // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }

        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        if (!this.existsSync()) {
            throw new Error(`Source file ${this._filePath} does not exist.`);
        }

        //
        // Make sure the directory for the destination file exists.
        //
        destFile.directory.ensureExistsSync();

        //
        // Do the copy.
        //
        copyFileSync(this._filePath, destFile.toString(), {preserveTimestamps: true});

        return destFile;
    }


    /**
     * Moves this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A Promise for a File representing the destination file.
     */
    public move(dstDirOrFile: Directory | File, dstFileName?: string): Promise<File> {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        let destFile: File;

        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        }
        else { // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }

        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        return this.exists()
        .then((stats) => {
            if (!stats) {
                throw new Error(`Source file ${this._filePath} does not exist.`);
            }
        })
        .then(() => {
            //
            // Make sure the directory for the destination file exists.
            //
            return destFile.directory.ensureExists();
        })
        .then(() => {
            //
            // Do the copy.
            //
            return copyFile(this._filePath, destFile.toString(), {preserveTimestamps: true});
        })
        .then(() => {
            //
            // Delete the source file.
            //
            return this.delete();
        })
        .then(() => {
            return destFile;
        });
    }


    /**
     * Moves this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A File representing the destination file.
     */
    public moveSync(dstDirOrFile: Directory | File, dstFileName?: string): File {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        let destFile: File;

        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        }
        else {  // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }

        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        if (!this.existsSync()) {
            throw new Error(`Source file ${this._filePath} does not exist.`);
        }

        //
        // Make sure the directory for the destination file exists.
        //
        destFile.directory.ensureExistsSync();

        //
        // Do the copy.
        //
        copyFileSync(this._filePath, destFile.toString(), {preserveTimestamps: true});

        //
        // Delete the source file.
        //
        this.deleteSync();

        return destFile;
    }


    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     * @return A Promise that is resolved when the file has been written.
     */
    public write(text: string): Promise<void> {
        return this.directory.ensureExists()
        .then(() => {
            return new Promise<void>((resolve, reject) => {
                fs.writeFile(this._filePath, text, "utf8", (err) => {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    }


    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     */
    public writeSync(text: string): void {
        this.directory.ensureExistsSync();
        fs.writeFileSync(this._filePath, text);
    }


    /**
     * Appends the specified text to this file.
     *
     * @param text - The text to be appended
     * @param createIfNonexistent - Whether to create the file if it does not
     * exist
     * @return A successful Result if the file was appended to.  A failure
     * Result with a descriptive error message if the file could not be appended
     * to.
     */
    public async append(text: string, createIfNonexistent: boolean): Promise<Result<File, string>> {

        const alreadyExists = !!(await this.exists());
        if (!alreadyExists) {
            if (createIfNonexistent) {
                await this.write("");
            }
            else {
                return new FailedResult(`File ${this._filePath} does not exist.`);
            }
        }

        const stream = fs.createWriteStream(this._filePath, {flags: "a"});
        stream.write(text);
        return new Promise((resolve, reject) => {

            stream.once("close", () => {
                resolve(new SucceededResult(this));
            });
            stream.close();
        });
    }


    /**
     * Writes JSON data to this file, replacing the file if it exists.  If any
     * parent directories do not exist, they are created.
     * @param data - The data to be stringified and written
     * @return A Promise that is resolved when the file has been written
     */
    public writeJson(
        data: object  // eslint-disable-line @typescript-eslint/ban-types
    ): Promise<void> {
        const jsonText = JSON.stringify(data, undefined, 4);
        return this.write(jsonText);
    }


    /**
     * Writes JSON data to this file, replacing the file if it exists.  If any
     * parent directories do not exist, they are created.
     * @param data - The data to be stringified and written
     */
    public writeJsonSync(
        data: object  // eslint-disable-line @typescript-eslint/ban-types
    ): void {
        const jsonText = JSON.stringify(data, undefined, 4);
        return this.writeSync(jsonText);
    }


    /**
     * Calculates a hash of this file's contents
     * @param algorithm - The hashing algorithm to use.  For example, "md5",
     * "sha256", "sha512".  To see algorithms available on your platform, use
     * crypto.getHashes().
     * @return A Promise for a hexadecimal string containing the hash
     */
    public getHash(algorithm = "md5"): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            const input = fs.createReadStream(this._filePath);
            const hash = crypto.createHash(algorithm);
            hash.setEncoding("hex");

            input
            .on("error", (error: Error) => {
                reject(error);
            })
            .on("end", () => {
                hash.end();
                const hashValue = hash.read() as string;
                resolve(hashValue);
            });

            input
            .pipe(hash);
        });
    }


    /**
     * Calculates a hash of this file's contents
     * @param algorithm - The hashing algorithm to use.  For example, "md5",
     * "sha256", "sha512".  To see algorithms available on your platform, use
     * crypto.getHashes().
     * @return A hexadecimal string containing the hash
     */
    public getHashSync(algorithm = "md5"): string {
        const fileData = fs.readFileSync(this._filePath);
        const hash = crypto.createHash(algorithm);
        hash.update(fileData);
        return hash.digest("hex");
    }


    /**
     * Reads the contents of this file as a string.  Rejects if this file does
     * not exist.
     * @return A Promise for the text contents of this file
     */
    public read(): Promise<string> {
        return new Promise<string>((resolve: (text: string) => void, reject: (err: unknown) => void) => {
            fs.readFile(this._filePath, {encoding: "utf8"}, (err, data) => {
                if (err) {
                    reject(err);
                    return;
                }

                resolve(data);
            });
        });
    }


    /**
     * Reads the contents of this file as a string.  Throws if this file does
     * not exist.
     * @return This file's contents
     */
    public readSync(): string {
        return fs.readFileSync(this._filePath, {encoding: "utf8"});
    }


    /**
     * Reads JSON data from this file.  Rejects if this file does not exist.
     * @return A promise for the parsed data contained in this file
     */
    public readJson<T>(): Promise<T> {
        return this.read()
        .then((text) => {
            return JSON.parse(text);
        });
    }


    /**
     * Reads JSON data from this file.  Throws if this file does not exist.
     * @return The parsed data contained in this file
     */
    public readJsonSync<T>(): T {
        const text = this.readSync();
        return JSON.parse(text);
    }


    /**
     * Reads this file one line at a time.  The contents of the file are streamed
     * so that large files can be read while minimizing memory usage.
     * @param callbackFn - Callback that will be invoked for each line of this
     * file.
     * @returns A promise that resolves when the file is done being processed.
     * The promise will reject if an error is encountered.
     */
    public async readLines(callbackFn: ReadLinesCallback): Promise<void> {
        return new Promise((resolve, reject) => {
            if (!this.existsSync()) {
                reject(new Error(`The file "${this._filePath}" does not exist.`));
            }

            try {
                let lineNum = 1;

                const rl = readline.createInterface({
                    input:     fs.createReadStream(this.absPath()),
                    crlfDelay: Infinity
                });

                const listenerTracker = new ListenerTracker(rl);

                listenerTracker.on("line", (line) => {
                    callbackFn(line, lineNum);
                    lineNum += 1;
                });

                listenerTracker.once("close", () => {
                    listenerTracker.removeAll();
                    resolve();
                });

                listenerTracker.once("error", (err) => {
                    listenerTracker.removeAll();
                    reject(err);
                });
            }
            catch (err) {
                reject(err);
            }
        });
    }

}


export interface ICopyOptions {
    preserveTimestamps: boolean;
}


/**
 * Copies a file.
 * @param sourceFilePath - The path to the source file
 * @param destFilePath - The path to the destination file
 * @param options - Options for the copy operation
 * @return A Promise that is resolved when the file has been copied.
 */
function copyFile(sourceFilePath: string, destFilePath: string, options?: ICopyOptions): Promise<void> {
    //
    // Design Note
    // We could have used fs.readFile() and fs.writeFile() here, but that would
    // read the entire file contents of the source file into memory.  It is
    // thought that using streams is more efficient and performant because
    // streams can read and write smaller chunks of the data.
    //

    return new Promise<void>((resolve: () => void, reject: (err: unknown) => void) => {
        const readStream = fs.createReadStream(sourceFilePath);
        const readListenerTracker = new ListenerTracker(readStream);

        const writeStream = fs.createWriteStream(destFilePath);
        const writeListenerTracker = new ListenerTracker(writeStream);

        readListenerTracker.on("error", (err) => {
            reject(err);
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });

        writeListenerTracker.on("error", (err) => {
            reject(err);
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });

        writeListenerTracker.on("close", () => {
            resolve();
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });

        readStream.pipe(writeStream);
    })
    .then(() => {
        if (options?.preserveTimestamps) {
            //
            // The caller wants to preserve the source file's timestamps.  Copy
            // them to the destination file now.
            //
            return statAsync(sourceFilePath)
            .then((srcStats: fs.Stats) => {
                //
                // Note:  Setting the timestamps on dest requires us to specify
                // the timestamp in seconds (not milliseconds).  When we divide
                // by 1000 below and truncation happens, we are actually setting
                // dest's timestamps *before* those of of source.
                //
                return new Promise<void>((resolve, reject) => {
                    fs.utimes(destFilePath, srcStats.atime.valueOf() / 1000, srcStats.mtime.valueOf() / 1000, (err) => {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            });
        }

        return;
    });
}


/**
 * Copies a file synchronously.
 * @param sourceFilePath - The path to the source file
 * @param destFilePath - The path to the destination file
 * @param options - Options for the copy operation
 */
function copyFileSync(sourceFilePath: string, destFilePath: string, options?: ICopyOptions): void {
    const data: Buffer = fs.readFileSync(sourceFilePath);
    fs.writeFileSync(destFilePath, data);

    if (options?.preserveTimestamps) {
        const srcStats = fs.statSync(sourceFilePath);
        fs.utimesSync(destFilePath, srcStats.atime.valueOf() / 1000, srcStats.mtime.valueOf() / 1000);
    }
}
