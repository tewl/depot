import { GitRepo } from "./gitRepo";
export declare class GitBranch {
    private static strParserRegex;
    /**
     * Validates the specified branch name
     * @method
     * @param branchName - The name to validate
     * @return A promise for a boolean that will indicate whether branchName is
     * valid.  This promise will never reject.
     */
    static isValidBranchName(branchName: string): Promise<boolean>;
    /**
     * Creates a GitBranch
     * @method
     * @param repo - The repo associated with the branch
     * @param branchName - The name of the branch
     * @param remoteName - The remote name (if a remote branch)
     * @return A Promise for the newly created GitBranch instance.  This Promise
     * will be resolved with undefined if the specified branch name is invalid.
     */
    static create(repo: GitRepo, branchName: string, remoteName?: string): Promise<GitBranch>;
    /**
     * Enumerates the branches that exist within the specified repo.
     * @method
     * @param repo - The repo in which the branches are to be enumerated
     * @return A Promise for an array of branches in the specified repo
     */
    static enumerateGitRepoBranches(repo: GitRepo): Promise<Array<GitBranch>>;
    private readonly _repo;
    private readonly _remoteName;
    private readonly _name;
    /**
     * Constructs a new GitBranch.
     *
     * @param repo - The repo the branch should be associated with
     * @param branchName - The branch name
     * @param remoteName - The remote name (if the branch is a remote branch)
     */
    private constructor();
    readonly repo: GitRepo;
    readonly remoteName: string | undefined;
    readonly name: string;
    toString(): string;
    isLocal(): boolean;
    isRemote(): boolean;
    getTrackedBranch(): Promise<GitBranch | undefined>;
}
