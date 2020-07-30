import * as path from "path";
import * as _ from "lodash";
import * as BBPromise from "bluebird";
import { Directory } from "./directory";
import {File} from "./file";


export enum ActionPriority {
    NONE   = "no priority",
    L_TO_R = "sync left to right",
    R_TO_L = "sync right to left"
}


export enum DiffDirFileItemActionType
{
    COPY_LEFT    = "copy left",
    COPY_RIGHT   = "copy right",
    DELETE_LEFT  = "delete left",
    DELETE_RIGHT = "delete right",
    DELETE_BOTH  = "delete both",
    SKIP         = "skip"
}


export class DiffDirFileItemAction
{

    private _fileItem: DiffDirFileItem;
    private _actionType: DiffDirFileItemActionType;

    public constructor(
        fileItem: DiffDirFileItem,
        actionType: DiffDirFileItemActionType
    )
    {
        this._fileItem   = fileItem;
        this._actionType = actionType;
    }


    public get type(): DiffDirFileItemActionType
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
        if (this._actionType === DiffDirFileItemActionType.COPY_LEFT) {
            // In order to copy left, the right file must exist.
            if (this._fileItem.rightFile === undefined) {
                return BBPromise.reject(new Error("COPY_LEFT cannot be done without a right file."));
            }
            const destFile: File = new File(this._fileItem.leftRootDir, this._fileItem.relativeFilePath);
            return this._fileItem.rightFile.copy(destFile)
            .then(() => { });
        }
        else if (this._actionType === DiffDirFileItemActionType.COPY_RIGHT) {
            // In order to copy right, the left file must exist.
            if (this._fileItem.leftFile === undefined) {
                return BBPromise.reject(new Error("COPY_RIGHT cannot be done without a left file."));
            }
            const destFile: File = new File(this._fileItem.rightRootDir, this._fileItem.relativeFilePath);
            return this._fileItem.leftFile.copy(destFile)
            .then(() => { });
        }
        else if (this._actionType === DiffDirFileItemActionType.DELETE_LEFT) {
            // In order to delete left, the left file must exist.
            if (this._fileItem.leftFile === undefined) {
                return BBPromise.reject(new Error("DELETE_LEFT cannot be done without a left file."));
            }
            return this._fileItem.leftFile.delete();
        }
        else if (this._actionType === DiffDirFileItemActionType.DELETE_RIGHT) {
            // In order to delete right, the right file must exist.
            if (this._fileItem.rightFile === undefined) {
                return BBPromise.reject(new Error("DELETE_RIGHT cannot be done without a right file."));
            }
            return this._fileItem.rightFile.delete();
        }
        else if (this._actionType === DiffDirFileItemActionType.DELETE_BOTH) {
            // In order to delete the left file, the left file must exist.
            if (this._fileItem.leftFile === undefined) {
                return BBPromise.reject(new Error("DELETE_BOTH cannot be done without a left file."));
            }
            // In order to delete the right file, the right file must exist.
            if (this._fileItem.rightFile === undefined) {
                return BBPromise.reject(new Error("DELETE_BOTH cannot be done without a right file."));
            }
            return BBPromise.all([
                this._fileItem.leftFile.delete(),
                this._fileItem.rightFile.delete()])
            .then(() => { });

        }
        else if (this._actionType === DiffDirFileItemActionType.SKIP) {
            return BBPromise.resolve();
        }
        else {
            return BBPromise.reject(new Error(`Unsupported action "${this._actionType}".`));
        }
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
    public static async create(
        leftRootDir:      Directory,
        rightRootDir:     Directory,
        relativeFilePath: string,
        actionPriority:   ActionPriority
        ): Promise<DiffDirFileItem>
    {
        // TODO: Need to find references to this static function and update them
        // because this method is now asynchronous.

        // The relative file path must be legit.
        if (relativeFilePath.length === 0) {
            return BBPromise.reject(new Error(`DiffDirFileItem relative file path cannot be 0-length.`));
        }

        const leftFile = new File(leftRootDir, relativeFilePath);
        const rightFile = new File(rightRootDir, relativeFilePath);

        return new DiffDirFileItem(
            leftRootDir,
            rightRootDir,
            relativeFilePath,
            leftFile,
            rightFile,
            actionPriority
        );
    }


