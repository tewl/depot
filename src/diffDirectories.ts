import * as path from "path";
import * as _ from "lodash";
import * as BBPromise from "bluebird";
import { Directory } from "./directory";
import {File} from "./file";


export class DiffDirFileItem
{
    public static create(
        relativeFilePath: string,
        leftFile:         undefined | File,
        rightFile:        undefined | File
    ): undefined | DiffDirFileItem
    {
        // TODO: Make sure the relative path is legal.

        // TODO: Make sure that either leftFile or rightFile is defined.

        return new DiffDirFileItem(relativeFilePath, leftFile, rightFile);
    }


    // #region Data Members
    private _relativeFilePath: string;
    private _leftFile:         undefined | File;
    private _rightFile:        undefined | File;
    // #endregion


    private constructor(
        relativeFilePath: string,
        leftFile:         undefined | File,
        rightFile:        undefined | File
    )
    {
        this._relativeFilePath = relativeFilePath;
        this._leftFile         = leftFile;
        this._rightFile        = rightFile;
    }


    public get relativeFilePath(): string
    {
        return this._relativeFilePath;
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

}


export function diffDirectories(
    leftDir: Directory,
    rightDir: Directory
): Promise<Array<DiffDirFileItem>>
{
    const leftPromise = leftDir.contents(true);
    const rightPromise = rightDir.contents(true);

    return BBPromise.all([leftPromise, rightPromise])
    .then(([leftContents, rightContents]) => {
        const leftFiles  = leftContents.files;
        const rightFiles = rightContents.files;
        const diffMap    = new Map<string, { leftFile?: File, rightFile?: File; }>();

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

        let result: Array<DiffDirFileItem> = [];
        for (const [relativePath, files] of diffMap) {

            const diffDirFileItem = DiffDirFileItem.create(relativePath, files.leftFile, files.rightFile);
            if (diffDirFileItem) {
                result.push(diffDirFileItem);
            }
            else {
                throw new Error("Illegal DiffDirFileItem.");
            }
        }

        // Sort the items so that left-only items are next to right-only items
        // in the final result.
        result = _.sortBy(result, (curDiffDirFileItem) => curDiffDirFileItem.relativeFilePath);

        return result;
    });







}