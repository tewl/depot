"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var BBPromise = require("bluebird");
var file_1 = require("./file");
var promiseHelpers_1 = require("./promiseHelpers");
var pathHelpers_1 = require("./pathHelpers");
var unlinkAsync = promiseHelpers_1.promisify1(fs.unlink);
var rmdirAsync = promiseHelpers_1.promisify1(fs.rmdir);
var readdirAsync = promiseHelpers_1.promisify1(fs.readdir);
var mkdirAsync = promiseHelpers_1.promisify1(fs.mkdir);
var lstatAsync = promiseHelpers_1.promisify1(fs.lstat);
var Directory = /** @class */ (function () {
    // endregion
    function Directory(pathPart) {
        var pathParts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            pathParts[_i - 1] = arguments[_i];
        }
        var allParts = [pathPart].concat(pathParts);
        this._dirPath = pathHelpers_1.reducePathParts(allParts);
        // Remove trailing directory separator characters.
        while (_.endsWith(this._dirPath, path.sep)) {
            this._dirPath = this._dirPath.slice(0, -1);
        }
    }
    /**
     * Creates a Directory representing the relative path from `from` to `to`
     * @param from - The starting directory
     * @param to - The ending directory
     * @return A directory representing the relative path from `from` to `to`
     */
    Directory.relative = function (from, to) {
        var relPath = path.relative(from.toString(), to.toString());
        return new Directory(relPath);
    };
    /**
     * Calculates the parts of the relative path from `from` to `to`.
     * @param from - The starting point
     * @param to - The ending point
     * @return An array of strings representing the path segments needed to get
     * from `from` to `to`.
     */
    Directory.relativeParts = function (from, to) {
        var relPath = path.relative(from.toString(), to.toString());
        return relPath.split(path.sep);
    };
    Object.defineProperty(Directory.prototype, "dirName", {
        /**
         * Gets the name of this directory (without the preceding path)
         */
        get: function () {
            if (this._dirPath.length === 0) {
                // This directory represents the root of the filesystem.
                return "/";
            }
            else {
                return _.last(this._dirPath.split(path.sep));
            }
        },
        enumerable: true,
        configurable: true
    });
    Directory.prototype.toString = function () {
        return this._dirPath;
    };
    Directory.prototype.equals = function (otherDir) {
        return this.absPath() === otherDir.absPath();
    };
    /**
     * Gets the absolute path of this Directory.
     * @return The absolute path of this Directory
     */
    Directory.prototype.absPath = function () {
        return path.resolve(this._dirPath);
    };
    /**
     * Makes another Directory instance that is wrapping this Directory's
     * absolute path.
     * @return A new Directory representing this Directory's absolute path.
     */
    Directory.prototype.absolute = function () {
        return new Directory(this.absPath());
    };
    Directory.prototype.exists = function () {
        var _this = this;
        return new BBPromise(function (resolve) {
            fs.stat(_this._dirPath, function (err, stats) {
                if (!err && stats.isDirectory()) {
                    resolve(stats);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    };
    Directory.prototype.existsSync = function () {
        try {
            var stats = fs.statSync(this._dirPath);
            return stats.isDirectory() ? stats : undefined;
        }
        catch (err) {
            if (err.code === "ENOENT") {
                return undefined;
            }
            else {
                throw err;
            }
        }
    };
    Directory.prototype.isEmpty = function () {
        return readdirAsync(this._dirPath)
            .then(function (fsEntries) {
            return fsEntries.length === 0;
        });
    };
    Directory.prototype.isEmptySync = function () {
        var fsEntries = fs.readdirSync(this._dirPath);
        return fsEntries.length === 0;
    };
    Directory.prototype.ensureExists = function () {
        var _this = this;
        return this.exists()
            .then(function (stats) {
            if (stats) {
                return;
            }
            else {
                var parts = _this._dirPath.split(path.sep);
                // Create an array of successively longer paths, each one adding a
                // new directory onto the end.
                var dirsToCreate = parts.reduce(function (acc, curPart) {
                    if (acc.length === 0) {
                        if (curPart.length === 0) {
                            // The first item is an empty string.  The path must
                            // have started with the directory separator character
                            // (an absolute path was specified).
                            acc.push(path.sep);
                        }
                        else {
                            // The first item contains text.  A relative path must
                            // have been specified.
                            acc.push(curPart);
                        }
                    }
                    else {
                        var last = acc[acc.length - 1];
                        acc.push(path.join(last, curPart));
                    }
                    return acc;
                }, []);
                // Don't attempt to create the root of the filesystem.
                if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep)) {
                    dirsToCreate.shift();
                }
                // Map each successively longer path to a function that will create
                // it.
                var createFuncs = dirsToCreate.map(function (dirToCreate) {
                    return function () {
                        return mkdirAsync(dirToCreate)
                            .catch(function (err) {
                            // If the directory already exists, just keep going.
                            if (err.code !== "EEXIST") {
                                throw err;
                            }
                        });
                    };
                });
                // Execute the directory creation functions in sequence.
                return promiseHelpers_1.sequence(createFuncs, undefined);
            }
        })
            .then(function () {
            return _this;
        });
    };
    Directory.prototype.ensureExistsSync = function () {
        if (this.existsSync()) {
            return this;
        }
        var parts = this._dirPath.split(path.sep);
        // Create an array of successively longer paths, each one adding a
        // new directory onto the end.
        var dirsToCreate = parts.reduce(function (acc, curPart) {
            if (acc.length === 0) {
                if (curPart.length === 0) {
                    // The first item is an empty string.  The path must
                    // have started with the directory separator character
                    // (an absolute path was specified).
                    acc.push(path.sep);
                }
                else {
                    // The first item contains text.  A relative path must
                    // have been specified.
                    acc.push(curPart);
                }
            }
            else {
                var last = acc[acc.length - 1];
                acc.push(path.join(last, curPart));
            }
            return acc;
        }, []);
        // Don't attempt to create the root of the filesystem.
        if ((dirsToCreate.length > 0) && (dirsToCreate[0] === path.sep)) {
            dirsToCreate.shift();
        }
        dirsToCreate.forEach(function (curDir) {
            try {
                fs.mkdirSync(curDir);
            }
            catch (err) {
                // If the directory already exists, just keep going.
                if (err.code !== "EEXIST") {
                    throw err;
                }
            }
        });
        return this;
    };
    Directory.prototype.empty = function () {
        var _this = this;
        return this.delete()
            .then(function () {
            return _this.ensureExists();
        });
    };
    Directory.prototype.emptySync = function () {
        this.deleteSync();
        return this.ensureExistsSync();
    };
    Directory.prototype.delete = function () {
        var _this = this;
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                // The specified directory does not exist.  Do nothing.
                return;
            }
            else {
                // First, delete the contents of the specified directory.
                return readdirAsync(_this._dirPath)
                    .then(function (items) {
                    var absPaths = items.map(function (curItem) {
                        return path.join(_this._dirPath, curItem);
                    });
                    var deletePromises = absPaths.map(function (curAbsPath) {
                        if (fs.statSync(curAbsPath).isDirectory()) {
                            var subdir = new Directory(curAbsPath);
                            return subdir.delete();
                        }
                        else {
                            return unlinkAsync(curAbsPath);
                        }
                    });
                    return BBPromise.all(deletePromises);
                })
                    .then(function () {
                    // Now that all of the items in the directory have been deleted, delete
                    // the directory itself.
                    return rmdirAsync(_this._dirPath);
                });
            }
        });
    };
    Directory.prototype.deleteSync = function () {
        var _this = this;
        if (!this.existsSync()) {
            // The directory does not exist.  Do nothing.
            return;
        }
        // First, delete the contents of the specified directory.
        var fsItems = fs.readdirSync(this._dirPath);
        fsItems = fsItems.map(function (curFsItem) {
            return path.join(_this._dirPath, curFsItem);
        });
        fsItems.forEach(function (curFsItem) {
            var stats = fs.statSync(curFsItem);
            if (stats.isDirectory()) {
                var subdir = new Directory(curFsItem);
                subdir.deleteSync();
            }
            else {
                fs.unlinkSync(curFsItem);
            }
        });
        // Now that all of the items in the directory have been deleted, delete the
        // directory itself.
        fs.rmdirSync(this._dirPath);
    };
    /**
     * Reads the contents of this directory.
     * @param recursive - Whether to find subdirectories and files recursively
     * @return The contents of the directory, separated into a list of files and
     * a list of subdirectories.  The relative/absolute nature of the returned
     * File and Directory objects will be determined by the relative/absolute
     * nature of this Directory object.
     */
    Directory.prototype.contents = function (recursive) {
        if (recursive === void 0) { recursive = false; }
        var parentDirPath = this.toString();
        return readdirAsync(this._dirPath)
            .then(function (fsEntries) {
            var fsEntryPaths = fsEntries.map(function (curEntry) {
                return path.join(parentDirPath, curEntry);
            });
            var contents = { subdirs: [], files: [] };
            var promises = fsEntryPaths.map(function (curPath) {
                return lstatAsync(curPath)
                    .then(function (stats) {
                    if (stats.isFile()) {
                        contents.files.push(new file_1.File(curPath));
                    }
                    else if (stats.isDirectory()) {
                        contents.subdirs.push(new Directory(curPath));
                    }
                    // Note: We are ignoring symbolic links here.
                });
            });
            return BBPromise.all(promises)
                .then(function () {
                return contents;
            });
        })
            .then(function (contents) {
            if (!recursive) {
                return contents;
            }
            // Get the contents of each subdirectory.
            return BBPromise.all(_.map(contents.subdirs, function (curSubdir) { return curSubdir.contents(true); }))
                .then(function (subdirContents) {
                var e_1, _a;
                try {
                    // Put the contents of each subdirectory into the returned
                    // `contents` object.
                    for (var subdirContents_1 = __values(subdirContents), subdirContents_1_1 = subdirContents_1.next(); !subdirContents_1_1.done; subdirContents_1_1 = subdirContents_1.next()) {
                        var curContents = subdirContents_1_1.value;
                        contents.subdirs = _.concat(contents.subdirs, curContents.subdirs);
                        contents.files = _.concat(contents.files, curContents.files);
                    }
                }
                catch (e_1_1) { e_1 = { error: e_1_1 }; }
                finally {
                    try {
                        if (subdirContents_1_1 && !subdirContents_1_1.done && (_a = subdirContents_1.return)) _a.call(subdirContents_1);
                    }
                    finally { if (e_1) throw e_1.error; }
                }
                return contents;
            });
        });
    };
    /**
     * Reads the contents of this directory.
     * @param recursive - Whether to find subdirectories and files recursively
     * @return The contents of the directory, separated into a list of files and a
     * list of subdirectories.  All paths returned are absolute paths.
     */
    Directory.prototype.contentsSync = function (recursive) {
        if (recursive === void 0) { recursive = false; }
        var parentDirPath = this.toString();
        var fsEntries = fs.readdirSync(this._dirPath);
        fsEntries = fsEntries.map(function (curFsEntry) {
            return path.join(parentDirPath, curFsEntry);
        });
        var contents = { subdirs: [], files: [] };
        fsEntries.forEach(function (curFsEntry) {
            var stats = fs.lstatSync(curFsEntry);
            if (stats.isFile()) {
                contents.files.push(new file_1.File(curFsEntry));
            }
            else if (stats.isDirectory()) {
                contents.subdirs.push(new Directory(curFsEntry));
            }
            // Note: We are ignoring symbolic links here.
        });
        if (recursive) {
            contents.subdirs.forEach(function (curSubdir) {
                var subdirContents = curSubdir.contentsSync(true);
                contents.subdirs = _.concat(contents.subdirs, subdirContents.subdirs);
                contents.files = _.concat(contents.files, subdirContents.files);
            });
        }
        return contents;
    };
    /**
     * Recursively removes empty subdirectories from within this directory.
     * @return A Promise that is resolved when this directory has been pruned.
     */
    Directory.prototype.prune = function () {
        return this.contents()
            .then(function (contents) {
            var promises = contents.subdirs.map(function (curSubdir) {
                //
                // Prune the current subdirectory.
                //
                return curSubdir.prune()
                    .then(function () {
                    //
                    // If the subdirectory is now empty, delete it.
                    //
                    return curSubdir.isEmpty();
                })
                    .then(function (dirIsEmpty) {
                    if (dirIsEmpty) {
                        return curSubdir.delete();
                    }
                });
            });
            return BBPromise.all(promises)
                .then(function () {
            });
        });
    };
    /**
     * Recursively removes empty subdirectories from this directory.
     */
    Directory.prototype.pruneSync = function () {
        var contents = this.contentsSync();
        contents.subdirs.forEach(function (curSubdir) {
            curSubdir.pruneSync();
            //
            // If the subdirectory is now empty, delete it.
            //
            if (curSubdir.isEmptySync()) {
                curSubdir.deleteSync();
            }
        });
    };
    /**
     * Copies this directory to destDir.
     * @param destDir - The destination directory
     * @param copyRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     * @return A promise that is resolved with a Directory object representing
     * the destination directory.  If copyRoot is false, this will be destDir.
     * If copyRoot is true, this will be this Directory's counterpart
     * subdirectory in destDir.
     */
    Directory.prototype.copy = function (destDir, copyRoot) {
        var _this = this;
        if (copyRoot) {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            var thisDest_1 = new Directory(destDir, this.dirName);
            return thisDest_1.ensureExists()
                .then(function () {
                return _this.copy(thisDest_1, false);
            })
                .then(function () {
                return thisDest_1;
            });
        }
        return this.contents()
            .then(function (contents) {
            // Copy the files in this directory to the destination.
            var fileCopyPromises = contents.files.map(function (curFile) {
                return curFile.copy(destDir, curFile.fileName);
            });
            var dirCopyPromises = contents.subdirs.map(function (curSubdir) {
                return curSubdir.copy(destDir, true);
            });
            return BBPromise.all(_.concat(fileCopyPromises, dirCopyPromises));
        })
            .then(function () {
            return destDir;
        });
    };
    /**
     * Copies this directory to destDir.
     * @param destDir - The destination directory
     * @param copyRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     */
    Directory.prototype.copySync = function (destDir, copyRoot) {
        if (copyRoot) {
            // Copying this directory to the destination with copyRoot true just
            // means creating the counterpart to this directory in the
            // destination and then copying to that directory with copyRoot
            // false.
            var thisDest = new Directory(destDir, this.dirName);
            thisDest.ensureExistsSync();
            this.copySync(thisDest, false);
            return thisDest;
        }
        var contents = this.contentsSync();
        // Copy the files in this directory to the destination.
        contents.files.forEach(function (curFile) {
            curFile.copySync(destDir, curFile.fileName);
        });
        contents.subdirs.forEach(function (curSubdir) {
            curSubdir.copySync(destDir, true);
        });
        return destDir;
    };
    /**
     * Moves this Directory or the contents of this Directory to destDir.
     * @param destDir - The destination directory
     * @param moveRoot - If true, this directory name will be a subdirectory of
     * destDir.  If false, only the contents of this directory will be copied
     * into destDir.
     * @return A promise that is resolved with a Directory object representing
     * the destination directory.  If moveRoot is false, this will be destDir.
     * If moveRoot is true, this will be this Directory's counterpart
     * subdirectory in destDir.
     */
    Directory.prototype.move = function (destDir, moveRoot) {
        var _this = this;
        return destDir.ensureExists()
            .then(function () {
            return _this.copy(destDir, moveRoot);
        })
            .then(function (counterpartDestDir) {
            return _this.delete()
                .then(function () {
                return counterpartDestDir;
            });
        });
    };
    /**
     * Walks this Directory in a depth-first manner.
     * @param cb - A callback function that will be called for each subdirectory
     *   and file encountered.  It is invoked with one argument: (item).  When
     *   item is a Directory, the function returns a boolean indicating whether
     *   to recurse into the directory.  When item is a File, the returned value
     *   is ignored.
     * @return A promise that is resolved when the directory tree has been
     *   completely walked.
     */
    Directory.prototype.walk = function (cb) {
        return __awaiter(this, void 0, void 0, function () {
            var thisDirectoryContents, filePromises, _a, _b, curSubDir, shouldRecurse, e_2_1;
            var e_2, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0: return [4 /*yield*/, this.contents(false)];
                    case 1:
                        thisDirectoryContents = _d.sent();
                        filePromises = _.map(thisDirectoryContents.files, function (curFile) {
                            return BBPromise.resolve(cb(curFile));
                        });
                        return [4 /*yield*/, BBPromise.all(filePromises)];
                    case 2:
                        _d.sent();
                        _d.label = 3;
                    case 3:
                        _d.trys.push([3, 9, 10, 11]);
                        _a = __values(thisDirectoryContents.subdirs), _b = _a.next();
                        _d.label = 4;
                    case 4:
                        if (!!_b.done) return [3 /*break*/, 8];
                        curSubDir = _b.value;
                        return [4 /*yield*/, BBPromise.resolve(cb(curSubDir))];
                    case 5:
                        shouldRecurse = _d.sent();
                        if (!shouldRecurse) return [3 /*break*/, 7];
                        return [4 /*yield*/, curSubDir.walk(cb)];
                    case 6:
                        _d.sent();
                        _d.label = 7;
                    case 7:
                        _b = _a.next();
                        return [3 /*break*/, 4];
                    case 8: return [3 /*break*/, 11];
                    case 9:
                        e_2_1 = _d.sent();
                        e_2 = { error: e_2_1 };
                        return [3 /*break*/, 11];
                    case 10:
                        try {
                            if (_b && !_b.done && (_c = _a.return)) _c.call(_a);
                        }
                        finally { if (e_2) throw e_2.error; }
                        return [7 /*endfinally*/];
                    case 11: return [2 /*return*/];
                }
            });
        });
    };
    return Directory;
}());
exports.Directory = Directory;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUMsR0FBRyxDQUFDLHFCQUFxQixDQUFDLEtBQUssRUFBRSxVQUFDLE9BQWE7NEJBQzNGLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUMsQ0FBQzt3QkFDMUMsQ0FBQyxDQUFDLENBQUM7d0JBQ0gscUJBQU0sU0FBUyxDQUFDLEdBQUcsQ0FBQyxZQUFZLENBQUMsRUFBQTs7d0JBQWpDLFNBQWlDLENBQUM7Ozs7d0JBR1YsS0FBQSxTQUFBLHFCQUFxQixDQUFDLE9BQU8sQ0FBQTs7Ozt3QkFBMUMsU0FBUzt3QkFDTSxxQkFBTSxTQUFTLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQyxTQUFTLENBQUMsQ0FBQyxFQUFBOzt3QkFBdEQsYUFBYSxHQUFHLFNBQXNDOzZCQUN4RCxhQUFhLEVBQWIsd0JBQWE7d0JBQ2IscUJBQU0sU0FBUyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUMsRUFBQTs7d0JBQXhCLFNBQXdCLENBQUM7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0tBR3BDO0lBQ0wsZ0JBQUM7QUFBRCxDQTFvQkEsQUEwb0JDLElBQUE7QUExb0JZLDhCQUFTIiwiZmlsZSI6ImRpcmVjdG9yeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgcGF0aCBmcm9tIFwicGF0aFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7cHJvbWlzaWZ5MSwgc2VxdWVuY2V9IGZyb20gXCIuL3Byb21pc2VIZWxwZXJzXCI7XG5pbXBvcnQge1BhdGhQYXJ0LCByZWR1Y2VQYXRoUGFydHN9IGZyb20gXCIuL3BhdGhIZWxwZXJzXCI7XG5cblxuY29uc3QgdW5saW5rQXN5bmMgPSBwcm9taXNpZnkxPHZvaWQsIHN0cmluZz4oZnMudW5saW5rKTtcbmNvbnN0IHJtZGlyQXN5bmMgPSBwcm9taXNpZnkxPHZvaWQsIHN0cmluZz4oZnMucm1kaXIpO1xuY29uc3QgcmVhZGRpckFzeW5jID0gcHJvbWlzaWZ5MTxBcnJheTxzdHJpbmc+LCBzdHJpbmc+KGZzLnJlYWRkaXIpO1xuY29uc3QgbWtkaXJBc3luYyA9IHByb21pc2lmeTE8dm9pZCwgc3RyaW5nPihmcy5ta2Rpcik7XG5jb25zdCBsc3RhdEFzeW5jICA9IHByb21pc2lmeTE8ZnMuU3RhdHMsIHN0cmluZz4oZnMubHN0YXQpO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSURpcmVjdG9yeUNvbnRlbnRzIHtcbiAgICBzdWJkaXJzOiBBcnJheTxEaXJlY3Rvcnk+O1xuICAgIGZpbGVzOiAgIEFycmF5PEZpbGU+O1xufVxuXG5cbmV4cG9ydCB0eXBlIFdhbGtDYWxsYmFjayA9IChpdGVtOiBEaXJlY3RvcnkgfCBGaWxlKSA9PiBib29sZWFuIHwgUHJvbWlzZTxib29sZWFuPjtcblxuXG5leHBvcnQgY2xhc3MgRGlyZWN0b3J5XG57XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgRGlyZWN0b3J5IHJlcHJlc2VudGluZyB0aGUgcmVsYXRpdmUgcGF0aCBmcm9tIGBmcm9tYCB0byBgdG9gXG4gICAgICogQHBhcmFtIGZyb20gLSBUaGUgc3RhcnRpbmcgZGlyZWN0b3J5XG4gICAgICogQHBhcmFtIHRvIC0gVGhlIGVuZGluZyBkaXJlY3RvcnlcbiAgICAgKiBAcmV0dXJuIEEgZGlyZWN0b3J5IHJlcHJlc2VudGluZyB0aGUgcmVsYXRpdmUgcGF0aCBmcm9tIGBmcm9tYCB0byBgdG9gXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZWxhdGl2ZShmcm9tOiBEaXJlY3RvcnksIHRvOiBEaXJlY3RvcnkpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIGNvbnN0IHJlbFBhdGggPSBwYXRoLnJlbGF0aXZlKGZyb20udG9TdHJpbmcoKSwgdG8udG9TdHJpbmcoKSk7XG4gICAgICAgIHJldHVybiBuZXcgRGlyZWN0b3J5KHJlbFBhdGgpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyB0aGUgcGFydHMgb2YgdGhlIHJlbGF0aXZlIHBhdGggZnJvbSBgZnJvbWAgdG8gYHRvYC5cbiAgICAgKiBAcGFyYW0gZnJvbSAtIFRoZSBzdGFydGluZyBwb2ludFxuICAgICAqIEBwYXJhbSB0byAtIFRoZSBlbmRpbmcgcG9pbnRcbiAgICAgKiBAcmV0dXJuIEFuIGFycmF5IG9mIHN0cmluZ3MgcmVwcmVzZW50aW5nIHRoZSBwYXRoIHNlZ21lbnRzIG5lZWRlZCB0byBnZXRcbiAgICAgKiBmcm9tIGBmcm9tYCB0byBgdG9gLlxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgcmVsYXRpdmVQYXJ0cyhmcm9tOiBEaXJlY3RvcnksIHRvOiBEaXJlY3RvcnkpOiBBcnJheTxzdHJpbmc+XG4gICAge1xuICAgICAgICBjb25zdCByZWxQYXRoID0gcGF0aC5yZWxhdGl2ZShmcm9tLnRvU3RyaW5nKCksIHRvLnRvU3RyaW5nKCkpO1xuICAgICAgICByZXR1cm4gcmVsUGF0aC5zcGxpdChwYXRoLnNlcCk7XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGlyUGF0aDogc3RyaW5nO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IocGF0aFBhcnQ6IFBhdGhQYXJ0LCAuLi5wYXRoUGFydHM6IEFycmF5PFBhdGhQYXJ0PilcbiAgICB7XG4gICAgICAgIGNvbnN0IGFsbFBhcnRzOiBBcnJheTxQYXRoUGFydD4gPSBbcGF0aFBhcnRdLmNvbmNhdChwYXRoUGFydHMpO1xuICAgICAgICB0aGlzLl9kaXJQYXRoID0gcmVkdWNlUGF0aFBhcnRzKGFsbFBhcnRzKTtcblxuICAgICAgICAvLyBSZW1vdmUgdHJhaWxpbmcgZGlyZWN0b3J5IHNlcGFyYXRvciBjaGFyYWN0ZXJzLlxuICAgICAgICB3aGlsZSAoXy5lbmRzV2l0aCh0aGlzLl9kaXJQYXRoLCBwYXRoLnNlcCkpIHtcbiAgICAgICAgICAgIHRoaXMuX2RpclBhdGggPSB0aGlzLl9kaXJQYXRoLnNsaWNlKDAsIC0xKTtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbmFtZSBvZiB0aGlzIGRpcmVjdG9yeSAod2l0aG91dCB0aGUgcHJlY2VkaW5nIHBhdGgpXG4gICAgICovXG4gICAgcHVibGljIGdldCBkaXJOYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuX2RpclBhdGgubGVuZ3RoID09PSAwKVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBUaGlzIGRpcmVjdG9yeSByZXByZXNlbnRzIHRoZSByb290IG9mIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgICAgICAgcmV0dXJuIFwiL1wiO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIF8ubGFzdCh0aGlzLl9kaXJQYXRoLnNwbGl0KHBhdGguc2VwKSkhO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZGlyUGF0aDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBlcXVhbHMob3RoZXJEaXI6IERpcmVjdG9yeSk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmFic1BhdGgoKSA9PT0gb3RoZXJEaXIuYWJzUGF0aCgpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgYWJzb2x1dGUgcGF0aCBvZiB0aGlzIERpcmVjdG9yeS5cbiAgICAgKiBAcmV0dXJuIFRoZSBhYnNvbHV0ZSBwYXRoIG9mIHRoaXMgRGlyZWN0b3J5XG4gICAgICovXG4gICAgcHVibGljIGFic1BhdGgoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gcGF0aC5yZXNvbHZlKHRoaXMuX2RpclBhdGgpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYW5vdGhlciBEaXJlY3RvcnkgaW5zdGFuY2UgdGhhdCBpcyB3cmFwcGluZyB0aGlzIERpcmVjdG9yeSdzXG4gICAgICogYWJzb2x1dGUgcGF0aC5cbiAgICAgKiBAcmV0dXJuIEEgbmV3IERpcmVjdG9yeSByZXByZXNlbnRpbmcgdGhpcyBEaXJlY3RvcnkncyBhYnNvbHV0ZSBwYXRoLlxuICAgICAqL1xuICAgIHB1YmxpYyBhYnNvbHV0ZSgpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgRGlyZWN0b3J5KHRoaXMuYWJzUGF0aCgpKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBleGlzdHMoKTogUHJvbWlzZTxmcy5TdGF0cyB8IHVuZGVmaW5lZD5cbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgQkJQcm9taXNlPGZzLlN0YXRzIHwgdW5kZWZpbmVkPigocmVzb2x2ZTogKHJlc3VsdDogZnMuU3RhdHMgfCB1bmRlZmluZWQpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGZzLnN0YXQodGhpcy5fZGlyUGF0aCwgKGVycjogYW55LCBzdGF0czogZnMuU3RhdHMpID0+IHtcblxuICAgICAgICAgICAgICAgIGlmICghZXJyICYmIHN0YXRzLmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0YXRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGV4aXN0c1N5bmMoKTogZnMuU3RhdHMgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKHRoaXMuX2RpclBhdGgpO1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRzLmlzRGlyZWN0b3J5KCkgPyBzdGF0cyA6IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICBpZiAoZXJyLmNvZGUgPT09IFwiRU5PRU5UXCIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBlcnI7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHB1YmxpYyBpc0VtcHR5KCk6IFByb21pc2U8Ym9vbGVhbj5cbiAgICB7XG4gICAgICAgIHJldHVybiByZWFkZGlyQXN5bmModGhpcy5fZGlyUGF0aClcbiAgICAgICAgLnRoZW4oKGZzRW50cmllcykgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGZzRW50cmllcy5sZW5ndGggPT09IDA7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGlzRW1wdHlTeW5jKCk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIGNvbnN0IGZzRW50cmllcyA9IGZzLnJlYWRkaXJTeW5jKHRoaXMuX2RpclBhdGgpO1xuICAgICAgICByZXR1cm4gZnNFbnRyaWVzLmxlbmd0aCA9PT0gMDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBlbnN1cmVFeGlzdHMoKTogUHJvbWlzZTxEaXJlY3Rvcnk+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5leGlzdHMoKVxuICAgICAgICAudGhlbigoc3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmIChzdGF0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29uc3QgcGFydHMgPSB0aGlzLl9kaXJQYXRoLnNwbGl0KHBhdGguc2VwKTtcblxuICAgICAgICAgICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBzdWNjZXNzaXZlbHkgbG9uZ2VyIHBhdGhzLCBlYWNoIG9uZSBhZGRpbmcgYVxuICAgICAgICAgICAgICAgIC8vIG5ldyBkaXJlY3Rvcnkgb250byB0aGUgZW5kLlxuICAgICAgICAgICAgICAgIGNvbnN0IGRpcnNUb0NyZWF0ZSA9IHBhcnRzLnJlZHVjZSgoYWNjOiBBcnJheTxzdHJpbmc+LCBjdXJQYXJ0OiBzdHJpbmcpOiBBcnJheTxzdHJpbmc+ID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGFjYy5sZW5ndGggPT09IDApXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjdXJQYXJ0Lmxlbmd0aCA9PT0gMClcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZmlyc3QgaXRlbSBpcyBhbiBlbXB0eSBzdHJpbmcuICBUaGUgcGF0aCBtdXN0XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gaGF2ZSBzdGFydGVkIHdpdGggdGhlIGRpcmVjdG9yeSBzZXBhcmF0b3IgY2hhcmFjdGVyXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKGFuIGFic29sdXRlIHBhdGggd2FzIHNwZWNpZmllZCkuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2gocGF0aC5zZXApO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBmaXJzdCBpdGVtIGNvbnRhaW5zIHRleHQuICBBIHJlbGF0aXZlIHBhdGggbXVzdFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIGhhdmUgYmVlbiBzcGVjaWZpZWQuXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2goY3VyUGFydCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gYWNjW2FjYy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGFjYy5wdXNoKHBhdGguam9pbihsYXN0LCBjdXJQYXJ0KSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgICAgICAgICB9LCBbXSk7XG5cbiAgICAgICAgICAgICAgICAvLyBEb24ndCBhdHRlbXB0IHRvIGNyZWF0ZSB0aGUgcm9vdCBvZiB0aGUgZmlsZXN5c3RlbS5cbiAgICAgICAgICAgICAgICBpZiAoKGRpcnNUb0NyZWF0ZS5sZW5ndGggPiAwKSAmJiAoZGlyc1RvQ3JlYXRlWzBdID09PSBwYXRoLnNlcCkpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICBkaXJzVG9DcmVhdGUuc2hpZnQoKTtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICAvLyBNYXAgZWFjaCBzdWNjZXNzaXZlbHkgbG9uZ2VyIHBhdGggdG8gYSBmdW5jdGlvbiB0aGF0IHdpbGwgY3JlYXRlXG4gICAgICAgICAgICAgICAgLy8gaXQuXG4gICAgICAgICAgICAgICAgY29uc3QgY3JlYXRlRnVuY3MgPSBkaXJzVG9DcmVhdGUubWFwKChkaXJUb0NyZWF0ZTogc3RyaW5nKSA9PlxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuICgpOiBQcm9taXNlPHZvaWQ+ID0+XG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBta2RpckFzeW5jKGRpclRvQ3JlYXRlKVxuICAgICAgICAgICAgICAgICAgICAgICAgLmNhdGNoKChlcnIpID0+XG4gICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIGRpcmVjdG9yeSBhbHJlYWR5IGV4aXN0cywganVzdCBrZWVwIGdvaW5nLlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIuY29kZSAhPT0gXCJFRVhJU1RcIilcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgICAgIC8vIEV4ZWN1dGUgdGhlIGRpcmVjdG9yeSBjcmVhdGlvbiBmdW5jdGlvbnMgaW4gc2VxdWVuY2UuXG4gICAgICAgICAgICAgICAgcmV0dXJuIHNlcXVlbmNlKGNyZWF0ZUZ1bmNzLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcztcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZW5zdXJlRXhpc3RzU3luYygpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIGlmICh0aGlzLmV4aXN0c1N5bmMoKSlcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwYXJ0cyA9IHRoaXMuX2RpclBhdGguc3BsaXQocGF0aC5zZXApO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhbiBhcnJheSBvZiBzdWNjZXNzaXZlbHkgbG9uZ2VyIHBhdGhzLCBlYWNoIG9uZSBhZGRpbmcgYVxuICAgICAgICAvLyBuZXcgZGlyZWN0b3J5IG9udG8gdGhlIGVuZC5cbiAgICAgICAgY29uc3QgZGlyc1RvQ3JlYXRlID0gcGFydHMucmVkdWNlKChhY2M6IEFycmF5PHN0cmluZz4sIGN1clBhcnQ6IHN0cmluZyk6IEFycmF5PHN0cmluZz4gPT4ge1xuICAgICAgICAgICAgaWYgKGFjYy5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICBpZiAoY3VyUGFydC5sZW5ndGggPT09IDApIHtcbiAgICAgICAgICAgICAgICAgICAgLy8gVGhlIGZpcnN0IGl0ZW0gaXMgYW4gZW1wdHkgc3RyaW5nLiAgVGhlIHBhdGggbXVzdFxuICAgICAgICAgICAgICAgICAgICAvLyBoYXZlIHN0YXJ0ZWQgd2l0aCB0aGUgZGlyZWN0b3J5IHNlcGFyYXRvciBjaGFyYWN0ZXJcbiAgICAgICAgICAgICAgICAgICAgLy8gKGFuIGFic29sdXRlIHBhdGggd2FzIHNwZWNpZmllZCkuXG4gICAgICAgICAgICAgICAgICAgIGFjYy5wdXNoKHBhdGguc2VwKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgZmlyc3QgaXRlbSBjb250YWlucyB0ZXh0LiAgQSByZWxhdGl2ZSBwYXRoIG11c3RcbiAgICAgICAgICAgICAgICAgICAgLy8gaGF2ZSBiZWVuIHNwZWNpZmllZC5cbiAgICAgICAgICAgICAgICAgICAgYWNjLnB1c2goY3VyUGFydCk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBjb25zdCBsYXN0ID0gYWNjW2FjYy5sZW5ndGggLSAxXTtcbiAgICAgICAgICAgICAgICBhY2MucHVzaChwYXRoLmpvaW4obGFzdCwgY3VyUGFydCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcmV0dXJuIGFjYztcbiAgICAgICAgfSwgW10pO1xuXG4gICAgICAgIC8vIERvbid0IGF0dGVtcHQgdG8gY3JlYXRlIHRoZSByb290IG9mIHRoZSBmaWxlc3lzdGVtLlxuICAgICAgICBpZiAoKGRpcnNUb0NyZWF0ZS5sZW5ndGggPiAwKSAmJiAoZGlyc1RvQ3JlYXRlWzBdID09PSBwYXRoLnNlcCkpIHtcbiAgICAgICAgICAgIGRpcnNUb0NyZWF0ZS5zaGlmdCgpO1xuICAgICAgICB9XG5cbiAgICAgICAgZGlyc1RvQ3JlYXRlLmZvckVhY2goKGN1ckRpcikgPT4ge1xuICAgICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgICAgICBmcy5ta2RpclN5bmMoY3VyRGlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgZGlyZWN0b3J5IGFscmVhZHkgZXhpc3RzLCBqdXN0IGtlZXAgZ29pbmcuXG4gICAgICAgICAgICAgICAgaWYgKGVyci5jb2RlICE9PSBcIkVFWElTVFwiKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuXG4gICAgcHVibGljIGVtcHR5KCk6IFByb21pc2U8RGlyZWN0b3J5PlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZW5zdXJlRXhpc3RzKCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGVtcHR5U3luYygpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIHRoaXMuZGVsZXRlU3luYygpO1xuICAgICAgICByZXR1cm4gdGhpcy5lbnN1cmVFeGlzdHNTeW5jKCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZGVsZXRlKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdGF0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAvLyBUaGUgc3BlY2lmaWVkIGRpcmVjdG9yeSBkb2VzIG5vdCBleGlzdC4gIERvIG5vdGhpbmcuXG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIC8vIEZpcnN0LCBkZWxldGUgdGhlIGNvbnRlbnRzIG9mIHRoZSBzcGVjaWZpZWQgZGlyZWN0b3J5LlxuICAgICAgICAgICAgICAgIHJldHVybiByZWFkZGlyQXN5bmModGhpcy5fZGlyUGF0aClcbiAgICAgICAgICAgICAgICAudGhlbigoaXRlbXM6IEFycmF5PHN0cmluZz4pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY29uc3QgYWJzUGF0aHMgPSBpdGVtcy5tYXAoKGN1ckl0ZW0pID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXRoLmpvaW4odGhpcy5fZGlyUGF0aCwgY3VySXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IGRlbGV0ZVByb21pc2VzID0gYWJzUGF0aHMubWFwKChjdXJBYnNQYXRoOiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChmcy5zdGF0U3luYyhjdXJBYnNQYXRoKS5pc0RpcmVjdG9yeSgpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc3Qgc3ViZGlyID0gbmV3IERpcmVjdG9yeShjdXJBYnNQYXRoKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gc3ViZGlyLmRlbGV0ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gdW5saW5rQXN5bmMoY3VyQWJzUGF0aCk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UuYWxsKGRlbGV0ZVByb21pc2VzKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy8gTm93IHRoYXQgYWxsIG9mIHRoZSBpdGVtcyBpbiB0aGUgZGlyZWN0b3J5IGhhdmUgYmVlbiBkZWxldGVkLCBkZWxldGVcbiAgICAgICAgICAgICAgICAgICAgLy8gdGhlIGRpcmVjdG9yeSBpdHNlbGYuXG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBybWRpckFzeW5jKHRoaXMuX2RpclBhdGgpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBkZWxldGVTeW5jKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICghdGhpcy5leGlzdHNTeW5jKCkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFRoZSBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3QuICBEbyBub3RoaW5nLlxuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gRmlyc3QsIGRlbGV0ZSB0aGUgY29udGVudHMgb2YgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkuXG4gICAgICAgIGxldCBmc0l0ZW1zOiBBcnJheTxzdHJpbmc+ID0gZnMucmVhZGRpclN5bmModGhpcy5fZGlyUGF0aCk7XG4gICAgICAgIGZzSXRlbXMgPSBmc0l0ZW1zLm1hcCgoY3VyRnNJdGVtKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKHRoaXMuX2RpclBhdGgsIGN1ckZzSXRlbSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGZzSXRlbXMuZm9yRWFjaCgoY3VyRnNJdGVtKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKGN1ckZzSXRlbSk7XG4gICAgICAgICAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIGNvbnN0IHN1YmRpciA9IG5ldyBEaXJlY3RvcnkoY3VyRnNJdGVtKTtcbiAgICAgICAgICAgICAgICBzdWJkaXIuZGVsZXRlU3luYygpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgZnMudW5saW5rU3luYyhjdXJGc0l0ZW0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICAvLyBOb3cgdGhhdCBhbGwgb2YgdGhlIGl0ZW1zIGluIHRoZSBkaXJlY3RvcnkgaGF2ZSBiZWVuIGRlbGV0ZWQsIGRlbGV0ZSB0aGVcbiAgICAgICAgLy8gZGlyZWN0b3J5IGl0c2VsZi5cbiAgICAgICAgZnMucm1kaXJTeW5jKHRoaXMuX2RpclBhdGgpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSByZWN1cnNpdmUgLSBXaGV0aGVyIHRvIGZpbmQgc3ViZGlyZWN0b3JpZXMgYW5kIGZpbGVzIHJlY3Vyc2l2ZWx5XG4gICAgICogQHJldHVybiBUaGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeSwgc2VwYXJhdGVkIGludG8gYSBsaXN0IG9mIGZpbGVzIGFuZFxuICAgICAqIGEgbGlzdCBvZiBzdWJkaXJlY3Rvcmllcy4gIFRoZSByZWxhdGl2ZS9hYnNvbHV0ZSBuYXR1cmUgb2YgdGhlIHJldHVybmVkXG4gICAgICogRmlsZSBhbmQgRGlyZWN0b3J5IG9iamVjdHMgd2lsbCBiZSBkZXRlcm1pbmVkIGJ5IHRoZSByZWxhdGl2ZS9hYnNvbHV0ZVxuICAgICAqIG5hdHVyZSBvZiB0aGlzIERpcmVjdG9yeSBvYmplY3QuXG4gICAgICovXG4gICAgcHVibGljIGNvbnRlbnRzKHJlY3Vyc2l2ZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTxJRGlyZWN0b3J5Q29udGVudHM+XG4gICAge1xuICAgICAgICBjb25zdCBwYXJlbnREaXJQYXRoID0gdGhpcy50b1N0cmluZygpO1xuXG4gICAgICAgIHJldHVybiByZWFkZGlyQXN5bmModGhpcy5fZGlyUGF0aClcbiAgICAgICAgLnRoZW4oKGZzRW50cmllcykgPT4ge1xuICAgICAgICAgICAgY29uc3QgZnNFbnRyeVBhdGhzID0gZnNFbnRyaWVzLm1hcCgoY3VyRW50cnkpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gcGF0aC5qb2luKHBhcmVudERpclBhdGgsIGN1ckVudHJ5KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBjb25zdCBjb250ZW50czogSURpcmVjdG9yeUNvbnRlbnRzID0ge3N1YmRpcnM6IFtdLCBmaWxlczogW119O1xuXG4gICAgICAgICAgICBjb25zdCBwcm9taXNlcyA9IGZzRW50cnlQYXRocy5tYXAoKGN1clBhdGgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gbHN0YXRBc3luYyhjdXJQYXRoKVxuICAgICAgICAgICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc3RhdHMuaXNGaWxlKCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzLmZpbGVzLnB1c2gobmV3IEZpbGUoY3VyUGF0aCkpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnRlbnRzLnN1YmRpcnMucHVzaChuZXcgRGlyZWN0b3J5KGN1clBhdGgpKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAvLyBOb3RlOiBXZSBhcmUgaWdub3Jpbmcgc3ltYm9saWMgbGlua3MgaGVyZS5cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLmFsbChwcm9taXNlcylcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY29udGVudHM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKGNvbnRlbnRzOiBJRGlyZWN0b3J5Q29udGVudHMpID0+IHtcbiAgICAgICAgICAgIGlmICghcmVjdXJzaXZlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnRzO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBHZXQgdGhlIGNvbnRlbnRzIG9mIGVhY2ggc3ViZGlyZWN0b3J5LlxuICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5hbGw8SURpcmVjdG9yeUNvbnRlbnRzPihfLm1hcChjb250ZW50cy5zdWJkaXJzLCAoY3VyU3ViZGlyKSA9PiBjdXJTdWJkaXIuY29udGVudHModHJ1ZSkpKVxuICAgICAgICAgICAgLnRoZW4oKHN1YmRpckNvbnRlbnRzOiBBcnJheTxJRGlyZWN0b3J5Q29udGVudHM+KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8gUHV0IHRoZSBjb250ZW50cyBvZiBlYWNoIHN1YmRpcmVjdG9yeSBpbnRvIHRoZSByZXR1cm5lZFxuICAgICAgICAgICAgICAgIC8vIGBjb250ZW50c2Agb2JqZWN0LlxuICAgICAgICAgICAgICAgIGZvciAoY29uc3QgY3VyQ29udGVudHMgb2Ygc3ViZGlyQ29udGVudHMpIHtcbiAgICAgICAgICAgICAgICAgICAgY29udGVudHMuc3ViZGlycyA9IF8uY29uY2F0KGNvbnRlbnRzLnN1YmRpcnMsIGN1ckNvbnRlbnRzLnN1YmRpcnMpO1xuICAgICAgICAgICAgICAgICAgICBjb250ZW50cy5maWxlcyA9IF8uY29uY2F0KGNvbnRlbnRzLmZpbGVzLCBjdXJDb250ZW50cy5maWxlcyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmV0dXJuIGNvbnRlbnRzO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgdGhlIGNvbnRlbnRzIG9mIHRoaXMgZGlyZWN0b3J5LlxuICAgICAqIEBwYXJhbSByZWN1cnNpdmUgLSBXaGV0aGVyIHRvIGZpbmQgc3ViZGlyZWN0b3JpZXMgYW5kIGZpbGVzIHJlY3Vyc2l2ZWx5XG4gICAgICogQHJldHVybiBUaGUgY29udGVudHMgb2YgdGhlIGRpcmVjdG9yeSwgc2VwYXJhdGVkIGludG8gYSBsaXN0IG9mIGZpbGVzIGFuZCBhXG4gICAgICogbGlzdCBvZiBzdWJkaXJlY3Rvcmllcy4gIEFsbCBwYXRocyByZXR1cm5lZCBhcmUgYWJzb2x1dGUgcGF0aHMuXG4gICAgICovXG4gICAgcHVibGljIGNvbnRlbnRzU3luYyhyZWN1cnNpdmU6IGJvb2xlYW4gPSBmYWxzZSk6IElEaXJlY3RvcnlDb250ZW50c1xuICAgIHtcbiAgICAgICAgY29uc3QgcGFyZW50RGlyUGF0aCA9IHRoaXMudG9TdHJpbmcoKTtcblxuICAgICAgICBsZXQgZnNFbnRyaWVzID0gZnMucmVhZGRpclN5bmModGhpcy5fZGlyUGF0aCk7XG4gICAgICAgIGZzRW50cmllcyA9IGZzRW50cmllcy5tYXAoKGN1ckZzRW50cnkpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBwYXRoLmpvaW4ocGFyZW50RGlyUGF0aCwgY3VyRnNFbnRyeSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnN0IGNvbnRlbnRzOiBJRGlyZWN0b3J5Q29udGVudHMgPSB7c3ViZGlyczogW10sIGZpbGVzOiBbXX07XG4gICAgICAgIGZzRW50cmllcy5mb3JFYWNoKChjdXJGc0VudHJ5KSA9PiB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGZzLmxzdGF0U3luYyhjdXJGc0VudHJ5KTtcbiAgICAgICAgICAgIGlmIChzdGF0cy5pc0ZpbGUoKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjb250ZW50cy5maWxlcy5wdXNoKG5ldyBGaWxlKGN1ckZzRW50cnkpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKHN0YXRzLmlzRGlyZWN0b3J5KCkpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgY29udGVudHMuc3ViZGlycy5wdXNoKG5ldyBEaXJlY3RvcnkoY3VyRnNFbnRyeSkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgLy8gTm90ZTogV2UgYXJlIGlnbm9yaW5nIHN5bWJvbGljIGxpbmtzIGhlcmUuXG4gICAgICAgIH0pO1xuXG4gICAgICAgIGlmIChyZWN1cnNpdmUpIHtcbiAgICAgICAgICAgIGNvbnRlbnRzLnN1YmRpcnMuZm9yRWFjaCgoY3VyU3ViZGlyKSA9PiB7XG4gICAgICAgICAgICAgICAgY29uc3Qgc3ViZGlyQ29udGVudHMgPSBjdXJTdWJkaXIuY29udGVudHNTeW5jKHRydWUpO1xuICAgICAgICAgICAgICAgIGNvbnRlbnRzLnN1YmRpcnMgPSBfLmNvbmNhdChjb250ZW50cy5zdWJkaXJzLCBzdWJkaXJDb250ZW50cy5zdWJkaXJzKTtcbiAgICAgICAgICAgICAgICBjb250ZW50cy5maWxlcyAgID0gXy5jb25jYXQoY29udGVudHMuZmlsZXMsICAgc3ViZGlyQ29udGVudHMuZmlsZXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gY29udGVudHM7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZWN1cnNpdmVseSByZW1vdmVzIGVtcHR5IHN1YmRpcmVjdG9yaWVzIGZyb20gd2l0aGluIHRoaXMgZGlyZWN0b3J5LlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGlzIGRpcmVjdG9yeSBoYXMgYmVlbiBwcnVuZWQuXG4gICAgICovXG4gICAgcHVibGljIHBydW5lKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmNvbnRlbnRzKClcbiAgICAgICAgLnRoZW4oKGNvbnRlbnRzKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBwcm9taXNlcyA9IGNvbnRlbnRzLnN1YmRpcnMubWFwKChjdXJTdWJkaXIpID0+IHtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIFBydW5lIHRoZSBjdXJyZW50IHN1YmRpcmVjdG9yeS5cbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJTdWJkaXIucHJ1bmUoKVxuICAgICAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgLy8gSWYgdGhlIHN1YmRpcmVjdG9yeSBpcyBub3cgZW1wdHksIGRlbGV0ZSBpdC5cbiAgICAgICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1clN1YmRpci5pc0VtcHR5KCk7XG4gICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAudGhlbigoZGlySXNFbXB0eSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGlySXNFbXB0eSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGN1clN1YmRpci5kZWxldGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UuYWxsKHByb21pc2VzKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVjdXJzaXZlbHkgcmVtb3ZlcyBlbXB0eSBzdWJkaXJlY3RvcmllcyBmcm9tIHRoaXMgZGlyZWN0b3J5LlxuICAgICAqL1xuICAgIHB1YmxpYyBwcnVuZVN5bmMoKTogdm9pZFxuICAgIHtcbiAgICAgICAgY29uc3QgY29udGVudHMgPSB0aGlzLmNvbnRlbnRzU3luYygpO1xuICAgICAgICBjb250ZW50cy5zdWJkaXJzLmZvckVhY2goKGN1clN1YmRpcikgPT4ge1xuXG4gICAgICAgICAgICBjdXJTdWJkaXIucHJ1bmVTeW5jKCk7XG5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBJZiB0aGUgc3ViZGlyZWN0b3J5IGlzIG5vdyBlbXB0eSwgZGVsZXRlIGl0LlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIGlmIChjdXJTdWJkaXIuaXNFbXB0eVN5bmMoKSlcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICBjdXJTdWJkaXIuZGVsZXRlU3luYygpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENvcGllcyB0aGlzIGRpcmVjdG9yeSB0byBkZXN0RGlyLlxuICAgICAqIEBwYXJhbSBkZXN0RGlyIC0gVGhlIGRlc3RpbmF0aW9uIGRpcmVjdG9yeVxuICAgICAqIEBwYXJhbSBjb3B5Um9vdCAtIElmIHRydWUsIHRoaXMgZGlyZWN0b3J5IG5hbWUgd2lsbCBiZSBhIHN1YmRpcmVjdG9yeSBvZlxuICAgICAqIGRlc3REaXIuICBJZiBmYWxzZSwgb25seSB0aGUgY29udGVudHMgb2YgdGhpcyBkaXJlY3Rvcnkgd2lsbCBiZSBjb3BpZWRcbiAgICAgKiBpbnRvIGRlc3REaXIuXG4gICAgICogQHJldHVybiBBIHByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIGEgRGlyZWN0b3J5IG9iamVjdCByZXByZXNlbnRpbmdcbiAgICAgKiB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5LiAgSWYgY29weVJvb3QgaXMgZmFsc2UsIHRoaXMgd2lsbCBiZSBkZXN0RGlyLlxuICAgICAqIElmIGNvcHlSb290IGlzIHRydWUsIHRoaXMgd2lsbCBiZSB0aGlzIERpcmVjdG9yeSdzIGNvdW50ZXJwYXJ0XG4gICAgICogc3ViZGlyZWN0b3J5IGluIGRlc3REaXIuXG4gICAgICovXG4gICAgcHVibGljIGNvcHkoZGVzdERpcjogRGlyZWN0b3J5LCBjb3B5Um9vdDogYm9vbGVhbik6IFByb21pc2U8RGlyZWN0b3J5PlxuICAgIHtcbiAgICAgICAgaWYgKGNvcHlSb290KVxuICAgICAgICB7XG4gICAgICAgICAgICAvLyBDb3B5aW5nIHRoaXMgZGlyZWN0b3J5IHRvIHRoZSBkZXN0aW5hdGlvbiB3aXRoIGNvcHlSb290IHRydWUganVzdFxuICAgICAgICAgICAgLy8gbWVhbnMgY3JlYXRpbmcgdGhlIGNvdW50ZXJwYXJ0IHRvIHRoaXMgZGlyZWN0b3J5IGluIHRoZVxuICAgICAgICAgICAgLy8gZGVzdGluYXRpb24gYW5kIHRoZW4gY29weWluZyB0byB0aGF0IGRpcmVjdG9yeSB3aXRoIGNvcHlSb290XG4gICAgICAgICAgICAvLyBmYWxzZS5cbiAgICAgICAgICAgIGNvbnN0IHRoaXNEZXN0OiBEaXJlY3RvcnkgPSBuZXcgRGlyZWN0b3J5KGRlc3REaXIsIHRoaXMuZGlyTmFtZSk7XG4gICAgICAgICAgICByZXR1cm4gdGhpc0Rlc3QuZW5zdXJlRXhpc3RzKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb3B5KHRoaXNEZXN0LCBmYWxzZSk7XG4gICAgICAgICAgICB9KVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzRGVzdDtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuY29udGVudHMoKVxuICAgICAgICAudGhlbigoY29udGVudHM6IElEaXJlY3RvcnlDb250ZW50cykgPT4ge1xuICAgICAgICAgICAgLy8gQ29weSB0aGUgZmlsZXMgaW4gdGhpcyBkaXJlY3RvcnkgdG8gdGhlIGRlc3RpbmF0aW9uLlxuICAgICAgICAgICAgY29uc3QgZmlsZUNvcHlQcm9taXNlcyA9IGNvbnRlbnRzLmZpbGVzLm1hcCgoY3VyRmlsZSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJGaWxlLmNvcHkoZGVzdERpciwgY3VyRmlsZS5maWxlTmFtZSk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICAgICAgY29uc3QgZGlyQ29weVByb21pc2VzID0gY29udGVudHMuc3ViZGlycy5tYXAoKGN1clN1YmRpcikgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJTdWJkaXIuY29weShkZXN0RGlyLCB0cnVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLmFsbChfLmNvbmNhdDxhbnk+KGZpbGVDb3B5UHJvbWlzZXMsIGRpckNvcHlQcm9taXNlcykpO1xuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gZGVzdERpcjtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb3BpZXMgdGhpcyBkaXJlY3RvcnkgdG8gZGVzdERpci5cbiAgICAgKiBAcGFyYW0gZGVzdERpciAtIFRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnlcbiAgICAgKiBAcGFyYW0gY29weVJvb3QgLSBJZiB0cnVlLCB0aGlzIGRpcmVjdG9yeSBuYW1lIHdpbGwgYmUgYSBzdWJkaXJlY3Rvcnkgb2ZcbiAgICAgKiBkZXN0RGlyLiAgSWYgZmFsc2UsIG9ubHkgdGhlIGNvbnRlbnRzIG9mIHRoaXMgZGlyZWN0b3J5IHdpbGwgYmUgY29waWVkXG4gICAgICogaW50byBkZXN0RGlyLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb3B5U3luYyhkZXN0RGlyOiBEaXJlY3RvcnksIGNvcHlSb290OiBib29sZWFuKTogRGlyZWN0b3J5XG4gICAge1xuICAgICAgICBpZiAoY29weVJvb3QpXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIENvcHlpbmcgdGhpcyBkaXJlY3RvcnkgdG8gdGhlIGRlc3RpbmF0aW9uIHdpdGggY29weVJvb3QgdHJ1ZSBqdXN0XG4gICAgICAgICAgICAvLyBtZWFucyBjcmVhdGluZyB0aGUgY291bnRlcnBhcnQgdG8gdGhpcyBkaXJlY3RvcnkgaW4gdGhlXG4gICAgICAgICAgICAvLyBkZXN0aW5hdGlvbiBhbmQgdGhlbiBjb3B5aW5nIHRvIHRoYXQgZGlyZWN0b3J5IHdpdGggY29weVJvb3RcbiAgICAgICAgICAgIC8vIGZhbHNlLlxuICAgICAgICAgICAgY29uc3QgdGhpc0Rlc3Q6IERpcmVjdG9yeSA9IG5ldyBEaXJlY3RvcnkoZGVzdERpciwgdGhpcy5kaXJOYW1lKTtcbiAgICAgICAgICAgIHRoaXNEZXN0LmVuc3VyZUV4aXN0c1N5bmMoKTtcbiAgICAgICAgICAgIHRoaXMuY29weVN5bmModGhpc0Rlc3QsIGZhbHNlKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzRGVzdDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGNvbnRlbnRzID0gdGhpcy5jb250ZW50c1N5bmMoKTtcblxuICAgICAgICAvLyBDb3B5IHRoZSBmaWxlcyBpbiB0aGlzIGRpcmVjdG9yeSB0byB0aGUgZGVzdGluYXRpb24uXG4gICAgICAgIGNvbnRlbnRzLmZpbGVzLmZvckVhY2goKGN1ckZpbGUpID0+IHtcbiAgICAgICAgICAgIGN1ckZpbGUuY29weVN5bmMoZGVzdERpciwgY3VyRmlsZS5maWxlTmFtZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnRlbnRzLnN1YmRpcnMuZm9yRWFjaCgoY3VyU3ViZGlyKSA9PiB7XG4gICAgICAgICAgICBjdXJTdWJkaXIuY29weVN5bmMoZGVzdERpciwgdHJ1ZSk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJldHVybiBkZXN0RGlyO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTW92ZXMgdGhpcyBEaXJlY3Rvcnkgb3IgdGhlIGNvbnRlbnRzIG9mIHRoaXMgRGlyZWN0b3J5IHRvIGRlc3REaXIuXG4gICAgICogQHBhcmFtIGRlc3REaXIgLSBUaGUgZGVzdGluYXRpb24gZGlyZWN0b3J5XG4gICAgICogQHBhcmFtIG1vdmVSb290IC0gSWYgdHJ1ZSwgdGhpcyBkaXJlY3RvcnkgbmFtZSB3aWxsIGJlIGEgc3ViZGlyZWN0b3J5IG9mXG4gICAgICogZGVzdERpci4gIElmIGZhbHNlLCBvbmx5IHRoZSBjb250ZW50cyBvZiB0aGlzIGRpcmVjdG9yeSB3aWxsIGJlIGNvcGllZFxuICAgICAqIGludG8gZGVzdERpci5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdpdGggYSBEaXJlY3Rvcnkgb2JqZWN0IHJlcHJlc2VudGluZ1xuICAgICAqIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkuICBJZiBtb3ZlUm9vdCBpcyBmYWxzZSwgdGhpcyB3aWxsIGJlIGRlc3REaXIuXG4gICAgICogSWYgbW92ZVJvb3QgaXMgdHJ1ZSwgdGhpcyB3aWxsIGJlIHRoaXMgRGlyZWN0b3J5J3MgY291bnRlcnBhcnRcbiAgICAgKiBzdWJkaXJlY3RvcnkgaW4gZGVzdERpci5cbiAgICAgKi9cbiAgICBwdWJsaWMgbW92ZShkZXN0RGlyOiBEaXJlY3RvcnksIG1vdmVSb290OiBib29sZWFuKTogUHJvbWlzZTxEaXJlY3Rvcnk+XG4gICAge1xuICAgICAgICByZXR1cm4gZGVzdERpci5lbnN1cmVFeGlzdHMoKVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5jb3B5KGRlc3REaXIsIG1vdmVSb290KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKGNvdW50ZXJwYXJ0RGVzdERpcikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY291bnRlcnBhcnREZXN0RGlyO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogV2Fsa3MgdGhpcyBEaXJlY3RvcnkgaW4gYSBkZXB0aC1maXJzdCBtYW5uZXIuXG4gICAgICogQHBhcmFtIGNiIC0gQSBjYWxsYmFjayBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgY2FsbGVkIGZvciBlYWNoIHN1YmRpcmVjdG9yeVxuICAgICAqICAgYW5kIGZpbGUgZW5jb3VudGVyZWQuICBJdCBpcyBpbnZva2VkIHdpdGggb25lIGFyZ3VtZW50OiAoaXRlbSkuICBXaGVuXG4gICAgICogICBpdGVtIGlzIGEgRGlyZWN0b3J5LCB0aGUgZnVuY3Rpb24gcmV0dXJucyBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyXG4gICAgICogICB0byByZWN1cnNlIGludG8gdGhlIGRpcmVjdG9yeS4gIFdoZW4gaXRlbSBpcyBhIEZpbGUsIHRoZSByZXR1cm5lZCB2YWx1ZVxuICAgICAqICAgaXMgaWdub3JlZC5cbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIGRpcmVjdG9yeSB0cmVlIGhhcyBiZWVuXG4gICAgICogICBjb21wbGV0ZWx5IHdhbGtlZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgYXN5bmMgd2FsayhjYjogV2Fsa0NhbGxiYWNrKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgY29uc3QgdGhpc0RpcmVjdG9yeUNvbnRlbnRzID0gYXdhaXQgdGhpcy5jb250ZW50cyhmYWxzZSk7XG5cbiAgICAgICAgLy8gSW52b2tlIHRoZSBjYWxsYmFjayBmb3IgYWxsIGZpbGVzIGNvbmN1cnJlbnRseS5cbiAgICAgICAgY29uc3QgZmlsZVByb21pc2VzOiBBcnJheTxQcm9taXNlPGJvb2xlYW4+PiA9IF8ubWFwKHRoaXNEaXJlY3RvcnlDb250ZW50cy5maWxlcywgKGN1ckZpbGU6IEZpbGUpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZShjYihjdXJGaWxlKSk7XG4gICAgICAgIH0pO1xuICAgICAgICBhd2FpdCBCQlByb21pc2UuYWxsKGZpbGVQcm9taXNlcyk7XG5cbiAgICAgICAgLy8gUHJvY2VzcyBlYWNoIG9mIHRoZSBzdWJkaXJlY3RvcmllcyBvbmUgYXQgYSB0aW1lLlxuICAgICAgICBmb3IgKGNvbnN0IGN1clN1YkRpciBvZiB0aGlzRGlyZWN0b3J5Q29udGVudHMuc3ViZGlycykge1xuICAgICAgICAgICAgY29uc3Qgc2hvdWxkUmVjdXJzZSA9IGF3YWl0IEJCUHJvbWlzZS5yZXNvbHZlKGNiKGN1clN1YkRpcikpO1xuICAgICAgICAgICAgaWYgKHNob3VsZFJlY3Vyc2UpIHtcbiAgICAgICAgICAgICAgICBhd2FpdCBjdXJTdWJEaXIud2FsayhjYik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG59XG4iXX0=
