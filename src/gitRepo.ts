import {insertIf} from "./arrayHelpers";
import {Directory} from "./directory";
import {File} from "./file";
import {spawn} from "./spawn";
import {spawn as spawn2, spawnErrorToString} from "./spawn2";
import {GitBranch} from "./gitBranch";
import * as _ from "lodash";
import {outdent, trimBlankLines, splitIntoLines} from "./stringHelpers";
import {Url} from "./url";
import {gitUrlToProjectName, isGitUrl} from "./gitHelpers";
import {IPackageJson} from "./nodePackage";
import {CommitHash} from "./commitHash";
import {toPromise} from "./promiseResult";
import {Result, failedResult, succeededResult, succeeded, failed} from "./result";
import {mapAsync} from "./promiseHelpers";


interface IGitLogEntry {
    // TODO: Change the following to an instance of CommitHash.
    commitHash: string;
    author: string;
    timestamp: Date;
    message: string;
}


/**
 * Gets a regular expression capable of parsing a git log entry.  This regex is
 * wrapped by this function, because the returned regex maintains state due to
 * the /g flag.
 * @return Description
 */
function getLogEntryRegex(): RegExp {
    //
    // A regex for parsing "git log" output.
    // match[1]: commit hash
    // match[2]: author
    // match[3]: commit timestamp
    // match[4]: commit message (a sequence of lines that are either blank or start with whitespace)
    //

    // TODO: Convert the following regex to use named capture groups.
    // eslint-disable-next-line prefer-named-capture-group
    const logEntryRegex = /commit\s*([0-9a-f]+).*?$\s^Author:\s*(.*?)$\s^Date:\s*(.*?)$\s((?:(?:^\s*$\n?)|(?:^\s+(?:.*)$\s?))+)/gm;
    return logEntryRegex;
}


/**
 * Determines whether dir is a directory containing a Git repository.
 * @param dir - The directory to inspect
 * @return A promise for a boolean indicating whether dir contains a Git
 * repository.  This promise will never reject.
 */
export function isGitRepoDir(dir: Directory): Promise<boolean> {
    return Promise.all([
        dir.exists(),                        // The directory exists
        new Directory(dir, ".git").exists()  // The directory contains a .git directory
    ])
    .then(([dirExists, dotGitExists]) => {
        return Boolean(dirExists && dotGitExists);
    });
}


export type FilesRelativeTo = "cwd" | "repo";


/**
 * Represents a Git repository within the local filesystem.
 */
