import * as fs from "fs";
import * as BBPromise from "bluebird";
import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";
import {gitUrlToProjectName} from "./gitHelpers";


export interface IPackageJson
{
    name: string;
    version: string;
    description: string;
    repository: {type: string, url: string};
}


export class NodePackage
{

    /**
     * Creates a NodePackage representing the package in the specified directory.
     * @param pkgDir - The directory containing the Node.js package
     * @return A promise for the resulting NodePackage.  This promise will be
     * rejected if the specified directory does not exist or does not contain a
     * package.json file.
     */
    public static fromDirectory(pkgDir: Directory): Promise<NodePackage>
    {
        // Make sure the directory exists.
        return pkgDir.exists()
        .then((stats: fs.Stats | undefined) => {
            if (!stats)
            {
                throw new Error(`Directory ${pkgDir.toString()} does not exist.`);
            }

            // Make sure the package has a package.json file in it.
            const packageJson = new File(pkgDir, "package.json");
            return packageJson.exists();
        })
        .then((stats) => {
            if (!stats)
            {
                throw new Error(`Directory ${pkgDir.toString()} does not contain a package.json file.`);
            }

            return new NodePackage(pkgDir);
        });

    }


    // region Data members
    private _pkgDir: Directory;
    private _config: IPackageJson | undefined;
    // endregion


    /**
     * Constructs a new NodePackage.  This constructor is private and should not
     * be called by clients.  Instead, use one of the static methods to create
     * instances.
     *
     * @class
     * @classdesc A class that represents a Node.js package.
     *
     * @param pkgDir - The directory containing the Node.js package
     */
    private constructor(pkgDir: Directory)
    {
        this._pkgDir = pkgDir.absolute();
    }


    // TODO: Write unit tests for the following method.
    public get projectName(): string
    {
        return gitUrlToProjectName(this.config.repository.url);
    }


    public get config(): IPackageJson
    {
        // If the package.json file has not been read yet, read it now.
        if (this._config === undefined)
        {
            this._config = new File(this._pkgDir, "package.json").readJsonSync<IPackageJson>();
        }

        return this._config!;
    }


    /**
     * Packs this Node package into a .tgz file using "npm pack"
     * @method
     * @param outDir - The output directory where to place the output file.  If
     * not specified, the output will be placed in the package's folder.
     * @return A File object representing the output .tgz file
     */
    public pack(outDir?: Directory): Promise<File>
    {
        return spawn("npm", ["pack"], this._pkgDir.toString())
        .closePromise
        .then((stdout: string) => {
            return new File(this._pkgDir, stdout);
        })
        .then((tgzFile: File) => {
            if (outDir)
            {
                return tgzFile.move(outDir);
            }
            else
            {
                return tgzFile;
            }
        });
    }


    /**
     * Publishes this Node.js package to the specified directory.
     * @param publishDir - The directory that will contain the published version
     * of this package
     * @param emptyPublishDir - A flag indicating whether publishDir should be
     * emptied before publishing to it.  If publishing to a regular directory,
     * you probably want to pass true so that any old files are removed.  If
     * publishing to a Git repo directory, you probably want false because you
     * have already removed the files under version control and want the .git
     * directory to remain.
     * @param tmpDir - A temporary directory that can be used when packing and
     * unpacking the package.
     * @return A promise for publishDir
     */
    public publish(publishDir: Directory, emptyPublishDir: boolean, tmpDir: Directory): Promise<Directory>
    {
        let packageBaseName: string;
        let extractedTarFile: File;
        let unpackedDir: Directory;
        let unpackedPackageDir: Directory;

        // Since we will be executing commands from different directories, make
        // the directories absolute so things don't get confusing.
        publishDir = publishDir.absolute();
        tmpDir = tmpDir.absolute();

        if (publishDir.equals(tmpDir)) {
            return BBPromise.reject("When publishing, publishDir cannot be the same as tmpDir");
        }

        return this.pack(tmpDir)
        .then((tgzFile: File) => {
            packageBaseName = tgzFile.baseName;

            // Running the following gunzip command will extract the .tgz file
            // to a .tar file with the same basename.  The original .tgz file is
            // deleted.
            return spawn("gunzip", ["--force", tgzFile.fileName], tmpDir.toString())
            .closePromise;
        })
        .then(() => {
            // The above gunzip command should have extracted a .tar file.  Make
            // sure this assumption is true.
            extractedTarFile = new File(tmpDir, packageBaseName + ".tar");
            return extractedTarFile.exists()
            .then((exists) => {
                if (!exists) {
                    throw new Error(`Extracted .tar file ${extractedTarFile.toString()} does not exist.  Aborting.`);
                }
            });
        })
        .then(() => {
            // We are about to unpack the tar file.  Create an empty
            // directory where its contents will be placed.
            unpackedDir = new Directory(tmpDir, packageBaseName);
            return unpackedDir.empty();  // Creates (if needed) and empties this directory.
        })
        .then(() => {
            return spawn("tar", ["-x", "-C", unpackedDir.toString(), "-f", extractedTarFile.toString()], tmpDir.toString())
            .closePromise;
        })
        .then(() => {
            // When uncompressed, all content is contained within a "package"
            // directory.
            unpackedPackageDir = new Directory(unpackedDir, "package");
            return unpackedPackageDir.exists();
        })
        .then((stats) => {
            if (!stats)
            {
                throw new Error("Uncompressed package does not have a 'package' directory as expected.");
            }

            if (emptyPublishDir)
            {
                // The caller wants us to empty the publish directory before
                // publishing to it.  Do it now.
                return publishDir.empty();
            }
        })
        .then(() => {
            return unpackedPackageDir.copy(publishDir, false);
        })
        .then(() => {
            return publishDir;
        });
    }


}
