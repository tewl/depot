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
var arrayHelpers_1 = require("./arrayHelpers");
var directory_1 = require("./directory");
var file_1 = require("./file");
var spawn_1 = require("./spawn");
var gitBranch_1 = require("./gitBranch");
var _ = require("lodash");
var stringHelpers_1 = require("./stringHelpers");
var url_1 = require("./url");
var gitHelpers_1 = require("./gitHelpers");
var commitHash_1 = require("./commitHash");
var BBPromise = require("bluebird");
var regexpHelpers_1 = require("./regexpHelpers");
//
// A regex for parsing "git log" output.
// match[1]: commit hash
// match[2]: author
// match[3]: commit timestamp
// match[4]: commit message (a sequence of lines that are either blank or start with whitespace)
//
var GIT_LOG_ENTRY_REGEX = /commit\s*([0-9a-f]+).*?$\s^Author:\s*(.*?)$\s^Date:\s*(.*?)$\s((?:(?:^\s*$\n?)|(?:^\s+(?:.*)$\s?))+)/gm;
/**
 * Determines whether dir is a directory containing a Git repository.
 * @param dir - The directory to inspect
 * @return A promise for a boolean indicating whether dir contains a Git
 * repository.  This promise will never reject.
 */
function isGitRepoDir(dir) {
    return BBPromise.all([
        dir.exists(),
        new directory_1.Directory(dir, ".git").exists() // The directory contains a .git directory
    ])
        .then(function (_a) {
        var _b = __read(_a, 2), dirExists = _b[0], dotGitExists = _b[1];
        return Boolean(dirExists && dotGitExists);
    });
}
exports.isGitRepoDir = isGitRepoDir;
/**
 * Represents a Git repository within the local filesystem.
 */
