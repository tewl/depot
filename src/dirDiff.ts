import * as _ from "lodash";
import { Directory } from "./directory";
import { File } from "./file";
import { assertNever } from "./never";
import { FailedResult, Result, SucceededResult } from "./result";


// TODO: Does this whole file needs to be updated to allow for directories too?


/**
 * Contains properties that are used to determine whether two files are
 * equivalent.
 */
export class FileFingerprint {

    public constructor(
        public readonly file: File
    ) {
    }


    public async equals(other: FileFingerprint): Promise<Result<boolean, string>> {

        // First, compare the properties that come from the files' stats. This
        // is done first, because it is much faster, and if there are
        // differences we can return early.
        const [thisStats, otherStats] = await Promise.all([
            this.file.exists(),
            other.file.exists()
        ]);

        if (thisStats === undefined) {
            return new FailedResult(`The file "${this.file.toString()}" does not exist.`);
        }

        if (otherStats === undefined) {
            return new FailedResult(`The file "${other.file.toString()}" does not exist.`);
        }

        // Return early if the stats differ.
        if (thisStats.size !== otherStats.size ||
            thisStats.mtimeMs !== otherStats.mtimeMs) {
            return new SucceededResult(false);
        }

        // So far the files look like they are equivalent.  Hash the contents to
        // know for sure.
        const [thisHash, otherHash] = await Promise.all([
            this.file.getHash("sha256"),
            other.file.getHash("sha256")
        ]);

        return new SucceededResult(thisHash === otherHash);
    }
}

/**
 * The line items that make up a DirDiff
 */

export class DirDiffItem {

    public constructor(
        public readonly x: DirDiffItemExtantFile | DirDiffItemNonextantFile,
        public readonly y: DirDiffItemExtantFile | DirDiffItemNonextantFile
    ) {
    }

    // Implementation note: This class should not implement syncing x to y or y
    // to x, because deletions should always be done first (see note regarding
    // case sensitivity on DirDiff.create()).
}

/**
 * One side of a DirDiffItem representing a file that is present.
 */
export class DirDiffItemExtantFile {

    private readonly _fingerprint: FileFingerprint;

    public constructor(
        public readonly ancestorDir: Directory,
        public readonly file: File
    ) {
        this._fingerprint = new FileFingerprint(file);
    }

    public get fingerprint(): FileFingerprint {
        return this._fingerprint;
    }
}

/**
 * One side of a DirDiffItem representing a file that does not exist.
 */
export class DirDiffItemNonextantFile {

    public constructor(
        public readonly ancestorDir: Directory,
        public readonly file: File
    ) {
    }
}

/**
 * An operation to delete a file
 */
export class FileOpDelete {
    public constructor(
        public readonly file: File
    ) {
    }

    public execute(): Promise<void> {
        return this.file.delete();
    }
}

/**
 * An operation to copy one file over another
 */
export class FileOpOverwrite {
    public constructor(
        public readonly srcFile: File,
        public readonly dstFile: File
    ) {
    }
}

/**
 * An operation to copy a file to a specified location (destination does not
 * already exist)
 */
export class FileOpCopy {
    public constructor(
        public readonly srcFile: File,
        public readonly dstFile: File
    ) {
    }
}

/**
 * All possible file operations
 */
export type FileOp = FileOpDelete | FileOpOverwrite | FileOpCopy;

/**
 * Domain object representing the output of comparing two directories
 */
export class DirDiff {

