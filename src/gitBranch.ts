import * as _ from "lodash";
import {GitRepo} from "./gitRepo";
import {spawn} from "./spawn";
import {Validator} from "./validator";
import {insertIf} from "./arrayHelpers";
import { splitIntoLines, splitLinesOsIndependent} from "./stringHelpers";
import { Result, failedResult, succeeded, succeededResult } from "./result";


// TODO: To get the branches that are pointing at a given commit:
// git show-ref | grep -i "70e423e654f3a3"
// This would be useful when creating a SourceTree custom action that would
// allow the user to right click on a commit and copy the branch names that
// refer to that commit.

export class GitBranch {
    // region Static Data Members

    // The regex needed to parse the long name strings printed by "git branch
    // -a".
    // If given remotes/remotename/branch/name
    // group 1: "remotes/remotename/" (not all that useful)
    // group 2: "remotename"          (the remote name)
    // group 3: "branch/name"         (the branch name)
    // TODO: Convert the following regex to use named capture groups.
    // eslint-disable-next-line prefer-named-capture-group
    private static readonly _strParserRegex = /^(remotes\/([\w.-]+)\/)?(.*)$/;
    // endregion


    /**
     * Validates the specified branch name
     *
     * @param branchName - The name to validate
     * @return A promise for a boolean that will indicate whether branchName is
     * valid.  This promise will never reject.
     */
    public static isValidBranchName(branchName: string): Promise<boolean> {
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
     * Creates a GitBranch instance.  Note: This method does not create a branch
     * in a repo.
     *
     * @param repo - The repo associated with the branch
     * @param branchName - The name of the branch
     * @param remoteName - The remote name (if a remote branch)
     * @return A Promise that always resolves with a Result.  The result
     * indicates whether this operation succeeded.
     */
    public static async create(
        repo: GitRepo,
        branchName: string,
        remoteName?: string
    ): Promise<Result<GitBranch, string>> {
        const validator = new Validator<string>([GitBranch.isValidBranchName]);

        const isValid = await validator.isValid(branchName);

        return isValid ?
               succeededResult(new GitBranch(repo, branchName, remoteName)) :
               failedResult(`Cannot create GitBranch instance from invalid branch name ${branchName}.`);
    }


    /**
     * Enumerates the branches that exist within the specified repo.
     *
     * @param repo - The repo in which the branches are to be enumerated
     * @return A Promise for an array of branches in the specified repo
     */
    public static enumerateGitRepoBranches(repo: GitRepo): Promise<Array<GitBranch>> {
        return spawn("git", ["branch", "-a"], {cwd: repo.directory.toString()}).closePromise
        .then((stdout) => {
            return _.chain(splitIntoLines(stdout))
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
                const regexResults = GitBranch._strParserRegex.exec(longName);
                if (!regexResults) {
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


    // region Instance Data Members
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
    private constructor(repo: GitRepo, branchName: string, remoteName?: string) {
        this._repo = repo;
        this._name = branchName;
        this._remoteName = remoteName || undefined;
    }


    public equals(other: GitBranch): boolean {
        return this._repo.equals(other._repo) &&
               this._name === other._name     &&
               this._remoteName === other._remoteName;
    }


    /**
     * Determines whether the branch represented by this instance exists within
     * its Git repository.
     * @return A Promise that resolves with a boolean indicating whether this
     * branch exists.
     */
    public async exists(): Promise<boolean> {
        const branches = await this._repo.getBranches();
        return branches.some((curBranch) => curBranch.equals(this));
    }


    public get repo(): GitRepo {
        return this._repo;
    }


    /**
     * If this branch is a remote branch, gets the name of the remote repository.
     *
     * @return The name of the remote this branch belongs to.  Returns undefined
     *      if this branch is local.
     */
    public get remoteName(): string | undefined {
        return this._remoteName;
    }


    public get name(): string {
        return this._name;
    }


    public toString(): string {
        const parts: Array<string> = [
            ...insertIf<string>(this.isRemote(), this._remoteName!),
            this._name
        ];
        return parts.join("/");
    }


    public isLocal(): boolean {
        return this.remoteName === undefined;
    }


    public isRemote(): boolean {
        return !this.isLocal();
    }


    /**
     * Gets the remote branch that this branch is tracking (if there is one).
     *
     * @return A Promise that always resolves.  The Promise will resolve with
     * the branch this branch is tracking, or undefined if this branch is not
     * tracking a remote branch.
     */
    public getTrackedBranch(): Promise<GitBranch | undefined> {
        //
        // A full example:
        // $ git branch -vv
        //   bug/pouchdb_memory_leaks                   c46b312 [origin/bug/pouchdb_memory_leaks: behind 83] fix userDirectory misnaming issue
        //   develop                                    7d3faff [origin/develop] Merge branch 'master' into develop
        //   feature/161_cip_url_support                22d49ab [origin/feature/161_cip_url_support] Replaced validateIP() with isIP().  Removed validateIP().
        //   feature/193_production_outages/code        24ffd6d [origin/feature/193_production_outages/code] Created script for printing user directory information.
        //   feature/193_production_outages/experiment1 847b179 Make health endpoint throw an error.
        //   feature/193_production_outages/experiment2 caf013e Trivial change for Azure deploy.
        //   feature/193_production_outages/experiment3 6a17a13 Added some experimental routes to verify logging works.
        //   feature/193_production_outages/kwp         920a38b [kwp/feature/193_production_outages/kwp: ahead 11] Improved jsdoc slightly.
        //   feature/tags                               f843792 [origin/feature/tags] Merge branch 'develop' into feature/tags
        //   master                                     bc8b8d9 [origin/master: behind 123] Merge branch 'feature/urlfavorites' into 'develop'
        //   todo/convert_func_tests_to_jasmine         adc7351 [origin/todo/convert_func_tests_to_jasmine] Gave anonymous functions names.
        //   todo/new_toad_ver                          b51065a [origin/todo/new_toad_ver] Merge branch 'develop' into todo/new_toad_ver
        //   todo/remove_whitelists                     212b05b [origin/todo/remove_whitelists] Merge branch 'develop' into todo/remove_whitelists
        // * todo/ts_support                            d5674cd [origin/todo/ts_support] Removed unneeded import.
        //   todo/update_opensso_mock                   b00c134 [kwp/todo/update_opensso_mock] Updated opensso-mock to latest version that has shebang line.
        //

        // TODO: Make sure this GitBranch instance is a local branch.

        return spawn("git", ["branch", "-vv"], {cwd: this._repo.directory.toString()}).closePromise
        .then((output) => {
            const outputLines = splitLinesOsIndependent(output);

            // The last column for lines matching the specified local branch.
            const lastCols = _.reduce<string, Array<string>>(
                outputLines,
                (acc, curLine) => {
                    // A regex for matching lines output from "git branch -vv"
                    // - an optional "*" (indicating the current branch)
                    // - whitespace
                    // - characters making up the local branch name (group 1)
                    // - whitespace
                    // - 7 characters making up the commit hash (group 2)
                    // - whitespace
                    // - the remainder of the line (group 3)
                    // TODO: Convert the following regex to use named capture groups.
                    // eslint-disable-next-line prefer-named-capture-group
                    const matches = /^[*]?\s+([\w/.-]+)\s+([0-9a-fA-F]+)\s+(.*)$/.exec(curLine);
                    if (matches && matches[1] === this.name) {
                        acc.push(matches[3]);
                    }
                    return acc;
                },
                []
            );

            if (lastCols.length === 0) {
                return Promise.resolve(undefined);
            }
            else if (lastCols.length > 1) {
                // We should never get more than 1 matching line.
                throw new Error(`Unexpectedly got multiple results for ${this.name}.`);
            }

            const lastCol = lastCols[0];

            // A regex to pull apart the items in the last column
            // - an optional part in square brackets (group 1)
            //   - "["
            //   - name of the remote branch (group 2)
            //   - an optional ":"
            //   - some optional text describing whether the branch is ahead and/or behind (group 3)
            //   - "]"
            // - optional whitespace
            // - commit message (group 4)
            // TODO: Convert the following regex to use named capture groups.
            // eslint-disable-next-line prefer-named-capture-group
            const lastColRegex = /^(\[([\w/.-]+):?(.*)\])?\s*(.*)$/;
            let matches = lastColRegex.exec(lastCol);

            if (matches) {
                const remoteBranchStr = matches[2];
                if (remoteBranchStr === undefined) {
                    return Promise.resolve(undefined);
                }

                // A regex to pull apart the remote branch string
                // - A non-greedy bunch of stuff = remote name (group 1)
                // - "/"
                // - A bunch of stuff = remote branch name (group 2)
                // TODO: Convert the following regex to use named capture groups.
                // eslint-disable-next-line prefer-named-capture-group
                const remoteBranchRegex = /^(.*?)\/(.*)$/;
                matches = remoteBranchRegex.exec(remoteBranchStr);
                if (matches) {
                    return GitBranch.create(this.repo, matches[2], matches[1])
                    .then((branchResult) => {
                        if (succeeded(branchResult)) {
                            return branchResult.value;
                        }
                        else {
                            throw new Error(branchResult.error);
                        }
                    });
                }
                else {
                    return Promise.reject(new Error(`Could not parse remote branch string ${remoteBranchStr}.`));
                }

            }
            else {
                // The specified branch is not tracking a remote branch.
                return Promise.resolve(undefined);
            }

        });


    }

}
