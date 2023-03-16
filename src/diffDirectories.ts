import * as path from "path";
import * as _ from "lodash";
import { Directory } from "./directory";
import {File} from "./file";
import { Stats } from "fs";

export enum ActionPriority {
    PRESERVE   = "preserve",
    SyncLeftToRight = "sync left to right",
    SyncRightToLeft = "sync right to left"
}


export enum FileCompareActionType {
    CopyLeft    = "copy left",
    CopyRight   = "copy right",
    DeleteLeft  = "delete left",
    DeleteRight = "delete right",
    DeleteBoth  = "delete both",
    Skip        = "skip"
}


export class FileCompareAction {

    private readonly _files: IFilesToCompare;
    private readonly _actionType: FileCompareActionType;

    public constructor(
        files: IFilesToCompare,
        actionType: FileCompareActionType
    ) {
        this._files      = files;
        this._actionType = actionType;
    }


    public get type(): FileCompareActionType {
        return this._actionType;
    }


    /**
     * Performs this action.
     * @return A promise that is resolved when the action has completed
     *     successfully or rejects if it failed.
     */
    public execute(): Promise<void> {
        if (this._actionType === FileCompareActionType.CopyLeft) {
            return this._files.rightFile.copy(this._files.leftFile)
            .then(() => { return; });
        }
        else if (this._actionType === FileCompareActionType.CopyRight) {
            return this._files.leftFile.copy(this._files.rightFile)
            .then(() => { return; });
        }
        else if (this._actionType === FileCompareActionType.DeleteLeft) {
            return this._files.leftFile.delete();
        }
        else if (this._actionType === FileCompareActionType.DeleteRight) {
            return this._files.rightFile.delete();
        }
        else if (this._actionType === FileCompareActionType.DeleteBoth) {
            return Promise.all(
                [
                    this._files.leftFile.delete(),
                    this._files.rightFile.delete()
                ]
            )
            .then(() => { return; });
        }
        else if (this._actionType === FileCompareActionType.Skip) {
            return Promise.resolve();
        }
        else {
            return Promise.reject(new Error(`Unsupported action "${this._actionType}".`));
        }
    }
}

export interface IFilesToCompare {
    leftFile: File;
    rightFile: File;
    actions(actionPriority: ActionPriority): Promise<Array<FileCompareAction>>;
}


export class FileComparer implements IFilesToCompare {
    public static create(leftFile: File, rightFile: File): FileComparer {
        return new FileComparer(leftFile, rightFile);
    }


    // #region Data Members
    private readonly _leftFile: File;
    private readonly _rightFile: File;
    // #endregion


    public get leftFile(): File {
        return this._leftFile;
    }


    public get rightFile(): File {
        return this._rightFile;
    }

    private constructor(leftFile: File, rightFile: File) {
        this._leftFile = leftFile;
        this._rightFile = rightFile;
    }

    public async isLeftOnly(): Promise<boolean> {
        const [leftExists, rightExists] = await Promise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        return !!(leftExists && !rightExists);
    }

    public async isRightOnly(): Promise<boolean> {
        const [leftExists, rightExists] = await Promise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        return !!(!leftExists && rightExists);
    }

    public async isInBoth(): Promise<boolean> {
        const [leftExists, rightExists] = await Promise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        return !!(leftExists && rightExists);
    }


    public async bothExistAndIdentical(): Promise<boolean> {
        return filesAreIdentical(this._leftFile, undefined, this._rightFile, undefined);
    }