    // #region Data Members
    private _leftRootDir:           Directory;
    private _rightRootDir:          Directory;
    private _relativeFilePath:      string;
    private _leftFile:              File;
    private _rightFile:             File;
    private _actionPriority:        undefined | ActionPriority;
    // #endregion


    private constructor(
        leftRootDir:           Directory,
        rightRootDir:          Directory,
        relativeFilePath:      string,
        leftFile:              File,
        rightFile:             File,
        actionPriority:       ActionPriority

    )
    {
        this._leftRootDir           = leftRootDir;
        this._rightRootDir          = rightRootDir;
        this._relativeFilePath      = relativeFilePath;
        this._leftFile              = leftFile;
        this._rightFile             = rightFile;
        this._actionPriority        = actionPriority;
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


    public get leftFile(): undefined | File
    {
        return this._leftFile;
    }


    public get rightFile(): undefined | File
    {
        return this._rightFile;
    }


    public get actionPriority(): undefined | ActionPriority
    {
        return this._actionPriority;
    }


    public async actions(): Promise<Array<DiffDirFileItemAction>>
    {
        const [leftExists, rightExists] = await BBPromise.all([
            this._leftFile.exists(),
            this._rightFile.exists()
        ]);

        const isLeftOnly  = !!(leftExists && !rightExists);
        const isRightOnly = !!(!leftExists && rightExists);

        const actions: Array<DiffDirFileItemAction> = [];

        if (isLeftOnly) {
            if (this._actionPriority === ActionPriority.L_TO_R) {
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
            }
            else if (this._actionPriority === ActionPriority.R_TO_L) {
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
            }
        }
        else if (isRightOnly)
        {
            if (this._actionPriority === ActionPriority.L_TO_R) {
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
            }
            else if (this._actionPriority === ActionPriority.R_TO_L) {
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
            }
        }
        else { // The file appears in both locations

            const [leftHash, rightHash] = await BBPromise.all([this._leftFile.getHash(), this._rightFile.getHash()]);
            const filesAreIdentical = leftHash === rightHash;

            if (filesAreIdentical) {
                // When the files are identical, there should be no actions.
            }
            else if (this._actionPriority === ActionPriority.L_TO_R) {
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
            else if (this._actionPriority === ActionPriority.R_TO_L) {
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
        }

        return actions;
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

        if (!leftExists || !rightExists) {
            // One or both of the files do not exist.
            return false;
        }

        // Both files exist.  Return a value indicating whether they are
        // identical.
        const [leftHash, rightHash] = await BBPromise.all([this._leftFile.getHash(), this._rightFile.getHash()]);
        return leftHash === rightHash;
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
    actionPriority: ActionPriority,
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
        const promises = _.map(leftFiles, (curLeftFile) => {
            const relativePath = path.relative(leftDir.toString(), curLeftFile.toString());
            return DiffDirFileItem.create(leftDir, rightDir, relativePath, actionPriority);
        });
        return BBPromise.all(promises);
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
        const promises = _.map(rightFiles, (curRightFile) => {
            const relativePath = path.relative(rightDir.toString(), curRightFile.toString());
            return DiffDirFileItem.create(leftDir, rightDir, relativePath, actionPriority);
        });
        return BBPromise.all(promises);
    });

    // Combine the left and right files.
    let diffDirFileItems = _.concat(await leftPromise, await rightPromise);

    // If a file exists in both left and right, we don't want it to be
    // represented twice.  So make the list unique based on the files relative
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
