import { Directory } from "./directory";
import { File } from "./file";
export declare enum ActionPriority {
    L_TO_R = "sync left to right",
    R_TO_L = "sync right to left"
}
export declare enum DiffDirFileItemActionType {
    COPY_LEFT = "copy left",
    COPY_RIGHT = "copy right",
    DELETE_LEFT = "delete left",
    DELETE_RIGHT = "delete right",
    DELETE_BOTH = "delete both",
    SKIP = "skip"
}
export declare class DiffDirFileItemAction {
    private _fileItem;
    private _actionType;
    constructor(fileItem: DiffDirFileItem, actionType: DiffDirFileItemActionType);
    readonly type: DiffDirFileItemActionType;
    /**
     * Performs this action.
     * @return A promise that is resolved when the action has completed
     *     successfully or rejects if it failed.
     */
    execute(): Promise<void>;
}
export declare class DiffDirFileItem {
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
    static create(leftRootDir: Directory, rightRootDir: Directory, relativeFilePath: string, leftFile: undefined | File, rightFile: undefined | File, actionPriority?: ActionPriority): Promise<DiffDirFileItem>;
    private _leftRootDir;
    private _rightRootDir;
    private _relativeFilePath;
    private _leftFile;
    private _rightFile;
    private _actionPriority;
    private _actions;
    private _bothExistAndIdentical;
    private constructor();
    readonly leftRootDir: Directory;
    readonly rightRootDir: Directory;
    readonly relativeFilePath: string;
    readonly leftFile: undefined | File;
    readonly rightFile: undefined | File;
    readonly actionPriority: undefined | ActionPriority;
    readonly actions: Array<DiffDirFileItemAction>;
    readonly isLeftOnly: boolean;
    readonly isRightOnly: boolean;
    readonly isInBoth: boolean;
    readonly bothExistAndIdentical: boolean;
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
export declare function diffDirectories(leftDir: Directory, rightDir: Directory, actionPriority?: ActionPriority, includeIdentical?: boolean): Promise<Array<DiffDirFileItem>>;
