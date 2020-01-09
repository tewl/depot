import { Directory } from "./directory";
import { File } from "./file";
export interface IPackageJson {
    name: string;
    version: string;
    description: string;
    main: string;
    repository: {
        type: string;
        url: string;
    };
    devDependencies: {
        [packageName: string]: string;
    };
    dependencies: {
        [packageName: string]: string;
    };
}
export interface ILockedDependency {
    name?: string;
    version: string;
    lockfileVersion?: number;
    packageIntegrity?: string;
    preserveSymlinks?: boolean;
    dependencies: {
        [dependencyName: string]: ILockedDependency;
    };
    integrity?: string;
    resolved?: string;
    bundled?: boolean;
    dev?: boolean;
    optional?: boolean;
    requires?: boolean | {
        [packageName: string]: string;
    };
}
export declare class NodePackage {
    /**
     * Creates a NodePackage representing the package in the specified directory.
     * @param pkgDir - The directory containing the Node.js package
     * @return A promise for the resulting NodePackage.  This promise will be
     * rejected if the specified directory does not exist or does not contain a
     * package.json file.
     */
    static fromDirectory(pkgDir: Directory): Promise<NodePackage>;
    private _pkgDir;
    private _config;
    /**
     * Constructs a new NodePackage.  This constructor is private and should not
     * be called by clients.  Instead, use one of the static methods to create
     * instances.
     *
     * @classdesc A class that represents a Node.js package.
     *
     * @param pkgDir - The directory containing the Node.js package
     */
    private constructor();
    readonly projectName: string;
    readonly config: IPackageJson;
    readonly lockedDependencies: undefined | ILockedDependency;
    /**
     * Packs this Node package into a .tgz file using "npm pack"
     * @method
     * @param outDir - The output directory where to place the output file.  If
     * not specified, the output will be placed in the package's folder.
     * @return A File object representing the output .tgz file
     */
    pack(outDir?: Directory): Promise<File>;
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
    publish(publishDir: Directory, emptyPublishDir: boolean, tmpDir: Directory): Promise<Directory>;
}
