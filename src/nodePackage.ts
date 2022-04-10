import * as fs from "fs";
import * as cp from "child_process";
import * as compressing from "compressing";
import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";
import {gitUrlToProjectName} from "./gitHelpers";
import {getOs, OperatingSystem} from "./os";


export interface IPackageJson {
    name: string;
    version: string;
    description: string;
    main: string;
    repository: {type: string, url: string};
    devDependencies: {[packageName: string]: string};
    dependencies: {[packageName: string]: string};
}

export interface ILockedDependency {
    name?: string;
    version: string;
    lockfileVersion?: number;
    packageIntegrity?: string;
    preserveSymlinks?: boolean;
    dependencies: {[dependencyName: string]: ILockedDependency};
    integrity?: string;
    resolved?: string;
    bundled?: boolean;
    dev?: boolean;
    optional?: boolean;
    requires?: boolean | {[packageName: string]: string};
}


export class NodePackage {

    /**
     * Creates a NodePackage representing the package in the specified directory.
     * @param pkgDir - The directory containing the Node.js package
     * @return A promise for the resulting NodePackage.  This promise will be
     * rejected if the specified directory does not exist or does not contain a
     * package.json file.
     */
    public static fromDirectory(pkgDir: Directory): Promise<NodePackage> {
        // Make sure the directory exists.
        return pkgDir.exists()
        .then((stats: fs.Stats | undefined) => {
            if (!stats) {
                throw new Error(`Directory ${pkgDir.toString()} does not exist.`);
            }

            // Make sure the package has a package.json file in it.
            const packageJson = new File(pkgDir, "package.json");
            return packageJson.exists();
        })
        .then((stats) => {
            if (!stats) {
                throw new Error(`Directory ${pkgDir.toString()} does not contain a package.json file.`);
            }

            return new NodePackage(pkgDir);
        });

    }


    // region Data members
    private readonly _pkgDir: Directory;
    private _config: undefined | IPackageJson;
    // endregion


    /**
     * Constructs a new NodePackage.  This constructor is private and should not
     * be called by clients.  Instead, use one of the static methods to create
     * instances.
     *
     * @classdesc A class that represents a Node.js package.
     *
     * @param pkgDir - The directory containing the Node.js package
     */
    private constructor(pkgDir: Directory) {
        this._pkgDir = pkgDir.absolute();
    }


    // TODO: Write unit tests for the following method.
    public get projectName(): string {
        return gitUrlToProjectName(this.config.repository.url);
    }


    public get config(): IPackageJson {
        // If the package.json file has not been read yet, read it now.
        if (this._config === undefined) {
            this._config = new File(this._pkgDir, "package.json").readJsonSync<IPackageJson>();
        }

        return this._config!;
    }


    public get lockedDependencies(): undefined | ILockedDependency {
        const packageLockJson = new File(this._pkgDir, "package-lock.json");
        if (packageLockJson.existsSync()) {
            return packageLockJson.readJsonSync<ILockedDependency>();
        }
        else {
            return undefined;
        }
    }


    /**
     * Packs this Node package into a .tgz file using "npm pack"
     *
     * @param outDir - The output directory where to place the output file.  If
     * not specified, the output will be placed in the package's folder.
     * @return A File object representing the output .tgz file
     */
    public pack(outDir?: Directory): Promise<File> {
        const spawnOptions: cp.SpawnOptions = { cwd: this._pkgDir.toString() };
        if (getOs() === OperatingSystem.Windows) {
            // On Windows child_process.spawn() can only run executables, not
            // scripts.  Since npm is a script on windows, we need to set the
            // shell option so that we are not directly running the script, but
            // rather a shell, which is then running the script.  For more
            // information, see:
            // https://github.com/nodejs/node-v0.x-archive/issues/2318
            spawnOptions.shell = true;
        }

        return spawn("npm", ["pack"], spawnOptions)
        .closePromise
        .then((stdout: string) => {
            return new File(this._pkgDir, stdout);
        })
        .then((tgzFile: File) => {
            if (outDir) {
                return tgzFile.move(outDir);
            }
            else {
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
    public publish(publishDir: Directory, emptyPublishDir: boolean, tmpDir: Directory): Promise<Directory> {
        let packageBaseName: string;
        let unpackedDir: Directory;
        let unpackedPackageDir: Directory;

        // Since we will be executing commands from different directories, make
        // the directories absolute so things don't get confusing.
        publishDir = publishDir.absolute();
        tmpDir = tmpDir.absolute();

        if (publishDir.equals(tmpDir)) {
            return Promise.reject("When publishing, publishDir cannot be the same as tmpDir");
        }

        return this.pack(tmpDir)
        .then((tgzFile: File) => {
            packageBaseName = tgzFile.baseName;

            unpackedDir = new Directory(tmpDir, packageBaseName);
            // Emptying the directory will create it if it does not exist.
            return unpackedDir.empty()
            .then(() => {
                // Use the "compressing" package to extract the .tgz file.
                return compressing.tgz.uncompress(tgzFile.absPath(), unpackedDir.absPath());
            });
        })
        .then(() => {
            // When uncompressed, all content is contained within a "package"
            // directory.
            unpackedPackageDir = new Directory(unpackedDir, "package");
            return unpackedPackageDir.exists();
        })
        .then((stats) => {
            if (!stats) {
                throw new Error("Uncompressed package does not have a 'package' directory as expected.");
            }

            if (emptyPublishDir) {
                // The caller wants us to empty the publish directory before
                // publishing to it.  Do it now.
                return publishDir.empty()
                .then(() => {
                    return undefined; // To make resolve type undefined in all cases
                });
            }

            return undefined;
        })
        .then(() => {
            return unpackedPackageDir.copy(publishDir, false);
        })
        .then(() => {
            return publishDir;
        });
    }


}
