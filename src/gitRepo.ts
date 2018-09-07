import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";
import {GitBranch} from "./gitBranch";
import * as _ from "lodash";
import {outdent, trimBlankLines} from "./stringHelpers";
import {Url} from "./url";
import {gitUrlToProjectName} from "./gitHelpers";
import {IPackageJson} from "./nodePackage";
import {CommitHash} from "./commitHash";


interface IGitLogEntry
{
    // TODO: Change the following to an instance of CommitHash.
    commitHash: string;
    author: string;
    timestamp: Date;
    message: string;
}


//
// A regex for parsing "git log" output.
// match[1]: commit hash
// match[2]: author
// match[3]: commit timestamp
// match[4]: commit message (a sequence of lines that are either blank or start with whitespace)
//
const GIT_LOG_ENTRY_REGEX = /commit\s*([0-9a-f]+).*?$\s^Author:\s*(.*?)$\s^Date:\s*(.*?)$\s((?:(?:^\s*$\n?)|(?:^\s+(?:.*)$\s?))+)/gm;

/**
 * Determines whether dir is a directory containing a Git repository.
 * @param dir - The directory to inspect
 * @return A promise for a boolean indicating whether dir contains a Git
 * repository.  This promise will never reject.
 */
export async function isGitRepoDir(dir: Directory): Promise<boolean> {

    const [dirExists, dotGitExists] = await Promise.all([
        dir.exists(),                        // The directory exists
        new Directory(dir, ".git").exists()  // The directory contains a .git directory
    ]);

    return Boolean(dirExists && dotGitExists);
}


export class GitRepo
{

    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    public static async fromDirectory(dir: Directory): Promise<GitRepo>
    {
        const isGitRepo = await isGitRepoDir(dir);
        if (isGitRepo)
        {
            return new GitRepo(dir);
        }
        else
        {
            throw new Error("Path does not exist or is not a Git repo.");
        }
    }


    /**
     * Clones a Git repo at the specified location.
     * @param src - The source to clone the repo from
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @return A promise for the cloned Git repo.
     */
    public static clone(src: Url | Directory, parentDir: Directory): Promise<GitRepo>
    {
        let projName: string;
        let srcStr: string;

        if (src instanceof Url)
        {
            projName = gitUrlToProjectName(src.toString());
            const protocols = src.getProtocols();
            srcStr = protocols.length < 2 ?
                src.toString() :
                src.replaceProtocol("https").toString();
        }
        else
        {
            projName = src.dirName;
            srcStr = src.toString();
        }

        const repoDir = new Directory(parentDir, projName);

        return parentDir.exists()
        .then((parentDirExists) => {
            if (!parentDirExists)
            {
                throw new Error(`${parentDir} is not a directory.`);
            }
        })
        .then(() => {
            return spawn(
                "git",
                ["clone", srcStr, projName],
                parentDir.toString())
            .closePromise;
        })
        .then(() => {
            return new GitRepo(repoDir);
        });
    }


    // region Private Data Members
    private _dir: Directory;
    private _branches: Array<GitBranch> | undefined;
    private _log: Array<IGitLogEntry> | undefined;
    // endregion


    /**
     * Constructs a new GitRepo.  Private in order to provide error checking.
     * See static methods.
     *
     * @param dir - The directory containing the Git repo.
     */
    private constructor(dir: Directory)
    {
        this._dir = dir;
    }


    /**
     * Gets the directory containing this Git repo.
     * @return The directory containing this git repo.
     */
    public get directory(): Directory
    {
        return this._dir;
    }