var GitRepo = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new GitRepo.  Private in order to provide error checking.
     * See static methods.
     *
     * @param dir - The directory containing the Git repo.
     */
    function GitRepo(dir) {
        this._dir = dir;
    }
    /**
     * Creates a new GitRepo instance, pointing it at a directory containing the
     * wrapped repo.
     * @param dir - The directory containing the repo
     * @return A Promise for the GitRepo.
     */
    GitRepo.fromDirectory = function (dir) {
        return isGitRepoDir(dir)
            .then(function (isGitRepo) {
            if (isGitRepo) {
                return new GitRepo(dir);
            }
            else {
                throw new Error(dir.toString() + " does not exist or is not a Git repo.");
            }
        });
    };
    /**
     * Clones a Git repo at the specified location.
     * @param src - The source to clone the repo from
     * @param parentDir - The parent directory where the repo will be placed.
     * The repo will be cloned into a subdirectory named after the project.
     * @param dirName - The name of the directory to place the cloned repository
     * into.  If not specified, the project's name will be used.
     * @return A promise for the cloned Git repo.
     */
    GitRepo.clone = function (src, parentDir, dirName) {
        var repoDirName;
        var srcStr;
        if (src instanceof url_1.Url) {
            repoDirName = dirName || gitHelpers_1.gitUrlToProjectName(src.toString());
            var protocols = src.getProtocols();
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
        var repoDir = new directory_1.Directory(parentDir, repoDirName);
        return parentDir.exists()
            .then(function (parentDirExists) {
            if (!parentDirExists) {
                throw new Error(parentDir + " is not a directory.");
            }
        })
            .then(function () {
            return spawn_1.spawn("git", ["clone", srcStr, repoDirName], { cwd: parentDir.toString() })
                .closePromise;
        })
            .then(function () {
            return new GitRepo(repoDir);
        });
    };
    Object.defineProperty(GitRepo.prototype, "directory", {
        /**
         * Gets the directory containing this Git repo.
         * @return The directory containing this git repo.
         */
        get: function () {
            return this._dir;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Determines whether this GitRepo is equal to another GitRepo.  Two
     * instances are considered equal if they point to the same directory.
     * @method
     * @param other - The other GitRepo to compare with
     * @return Whether the two GitRepo instances are equal
     */
    GitRepo.prototype.equals = function (other) {
        return this._dir.equals(other._dir);
    };
    /**
     * Gets the files that are under Git version control.
     * @return A Promise for an array of files under Git version control.
     */
    GitRepo.prototype.files = function () {
        var _this = this;
        return spawn_1.spawn("git", ["ls-files"], { cwd: this._dir.toString() })
            .closePromise
            .then(function (stdout) {
            var relativeFilePaths = stdout.split(regexpHelpers_1.piNewline);
            return _.map(relativeFilePaths, function (curRelFilePath) {
                return new file_1.File(_this._dir, curRelFilePath);
            });
        });
    };
    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    GitRepo.prototype.modifiedFiles = function () {
        var _this = this;
        return spawn_1.spawn("git", ["ls-files", "-m"], { cwd: this._dir.toString() })
            .closePromise
            .then(function (stdout) {
            if (stdout === "") {
                return [];
            }
            var relativeFilePaths = stdout.split(regexpHelpers_1.piNewline);
            return _.map(relativeFilePaths, function (curRelativeFilePath) {
                return new file_1.File(_this._dir, curRelativeFilePath);
            });
        });
    };
    // TODO: Write unit tests for this method and make sure the files have the
    // correct preceding path.
    GitRepo.prototype.untrackedFiles = function () {
        var _this = this;
        return spawn_1.spawn("git", ["ls-files", "--others", "--exclude-standard"], { cwd: this._dir.toString() })
            .closePromise
            .then(function (stdout) {
            if (stdout === "") {
                return [];
            }
            var relativeFilePaths = stdout.split(regexpHelpers_1.piNewline);
            return _.map(relativeFilePaths, function (curRelativePath) {
                return new file_1.File(_this._dir, curRelativePath);
            });
        });
    };
    // TODO: Write unit tests for this method.  Make sure there is no leading or trailing whitespace.
    GitRepo.prototype.currentCommitHash = function () {
        return spawn_1.spawn("git", ["rev-parse", "--verify", "HEAD"], { cwd: this._dir.toString() })
            .closePromise
            .then(function (stdout) {
            var hash = commitHash_1.CommitHash.fromString(stdout);
            if (!hash) {
                throw new Error("Failed to construct CommitHash.");
            }
            return hash;
        });
    };
    /**
     * Get the remotes configured for the Git repo.
     * @return A Promise for an object where the remote names are the keys and
     * the remote URL is the value.
     */
    GitRepo.prototype.remotes = function () {
        return spawn_1.spawn("git", ["remote", "-vv"], { cwd: this._dir.toString() })
            .closePromise
            .then(function (stdout) {
            var lines = stdout.split(regexpHelpers_1.piNewline);
            var remotes = {};
            lines.forEach(function (curLine) {
                var match = curLine.match(/^(\w+)\s+(.*)\s+\(\w+\)$/);
                if (match) {
                    remotes[match[1]] = match[2];
                }
            });
            return remotes;
        });
    };
    /**
     * Gets the name of this Git repository.  If the repo has a remote, the name
     * is taken from the last part of the remote's URL.  Otherwise, the name
     * will be taken from the "name" property in package.json.  Otherwise, the
     * name will be the name of the folder the repo is in.
     * @return A Promise for the name of this repository.
     */
    GitRepo.prototype.name = function () {
        var _this = this;
        return this.remotes()
            .then(function (remotes) {
            var remoteNames = Object.keys(remotes);
            if (remoteNames.length > 0) {
                var remoteUrl = remotes[remoteNames[0]];
                if (gitHelpers_1.isGitUrl(remoteUrl)) {
                    return gitHelpers_1.gitUrlToProjectName(remoteUrl);
                }
            }
        })
            .then(function (projName) {
            if (projName) {
                return projName;
            }
            // Look for the project name in package.json.
            var packageJson = new file_1.File(_this._dir, "package.json").readJsonSync();
            if (packageJson) {
                return packageJson.name;
            }
        })
            .then(function (projName) {
            if (projName) {
                return projName;
            }
            var dirName = _this._dir.dirName;
            if (dirName === "/") {
                throw new Error("Unable to determine Git repo name.");
            }
            return dirName;
        });
    };
    /**
     * Gets all the tags present in this repo.
     * @return A Promise for an array of tag names.  An empty array is returned
     * when there are no tags.
     */
    GitRepo.prototype.tags = function () {
        return spawn_1.spawn("git", ["tag"], { cwd: this._dir.toString() })
            .closePromise
            .then(function (stdout) {
            if (stdout.length === 0) {
                return [];
            }
            return stdout.split(regexpHelpers_1.piNewline);
        });
    };
    /**
     * Determines whether `tagName` is a tag that exists in this repo.
     * @param tagName - The tag to search for
     * @return A Promise for a boolean indicating whether `tagName` exists.
     */
    GitRepo.prototype.hasTag = function (tagName) {
        return this.tags()
            .then(function (tags) {
            return tags.indexOf(tagName) >= 0;
        });
    };
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
    GitRepo.prototype.createTag = function (tagName, message, force) {
        var _this = this;
        if (message === void 0) { message = ""; }
        if (force === void 0) { force = false; }
        var args = ["tag"];
        if (force) {
            args.push("-f");
        }
        args = _.concat(args, "-a", tagName);
        args = _.concat(args, "-m", message);
        return spawn_1.spawn("git", args, { cwd: this._dir.toString() })
            .closePromise
            .then(function () {
            return _this;
        });
    };
    /**
     * Deletes the specified tag.
     * @param tagName - The name of the tag to delete
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    GitRepo.prototype.deleteTag = function (tagName) {
        var _this = this;
        return spawn_1.spawn("git", ["tag", "--delete", tagName], { cwd: this._dir.toString() })
            .closePromise
            .catch(function (err) {
            if (err.stderr.includes("not found")) {
                // The specified tag name was not found.  We are still
                // successful.
            }
            else {
                throw err;
            }
        })
            .then(function () {
            return _this;
        });
    };
    /**
     * Pushes a tag to a remote
     * @param tagName - The name of the tag to push
     * @param remoteName - The remote to push the tag to
     * @param force - false if your intention is to not affect any existing
     * tags; true if your intention is to move an existing tag.
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    GitRepo.prototype.pushTag = function (tagName, remoteName, force) {
        var _this = this;
        if (force === void 0) { force = false; }
        var args = ["push"];
        if (force) {
            args.push("--force");
        }
        args = _.concat(args, remoteName, tagName);
        return spawn_1.spawn("git", args, { cwd: this._dir.toString() })
            .closePromise
            .then(function () {
            return _this;
        });
    };
    /**
     * Gets a list of branches in this repo.
     * @param forceUpdate - false to use a cached list of branches (if
     * available); true to retrieve the latest list of branches.
     * @return A Promise for the branches found
     */
    GitRepo.prototype.getBranches = function (forceUpdate) {
        var _this = this;
        if (forceUpdate === void 0) { forceUpdate = false; }
        if (forceUpdate) {
            // Invalidate the cache.  If this update fails, subsequent requests
            // will have to update the cache.
            this._branches = undefined;
        }
        var updatePromise;
        if (this._branches === undefined) {
            // The internal cache of branches needs to be updated.
            updatePromise = gitBranch_1.GitBranch.enumerateGitRepoBranches(this)
                .then(function (branches) {
                _this._branches = branches;
            });
        }
        else {
            // The internal cache does not need to be updated.
            updatePromise = BBPromise.resolve();
        }
        return updatePromise
            .then(function () {
            // Since updatePromise resolved, we know that this._branches has been
            // set.
            return _this._branches;
        });
    };
    /**
     * Gets the current working branch (if there is one)
     * @return A Promise for the current working branch or undefined (when
     * working in a detached head state).
     */
    GitRepo.prototype.getCurrentBranch = function () {
        // When on master:
        // git symbolic-ref HEAD
        // refs/heads/master
        var _this = this;
        // When in detached head state:
        // git symbolic-ref HEAD
        // fatal: ref HEAD is not a symbolic ref
        // The below command when in detached HEAD state
        // $ git rev-parse --abbrev-ref HEAD
        // HEAD
        return spawn_1.spawn("git", ["rev-parse", "--abbrev-ref", "HEAD"], { cwd: this._dir.toString() }).closePromise
            .then(function (branchName) {
            if (branchName === "HEAD") {
                // The repo is in detached head state.
                return BBPromise.resolve(undefined);
            }
            else {
                return gitBranch_1.GitBranch.create(_this, branchName);
            }
        });
    };
    /**
     * Switches to the specified branch (possibly creating it)
     * @param branch - The branch to switch to
     * @param createIfNonexistent - true to create the branch if it does not
     * exist; false if your intention is to checkout an existing branch
     * @return A Promise that resolves when the branch is checked out.
     */
    GitRepo.prototype.checkoutBranch = function (branch, createIfNonexistent) {
        var _this = this;
        return this.getBranches()
            .then(function (allBranches) {
            // If there is a branch with the same name, we should not try to
            // create it.  Instead, we should just check it out.
            if (_.some(allBranches, { name: branch.name })) {
                createIfNonexistent = false;
            }
        })
            .then(function () {
            var args = __spread([
                "checkout"
            ], (createIfNonexistent ? ["-b"] : []), [
                branch.name
            ]);
            return spawn_1.spawn("git", args, { cwd: _this._dir.toString() }).closePromise;
        })
            .then(function () { });
    };
    /**
     * Checks out the specified commit
     * @param commit - The commit to checkout
     * @return A Promise that resolves when the commit is checked out.
     */
    GitRepo.prototype.checkoutCommit = function (commit) {
        return spawn_1.spawn("git", ["checkout", commit.toString()], { cwd: this._dir.toString() }).closePromise
            .then(function () { });
    };
    /**
     * Stages all modified files that are not being ignored (via .gitignore)
     * @return A Promise for this GitRepo instance (so that other calls may be
     * chained).
     */
    GitRepo.prototype.stageAll = function () {
        var _this = this;
        return spawn_1.spawn("git", ["add", "."], { cwd: this._dir.toString() })
            .closePromise
            .then(function () {
            return _this;
        });
    };
    /**
     * Pushes the current branch to a remote
     * @param remoteName - The remote to push to
     * @param setUpstream - true to set the remote's branch as the upstream
     * branch
     * @return A Promise that is resolved when the push has completed.  The
     * promise will reject when working in a detached head state.
     */
    GitRepo.prototype.pushCurrentBranch = function (remoteName, setUpstream) {
        var _this = this;
        if (remoteName === void 0) { remoteName = "origin"; }
        if (setUpstream === void 0) { setUpstream = false; }
        return this.getCurrentBranch()
            .then(function (curBranch) {
            if (!curBranch) {
                throw new Error("There is no current branch to push.");
            }
            var args = __spread([
                "push"
            ], (setUpstream ? ["-u"] : []), [
                remoteName,
                curBranch.name
            ]);
            return spawn_1.spawn("git", args, { cwd: _this._dir.toString() }).closePromise;
        })
            .then(function () {
        })
            .catch(function (err) {
            console.log("Error pushing current branch: " + JSON.stringify(err));
            throw err;
        });
    };
    /**
     * Gets the number of commits ahead and behind the current branch is
     * @param trackingRemote - The remote containing the tracking branch
     * @return A Promise for an object containing the result
     */
    GitRepo.prototype.getCommitDeltas = function (trackingRemote) {
        // TODO: Write unit tests for this method.
        var _this = this;
        if (trackingRemote === void 0) { trackingRemote = "origin"; }
        return this.getCurrentBranch()
            .then(function (branch) {
            if (!branch) {
                throw new Error("Cannot getNumCommitsAhead() when HEAD is not on a branch.");
            }
            // The names of the two branches in question.
            var thisBranchName = branch.name;
            var trackingBranchName = trackingRemote + "/" + thisBranchName;
            var numAheadPromise = spawn_1.spawn("git", ["rev-list", thisBranchName, "--not", trackingBranchName, "--count"], { cwd: _this._dir.toString() }).closePromise;
            var numBehindPromise = spawn_1.spawn("git", ["rev-list", trackingBranchName, "--not", thisBranchName, "--count"], { cwd: _this._dir.toString() }).closePromise;
            return BBPromise.all([numAheadPromise, numBehindPromise]);
        })
            .then(function (results) {
            return {
                ahead: parseInt(results[0], 10),
                behind: parseInt(results[1], 10)
            };
        });
    };
    // TODO: To get the staged files:
    // git diff --name-only --cached
    /**
     * Commits staged files
     * @param msg - The commit message
     * @return A Promise for the newly created Git log entry
     */
    GitRepo.prototype.commit = function (msg) {
        // TODO: Add unit tests for this method.
        var _this = this;
        if (msg === void 0) { msg = ""; }
        return spawn_1.spawn("git", ["commit", "-m", msg], { cwd: this._dir.toString() })
            .closePromise
            .then(function () {
            // Get the commit hash
            return spawn_1.spawn("git", ["rev-parse", "HEAD"], { cwd: _this._dir.toString() }).closePromise;
        })
            .then(function (stdout) {
            var commitHash = _.trim(stdout);
            return spawn_1.spawn("git", ["show", commitHash], { cwd: _this._dir.toString() }).closePromise;
        })
            .then(function (stdout) {
            var match = GIT_LOG_ENTRY_REGEX.exec(stdout);
            if (!match) {
                throw new Error("Could not parse \"git show\" output:\n" + stdout);
            }
            return {
                commitHash: match[1],
                author: match[2],
                timestamp: new Date(match[3]),
                message: stringHelpers_1.outdent(stringHelpers_1.trimBlankLines(match[4]))
            };
        });
    };
    /**
     * Fetches from the specified remote.
     * @param remoteName - The remote to fetch from
     * @param fetchTags - Set to true in order to fetch tags that point to
     * objects that are not downloaded (see git fetch docs).
     * @return A promise that is resolved when the command completes
     * successfully
     */
    GitRepo.prototype.fetch = function (remoteName, fetchTags) {
        if (remoteName === void 0) { remoteName = "origin"; }
        if (fetchTags === void 0) { fetchTags = false; }
        var args = __spread([
            "fetch"
        ], arrayHelpers_1.insertIf(fetchTags, "--tags"), [
            remoteName
        ]);
        return spawn_1.spawn("git", args, { cwd: this._dir.toString() }).closePromise
            .then(function () { }, function (err) {
            console.log("Error fetching from " + remoteName + " remote: " + JSON.stringify(err));
            throw err;
        });
    };
    /**
     * Gets this repo's commit log
     * @param forceUpdate - true to get a current snapshot of this repos log;
     * false if a previously cached log can be used (more performant)
     * @return A Promise for an array of Git log entries
     */
    GitRepo.prototype.getLog = function (forceUpdate) {
        var _this = this;
        if (forceUpdate) {
            this._log = undefined;
        }
        var updatePromise;
        if (this._log === undefined) {
            updatePromise = this.getLogEntries()
                .then(function (log) {
                _this._log = log;
            });
        }
        else {
            updatePromise = BBPromise.resolve();
        }
        return updatePromise
            .then(function () {
            return _this._log;
        });
    };
    /**
     * Helper method that retrieves Git log entries
     * @method
     * @return A promise for an array of structures describing each commit.
     */
    GitRepo.prototype.getLogEntries = function () {
        return spawn_1.spawn("git", ["log"], { cwd: this._dir.toString() })
            .closePromise
            .then(function (stdout) {
            var entries = [];
            var match;
            while ((match = GIT_LOG_ENTRY_REGEX.exec(stdout)) !== null) // tslint:disable-line
             {
                entries.push({
                    commitHash: match[1],
                    author: match[2],
                    timestamp: new Date(match[3]),
                    message: stringHelpers_1.outdent(stringHelpers_1.trimBlankLines(match[4]))
                });
            }
            // Git log lists the most recent entry first.  Reverse the array so
            // that the most recent entry is the last.
            _.reverse(entries);
            return entries;
        });
    };
    return GitRepo;
}());
exports.GitRepo = GitRepo;
// TODO: The following will list all tags pointing to the specified commit.
// git tag --points-at 34b8bff

//# sourceMappingURL=data:application/json;charset=utf8;base64,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TSxFQUFNLEtBQUssQ0FBQyxDQUFDLENBQUM7b0JBQ3BCLFNBQVMsRUFBRyxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQzlCLE9BQU8sRUFBSyx1QkFBTyxDQUFDLDhCQUFjLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7aUJBQ2hELENBQ0osQ0FBQzthQUNMO1lBRUQsbUVBQW1FO1lBQ25FLDBDQUEwQztZQUMxQyxDQUFDLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDO1lBQ25CLE9BQU8sT0FBTyxDQUFDO1FBQ25CLENBQUMsQ0FBQyxDQUFDO0lBQ1AsQ0FBQztJQUdMLGNBQUM7QUFBRCxDQXB0QkEsQUFvdEJDLElBQUE7QUFwdEJZLDBCQUFPO0FBc3RCcEIsMkVBQTJFO0FBQzNFLDhCQUE4QiIsImZpbGUiOiJnaXRSZXBvLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtpbnNlcnRJZn0gZnJvbSBcIi4vYXJyYXlIZWxwZXJzXCI7XG5pbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4vZGlyZWN0b3J5XCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7c3Bhd259IGZyb20gXCIuL3NwYXduXCI7XG5pbXBvcnQge0dpdEJyYW5jaH0gZnJvbSBcIi4vZ2l0QnJhbmNoXCI7XG5pbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCB7b3V0ZGVudCwgdHJpbUJsYW5rTGluZXN9IGZyb20gXCIuL3N0cmluZ0hlbHBlcnNcIjtcbmltcG9ydCB7VXJsfSBmcm9tIFwiLi91cmxcIjtcbmltcG9ydCB7Z2l0VXJsVG9Qcm9qZWN0TmFtZSwgaXNHaXRVcmx9IGZyb20gXCIuL2dpdEhlbHBlcnNcIjtcbmltcG9ydCB7SVBhY2thZ2VKc29ufSBmcm9tIFwiLi9ub2RlUGFja2FnZVwiO1xuaW1wb3J0IHtDb21taXRIYXNofSBmcm9tIFwiLi9jb21taXRIYXNoXCI7XG5pbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5pbXBvcnQge3BpTmV3bGluZX0gZnJvbSBcIi4vcmVnZXhwSGVscGVyc1wiO1xuXG5cbmludGVyZmFjZSBJR2l0TG9nRW50cnlcbntcbiAgICAvLyBUT0RPOiBDaGFuZ2UgdGhlIGZvbGxvd2luZyB0byBhbiBpbnN0YW5jZSBvZiBDb21taXRIYXNoLlxuICAgIGNvbW1pdEhhc2g6IHN0cmluZztcbiAgICBhdXRob3I6IHN0cmluZztcbiAgICB0aW1lc3RhbXA6IERhdGU7XG4gICAgbWVzc2FnZTogc3RyaW5nO1xufVxuXG5cbi8vXG4vLyBBIHJlZ2V4IGZvciBwYXJzaW5nIFwiZ2l0IGxvZ1wiIG91dHB1dC5cbi8vIG1hdGNoWzFdOiBjb21taXQgaGFzaFxuLy8gbWF0Y2hbMl06IGF1dGhvclxuLy8gbWF0Y2hbM106IGNvbW1pdCB0aW1lc3RhbXBcbi8vIG1hdGNoWzRdOiBjb21taXQgbWVzc2FnZSAoYSBzZXF1ZW5jZSBvZiBsaW5lcyB0aGF0IGFyZSBlaXRoZXIgYmxhbmsgb3Igc3RhcnQgd2l0aCB3aGl0ZXNwYWNlKVxuLy9cbmNvbnN0IEdJVF9MT0dfRU5UUllfUkVHRVggPSAvY29tbWl0XFxzKihbMC05YS1mXSspLio/JFxcc15BdXRob3I6XFxzKiguKj8pJFxcc15EYXRlOlxccyooLio/KSRcXHMoKD86KD86XlxccyokXFxuPyl8KD86XlxccysoPzouKikkXFxzPykpKykvZ207XG5cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgZGlyIGlzIGEgZGlyZWN0b3J5IGNvbnRhaW5pbmcgYSBHaXQgcmVwb3NpdG9yeS5cbiAqIEBwYXJhbSBkaXIgLSBUaGUgZGlyZWN0b3J5IHRvIGluc3BlY3RcbiAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIGRpciBjb250YWlucyBhIEdpdFxuICogcmVwb3NpdG9yeS4gIFRoaXMgcHJvbWlzZSB3aWxsIG5ldmVyIHJlamVjdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlzR2l0UmVwb0RpcihkaXI6IERpcmVjdG9yeSk6IFByb21pc2U8Ym9vbGVhbj5cbntcbiAgICByZXR1cm4gQkJQcm9taXNlLmFsbChbXG4gICAgICAgIGRpci5leGlzdHMoKSwgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZGlyZWN0b3J5IGV4aXN0c1xuICAgICAgICBuZXcgRGlyZWN0b3J5KGRpciwgXCIuZ2l0XCIpLmV4aXN0cygpICAvLyBUaGUgZGlyZWN0b3J5IGNvbnRhaW5zIGEgLmdpdCBkaXJlY3RvcnlcbiAgICBdKVxuICAgIC50aGVuKChbZGlyRXhpc3RzLCBkb3RHaXRFeGlzdHNdKSA9PiB7XG4gICAgICAgIHJldHVybiBCb29sZWFuKGRpckV4aXN0cyAmJiBkb3RHaXRFeGlzdHMpO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogUmVwcmVzZW50cyBhIEdpdCByZXBvc2l0b3J5IHdpdGhpbiB0aGUgbG9jYWwgZmlsZXN5c3RlbS5cbiAqL1xuZXhwb3J0IGNsYXNzIEdpdFJlcG9cbntcblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgR2l0UmVwbyBpbnN0YW5jZSwgcG9pbnRpbmcgaXQgYXQgYSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGVcbiAgICAgKiB3cmFwcGVkIHJlcG8uXG4gICAgICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgcmVwb1xuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGUgR2l0UmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgc3RhdGljIGZyb21EaXJlY3RvcnkoZGlyOiBEaXJlY3RvcnkpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICByZXR1cm4gaXNHaXRSZXBvRGlyKGRpcilcbiAgICAgICAgLnRoZW4oKGlzR2l0UmVwbykgPT4ge1xuICAgICAgICAgICAgaWYgKGlzR2l0UmVwbykge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgR2l0UmVwbyhkaXIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtkaXIudG9TdHJpbmcoKX0gZG9lcyBub3QgZXhpc3Qgb3IgaXMgbm90IGEgR2l0IHJlcG8uYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2xvbmVzIGEgR2l0IHJlcG8gYXQgdGhlIHNwZWNpZmllZCBsb2NhdGlvbi5cbiAgICAgKiBAcGFyYW0gc3JjIC0gVGhlIHNvdXJjZSB0byBjbG9uZSB0aGUgcmVwbyBmcm9tXG4gICAgICogQHBhcmFtIHBhcmVudERpciAtIFRoZSBwYXJlbnQgZGlyZWN0b3J5IHdoZXJlIHRoZSByZXBvIHdpbGwgYmUgcGxhY2VkLlxuICAgICAqIFRoZSByZXBvIHdpbGwgYmUgY2xvbmVkIGludG8gYSBzdWJkaXJlY3RvcnkgbmFtZWQgYWZ0ZXIgdGhlIHByb2plY3QuXG4gICAgICogQHBhcmFtIGRpck5hbWUgLSBUaGUgbmFtZSBvZiB0aGUgZGlyZWN0b3J5IHRvIHBsYWNlIHRoZSBjbG9uZWQgcmVwb3NpdG9yeVxuICAgICAqIGludG8uICBJZiBub3Qgc3BlY2lmaWVkLCB0aGUgcHJvamVjdCdzIG5hbWUgd2lsbCBiZSB1c2VkLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGUgY2xvbmVkIEdpdCByZXBvLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgY2xvbmUoc3JjOiBVcmwgfCBEaXJlY3RvcnksIHBhcmVudERpcjogRGlyZWN0b3J5LCBkaXJOYW1lPzogc3RyaW5nKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IHJlcG9EaXJOYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBzcmNTdHI6IHN0cmluZztcblxuICAgICAgICBpZiAoc3JjIGluc3RhbmNlb2YgVXJsKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXBvRGlyTmFtZSA9IGRpck5hbWUgfHwgZ2l0VXJsVG9Qcm9qZWN0TmFtZShzcmMudG9TdHJpbmcoKSk7XG4gICAgICAgICAgICBjb25zdCBwcm90b2NvbHMgPSBzcmMuZ2V0UHJvdG9jb2xzKCk7XG4gICAgICAgICAgICBzcmNTdHIgPSBwcm90b2NvbHMubGVuZ3RoIDwgMiA/XG4gICAgICAgICAgICAgICAgc3JjLnRvU3RyaW5nKCkgOlxuICAgICAgICAgICAgICAgIHNyYy5yZXBsYWNlUHJvdG9jb2woXCJodHRwc1wiKS50b1N0cmluZygpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmVwb0Rpck5hbWUgPSBkaXJOYW1lIHx8IHNyYy5kaXJOYW1lO1xuICAgICAgICAgICAgLy8gVGhlIHBhdGggdG8gdGhlIHNvdXJjZSByZXBvIG11c3QgYmUgbWFkZSBhYnNvbHV0ZSwgYmVjYXVzZSB3aGVuXG4gICAgICAgICAgICAvLyB3ZSBleGVjdXRlIHRoZSBcImdpdCBjbG9uZVwiIGNvbW1hbmQsIHRoZSBjd2Qgd2lsbCBiZSBgcGFyZW50RGlyYC5cbiAgICAgICAgICAgIHNyY1N0ciA9IHNyYy5hYnNQYXRoKCk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByZXBvRGlyID0gbmV3IERpcmVjdG9yeShwYXJlbnREaXIsIHJlcG9EaXJOYW1lKTtcblxuICAgICAgICByZXR1cm4gcGFyZW50RGlyLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChwYXJlbnREaXJFeGlzdHMpID0+IHtcbiAgICAgICAgICAgIGlmICghcGFyZW50RGlyRXhpc3RzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgJHtwYXJlbnREaXJ9IGlzIG5vdCBhIGRpcmVjdG9yeS5gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFxuICAgICAgICAgICAgICAgIFwiZ2l0XCIsXG4gICAgICAgICAgICAgICAgW1wiY2xvbmVcIiwgc3JjU3RyLCByZXBvRGlyTmFtZV0sXG4gICAgICAgICAgICAgICAge2N3ZDogcGFyZW50RGlyLnRvU3RyaW5nKCl9XG4gICAgICAgICAgICApXG4gICAgICAgICAgICAuY2xvc2VQcm9taXNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gbmV3IEdpdFJlcG8ocmVwb0Rpcik7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLy8gcmVnaW9uIFByaXZhdGUgRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGlyOiBEaXJlY3Rvcnk7XG4gICAgcHJpdmF0ZSBfYnJhbmNoZXM6IEFycmF5PEdpdEJyYW5jaD4gfCB1bmRlZmluZWQ7XG4gICAgcHJpdmF0ZSBfbG9nOiBBcnJheTxJR2l0TG9nRW50cnk+IHwgdW5kZWZpbmVkO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEdpdFJlcG8uICBQcml2YXRlIGluIG9yZGVyIHRvIHByb3ZpZGUgZXJyb3IgY2hlY2tpbmcuXG4gICAgICogU2VlIHN0YXRpYyBtZXRob2RzLlxuICAgICAqXG4gICAgICogQHBhcmFtIGRpciAtIFRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGUgR2l0IHJlcG8uXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihkaXI6IERpcmVjdG9yeSlcbiAgICB7XG4gICAgICAgIHRoaXMuX2RpciA9IGRpcjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoaXMgR2l0IHJlcG8uXG4gICAgICogQHJldHVybiBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhpcyBnaXQgcmVwby5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRpcmVjdG9yeSgpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXI7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhpcyBHaXRSZXBvIGlzIGVxdWFsIHRvIGFub3RoZXIgR2l0UmVwby4gIFR3b1xuICAgICAqIGluc3RhbmNlcyBhcmUgY29uc2lkZXJlZCBlcXVhbCBpZiB0aGV5IHBvaW50IHRvIHRoZSBzYW1lIGRpcmVjdG9yeS5cbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIG90aGVyIC0gVGhlIG90aGVyIEdpdFJlcG8gdG8gY29tcGFyZSB3aXRoXG4gICAgICogQHJldHVybiBXaGV0aGVyIHRoZSB0d28gR2l0UmVwbyBpbnN0YW5jZXMgYXJlIGVxdWFsXG4gICAgICovXG4gICAgcHVibGljIGVxdWFscyhvdGhlcjogR2l0UmVwbyk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9kaXIuZXF1YWxzKG90aGVyLl9kaXIpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZmlsZXMgdGhhdCBhcmUgdW5kZXIgR2l0IHZlcnNpb24gY29udHJvbC5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgZmlsZXMgdW5kZXIgR2l0IHZlcnNpb24gY29udHJvbC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZmlsZXMoKTogUHJvbWlzZTxBcnJheTxGaWxlPj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJscy1maWxlc1wiXSwge2N3ZDogdGhpcy5fZGlyLnRvU3RyaW5nKCl9KVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZVBhdGhzID0gc3Rkb3V0LnNwbGl0KHBpTmV3bGluZSk7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAocmVsYXRpdmVGaWxlUGF0aHMsIChjdXJSZWxGaWxlUGF0aCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9kaXIsIGN1clJlbEZpbGVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kIGFuZCBtYWtlIHN1cmUgdGhlIGZpbGVzIGhhdmUgdGhlXG4gICAgLy8gY29ycmVjdCBwcmVjZWRpbmcgcGF0aC5cbiAgICBwdWJsaWMgbW9kaWZpZWRGaWxlcygpOiBQcm9taXNlPEFycmF5PEZpbGU+PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImxzLWZpbGVzXCIsIFwiLW1cIl0sIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBpZiAoc3Rkb3V0ID09PSBcIlwiKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlRmlsZVBhdGhzID0gc3Rkb3V0LnNwbGl0KHBpTmV3bGluZSk7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAocmVsYXRpdmVGaWxlUGF0aHMsIChjdXJSZWxhdGl2ZUZpbGVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsYXRpdmVGaWxlUGF0aCk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGlzIG1ldGhvZCBhbmQgbWFrZSBzdXJlIHRoZSBmaWxlcyBoYXZlIHRoZVxuICAgIC8vIGNvcnJlY3QgcHJlY2VkaW5nIHBhdGguXG4gICAgcHVibGljIHVudHJhY2tlZEZpbGVzKCk6IFByb21pc2U8QXJyYXk8RmlsZT4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wibHMtZmlsZXNcIiwgIFwiLS1vdGhlcnNcIiwgIFwiLS1leGNsdWRlLXN0YW5kYXJkXCJdLCB7Y3dkOiB0aGlzLl9kaXIudG9TdHJpbmcoKX0pXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0ZG91dCA9PT0gXCJcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCByZWxhdGl2ZUZpbGVQYXRocyA9IHN0ZG91dC5zcGxpdChwaU5ld2xpbmUpO1xuICAgICAgICAgICAgcmV0dXJuIF8ubWFwKHJlbGF0aXZlRmlsZVBhdGhzLCAoY3VyUmVsYXRpdmVQYXRoKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBGaWxlKHRoaXMuX2RpciwgY3VyUmVsYXRpdmVQYXRoKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoaXMgbWV0aG9kLiAgTWFrZSBzdXJlIHRoZXJlIGlzIG5vIGxlYWRpbmcgb3IgdHJhaWxpbmcgd2hpdGVzcGFjZS5cbiAgICBwdWJsaWMgY3VycmVudENvbW1pdEhhc2goKTogUHJvbWlzZTxDb21taXRIYXNoPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcInJldi1wYXJzZVwiLCBcIi0tdmVyaWZ5XCIsIFwiSEVBRFwiXSwge2N3ZDogdGhpcy5fZGlyLnRvU3RyaW5nKCl9KVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGhhc2ggPSBDb21taXRIYXNoLmZyb21TdHJpbmcoc3Rkb3V0KTtcbiAgICAgICAgICAgIGlmICghaGFzaClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJGYWlsZWQgdG8gY29uc3RydWN0IENvbW1pdEhhc2guXCIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGhhc2g7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSByZW1vdGVzIGNvbmZpZ3VyZWQgZm9yIHRoZSBHaXQgcmVwby5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gb2JqZWN0IHdoZXJlIHRoZSByZW1vdGUgbmFtZXMgYXJlIHRoZSBrZXlzIGFuZFxuICAgICAqIHRoZSByZW1vdGUgVVJMIGlzIHRoZSB2YWx1ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcmVtb3RlcygpOiBQcm9taXNlPHtbbmFtZTogc3RyaW5nXTogc3RyaW5nfT5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJyZW1vdGVcIiwgXCItdnZcIl0sIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG5cbiAgICAgICAgICAgIGNvbnN0IGxpbmVzID0gc3Rkb3V0LnNwbGl0KHBpTmV3bGluZSk7XG4gICAgICAgICAgICBjb25zdCByZW1vdGVzOiB7W25hbWU6IHN0cmluZ106IHN0cmluZ30gPSB7fTtcbiAgICAgICAgICAgIGxpbmVzLmZvckVhY2goKGN1ckxpbmUpID0+IHtcbiAgICAgICAgICAgICAgICBjb25zdCBtYXRjaCA9IGN1ckxpbmUubWF0Y2goL14oXFx3KylcXHMrKC4qKVxccytcXChcXHcrXFwpJC8pO1xuICAgICAgICAgICAgICAgIGlmIChtYXRjaClcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlbW90ZXNbbWF0Y2hbMV1dID0gbWF0Y2hbMl07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiByZW1vdGVzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG5hbWUgb2YgdGhpcyBHaXQgcmVwb3NpdG9yeS4gIElmIHRoZSByZXBvIGhhcyBhIHJlbW90ZSwgdGhlIG5hbWVcbiAgICAgKiBpcyB0YWtlbiBmcm9tIHRoZSBsYXN0IHBhcnQgb2YgdGhlIHJlbW90ZSdzIFVSTC4gIE90aGVyd2lzZSwgdGhlIG5hbWVcbiAgICAgKiB3aWxsIGJlIHRha2VuIGZyb20gdGhlIFwibmFtZVwiIHByb3BlcnR5IGluIHBhY2thZ2UuanNvbi4gIE90aGVyd2lzZSwgdGhlXG4gICAgICogbmFtZSB3aWxsIGJlIHRoZSBuYW1lIG9mIHRoZSBmb2xkZXIgdGhlIHJlcG8gaXMgaW4uXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoZSBuYW1lIG9mIHRoaXMgcmVwb3NpdG9yeS5cbiAgICAgKi9cbiAgICBwdWJsaWMgbmFtZSgpOiBQcm9taXNlPHN0cmluZz5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW90ZXMoKVxuICAgICAgICAudGhlbigocmVtb3RlcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVtb3RlTmFtZXMgPSBPYmplY3Qua2V5cyhyZW1vdGVzKTtcbiAgICAgICAgICAgIGlmIChyZW1vdGVOYW1lcy5sZW5ndGggPiAwKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGNvbnN0IHJlbW90ZVVybCA9IHJlbW90ZXNbcmVtb3RlTmFtZXNbMF1dO1xuXG4gICAgICAgICAgICAgICAgaWYgKGlzR2l0VXJsKHJlbW90ZVVybCkpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGdpdFVybFRvUHJvamVjdE5hbWUocmVtb3RlVXJsKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChwcm9qTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb2pOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2pOYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBMb29rIGZvciB0aGUgcHJvamVjdCBuYW1lIGluIHBhY2thZ2UuanNvbi5cbiAgICAgICAgICAgIGNvbnN0IHBhY2thZ2VKc29uID0gbmV3IEZpbGUodGhpcy5fZGlyLCBcInBhY2thZ2UuanNvblwiKS5yZWFkSnNvblN5bmM8SVBhY2thZ2VKc29uPigpO1xuICAgICAgICAgICAgaWYgKHBhY2thZ2VKc29uKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHBhY2thZ2VKc29uLm5hbWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChwcm9qTmFtZSkgPT4ge1xuICAgICAgICAgICAgaWYgKHByb2pOYW1lKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHByb2pOYW1lO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBjb25zdCBkaXJOYW1lID0gdGhpcy5fZGlyLmRpck5hbWU7XG4gICAgICAgICAgICBpZiAoZGlyTmFtZSA9PT0gXCIvXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiVW5hYmxlIHRvIGRldGVybWluZSBHaXQgcmVwbyBuYW1lLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIGRpck5hbWU7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhbGwgdGhlIHRhZ3MgcHJlc2VudCBpbiB0aGlzIHJlcG8uXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIGFuIGFycmF5IG9mIHRhZyBuYW1lcy4gIEFuIGVtcHR5IGFycmF5IGlzIHJldHVybmVkXG4gICAgICogd2hlbiB0aGVyZSBhcmUgbm8gdGFncy5cbiAgICAgKi9cbiAgICBwdWJsaWMgdGFncygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+XG4gICAge1xuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1widGFnXCJdLCB7Y3dkOiB0aGlzLl9kaXIudG9TdHJpbmcoKX0pXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgaWYgKHN0ZG91dC5sZW5ndGggPT09IDApXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIFtdO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICByZXR1cm4gc3Rkb3V0LnNwbGl0KHBpTmV3bGluZSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGV0ZXJtaW5lcyB3aGV0aGVyIGB0YWdOYW1lYCBpcyBhIHRhZyB0aGF0IGV4aXN0cyBpbiB0aGlzIHJlcG8uXG4gICAgICogQHBhcmFtIHRhZ05hbWUgLSBUaGUgdGFnIHRvIHNlYXJjaCBmb3JcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYSBib29sZWFuIGluZGljYXRpbmcgd2hldGhlciBgdGFnTmFtZWAgZXhpc3RzLlxuICAgICAqL1xuICAgIHB1YmxpYyBoYXNUYWcodGFnTmFtZTogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMudGFncygpXG4gICAgICAgIC50aGVuKCh0YWdzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGFncy5pbmRleE9mKHRhZ05hbWUpID49IDA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQWRkcyBhbiBhbm5vdGF0ZWQgKGhlYXZ5KSB0YWcgb3IgbW92ZXMgYW4gZXhpc3Rpbmcgb25lIHRvIHRoaXMgcmVwbydzXG4gICAgICogY3VycmVudCBjb21taXQuXG4gICAgICogQHBhcmFtIHRhZ05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgdGFnIHRvIGNyZWF0ZS9tb3ZlXG4gICAgICogQHBhcmFtIG1lc3NhZ2UgLSBUaGUgbWVzc2FnZSBhc3NvY2lhdGVkIHdpdGggdGhlIGFubm90YXRlZCB0YWdcbiAgICAgKiBAcGFyYW0gZm9yY2UgLSBmYWxzZSB3aGVuIHlvdXIgaW50ZW50aW9uIGlzIHRvIGNyZWF0ZSBhIG5ldyB0YWc7IHRydWVcbiAgICAgKiB3aGVuIHlvdXIgaW50ZW50aW9uIGlzIHRvIG1vdmUgYW4gZXhpc3RpbmcgdGFnLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGlzIEdpdFJlcG8gaW5zdGFuY2UgKHNvIHRoYXQgb3RoZXIgY2FsbHMgbWF5IGJlXG4gICAgICogY2hhaW5lZCkuXG4gICAgICovXG4gICAgcHVibGljIGNyZWF0ZVRhZyh0YWdOYW1lOiBzdHJpbmcsIG1lc3NhZ2U6IHN0cmluZyA9IFwiXCIsIGZvcmNlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEdpdFJlcG8+XG4gICAge1xuICAgICAgICBsZXQgYXJncyA9IFtcInRhZ1wiXTtcblxuICAgICAgICBpZiAoZm9yY2UpIHtcbiAgICAgICAgICAgIGFyZ3MucHVzaChcIi1mXCIpO1xuICAgICAgICB9XG5cbiAgICAgICAgYXJncyA9IF8uY29uY2F0KGFyZ3MsIFwiLWFcIiwgdGFnTmFtZSk7XG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCBcIi1tXCIsIG1lc3NhZ2UpO1xuXG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBhcmdzLCB7Y3dkOiB0aGlzLl9kaXIudG9TdHJpbmcoKX0pXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRGVsZXRlcyB0aGUgc3BlY2lmaWVkIHRhZy5cbiAgICAgKiBAcGFyYW0gdGFnTmFtZSAtIFRoZSBuYW1lIG9mIHRoZSB0YWcgdG8gZGVsZXRlXG4gICAgICogQHJldHVybiBBIFByb21pc2UgZm9yIHRoaXMgR2l0UmVwbyBpbnN0YW5jZSAoc28gdGhhdCBvdGhlciBjYWxscyBtYXkgYmVcbiAgICAgKiBjaGFpbmVkKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZGVsZXRlVGFnKHRhZ05hbWU6IHN0cmluZyk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJ0YWdcIiwgXCItLWRlbGV0ZVwiLCB0YWdOYW1lXSwge2N3ZDogdGhpcy5fZGlyLnRvU3RyaW5nKCl9KVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBpZiAoZXJyLnN0ZGVyci5pbmNsdWRlcyhcIm5vdCBmb3VuZFwiKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgc3BlY2lmaWVkIHRhZyBuYW1lIHdhcyBub3QgZm91bmQuICBXZSBhcmUgc3RpbGxcbiAgICAgICAgICAgICAgICAvLyBzdWNjZXNzZnVsLlxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUHVzaGVzIGEgdGFnIHRvIGEgcmVtb3RlXG4gICAgICogQHBhcmFtIHRhZ05hbWUgLSBUaGUgbmFtZSBvZiB0aGUgdGFnIHRvIHB1c2hcbiAgICAgKiBAcGFyYW0gcmVtb3RlTmFtZSAtIFRoZSByZW1vdGUgdG8gcHVzaCB0aGUgdGFnIHRvXG4gICAgICogQHBhcmFtIGZvcmNlIC0gZmFsc2UgaWYgeW91ciBpbnRlbnRpb24gaXMgdG8gbm90IGFmZmVjdCBhbnkgZXhpc3RpbmdcbiAgICAgKiB0YWdzOyB0cnVlIGlmIHlvdXIgaW50ZW50aW9uIGlzIHRvIG1vdmUgYW4gZXhpc3RpbmcgdGFnLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGlzIEdpdFJlcG8gaW5zdGFuY2UgKHNvIHRoYXQgb3RoZXIgY2FsbHMgbWF5IGJlXG4gICAgICogY2hhaW5lZCkuXG4gICAgICovXG4gICAgcHVibGljIHB1c2hUYWcoXG4gICAgICAgIHRhZ05hbWU6IHN0cmluZyxcbiAgICAgICAgcmVtb3RlTmFtZTogc3RyaW5nLFxuICAgICAgICBmb3JjZTogYm9vbGVhbiA9IGZhbHNlXG4gICAgKTogUHJvbWlzZTxHaXRSZXBvPlxuICAgIHtcbiAgICAgICAgbGV0IGFyZ3MgPSBbXCJwdXNoXCJdO1xuXG4gICAgICAgIGlmIChmb3JjZSkge1xuICAgICAgICAgICAgYXJncy5wdXNoKFwiLS1mb3JjZVwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGFyZ3MgPSBfLmNvbmNhdChhcmdzLCByZW1vdGVOYW1lLCB0YWdOYW1lKTtcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgYXJncywge2N3ZDogdGhpcy5fZGlyLnRvU3RyaW5nKCl9KVxuICAgICAgICAuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgYSBsaXN0IG9mIGJyYW5jaGVzIGluIHRoaXMgcmVwby5cbiAgICAgKiBAcGFyYW0gZm9yY2VVcGRhdGUgLSBmYWxzZSB0byB1c2UgYSBjYWNoZWQgbGlzdCBvZiBicmFuY2hlcyAoaWZcbiAgICAgKiBhdmFpbGFibGUpOyB0cnVlIHRvIHJldHJpZXZlIHRoZSBsYXRlc3QgbGlzdCBvZiBicmFuY2hlcy5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIGJyYW5jaGVzIGZvdW5kXG4gICAgICovXG4gICAgcHVibGljIGdldEJyYW5jaGVzKGZvcmNlVXBkYXRlOiBib29sZWFuID0gZmFsc2UpOiBQcm9taXNlPEFycmF5PEdpdEJyYW5jaD4+XG4gICAge1xuICAgICAgICBpZiAoZm9yY2VVcGRhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIEludmFsaWRhdGUgdGhlIGNhY2hlLiAgSWYgdGhpcyB1cGRhdGUgZmFpbHMsIHN1YnNlcXVlbnQgcmVxdWVzdHNcbiAgICAgICAgICAgIC8vIHdpbGwgaGF2ZSB0byB1cGRhdGUgdGhlIGNhY2hlLlxuICAgICAgICAgICAgdGhpcy5fYnJhbmNoZXMgPSB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBsZXQgdXBkYXRlUHJvbWlzZTogUHJvbWlzZTx2b2lkPjtcblxuICAgICAgICBpZiAodGhpcy5fYnJhbmNoZXMgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhlIGludGVybmFsIGNhY2hlIG9mIGJyYW5jaGVzIG5lZWRzIHRvIGJlIHVwZGF0ZWQuXG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gR2l0QnJhbmNoLmVudW1lcmF0ZUdpdFJlcG9CcmFuY2hlcyh0aGlzKVxuICAgICAgICAgICAgLnRoZW4oKGJyYW5jaGVzOiBBcnJheTxHaXRCcmFuY2g+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYnJhbmNoZXMgPSBicmFuY2hlcztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgLy8gVGhlIGludGVybmFsIGNhY2hlIGRvZXMgbm90IG5lZWQgdG8gYmUgdXBkYXRlZC5cbiAgICAgICAgICAgIHVwZGF0ZVByb21pc2UgPSBCQlByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHVwZGF0ZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gU2luY2UgdXBkYXRlUHJvbWlzZSByZXNvbHZlZCwgd2Uga25vdyB0aGF0IHRoaXMuX2JyYW5jaGVzIGhhcyBiZWVuXG4gICAgICAgICAgICAvLyBzZXQuXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fYnJhbmNoZXMhO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGN1cnJlbnQgd29ya2luZyBicmFuY2ggKGlmIHRoZXJlIGlzIG9uZSlcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIGN1cnJlbnQgd29ya2luZyBicmFuY2ggb3IgdW5kZWZpbmVkICh3aGVuXG4gICAgICogd29ya2luZyBpbiBhIGRldGFjaGVkIGhlYWQgc3RhdGUpLlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRDdXJyZW50QnJhbmNoKCk6IFByb21pc2U8R2l0QnJhbmNoIHwgdW5kZWZpbmVkPlxuICAgIHtcbiAgICAgICAgLy8gV2hlbiBvbiBtYXN0ZXI6XG4gICAgICAgIC8vIGdpdCBzeW1ib2xpYy1yZWYgSEVBRFxuICAgICAgICAvLyByZWZzL2hlYWRzL21hc3RlclxuXG4gICAgICAgIC8vIFdoZW4gaW4gZGV0YWNoZWQgaGVhZCBzdGF0ZTpcbiAgICAgICAgLy8gZ2l0IHN5bWJvbGljLXJlZiBIRUFEXG4gICAgICAgIC8vIGZhdGFsOiByZWYgSEVBRCBpcyBub3QgYSBzeW1ib2xpYyByZWZcblxuICAgICAgICAvLyBUaGUgYmVsb3cgY29tbWFuZCB3aGVuIGluIGRldGFjaGVkIEhFQUQgc3RhdGVcbiAgICAgICAgLy8gJCBnaXQgcmV2LXBhcnNlIC0tYWJicmV2LXJlZiBIRUFEXG4gICAgICAgIC8vIEhFQURcblxuICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiLS1hYmJyZXYtcmVmXCIsIFwiSEVBRFwiXSwge2N3ZDogdGhpcy5fZGlyLnRvU3RyaW5nKCl9KS5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKGJyYW5jaE5hbWUpID0+IHtcbiAgICAgICAgICAgIGlmIChicmFuY2hOYW1lID09PSBcIkhFQURcIikge1xuICAgICAgICAgICAgICAgIC8vIFRoZSByZXBvIGlzIGluIGRldGFjaGVkIGhlYWQgc3RhdGUuXG4gICAgICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gR2l0QnJhbmNoLmNyZWF0ZSh0aGlzLCBicmFuY2hOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBTd2l0Y2hlcyB0byB0aGUgc3BlY2lmaWVkIGJyYW5jaCAocG9zc2libHkgY3JlYXRpbmcgaXQpXG4gICAgICogQHBhcmFtIGJyYW5jaCAtIFRoZSBicmFuY2ggdG8gc3dpdGNoIHRvXG4gICAgICogQHBhcmFtIGNyZWF0ZUlmTm9uZXhpc3RlbnQgLSB0cnVlIHRvIGNyZWF0ZSB0aGUgYnJhbmNoIGlmIGl0IGRvZXMgbm90XG4gICAgICogZXhpc3Q7IGZhbHNlIGlmIHlvdXIgaW50ZW50aW9uIGlzIHRvIGNoZWNrb3V0IGFuIGV4aXN0aW5nIGJyYW5jaFxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgYnJhbmNoIGlzIGNoZWNrZWQgb3V0LlxuICAgICAqL1xuICAgIHB1YmxpYyBjaGVja291dEJyYW5jaChicmFuY2g6IEdpdEJyYW5jaCwgY3JlYXRlSWZOb25leGlzdGVudDogYm9vbGVhbik6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEJyYW5jaGVzKClcbiAgICAgICAgLnRoZW4oKGFsbEJyYW5jaGVzKSA9PiB7XG4gICAgICAgICAgICAvLyBJZiB0aGVyZSBpcyBhIGJyYW5jaCB3aXRoIHRoZSBzYW1lIG5hbWUsIHdlIHNob3VsZCBub3QgdHJ5IHRvXG4gICAgICAgICAgICAvLyBjcmVhdGUgaXQuICBJbnN0ZWFkLCB3ZSBzaG91bGQganVzdCBjaGVjayBpdCBvdXQuXG4gICAgICAgICAgICBpZiAoXy5zb21lKGFsbEJyYW5jaGVzLCB7bmFtZTogYnJhbmNoLm5hbWV9KSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjcmVhdGVJZk5vbmV4aXN0ZW50ID0gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGFyZ3MgPSBbXG4gICAgICAgICAgICAgICAgXCJjaGVja291dFwiLFxuICAgICAgICAgICAgICAgIC4uLihjcmVhdGVJZk5vbmV4aXN0ZW50ID8gW1wiLWJcIl0gOiBbXSksXG4gICAgICAgICAgICAgICAgYnJhbmNoLm5hbWVcbiAgICAgICAgICAgIF07XG5cbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBhcmdzLCB7Y3dkOiB0aGlzLl9kaXIudG9TdHJpbmcoKX0pLmNsb3NlUHJvbWlzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge30pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2hlY2tzIG91dCB0aGUgc3BlY2lmaWVkIGNvbW1pdFxuICAgICAqIEBwYXJhbSBjb21taXQgLSBUaGUgY29tbWl0IHRvIGNoZWNrb3V0XG4gICAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSBjb21taXQgaXMgY2hlY2tlZCBvdXQuXG4gICAgICovXG4gICAgcHVibGljIGNoZWNrb3V0Q29tbWl0KGNvbW1pdDogQ29tbWl0SGFzaCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJjaGVja291dFwiLCBjb21taXQudG9TdHJpbmcoKV0sIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfSkuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHt9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFN0YWdlcyBhbGwgbW9kaWZpZWQgZmlsZXMgdGhhdCBhcmUgbm90IGJlaW5nIGlnbm9yZWQgKHZpYSAuZ2l0aWdub3JlKVxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciB0aGlzIEdpdFJlcG8gaW5zdGFuY2UgKHNvIHRoYXQgb3RoZXIgY2FsbHMgbWF5IGJlXG4gICAgICogY2hhaW5lZCkuXG4gICAgICovXG4gICAgcHVibGljIHN0YWdlQWxsKCk6IFByb21pc2U8R2l0UmVwbz5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJhZGRcIiwgXCIuXCJdLCB7Y3dkOiB0aGlzLl9kaXIudG9TdHJpbmcoKX0pXG4gICAgICAgIC5jbG9zZVByb21pc2VcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUHVzaGVzIHRoZSBjdXJyZW50IGJyYW5jaCB0byBhIHJlbW90ZVxuICAgICAqIEBwYXJhbSByZW1vdGVOYW1lIC0gVGhlIHJlbW90ZSB0byBwdXNoIHRvXG4gICAgICogQHBhcmFtIHNldFVwc3RyZWFtIC0gdHJ1ZSB0byBzZXQgdGhlIHJlbW90ZSdzIGJyYW5jaCBhcyB0aGUgdXBzdHJlYW1cbiAgICAgKiBicmFuY2hcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIHB1c2ggaGFzIGNvbXBsZXRlZC4gIFRoZVxuICAgICAqIHByb21pc2Ugd2lsbCByZWplY3Qgd2hlbiB3b3JraW5nIGluIGEgZGV0YWNoZWQgaGVhZCBzdGF0ZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgcHVzaEN1cnJlbnRCcmFuY2gocmVtb3RlTmFtZTogc3RyaW5nID0gXCJvcmlnaW5cIiwgc2V0VXBzdHJlYW06IGJvb2xlYW4gPSBmYWxzZSk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmdldEN1cnJlbnRCcmFuY2goKVxuICAgICAgICAudGhlbigoY3VyQnJhbmNoKSA9PiB7XG4gICAgICAgICAgICBpZiAoIWN1ckJyYW5jaClcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJUaGVyZSBpcyBubyBjdXJyZW50IGJyYW5jaCB0byBwdXNoLlwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgICAgICBcInB1c2hcIixcbiAgICAgICAgICAgICAgICAuLi4oc2V0VXBzdHJlYW0gPyBbXCItdVwiXSA6IFtdKSxcbiAgICAgICAgICAgICAgICByZW1vdGVOYW1lLFxuICAgICAgICAgICAgICAgIGN1ckJyYW5jaC5uYW1lXG4gICAgICAgICAgICBdO1xuICAgICAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfSkuY2xvc2VQcm9taXNlO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoZXJyKSA9PiB7XG4gICAgICAgICAgICBjb25zb2xlLmxvZyhgRXJyb3IgcHVzaGluZyBjdXJyZW50IGJyYW5jaDogJHtKU09OLnN0cmluZ2lmeShlcnIpfWApO1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG51bWJlciBvZiBjb21taXRzIGFoZWFkIGFuZCBiZWhpbmQgdGhlIGN1cnJlbnQgYnJhbmNoIGlzXG4gICAgICogQHBhcmFtIHRyYWNraW5nUmVtb3RlIC0gVGhlIHJlbW90ZSBjb250YWluaW5nIHRoZSB0cmFja2luZyBicmFuY2hcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIHJlc3VsdFxuICAgICAqL1xuICAgIHB1YmxpYyBnZXRDb21taXREZWx0YXModHJhY2tpbmdSZW1vdGU6IHN0cmluZyA9IFwib3JpZ2luXCIpOiBQcm9taXNlPHthaGVhZDogbnVtYmVyLCBiZWhpbmQ6IG51bWJlcn0+XG4gICAge1xuICAgICAgICAvLyBUT0RPOiBXcml0ZSB1bml0IHRlc3RzIGZvciB0aGlzIG1ldGhvZC5cblxuICAgICAgICByZXR1cm4gdGhpcy5nZXRDdXJyZW50QnJhbmNoKClcbiAgICAgICAgLnRoZW4oKGJyYW5jaCkgPT4ge1xuICAgICAgICAgICAgaWYgKCFicmFuY2gpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKFwiQ2Fubm90IGdldE51bUNvbW1pdHNBaGVhZCgpIHdoZW4gSEVBRCBpcyBub3Qgb24gYSBicmFuY2guXCIpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBUaGUgbmFtZXMgb2YgdGhlIHR3byBicmFuY2hlcyBpbiBxdWVzdGlvbi5cbiAgICAgICAgICAgIGNvbnN0IHRoaXNCcmFuY2hOYW1lID0gYnJhbmNoLm5hbWU7XG4gICAgICAgICAgICBjb25zdCB0cmFja2luZ0JyYW5jaE5hbWUgPSBgJHt0cmFja2luZ1JlbW90ZX0vJHt0aGlzQnJhbmNoTmFtZX1gO1xuXG4gICAgICAgICAgICBjb25zdCBudW1BaGVhZFByb21pc2UgPSBzcGF3bihcbiAgICAgICAgICAgICAgICBcImdpdFwiLFxuICAgICAgICAgICAgICAgIFtcInJldi1saXN0XCIsIHRoaXNCcmFuY2hOYW1lLCBcIi0tbm90XCIsIHRyYWNraW5nQnJhbmNoTmFtZSwgXCItLWNvdW50XCJdLFxuICAgICAgICAgICAgICAgIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfVxuICAgICAgICAgICAgKS5jbG9zZVByb21pc2U7XG5cbiAgICAgICAgICAgIGNvbnN0IG51bUJlaGluZFByb21pc2UgPSBzcGF3bihcbiAgICAgICAgICAgICAgICBcImdpdFwiLFxuICAgICAgICAgICAgICAgIFtcInJldi1saXN0XCIsIHRyYWNraW5nQnJhbmNoTmFtZSwgXCItLW5vdFwiLCB0aGlzQnJhbmNoTmFtZSwgXCItLWNvdW50XCJdLFxuICAgICAgICAgICAgICAgIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfVxuICAgICAgICAgICAgKS5jbG9zZVByb21pc2U7XG5cbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UuYWxsKFtudW1BaGVhZFByb21pc2UsIG51bUJlaGluZFByb21pc2VdKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHJlc3VsdHMpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgYWhlYWQ6IHBhcnNlSW50KHJlc3VsdHNbMF0sIDEwKSxcbiAgICAgICAgICAgICAgICBiZWhpbmQ6IHBhcnNlSW50KHJlc3VsdHNbMV0sIDEwKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvLyBUT0RPOiBUbyBnZXQgdGhlIHN0YWdlZCBmaWxlczpcbiAgICAvLyBnaXQgZGlmZiAtLW5hbWUtb25seSAtLWNhY2hlZFxuXG5cbiAgICAvKipcbiAgICAgKiBDb21taXRzIHN0YWdlZCBmaWxlc1xuICAgICAqIEBwYXJhbSBtc2cgLSBUaGUgY29tbWl0IG1lc3NhZ2VcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIG5ld2x5IGNyZWF0ZWQgR2l0IGxvZyBlbnRyeVxuICAgICAqL1xuICAgIHB1YmxpYyBjb21taXQobXNnOiBzdHJpbmcgPSBcIlwiKTogUHJvbWlzZTxJR2l0TG9nRW50cnk+XG4gICAge1xuICAgICAgICAvLyBUT0RPOiBBZGQgdW5pdCB0ZXN0cyBmb3IgdGhpcyBtZXRob2QuXG5cbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIFtcImNvbW1pdFwiLCBcIi1tXCIsIG1zZ10sIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAvLyBHZXQgdGhlIGNvbW1pdCBoYXNoXG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJnaXRcIiwgW1wicmV2LXBhcnNlXCIsIFwiSEVBRFwiXSwge2N3ZDogdGhpcy5fZGlyLnRvU3RyaW5nKCl9KS5jbG9zZVByb21pc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGRvdXQpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGNvbW1pdEhhc2ggPSBfLnRyaW0oc3Rkb3V0KTtcbiAgICAgICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJzaG93XCIsIGNvbW1pdEhhc2hdLCB7Y3dkOiB0aGlzLl9kaXIudG9TdHJpbmcoKX0pLmNsb3NlUHJvbWlzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKHN0ZG91dCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgbWF0Y2ggPSBHSVRfTE9HX0VOVFJZX1JFR0VYLmV4ZWMoc3Rkb3V0KTtcbiAgICAgICAgICAgIGlmICghbWF0Y2gpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBDb3VsZCBub3QgcGFyc2UgXCJnaXQgc2hvd1wiIG91dHB1dDpcXG4ke3N0ZG91dH1gKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgY29tbWl0SGFzaDogbWF0Y2hbMV0sXG4gICAgICAgICAgICAgICAgYXV0aG9yOiAgICAgbWF0Y2hbMl0sXG4gICAgICAgICAgICAgICAgdGltZXN0YW1wOiAgbmV3IERhdGUobWF0Y2hbM10pLFxuICAgICAgICAgICAgICAgIG1lc3NhZ2U6ICAgIG91dGRlbnQodHJpbUJsYW5rTGluZXMobWF0Y2hbNF0pKVxuICAgICAgICAgICAgfTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBGZXRjaGVzIGZyb20gdGhlIHNwZWNpZmllZCByZW1vdGUuXG4gICAgICogQHBhcmFtIHJlbW90ZU5hbWUgLSBUaGUgcmVtb3RlIHRvIGZldGNoIGZyb21cbiAgICAgKiBAcGFyYW0gZmV0Y2hUYWdzIC0gU2V0IHRvIHRydWUgaW4gb3JkZXIgdG8gZmV0Y2ggdGFncyB0aGF0IHBvaW50IHRvXG4gICAgICogb2JqZWN0cyB0aGF0IGFyZSBub3QgZG93bmxvYWRlZCAoc2VlIGdpdCBmZXRjaCBkb2NzKS5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIGNvbW1hbmQgY29tcGxldGVzXG4gICAgICogc3VjY2Vzc2Z1bGx5XG4gICAgICovXG4gICAgcHVibGljIGZldGNoKHJlbW90ZU5hbWU6IHN0cmluZyA9IFwib3JpZ2luXCIsIGZldGNoVGFnczogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgY29uc3QgYXJncyA9IFtcbiAgICAgICAgICAgIFwiZmV0Y2hcIixcbiAgICAgICAgICAgIC4uLmluc2VydElmKGZldGNoVGFncywgXCItLXRhZ3NcIiksXG4gICAgICAgICAgICByZW1vdGVOYW1lXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIHNwYXduKFwiZ2l0XCIsIGFyZ3MsIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfSkuY2xvc2VQcm9taXNlXG4gICAgICAgIC50aGVuKFxuICAgICAgICAgICAgKCkgPT4ge30sXG4gICAgICAgICAgICAoZXJyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5sb2coYEVycm9yIGZldGNoaW5nIGZyb20gJHtyZW1vdGVOYW1lfSByZW1vdGU6ICR7SlNPTi5zdHJpbmdpZnkoZXJyKX1gKTtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgICk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoaXMgcmVwbydzIGNvbW1pdCBsb2dcbiAgICAgKiBAcGFyYW0gZm9yY2VVcGRhdGUgLSB0cnVlIHRvIGdldCBhIGN1cnJlbnQgc25hcHNob3Qgb2YgdGhpcyByZXBvcyBsb2c7XG4gICAgICogZmFsc2UgaWYgYSBwcmV2aW91c2x5IGNhY2hlZCBsb2cgY2FuIGJlIHVzZWQgKG1vcmUgcGVyZm9ybWFudClcbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgYW4gYXJyYXkgb2YgR2l0IGxvZyBlbnRyaWVzXG4gICAgICovXG4gICAgcHVibGljIGdldExvZyhmb3JjZVVwZGF0ZT86IGJvb2xlYW4pOiBQcm9taXNlPEFycmF5PElHaXRMb2dFbnRyeT4+XG4gICAge1xuICAgICAgICBpZiAoZm9yY2VVcGRhdGUpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2xvZyA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIGxldCB1cGRhdGVQcm9taXNlOiBQcm9taXNlPHZvaWQ+O1xuXG4gICAgICAgIGlmICh0aGlzLl9sb2cgPT09IHVuZGVmaW5lZClcbiAgICAgICAge1xuICAgICAgICAgICAgdXBkYXRlUHJvbWlzZSA9IHRoaXMuZ2V0TG9nRW50cmllcygpXG4gICAgICAgICAgICAudGhlbigobG9nOiBBcnJheTxJR2l0TG9nRW50cnk+KSA9PiB7XG4gICAgICAgICAgICAgICAgdGhpcy5fbG9nID0gbG9nO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICB1cGRhdGVQcm9taXNlID0gQkJQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB1cGRhdGVQcm9taXNlXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2chO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBtZXRob2QgdGhhdCByZXRyaWV2ZXMgR2l0IGxvZyBlbnRyaWVzXG4gICAgICogQG1ldGhvZFxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBhbiBhcnJheSBvZiBzdHJ1Y3R1cmVzIGRlc2NyaWJpbmcgZWFjaCBjb21taXQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBnZXRMb2dFbnRyaWVzKCk6IFByb21pc2U8QXJyYXk8SUdpdExvZ0VudHJ5Pj5cbiAgICB7XG4gICAgICAgIHJldHVybiBzcGF3bihcImdpdFwiLCBbXCJsb2dcIl0sIHtjd2Q6IHRoaXMuX2Rpci50b1N0cmluZygpfSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBlbnRyaWVzOiBBcnJheTxJR2l0TG9nRW50cnk+ID0gW107XG4gICAgICAgICAgICBsZXQgbWF0Y2g6IFJlZ0V4cEV4ZWNBcnJheSB8IG51bGw7XG4gICAgICAgICAgICB3aGlsZSAoKG1hdGNoID0gR0lUX0xPR19FTlRSWV9SRUdFWC5leGVjKHN0ZG91dCkpICE9PSBudWxsKSAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgZW50cmllcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb21taXRIYXNoOiBtYXRjaFsxXSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGF1dGhvcjogICAgIG1hdGNoWzJdLFxuICAgICAgICAgICAgICAgICAgICAgICAgdGltZXN0YW1wOiAgbmV3IERhdGUobWF0Y2hbM10pLFxuICAgICAgICAgICAgICAgICAgICAgICAgbWVzc2FnZTogICAgb3V0ZGVudCh0cmltQmxhbmtMaW5lcyhtYXRjaFs0XSkpXG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBHaXQgbG9nIGxpc3RzIHRoZSBtb3N0IHJlY2VudCBlbnRyeSBmaXJzdC4gIFJldmVyc2UgdGhlIGFycmF5IHNvXG4gICAgICAgICAgICAvLyB0aGF0IHRoZSBtb3N0IHJlY2VudCBlbnRyeSBpcyB0aGUgbGFzdC5cbiAgICAgICAgICAgIF8ucmV2ZXJzZShlbnRyaWVzKTtcbiAgICAgICAgICAgIHJldHVybiBlbnRyaWVzO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxufVxuXG4vLyBUT0RPOiBUaGUgZm9sbG93aW5nIHdpbGwgbGlzdCBhbGwgdGFncyBwb2ludGluZyB0byB0aGUgc3BlY2lmaWVkIGNvbW1pdC5cbi8vIGdpdCB0YWcgLS1wb2ludHMtYXQgMzRiOGJmZlxuIl19
