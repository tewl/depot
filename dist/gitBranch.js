"use strict";
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = require("os");
var BBPromise = require("bluebird");
var _ = require("lodash");
var spawn_1 = require("./spawn");
var validator_1 = require("./validator");
var arrayHelpers_1 = require("./arrayHelpers");
var regexpHelpers_1 = require("./regexpHelpers");
// TODO: To get the branches that are pointing at a given commit:
// git show-ref | grep -i "70e423e654f3a3"
// This would be useful when creating a SourceTree custom action that would
// allow the user to right click on a commit and copy the branch names that
// refer to that commit.
var GitBranch = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new GitBranch.
     *
     * @param repo - The repo the branch should be associated with
     * @param branchName - The branch name
     * @param remoteName - The remote name (if the branch is a remote branch)
     */
    function GitBranch(repo, branchName, remoteName) {
        this._repo = repo;
        this._name = branchName;
        this._remoteName = remoteName || undefined;
    }
    // endregion
    /**
     * Validates the specified branch name
     * @method
     * @param branchName - The name to validate
     * @return A promise for a boolean that will indicate whether branchName is
     * valid.  This promise will never reject.
     */
    GitBranch.isValidBranchName = function (branchName) {
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
        return spawn_1.spawn("git", ["check-ref-format", "--allow-onelevel", branchName])
            .closePromise
            .then(function () {
            // Exit code === 0 means branchName is valid.
            return true;
        })
            .catch(function () {
            // Exit code !== 0 means branchName is invalid.
            return false;
        });
    };
    /**
     * Creates a GitBranch
     * @method
     * @param repo - The repo associated with the branch
     * @param branchName - The name of the branch
     * @param remoteName - The remote name (if a remote branch)
     * @return A Promise for the newly created GitBranch instance.  This Promise
     * will be resolved with undefined if the specified branch name is invalid.
     */
    GitBranch.create = function (repo, branchName, remoteName) {
        var validator = new validator_1.Validator([this.isValidBranchName]);
        return validator.isValid(branchName)
            .then(function (branchNameIsValid) {
            if (!branchNameIsValid) {
                throw new Error("Cannot create GitBranch instance from invalid branch name " + branchName + ".");
            }
            return new GitBranch(repo, branchName, remoteName);
        });
    };
    /**
     * Enumerates the branches that exist within the specified repo.
     * @method
     * @param repo - The repo in which the branches are to be enumerated
     * @return A Promise for an array of branches in the specified repo
     */
    GitBranch.enumerateGitRepoBranches = function (repo) {
        return spawn_1.spawn("git", ["branch", "-a"], { cwd: repo.directory.toString() }).closePromise
            .then(function (stdout) {
            return _.chain(stdout.split(regexpHelpers_1.piNewline))
                // Get rid of leading and trailing whitespace
                .map(function (curLine) { return curLine.trim(); })
                // Replace the "* " that precedes the current working branch
                .map(function (curLine) { return curLine.replace(/^\*\s+/, ""); })
                // Filter out the line that looks like: remotes/origin/HEAD -> origin/master
                .filter(function (curLine) { return !/^[\w/]+\/HEAD\s+->\s+[\w/]+$/.test(curLine); })
                // Get rid of leading and trailing whitespace
                .map(function (curLine) { return curLine.trim(); })
                // Create an array of GitBranch objects
                .map(function (longName) {
                var regexResults = GitBranch.strParserRegex.exec(longName);
                if (!regexResults) {
                    throw new Error("Error: Branch \"" + longName + "\" could not be parsed by enumerateGitRepoBranches().");
                }
                var remoteName = regexResults[2];
                var branchName = regexResults[3];
                // Note: Because the branch names are coming from Git (and not a
                // user) the branch names do not have to be validated as is done in
                // GitBranch.create(), which uses user data.
                return new GitBranch(repo, branchName, remoteName);
            })
                .value();
        });
    };
    Object.defineProperty(GitBranch.prototype, "repo", {
        get: function () {
            return this._repo;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GitBranch.prototype, "remoteName", {
        get: function () {
            return this._remoteName;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(GitBranch.prototype, "name", {
        get: function () {
            return this._name;
        },
        enumerable: true,
        configurable: true
    });
    GitBranch.prototype.toString = function () {
        var parts = __spread(arrayHelpers_1.insertIf(this.isRemote(), this._remoteName), [
            this._name
        ]);
        return parts.join("/");
    };
    GitBranch.prototype.isLocal = function () {
        return this.remoteName === undefined;
    };
    GitBranch.prototype.isRemote = function () {
        return !this.isLocal();
    };
    GitBranch.prototype.getTrackedBranch = function () {
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
        var _this = this;
        // TODO: Make sure this GitBranch instance is a local branch.
        return spawn_1.spawn("git", ["branch", "-vv"], { cwd: this._repo.directory.toString() }).closePromise
            .then(function (output) {
            var outputLines = output.split(os_1.EOL);
            // The last column for lines matching the specified local branch.
            var lastCols = _.reduce(outputLines, function (acc, curLine) {
                // A regex for matching lines output from "git branch -vv"
                // - an optional "*" (indicating the current branch)
                // - whitespace
                // - characters making up the local branch name (group 1)
                // - whitespace
                // - 7 characters making up the commit hash (group 2)
                // - whitespace
                // - the remainder of the line (group 3)
                var matches = /^[*]?\s+([\w/.-]+)\s+([0-9a-fA-F]{7})\s+(.*)$/.exec(curLine);
                if (matches && matches[1] === _this.name) {
                    acc.push(matches[3]);
                }
                return acc;
            }, []);
            if (lastCols.length === 0) {
                return BBPromise.resolve(undefined);
            }
            else if (lastCols.length > 1) {
                // We should never get more than 1 matching line.
                return BBPromise.reject(new Error("Unexpectedly got multiple results for " + _this.name + "."));
            }
            var lastCol = lastCols[0];
            // A regex to pull apart the items in the last column
            // - an optional part in square brackets (group 1)
            //   - "["
            //   - name of the remote branch (group 2)
            //   - an optional ":"
            //   - some optional text describing whether the branch is ahead and/or behind (group 3)
            //   - "]"
            // - optional whitespace
            // - commit message (group 4)
            var lastColRegex = /^(\[([\w/.-]+):?(.*)\])?\s*(.*)$/;
            var matches = lastColRegex.exec(lastCol);
            if (matches) {
                var remoteBranchStr = matches[2];
                if (remoteBranchStr === undefined) {
                    return BBPromise.resolve(undefined);
                }
                // A regex to pull apart the remote branch string
                // - A non-greedy bunch of stuff = remote name (group 1)
                // - "/"
                // - A bunch of stuff = remote branch name (group 2)
                var remoteBranchRegex = /^(.*?)\/(.*)$/;
                matches = remoteBranchRegex.exec(remoteBranchStr);
                if (matches) {
                    return GitBranch.create(_this.repo, matches[2], matches[1]);
                }
                else {
                    return BBPromise.reject(new Error("Could not parse remote branch string " + remoteBranchStr + "."));
                }
            }
            else {
                // The specified branch is not tracking a remote branch.
                return BBPromise.resolve(undefined);
            }
        });
    };
    // region Static Data Members
    // The regex needed to parse the long name strings printed by "git branch
    // -a".
    // If given remotes/remotename/branch/name
    // group 1: "remotes/remotename"  (not all that useful)
    // group 2: "remotename"          (the remote name)
    // group 3: "branch/name"         (the branch name)
    GitBranch.strParserRegex = /^(remotes\/([\w.-]+)\/)?(.*)$/;
    return GitBranch;
}());
exports.GitBranch = GitBranch;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9naXRCcmFuY2gudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHlCQUF1QjtBQUN2QixvQ0FBc0M7QUFDdEMsMEJBQTRCO0FBRTVCLGlDQUE4QjtBQUM5Qix5Q0FBc0M7QUFDdEMsK0NBQXdDO0FBQ3hDLGlEQUEwQztBQUcxQyxpRUFBaUU7QUFDakUsMENBQTBDO0FBQzFDLDJFQUEyRTtBQUMzRSwyRUFBMkU7QUFDM0Usd0JBQXdCO0FBRXhCO0lBd0hJLFlBQVk7SUFHWjs7Ozs7O09BTUc7SUFDSCxtQkFBb0IsSUFBYSxFQUFFLFVBQWtCLEVBQUUsVUFBbUI7UUFFdEUsSUFBSSxDQUFDLEtBQUssR0FBRyxJQUFJLENBQUM7UUFDbEIsSUFBSSxDQUFDLEtBQUssR0FBRyxVQUFVLENBQUM7UUFDeEIsSUFBSSxDQUFDLFdBQVcsR0FBRyxVQUFVLElBQUksU0FBUyxDQUFDO0lBQy9DLENBQUM7SUE1SEQsWUFBWTtJQUdaOzs7Ozs7T0FNRztJQUNXLDJCQUFpQixHQUEvQixVQUFnQyxVQUFrQjtRQUU5Qyw0QkFBNEI7UUFDNUIsK0NBQStDO1FBQy9DLDJCQUEyQjtRQUMzQixvRUFBb0U7UUFDcEUsbUJBQW1CO1FBQ25CLHFCQUFxQjtRQUNyQiw4QkFBOEI7UUFDOUIsRUFBRTtRQUNGLHNFQUFzRTtRQUN0RSxpREFBaUQ7UUFDakQseURBQXlEO1FBQ3pELHNEQUFzRDtRQUN0RCwyQ0FBMkM7UUFFM0MsT0FBTyxhQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsa0JBQWtCLEVBQUUsa0JBQWtCLEVBQUUsVUFBVSxDQUFDLENBQUM7YUFDeEUsWUFBWTthQUNaLElBQUksQ0FBQztZQUNGLDZDQUE2QztZQUM3QyxPQUFPLElBQUksQ0FBQztRQUNoQixDQUFDLENBQUM7YUFDRCxLQUFLLENBQUM7WUFDSCwrQ0FBK0M7WUFDL0MsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBR0Q7Ozs7Ozs7O09BUUc7SUFDVyxnQkFBTSxHQUFwQixVQUFxQixJQUFhLEVBQUUsVUFBa0IsRUFBRSxVQUFtQjtRQUV2RSxJQUFNLFNBQVMsR0FBRyxJQUFJLHFCQUFTLENBQVMsQ0FBQyxJQUFJLENBQUMsaUJBQWlCLENBQUMsQ0FBQyxDQUFDO1FBRWxFLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxVQUFVLENBQUM7YUFDbkMsSUFBSSxDQUFDLFVBQUMsaUJBQWlCO1lBQ3BCLElBQUksQ0FBQyxpQkFBaUIsRUFBRTtnQkFDcEIsTUFBTSxJQUFJLEtBQUssQ0FBQywrREFBNkQsVUFBVSxNQUFHLENBQUMsQ0FBQzthQUMvRjtZQUVELE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztRQUN2RCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHRDs7Ozs7T0FLRztJQUNXLGtDQUF3QixHQUF0QyxVQUF1QyxJQUFhO1FBRWhELE9BQU8sYUFBSyxDQUFDLEtBQUssRUFBRSxDQUFDLFFBQVEsRUFBRSxJQUFJLENBQUMsRUFBRSxFQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFDLENBQUMsQ0FBQyxZQUFZO2FBQ25GLElBQUksQ0FBQyxVQUFDLE1BQU07WUFDVCxPQUFPLENBQUMsQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDLEtBQUssQ0FBQyx5QkFBUyxDQUFDLENBQUM7Z0JBQ3ZDLDZDQUE2QztpQkFDNUMsR0FBRyxDQUFDLFVBQUMsT0FBTyxJQUFLLE9BQUEsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFkLENBQWMsQ0FBQztnQkFDakMsNERBQTREO2lCQUMzRCxHQUFHLENBQUMsVUFBQyxPQUFPLElBQUssT0FBQSxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsRUFBRSxFQUFFLENBQUMsRUFBN0IsQ0FBNkIsQ0FBQztnQkFDaEQsNEVBQTRFO2lCQUMzRSxNQUFNLENBQUMsVUFBQyxPQUFPLElBQUssT0FBQSxDQUFDLDhCQUE4QixDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsRUFBN0MsQ0FBNkMsQ0FBQztnQkFDbkUsNkNBQTZDO2lCQUM1QyxHQUFHLENBQUMsVUFBQyxPQUFPLElBQUssT0FBQSxPQUFPLENBQUMsSUFBSSxFQUFFLEVBQWQsQ0FBYyxDQUFDO2dCQUNqQyx1Q0FBdUM7aUJBQ3RDLEdBQUcsQ0FBQyxVQUFDLFFBQVE7Z0JBQ1YsSUFBTSxZQUFZLEdBQUcsU0FBUyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7Z0JBQzdELElBQUksQ0FBQyxZQUFZLEVBQ2pCO29CQUNJLE1BQU0sSUFBSSxLQUFLLENBQUMscUJBQWtCLFFBQVEsMERBQXNELENBQUMsQ0FBQztpQkFDckc7Z0JBRUQsSUFBTSxVQUFVLEdBQUcsWUFBWSxDQUFDLENBQUMsQ0FBQyxDQUFDO2dCQUNuQyxJQUFNLFVBQVUsR0FBRyxZQUFZLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBRW5DLGdFQUFnRTtnQkFDaEUsbUVBQW1FO2dCQUNuRSw0Q0FBNEM7Z0JBRTVDLE9BQU8sSUFBSSxTQUFTLENBQUMsSUFBSSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsQ0FBQztZQUN2RCxDQUFDLENBQUM7aUJBQ0QsS0FBSyxFQUFFLENBQUM7UUFFYixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUF5QkQsc0JBQVcsMkJBQUk7YUFBZjtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQUdELHNCQUFXLGlDQUFVO2FBQXJCO1lBRUksT0FBTyxJQUFJLENBQUMsV0FBVyxDQUFDO1FBQzVCLENBQUM7OztPQUFBO0lBR0Qsc0JBQVcsMkJBQUk7YUFBZjtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQUdNLDRCQUFRLEdBQWY7UUFFSSxJQUFNLEtBQUssWUFDSix1QkFBUSxDQUFTLElBQUksQ0FBQyxRQUFRLEVBQUUsRUFBRSxJQUFJLENBQUMsV0FBWSxDQUFDO1lBQ3ZELElBQUksQ0FBQyxLQUFLO1VBQ2IsQ0FBQztRQUNGLE9BQU8sS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztJQUMzQixDQUFDO0lBR00sMkJBQU8sR0FBZDtRQUVJLE9BQU8sSUFBSSxDQUFDLFVBQVUsS0FBSyxTQUFTLENBQUM7SUFDekMsQ0FBQztJQUdNLDRCQUFRLEdBQWY7UUFFSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO0lBQzNCLENBQUM7SUFHTSxvQ0FBZ0IsR0FBdkI7UUFFSSxFQUFFO1FBQ0Ysa0JBQWtCO1FBQ2xCLG1CQUFtQjtRQUNuQixzSUFBc0k7UUFDdEksMkdBQTJHO1FBQzNHLHNKQUFzSjtRQUN0Siw0SkFBNEo7UUFDNUosNEZBQTRGO1FBQzVGLHdGQUF3RjtRQUN4RiwrR0FBK0c7UUFDL0csbUlBQW1JO1FBQ25JLHNIQUFzSDtRQUN0SCxzSUFBc0k7UUFDdEksbUlBQW1JO1FBQ25JLGdJQUFnSTtRQUNoSSwwSUFBMEk7UUFDMUkseUdBQXlHO1FBQ3pHLG9KQUFvSjtRQUNwSixFQUFFO1FBcEJOLGlCQW1HQztRQTdFRyw2REFBNkQ7UUFFN0QsT0FBTyxhQUFLLENBQUMsS0FBSyxFQUFFLENBQUMsUUFBUSxFQUFFLEtBQUssQ0FBQyxFQUFFLEVBQUMsR0FBRyxFQUFFLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxDQUFDLFFBQVEsRUFBRSxFQUFDLENBQUMsQ0FBQyxZQUFZO2FBQzFGLElBQUksQ0FBQyxVQUFDLE1BQU07WUFDVCxJQUFNLFdBQVcsR0FBRyxNQUFNLENBQUMsS0FBSyxDQUFDLFFBQUcsQ0FBQyxDQUFDO1lBRXRDLGlFQUFpRTtZQUNqRSxJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUNyQixXQUFXLEVBQ1gsVUFBQyxHQUFHLEVBQUUsT0FBTztnQkFDVCwwREFBMEQ7Z0JBQzFELG9EQUFvRDtnQkFDcEQsZUFBZTtnQkFDZix5REFBeUQ7Z0JBQ3pELGVBQWU7Z0JBQ2YscURBQXFEO2dCQUNyRCxlQUFlO2dCQUNmLHdDQUF3QztnQkFDeEMsSUFBTSxPQUFPLEdBQUcsK0NBQStDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxDQUFDO2dCQUM5RSxJQUFJLE9BQU8sSUFBSSxPQUFPLENBQUMsQ0FBQyxDQUFDLEtBQUssS0FBSSxDQUFDLElBQUksRUFBRTtvQkFDckMsR0FBRyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztpQkFDeEI7Z0JBQ0QsT0FBTyxHQUFHLENBQUM7WUFDZixDQUFDLEVBQ0QsRUFBRSxDQUNMLENBQUM7WUFFRixJQUFJLFFBQVEsQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO2dCQUN2QixPQUFPLFNBQVMsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7YUFDdkM7aUJBQ0ksSUFBSSxRQUFRLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnQkFDMUIsaURBQWlEO2dCQUNqRCxPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMkNBQXlDLEtBQUksQ0FBQyxJQUFJLE1BQUcsQ0FBQyxDQUFDLENBQUM7YUFDN0Y7WUFFRCxJQUFNLE9BQU8sR0FBRyxRQUFRLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFFNUIscURBQXFEO1lBQ3JELGtEQUFrRDtZQUNsRCxVQUFVO1lBQ1YsMENBQTBDO1lBQzFDLHNCQUFzQjtZQUN0Qix3RkFBd0Y7WUFDeEYsVUFBVTtZQUNWLHdCQUF3QjtZQUN4Qiw2QkFBNkI7WUFDN0IsSUFBTSxZQUFZLEdBQUcsa0NBQWtDLENBQUM7WUFDeEQsSUFBSSxPQUFPLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUV6QyxJQUFJLE9BQU8sRUFBRTtnQkFDVCxJQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUM7Z0JBQ25DLElBQUksZUFBZSxLQUFLLFNBQVMsRUFBRTtvQkFDL0IsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2lCQUN2QztnQkFFRCxpREFBaUQ7Z0JBQ2pELHdEQUF3RDtnQkFDeEQsUUFBUTtnQkFDUixvREFBb0Q7Z0JBQ3BELElBQU0saUJBQWlCLEdBQUcsZUFBZSxDQUFDO2dCQUMxQyxPQUFPLEdBQUcsaUJBQWlCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxDQUFDO2dCQUNsRCxJQUFJLE9BQU8sRUFBRTtvQkFDVCxPQUFPLFNBQVMsQ0FBQyxNQUFNLENBQUMsS0FBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQyxDQUFDLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQzlEO3FCQUNJO29CQUNELE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQywwQ0FBd0MsZUFBZSxNQUFHLENBQUMsQ0FBQyxDQUFDO2lCQUNsRzthQUVKO2lCQUNJO2dCQUNELHdEQUF3RDtnQkFDeEQsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDO2FBQ3ZDO1FBRUwsQ0FBQyxDQUFDLENBQUM7SUFHUCxDQUFDO0lBblJELDZCQUE2QjtJQUU3Qix5RUFBeUU7SUFDekUsT0FBTztJQUNQLDBDQUEwQztJQUMxQyx1REFBdUQ7SUFDdkQsbURBQW1EO0lBQ25ELG1EQUFtRDtJQUNwQyx3QkFBYyxHQUFXLCtCQUErQixDQUFDO0lBNlE1RSxnQkFBQztDQXZSRCxBQXVSQyxJQUFBO0FBdlJZLDhCQUFTIiwiZmlsZSI6ImdpdEJyYW5jaC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RU9MfSBmcm9tIFwib3NcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtHaXRSZXBvfSBmcm9tIFwiLi9naXRSZXBvXCI7XG5pbXBvcnQge3NwYXdufSBmcm9tIFwiLi9zcGF3blwiO1xuaW1wb3J0IHtWYWxpZGF0b3J9IGZyb20gXCIuL3ZhbGlkYXRvclwiO1xuaW1wb3J0IHtpbnNlcnRJZn0gZnJvbSBcIi4vYXJyYXlIZWxwZXJzXCI7XG5pbXBvcnQge3BpTmV3bGluZX0gZnJvbSBcIi4vcmVnZXhwSGVscGVyc1wiO1xuXG5cbi8vIFRPRE86IFRvIGdldCB0aGUgYnJhbmNoZXMgdGhhdCBhcmUgcG9pbnRpbmcgYXQgYSBnaXZlbiBjb21taXQ6XG4vLyBnaXQgc2hvdy1yZWYgfCBncmVwIC1pIFwiNzBlNDIzZTY1NGYzYTNcIlxuLy8gVGhpcyB3b3VsZCBiZSB1c2VmdWwgd2hlbiBjcmVhdGluZyBhIFNvdXJjZVRyZWUgY3VzdG9tIGFjdGlvbiB0aGF0IHdvdWxkXG4vLyBhbGxvdyB0aGUgdXNlciB0byByaWdodCBjbGljayBvbiBhIGNvbW1pdCBhbmQgY29weSB0aGUgYnJhbmNoIG5hbWVzIHRoYXRcbi8vIHJlZmVyIHRvIHRoYXQgY29tbWl0LlxuXG5leHBvcnQgY2xhc3MgR2l0QnJhbmNoXG57XG4gICAgLy8gcmVnaW9uIFN0YXRpYyBEYXRhIE1lbWJlcnNcblxuICAgIC8vIFRoZSByZWdleCBuZWVkZWQgdG8gcGFyc2UgdGhlIGxvbmcgbmFtZSBzdHJpbmdzIHByaW50ZWQgYnkgXCJnaXQgYnJhbmNoXG4gICAgLy8gLWFcIi5cbiAgICAvLyBJZiBnaXZlbiByZW1vdGVzL3JlbW90ZW5hbWUvYnJhbmNoL25hbWVcbiAgICAvLyBncm91cCAxOiBcInJlbW90ZXMvcmVtb3RlbmFtZVwiICAobm90IGFsbCB0aGF0IHVzZWZ1bClcbiAgICAvLyBncm91cCAyOiBcInJlbW90ZW5hbWVcIiAgICAgICAgICAodGhlIHJlbW90ZSBuYW1lKVxuICAgIC8vIGdyb3VwIDM6IFwiYnJhbmNoL25hbWVcIiAgICAgICAgICh0aGUgYnJhbmNoIG5hbWUpXG4gICAgcHJpdmF0ZSBzdGF0aWMgc3RyUGFyc2VyUmVnZXg6IFJlZ0V4cCA9IC9eKHJlbW90ZXNcXC8oW1xcdy4tXSspXFwvKT8oLiopJC87XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIC8qKlxuICAgICAqIFZhbGlkYXRlcyB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lXG4gICAgICogQG1ldGhvZFxuICAgICAqIEBwYXJhbSBicmFuY2hOYW1lIC0gVGhlIG5hbWUgdG8gdmFsaWRhdGVcbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgYSBib29sZWFuIHRoYXQgd2lsbCBpbmRpY2F0ZSB3aGV0aGVyIGJyYW5jaE5hbWUgaXNcbiAgICAgKiB2YWxpZC4gIFRoaXMgcHJvbWlzZSB3aWxsIG5ldmVyIHJlamVjdC5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGlzVmFsaWRCcmFuY2hOYW1lKGJyYW5jaE5hbWU6IHN0cmluZyk6IFByb21pc2U8Ym9vbGVhbj5cbiAgICB7XG4gICAgICAgIC8vIEEgR2l0IGJyYW5jaCBuYW1lIGNhbm5vdDpcbiAgICAgICAgLy8gLSBIYXZlIGEgcGF0aCBjb21wb25lbnQgdGhhdCBiZWdpbnMgd2l0aCBcIi5cIlxuICAgICAgICAvLyAtIEhhdmUgYSBkb3VibGUgZG90IFwiLi5cIlxuICAgICAgICAvLyAtIEhhdmUgYW4gQVNDSUkgY29udHJvbCBjaGFyYWN0ZXIsIFwiflwiLCBcIl5cIiwgXCI6XCIgb3IgU1AsIGFueXdoZXJlLlxuICAgICAgICAvLyAtIEVuZCB3aXRoIGEgXCIvXCJcbiAgICAgICAgLy8gLSBFbmQgd2l0aCBcIi5sb2NrXCJcbiAgICAgICAgLy8gLSBDb250YWluIGEgXCJcXFwiIChiYWNrc2xhc2gpXG4gICAgICAgIC8vXG4gICAgICAgIC8vIFdlIGNvdWxkIGNoZWNrIGZvciB0aGUgYWJvdmUgb3Vyc2VsdmVzLCBvciBqdXN0IGFzayBHaXQgdG8gdmFsaWRhdGVcbiAgICAgICAgLy8gYnJhbmNoTmFtZSB1c2luZyB0aGUgY2hlY2stcmVmLWZvcm1hdCBjb21tYW5kLlxuICAgICAgICAvLyBUaGUgZm9sbG93aW5nIGNvbW1hbmQgcmV0dXJucyAwIGlmIGl0IGlzIGEgdmFsaWQgbmFtZS5cbiAgICAgICAgLy8gZ2l0IGNoZWNrLXJlZi1mb3JtYXQgLS1hbGxvdy1vbmVsZXZlbCBcImZvb2JhclxcbG9ja1wiXG4gICAgICAgIC8vIChyZXR1cm5zIDEgYmVjYXVzZSBiYWNrc2xhc2ggaXMgaW52YWxpZClcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wiY2hlY2stcmVmLWZvcm1hdFwiLCBcIi0tYWxsb3ctb25lbGV2ZWxcIiwgYnJhbmNoTmFtZV0pXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gRXhpdCBjb2RlID09PSAwIG1lYW5zIGJyYW5jaE5hbWUgaXMgdmFsaWQuXG4gICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgfSlcbiAgICAgICAgLmNhdGNoKCgpID0+IHtcbiAgICAgICAgICAgIC8vIEV4aXQgY29kZSAhPT0gMCBtZWFucyBicmFuY2hOYW1lIGlzIGludmFsaWQuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIEdpdEJyYW5jaFxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIGFzc29jaWF0ZWQgd2l0aCB0aGUgYnJhbmNoXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgYnJhbmNoXG4gICAgICogQHBhcmFtIHJlbW90ZU5hbWUgLSBUaGUgcmVtb3RlIG5hbWUgKGlmIGEgcmVtb3RlIGJyYW5jaClcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgR2l0QnJhbmNoIGluc3RhbmNlLiAgVGhpcyBQcm9taXNlXG4gICAgICogd2lsbCBiZSByZXNvbHZlZCB3aXRoIHVuZGVmaW5lZCBpZiB0aGUgc3BlY2lmaWVkIGJyYW5jaCBuYW1lIGlzIGludmFsaWQuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUocmVwbzogR2l0UmVwbywgYnJhbmNoTmFtZTogc3RyaW5nLCByZW1vdGVOYW1lPzogc3RyaW5nKTogUHJvbWlzZTxHaXRCcmFuY2g+XG4gICAge1xuICAgICAgICBjb25zdCB2YWxpZGF0b3IgPSBuZXcgVmFsaWRhdG9yPHN0cmluZz4oW3RoaXMuaXNWYWxpZEJyYW5jaE5hbWVdKTtcblxuICAgICAgICByZXR1cm4gdmFsaWRhdG9yLmlzVmFsaWQoYnJhbmNoTmFtZSlcbiAgICAgICAgLnRoZW4oKGJyYW5jaE5hbWVJc1ZhbGlkKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWJyYW5jaE5hbWVJc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDYW5ub3QgY3JlYXRlIEdpdEJyYW5jaCBpbnN0YW5jZSBmcm9tIGludmFsaWQgYnJhbmNoIG5hbWUgJHticmFuY2hOYW1lfS5gKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIG5ldyBHaXRCcmFuY2gocmVwbywgYnJhbmNoTmFtZSwgcmVtb3RlTmFtZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRW51bWVyYXRlcyB0aGUgYnJhbmNoZXMgdGhhdCBleGlzdCB3aXRoaW4gdGhlIHNwZWNpZmllZCByZXBvLlxuICAgICAqIEBtZXRob2RcbiAgICAgKiBAcGFyYW0gcmVwbyAtIFRoZSByZXBvIGluIHdoaWNoIHRoZSBicmFuY2hlcyBhcmUgdG8gYmUgZW51bWVyYXRlZFxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhbiBhcnJheSBvZiBicmFuY2hlcyBpbiB0aGUgc3BlY2lmaWVkIHJlcG9cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGVudW1lcmF0ZUdpdFJlcG9CcmFuY2hlcyhyZXBvOiBHaXRSZXBvKTogUHJvbWlzZTxBcnJheTxHaXRCcmFuY2g+PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImJyYW5jaFwiLCBcIi1hXCJdLCB7Y3dkOiByZXBvLmRpcmVjdG9yeS50b1N0cmluZygpfSkuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBfLmNoYWluKHN0ZG91dC5zcGxpdChwaU5ld2xpbmUpKVxuICAgICAgICAgICAgLy8gR2V0IHJpZCBvZiBsZWFkaW5nIGFuZCB0cmFpbGluZyB3aGl0ZXNwYWNlXG4gICAgICAgICAgICAubWFwKChjdXJMaW5lKSA9PiBjdXJMaW5lLnRyaW0oKSlcbiAgICAgICAgICAgIC8vIFJlcGxhY2UgdGhlIFwiKiBcIiB0aGF0IHByZWNlZGVzIHRoZSBjdXJyZW50IHdvcmtpbmcgYnJhbmNoXG4gICAgICAgICAgICAubWFwKChjdXJMaW5lKSA9PiBjdXJMaW5lLnJlcGxhY2UoL15cXCpcXHMrLywgXCJcIikpXG4gICAgICAgICAgICAvLyBGaWx0ZXIgb3V0IHRoZSBsaW5lIHRoYXQgbG9va3MgbGlrZTogcmVtb3Rlcy9vcmlnaW4vSEVBRCAtPiBvcmlnaW4vbWFzdGVyXG4gICAgICAgICAgICAuZmlsdGVyKChjdXJMaW5lKSA9PiAhL15bXFx3L10rXFwvSEVBRFxccystPlxccytbXFx3L10rJC8udGVzdChjdXJMaW5lKSlcbiAgICAgICAgICAgIC8vIEdldCByaWQgb2YgbGVhZGluZyBhbmQgdHJhaWxpbmcgd2hpdGVzcGFjZVxuICAgICAgICAgICAgLm1hcCgoY3VyTGluZSkgPT4gY3VyTGluZS50cmltKCkpXG4gICAgICAgICAgICAvLyBDcmVhdGUgYW4gYXJyYXkgb2YgR2l0QnJhbmNoIG9iamVjdHNcbiAgICAgICAgICAgIC5tYXAoKGxvbmdOYW1lKTogR2l0QnJhbmNoID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCByZWdleFJlc3VsdHMgPSBHaXRCcmFuY2guc3RyUGFyc2VyUmVnZXguZXhlYyhsb25nTmFtZSk7XG4gICAgICAgICAgICAgICAgaWYgKCFyZWdleFJlc3VsdHMpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYEVycm9yOiBCcmFuY2ggXCIke2xvbmdOYW1lfVwiIGNvdWxkIG5vdCBiZSBwYXJzZWQgYnkgZW51bWVyYXRlR2l0UmVwb0JyYW5jaGVzKCkuYCk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3RlTmFtZSA9IHJlZ2V4UmVzdWx0c1syXTtcbiAgICAgICAgICAgICAgICBjb25zdCBicmFuY2hOYW1lID0gcmVnZXhSZXN1bHRzWzNdO1xuXG4gICAgICAgICAgICAgICAgLy8gTm90ZTogQmVjYXVzZSB0aGUgYnJhbmNoIG5hbWVzIGFyZSBjb21pbmcgZnJvbSBHaXQgKGFuZCBub3QgYVxuICAgICAgICAgICAgICAgIC8vIHVzZXIpIHRoZSBicmFuY2ggbmFtZXMgZG8gbm90IGhhdmUgdG8gYmUgdmFsaWRhdGVkIGFzIGlzIGRvbmUgaW5cbiAgICAgICAgICAgICAgICAvLyBHaXRCcmFuY2guY3JlYXRlKCksIHdoaWNoIHVzZXMgdXNlciBkYXRhLlxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBHaXRCcmFuY2gocmVwbywgYnJhbmNoTmFtZSwgcmVtb3RlTmFtZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnZhbHVlKCk7XG5cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcmVwbzogR2l0UmVwbztcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9yZW1vdGVOYW1lOiBzdHJpbmcgfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfbmFtZTogc3RyaW5nO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEdpdEJyYW5jaC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSByZXBvIC0gVGhlIHJlcG8gdGhlIGJyYW5jaCBzaG91bGQgYmUgYXNzb2NpYXRlZCB3aXRoXG4gICAgICogQHBhcmFtIGJyYW5jaE5hbWUgLSBUaGUgYnJhbmNoIG5hbWVcbiAgICAgKiBAcGFyYW0gcmVtb3RlTmFtZSAtIFRoZSByZW1vdGUgbmFtZSAoaWYgdGhlIGJyYW5jaCBpcyBhIHJlbW90ZSBicmFuY2gpXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihyZXBvOiBHaXRSZXBvLCBicmFuY2hOYW1lOiBzdHJpbmcsIHJlbW90ZU5hbWU/OiBzdHJpbmcpXG4gICAge1xuICAgICAgICB0aGlzLl9yZXBvID0gcmVwbztcbiAgICAgICAgdGhpcy5fbmFtZSA9IGJyYW5jaE5hbWU7XG4gICAgICAgIHRoaXMuX3JlbW90ZU5hbWUgPSByZW1vdGVOYW1lIHx8IHVuZGVmaW5lZDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgcmVwbygpOiBHaXRSZXBvXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmVwbztcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgcmVtb3RlTmFtZSgpOiBzdHJpbmcgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZW1vdGVOYW1lO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBuYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX25hbWU7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICBjb25zdCBwYXJ0czogQXJyYXk8c3RyaW5nPiA9IFtcbiAgICAgICAgICAgIC4uLmluc2VydElmPHN0cmluZz4odGhpcy5pc1JlbW90ZSgpLCB0aGlzLl9yZW1vdGVOYW1lISksXG4gICAgICAgICAgICB0aGlzLl9uYW1lXG4gICAgICAgIF07XG4gICAgICAgIHJldHVybiBwYXJ0cy5qb2luKFwiL1wiKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBpc0xvY2FsKCk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW90ZU5hbWUgPT09IHVuZGVmaW5lZDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBpc1JlbW90ZSgpOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gIXRoaXMuaXNMb2NhbCgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldFRyYWNrZWRCcmFuY2goKTogUHJvbWlzZTxHaXRCcmFuY2ggfCB1bmRlZmluZWQ+IHtcblxuICAgICAgICAvL1xuICAgICAgICAvLyBBIGZ1bGwgZXhhbXBsZTpcbiAgICAgICAgLy8gJCBnaXQgYnJhbmNoIC12dlxuICAgICAgICAvLyAgIGJ1Zy9wb3VjaGRiX21lbW9yeV9sZWFrcyAgICAgICAgICAgICAgICAgICBjNDZiMzEyIFtvcmlnaW4vYnVnL3BvdWNoZGJfbWVtb3J5X2xlYWtzOiBiZWhpbmQgODNdIGZpeCB1c2VyRGlyZWN0b3J5IG1pc25hbWluZyBpc3N1ZVxuICAgICAgICAvLyAgIGRldmVsb3AgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICA3ZDNmYWZmIFtvcmlnaW4vZGV2ZWxvcF0gTWVyZ2UgYnJhbmNoICdtYXN0ZXInIGludG8gZGV2ZWxvcFxuICAgICAgICAvLyAgIGZlYXR1cmUvMTYxX2NpcF91cmxfc3VwcG9ydCAgICAgICAgICAgICAgICAyMmQ0OWFiIFtvcmlnaW4vZmVhdHVyZS8xNjFfY2lwX3VybF9zdXBwb3J0XSBSZXBsYWNlZCB2YWxpZGF0ZUlQKCkgd2l0aCBpc0lQKCkuICBSZW1vdmVkIHZhbGlkYXRlSVAoKS5cbiAgICAgICAgLy8gICBmZWF0dXJlLzE5M19wcm9kdWN0aW9uX291dGFnZXMvY29kZSAgICAgICAgMjRmZmQ2ZCBbb3JpZ2luL2ZlYXR1cmUvMTkzX3Byb2R1Y3Rpb25fb3V0YWdlcy9jb2RlXSBDcmVhdGVkIHNjcmlwdCBmb3IgcHJpbnRpbmcgdXNlciBkaXJlY3RvcnkgaW5mb3JtYXRpb24uXG4gICAgICAgIC8vICAgZmVhdHVyZS8xOTNfcHJvZHVjdGlvbl9vdXRhZ2VzL2V4cGVyaW1lbnQxIDg0N2IxNzkgTWFrZSBoZWFsdGggZW5kcG9pbnQgdGhyb3cgYW4gZXJyb3IuXG4gICAgICAgIC8vICAgZmVhdHVyZS8xOTNfcHJvZHVjdGlvbl9vdXRhZ2VzL2V4cGVyaW1lbnQyIGNhZjAxM2UgVHJpdmlhbCBjaGFuZ2UgZm9yIEF6dXJlIGRlcGxveS5cbiAgICAgICAgLy8gICBmZWF0dXJlLzE5M19wcm9kdWN0aW9uX291dGFnZXMvZXhwZXJpbWVudDMgNmExN2ExMyBBZGRlZCBzb21lIGV4cGVyaW1lbnRhbCByb3V0ZXMgdG8gdmVyaWZ5IGxvZ2dpbmcgd29ya3MuXG4gICAgICAgIC8vICAgZmVhdHVyZS8xOTNfcHJvZHVjdGlvbl9vdXRhZ2VzL2t3cCAgICAgICAgIDkyMGEzOGIgW2t3cC9mZWF0dXJlLzE5M19wcm9kdWN0aW9uX291dGFnZXMva3dwOiBhaGVhZCAxMV0gSW1wcm92ZWQganNkb2Mgc2xpZ2h0bHkuXG4gICAgICAgIC8vICAgZmVhdHVyZS90YWdzICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGY4NDM3OTIgW29yaWdpbi9mZWF0dXJlL3RhZ3NdIE1lcmdlIGJyYW5jaCAnZGV2ZWxvcCcgaW50byBmZWF0dXJlL3RhZ3NcbiAgICAgICAgLy8gICBtYXN0ZXIgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYmM4YjhkOSBbb3JpZ2luL21hc3RlcjogYmVoaW5kIDEyM10gTWVyZ2UgYnJhbmNoICdmZWF0dXJlL3VybGZhdm9yaXRlcycgaW50byAnZGV2ZWxvcCdcbiAgICAgICAgLy8gICB0b2RvL2NvbnZlcnRfZnVuY190ZXN0c190b19qYXNtaW5lICAgICAgICAgYWRjNzM1MSBbb3JpZ2luL3RvZG8vY29udmVydF9mdW5jX3Rlc3RzX3RvX2phc21pbmVdIEdhdmUgYW5vbnltb3VzIGZ1bmN0aW9ucyBuYW1lcy5cbiAgICAgICAgLy8gICB0b2RvL25ld190b2FkX3ZlciAgICAgICAgICAgICAgICAgICAgICAgICAgYjUxMDY1YSBbb3JpZ2luL3RvZG8vbmV3X3RvYWRfdmVyXSBNZXJnZSBicmFuY2ggJ2RldmVsb3AnIGludG8gdG9kby9uZXdfdG9hZF92ZXJcbiAgICAgICAgLy8gICB0b2RvL3JlbW92ZV93aGl0ZWxpc3RzICAgICAgICAgICAgICAgICAgICAgMjEyYjA1YiBbb3JpZ2luL3RvZG8vcmVtb3ZlX3doaXRlbGlzdHNdIE1lcmdlIGJyYW5jaCAnZGV2ZWxvcCcgaW50byB0b2RvL3JlbW92ZV93aGl0ZWxpc3RzXG4gICAgICAgIC8vICogdG9kby90c19zdXBwb3J0ICAgICAgICAgICAgICAgICAgICAgICAgICAgIGQ1Njc0Y2QgW29yaWdpbi90b2RvL3RzX3N1cHBvcnRdIFJlbW92ZWQgdW5uZWVkZWQgaW1wb3J0LlxuICAgICAgICAvLyAgIHRvZG8vdXBkYXRlX29wZW5zc29fbW9jayAgICAgICAgICAgICAgICAgICBiMDBjMTM0IFtrd3AvdG9kby91cGRhdGVfb3BlbnNzb19tb2NrXSBVcGRhdGVkIG9wZW5zc28tbW9jayB0byBsYXRlc3QgdmVyc2lvbiB0aGF0IGhhcyBzaGViYW5nIGxpbmUuXG4gICAgICAgIC8vXG5cbiAgICAgICAgLy8gVE9ETzogTWFrZSBzdXJlIHRoaXMgR2l0QnJhbmNoIGluc3RhbmNlIGlzIGEgbG9jYWwgYnJhbmNoLlxuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJicmFuY2hcIiwgXCItdnZcIl0sIHtjd2Q6IHRoaXMuX3JlcG8uZGlyZWN0b3J5LnRvU3RyaW5nKCl9KS5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKG91dHB1dCkgPT4ge1xuICAgICAgICAgICAgY29uc3Qgb3V0cHV0TGluZXMgPSBvdXRwdXQuc3BsaXQoRU9MKTtcblxuICAgICAgICAgICAgLy8gVGhlIGxhc3QgY29sdW1uIGZvciBsaW5lcyBtYXRjaGluZyB0aGUgc3BlY2lmaWVkIGxvY2FsIGJyYW5jaC5cbiAgICAgICAgICAgIGNvbnN0IGxhc3RDb2xzID0gXy5yZWR1Y2U8c3RyaW5nLCBBcnJheTxzdHJpbmc+PihcbiAgICAgICAgICAgICAgICBvdXRwdXRMaW5lcyxcbiAgICAgICAgICAgICAgICAoYWNjLCBjdXJMaW5lKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIEEgcmVnZXggZm9yIG1hdGNoaW5nIGxpbmVzIG91dHB1dCBmcm9tIFwiZ2l0IGJyYW5jaCAtdnZcIlxuICAgICAgICAgICAgICAgICAgICAvLyAtIGFuIG9wdGlvbmFsIFwiKlwiIChpbmRpY2F0aW5nIHRoZSBjdXJyZW50IGJyYW5jaClcbiAgICAgICAgICAgICAgICAgICAgLy8gLSB3aGl0ZXNwYWNlXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gY2hhcmFjdGVycyBtYWtpbmcgdXAgdGhlIGxvY2FsIGJyYW5jaCBuYW1lIChncm91cCAxKVxuICAgICAgICAgICAgICAgICAgICAvLyAtIHdoaXRlc3BhY2VcbiAgICAgICAgICAgICAgICAgICAgLy8gLSA3IGNoYXJhY3RlcnMgbWFraW5nIHVwIHRoZSBjb21taXQgaGFzaCAoZ3JvdXAgMilcbiAgICAgICAgICAgICAgICAgICAgLy8gLSB3aGl0ZXNwYWNlXG4gICAgICAgICAgICAgICAgICAgIC8vIC0gdGhlIHJlbWFpbmRlciBvZiB0aGUgbGluZSAoZ3JvdXAgMylcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgbWF0Y2hlcyA9IC9eWypdP1xccysoW1xcdy8uLV0rKVxccysoWzAtOWEtZkEtRl17N30pXFxzKyguKikkLy5leGVjKGN1ckxpbmUpO1xuICAgICAgICAgICAgICAgICAgICBpZiAobWF0Y2hlcyAmJiBtYXRjaGVzWzFdID09PSB0aGlzLm5hbWUpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjYy5wdXNoKG1hdGNoZXNbM10pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBhY2M7XG4gICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBbXVxuICAgICAgICAgICAgKTtcblxuICAgICAgICAgICAgaWYgKGxhc3RDb2xzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSBpZiAobGFzdENvbHMubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgICAgIC8vIFdlIHNob3VsZCBuZXZlciBnZXQgbW9yZSB0aGFuIDEgbWF0Y2hpbmcgbGluZS5cbiAgICAgICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYFVuZXhwZWN0ZWRseSBnb3QgbXVsdGlwbGUgcmVzdWx0cyBmb3IgJHt0aGlzLm5hbWV9LmApKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgbGFzdENvbCA9IGxhc3RDb2xzWzBdO1xuXG4gICAgICAgICAgICAvLyBBIHJlZ2V4IHRvIHB1bGwgYXBhcnQgdGhlIGl0ZW1zIGluIHRoZSBsYXN0IGNvbHVtblxuICAgICAgICAgICAgLy8gLSBhbiBvcHRpb25hbCBwYXJ0IGluIHNxdWFyZSBicmFja2V0cyAoZ3JvdXAgMSlcbiAgICAgICAgICAgIC8vICAgLSBcIltcIlxuICAgICAgICAgICAgLy8gICAtIG5hbWUgb2YgdGhlIHJlbW90ZSBicmFuY2ggKGdyb3VwIDIpXG4gICAgICAgICAgICAvLyAgIC0gYW4gb3B0aW9uYWwgXCI6XCJcbiAgICAgICAgICAgIC8vICAgLSBzb21lIG9wdGlvbmFsIHRleHQgZGVzY3JpYmluZyB3aGV0aGVyIHRoZSBicmFuY2ggaXMgYWhlYWQgYW5kL29yIGJlaGluZCAoZ3JvdXAgMylcbiAgICAgICAgICAgIC8vICAgLSBcIl1cIlxuICAgICAgICAgICAgLy8gLSBvcHRpb25hbCB3aGl0ZXNwYWNlXG4gICAgICAgICAgICAvLyAtIGNvbW1pdCBtZXNzYWdlIChncm91cCA0KVxuICAgICAgICAgICAgY29uc3QgbGFzdENvbFJlZ2V4ID0gL14oXFxbKFtcXHcvLi1dKyk6PyguKilcXF0pP1xccyooLiopJC87XG4gICAgICAgICAgICBsZXQgbWF0Y2hlcyA9IGxhc3RDb2xSZWdleC5leGVjKGxhc3RDb2wpO1xuXG4gICAgICAgICAgICBpZiAobWF0Y2hlcykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbW90ZUJyYW5jaFN0ciA9IG1hdGNoZXNbMl07XG4gICAgICAgICAgICAgICAgaWYgKHJlbW90ZUJyYW5jaFN0ciA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIC8vIEEgcmVnZXggdG8gcHVsbCBhcGFydCB0aGUgcmVtb3RlIGJyYW5jaCBzdHJpbmdcbiAgICAgICAgICAgICAgICAvLyAtIEEgbm9uLWdyZWVkeSBidW5jaCBvZiBzdHVmZiA9IHJlbW90ZSBuYW1lIChncm91cCAxKVxuICAgICAgICAgICAgICAgIC8vIC0gXCIvXCJcbiAgICAgICAgICAgICAgICAvLyAtIEEgYnVuY2ggb2Ygc3R1ZmYgPSByZW1vdGUgYnJhbmNoIG5hbWUgKGdyb3VwIDIpXG4gICAgICAgICAgICAgICAgY29uc3QgcmVtb3RlQnJhbmNoUmVnZXggPSAvXiguKj8pXFwvKC4qKSQvO1xuICAgICAgICAgICAgICAgIG1hdGNoZXMgPSByZW1vdGVCcmFuY2hSZWdleC5leGVjKHJlbW90ZUJyYW5jaFN0cik7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIEdpdEJyYW5jaC5jcmVhdGUodGhpcy5yZXBvLCBtYXRjaGVzWzJdLCBtYXRjaGVzWzFdKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgQ291bGQgbm90IHBhcnNlIHJlbW90ZSBicmFuY2ggc3RyaW5nICR7cmVtb3RlQnJhbmNoU3RyfS5gKSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgc3BlY2lmaWVkIGJyYW5jaCBpcyBub3QgdHJhY2tpbmcgYSByZW1vdGUgYnJhbmNoLlxuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgIH0pO1xuXG5cbiAgICB9XG5cbn1cbiJdfQ==
