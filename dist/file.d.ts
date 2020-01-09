/// <reference types="node" />
import * as fs from "fs";
import { Directory } from "./directory";
import { PathPart } from "./pathHelpers";
export declare class File {
    static relative(from: Directory, to: File): File;
    /**
     * Calculates the parts of the relative path from `from` to `to`.
     * @param from - The starting point
     * @param to - The ending point
     * @return An array of strings representing the path segments needed to get
     * from `from` to `to`.
     */
    static relativeParts(from: Directory, to: File): Array<string>;
    private readonly _filePath;
    constructor(pathPart: PathPart, ...pathParts: Array<PathPart>);
    /**
     * Gets the directory portion of this file's path (everything before the
     * file name and extension).
     * @return The directory portion of this file's path.  This string will
     * always end with the OS's directory separator ("/").
     */
    readonly dirName: string;
    /**
     * Gets this file's base name.  This is the part of the file name preceding
     * the extension.
     * @return This file's base name.
     */
    readonly baseName: string;
    /**
     * Gets the full file name of this file.  This includes both the base name
     * and extension.
     * @return This file's file name
     */
    readonly fileName: string;
    /**
     * Gets the extension of this file.  This includes the initial dot (".").
     * @return This file's extension
     */
    readonly extName: string;
    /**
     * Gets the directory containing this file
     * @return A Directory object representing this file's directory.
     */
    readonly directory: Directory;
    toString(): string;
    equals(otherFile: File): boolean;
    /**
     * Checks to see if this File exists.
     * @return A Promise that is always resolved.  It is resolved with a truthy
     * fs.Stats object if it exists.  Otherwise, it is resolved with undefined.
     */
    exists(): Promise<fs.Stats | undefined>;
    existsSync(): fs.Stats | undefined;
    /**
     * Sets the access mode bits for this file
     * @param mode - Numeric value representing the new access modes.  See
     * fs.constants.S_I*.
     * @return A promise for this file (for easy chaining)
     */
    chmod(mode: number): Promise<File>;
    /**
     * Sets the access mode bits for this file
     * @param mode - Numeric value representing the new access modes.  See
     * fs.constants.S_I*.
     * @return A promise for this file (for easy chaining)
     */
    chmodSync(mode: number): void;
    absPath(): string;
    absolute(): File;
    delete(): Promise<void>;
    deleteSync(): void;
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
    copy(dstDirOrFile: Directory | File, dstFileName?: string): Promise<File>;
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
    copySync(dstDirOrFile: Directory | File, dstFileName?: string): File;
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
    move(dstDirOrFile: Directory | File, dstFileName?: string): Promise<File>;
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
    moveSync(dstDirOrFile: Directory | File, dstFileName?: string): File;
    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     * @return A Promise that is resolved when the file has been written.
     */
    write(text: string): Promise<void>;
    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     */
    writeSync(text: string): void;
    /**
     * Writes JSON data to this file, replacing the file if it exists.  If any
     * parent directories do not exist, they are created.
     * @param data - The data to be stringified and written
     * @return A Promise that is resolved when the file has been written
     */
    writeJson(data: object): Promise<void>;
    /**
     * Writes JSON data to this file, replacing the file if it exists.  If any
     * parent directories do not exist, they are created.
     * @param data - The data to be stringified and written
     */
    writeJsonSync(data: object): void;
    /**
     * Calculates a hash of this file's contents
     * @param algorithm - The hashing algorithm to use.  For example, "md5",
     * "sha256", "sha512".  To see algorithms available on your platform, run
     * `openssl list-message-digest-algorithms`.
     * @return A Promise for a hexadecimal string containing the hash
     */
    getHash(algorithm?: string): Promise<string>;
    /**
     * Calculates a hash of this file's contents
     * @param algorithm - The hashing algorithm to use.  For example, "md5",
     * "sha256", "sha512".  To see algorithms available on your platform, run
     * `openssl list-message-digest-algorithms`.
     * @return A hexadecimal string containing the hash
     */
    getHashSync(algorithm?: string): string;
    /**
     * Reads the contents of this file as a string.  Rejects if this file does
     * not exist.
     * @return A Promise for the text contents of this file
     */
    read(): Promise<string>;
    /**
     * Reads the contents of this file as a string.  Throws if this file does
     * not exist.
     * @return This file's contents
     */
    readSync(): string;
    /**
     * Reads JSON data from this file.  Rejects if this file does not exist.
     * @return A promise for the parsed data contained in this file
     */
    readJson<T>(): Promise<T>;
    /**
     * Reads JSON data from this file.  Throws if this file does not exist.
     * @return The parsed data contained in this file
     */
    readJsonSync<T>(): T;
}
export interface ICopyOptions {
    preserveTimestamps: boolean;
}