    /**
     * Determines whether this GitRepo is equal to another GitRepo.  Two
     * instances are considered equal if they point to the same directory.
     * @method
     * @param other - The other GitRepo to compare with
     * @return Whether the two GitRepo instances are equal
     */
    public equals(other: GitRepo): boolean
    {
        return this._dir.equals(other._dir);
    }


    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.
     */
    public files(): Promise<Array<File>>
    {
        return spawn("git", ["ls-files"], this._dir.toString())
        .closePromise
        .then((stdout) => {
            const relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, (curRelFilePath) => {
                return new File(this._dir, curRelFilePath);
            });
        });
    }


    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    public modifiedFiles(): Promise<Array<File>>
    {
        return spawn("git", ["ls-files", "-m"], this._dir.toString())
        .closePromise
        .then((stdout) => {
            if (stdout === "")
            {
                return [];
            }
            const relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, (curRelativeFilePath) => {
                return new File(this._dir, curRelativeFilePath);
            });
        });
    }


    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    public untrackedFiles(): Promise<Array<File>>
    {
        return spawn("git", ["ls-files",  "--others",  "--exclude-standard"], this._dir.toString())
        .closePromise
        .then((stdout) => {
            if (stdout === "")
            {
                return [];
            }
            const relativeFilePaths = stdout.split("\n");
            return _.map(relativeFilePaths, (curRelativePath) => {
                return new File(this._dir, curRelativePath);
            });
        });
    }


    // TODO: Write unit tests for this method.  Make sure there is no leading or trailing whitespace.
    public async currentCommitHash(): Promise<CommitHash>
    {
        const stdout = await spawn("git", ["rev-parse", "--verify", "HEAD"], this._dir.toString()).closePromise;
        const hash = CommitHash.fromString(stdout);
        if (!hash)
        {
            throw new Error("Failed to construct CommitHash.");
        }
        return hash;
    }


    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    public remotes(): Promise<{[name: string]: string}>
    {
        return spawn("git", ["remote", "-vv"], this._dir.toString())
        .closePromise
        .then((stdout) => {

            const lines = stdout.split("\n");
            const remotes: {[name: string]: string} = {};
            lines.forEach((curLine) => {
                const match = curLine.match(/^(\w+)\s+(.*)\s+\(\w+\)$/);
                if (match)
                {
                    remotes[match[1]] = match[2];
                }
            });

            return remotes;
        });
    }


    /**
     * Gets the name of this Git repository.  If the repo has a remote, the name
     * is taken from the last part of the remote's URL.  Otherwise, the name
     * will be taken from the "name" property in package.json.  Otherwise, the
     * name will be the name of the folder the repo is in.
     * @return A Promise for the name of this repository.
     */
    public name(): Promise<string>
    {
        return this.remotes()
        .then((remotes) => {
            const remoteNames = Object.keys(remotes);
            if (remoteNames.length > 0)
            {
                const remoteUrl = remotes[remoteNames[0]];
                return gitUrlToProjectName(remoteUrl);
            }
        })
        .then((projName) => {
            if (projName) {
                return projName;
            }

            // Look for the project name in package.json.
            const packageJson = new File(this._dir, "package.json").readJsonSync<IPackageJson>();
            if (packageJson) {
                return packageJson.name;
            }
        })
        .then((projName) => {
            if (projName) {
                return projName;
            }

            const dirName = this._dir.dirName;
            if (dirName === "/")
            {
                throw new Error("Unable to determine Git repo name.");
            }

            return dirName;
        });
    }


    public tags(): Promise<Array<string>>
    {
        return spawn("git", ["tag"], this._dir.toString())
        .closePromise
        .then((stdout) => {
            if (stdout.length === 0)
            {
                return [];
            }

            return stdout.split("\n");
        });
    }


    public hasTag(tagName: string): Promise<boolean>
    {
        return this.tags()
        .then((tags) => {
            return tags.indexOf(tagName) >= 0;
        });
    }


    public createTag(tagName: string, message: string = "", force: boolean = false): Promise<GitRepo>
    {
        let args = ["tag"];

        if (force) {
            args.push("-f");
        }

        args = _.concat(args, "-a", tagName);
        args = _.concat(args, "-m", message);

        return spawn("git", args, this._dir.toString())
        .closePromise
        .then(() => {
            return this;
        });
    }


    public deleteTag(tagName: string): Promise<GitRepo>
    {
        return spawn("git", ["tag", "--delete", tagName], this._dir.toString())
        .closePromise
        .catch((err) => {
            if (err.stderr.includes("not found"))
            {
                // The specified tag name was not found.  We are still
                // successful.
            }
            else
            {
                throw err;
            }
        })
        .then(() => {
            return this;
        });
    }


    public pushTag(tagName: string, remoteName: string, force: boolean = false): Promise<GitRepo>
    {
        let args = ["push"];

        if (force) {
            args.push("--force");
        }

        args = _.concat(args, remoteName, tagName);

        return spawn("git", args, this._dir.toString())
        .closePromise
        .then(() => {
            return this;
        });
    }


    public getBranches(forceUpdate: boolean = false): Promise<Array<GitBranch>>
    {
        if (forceUpdate)
        {
            // Invalidate the cache.  If this update fails, subsequent requests
            // will have to update the cache.
            this._branches = undefined;
        }

        let updatePromise: Promise<void>;

        if (this._branches === undefined)
        {
            // The internal cache of branches needs to be updated.
            updatePromise = GitBranch.enumerateGitRepoBranches(this)
            .then((branches: Array<GitBranch>) => {
                this._branches = branches;
            });
        }
        else
        {
            // The internal cache does not need to be updated.
            updatePromise = Promise.resolve();
        }

        return updatePromise
        .then(() => {
            // Since updatePromise resolved, we know that this._branches has been
            // set.
            return this._branches!;
        });
    }


    public async getCurrentBranch(): Promise<GitBranch | undefined>
    {
        // When on master:
        // git symbolic-ref HEAD
        // refs/heads/master

        // When in detached head state:
        // git symbolic-ref HEAD
        // fatal: ref HEAD is not a symbolic ref

        // The below command when in detached HEAD state
        // $ git rev-parse --abbrev-ref HEAD
        // HEAD

        const branchName = await spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], this._dir.toString()).closePromise;
        if (branchName === "HEAD")
        {
            // The repo is in detached head state.
            return undefined;
        }

        const branch = await GitBranch.create(this, branchName);

        // All is good.
        return branch;
    }


    public async checkoutBranch(branch: GitBranch, createIfNonexistent: boolean): Promise<void>
    {
        if (createIfNonexistent)
        {
            // If there is a branch with the same name, we should not try to
            // create it.  Instead, we should just check it out.
            const allBranches = await this.getBranches();
            if (_.some(allBranches, {name: branch.name}))
            {
                createIfNonexistent = false;
            }
        }

        const args = [
            "checkout",
            ...(createIfNonexistent ? ["-b"] : []),
            branch.name
        ];

        await spawn("git", args, this._dir.toString()).closePromise;
    }


    public async checkoutCommit(commit: CommitHash): Promise<void>
    {
        await spawn("git", ["checkout", commit.toString()], this._dir.toString()).closePromise;
    }


    public stageAll(): Promise<GitRepo>
    {
        return spawn("git", ["add", "."], this._dir.toString())
        .closePromise
        .then(() => {
            return this;
        });
    }


    public async pushCurrentBranch(remoteName: string = "origin", setUpstream: boolean = false): Promise<void>
    {
        const curBranch = await this.getCurrentBranch();
        if (!curBranch)
        {
            throw new Error("There is no current branch to push.");
        }

        const args = [
            "push",
            ...(setUpstream ? ["-u"] : []),
            remoteName,
            curBranch.name
        ];

        return spawn("git", args, this._dir.toString())
        .closePromise
        .then(() => {
        })
        .catch((err) => {
            console.log(`Error pushing current branch: ${JSON.stringify(err)}`);
            throw err;
        });
    }


    // TODO: Write unit tests for the following method.
    public async getCommitDeltas(trackingRemote: string = "origin"): Promise<{ahead: number, behind: number}>
    {
        const branch = await this.getCurrentBranch();
        if (!branch)
        {
            throw new Error("Cannot getNumCommitsAhead() when HEAD is not on a branch.");
        }

        // The names of the two branches in question.
        const thisBranchName = branch.name;
        const trackingBranchName = `${trackingRemote}/${thisBranchName}`;

        const numAheadPromise = spawn(
            "git",
            ["rev-list", thisBranchName, "--not", trackingBranchName, "--count"],
            this._dir.toString()
        )
        .closePromise;

        const numBehindPromise = spawn(
            "git",
            ["rev-list", trackingBranchName, "--not", thisBranchName, "--count"],
            this._dir.toString()
        )
        .closePromise;

        return Promise.all([numAheadPromise, numBehindPromise])
        .then((results) => {
            return {
                ahead: parseInt(results[0], 10),
                behind: parseInt(results[1], 10)
            };
        });
    }


    // TODO: To get the staged files:
    // git diff --name-only --cached


    // TODO: Add unit tests for this method.
    public commit(msg: string = ""): Promise<IGitLogEntry>
    {
        return spawn("git", ["commit", "-m", msg], this._dir.toString())
        .closePromise
        .then(() => {
            // Get the commit hash
            return spawn("git", ["rev-parse", "HEAD"], this._dir.toString()).closePromise;
        })
        .then((stdout) => {
            const commitHash = _.trim(stdout);
            return spawn("git", ["show", commitHash], this._dir.toString()).closePromise;
        })
        .then((stdout) => {
            const match = GIT_LOG_ENTRY_REGEX.exec(stdout);
            if (!match)
            {
                throw new Error(`Could not parse "git show" output:\n${stdout}`);
            }
            return {
                commitHash: match[1],
                author:     match[2],
                timestamp:  new Date(match[3]),
                message:    outdent(trimBlankLines(match[4]))
            };
        });
    }


    public getLog(forceUpdate?: boolean): Promise<Array<IGitLogEntry>>
    {
        if (forceUpdate)
        {
            this._log = undefined;
        }

        let updatePromise: Promise<void>;

        if (this._log === undefined)
        {
            updatePromise = this.getLogEntries()
            .then((log: Array<IGitLogEntry>) => {
                this._log = log;
            });
        }
        else
        {
            updatePromise = Promise.resolve();
        }

        return updatePromise
        .then(() => {
            return this._log!;
        });
    }


    /**
     * Helper method that retrieves Git log entries
     * @private
     * @method
     * @return A promise for an array of structures describing each commit.
     */
    private getLogEntries(): Promise<Array<IGitLogEntry>>
    {
        return spawn("git", ["log"], this._dir.toString())
        .closePromise
        .then((stdout) => {
            const entries: Array<IGitLogEntry> = [];
            let match: RegExpExecArray | null;
            while ((match = GIT_LOG_ENTRY_REGEX.exec(stdout)) !== null) // tslint:disable-line
            {
                entries.push(
                    {
                        commitHash: match[1],
                        author:     match[2],
                        timestamp:  new Date(match[3]),
                        message:    outdent(trimBlankLines(match[4]))
                    }
                );
            }

            // Git log lists the most recent entry first.  Reverse the array so
            // that the most recent entry is the last.
            _.reverse(entries);
            return entries;
        });
    }


}

// TODO: The following will list all tags pointing to the specified commit.
// git tag --points-at 34b8bff