    public async actions(actionPriority: ActionPriority): Promise<Array<FileCompareAction>> {

        const [leftStats, rightStats] = await Promise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        const isLeftOnly = !!(leftStats && !rightStats);
        const isRightOnly = !!(!leftStats && rightStats);
        const isInBoth = !!(leftStats && rightStats);

        const actions: Array<FileCompareAction> = [];

        if (isLeftOnly) {
            if (actionPriority === ActionPriority.SyncLeftToRight) {
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyRight));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteLeft));
            }
            else if (actionPriority === ActionPriority.SyncRightToLeft) {
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteLeft));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyRight));
            }
            else if (actionPriority === ActionPriority.PRESERVE) {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyRight));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteLeft));
            }
        }
        else if (isRightOnly) {
            if (actionPriority === ActionPriority.SyncLeftToRight) {
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteRight));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyLeft));
            }
            else if (actionPriority === ActionPriority.SyncRightToLeft) {
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyLeft));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteRight));
            }
            else if (actionPriority === ActionPriority.PRESERVE) {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyLeft));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteRight));
            }
        }
        else if (isInBoth) {

            const filesIdentical = await filesAreIdentical(this._leftFile, leftStats, this._rightFile, rightStats);

            if (filesIdentical) {
                // When the files are identical, there should be no actions.
            }
            else if (actionPriority === ActionPriority.SyncLeftToRight) {
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyRight));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyLeft));
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteBoth));
            }
            else if (actionPriority === ActionPriority.SyncRightToLeft) {
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyLeft));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyRight));
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteBoth));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyRight));
                actions.push(new FileCompareAction(this, FileCompareActionType.CopyLeft));
                actions.push(new FileCompareAction(this, FileCompareActionType.Skip));
                actions.push(new FileCompareAction(this, FileCompareActionType.DeleteBoth));
            }
        }

        return actions;
    }

}


async function filesAreIdentical(
    leftFile: File,
    leftStats: Stats | undefined,
    rightFile: File,
    rightStats: Stats | undefined
): Promise<boolean> {

    if (leftStats === undefined || rightStats === undefined) {
        [leftStats, rightStats] = await Promise.all([leftFile.exists(), rightFile.exists()]);
    }

    if (leftStats === undefined || rightStats === undefined) {
        return false;
    }

    if (leftStats.size !== rightStats.size) {
        return false;
    }

    if (leftStats.mtimeMs !== rightStats.mtimeMs) {
        return false;
    }

    const [leftHash, rightHash] = await Promise.all([leftFile.getHash(), rightFile.getHash()]);
    if (leftHash !== rightHash) {
        return false;
    }

    // If we made it this far, they must be equal.
    return true;
}


export class DiffDirFileItem {
    /**
     * Creates a new instance.
     * @param leftRootDir - The left directory being compared
     * @param rightRootDir - The right directory being compared
     * @param relativeFilePath - The relative file path (to the directory being
     *     compared)
     * @param actionPriority - The overall action being performed so that the
     *     actions associated with this file item can be prioritized
     * @return A newly created DiffDirFileItem instance
     */
    public static create(
        leftRootDir:      Directory,
        rightRootDir:     Directory,
        relativeFilePath: string
    ): DiffDirFileItem {
        // The relative file path must be legit.
        if (relativeFilePath.length === 0) {
            throw new Error(`DiffDirFileItem relative file path cannot be 0-length.`);
        }

        const leftFile = new File(leftRootDir, relativeFilePath);
        const rightFile = new File(rightRootDir, relativeFilePath);

        return new DiffDirFileItem(
            leftRootDir,
            rightRootDir,
            relativeFilePath,
            FileComparer.create(leftFile, rightFile)
        );
    }


    // #region Data Members
    private readonly _leftRootDir:           Directory;
    private readonly _rightRootDir:          Directory;
    private readonly _relativeFilePath:      string;
    private readonly _files:                 IFilesToCompare;
    // #endregion


    private constructor(
        leftRootDir:           Directory,
        rightRootDir:          Directory,
        relativeFilePath:      string,
        files:                 IFilesToCompare
    ) {
        this._leftRootDir           = leftRootDir;
        this._rightRootDir          = rightRootDir;
        this._relativeFilePath      = relativeFilePath;
        this._files                 = files;
    }


    public get leftRootDir(): Directory {
        return this._leftRootDir;
    }


    public get rightRootDir(): Directory {
        return this._rightRootDir;
    }


    public get relativeFilePath(): string {
        return this._relativeFilePath;
    }


    public get leftFile(): File {
        return this._files.leftFile;
    }


    public get rightFile(): File {
        return this._files.rightFile;
    }


    public async isLeftOnly(): Promise<boolean> {
        const [leftExists, rightExists] = await Promise.all([
            this._files.leftFile.exists(),
            this._files.rightFile.exists()
        ]);

        return !!(leftExists && !rightExists);
    }


