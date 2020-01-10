import {insertIf} from "./arrayHelpers";
import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";
import {GitBranch} from "./gitBranch";
import * as _ from "lodash";
import {outdent, trimBlankLines} from "./stringHelpers";
import {Url} from "./url";
import {gitUrlToProjectName, isGitUrl} from "./gitHelpers";
import {IPackageJson} from "./nodePackage";
import {CommitHash} from "./commitHash";
import {piNewline} from "./regexpHelpers";


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
export function isGitRepoDir(dir: Directory): Promise<boolean>
{
    return Promise.all([
        dir.exists(),                        // The directory exists
        new Directory(dir, ".git").exists()  // The directory contains a .git directory
    ])
    .then(([dirExists, dotGitExists]) => {
        return Boolean(dirExists && dotGitExists);
    });
}


/**
 * Represents a Git repository within the local filesystem.
 */
export class GitRepo
{

    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    public static fromDirectory(dir: Directory): Promise<GitRepo>
    {
        return isGitRepoDir(dir)
        .then((isGitRepo) => {
            if (isGitRepo) {
                return new GitRepo(dir);
            }
            else
            {
                throw new Error(`${dir.toString()} does not exist or is not a Git repo.`);
            }
        });
    }


    /**
     * Clones a Git repo at the specified location.
     * @param src - The source to clone the repo from
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @param dirName - The name of the directory to place the cloned repository
     * into.  If not specified, the project's name will be used.
     * @return A promise for the cloned Git repo.
     */
    public static clone(src: Url | Directory, parentDir: Directory, dirName?: string): Promise<GitRepo>
    {
        let repoDirName: string;
        let srcStr: string;

        if (src instanceof Url)
        {
            repoDirName = dirName || gitUrlToProjectName(src.toString());
            const protocols = src.getProtocols();
            srcStr = protocols.length < 2 ?
                src.toString() :
                src.replaceProtocol("https").toString();
        }
        else
        {
            repoDirName = dirName || src.dirName;
            // The path to the source repo must be made absolute, because when
            // we execute the "git clone" command, the cwd will be `parentDir`.
            srcStr = src.absPath();
        }

        const repoDir = new Directory(parentDir, repoDirName);

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
                ["clone", srcStr, repoDirName],
                {cwd: parentDir.toString()}
            )
            .closePromise;
        })
        .then(() => {
            return new GitRepo(repoDir);
        });
    }


    // region Private Data Members
    private readonly _dir: Directory;
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
        return spawn("git", ["ls-files"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            const relativeFilePaths = stdout.split(piNewline);
            return _.map(relativeFilePaths, (curRelFilePath) => {
                return new File(this._dir, curRelFilePath);
            });
        });
    }


    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    public modifiedFiles(): Promise<Array<File>>
    {
        return spawn("git", ["ls-files", "-m"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            if (stdout === "")
            {
                return [];
            }
            const relativeFilePaths = stdout.split(piNewline);
            return _.map(relativeFilePaths, (curRelativeFilePath) => {
                return new File(this._dir, curRelativeFilePath);
            });
        });
    }


    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    public untrackedFiles(): Promise<Array<File>>
    {
        return spawn("git", ["ls-files",  "--others",  "--exclude-standard"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            if (stdout === "")
            {
                return [];
            }
            const relativeFilePaths = stdout.split(piNewline);
            return _.map(relativeFilePaths, (curRelativePath) => {
                return new File(this._dir, curRelativePath);
            });
        });
    }


    // TODO: Write unit tests for this method.  Make sure there is no leading or trailing whitespace.
    public currentCommitHash(): Promise<CommitHash>
    {
        return spawn("git", ["rev-parse", "--verify", "HEAD"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            const hash = CommitHash.fromString(stdout);
            if (!hash)
            {
                throw new Error("Failed to construct CommitHash.");
            }
            return hash;
        });
    }


    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    public remotes(): Promise<{[name: string]: string}>
    {
        return spawn("git", ["remote", "-vv"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {

            const lines = stdout.split(piNewline);
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

                if (isGitUrl(remoteUrl)) {
                    return gitUrlToProjectName(remoteUrl);
                }
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


    /**
     * Gets all the tags present in this repo.
     * @return A Promise for an array of tag names.  An empty array is returned
     * when there are no tags.
     */
    public tags(): Promise<Array<string>>
    {
        return spawn("git", ["tag"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            if (stdout.length === 0)
            {
                return [];
            }

            return stdout.split(piNewline);
        });
    }


    /**
     * Determines whether `tagName` is a tag that exists in this repo.
     * @param tagName - The tag to search for
     * @return A Promise for a boolean indicating whether `tagName` exists.
     */
    public hasTag(tagName: string): Promise<boolean>
    {
        return this.tags()
        .then((tags) => {
            return tags.indexOf(tagName) >= 0;
        });
    }


    /**
     * Adds an annotated (heavy) tag or moves an existing one to this repo's
     * current commit.
     * @param tagName - The name of the tag to create/move
     * @param message - The message associated with the annotated tag
     * @param force - false when your intention is to create a new tag; true
     * when your intention is to move an existing tag.
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    public createTag(tagName: string, message: string = "", force: boolean = false): Promise<GitRepo>
    {
        let args = ["tag"];

        if (force) {
            args.push("-f");
        }

        args = _.concat(args, "-a", tagName);
        args = _.concat(args, "-m", message);

        return spawn("git", args, {cwd: this._dir.toString()})
        .closePromise
        .then(() => {
            return this;
        });
    }


    /**
     * Deletes the specified tag.
     * @param tagName - The name of the tag to delete
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    public deleteTag(tagName: string): Promise<GitRepo>
    {
        return spawn("git", ["tag", "--delete", tagName], {cwd: this._dir.toString()})
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


    /**
     * Pushes a tag to a remote
     * @param tagName - The name of the tag to push
     * @param remoteName - The remote to push the tag to
     * @param force - false if your intention is to not affect any existing
     * tags; true if your intention is to move an existing tag.
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    public pushTag(
        tagName: string,
        remoteName: string,
        force: boolean = false
    ): Promise<GitRepo>
    {
        let args = ["push"];

        if (force) {
            args.push("--force");
        }

        args = _.concat(args, remoteName, tagName);

        return spawn("git", args, {cwd: this._dir.toString()})
        .closePromise
        .then(() => {
            return this;
        });
    }


    /**
     * Gets a list of branches in this repo.
     * @param forceUpdate - false to use a cached list of branches (if
     * available); true to retrieve the latest list of branches.
     * @return A Promise for the branches found
     */
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


    /**
     * Gets the current working branch (if there is one)
     * @return A Promise for the current working branch or undefined (when
     * working in a detached head state).
     */
    public getCurrentBranch(): Promise<GitBranch | undefined>
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

        return spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], {cwd: this._dir.toString()}).closePromise
        .then((branchName) => {
            if (branchName === "HEAD") {
                // The repo is in detached head state.
                return Promise.resolve(undefined);
            }
            else {
                return GitBranch.create(this, branchName);
            }
        });
    }


    /**
     * Switches to the specified branch (possibly creating it)
     * @param branch - The branch to switch to
     * @param createIfNonexistent - true to create the branch if it does not
     * exist; false if your intention is to checkout an existing branch
     * @return A Promise that resolves when the branch is checked out.
     */
    public checkoutBranch(branch: GitBranch, createIfNonexistent: boolean): Promise<void>
    {
        return this.getBranches()
        .then((allBranches) => {
            // If there is a branch with the same name, we should not try to
            // create it.  Instead, we should just check it out.
            if (_.some(allBranches, {name: branch.name}))
            {
                createIfNonexistent = false;
            }
        })
        .then(() => {
            const args = [
                "checkout",
                ...(createIfNonexistent ? ["-b"] : []),
                branch.name
            ];

            return spawn("git", args, {cwd: this._dir.toString()}).closePromise;
        })
        .then(() => {});
    }


    /**
     * Checks out the specified commit
     * @param commit - The commit to checkout
     * @return A Promise that resolves when the commit is checked out.
     */
    public checkoutCommit(commit: CommitHash): Promise<void>
    {
        return spawn("git", ["checkout", commit.toString()], {cwd: this._dir.toString()}).closePromise
        .then(() => {});
    }


    /**
     * Stages all modified files that are not being ignored (via .gitignore)
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    public stageAll(): Promise<GitRepo>
    {
        return spawn("git", ["add", "."], {cwd: this._dir.toString()})
        .closePromise
        .then(() => {
            return this;
        });
    }


    /**
     * Pushes the current branch to a remote
     * @param remoteName - The remote to push to
     * @param setUpstream - true to set the remote's branch as the upstream
     * branch
     * @return A Promise that is resolved when the push has completed.  The
     * promise will reject when working in a detached head state.
     */
    public pushCurrentBranch(remoteName: string = "origin", setUpstream: boolean = false): Promise<void>
    {
        return this.getCurrentBranch()
        .then((curBranch) => {
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
            return spawn("git", args, {cwd: this._dir.toString()}).closePromise;
        })
        .then(() => {
        })
        .catch((err) => {
            console.log(`Error pushing current branch: ${JSON.stringify(err)}`);
            throw err;
        });
    }


    /**
     * Gets the number of commits ahead and behind the current branch is
     * @param trackingRemote - The remote containing the tracking branch
     * @return A Promise for an object containing the result
     */
    public getCommitDeltas(trackingRemote: string = "origin"): Promise<{ahead: number, behind: number}>
    {
        // TODO: Write unit tests for this method.

        return this.getCurrentBranch()
        .then((branch) => {
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
                {cwd: this._dir.toString()}
            ).closePromise;

            const numBehindPromise = spawn(
                "git",
                ["rev-list", trackingBranchName, "--not", thisBranchName, "--count"],
                {cwd: this._dir.toString()}
            ).closePromise;

            return Promise.all([numAheadPromise, numBehindPromise]);
        })
        .then((results) => {
            return {
                ahead: parseInt(results[0], 10),
                behind: parseInt(results[1], 10)
            };
        });
    }


    // TODO: To get the staged files:
    // git diff --name-only --cached


    /**
     * Commits staged files
     * @param msg - The commit message
     * @return A Promise for the newly created Git log entry
     */
    public commit(msg: string = ""): Promise<IGitLogEntry>
    {
        // TODO: Add unit tests for this method.

        return spawn("git", ["commit", "-m", msg], {cwd: this._dir.toString()})
        .closePromise
        .then(() => {
            // Get the commit hash
            return spawn("git", ["rev-parse", "HEAD"], {cwd: this._dir.toString()}).closePromise;
        })
        .then((stdout) => {
            const commitHash = _.trim(stdout);
            return spawn("git", ["show", commitHash], {cwd: this._dir.toString()}).closePromise;
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


    /**
     * Fetches from the specified remote.
     * @param remoteName - The remote to fetch from
     * @param fetchTags - Set to true in order to fetch tags that point to
     * objects that are not downloaded (see git fetch docs).
     * @return A promise that is resolved when the command completes
     * successfully
     */
    public fetch(remoteName: string = "origin", fetchTags: boolean = false): Promise<void>
    {
        const args = [
            "fetch",
            ...insertIf(fetchTags, "--tags"),
            remoteName
        ];

        return spawn("git", args, {cwd: this._dir.toString()}).closePromise
        .then(
            () => {},
            (err) => {
                console.log(`Error fetching from ${remoteName} remote: ${JSON.stringify(err)}`);
                throw err;
            }
        );
    }


    /**
     * Gets this repo's commit log
     * @param forceUpdate - true to get a current snapshot of this repos log;
     * false if a previously cached log can be used (more performant)
     * @return A Promise for an array of Git log entries
     */
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
     * @method
     * @return A promise for an array of structures describing each commit.
     */
    private getLogEntries(): Promise<Array<IGitLogEntry>>
    {
        return spawn("git", ["log"], {cwd: this._dir.toString()})
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
