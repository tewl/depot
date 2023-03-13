import { Directory } from "./directory";
import { File } from "./file";
import { FailedResult, Result, SucceededResult } from "./result";


// TODO: This whole file needs to be updated to allow for directories too.

////////////////////////////////////////////////////////////////////////////////

/**
 * An object containing the attributes that are used to determine whether a file
 * from the X directory is equivalent to a file from the Y directory.
 */
export class FilePairingItemFingerprint {

    public static async create(
        file: File
    ): Promise<Result<FilePairingItemFingerprint, string>> {
        // Stat the file first, because we don't want to calculate the hash of its
        // contents until we know for sure it exists.
        const stats = await file.exists();
        if (stats === undefined) {
            return new FailedResult(`File "${file.toString()}" does not exist.`);
        }

        const hash = await file.getHash("sha256");

        return new SucceededResult(new FilePairingItemFingerprint(
            stats.size,
            stats.mtimeMs,
            hash
        ));
    }

    private constructor(
        public readonly bytes: number,
        public readonly mtimeMs: number,
        public readonly hash: string
    ) {
    }

    public equals(other: FilePairingItemFingerprint): boolean {
        return this.bytes === other.bytes &&
            this.mtimeMs === other.mtimeMs &&
            this.hash === other.hash;
    }
}


////////////////////////////////////////////////////////////////////////////////

/**
 * Information about a file appearing on the X side or the Y side.
 */
export interface IFilePairingItem {
    file: File,
    ancestorDir: Directory;
    fingerprint: FilePairingItemFingerprint;
}

////////////////////////////////////////////////////////////////////////////////

/**
 * A file pairing where the file only exists in the X directory.
 */
export class FilePairingX {
    public constructor(public readonly xFingerprint: IFilePairingItem) {
    }
}

/**
 * A file pairing where the file only exists in the Y directory.
 */
export class FilePairingY {
    public constructor(public readonly yFingerprint: IFilePairingItem) {
    }
}

/**
 * A file pairing where the file exists in both the X and Y directories.
 */
export class FilePairingXY {
    public constructor(
        public readonly xFingerprint: IFilePairingItem,
        public readonly yFingerprint: IFilePairingItem
    ) {
    }
}

/**
 * All possible file pairings
 */
export type FilePairing = FilePairingX | FilePairingY | FilePairingXY;

////////////////////////////////////////////////////////////////////////////////

/**
 * The result of comparing two directories.
 */
export interface IDirectoryCompareResult {
    uniqueToX: Array<FilePairingX>;
    uniqueToY: Array<FilePairingY>;
    common: Array<FilePairingXY>;
}

/**
 * Compares the contents of two directories (files only) and returns a list of
 * files that are unique to X, unique to Y, and in both X and Y.
 *
 * Note: This method is currently case sensitive.  Because of this, a file that
 * is common to both but differs in case may show up as a "unique to X" and a
 * "unique to Y" instance.  Therefore, when processing the output of this
 * function, clients should perform deletions first (based on which side is
 * preferred).
 *
 * @param dirX - The first directory
 * @param dirY - The second directory
 * @return An array of file pairings that describe the differences found.
 */
export async function compareDirectories(
    dirX: Directory,
    dirY: Directory
): Promise<Array<FilePairing>> {

    const [xContents, yContents] = await Promise.all([dirX.contents(true), dirY.contents(true)]);

    // Helper function that gets a directory comparison representation of a
    // File.
    async function getFilePairingItem(file: File, ancestorDir: Directory): Promise<IFilePairingItem> {
        const fpRes = await FilePairingItemFingerprint.create(file);
        if (fpRes.failed) {
            // This should never happen, because all files will exist.
            throw new Error(fpRes.error);
        }

        return {
            file,
            ancestorDir,
            fingerprint: fpRes.value
        };
    }

    // Start all fingerprinting at once so they are all done in parallel.
    const xPromises = xContents.files.map((curFile) => getFilePairingItem(curFile, dirX));
    const yPromises = yContents.files.map((curFile) => getFilePairingItem(curFile, dirY));
    const xFilePairingItems = await Promise.all(xPromises);
    const yFilePairingItems = await Promise.all(yPromises);

    // Create a mapping of relative path to the fingerprint.
    const xMap = new Map(
        xFilePairingItems.map((filePairingItem) => {
            const relPath = File.relative(filePairingItem.ancestorDir, filePairingItem.file).toString();
            return [relPath, filePairingItem];
        })
    );
    const yMap = new Map(
        yFilePairingItems.map((filePairingItem) => {
            const relPath = File.relative(filePairingItem.ancestorDir, filePairingItem.file).toString();
            return [relPath, filePairingItem];
        })
    );

    // Start by iterating through the files in xMap.  They will be either unique
    // to X, or be in both X and Y.
    const pairings: Array<FilePairing> = [];
    for (const [xRelFilePath, xFilePairingItem] of xMap) {
        const yDirComparisonFile = yMap.get(xRelFilePath);

        if (yDirComparisonFile === undefined) {
            const pairing = new FilePairingX(xFilePairingItem);
            pairings.push(pairing);
        }
        else {
            const pairing = new FilePairingXY(xFilePairingItem, yDirComparisonFile);
            pairings.push(pairing);
            yMap.delete(xRelFilePath);
        }
    }

    // Since we removed the common files from yMap, yMap now contains files that
    // are unique to Y.
    for (const [__yRelPath, yFilePairingItem] of yMap) {
        const pairing = new FilePairingY(yFilePairingItem);
        pairings.push(pairing);
    }

    return pairings;
}
