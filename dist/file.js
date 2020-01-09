"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var path = require("path");
var crypto = require("crypto");
var BBPromise = require("bluebird");
var listenerTracker_1 = require("./listenerTracker");
var promiseHelpers_1 = require("./promiseHelpers");
var directory_1 = require("./directory");
var pathHelpers_1 = require("./pathHelpers");
var unlinkAsync = promiseHelpers_1.promisify1(fs.unlink);
var statAsync = promiseHelpers_1.promisify1(fs.stat);
var File = /** @class */ (function () {
    // endregion
    function File(pathPart) {
        var pathParts = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            pathParts[_i - 1] = arguments[_i];
        }
        var allParts = [pathPart].concat(pathParts);
        this._filePath = pathHelpers_1.reducePathParts(allParts);
    }
    File.relative = function (from, to) {
        var relPath = path.relative(from.toString(), to.toString());
        return new File(relPath);
    };
    /**
     * Calculates the parts of the relative path from `from` to `to`.
     * @param from - The starting point
     * @param to - The ending point
     * @return An array of strings representing the path segments needed to get
     * from `from` to `to`.
     */
    File.relativeParts = function (from, to) {
        var relPath = path.relative(from.toString(), to.toString());
        return relPath.split(path.sep);
    };
    Object.defineProperty(File.prototype, "dirName", {
        /**
         * Gets the directory portion of this file's path (everything before the
         * file name and extension).
         * @return The directory portion of this file's path.  This string will
         * always end with the OS's directory separator ("/").
         */
        get: function () {
            return path.dirname(this._filePath) + path.sep;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "baseName", {
        /**
         * Gets this file's base name.  This is the part of the file name preceding
         * the extension.
         * @return This file's base name.
         */
        get: function () {
            var extName = path.extname(this._filePath);
            return path.basename(this._filePath, extName);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "fileName", {
        /**
         * Gets the full file name of this file.  This includes both the base name
         * and extension.
         * @return This file's file name
         */
        get: function () {
            return path.basename(this._filePath);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "extName", {
        /**
         * Gets the extension of this file.  This includes the initial dot (".").
         * @return This file's extension
         */
        get: function () {
            return path.extname(this._filePath);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(File.prototype, "directory", {
        /**
         * Gets the directory containing this file
         * @return A Directory object representing this file's directory.
         */
        get: function () {
            var dirName = path.dirname(this._filePath);
            return new directory_1.Directory(dirName);
        },
        enumerable: true,
        configurable: true
    });
    File.prototype.toString = function () {
        return this._filePath;
    };
    File.prototype.equals = function (otherFile) {
        return this.absPath() === otherFile.absPath();
    };
    /**
     * Checks to see if this File exists.
     * @return A Promise that is always resolved.  It is resolved with a truthy
     * fs.Stats object if it exists.  Otherwise, it is resolved with undefined.
     */
    File.prototype.exists = function () {
        var _this = this;
        return new BBPromise(function (resolve) {
            fs.stat(_this._filePath, function (err, stats) {
                if (!err && stats.isFile()) {
                    resolve(stats);
                }
                else {
                    resolve(undefined);
                }
            });
        });
    };
    File.prototype.existsSync = function () {
        try {
            var stats = fs.statSync(this._filePath);
            return stats.isFile() ? stats : undefined;
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
    /**
     * Sets the access mode bits for this file
     * @param mode - Numeric value representing the new access modes.  See
     * fs.constants.S_I*.
     * @return A promise for this file (for easy chaining)
     */
    File.prototype.chmod = function (mode) {
        var _this = this;
        return new BBPromise(function (resolve, reject) {
            fs.chmod(_this._filePath, mode, function (err) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(_this);
            });
        });
    };
    /**
     * Sets the access mode bits for this file
     * @param mode - Numeric value representing the new access modes.  See
     * fs.constants.S_I*.
     * @return A promise for this file (for easy chaining)
     */
    File.prototype.chmodSync = function (mode) {
        fs.chmodSync(this._filePath, mode);
    };
    File.prototype.absPath = function () {
        return path.resolve(this._filePath);
    };
    File.prototype.absolute = function () {
        return new File(this.absPath());
    };
    File.prototype.delete = function () {
        var _this = this;
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                return BBPromise.resolve();
            }
            else {
                return unlinkAsync(_this._filePath);
            }
        });
    };
    File.prototype.deleteSync = function () {
        if (!this.existsSync()) {
            return;
        }
        fs.unlinkSync(this._filePath);
    };
    /**
     * Copies this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A Promise for a File representing the destination file.
     */
    File.prototype.copy = function (dstDirOrFile, dstFileName) {
        var _this = this;
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        var destFile;
        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        }
        else { // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }
        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                throw new Error("Source file " + _this._filePath + " does not exist.");
            }
        })
            .then(function () {
            //
            // Make sure the directory for the destination file exists.
            //
            return destFile.directory.ensureExists();
        })
            .then(function () {
            //
            // Do the copy.
            //
            return copyFile(_this._filePath, destFile.toString(), { preserveTimestamps: true });
        })
            .then(function () {
            return destFile;
        });
    };
    /**
     * Copies this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A File representing the destination file.
     */
    File.prototype.copySync = function (dstDirOrFile, dstFileName) {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        var destFile;
        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        }
        else { // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }
        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        if (!this.existsSync()) {
            throw new Error("Source file " + this._filePath + " does not exist.");
        }
        //
        // Make sure the directory for the destination file exists.
        //
        destFile.directory.ensureExistsSync();
        //
        // Do the copy.
        //
        copyFileSync(this._filePath, destFile.toString(), { preserveTimestamps: true });
        return destFile;
    };
    /**
     * Moves this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A Promise for a File representing the destination file.
     */
    File.prototype.move = function (dstDirOrFile, dstFileName) {
        var _this = this;
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        var destFile;
        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        }
        else { // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }
        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        return this.exists()
            .then(function (stats) {
            if (!stats) {
                throw new Error("Source file " + _this._filePath + " does not exist.");
            }
        })
            .then(function () {
            //
            // Make sure the directory for the destination file exists.
            //
            return destFile.directory.ensureExists();
        })
            .then(function () {
            //
            // Do the copy.
            //
            return copyFile(_this._filePath, destFile.toString(), { preserveTimestamps: true });
        })
            .then(function () {
            //
            // Delete the source file.
            //
            return _this.delete();
        })
            .then(function () {
            return destFile;
        });
    };
    /**
     * Moves this file to the specified destination.  Preserves the file's last
     * accessed time (atime) and last modified time (mtime).
     * @param dstDirOrFile - If a File, specifies the
     * destination directory and file name.  If a directory, specifies only the
     * destination directory and destFileName specifies the destination file
     * name.
     * @param dstFileName - When destDirOrFile is a Directory,
     * optionally specifies the destination file name.  If omitted, the
     * destination file name will be the same as the source (this File).
     * @return A File representing the destination file.
     */
    File.prototype.moveSync = function (dstDirOrFile, dstFileName) {
        //
        // Based on the parameters, figure out what the destination file path is
        // going to be.
        //
        var destFile;
        if (dstDirOrFile instanceof File) {
            // The caller has specified the destination directory and file
            // name in the form of a File.
            destFile = dstDirOrFile;
        }
        else { // dstDirOrFile instanceof Directory
            // The caller has specified the destination directory and
            // optionally a new file name.
            if (dstFileName === undefined) {
                destFile = new File(dstDirOrFile, this.fileName);
            }
            else {
                destFile = new File(dstDirOrFile, dstFileName);
            }
        }
        //
        // Before we do anything, make sure that the source file exists.  If it
        // doesn't we should get out before we create the destination file.
        //
        if (!this.existsSync()) {
            throw new Error("Source file " + this._filePath + " does not exist.");
        }
        //
        // Make sure the directory for the destination file exists.
        //
        destFile.directory.ensureExistsSync();
        //
        // Do the copy.
        //
        copyFileSync(this._filePath, destFile.toString(), { preserveTimestamps: true });
        //
        // Delete the source file.
        //
        this.deleteSync();
        return destFile;
    };
    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     * @return A Promise that is resolved when the file has been written.
     */
    File.prototype.write = function (text) {
        var _this = this;
        return this.directory.ensureExists()
            .then(function () {
            return new BBPromise(function (resolve, reject) {
                fs.writeFile(_this._filePath, text, "utf8", function (err) {
                    if (err) {
                        reject(err);
                    }
                    else {
                        resolve();
                    }
                });
            });
        });
    };
    /**
     * Writes text to this file, replacing the file if it exists.  If any parent
     * directories do not exist, they are created.
     * @param text - The new contents of this file
     */
    File.prototype.writeSync = function (text) {
        this.directory.ensureExistsSync();
        fs.writeFileSync(this._filePath, text);
    };
    /**
     * Writes JSON data to this file, replacing the file if it exists.  If any
     * parent directories do not exist, they are created.
     * @param data - The data to be stringified and written
     * @return A Promise that is resolved when the file has been written
     */
    File.prototype.writeJson = function (data) {
        var jsonText = JSON.stringify(data, undefined, 4);
        return this.write(jsonText);
    };
    /**
     * Writes JSON data to this file, replacing the file if it exists.  If any
     * parent directories do not exist, they are created.
     * @param data - The data to be stringified and written
     */
    File.prototype.writeJsonSync = function (data) {
        var jsonText = JSON.stringify(data, undefined, 4);
        return this.writeSync(jsonText);
    };
    /**
     * Calculates a hash of this file's contents
     * @param algorithm - The hashing algorithm to use.  For example, "md5",
     * "sha256", "sha512".  To see algorithms available on your platform, run
     * `openssl list-message-digest-algorithms`.
     * @return A Promise for a hexadecimal string containing the hash
     */
    File.prototype.getHash = function (algorithm) {
        var _this = this;
        if (algorithm === void 0) { algorithm = "md5"; }
        return new BBPromise(function (resolve, reject) {
            var input = fs.createReadStream(_this._filePath);
            var hash = crypto.createHash(algorithm);
            hash.setEncoding("hex");
            input
                .on("error", function (error) {
                reject(new Error(error));
            })
                .on("end", function () {
                hash.end();
                var hashValue = hash.read();
                resolve(hashValue);
            });
            input
                .pipe(hash);
        });
    };
    /**
     * Calculates a hash of this file's contents
     * @param algorithm - The hashing algorithm to use.  For example, "md5",
     * "sha256", "sha512".  To see algorithms available on your platform, run
     * `openssl list-message-digest-algorithms`.
     * @return A hexadecimal string containing the hash
     */
    File.prototype.getHashSync = function (algorithm) {
        if (algorithm === void 0) { algorithm = "md5"; }
        var fileData = fs.readFileSync(this._filePath);
        var hash = crypto.createHash(algorithm);
        hash.update(fileData);
        return hash.digest("hex");
    };
    /**
     * Reads the contents of this file as a string.  Rejects if this file does
     * not exist.
     * @return A Promise for the text contents of this file
     */
    File.prototype.read = function () {
        var _this = this;
        return new BBPromise(function (resolve, reject) {
            fs.readFile(_this._filePath, { encoding: "utf8" }, function (err, data) {
                if (err) {
                    reject(err);
                    return;
                }
                resolve(data);
            });
        });
    };
    /**
     * Reads the contents of this file as a string.  Throws if this file does
     * not exist.
     * @return This file's contents
     */
    File.prototype.readSync = function () {
        return fs.readFileSync(this._filePath, { encoding: "utf8" });
    };
    /**
     * Reads JSON data from this file.  Rejects if this file does not exist.
     * @return A promise for the parsed data contained in this file
     */
    File.prototype.readJson = function () {
        return this.read()
            .then(function (text) {
            return JSON.parse(text);
        });
    };
    /**
     * Reads JSON data from this file.  Throws if this file does not exist.
     * @return The parsed data contained in this file
     */
    File.prototype.readJsonSync = function () {
        var text = this.readSync();
        return JSON.parse(text);
    };
    return File;
}());
exports.File = File;
/**
 * Copies a file.
 * @param sourceFilePath - The path to the source file
 * @param destFilePath - The path to the destination file
 * @param options - Options for the copy operation
 * @return A Promise that is resolved when the file has been copied.
 */
function copyFile(sourceFilePath, destFilePath, options) {
    //
    // Design Note
    // We could have used fs.readFile() and fs.writeFile() here, but that would
    // read the entire file contents of the source file into memory.  It is
    // thought that using streams is more efficient and performant because
    // streams can read and write smaller chunks of the data.
    //
    return new BBPromise(function (resolve, reject) {
        var readStream = fs.createReadStream(sourceFilePath);
        var readListenerTracker = new listenerTracker_1.ListenerTracker(readStream);
        var writeStream = fs.createWriteStream(destFilePath);
        var writeListenerTracker = new listenerTracker_1.ListenerTracker(writeStream);
        readListenerTracker.on("error", function (err) {
            reject(err);
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });
        writeListenerTracker.on("error", function (err) {
            reject(err);
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });
        writeListenerTracker.on("close", function () {
            resolve();
            readListenerTracker.removeAll();
            writeListenerTracker.removeAll();
        });
        readStream.pipe(writeStream);
    })
        .then(function () {
        if (options && options.preserveTimestamps) {
            //
            // The caller wants to preserve the source file's timestamps.  Copy
            // them to the destination file now.
            //
            return statAsync(sourceFilePath)
                .then(function (srcStats) {
                //
                // Note:  Setting the timestamps on dest requires us to specify
                // the timestamp in seconds (not milliseconds).  When we divide
                // by 1000 below and truncation happens, we are actually setting
                // dest's timestamps *before* those of of source.
                //
                return new BBPromise(function (resolve, reject) {
                    fs.utimes(destFilePath, srcStats.atime.valueOf() / 1000, srcStats.mtime.valueOf() / 1000, function (err) {
                        if (err) {
                            reject(err);
                        }
                        else {
                            resolve();
                        }
                    });
                });
            });
        }
    });
}
/**
 * Copies a file synchronously.
 * @param sourceFilePath - The path to the source file
 * @param destFilePath - The path to the destination file
 * @param options - Options for the copy operation
 */
function copyFileSync(sourceFilePath, destFilePath, options) {
    var data = fs.readFileSync(sourceFilePath);
    fs.writeFileSync(destFilePath, data);
    if (options && options.preserveTimestamps) {
        var srcStats = fs.statSync(sourceFilePath);
        fs.utimesSync(destFilePath, srcStats.atime.valueOf() / 1000, srcStats.mtime.valueOf() / 1000);
    }
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,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S0FBSyxDQUFDLE9BQU8sRUFBRSxHQUFHLElBQUksQ0FBQyxDQUFDO0tBQ2pHO0FBQ0wsQ0FBQyIsImZpbGUiOiJmaWxlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgZnMgZnJvbSBcImZzXCI7XG5pbXBvcnQgKiBhcyBwYXRoIGZyb20gXCJwYXRoXCI7XG5pbXBvcnQgKiBhcyBjcnlwdG8gZnJvbSBcImNyeXB0b1wiO1xuaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0IHtMaXN0ZW5lclRyYWNrZXJ9IGZyb20gXCIuL2xpc3RlbmVyVHJhY2tlclwiO1xuaW1wb3J0IHtwcm9taXNpZnkxfSBmcm9tIFwiLi9wcm9taXNlSGVscGVyc1wiO1xuaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RpcmVjdG9yeVwiO1xuaW1wb3J0IHtQYXRoUGFydCwgcmVkdWNlUGF0aFBhcnRzfSBmcm9tIFwiLi9wYXRoSGVscGVyc1wiO1xuXG5cbmNvbnN0IHVubGlua0FzeW5jID0gcHJvbWlzaWZ5MTx2b2lkLCBzdHJpbmc+KGZzLnVubGluayk7XG5jb25zdCBzdGF0QXN5bmMgICA9IHByb21pc2lmeTE8ZnMuU3RhdHMsIHN0cmluZz4oZnMuc3RhdCk7XG5cblxuZXhwb3J0IGNsYXNzIEZpbGVcbntcbiAgICBwdWJsaWMgc3RhdGljIHJlbGF0aXZlKGZyb206IERpcmVjdG9yeSwgdG86IEZpbGUpOiBGaWxlXG4gICAge1xuICAgICAgICBjb25zdCByZWxQYXRoID0gcGF0aC5yZWxhdGl2ZShmcm9tLnRvU3RyaW5nKCksIHRvLnRvU3RyaW5nKCkpO1xuICAgICAgICByZXR1cm4gbmV3IEZpbGUocmVsUGF0aCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIHRoZSBwYXJ0cyBvZiB0aGUgcmVsYXRpdmUgcGF0aCBmcm9tIGBmcm9tYCB0byBgdG9gLlxuICAgICAqIEBwYXJhbSBmcm9tIC0gVGhlIHN0YXJ0aW5nIHBvaW50XG4gICAgICogQHBhcmFtIHRvIC0gVGhlIGVuZGluZyBwb2ludFxuICAgICAqIEByZXR1cm4gQW4gYXJyYXkgb2Ygc3RyaW5ncyByZXByZXNlbnRpbmcgdGhlIHBhdGggc2VnbWVudHMgbmVlZGVkIHRvIGdldFxuICAgICAqIGZyb20gYGZyb21gIHRvIGB0b2AuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyByZWxhdGl2ZVBhcnRzKGZyb206IERpcmVjdG9yeSwgdG86IEZpbGUpOiBBcnJheTxzdHJpbmc+XG4gICAge1xuICAgICAgICBjb25zdCByZWxQYXRoID0gcGF0aC5yZWxhdGl2ZShmcm9tLnRvU3RyaW5nKCksIHRvLnRvU3RyaW5nKCkpO1xuICAgICAgICByZXR1cm4gcmVsUGF0aC5zcGxpdChwYXRoLnNlcCk7XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZmlsZVBhdGg6IHN0cmluZztcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHBhdGhQYXJ0OiBQYXRoUGFydCwgLi4ucGF0aFBhcnRzOiBBcnJheTxQYXRoUGFydD4pXG4gICAge1xuICAgICAgICBjb25zdCBhbGxQYXJ0czogQXJyYXk8UGF0aFBhcnQ+ID0gW3BhdGhQYXJ0XS5jb25jYXQocGF0aFBhcnRzKTtcbiAgICAgICAgdGhpcy5fZmlsZVBhdGggPSByZWR1Y2VQYXRoUGFydHMoYWxsUGFydHMpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZGlyZWN0b3J5IHBvcnRpb24gb2YgdGhpcyBmaWxlJ3MgcGF0aCAoZXZlcnl0aGluZyBiZWZvcmUgdGhlXG4gICAgICogZmlsZSBuYW1lIGFuZCBleHRlbnNpb24pLlxuICAgICAqIEByZXR1cm4gVGhlIGRpcmVjdG9yeSBwb3J0aW9uIG9mIHRoaXMgZmlsZSdzIHBhdGguICBUaGlzIHN0cmluZyB3aWxsXG4gICAgICogYWx3YXlzIGVuZCB3aXRoIHRoZSBPUydzIGRpcmVjdG9yeSBzZXBhcmF0b3IgKFwiL1wiKS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGRpck5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gcGF0aC5kaXJuYW1lKHRoaXMuX2ZpbGVQYXRoKSArIHBhdGguc2VwO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGlzIGZpbGUncyBiYXNlIG5hbWUuICBUaGlzIGlzIHRoZSBwYXJ0IG9mIHRoZSBmaWxlIG5hbWUgcHJlY2VkaW5nXG4gICAgICogdGhlIGV4dGVuc2lvbi5cbiAgICAgKiBAcmV0dXJuIFRoaXMgZmlsZSdzIGJhc2UgbmFtZS5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGJhc2VOYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgY29uc3QgZXh0TmFtZTogc3RyaW5nID0gcGF0aC5leHRuYW1lKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuIHBhdGguYmFzZW5hbWUodGhpcy5fZmlsZVBhdGgsIGV4dE5hbWUpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgZnVsbCBmaWxlIG5hbWUgb2YgdGhpcyBmaWxlLiAgVGhpcyBpbmNsdWRlcyBib3RoIHRoZSBiYXNlIG5hbWVcbiAgICAgKiBhbmQgZXh0ZW5zaW9uLlxuICAgICAqIEByZXR1cm4gVGhpcyBmaWxlJ3MgZmlsZSBuYW1lXG4gICAgICovXG4gICAgcHVibGljIGdldCBmaWxlTmFtZSgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBwYXRoLmJhc2VuYW1lKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIGV4dGVuc2lvbiBvZiB0aGlzIGZpbGUuICBUaGlzIGluY2x1ZGVzIHRoZSBpbml0aWFsIGRvdCAoXCIuXCIpLlxuICAgICAqIEByZXR1cm4gVGhpcyBmaWxlJ3MgZXh0ZW5zaW9uXG4gICAgICovXG4gICAgcHVibGljIGdldCBleHROYW1lKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHBhdGguZXh0bmFtZSh0aGlzLl9maWxlUGF0aCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBkaXJlY3RvcnkgY29udGFpbmluZyB0aGlzIGZpbGVcbiAgICAgKiBAcmV0dXJuIEEgRGlyZWN0b3J5IG9iamVjdCByZXByZXNlbnRpbmcgdGhpcyBmaWxlJ3MgZGlyZWN0b3J5LlxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgZGlyZWN0b3J5KCk6IERpcmVjdG9yeVxuICAgIHtcbiAgICAgICAgY29uc3QgZGlyTmFtZTogc3RyaW5nID0gcGF0aC5kaXJuYW1lKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICAgICAgcmV0dXJuIG5ldyBEaXJlY3RvcnkoZGlyTmFtZSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fZmlsZVBhdGg7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZXF1YWxzKG90aGVyRmlsZTogRmlsZSk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmFic1BhdGgoKSA9PT0gb3RoZXJGaWxlLmFic1BhdGgoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENoZWNrcyB0byBzZWUgaWYgdGhpcyBGaWxlIGV4aXN0cy5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIGFsd2F5cyByZXNvbHZlZC4gIEl0IGlzIHJlc29sdmVkIHdpdGggYSB0cnV0aHlcbiAgICAgKiBmcy5TdGF0cyBvYmplY3QgaWYgaXQgZXhpc3RzLiAgT3RoZXJ3aXNlLCBpdCBpcyByZXNvbHZlZCB3aXRoIHVuZGVmaW5lZC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZXhpc3RzKCk6IFByb21pc2U8ZnMuU3RhdHMgfCB1bmRlZmluZWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxmcy5TdGF0cyB8IHVuZGVmaW5lZD4oKHJlc29sdmU6IChyZXN1bHQ6IGZzLlN0YXRzIHwgdW5kZWZpbmVkKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBmcy5zdGF0KHRoaXMuX2ZpbGVQYXRoLCAoZXJyOiBhbnksIHN0YXRzOiBmcy5TdGF0cykgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKCFlcnIgJiYgc3RhdHMuaXNGaWxlKCkpXG4gICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHN0YXRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSh1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgcHVibGljIGV4aXN0c1N5bmMoKTogZnMuU3RhdHMgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBzdGF0cyA9IGZzLnN0YXRTeW5jKHRoaXMuX2ZpbGVQYXRoKTtcbiAgICAgICAgICAgIHJldHVybiBzdGF0cy5pc0ZpbGUoKSA/IHN0YXRzIDogdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgICAgIGNhdGNoIChlcnIpIHtcbiAgICAgICAgICAgIGlmIChlcnIuY29kZSA9PT0gXCJFTk9FTlRcIilcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IGVycjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYWNjZXNzIG1vZGUgYml0cyBmb3IgdGhpcyBmaWxlXG4gICAgICogQHBhcmFtIG1vZGUgLSBOdW1lcmljIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgbmV3IGFjY2VzcyBtb2Rlcy4gIFNlZVxuICAgICAqIGZzLmNvbnN0YW50cy5TX0kqLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGlzIGZpbGUgKGZvciBlYXN5IGNoYWluaW5nKVxuICAgICAqL1xuICAgIHB1YmxpYyBjaG1vZChtb2RlOiBudW1iZXIpOiBQcm9taXNlPEZpbGU+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZSgocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICBmcy5jaG1vZCh0aGlzLl9maWxlUGF0aCwgbW9kZSwgKGVycikgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICAgICByZXNvbHZlKHRoaXMpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogU2V0cyB0aGUgYWNjZXNzIG1vZGUgYml0cyBmb3IgdGhpcyBmaWxlXG4gICAgICogQHBhcmFtIG1vZGUgLSBOdW1lcmljIHZhbHVlIHJlcHJlc2VudGluZyB0aGUgbmV3IGFjY2VzcyBtb2Rlcy4gIFNlZVxuICAgICAqIGZzLmNvbnN0YW50cy5TX0kqLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGlzIGZpbGUgKGZvciBlYXN5IGNoYWluaW5nKVxuICAgICAqL1xuICAgIHB1YmxpYyBjaG1vZFN5bmMobW9kZTogbnVtYmVyKTogdm9pZCB7XG4gICAgICAgIGZzLmNobW9kU3luYyh0aGlzLl9maWxlUGF0aCwgbW9kZSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYWJzUGF0aCgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBwYXRoLnJlc29sdmUodGhpcy5fZmlsZVBhdGgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFic29sdXRlKCk6IEZpbGVcbiAgICB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLmFic1BhdGgoKSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZGVsZXRlKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmV4aXN0cygpXG4gICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdGF0cykge1xuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdW5saW5rQXN5bmModGhpcy5fZmlsZVBhdGgpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBkZWxldGVTeW5jKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmICghdGhpcy5leGlzdHNTeW5jKCkpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGZzLnVubGlua1N5bmModGhpcy5fZmlsZVBhdGgpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ29waWVzIHRoaXMgZmlsZSB0byB0aGUgc3BlY2lmaWVkIGRlc3RpbmF0aW9uLiAgUHJlc2VydmVzIHRoZSBmaWxlJ3MgbGFzdFxuICAgICAqIGFjY2Vzc2VkIHRpbWUgKGF0aW1lKSBhbmQgbGFzdCBtb2RpZmllZCB0aW1lIChtdGltZSkuXG4gICAgICogQHBhcmFtIGRzdERpck9yRmlsZSAtIElmIGEgRmlsZSwgc3BlY2lmaWVzIHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZSBuYW1lLiAgSWYgYSBkaXJlY3RvcnksIHNwZWNpZmllcyBvbmx5IHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZGVzdEZpbGVOYW1lIHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZVxuICAgICAqIG5hbWUuXG4gICAgICogQHBhcmFtIGRzdEZpbGVOYW1lIC0gV2hlbiBkZXN0RGlyT3JGaWxlIGlzIGEgRGlyZWN0b3J5LFxuICAgICAqIG9wdGlvbmFsbHkgc3BlY2lmaWVzIHRoZSBkZXN0aW5hdGlvbiBmaWxlIG5hbWUuICBJZiBvbWl0dGVkLCB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBmaWxlIG5hbWUgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgc291cmNlICh0aGlzIEZpbGUpLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhIEZpbGUgcmVwcmVzZW50aW5nIHRoZSBkZXN0aW5hdGlvbiBmaWxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb3B5KGRzdERpck9yRmlsZTogRGlyZWN0b3J5IHwgRmlsZSwgZHN0RmlsZU5hbWU/OiBzdHJpbmcpOiBQcm9taXNlPEZpbGU+XG4gICAge1xuICAgICAgICAvL1xuICAgICAgICAvLyBCYXNlZCBvbiB0aGUgcGFyYW1ldGVycywgZmlndXJlIG91dCB3aGF0IHRoZSBkZXN0aW5hdGlvbiBmaWxlIHBhdGggaXNcbiAgICAgICAgLy8gZ29pbmcgdG8gYmUuXG4gICAgICAgIC8vXG4gICAgICAgIGxldCBkZXN0RmlsZTogRmlsZTtcblxuICAgICAgICBpZiAoZHN0RGlyT3JGaWxlIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciBoYXMgc3BlY2lmaWVkIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGVcbiAgICAgICAgICAgIC8vIG5hbWUgaW4gdGhlIGZvcm0gb2YgYSBGaWxlLlxuICAgICAgICAgICAgZGVzdEZpbGUgPSBkc3REaXJPckZpbGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7ICAgICAgICAgICAvLyBkc3REaXJPckZpbGUgaW5zdGFuY2VvZiBEaXJlY3RvcnlcbiAgICAgICAgICAgIC8vIFRoZSBjYWxsZXIgaGFzIHNwZWNpZmllZCB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZFxuICAgICAgICAgICAgLy8gb3B0aW9uYWxseSBhIG5ldyBmaWxlIG5hbWUuXG4gICAgICAgICAgICBpZiAoZHN0RmlsZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlc3RGaWxlID0gbmV3IEZpbGUoZHN0RGlyT3JGaWxlLCB0aGlzLmZpbGVOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkc3REaXJPckZpbGUsIGRzdEZpbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJlZm9yZSB3ZSBkbyBhbnl0aGluZywgbWFrZSBzdXJlIHRoYXQgdGhlIHNvdXJjZSBmaWxlIGV4aXN0cy4gIElmIGl0XG4gICAgICAgIC8vIGRvZXNuJ3Qgd2Ugc2hvdWxkIGdldCBvdXQgYmVmb3JlIHdlIGNyZWF0ZSB0aGUgZGVzdGluYXRpb24gZmlsZS5cbiAgICAgICAgLy9cbiAgICAgICAgcmV0dXJuIHRoaXMuZXhpc3RzKClcbiAgICAgICAgLnRoZW4oKHN0YXRzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU291cmNlIGZpbGUgJHt0aGlzLl9maWxlUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGRpcmVjdG9yeSBmb3IgdGhlIGRlc3RpbmF0aW9uIGZpbGUgZXhpc3RzLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHJldHVybiBkZXN0RmlsZS5kaXJlY3RvcnkuZW5zdXJlRXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBEbyB0aGUgY29weS5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICByZXR1cm4gY29weUZpbGUodGhpcy5fZmlsZVBhdGgsIGRlc3RGaWxlLnRvU3RyaW5nKCksIHtwcmVzZXJ2ZVRpbWVzdGFtcHM6IHRydWV9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGRlc3RGaWxlO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIENvcGllcyB0aGlzIGZpbGUgdG8gdGhlIHNwZWNpZmllZCBkZXN0aW5hdGlvbi4gIFByZXNlcnZlcyB0aGUgZmlsZSdzIGxhc3RcbiAgICAgKiBhY2Nlc3NlZCB0aW1lIChhdGltZSkgYW5kIGxhc3QgbW9kaWZpZWQgdGltZSAobXRpbWUpLlxuICAgICAqIEBwYXJhbSBkc3REaXJPckZpbGUgLSBJZiBhIEZpbGUsIHNwZWNpZmllcyB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGUgbmFtZS4gIElmIGEgZGlyZWN0b3J5LCBzcGVjaWZpZXMgb25seSB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGRlc3RGaWxlTmFtZSBzcGVjaWZpZXMgdGhlIGRlc3RpbmF0aW9uIGZpbGVcbiAgICAgKiBuYW1lLlxuICAgICAqIEBwYXJhbSBkc3RGaWxlTmFtZSAtIFdoZW4gZGVzdERpck9yRmlsZSBpcyBhIERpcmVjdG9yeSxcbiAgICAgKiBvcHRpb25hbGx5IHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZSBuYW1lLiAgSWYgb21pdHRlZCwgdGhlXG4gICAgICogZGVzdGluYXRpb24gZmlsZSBuYW1lIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHNvdXJjZSAodGhpcyBGaWxlKS5cbiAgICAgKiBAcmV0dXJuIEEgRmlsZSByZXByZXNlbnRpbmcgdGhlIGRlc3RpbmF0aW9uIGZpbGUuXG4gICAgICovXG4gICAgcHVibGljIGNvcHlTeW5jKGRzdERpck9yRmlsZTogRGlyZWN0b3J5IHwgRmlsZSwgZHN0RmlsZU5hbWU/OiBzdHJpbmcpOiBGaWxlXG4gICAge1xuICAgICAgICAvL1xuICAgICAgICAvLyBCYXNlZCBvbiB0aGUgcGFyYW1ldGVycywgZmlndXJlIG91dCB3aGF0IHRoZSBkZXN0aW5hdGlvbiBmaWxlIHBhdGggaXNcbiAgICAgICAgLy8gZ29pbmcgdG8gYmUuXG4gICAgICAgIC8vXG4gICAgICAgIGxldCBkZXN0RmlsZTogRmlsZTtcblxuICAgICAgICBpZiAoZHN0RGlyT3JGaWxlIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciBoYXMgc3BlY2lmaWVkIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGVcbiAgICAgICAgICAgIC8vIG5hbWUgaW4gdGhlIGZvcm0gb2YgYSBGaWxlLlxuICAgICAgICAgICAgZGVzdEZpbGUgPSBkc3REaXJPckZpbGU7XG4gICAgICAgIH0gZWxzZSB7ICAgICAgICAgICAvLyBkc3REaXJPckZpbGUgaW5zdGFuY2VvZiBEaXJlY3RvcnlcbiAgICAgICAgICAgIC8vIFRoZSBjYWxsZXIgaGFzIHNwZWNpZmllZCB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZFxuICAgICAgICAgICAgLy8gb3B0aW9uYWxseSBhIG5ldyBmaWxlIG5hbWUuXG4gICAgICAgICAgICBpZiAoZHN0RmlsZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlc3RGaWxlID0gbmV3IEZpbGUoZHN0RGlyT3JGaWxlLCB0aGlzLmZpbGVOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkc3REaXJPckZpbGUsIGRzdEZpbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJlZm9yZSB3ZSBkbyBhbnl0aGluZywgbWFrZSBzdXJlIHRoYXQgdGhlIHNvdXJjZSBmaWxlIGV4aXN0cy4gIElmIGl0XG4gICAgICAgIC8vIGRvZXNuJ3Qgd2Ugc2hvdWxkIGdldCBvdXQgYmVmb3JlIHdlIGNyZWF0ZSB0aGUgZGVzdGluYXRpb24gZmlsZS5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKCF0aGlzLmV4aXN0c1N5bmMoKSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTb3VyY2UgZmlsZSAke3RoaXMuX2ZpbGVQYXRofSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGZvciB0aGUgZGVzdGluYXRpb24gZmlsZSBleGlzdHMuXG4gICAgICAgIC8vXG4gICAgICAgIGRlc3RGaWxlLmRpcmVjdG9yeS5lbnN1cmVFeGlzdHNTeW5jKCk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRG8gdGhlIGNvcHkuXG4gICAgICAgIC8vXG4gICAgICAgIGNvcHlGaWxlU3luYyh0aGlzLl9maWxlUGF0aCwgZGVzdEZpbGUudG9TdHJpbmcoKSwge3ByZXNlcnZlVGltZXN0YW1wczogdHJ1ZX0pO1xuXG4gICAgICAgIHJldHVybiBkZXN0RmlsZTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIE1vdmVzIHRoaXMgZmlsZSB0byB0aGUgc3BlY2lmaWVkIGRlc3RpbmF0aW9uLiAgUHJlc2VydmVzIHRoZSBmaWxlJ3MgbGFzdFxuICAgICAqIGFjY2Vzc2VkIHRpbWUgKGF0aW1lKSBhbmQgbGFzdCBtb2RpZmllZCB0aW1lIChtdGltZSkuXG4gICAgICogQHBhcmFtIGRzdERpck9yRmlsZSAtIElmIGEgRmlsZSwgc3BlY2lmaWVzIHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZmlsZSBuYW1lLiAgSWYgYSBkaXJlY3RvcnksIHNwZWNpZmllcyBvbmx5IHRoZVxuICAgICAqIGRlc3RpbmF0aW9uIGRpcmVjdG9yeSBhbmQgZGVzdEZpbGVOYW1lIHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZVxuICAgICAqIG5hbWUuXG4gICAgICogQHBhcmFtIGRzdEZpbGVOYW1lIC0gV2hlbiBkZXN0RGlyT3JGaWxlIGlzIGEgRGlyZWN0b3J5LFxuICAgICAqIG9wdGlvbmFsbHkgc3BlY2lmaWVzIHRoZSBkZXN0aW5hdGlvbiBmaWxlIG5hbWUuICBJZiBvbWl0dGVkLCB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBmaWxlIG5hbWUgd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgc291cmNlICh0aGlzIEZpbGUpLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhIEZpbGUgcmVwcmVzZW50aW5nIHRoZSBkZXN0aW5hdGlvbiBmaWxlLlxuICAgICAqL1xuICAgIHB1YmxpYyBtb3ZlKGRzdERpck9yRmlsZTogRGlyZWN0b3J5IHwgRmlsZSwgZHN0RmlsZU5hbWU/OiBzdHJpbmcpOiBQcm9taXNlPEZpbGU+XG4gICAge1xuICAgICAgICAvL1xuICAgICAgICAvLyBCYXNlZCBvbiB0aGUgcGFyYW1ldGVycywgZmlndXJlIG91dCB3aGF0IHRoZSBkZXN0aW5hdGlvbiBmaWxlIHBhdGggaXNcbiAgICAgICAgLy8gZ29pbmcgdG8gYmUuXG4gICAgICAgIC8vXG4gICAgICAgIGxldCBkZXN0RmlsZTogRmlsZTtcblxuICAgICAgICBpZiAoZHN0RGlyT3JGaWxlIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciBoYXMgc3BlY2lmaWVkIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGVcbiAgICAgICAgICAgIC8vIG5hbWUgaW4gdGhlIGZvcm0gb2YgYSBGaWxlLlxuICAgICAgICAgICAgZGVzdEZpbGUgPSBkc3REaXJPckZpbGU7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7ICAgICAgICAgICAvLyBkc3REaXJPckZpbGUgaW5zdGFuY2VvZiBEaXJlY3RvcnlcbiAgICAgICAgICAgIC8vIFRoZSBjYWxsZXIgaGFzIHNwZWNpZmllZCB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZFxuICAgICAgICAgICAgLy8gb3B0aW9uYWxseSBhIG5ldyBmaWxlIG5hbWUuXG4gICAgICAgICAgICBpZiAoZHN0RmlsZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlc3RGaWxlID0gbmV3IEZpbGUoZHN0RGlyT3JGaWxlLCB0aGlzLmZpbGVOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkc3REaXJPckZpbGUsIGRzdEZpbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJlZm9yZSB3ZSBkbyBhbnl0aGluZywgbWFrZSBzdXJlIHRoYXQgdGhlIHNvdXJjZSBmaWxlIGV4aXN0cy4gIElmIGl0XG4gICAgICAgIC8vIGRvZXNuJ3Qgd2Ugc2hvdWxkIGdldCBvdXQgYmVmb3JlIHdlIGNyZWF0ZSB0aGUgZGVzdGluYXRpb24gZmlsZS5cbiAgICAgICAgLy9cbiAgICAgICAgcmV0dXJuIHRoaXMuZXhpc3RzKClcbiAgICAgICAgLnRoZW4oKHN0YXRzKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgU291cmNlIGZpbGUgJHt0aGlzLl9maWxlUGF0aH0gZG9lcyBub3QgZXhpc3QuYCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIGRpcmVjdG9yeSBmb3IgdGhlIGRlc3RpbmF0aW9uIGZpbGUgZXhpc3RzLlxuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIHJldHVybiBkZXN0RmlsZS5kaXJlY3RvcnkuZW5zdXJlRXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICAvLyBEbyB0aGUgY29weS5cbiAgICAgICAgICAgIC8vXG4gICAgICAgICAgICByZXR1cm4gY29weUZpbGUodGhpcy5fZmlsZVBhdGgsIGRlc3RGaWxlLnRvU3RyaW5nKCksIHtwcmVzZXJ2ZVRpbWVzdGFtcHM6IHRydWV9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy9cbiAgICAgICAgICAgIC8vIERlbGV0ZSB0aGUgc291cmNlIGZpbGUuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuZGVsZXRlKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBkZXN0RmlsZTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBNb3ZlcyB0aGlzIGZpbGUgdG8gdGhlIHNwZWNpZmllZCBkZXN0aW5hdGlvbi4gIFByZXNlcnZlcyB0aGUgZmlsZSdzIGxhc3RcbiAgICAgKiBhY2Nlc3NlZCB0aW1lIChhdGltZSkgYW5kIGxhc3QgbW9kaWZpZWQgdGltZSAobXRpbWUpLlxuICAgICAqIEBwYXJhbSBkc3REaXJPckZpbGUgLSBJZiBhIEZpbGUsIHNwZWNpZmllcyB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGUgbmFtZS4gIElmIGEgZGlyZWN0b3J5LCBzcGVjaWZpZXMgb25seSB0aGVcbiAgICAgKiBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGRlc3RGaWxlTmFtZSBzcGVjaWZpZXMgdGhlIGRlc3RpbmF0aW9uIGZpbGVcbiAgICAgKiBuYW1lLlxuICAgICAqIEBwYXJhbSBkc3RGaWxlTmFtZSAtIFdoZW4gZGVzdERpck9yRmlsZSBpcyBhIERpcmVjdG9yeSxcbiAgICAgKiBvcHRpb25hbGx5IHNwZWNpZmllcyB0aGUgZGVzdGluYXRpb24gZmlsZSBuYW1lLiAgSWYgb21pdHRlZCwgdGhlXG4gICAgICogZGVzdGluYXRpb24gZmlsZSBuYW1lIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHNvdXJjZSAodGhpcyBGaWxlKS5cbiAgICAgKiBAcmV0dXJuIEEgRmlsZSByZXByZXNlbnRpbmcgdGhlIGRlc3RpbmF0aW9uIGZpbGUuXG4gICAgICovXG4gICAgcHVibGljIG1vdmVTeW5jKGRzdERpck9yRmlsZTogRGlyZWN0b3J5IHwgRmlsZSwgZHN0RmlsZU5hbWU/OiBzdHJpbmcpOiBGaWxlXG4gICAge1xuICAgICAgICAvL1xuICAgICAgICAvLyBCYXNlZCBvbiB0aGUgcGFyYW1ldGVycywgZmlndXJlIG91dCB3aGF0IHRoZSBkZXN0aW5hdGlvbiBmaWxlIHBhdGggaXNcbiAgICAgICAgLy8gZ29pbmcgdG8gYmUuXG4gICAgICAgIC8vXG4gICAgICAgIGxldCBkZXN0RmlsZTogRmlsZTtcblxuICAgICAgICBpZiAoZHN0RGlyT3JGaWxlIGluc3RhbmNlb2YgRmlsZSkge1xuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciBoYXMgc3BlY2lmaWVkIHRoZSBkZXN0aW5hdGlvbiBkaXJlY3RvcnkgYW5kIGZpbGVcbiAgICAgICAgICAgIC8vIG5hbWUgaW4gdGhlIGZvcm0gb2YgYSBGaWxlLlxuICAgICAgICAgICAgZGVzdEZpbGUgPSBkc3REaXJPckZpbGU7XG4gICAgICAgIH0gZWxzZSB7ICAgICAgICAgICAvLyBkc3REaXJPckZpbGUgaW5zdGFuY2VvZiBEaXJlY3RvcnlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIFRoZSBjYWxsZXIgaGFzIHNwZWNpZmllZCB0aGUgZGVzdGluYXRpb24gZGlyZWN0b3J5IGFuZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gb3B0aW9uYWxseSBhIG5ldyBmaWxlIG5hbWUuXG4gICAgICAgICAgICBpZiAoZHN0RmlsZU5hbWUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIGRlc3RGaWxlID0gbmV3IEZpbGUoZHN0RGlyT3JGaWxlLCB0aGlzLmZpbGVOYW1lKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgZGVzdEZpbGUgPSBuZXcgRmlsZShkc3REaXJPckZpbGUsIGRzdEZpbGVOYW1lKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIEJlZm9yZSB3ZSBkbyBhbnl0aGluZywgbWFrZSBzdXJlIHRoYXQgdGhlIHNvdXJjZSBmaWxlIGV4aXN0cy4gIElmIGl0XG4gICAgICAgIC8vIGRvZXNuJ3Qgd2Ugc2hvdWxkIGdldCBvdXQgYmVmb3JlIHdlIGNyZWF0ZSB0aGUgZGVzdGluYXRpb24gZmlsZS5cbiAgICAgICAgLy9cbiAgICAgICAgaWYgKCF0aGlzLmV4aXN0c1N5bmMoKSlcbiAgICAgICAge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTb3VyY2UgZmlsZSAke3RoaXMuX2ZpbGVQYXRofSBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGZvciB0aGUgZGVzdGluYXRpb24gZmlsZSBleGlzdHMuXG4gICAgICAgIC8vXG4gICAgICAgIGRlc3RGaWxlLmRpcmVjdG9yeS5lbnN1cmVFeGlzdHNTeW5jKCk7XG5cbiAgICAgICAgLy9cbiAgICAgICAgLy8gRG8gdGhlIGNvcHkuXG4gICAgICAgIC8vXG4gICAgICAgIGNvcHlGaWxlU3luYyh0aGlzLl9maWxlUGF0aCwgZGVzdEZpbGUudG9TdHJpbmcoKSwge3ByZXNlcnZlVGltZXN0YW1wczogdHJ1ZX0pO1xuXG4gICAgICAgIC8vXG4gICAgICAgIC8vIERlbGV0ZSB0aGUgc291cmNlIGZpbGUuXG4gICAgICAgIC8vXG4gICAgICAgIHRoaXMuZGVsZXRlU3luYygpO1xuXG4gICAgICAgIHJldHVybiBkZXN0RmlsZTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFdyaXRlcyB0ZXh0IHRvIHRoaXMgZmlsZSwgcmVwbGFjaW5nIHRoZSBmaWxlIGlmIGl0IGV4aXN0cy4gIElmIGFueSBwYXJlbnRcbiAgICAgKiBkaXJlY3RvcmllcyBkbyBub3QgZXhpc3QsIHRoZXkgYXJlIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIHRleHQgLSBUaGUgbmV3IGNvbnRlbnRzIG9mIHRoaXMgZmlsZVxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgZmlsZSBoYXMgYmVlbiB3cml0dGVuLlxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZSh0ZXh0OiBzdHJpbmcpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5kaXJlY3RvcnkuZW5zdXJlRXhpc3RzKClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBCQlByb21pc2U8dm9pZD4oKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuICAgICAgICAgICAgICAgIGZzLndyaXRlRmlsZSh0aGlzLl9maWxlUGF0aCwgdGV4dCwgXCJ1dGY4XCIsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0KGVycik7XG4gICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFdyaXRlcyB0ZXh0IHRvIHRoaXMgZmlsZSwgcmVwbGFjaW5nIHRoZSBmaWxlIGlmIGl0IGV4aXN0cy4gIElmIGFueSBwYXJlbnRcbiAgICAgKiBkaXJlY3RvcmllcyBkbyBub3QgZXhpc3QsIHRoZXkgYXJlIGNyZWF0ZWQuXG4gICAgICogQHBhcmFtIHRleHQgLSBUaGUgbmV3IGNvbnRlbnRzIG9mIHRoaXMgZmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyB3cml0ZVN5bmModGV4dDogc3RyaW5nKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5kaXJlY3RvcnkuZW5zdXJlRXhpc3RzU3luYygpO1xuICAgICAgICBmcy53cml0ZUZpbGVTeW5jKHRoaXMuX2ZpbGVQYXRoLCB0ZXh0KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFdyaXRlcyBKU09OIGRhdGEgdG8gdGhpcyBmaWxlLCByZXBsYWNpbmcgdGhlIGZpbGUgaWYgaXQgZXhpc3RzLiAgSWYgYW55XG4gICAgICogcGFyZW50IGRpcmVjdG9yaWVzIGRvIG5vdCBleGlzdCwgdGhleSBhcmUgY3JlYXRlZC5cbiAgICAgKiBAcGFyYW0gZGF0YSAtIFRoZSBkYXRhIHRvIGJlIHN0cmluZ2lmaWVkIGFuZCB3cml0dGVuXG4gICAgICogQHJldHVybiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIHRoZSBmaWxlIGhhcyBiZWVuIHdyaXR0ZW5cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVKc29uKGRhdGE6IG9iamVjdCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIGNvbnN0IGpzb25UZXh0ID0gSlNPTi5zdHJpbmdpZnkoZGF0YSwgdW5kZWZpbmVkLCA0KTtcbiAgICAgICAgcmV0dXJuIHRoaXMud3JpdGUoanNvblRleHQpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogV3JpdGVzIEpTT04gZGF0YSB0byB0aGlzIGZpbGUsIHJlcGxhY2luZyB0aGUgZmlsZSBpZiBpdCBleGlzdHMuICBJZiBhbnlcbiAgICAgKiBwYXJlbnQgZGlyZWN0b3JpZXMgZG8gbm90IGV4aXN0LCB0aGV5IGFyZSBjcmVhdGVkLlxuICAgICAqIEBwYXJhbSBkYXRhIC0gVGhlIGRhdGEgdG8gYmUgc3RyaW5naWZpZWQgYW5kIHdyaXR0ZW5cbiAgICAgKi9cbiAgICBwdWJsaWMgd3JpdGVKc29uU3luYyhkYXRhOiBvYmplY3QpOiB2b2lkXG4gICAge1xuICAgICAgICBjb25zdCBqc29uVGV4dCA9IEpTT04uc3RyaW5naWZ5KGRhdGEsIHVuZGVmaW5lZCwgNCk7XG4gICAgICAgIHJldHVybiB0aGlzLndyaXRlU3luYyhqc29uVGV4dCk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDYWxjdWxhdGVzIGEgaGFzaCBvZiB0aGlzIGZpbGUncyBjb250ZW50c1xuICAgICAqIEBwYXJhbSBhbGdvcml0aG0gLSBUaGUgaGFzaGluZyBhbGdvcml0aG0gdG8gdXNlLiAgRm9yIGV4YW1wbGUsIFwibWQ1XCIsXG4gICAgICogXCJzaGEyNTZcIiwgXCJzaGE1MTJcIi4gIFRvIHNlZSBhbGdvcml0aG1zIGF2YWlsYWJsZSBvbiB5b3VyIHBsYXRmb3JtLCBydW5cbiAgICAgKiBgb3BlbnNzbCBsaXN0LW1lc3NhZ2UtZGlnZXN0LWFsZ29yaXRobXNgLlxuICAgICAqIEByZXR1cm4gQSBQcm9taXNlIGZvciBhIGhleGFkZWNpbWFsIHN0cmluZyBjb250YWluaW5nIHRoZSBoYXNoXG4gICAgICovXG4gICAgcHVibGljIGdldEhhc2goYWxnb3JpdGhtOiBzdHJpbmcgPSBcIm1kNVwiKTogUHJvbWlzZTxzdHJpbmc+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlucHV0ID0gZnMuY3JlYXRlUmVhZFN0cmVhbSh0aGlzLl9maWxlUGF0aCk7XG4gICAgICAgICAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goYWxnb3JpdGhtKTtcbiAgICAgICAgICAgIGhhc2guc2V0RW5jb2RpbmcoXCJoZXhcIik7XG5cbiAgICAgICAgICAgIGlucHV0XG4gICAgICAgICAgICAub24oXCJlcnJvclwiLCAoZXJyb3I6IGFueSkgPT4ge1xuICAgICAgICAgICAgICAgIHJlamVjdChuZXcgRXJyb3IoZXJyb3IpKTtcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAub24oXCJlbmRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGhhc2guZW5kKCk7XG4gICAgICAgICAgICAgICAgY29uc3QgaGFzaFZhbHVlID0gaGFzaC5yZWFkKCkgYXMgc3RyaW5nO1xuICAgICAgICAgICAgICAgIHJlc29sdmUoaGFzaFZhbHVlKTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBpbnB1dFxuICAgICAgICAgICAgLnBpcGUoaGFzaCk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ2FsY3VsYXRlcyBhIGhhc2ggb2YgdGhpcyBmaWxlJ3MgY29udGVudHNcbiAgICAgKiBAcGFyYW0gYWxnb3JpdGhtIC0gVGhlIGhhc2hpbmcgYWxnb3JpdGhtIHRvIHVzZS4gIEZvciBleGFtcGxlLCBcIm1kNVwiLFxuICAgICAqIFwic2hhMjU2XCIsIFwic2hhNTEyXCIuICBUbyBzZWUgYWxnb3JpdGhtcyBhdmFpbGFibGUgb24geW91ciBwbGF0Zm9ybSwgcnVuXG4gICAgICogYG9wZW5zc2wgbGlzdC1tZXNzYWdlLWRpZ2VzdC1hbGdvcml0aG1zYC5cbiAgICAgKiBAcmV0dXJuIEEgaGV4YWRlY2ltYWwgc3RyaW5nIGNvbnRhaW5pbmcgdGhlIGhhc2hcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0SGFzaFN5bmMoYWxnb3JpdGhtOiBzdHJpbmcgPSBcIm1kNVwiKTogc3RyaW5nIHtcbiAgICAgICAgY29uc3QgZmlsZURhdGEgPSBmcy5yZWFkRmlsZVN5bmModGhpcy5fZmlsZVBhdGgpO1xuICAgICAgICBjb25zdCBoYXNoID0gY3J5cHRvLmNyZWF0ZUhhc2goYWxnb3JpdGhtKTtcbiAgICAgICAgaGFzaC51cGRhdGUoZmlsZURhdGEpO1xuICAgICAgICByZXR1cm4gaGFzaC5kaWdlc3QoXCJoZXhcIik7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBSZWFkcyB0aGUgY29udGVudHMgb2YgdGhpcyBmaWxlIGFzIGEgc3RyaW5nLiAgUmVqZWN0cyBpZiB0aGlzIGZpbGUgZG9lc1xuICAgICAqIG5vdCBleGlzdC5cbiAgICAgKiBAcmV0dXJuIEEgUHJvbWlzZSBmb3IgdGhlIHRleHQgY29udGVudHMgb2YgdGhpcyBmaWxlXG4gICAgICovXG4gICAgcHVibGljIHJlYWQoKTogUHJvbWlzZTxzdHJpbmc+XG4gICAge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxzdHJpbmc+KChyZXNvbHZlOiAodGV4dDogc3RyaW5nKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgZnMucmVhZEZpbGUodGhpcy5fZmlsZVBhdGgsIHtlbmNvZGluZzogXCJ1dGY4XCJ9LCAoZXJyLCBkYXRhKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycilcbiAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgcmVzb2x2ZShkYXRhKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIHRoZSBjb250ZW50cyBvZiB0aGlzIGZpbGUgYXMgYSBzdHJpbmcuICBUaHJvd3MgaWYgdGhpcyBmaWxlIGRvZXNcbiAgICAgKiBub3QgZXhpc3QuXG4gICAgICogQHJldHVybiBUaGlzIGZpbGUncyBjb250ZW50c1xuICAgICAqL1xuICAgIHB1YmxpYyByZWFkU3luYygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBmcy5yZWFkRmlsZVN5bmModGhpcy5fZmlsZVBhdGgsIHtlbmNvZGluZzogXCJ1dGY4XCJ9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIEpTT04gZGF0YSBmcm9tIHRoaXMgZmlsZS4gIFJlamVjdHMgaWYgdGhpcyBmaWxlIGRvZXMgbm90IGV4aXN0LlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciB0aGUgcGFyc2VkIGRhdGEgY29udGFpbmVkIGluIHRoaXMgZmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkSnNvbjxUPigpOiBQcm9taXNlPFQ+XG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5yZWFkKClcbiAgICAgICAgLnRoZW4oKHRleHQpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBKU09OLnBhcnNlKHRleHQpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJlYWRzIEpTT04gZGF0YSBmcm9tIHRoaXMgZmlsZS4gIFRocm93cyBpZiB0aGlzIGZpbGUgZG9lcyBub3QgZXhpc3QuXG4gICAgICogQHJldHVybiBUaGUgcGFyc2VkIGRhdGEgY29udGFpbmVkIGluIHRoaXMgZmlsZVxuICAgICAqL1xuICAgIHB1YmxpYyByZWFkSnNvblN5bmM8VD4oKTogVFxuICAgIHtcbiAgICAgICAgY29uc3QgdGV4dCA9IHRoaXMucmVhZFN5bmMoKTtcbiAgICAgICAgcmV0dXJuIEpTT04ucGFyc2UodGV4dCk7XG4gICAgfVxuXG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBJQ29weU9wdGlvbnNcbntcbiAgICBwcmVzZXJ2ZVRpbWVzdGFtcHM6IGJvb2xlYW47XG59XG5cblxuLyoqXG4gKiBDb3BpZXMgYSBmaWxlLlxuICogQHBhcmFtIHNvdXJjZUZpbGVQYXRoIC0gVGhlIHBhdGggdG8gdGhlIHNvdXJjZSBmaWxlXG4gKiBAcGFyYW0gZGVzdEZpbGVQYXRoIC0gVGhlIHBhdGggdG8gdGhlIGRlc3RpbmF0aW9uIGZpbGVcbiAqIEBwYXJhbSBvcHRpb25zIC0gT3B0aW9ucyBmb3IgdGhlIGNvcHkgb3BlcmF0aW9uXG4gKiBAcmV0dXJuIEEgUHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gdGhlIGZpbGUgaGFzIGJlZW4gY29waWVkLlxuICovXG5mdW5jdGlvbiBjb3B5RmlsZShzb3VyY2VGaWxlUGF0aDogc3RyaW5nLCBkZXN0RmlsZVBhdGg6IHN0cmluZywgb3B0aW9ucz86IElDb3B5T3B0aW9ucyk6IFByb21pc2U8dm9pZD5cbntcbiAgICAvL1xuICAgIC8vIERlc2lnbiBOb3RlXG4gICAgLy8gV2UgY291bGQgaGF2ZSB1c2VkIGZzLnJlYWRGaWxlKCkgYW5kIGZzLndyaXRlRmlsZSgpIGhlcmUsIGJ1dCB0aGF0IHdvdWxkXG4gICAgLy8gcmVhZCB0aGUgZW50aXJlIGZpbGUgY29udGVudHMgb2YgdGhlIHNvdXJjZSBmaWxlIGludG8gbWVtb3J5LiAgSXQgaXNcbiAgICAvLyB0aG91Z2h0IHRoYXQgdXNpbmcgc3RyZWFtcyBpcyBtb3JlIGVmZmljaWVudCBhbmQgcGVyZm9ybWFudCBiZWNhdXNlXG4gICAgLy8gc3RyZWFtcyBjYW4gcmVhZCBhbmQgd3JpdGUgc21hbGxlciBjaHVua3Mgb2YgdGhlIGRhdGEuXG4gICAgLy9cblxuICAgIHJldHVybiBuZXcgQkJQcm9taXNlPHZvaWQ+KChyZXNvbHZlOiAoKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IHJlYWRTdHJlYW0gPSBmcy5jcmVhdGVSZWFkU3RyZWFtKHNvdXJjZUZpbGVQYXRoKTtcbiAgICAgICAgY29uc3QgcmVhZExpc3RlbmVyVHJhY2tlciA9IG5ldyBMaXN0ZW5lclRyYWNrZXIocmVhZFN0cmVhbSk7XG5cbiAgICAgICAgY29uc3Qgd3JpdGVTdHJlYW0gPSBmcy5jcmVhdGVXcml0ZVN0cmVhbShkZXN0RmlsZVBhdGgpO1xuICAgICAgICBjb25zdCB3cml0ZUxpc3RlbmVyVHJhY2tlciA9IG5ldyBMaXN0ZW5lclRyYWNrZXIod3JpdGVTdHJlYW0pO1xuXG4gICAgICAgIHJlYWRMaXN0ZW5lclRyYWNrZXIub24oXCJlcnJvclwiLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIHJlYWRMaXN0ZW5lclRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICB3cml0ZUxpc3RlbmVyVHJhY2tlci5yZW1vdmVBbGwoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd3JpdGVMaXN0ZW5lclRyYWNrZXIub24oXCJlcnJvclwiLCAoZXJyKSA9PiB7XG4gICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgIHJlYWRMaXN0ZW5lclRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICB3cml0ZUxpc3RlbmVyVHJhY2tlci5yZW1vdmVBbGwoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgd3JpdGVMaXN0ZW5lclRyYWNrZXIub24oXCJjbG9zZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICByZWFkTGlzdGVuZXJUcmFja2VyLnJlbW92ZUFsbCgpO1xuICAgICAgICAgICAgd3JpdGVMaXN0ZW5lclRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIHJlYWRTdHJlYW0ucGlwZSh3cml0ZVN0cmVhbSk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGlmIChvcHRpb25zICYmIG9wdGlvbnMucHJlc2VydmVUaW1lc3RhbXBzKVxuICAgICAgICB7XG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgLy8gVGhlIGNhbGxlciB3YW50cyB0byBwcmVzZXJ2ZSB0aGUgc291cmNlIGZpbGUncyB0aW1lc3RhbXBzLiAgQ29weVxuICAgICAgICAgICAgLy8gdGhlbSB0byB0aGUgZGVzdGluYXRpb24gZmlsZSBub3cuXG4gICAgICAgICAgICAvL1xuICAgICAgICAgICAgcmV0dXJuIHN0YXRBc3luYyhzb3VyY2VGaWxlUGF0aClcbiAgICAgICAgICAgIC50aGVuKChzcmNTdGF0czogZnMuU3RhdHMpID0+IHtcbiAgICAgICAgICAgICAgICAvL1xuICAgICAgICAgICAgICAgIC8vIE5vdGU6ICBTZXR0aW5nIHRoZSB0aW1lc3RhbXBzIG9uIGRlc3QgcmVxdWlyZXMgdXMgdG8gc3BlY2lmeVxuICAgICAgICAgICAgICAgIC8vIHRoZSB0aW1lc3RhbXAgaW4gc2Vjb25kcyAobm90IG1pbGxpc2Vjb25kcykuICBXaGVuIHdlIGRpdmlkZVxuICAgICAgICAgICAgICAgIC8vIGJ5IDEwMDAgYmVsb3cgYW5kIHRydW5jYXRpb24gaGFwcGVucywgd2UgYXJlIGFjdHVhbGx5IHNldHRpbmdcbiAgICAgICAgICAgICAgICAvLyBkZXN0J3MgdGltZXN0YW1wcyAqYmVmb3JlKiB0aG9zZSBvZiBvZiBzb3VyY2UuXG4gICAgICAgICAgICAgICAgLy9cbiAgICAgICAgICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTx2b2lkPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGZzLnV0aW1lcyhkZXN0RmlsZVBhdGgsIHNyY1N0YXRzLmF0aW1lLnZhbHVlT2YoKSAvIDEwMDAsIHNyY1N0YXRzLm10aW1lLnZhbHVlT2YoKSAvIDEwMDAsIChlcnIpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfSk7XG59XG5cblxuLyoqXG4gKiBDb3BpZXMgYSBmaWxlIHN5bmNocm9ub3VzbHkuXG4gKiBAcGFyYW0gc291cmNlRmlsZVBhdGggLSBUaGUgcGF0aCB0byB0aGUgc291cmNlIGZpbGVcbiAqIEBwYXJhbSBkZXN0RmlsZVBhdGggLSBUaGUgcGF0aCB0byB0aGUgZGVzdGluYXRpb24gZmlsZVxuICogQHBhcmFtIG9wdGlvbnMgLSBPcHRpb25zIGZvciB0aGUgY29weSBvcGVyYXRpb25cbiAqL1xuZnVuY3Rpb24gY29weUZpbGVTeW5jKHNvdXJjZUZpbGVQYXRoOiBzdHJpbmcsIGRlc3RGaWxlUGF0aDogc3RyaW5nLCBvcHRpb25zPzogSUNvcHlPcHRpb25zKTogdm9pZFxue1xuICAgIGNvbnN0IGRhdGE6IEJ1ZmZlciA9IGZzLnJlYWRGaWxlU3luYyhzb3VyY2VGaWxlUGF0aCk7XG4gICAgZnMud3JpdGVGaWxlU3luYyhkZXN0RmlsZVBhdGgsIGRhdGEpO1xuXG4gICAgaWYgKG9wdGlvbnMgJiYgb3B0aW9ucy5wcmVzZXJ2ZVRpbWVzdGFtcHMpXG4gICAge1xuICAgICAgICBjb25zdCBzcmNTdGF0cyA9IGZzLnN0YXRTeW5jKHNvdXJjZUZpbGVQYXRoKTtcbiAgICAgICAgZnMudXRpbWVzU3luYyhkZXN0RmlsZVBhdGgsIHNyY1N0YXRzLmF0aW1lLnZhbHVlT2YoKSAvIDEwMDAsIHNyY1N0YXRzLm10aW1lLnZhbHVlT2YoKSAvIDEwMDApO1xuICAgIH1cbn1cbiJdfQ==