    /**
     * Compares the contents of two directories (files only).
     *
     * Note: This method is currently case sensitive.  Because of this, a file that
     * is common to both but differs in case may show up as a "unique to X" and a
     * "unique to Y" instance.  Therefore, when processing the output of this
     * function, clients should perform deletions first (based on which side is
     * preferred).
     *
     * @param xDir - The first directory
     * @param yDir - The second directory
     * @return An array of file pairings that describe the differences found.
     */
    public static async create(
        xDir: Directory,
        yDir: Directory
    ): Promise<DirDiff> {
        const [xContents, yContents] = await Promise.all([xDir.contents(true), yDir.contents(true)]);

        // Helper function that converts an array of files into a map where the
        // key is a string containing the file's relative path and the value is
        // a DirDiffItemExtantFile instance representing the file.
        function filesToMap(files: Array<File>, ancestorDir: Directory): Map<string, DirDiffItemExtantFile> {
            const kvTuples = files.map((curFile) => {
                const relPath = File.relative(ancestorDir, curFile).toString();
                const ef = new DirDiffItemExtantFile(ancestorDir, curFile);
                return [relPath, ef] as const;
            });
            return new Map(kvTuples);
        }

        const xMap = filesToMap(xContents.files, xDir);
        const yMap = filesToMap(yContents.files, yDir);

        const diffItems: Array<DirDiffItem> = [];
        for (const [xRelPath, xExtantFile] of xMap) {
            const yExtantFile = yMap.get(xRelPath);

            if (yExtantFile === undefined) {
                const yNonextantFile = new DirDiffItemNonextantFile(yDir, new File(yDir, xRelPath));
                diffItems.push(new DirDiffItem(xExtantFile, yNonextantFile));
            }
            else {
                diffItems.push(new DirDiffItem(xExtantFile, yExtantFile));
                yMap.delete(xRelPath);
            }
        }

        for (const [yRelPath, yExtantFile] of yMap) {
            const xNonextantFile = new DirDiffItemNonextantFile(xDir, new File(xDir, yRelPath));
            diffItems.push(new DirDiffItem(xNonextantFile, yExtantFile));
        }

        return new DirDiff(xDir, yDir, diffItems);
    }


    public constructor(
        public readonly xDir: Directory,
        public readonly yDir: Directory,
        public readonly items: Array<DirDiffItem>
    ) {
    }


    // TODO: Return a list of operations that can then be executed.
    //       The deletions must be listed first.

    public async syncXToY(): Promise<void> {

        // Do all deletions first (see the note regarding case sensitivity on
        // DirDiff.create()).
        const [yOnlyItems, otherItems] =
            _.partition(this.items, (item) => item.x instanceof DirDiffItemNonextantFile);

        await Promise.all(yOnlyItems.map((e) => e.y.file.delete()));

        // In all other cases, there exists an x file that may or may not need to be
        // copied.
        await Promise.all(
            otherItems.reduce(
                (acc, diffItem) => {

                    // otherItems will always have an extant x.
                    const x = diffItem.x as DirDiffItemExtantFile;

                    if (diffItem.y instanceof DirDiffItemNonextantFile) {
                        // There is no y file.  Copy the x file.
                        acc.push(diffItem.x.file.copy(diffItem.y.file));
                    }
                    else if (diffItem.y instanceof DirDiffItemExtantFile) {
                        const promise =
                            x.fingerprint.equals(diffItem.y.fingerprint)
                            .then((res) => {
                                if (res.failed) {
                                    throw new Error(res.error);
                                }

                                const isEqual = res.value;
                                return isEqual ?
                                    Promise.resolve(undefined) :
                                    x.file.copy(diffItem.y.file);
                            });
                        acc.push(promise);
                    }
                    else {
                        assertNever(diffItem.y);
                    }
                    return acc;
                },
                [] as Array<Promise<unknown>>
            )
        );
    }


    // TODO: Return a list of operations that can then be executed.
    //       The deletions must be listed first.
    public async syncYToX(): Promise<void> {
        const flipped = this.flipXY();
        return flipped.syncXToY();
    }


    /**
     * Returns a new DirDiff with the sides swapped.
     *
     * @return A new DirDiff instance where the sides are swapped
     */
    public flipXY(): DirDiff {
        return new DirDiff(
            this.yDir,
            this.xDir,
            this.items.map((item) => new DirDiffItem(item.y, item.x))
        );
    }
}
