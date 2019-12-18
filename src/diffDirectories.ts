import * as path from "path";
import * as _ from "lodash";
import * as BBPromise from "bluebird";
import { Directory } from "./directory";
import {File} from "./file";


export enum ActionPriority {
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


export class DiffDirFileItem
{
    /**
     * Creates a new instance.
     * @param leftRootDir - The left directory being compared
     * @param rightRootDir - The right directory being compared
     * @param relativeFilePath - The relative file path (to the directory being
     *     compared)
     * @param leftFile - The left-side file being compared (if any)
     * @param rightFile - The right-side file being compared (if any)
     * @param actionPriority - The overall action being performed so that the
     *     actions associated with this file item can be prioritized
     * @return A newly created DiffDirFileItem instance
     */
    public static async create(
        leftRootDir:      Directory,
        rightRootDir:     Directory,
        relativeFilePath: string,
        leftFile:         undefined | File,
        rightFile:        undefined | File,
        actionPriority?:  ActionPriority
        ): Promise<DiffDirFileItem>
    {
        // TODO: Need to find references to this static function and update them
        // because this method is now async.

        // The relative file path must be legit.
        if (relativeFilePath.length === 0) {
            return BBPromise.reject(new Error(`DiffDirFileItem relative file path cannot be 0-length.`));
        }

        // Either leftFile or rightFile or both should be defined.  If both are
        // undefined, there is a problem.
        if ((leftFile === undefined) && (rightFile === undefined)) {
            return BBPromise.reject(new Error(`DiffDirFileItem cannot have undefined left and right files.`));
        }

        let bothFilesExistAndIdentical = false;
        if ((leftFile !== undefined) && (rightFile !== undefined)) {
            const [leftHash, rightHash] = await BBPromise.all([leftFile.getHash(), rightFile.getHash()]);
            bothFilesExistAndIdentical = (leftHash === rightHash);
        }

        return new DiffDirFileItem(
            leftRootDir,
            rightRootDir,
            relativeFilePath,
            leftFile,
            rightFile,
            bothFilesExistAndIdentical,
            actionPriority
        );
    }


    // #region Data Members
    private _leftRootDir:           Directory;
    private _rightRootDir:          Directory;
    private _relativeFilePath:      string;
    private _leftFile:              undefined | File;
    private _rightFile:             undefined | File;
    private _actionPriority:        undefined | ActionPriority;
    private _actions:               Array<DiffDirFileItemAction>;
    private _bothExistAndIdentical: boolean;
    // #endregion


    private constructor(
        leftRootDir:           Directory,
        rightRootDir:          Directory,
        relativeFilePath:      string,
        leftFile:              undefined | File,
        rightFile:             undefined | File,
        bothExistAndIdentical: boolean,
        actionPriority?:       ActionPriority

    )
    {
        this._leftRootDir           = leftRootDir;
        this._rightRootDir          = rightRootDir;
        this._relativeFilePath      = relativeFilePath;
        this._leftFile              = leftFile;
        this._rightFile             = rightFile;
        this._bothExistAndIdentical = bothExistAndIdentical;
        this._actionPriority        = actionPriority;
        this._actions               = [];

        if (this.isLeftOnly) {
            if (actionPriority === ActionPriority.L_TO_R) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
            }
            else if (actionPriority === ActionPriority.R_TO_L) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
            }
        }
        else if (this.isRightOnly)
        {
            if (actionPriority === ActionPriority.L_TO_R) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
            }
            else if (actionPriority === ActionPriority.R_TO_L) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
            }
        }
        else { // this.isInBoth() => true

            if (bothExistAndIdentical) {
                // When the files are identical, there should be no actions.
            }
            else if (actionPriority === ActionPriority.L_TO_R) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
            else if (actionPriority === ActionPriority.R_TO_L) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
        }

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


    public get actions(): Array<DiffDirFileItemAction>
    {
        return this._actions;
    }


    public get isLeftOnly(): boolean
    {
        return (this._leftFile !== undefined) && (this._rightFile === undefined);
    }


    public get isRightOnly(): boolean
    {
        return (this._leftFile === undefined) && (this._rightFile !== undefined);
    }


    public get isInBoth(): boolean
    {
        return (this._leftFile !== undefined) && (this._rightFile !== undefined);
    }


    public get bothExistAndIdentical(): boolean
    {
        return this._bothExistAndIdentical;
    }

}



/**
 * Compares (recursively) the files within two directories.
 * @param leftDir - The left directory to be compared
 * @param rightDir - The right directory to be compared
 * @param actionPriority - The action being performed so that the actions
 *     associated with each result can be prioritized.
 * @param includeIdentical - Whether to include files that are identical in both
 *     `leftDir` and `rightDir` in the returned resuls.  If true, identical
 *     files will be included with a 0-length array of actions.
 * @return An array of items representing the differences found between
 *     `leftDir` and `rightDir`.
 */
export function diffDirectories(
    leftDir: Directory,
    rightDir: Directory,
    actionPriority?: ActionPriority,
    includeIdentical: boolean = false
): Promise<Array<DiffDirFileItem>>
{
    let leftFiles: Array<File>;
    let rightFiles: Array<File>;

    // Get the left-side files, accounting for nonexistence.
    const leftContentsPromise = leftDir.contents(true)
    .then(
        (leftContents) => { leftFiles = leftContents.files; },
        () => { leftFiles = []; }
    );

    // Get the right-side files, accounting for nonexistence.
    const rightContentsPromise = rightDir.contents(true)
    .then(
        (rightContents) => { rightFiles = rightContents.files; },
        () => { rightFiles = []; }
    );

    return BBPromise.all([leftContentsPromise, rightContentsPromise])
    .then(() => {
        const diffMap = new Map<string, { leftFile?: File, rightFile?: File; }>();

        // Put the left files into the diff map.
        _.forEach(leftFiles, (curFile) => {
            const relativePath = File.relativeParts(leftDir, curFile).join(path.sep);
            diffMap.set(relativePath, { leftFile: curFile });
        });

        // Put the right files into the diff map.
        _.forEach(rightFiles, (curFile) => {
            const relativePath = File.relativeParts(rightDir, curFile).join(path.sep);

            if (diffMap.has(relativePath)) {
                diffMap.get(relativePath)!.rightFile = curFile;
            }
            else {
                diffMap.set(relativePath, { rightFile: curFile });
            }
        });

        // Iterate over the diff map, creating a diffDirFileItem for each entry.
        const diffDirFileItemPromises: Array<Promise<DiffDirFileItem>> = [];
        for (const [relativePath, files] of diffMap) {
            diffDirFileItemPromises.push(DiffDirFileItem.create(
                leftDir,
                rightDir,
                relativePath,
                files.leftFile,
                files.rightFile,
                actionPriority
            ));
        }

        return BBPromise.all(diffDirFileItemPromises);
    })
    .then((diffDirFileItems: Array<DiffDirFileItem>) => {

        // If not including identical files, remove them.
        if (!includeIdentical) {
            _.remove(diffDirFileItems, (curDiffDirFileItem: DiffDirFileItem) => {
                return curDiffDirFileItem.bothExistAndIdentical;
            });
        }

        // Sort the items so that left-only items are next to right-only items
        // in the final result.
        diffDirFileItems = _.sortBy(diffDirFileItems, (curDiffDirFileItem) => curDiffDirFileItem.relativeFilePath);
        return diffDirFileItems;
    });
}
