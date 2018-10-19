import * as _ from "lodash";
import {GitRepo} from "./gitRepo";
import {spawn} from "./spawn";
import {Validator} from "./validator";


// TODO: To get the branches that are pointing at a given commit:
// git show-ref | grep -i "70e423e654f3a3"
// This would be useful when creating a SourceTree custom action that would
// allow the user to right click on a commit and copy the branch names that
// refer to that commit.

export class GitBranch
{
    // region Static Data Members

    // The regex needed to parse the long name strings printed by "git branch
    // -a".
    // If given remotes/remotename/branch/name
    // group 1: "remotes/remotename"  (not all that useful)
    // group 2: "remotename"          (the remote name)
    // group 3: "branch/name"         (the branch name)
    private static strParserRegex: RegExp = /^(remotes\/([\w.-]+)\/)?(.*)$/;
    // endregion


    /**
     * Validates the specified branch name
     * @static
     * @method
     * @param branchName - The name to validate
     * @return A promise for a boolean that will indicate whether branchName is
     * valid.  This promise will never reject.
     */
    public static isValidBranchName(branchName: string): Promise<boolean>
    {
        // A Git branch name cannot:
        // - Have a path component that begins with "."
        // - Have a double dot ".."
        // - Have an ASCII control character, "~", "^", ":" or SP, anywhere.
        // - End with a "/"
        // - End with ".lock"
        // - Contain a "\" (backslash)
        //
        // We could check for the above ourselves, or just ask Git to validate
        // branchName using the check-ref-format command.
        // The following command returns 0 if it is a valid name.
        // git check-ref-format --allow-onelevel "foobar\lock"
        // (returns 1 because backslash is invalid)

        return spawn("git", ["check-ref-format", "--allow-onelevel", branchName])
        .closePromise
        .then(() => {
            // Exit code === 0 means branchName is valid.
            return true;
        })
        .catch(() => {
            // Exit code !== 0 means branchName is invalid.
            return false;
        });
    }


    /**
     * Creates a GitBranch
     * @static
     * @method
     * @param repo - The repo associated with the branch
     * @param branchName - The name of the branch
     * @param remoteName - The remote name (if a remote branch)
     * @return A Promise for the newly created GitBranch instance.  This Promise
     * will be resolved with undefined if the specified branch name is invalid.
     */
    public static create(repo: GitRepo, branchName: string, remoteName?: string): Promise<GitBranch>
    {
        const validator = new Validator<string>([this.isValidBranchName]);

        return validator.isValid(branchName)
        .then((branchNameIsValid) => {
            if (!branchNameIsValid) {
                throw new Error(`Cannot create GitBranch instance from invalid branch name ${branchName}.`);
            }

            return new GitBranch(repo, branchName, remoteName);
        });
    }


    /**
     * Enumerates the branches that exist within the specified repo.
     * @static
     * @method
     * @param repo - The repo in which the branches are to be enumerated
     * @return A Promise for an array of branches in the specified repo
     */
    public static enumerateGitRepoBranches(repo: GitRepo): Promise<Array<GitBranch>>
    {
        return spawn("git", ["branch", "-a"], repo.directory.toString()).closePromise
        .then((stdout) => {
            return _.chain(stdout.split("\n"))
            // Get rid of leading and trailing whitespace
            .map((curLine) => curLine.trim())
            // Replace the "* " that precedes the current working branch
            .map((curLine) => curLine.replace(/^\*\s+/, ""))
            // Filter out the line that looks like: remotes/origin/HEAD -> origin/master
            .filter((curLine) => !/^[\w/]+\/HEAD\s+->\s+[\w/]+$/.test(curLine))
            // Get rid of leading and trailing whitespace
            .map((curLine) => curLine.trim())
            // Create an array of GitBranch objects
            .map((longName): GitBranch => {
                const regexResults = GitBranch.strParserRegex.exec(longName);
                if (!regexResults)
                {
                    throw new Error(`Error: Branch "${longName}" could not be parsed by enumerateGitRepoBranches().`);
                }

                const remoteName = regexResults[2];
                const branchName = regexResults[3];

                // Note: Because the branch names are coming from Git (and not a
                // user) the branch names do not have to be validated as is done in
                // GitBranch.create(), which uses user data.

                return new GitBranch(repo, branchName, remoteName);
            })
            .value();

        });
    }


    // region Data Members
    private readonly _repo: GitRepo;
    private readonly _remoteName: string | undefined;
    private readonly _name: string;
    // endregion


    /**
     * Constructs a new GitBranch.
     *
     * @param repo - The repo the branch should be associated with
     * @param branchName - The branch name
     * @param remoteName - The remote name (if the branch is a remote branch)
     */
    private constructor(repo: GitRepo, branchName: string, remoteName?: string)
    {
        this._repo = repo;
        this._name = branchName;
        this._remoteName = remoteName || undefined;
    }


    public get repo(): GitRepo
    {
        return this._repo;
    }


    public get remoteName(): string | undefined
    {
        return this._remoteName;
    }


    public get name(): string
    {
        return this._name;
    }

}