    public async isRightOnly(): Promise<boolean> {
        const [leftExists, rightExists] = await Promise.all([
            this._files.leftFile.exists(),
            this._files.rightFile.exists()
        ]);

        return !!(!leftExists && rightExists);
    }


    public async isInBoth(): Promise<boolean> {
        const [leftExists, rightExists] = await Promise.all([
            this._files.leftFile.exists(),
            this._files.rightFile.exists()
        ]);

        return !!(leftExists && rightExists);
    }


    public async bothExistAndIdentical(): Promise<boolean> {
        const [leftExists, rightExists] = await Promise.all([
            this._files.leftFile.exists(),
            this._files.rightFile.exists()
        ]);

        if (!leftExists || !rightExists) {
            // One or both of the files do not exist.
            return false;
        }

        // Both files exist.  Return a value indicating whether they are
        // identical.
        const [leftHash, rightHash] = await Promise.all([
            this._files.leftFile.getHash(),
            this._files.rightFile.getHash()
        ]);
        return leftHash === rightHash;
    }


    public actions(actionPriority: ActionPriority): Promise<Array<FileCompareAction>> {
        const actions = this._files.actions(actionPriority);
        return actions;
    }
}



/**
 * Compares (recursively) the files within two directories.
 * @param leftDir - The left directory to be compared
 * @param rightDir - The right directory to be compared
 * @param actionPriority - The action being performed so that the actions
 *     associated with each result can be prioritized.
 * @param includeIdentical - Whether to include files that are identical in both
 *     `leftDir` and `rightDir` in the returned results.  If true, identical
 *     files will be included with a 0-length array of actions.
 * @return An array of items representing the differences found between
 *     `leftDir` and `rightDir`.
 */
export async function diffDirectories(
    leftDir: Directory,
    rightDir: Directory,
    includeIdentical = false
): Promise<Array<DiffDirFileItem>> {
    //
    // Create an array of DiffDirFileItems for the files in the left directory.
    //
    const leftPromise = leftDir.contents(true)
    .then(
        (leftContents) => leftContents.files,
        () => []     // Left directory does not exist.
    )
    .then((leftFiles) => {
        return _.map(
            leftFiles,
            (curLeftFile) => DiffDirFileItem.create(leftDir, rightDir,
                                                    path.relative(leftDir.toString(), curLeftFile.toString()))
        );
    });

    //
    // Create an array of DiffDirFileItems for the files in the right directory.
    //
    const rightPromise = rightDir.contents(true)
    .then(
        (rightContents) => rightContents.files,
        () => []    // Right directory does not exist.
    )
    .then((rightFiles) => {
        return _.map(
            rightFiles,
            (curRightFile) => DiffDirFileItem.create(leftDir,
                                                     rightDir,
                                                     path.relative(rightDir.toString(), curRightFile.toString()))
        );
    });

    // Combine the left and right files into a single array.
    let diffDirFileItems: Array<DiffDirFileItem> = _.concat<DiffDirFileItem>(await leftPromise, await rightPromise);

    // If a file exists in both left and right, we don't want it to be
    // represented twice.  So make the list unique based on the file's relative
    // path.
    diffDirFileItems = _.uniqBy(diffDirFileItems, (curDiffDirFileItem) => curDiffDirFileItem.relativeFilePath);

    //
    // If not including identical files, remove them.
    //
    if (!includeIdentical) {
        const identicalPromises = _.map(diffDirFileItems,
                                        (curDiffDirFileItem) => curDiffDirFileItem.bothExistAndIdentical());
        const isIdenticalValues = await Promise.all(identicalPromises);

        // Zip each DiffDirFileItem with the boolean indicating whether its files are identical.
        const pairs = _.zip(diffDirFileItems, isIdenticalValues);

        diffDirFileItems = _.chain(pairs)
        .filter((curPair) => !curPair[1])    // Keep items that are not identical.
        .map((curPair) => curPair[0]!)       // Convert from pair back to DiffDirFileItem.
        .value();
    }

    //
    // Sort the DiffDirFileItem instances so that left-only and right-only files
    // from the same directory will be next to each other.
    //
    diffDirFileItems = _.sortBy(diffDirFileItems, (curDiffDirFileItem) => curDiffDirFileItem.relativeFilePath);

    return diffDirFileItems;
}
