/// <reference types="node" />
import * as fs from "fs";
import { File } from "./file";
import { PathPart } from "./pathHelpers";
export interface IDirectoryContents {
    subdirs: Array<Directory>;
    files: Array<File>;
}
export declare type WalkCallback = (item: Directory | File) => boolean | Promise<boolean>;
export declare class Directory {
    /**
     * Creates a Directory representing the relative path from `from` to `to`
     * @param from - The starting directory
     * @param to - The ending directory
     * @return A directory representing the relative path from `from` to `to`
     */
    static relative(from: Directory, to: Directory): Directory;
    /**
     * Calculates the parts of the relative path from `from` to `to`.
     * @param from - The starting point
     * @param to - The ending point
     * @return An array of strings representing the path segments needed to get
     * from `from` to `to`.
     */
    static relativeParts(from: Directory, to: Directory): Array<string>;
    private readonly _dirPath;
    constructor(pathPart: PathPart, ...pathParts: Array<PathPart>);
    /**
     * Gets the name of this directory (without the preceding path)
     */
    readonly dirName: string;
    toString(): string;
    equals(otherDir: Directory): boolean;
    /**
     * Gets the absolute path of this Directory.
     * @return The absolute path of this Directory
     */
    absPath(): string;
    /**
     * Makes another Directory instance that is wrapping this Directory's
     * absolute path.
     * @return A new Directory representing this Directory's absolute path.
     */
    absolute(): Directory;
    exists(): Promise<fs.Stats | undefined>;
    existsSync(): fs.Stats | undefined;
    isEmpty(): Promise<boolean>;
    isEmptySync(): boolean;
    ensureExists(): Promise<Directory>;
    ensureExistsSync(): Directory;
    empty(): Promise<Directory>;
    emptySync(): Directory;
    delete(): Promise<void>;
    deleteSync(): void;
    /**
     * Reads the contents of this directory.
     * @param recursive - Whether to find subdirectories and files recursively
     * @return The contents of the directory, separated into a list of files and
     * a list of subdirectories.  The relative/absolute nature of the returned
     * File and Directory objects will be determined by the relative/absolute
     * nature of this Directory object.
     */
    contents(recursive?: boolean): Promise<IDirectoryContents>;
    /**
     * Reads the contents of this directory.
     * @param recursive - Whether to find subdirectories and files recursively
     * @return The contents of the directory, separated into a list of files and a
     * list of subdirectories.  All paths returned are absolute paths.
     */
    contentsSync(recursive?: boolean): IDirectoryContents;
    /**
     * Recursively removes empty subdirectories from within this directory.
     * @return A Promise that is resolved when this directory has been pruned.
     */
    prune(): Promise<void>;
    /**
     * Recursively removes empty subdirectories from this directory.
     */
    pruneSync(): void;
    /**
     * Copies this directory to destDir.
     * @param destDir - The destination directory
     * @param copyRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     * @return A promise that is resolved with a Directory object representing
     * the destination directory.  If copyRoot is false, this will be destDir.
     * If copyRoot is true, this will be this Directory's counterpart
     * subdirectory in destDir.
     */
    copy(destDir: Directory, copyRoot: boolean): Promise<Directory>;
    /**
     * Copies this directory to destDir.
     * @param destDir - The destination directory
     * @param copyRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     */
    copySync(destDir: Directory, copyRoot: boolean): Directory;
    /**
     * Moves this Directory or the contents of this Directory to destDir.
     * @param destDir - The destination directory
     * @param moveRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     * @return A promise that is resolved with a Directory object representing
     * the destination directory.  If moveRoot is false, this will be destDir.
     * If moveRoot is true, this will be this Directory's counterpart
     * subdirectory in destDir.
     */
    move(destDir: Directory, moveRoot: boolean): Promise<Directory>;
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
    walk(cb: WalkCallback): Promise<void>;
}
