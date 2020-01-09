import { Directory } from "./directory";
import { File } from "./file";
import { GitBranch } from "./gitBranch";
import { Url } from "./url";
import { CommitHash } from "./commitHash";
interface IGitLogEntry {
    commitHash: string;
    author: string;
    timestamp: Date;
    message: string;
}
/**
 * Determines whether dir is a directory containing a Git repository.
 * @param dir - The directory to inspect
 * @return A promise for a boolean indicating whether dir contains a Git
 * repository.  This promise will never reject.
 */
export declare function isGitRepoDir(dir: Directory): Promise<boolean>;
/**
 * Represents a Git repository within the local filesystem.
 */
export declare class GitRepo {
    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    static fromDirectory(dir: Directory): Promise<GitRepo>;
    /**
     * Clones a Git repo at the specified location.
     * @param src - The source to clone the repo from
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @param dirName - The name of the directory to place the cloned repository
     * into.  If not specified, the project's name will be used.
     * @return A promise for the cloned Git repo.
     */
    static clone(src: Url | Directory, parentDir: Directory, dirName?: string): Promise<GitRepo>;
    private readonly _dir;
    private _branches;
    private _log;
    /**
     * Constructs a new GitRepo.  Private in order to provide error checking.
     * See static methods.
     *
     * @param dir - The directory containing the Git repo.
     */
    private constructor();
    /**
     * Gets the directory containing this Git repo.
     * @return The directory containing this git repo.
     */
    readonly directory: Directory;
    /**
     * Determines whether this GitRepo is equal to another GitRepo.  Two
     * instances are considered equal if they point to the same directory.
     * @method
     * @param other - The other GitRepo to compare with
     * @return Whether the two GitRepo instances are equal
     */
    equals(other: GitRepo): boolean;
    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.
     */
    files(): Promise<Array<File>>;
    modifiedFiles(): Promise<Array<File>>;
    untrackedFiles(): Promise<Array<File>>;
    currentCommitHash(): Promise<CommitHash>;
    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    remotes(): Promise<{
        [name: string]: string;
    }>;
    /**
     * Gets the name of this Git repository.  If the repo has a remote, the name
     * is taken from the last part of the remote's URL.  Otherwise, the name
     * will be taken from the "name" property in package.json.  Otherwise, the
     * name will be the name of the folder the repo is in.
     * @return A Promise for the name of this repository.
     */
    name(): Promise<string>;
    /**
     * Gets all the tags present in this repo.
     * @return A Promise for an array of tag names.  An empty array is returned
     * when there are no tags.
     */
    tags(): Promise<Array<string>>;
    /**
     * Determines whether `tagName` is a tag that exists in this repo.
     * @param tagName - The tag to search for
     * @return A Promise for a boolean indicating whether `tagName` exists.
     */
    hasTag(tagName: string): Promise<boolean>;
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
    createTag(tagName: string, message?: string, force?: boolean): Promise<GitRepo>;
    /**
     * Deletes the specified tag.
     * @param tagName - The name of the tag to delete
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    deleteTag(tagName: string): Promise<GitRepo>;
    /**
     * Pushes a tag to a remote
     * @param tagName - The name of the tag to push
     * @param remoteName - The remote to push the tag to
     * @param force - false if your intention is to not affect any existing
     * tags; true if your intention is to move an existing tag.
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    pushTag(tagName: string, remoteName: string, force?: boolean): Promise<GitRepo>;
    /**
     * Gets a list of branches in this repo.
     * @param forceUpdate - false to use a cached list of branches (if
     * available); true to retrieve the latest list of branches.
     * @return A Promise for the branches found
     */
    getBranches(forceUpdate?: boolean): Promise<Array<GitBranch>>;
    /**
     * Gets the current working branch (if there is one)
     * @return A Promise for the current working branch or undefined (when
     * working in a detached head state).
     */
    getCurrentBranch(): Promise<GitBranch | undefined>;
    /**
     * Switches to the specified branch (possibly creating it)
     * @param branch - The branch to switch to
     * @param createIfNonexistent - true to create the branch if it does not
     * exist; false if your intention is to checkout an existing branch
     * @return A Promise that resolves when the branch is checked out.
     */
    checkoutBranch(branch: GitBranch, createIfNonexistent: boolean): Promise<void>;
    /**
     * Checks out the specified commit
     * @param commit - The commit to checkout
     * @return A Promise that resolves when the commit is checked out.
     */
    checkoutCommit(commit: CommitHash): Promise<void>;
    /**
     * Stages all modified files that are not being ignored (via .gitignore)
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    stageAll(): Promise<GitRepo>;
    /**
     * Pushes the current branch to a remote
     * @param remoteName - The remote to push to
     * @param setUpstream - true to set the remote's branch as the upstream
     * branch
     * @return A Promise that is resolved when the push has completed.  The
     * promise will reject when working in a detached head state.
     */
    pushCurrentBranch(remoteName?: string, setUpstream?: boolean): Promise<void>;
    /**
     * Gets the number of commits ahead and behind the current branch is
     * @param trackingRemote - The remote containing the tracking branch
     * @return A Promise for an object containing the result
     */
    getCommitDeltas(trackingRemote?: string): Promise<{
        ahead: number;
        behind: number;
    }>;
    /**
     * Commits staged files
     * @param msg - The commit message
     * @return A Promise for the newly created Git log entry
     */
    commit(msg?: string): Promise<IGitLogEntry>;
    /**
     * Fetches from the specified remote.
     * @param remoteName - The remote to fetch from
     * @param fetchTags - Set to true in order to fetch tags that point to
     * objects that are not downloaded (see git fetch docs).
     * @return A promise that is resolved when the command completes
     * successfully
     */
    fetch(remoteName?: string, fetchTags?: boolean): Promise<void>;
    /**
     * Gets this repo's commit log
     * @param forceUpdate - true to get a current snapshot of this repos log;
     * false if a previously cached log can be used (more performant)
     * @return A Promise for an array of Git log entries
     */
    getLog(forceUpdate?: boolean): Promise<Array<IGitLogEntry>>;
    /**
     * Helper method that retrieves Git log entries
     * @method
     * @return A promise for an array of structures describing each commit.
     */
    private getLogEntries;
}
export {};
