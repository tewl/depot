import * as path from "path";
import * as _ from "lodash";
import * as BBPromise from "bluebird";
import { Directory } from "./directory";
import {File} from "./file";

export enum ActionPriority {
    PRESERVE   = "preserve",
    L_TO_R = "sync left to right",
    R_TO_L = "sync right to left"
}


export enum FileCompareActionType
{
    COPY_LEFT    = "copy left",
    COPY_RIGHT   = "copy right",
    DELETE_LEFT  = "delete left",
    DELETE_RIGHT = "delete right",
    DELETE_BOTH  = "delete both",
    SKIP         = "skip"
}


export class FileCompareAction
{

    private _files: IFilesToCompare;
    private _actionType: FileCompareActionType;

    public constructor(
        files: IFilesToCompare,
        actionType: FileCompareActionType
    )
    {
        this._files      = files;
        this._actionType = actionType;
    }


    public get type(): FileCompareActionType
    {
        return this._actionType;
    }


    /**
     * Performs this action.
     * @return A promise that is resolved when the action has completed
     *     successfully or rejects if it failed.
     */
    public execute(): Promise<void>
    {
        if (this._actionType === FileCompareActionType.COPY_LEFT) {
            return this._files.rightFile.copy(this._files.leftFile)
            .then(() => {});
        }
        else if (this._actionType === FileCompareActionType.COPY_RIGHT) {
            return this._files.leftFile.copy(this._files.rightFile)
            .then(() => { });
        }
        else if (this._actionType === FileCompareActionType.DELETE_LEFT) {
            return this._files.leftFile.delete();
        }
        else if (this._actionType === FileCompareActionType.DELETE_RIGHT) {
            return this._files.rightFile.delete();
        }
        else if (this._actionType === FileCompareActionType.DELETE_BOTH) {
            return BBPromise.all([
                this._files.leftFile.delete(),
                this._files.rightFile.delete()])
            .then(() => { });
        }
        else if (this._actionType === FileCompareActionType.SKIP) {
            return BBPromise.resolve();
        }
        else {
            return BBPromise.reject(new Error(`Unsupported action "${this._actionType}".`));
        }
    }
}

export interface IFilesToCompare
{
    leftFile: File;
    rightFile: File;
    actions(actionPriority: ActionPriority): Promise<Array<FileCompareAction>>;
}


// tslint:disable-next-line:max-classes-per-file
export class FileComparer implements IFilesToCompare
{
    public static create(leftFile: File, rightFile: File): FileComparer
    {
        return new FileComparer(leftFile, rightFile);
    }


    // #region Data Members
    private _leftFile: File;
    private _rightFile: File;
    // #endregion


    public get leftFile(): File {
        return this._leftFile;
    }


    public get rightFile(): File {
        return this._rightFile;
    }

    private constructor(leftFile: File, rightFile: File)
    {
        this._leftFile = leftFile;
        this._rightFile = rightFile;
    }