export class GitRepo {
    /**
     * Creates a new GitRepo instance, pointing it at the specified directory.
     *
     * @param dir - The directory containing the repo
     * @return A Promise that always resolves.  Resolves with a new GitRepo
     * instance when successful.  Resolves with an error result containing a
     * descriptive error message upon failure.
     */
    public static async fromDirectory(dir: Directory): Promise<Result<GitRepo, string>> {
        const isGitRepo = await isGitRepoDir(dir);
        return isGitRepo ?
               succeededResult(new GitRepo(dir)) :
               failedResult(`${dir.toString()} does not exist or is not a Git repo.`);
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
    public static clone(
        src: Url | Directory,
        parentDir: Directory,
        dirName?: string,
        bare: boolean = false
    ): Promise<GitRepo> {
        let repoDirName: string;
        let srcStr: string;

        if (src instanceof Url) {
            repoDirName = dirName || gitUrlToProjectName(src.toString());
            const protocols = src.getProtocols();
            srcStr = protocols.length < 2 ?
                src.toString() :
                src.replaceProtocol("https").toString();
        }
        else {
            repoDirName = dirName || src.dirName;
            // The path to the source repo must be made absolute, because when
            // we execute the "git clone" command, the cwd will be `parentDir`.
            srcStr = src.absPath();
        }

        const repoDir = new Directory(parentDir, repoDirName);

        return parentDir.exists()
        .then((parentDirExists) => {
            if (!parentDirExists) {
                throw new Error(`${parentDir} is not a directory.`);
            }
        })
        .then(() => {
            return spawn(
                "git",
                [
                    "clone",
                    srcStr,
                    repoDirName,
                    ...insertIf(bare, "--bare")
                ],
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
    private constructor(dir: Directory) {
        this._dir = dir;
    }


    /**
     * Gets the directory containing this Git repo.
     * @return The directory containing this git repo.
     */
    public get directory(): Directory {
        return this._dir;
    }


    /**
     * Determines whether this GitRepo is equal to another GitRepo.  Two
     * instances are considered equal if they point to the same directory.
     *
     * @param other - The other GitRepo to compare with
     * @return Whether the two GitRepo instances are equal
     */
    public equals(other: GitRepo): boolean {
        return this._dir.equals(other._dir);
    }


    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.
     */
    public files(): Promise<Array<File>> {
        return spawn("git", ["ls-files"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            const relativeFilePaths = splitIntoLines(stdout);
            return _.map(relativeFilePaths, (curRelFilePath) => {
                return new File(this._dir, curRelFilePath);
            });
        });
    }


    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    public modifiedFiles(): Promise<Array<File>> {
        return spawn("git", ["ls-files", "-m"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            if (stdout === "") {
                return [];
            }
            const relativeFilePaths = splitIntoLines(stdout);
            return _.map(relativeFilePaths, (curRelativeFilePath) => {
                return new File(this._dir, curRelativeFilePath);
            });
        });
    }


    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    public untrackedFiles(): Promise<Array<File>> {
        return spawn("git", ["ls-files",  "--others",  "--exclude-standard"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            if (stdout === "") {
                return [];
            }
            const relativeFilePaths = splitIntoLines(stdout);
            return _.map(relativeFilePaths, (curRelativePath) => {
                return new File(this._dir, curRelativePath);
            });
        });
    }


    // TODO: Write unit tests for this method.  Make sure there is no leading or trailing whitespace.
    public currentCommitHash(): Promise<CommitHash> {
        return spawn("git", ["rev-parse", "--verify", "HEAD"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            const hash = CommitHash.fromString(stdout);
            if (!hash) {
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
    public remotes(): Promise<{[name: string]: string}> {
        return spawn("git", ["remote", "-vv"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            const lines = splitIntoLines(stdout);
            const remotes: {[name: string]: string} = {};
            lines.forEach((curLine) => {
                // TODO: Convert the following regex to use named capture groups.
                // eslint-disable-next-line prefer-named-capture-group
                const match = curLine.match(/^(\w+)\s+(.*)\s+\(\w+\)$/);
                if (match) {
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
    public name(): Promise<string> {
        return this.remotes()
        .then((remotes) => {
            const remoteNames = Object.keys(remotes);
            if (remoteNames.length > 0) {
                const remoteUrl = remotes[remoteNames[0]];

                if (isGitUrl(remoteUrl)) {
                    return gitUrlToProjectName(remoteUrl);
                }
            }

            return undefined;
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

            return undefined;
        })
        .then((projName) => {
            if (projName) {
                return projName;
            }

            const dirName = this._dir.dirName;
            if (dirName === "/") {
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
    public tags(): Promise<Array<string>> {
        return spawn("git", ["tag"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            if (stdout.length === 0) {
                return [];
            }

            return splitIntoLines(stdout);
        });
    }


    /**
     * Determines whether `tagName` is a tag that exists in this repo.
     * @param tagName - The tag to search for
     * @return A Promise for a boolean indicating whether `tagName` exists.
     */
    public hasTag(tagName: string): Promise<boolean> {
        return this.tags()
        .then((tags) => {
            return tags.includes(tagName);
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
    public createTag(tagName: string, message = "", force = false): Promise<GitRepo> {
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
    public deleteTag(tagName: string): Promise<GitRepo> {
        return spawn("git", ["tag", "--delete", tagName], {cwd: this._dir.toString()})
        .closePromise
        .catch((err) => {
            if (err.stderr.includes("not found")) {
                // The specified tag name was not found.  We are still
                // successful.
            }
            else {
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
        force = false
    ): Promise<GitRepo> {
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
    public getBranches(forceUpdate = false): Promise<Array<GitBranch>> {
        if (forceUpdate) {
            // Invalidate the cache.  If this update fails, subsequent requests
            // will have to update the cache.
            this._branches = undefined;
        }

        let updatePromise: Promise<void>;

        if (this._branches === undefined) {
            // The internal cache of branches needs to be updated.
            updatePromise = GitBranch.enumerateGitRepoBranches(this)
            .then((branches: Array<GitBranch>) => {
                this._branches = branches;
            });
        }
        else {
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
    public getCurrentBranch(): Promise<GitBranch | undefined> {
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
                return toPromise(GitBranch.create(this, branchName));
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
    public checkoutBranch(branch: GitBranch, createIfNonexistent: boolean): Promise<void> {
        return this.getBranches()
        .then((allBranches) => {
            // If there is a branch with the same name, we should not try to
            // create it.  Instead, we should just check it out.
            if (_.some(allBranches, {name: branch.name})) {
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
        .then(() => {
            // TODO: If the branch was created, add it to the cache of branches.
            // Also, write a unit test for this case.
            return;
        });
    }


    /**
     * Checks out the specified commit
     * @param commit - The commit to checkout
     * @return A Promise that resolves when the commit is checked out.
     */
    public checkoutCommit(commit: CommitHash): Promise<void> {
        return spawn("git", ["checkout", commit.toString()], {cwd: this._dir.toString()}).closePromise
        .then(() => { return; });
    }


    /**
     * Stages all modified files that are not being ignored (via .gitignore)
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    public stageAll(): Promise<GitRepo> {
        return spawn("git", ["add", "."], {cwd: this._dir.toString()}).closePromise
        .then(() => {
            return this;
        });
    }


    /**
     *
     * @param file - The file to be staged.  The File does not have to be
     * relative to the repo's root directory.
     * @returns A Promise that always resolves with a Result.  The result will
     * be successful if the specified file is modified or unmodified.  A
     * successful result contains the File passed in.  A failed result will
     * contain an error message.
     */
    public async stage(file: File): Promise<Result<File, string>> {
        // Get a File representing the file's path within this repo.
        const repoFile = File.relative(this._dir, file);

        // TODO: Verify the specified file is within this repo's directory.
        // Is this needed, because the git command will just fail?

        const result = await spawn2("git", ["add", repoFile.toString()], {cwd: this._dir.toString()})
        .closePromise;

        if (succeeded(result)) {
            return succeededResult(file);
        }
        else {
            return failedResult(spawnErrorToString(result.error));
        }
    }


    /**
     * Pushes the current branch to a remote
     * @param remoteName - The remote to push to
     * @param setUpstream - true to set the remote's branch as the upstream
     * branch
     * @return A Promise that is resolved when the push has completed.  The
     * promise will reject when working in a detached head state.
     */
    public pushCurrentBranch(remoteName = "origin", setUpstream = false): Promise<void> {
        return this.getCurrentBranch()
        .then((curBranch) => {
            if (!curBranch) {
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
            return;
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
    public getCommitDeltas(trackingRemote = "origin"): Promise<{ahead: number, behind: number}> {
        // TODO: Write unit tests for this method.

        return this.getCurrentBranch()
        .then((branch) => {
            if (!branch) {
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
                ahead:  parseInt(results[0], 10),
                behind: parseInt(results[1], 10)
            };
        });
    }


    /**
     * Gets the staged files within a repo.
     * @param resultsRelativeTo - When successful, what the returned file paths
     * should be relative to
     * @returns A Promise that always resolves.  On success, the result contains
     * an array containing the staged Files.  On error, the result contains an
     * error message.
     */
    public async getStagedFiles(
        resultsRelativeTo: FilesRelativeTo
    ): Promise<Result<Array<File>, string>> {
        const result = await spawn2("git", ["diff", "--name-only", "--cached"], {cwd: this._dir.toString()})
        .closePromise;

        if (failed(result)) {
            return failedResult(spawnErrorToString(result.error));
        }

        // The output will contain one file path per line.  The file paths will
        // be relative to the repo's root directory.
        let stagedFiles = _.chain(splitIntoLines(result.value))
        .map((curLine) => curLine.trim())
        .map((curLine) => new File(curLine))
        .value();

        if (resultsRelativeTo === "cwd") {
            stagedFiles = stagedFiles.map(
                (curStagedFile) => new File(this.directory, curStagedFile.toString())
            );
        }

        return succeededResult(stagedFiles);
    }

    /**
     * Commits staged files
     * @param msg - The commit message
     * @return A Promise for the newly created Git log entry
     */
    public commit(msg = ""): Promise<IGitLogEntry> {
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
            const match = getLogEntryRegex().exec(stdout);
            if (!match) {
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
    public fetch(remoteName = "origin", fetchTags = false): Promise<void> {
        const args = [
            "fetch",
            ...insertIf(fetchTags, "--tags"),
            remoteName
        ];

        return spawn("git", args, {cwd: this._dir.toString()}).closePromise
        .then(
            () => { return; },
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
    public getLog(forceUpdate?: boolean): Promise<Array<IGitLogEntry>> {
        if (forceUpdate) {
            this._log = undefined;
        }

        let updatePromise: Promise<void>;

        if (this._log === undefined) {
            updatePromise = this.getLogEntries()
            .then((log: Array<IGitLogEntry>) => {
                this._log = log;
            });
        }
        else {
            updatePromise = Promise.resolve();
        }

        return updatePromise
        .then(() => {
            return this._log!;
        });
    }


    /**
     * Merges the specified branch into this repo's current branch.
     * @param sourceBranch - The branch to be merged into the current branch
     * @return Successful results contain this GitRepo instance (to enable
     * chaining).  Failed results contain a descriptive error message.
     */
    public async merge(sourceBranch: GitBranch): Promise<Result<GitRepo, string>> {
        // TODO: Need to enhance this method to account for things that prevent
        // this merge from succeeding, like merge conflicts.

        const result = await spawn2(
            "git",
            ["merge", sourceBranch.toString()],
            {cwd: this._dir.toString()}
        )
        .closePromise;

        return succeeded(result) ?
               succeededResult(this) :
               failedResult(spawnErrorToString(result.error));
    }


    /**
     * Deletes the specified branch from this repository.
     * @param branch - The branch to be deleted
     * @param force - Whether to force deletion when the branch has unmerged
     * commits.  This only applies if the branch is local.  Remote branches will
     * always be deleted.
     * @return Successful results contain this GitRepo instance (to enable
     * chaining).  Failed results contain a descriptive error message.
     */
    public async deleteBranch(
        branch: GitBranch,
        force: boolean = false
    ): Promise<Result<GitRepo, string>> {
        let args: Array<string>;

        if (branch.isLocal()) {
            args = [
                "branch",
                force ? "-D" : "-d",
                branch.toString()
            ];
        }
        else {
            args = [
                "push",
                branch.remoteName!,
                `:${branch.name}`
            ];
        }

        const result = await spawn2("git", args, {cwd: this._dir.toString()})
        .closePromise;

        if (succeeded(result)) {
            this._branches = undefined;
        }

        return succeeded(result) ?
               succeededResult(this) :
               failedResult(spawnErrorToString(result.error));
    }


    public async getMergedBranches(
        destBranch: undefined | GitBranch,
        findLocalBranches: boolean,
        findRemoteBranches: boolean
    ): Promise<Result<Array<GitBranch>, string>> {
        // We will not be able to get the current branch when working in a
        // detached head state.  That is fine, because when that is true, we
        // will not have to remove it from the results either.
        const currentBranch = await this.getCurrentBranch();

        // Do a reality check.  The caller should be asking for either local or
        // remote branches, or both.
        if (!findLocalBranches && !findRemoteBranches) {
            throw new Error("getMergedBranches() called requesting neither local nor remote branches.");
        }

        let args: Array<string> = [
            "branch",
            // We will always get all merged branches and then just filter the
            // results.  This is easier than dealing with the varying text
            // output used when using the "-r" (remote) switch.
            "-a"
        ];

        if (destBranch) {
            // If the user specified the destination branch, provide it as the
            // argument to the --merged switch.
            args = [...args, "--merged", destBranch.toString()];
        }
        else {
            // If the user wants to get branches merged into the current branch,
            args = [...args, "--merged"];
        }

        const result = await spawn2("git", args, {cwd: this._dir.toString()})
        .closePromise;

        if (succeeded(result)) {
            // Output looks like the following.  Please note how spawn2() trims
            // the output so the first line does not start with whitespace.
            // 1828-column_sorting_in_new_proj_list
            //   origin/HEAD -> origin/master
            //   bug/1879-changed_after_checked
            // * dev/2129-remove_vaultitem
            //   develop
            const reOutputLine = /^\*?\s*(?:remotes\/(?<remoteName>\w+)\/)?(?<branchName>.*)$/m;

            let lines = splitIntoLines(result.value);
            // Remove any lines that look like:
            // remotes/origin/HEAD -> origin/master
            lines = _.filter(lines, (curLine) => !_.includes(curLine, " -> "));

            // Map each line to a GitBranch instance.
            let branches = await mapAsync<string, GitBranch>(
                lines,
                async (curLine) => {
                    const match = reOutputLine.exec(curLine);
                    if (!match) {
                        throw new Error("Command output did not match parsing regex.");
                    }

                    const branchName = match.groups!.branchName;
                    const remoteName = match.groups!.remoteName;
                    const branchResult = await GitBranch.create(this, branchName, remoteName);
                    if (failed(branchResult)) {
                        throw new Error(branchResult.error);
                    }
                    return branchResult.value;
                }
            );

            if (findLocalBranches && findRemoteBranches) {
                // Intentionally empty.
            }
            else if (findLocalBranches) {
                branches = _.filter(branches, (curBranch) => curBranch.isLocal());
            }
            else if (findRemoteBranches) {
                branches = _.filter(branches, (curBranch) => curBranch.isRemote());
            }

            if (destBranch) {
                // Remove the destination branch from the results.
                branches = _.filter(branches, (curBranch) => !curBranch.equals(destBranch));
            }
            else if (currentBranch) {
                // No destination branch was specified.  Remove the current
                // branch from the results.
                branches = _.filter(branches, (curBranch) => !curBranch.equals(currentBranch));
            }

            return succeededResult(branches);
        }
        else {
            return failedResult(spawnErrorToString(result.error));
        }


    }


    /**
     * Helper method that retrieves Git log entries
     *
     * @return A promise for an array of structures describing each commit.
     */
    private getLogEntries(): Promise<Array<IGitLogEntry>> {
        return spawn("git", ["log"], {cwd: this._dir.toString()})
        .closePromise
        .then((stdout) => {
            const logEntryRegex = getLogEntryRegex();
            const entries: Array<IGitLogEntry> = [];
            let match: RegExpExecArray | null;
            while ((match = logEntryRegex.exec(stdout)) !== null) {
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