    public async isLeftOnly(): Promise<boolean>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        return !!(leftExists && !rightExists);
    }

    public async isRightOnly(): Promise<boolean>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        return !!(!leftExists && rightExists);
    }

    public async isInBoth(): Promise<boolean>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        return !!(leftExists && rightExists);
    }


    public async bothExistAndIdentical(): Promise<boolean>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        if (!leftExists || !rightExists)
        {
            // One or both of the files do not exist.
            return false;
        }

        // Both files exist.  Return a value indicating whether they are
        // identical.
        const [leftHash, rightHash] = await BBPromise.all([this._leftFile.getHash(), this._rightFile.getHash()]);
        return leftHash === rightHash;
    }

    public async actions(actionPriority: ActionPriority): Promise<Array<FileCompareAction>>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        const isLeftOnly = !!(leftExists && !rightExists);
        const isRightOnly = !!(!leftExists && rightExists);
        const isInBoth = !!(leftExists && rightExists);

        const actions: Array<FileCompareAction> = [];

        if (isLeftOnly)
        {
            if (actionPriority === ActionPriority.L_TO_R)
            {
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_RIGHT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_LEFT));
            }
            else if (actionPriority === ActionPriority.R_TO_L)
            {
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_LEFT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_RIGHT));
            }
            else if (actionPriority === ActionPriority.PRESERVE)
            {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_RIGHT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_LEFT));
            }
        }
        else if (isRightOnly)
        {
            if (actionPriority === ActionPriority.L_TO_R)
            {
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_RIGHT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_LEFT));
            }
            else if (actionPriority === ActionPriority.R_TO_L)
            {
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_LEFT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_RIGHT));
            }
            else if (actionPriority === ActionPriority.PRESERVE)
            {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_LEFT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_RIGHT));
            }
        }
        else if (isInBoth)
        {
            const [leftHash, rightHash] = await BBPromise.all([this._leftFile.getHash(), this._rightFile.getHash()]);
            const filesAreIdentical = leftHash === rightHash;

            if (filesAreIdentical)
            {
                // When the files are identical, there should be no actions.
            }
            else if (actionPriority === ActionPriority.L_TO_R)
            {
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_RIGHT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_LEFT));
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_BOTH));
            }
            else if (actionPriority === ActionPriority.R_TO_L)
            {
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_LEFT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_RIGHT));
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_BOTH));
            }
            else
            {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_RIGHT));
                actions.push(new FileCompareAction(this, FileCompareActionType.COPY_LEFT));
                actions.push(new FileCompareAction(this, FileCompareActionType.SKIP));
                actions.push(new FileCompareAction(this, FileCompareActionType.DELETE_BOTH));
            }
        }

        return actions;
    }

}


// tslint:disable-next-line:max-classes-per-file
export class DiffDirFileItem
{
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
    ): DiffDirFileItem
    {
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
    private _leftRootDir:           Directory;
    private _rightRootDir:          Directory;
    private _relativeFilePath:      string;
    private _files:                 IFilesToCompare;
    // #endregion


    private constructor(
        leftRootDir:           Directory,
        rightRootDir:          Directory,
        relativeFilePath:      string,
        files:                 IFilesToCompare
    )
    {
        this._leftRootDir           = leftRootDir;
        this._rightRootDir          = rightRootDir;
        this._relativeFilePath      = relativeFilePath;
        this._files                 = files;
    }


    public get leftRootDir(): Directory
    {
        return this._leftRootDir;
    }


    public get rightRootDir(): Directory
    {
        return this._rightRootDir;
    }


    public get relativeFilePath(): string
    {
        return this._relativeFilePath;
    }


    public get leftFile(): File
    {
        return this._files.leftFile;
    }


    public get rightFile(): File
    {
        return this._files.rightFile;
    }


    public async isLeftOnly(): Promise<boolean>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._files.leftFile.exists(),
            this._files.rightFile.exists()
        ]);

        return !!(leftExists && !rightExists);
    }


    public async isRightOnly(): Promise<boolean>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._files.leftFile.exists(),
            this._files.rightFile.exists()
        ]);

        return !!(!leftExists && rightExists);
    }


    public async isInBoth(): Promise<boolean>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._files.leftFile.exists(),
            this._files.rightFile.exists()
        ]);

        return !!(leftExists && rightExists);
    }


    public async bothExistAndIdentical(): Promise<boolean>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._files.leftFile.exists(),
            this._files.rightFile.exists()
        ]);

        if (!leftExists || !rightExists) {
            // One or both of the files do not exist.
            return false;
        }

        // Both files exist.  Return a value indicating whether they are
        // identical.
        const [leftHash, rightHash] = await BBPromise.all([this._files.leftFile.getHash(), this._files.rightFile.getHash()]);
        return leftHash === rightHash;
    }


    public async actions(actionPriority: ActionPriority): Promise<Array<FileCompareAction>>
    {
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
    includeIdentical: boolean = false
): Promise<Array<DiffDirFileItem>>
{
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
            (curLeftFile) => DiffDirFileItem.create(leftDir, rightDir, path.relative(leftDir.toString(), curLeftFile.toString()))
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
            (curRightFile) => DiffDirFileItem.create(leftDir, rightDir, path.relative(rightDir.toString(), curRightFile.toString()))
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
    if (!includeIdentical)
    {
        const identicalPromises = _.map(diffDirFileItems, (curDiffDirFileItem) => curDiffDirFileItem.bothExistAndIdentical());
        const isIdenticalValues = await BBPromise.all(identicalPromises);

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
