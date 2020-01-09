"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BBPromise = require("bluebird");
var directory_1 = require("./directory");
var file_1 = require("./file");
var spawn_1 = require("./spawn");
var gitHelpers_1 = require("./gitHelpers");
var NodePackage = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new NodePackage.  This constructor is private and should not
     * be called by clients.  Instead, use one of the static methods to create
     * instances.
     *
     * @classdesc A class that represents a Node.js package.
     *
     * @param pkgDir - The directory containing the Node.js package
     */
    function NodePackage(pkgDir) {
        this._pkgDir = pkgDir.absolute();
    }
    /**
     * Creates a NodePackage representing the package in the specified directory.
     * @param pkgDir - The directory containing the Node.js package
     * @return A promise for the resulting NodePackage.  This promise will be
     * rejected if the specified directory does not exist or does not contain a
     * package.json file.
     */
    NodePackage.fromDirectory = function (pkgDir) {
        // Make sure the directory exists.
        return pkgDir.exists()
            .then(function (stats) {
            if (!stats) {
                throw new Error("Directory " + pkgDir.toString() + " does not exist.");
            }
            // Make sure the package has a package.json file in it.
            var packageJson = new file_1.File(pkgDir, "package.json");
            return packageJson.exists();
        })
            .then(function (stats) {
            if (!stats) {
                throw new Error("Directory " + pkgDir.toString() + " does not contain a package.json file.");
            }
            return new NodePackage(pkgDir);
        });
    };
    Object.defineProperty(NodePackage.prototype, "projectName", {
        // TODO: Write unit tests for the following method.
        get: function () {
            return gitHelpers_1.gitUrlToProjectName(this.config.repository.url);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodePackage.prototype, "config", {
        get: function () {
            // If the package.json file has not been read yet, read it now.
            if (this._config === undefined) {
                this._config = new file_1.File(this._pkgDir, "package.json").readJsonSync();
            }
            return this._config;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(NodePackage.prototype, "lockedDependencies", {
        get: function () {
            var packageLockJson = new file_1.File(this._pkgDir, "package-lock.json");
            if (packageLockJson.existsSync()) {
                return packageLockJson.readJsonSync();
            }
            else {
                return undefined;
            }
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Packs this Node package into a .tgz file using "npm pack"
     * @method
     * @param outDir - The output directory where to place the output file.  If
     * not specified, the output will be placed in the package's folder.
     * @return A File object representing the output .tgz file
     */
    NodePackage.prototype.pack = function (outDir) {
        var _this = this;
        return spawn_1.spawn("npm", ["pack"], { cwd: this._pkgDir.toString() })
            .closePromise
            .then(function (stdout) {
            return new file_1.File(_this._pkgDir, stdout);
        })
            .then(function (tgzFile) {
            if (outDir) {
                return tgzFile.move(outDir);
            }
            else {
                return tgzFile;
            }
        });
    };
    /**
     * Publishes this Node.js package to the specified directory.
     * @param publishDir - The directory that will contain the published version
     * of this package
     * @param emptyPublishDir - A flag indicating whether publishDir should be
     * emptied before publishing to it.  If publishing to a regular directory,
     * you probably want to pass true so that any old files are removed.  If
     * publishing to a Git repo directory, you probably want false because you
     * have already removed the files under version control and want the .git
     * directory to remain.
     * @param tmpDir - A temporary directory that can be used when packing and
     * unpacking the package.
     * @return A promise for publishDir
     */
    NodePackage.prototype.publish = function (publishDir, emptyPublishDir, tmpDir) {
        var packageBaseName;
        var extractedTarFile;
        var unpackedDir;
        var unpackedPackageDir;
        // Since we will be executing commands from different directories, make
        // the directories absolute so things don't get confusing.
        publishDir = publishDir.absolute();
        tmpDir = tmpDir.absolute();
        if (publishDir.equals(tmpDir)) {
            return BBPromise.reject("When publishing, publishDir cannot be the same as tmpDir");
        }
        return this.pack(tmpDir)
            .then(function (tgzFile) {
            packageBaseName = tgzFile.baseName;
            // Running the following gunzip command will extract the .tgz file
            // to a .tar file with the same basename.  The original .tgz file is
            // deleted.
            return spawn_1.spawn("gunzip", ["--force", tgzFile.fileName], { cwd: tmpDir.toString() })
                .closePromise;
        })
            .then(function () {
            // The above gunzip command should have extracted a .tar file.  Make
            // sure this assumption is true.
            extractedTarFile = new file_1.File(tmpDir, packageBaseName + ".tar");
            return extractedTarFile.exists()
                .then(function (exists) {
                if (!exists) {
                    throw new Error("Extracted .tar file " + extractedTarFile.toString() + " does not exist.  Aborting.");
                }
            });
        })
            .then(function () {
            // We are about to unpack the tar file.  Create an empty
            // directory where its contents will be placed.
            unpackedDir = new directory_1.Directory(tmpDir, packageBaseName);
            return unpackedDir.empty(); // Creates (if needed) and empties this directory.
        })
            .then(function () {
            return spawn_1.spawn("tar", ["-x", "-C", unpackedDir.toString(), "-f", extractedTarFile.toString()], { cwd: tmpDir.toString() })
                .closePromise;
        })
            .then(function () {
            // When uncompressed, all content is contained within a "package"
            // directory.
            unpackedPackageDir = new directory_1.Directory(unpackedDir, "package");
            return unpackedPackageDir.exists();
        })
            .then(function (stats) {
            if (!stats) {
                throw new Error("Uncompressed package does not have a 'package' directory as expected.");
            }
            if (emptyPublishDir) {
                // The caller wants us to empty the publish directory before
                // publishing to it.  Do it now.
                return publishDir.empty()
                    .then(function () { }); // To make resolve type undefined in all cases
            }
        })
            .then(function () {
            return unpackedPackageDir.copy(publishDir, false);
        })
            .then(function () {
            return publishDir;
        });
    };
    return NodePackage;
}());
exports.NodePackage = NodePackage;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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Q0FBQztRQUN0RCxDQUFDLENBQUM7YUFDRCxJQUFJLENBQUM7WUFDRixPQUFPLFVBQVUsQ0FBQztRQUN0QixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFHTCxrQkFBQztBQUFELENBN01BLEFBNk1DLElBQUE7QUE3TVksa0NBQVciLCJmaWxlIjoibm9kZVBhY2thZ2UuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBmcyBmcm9tIFwiZnNcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuaW1wb3J0IHtzcGF3bn0gZnJvbSBcIi4vc3Bhd25cIjtcbmltcG9ydCB7Z2l0VXJsVG9Qcm9qZWN0TmFtZX0gZnJvbSBcIi4vZ2l0SGVscGVyc1wiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBhY2thZ2VKc29uXG57XG4gICAgbmFtZTogc3RyaW5nO1xuICAgIHZlcnNpb246IHN0cmluZztcbiAgICBkZXNjcmlwdGlvbjogc3RyaW5nO1xuICAgIG1haW46IHN0cmluZztcbiAgICByZXBvc2l0b3J5OiB7dHlwZTogc3RyaW5nLCB1cmw6IHN0cmluZ307XG4gICAgZGV2RGVwZW5kZW5jaWVzOiB7W3BhY2thZ2VOYW1lOiBzdHJpbmddOiBzdHJpbmd9O1xuICAgIGRlcGVuZGVuY2llczoge1twYWNrYWdlTmFtZTogc3RyaW5nXTogc3RyaW5nfTtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBJTG9ja2VkRGVwZW5kZW5jeVxue1xuICAgIG5hbWU/OiBzdHJpbmc7XG4gICAgdmVyc2lvbjogc3RyaW5nO1xuICAgIGxvY2tmaWxlVmVyc2lvbj86IG51bWJlcjtcbiAgICBwYWNrYWdlSW50ZWdyaXR5Pzogc3RyaW5nO1xuICAgIHByZXNlcnZlU3ltbGlua3M/OiBib29sZWFuO1xuICAgIGRlcGVuZGVuY2llczoge1tkZXBlbmRlbmN5TmFtZTogc3RyaW5nXTogSUxvY2tlZERlcGVuZGVuY3l9O1xuICAgIGludGVncml0eT86IHN0cmluZztcbiAgICByZXNvbHZlZD86IHN0cmluZztcbiAgICBidW5kbGVkPzogYm9vbGVhbjtcbiAgICBkZXY/OiBib29sZWFuO1xuICAgIG9wdGlvbmFsPzogYm9vbGVhbjtcbiAgICByZXF1aXJlcz86IGJvb2xlYW4gfCB7W3BhY2thZ2VOYW1lOiBzdHJpbmddOiBzdHJpbmd9O1xufVxuXG5cbmV4cG9ydCBjbGFzcyBOb2RlUGFja2FnZVxue1xuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIE5vZGVQYWNrYWdlIHJlcHJlc2VudGluZyB0aGUgcGFja2FnZSBpbiB0aGUgc3BlY2lmaWVkIGRpcmVjdG9yeS5cbiAgICAgKiBAcGFyYW0gcGtnRGlyIC0gVGhlIGRpcmVjdG9yeSBjb250YWluaW5nIHRoZSBOb2RlLmpzIHBhY2thZ2VcbiAgICAgKiBAcmV0dXJuIEEgcHJvbWlzZSBmb3IgdGhlIHJlc3VsdGluZyBOb2RlUGFja2FnZS4gIFRoaXMgcHJvbWlzZSB3aWxsIGJlXG4gICAgICogcmVqZWN0ZWQgaWYgdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkgZG9lcyBub3QgZXhpc3Qgb3IgZG9lcyBub3QgY29udGFpbiBhXG4gICAgICogcGFja2FnZS5qc29uIGZpbGUuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBmcm9tRGlyZWN0b3J5KHBrZ0RpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxOb2RlUGFja2FnZT5cbiAgICB7XG4gICAgICAgIC8vIE1ha2Ugc3VyZSB0aGUgZGlyZWN0b3J5IGV4aXN0cy5cbiAgICAgICAgcmV0dXJuIHBrZ0Rpci5leGlzdHMoKVxuICAgICAgICAudGhlbigoc3RhdHM6IGZzLlN0YXRzIHwgdW5kZWZpbmVkKSA9PiB7XG4gICAgICAgICAgICBpZiAoIXN0YXRzKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRGlyZWN0b3J5ICR7cGtnRGlyLnRvU3RyaW5nKCl9IGRvZXMgbm90IGV4aXN0LmApO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAvLyBNYWtlIHN1cmUgdGhlIHBhY2thZ2UgaGFzIGEgcGFja2FnZS5qc29uIGZpbGUgaW4gaXQuXG4gICAgICAgICAgICBjb25zdCBwYWNrYWdlSnNvbiA9IG5ldyBGaWxlKHBrZ0RpciwgXCJwYWNrYWdlLmpzb25cIik7XG4gICAgICAgICAgICByZXR1cm4gcGFja2FnZUpzb24uZXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdGF0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYERpcmVjdG9yeSAke3BrZ0Rpci50b1N0cmluZygpfSBkb2VzIG5vdCBjb250YWluIGEgcGFja2FnZS5qc29uIGZpbGUuYCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiBuZXcgTm9kZVBhY2thZ2UocGtnRGlyKTtcbiAgICAgICAgfSk7XG5cbiAgICB9XG5cblxuICAgIC8vIHJlZ2lvbiBEYXRhIG1lbWJlcnNcbiAgICBwcml2YXRlIF9wa2dEaXI6IERpcmVjdG9yeTtcbiAgICBwcml2YXRlIF9jb25maWc6IHVuZGVmaW5lZCB8IElQYWNrYWdlSnNvbjtcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBOb2RlUGFja2FnZS4gIFRoaXMgY29uc3RydWN0b3IgaXMgcHJpdmF0ZSBhbmQgc2hvdWxkIG5vdFxuICAgICAqIGJlIGNhbGxlZCBieSBjbGllbnRzLiAgSW5zdGVhZCwgdXNlIG9uZSBvZiB0aGUgc3RhdGljIG1ldGhvZHMgdG8gY3JlYXRlXG4gICAgICogaW5zdGFuY2VzLlxuICAgICAqXG4gICAgICogQGNsYXNzZGVzYyBBIGNsYXNzIHRoYXQgcmVwcmVzZW50cyBhIE5vZGUuanMgcGFja2FnZS5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBwa2dEaXIgLSBUaGUgZGlyZWN0b3J5IGNvbnRhaW5pbmcgdGhlIE5vZGUuanMgcGFja2FnZVxuICAgICAqL1xuICAgIHByaXZhdGUgY29uc3RydWN0b3IocGtnRGlyOiBEaXJlY3RvcnkpXG4gICAge1xuICAgICAgICB0aGlzLl9wa2dEaXIgPSBwa2dEaXIuYWJzb2x1dGUoKTtcbiAgICB9XG5cblxuICAgIC8vIFRPRE86IFdyaXRlIHVuaXQgdGVzdHMgZm9yIHRoZSBmb2xsb3dpbmcgbWV0aG9kLlxuICAgIHB1YmxpYyBnZXQgcHJvamVjdE5hbWUoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gZ2l0VXJsVG9Qcm9qZWN0TmFtZSh0aGlzLmNvbmZpZy5yZXBvc2l0b3J5LnVybCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGNvbmZpZygpOiBJUGFja2FnZUpzb25cbiAgICB7XG4gICAgICAgIC8vIElmIHRoZSBwYWNrYWdlLmpzb24gZmlsZSBoYXMgbm90IGJlZW4gcmVhZCB5ZXQsIHJlYWQgaXQgbm93LlxuICAgICAgICBpZiAodGhpcy5fY29uZmlnID09PSB1bmRlZmluZWQpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2NvbmZpZyA9IG5ldyBGaWxlKHRoaXMuX3BrZ0RpciwgXCJwYWNrYWdlLmpzb25cIikucmVhZEpzb25TeW5jPElQYWNrYWdlSnNvbj4oKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0aGlzLl9jb25maWchO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBsb2NrZWREZXBlbmRlbmNpZXMoKTogdW5kZWZpbmVkIHwgSUxvY2tlZERlcGVuZGVuY3lcbiAgICB7XG4gICAgICAgIGNvbnN0IHBhY2thZ2VMb2NrSnNvbiA9IG5ldyBGaWxlKHRoaXMuX3BrZ0RpciwgXCJwYWNrYWdlLWxvY2suanNvblwiKTtcbiAgICAgICAgaWYgKHBhY2thZ2VMb2NrSnNvbi5leGlzdHNTeW5jKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBwYWNrYWdlTG9ja0pzb24ucmVhZEpzb25TeW5jPElMb2NrZWREZXBlbmRlbmN5PigpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUGFja3MgdGhpcyBOb2RlIHBhY2thZ2UgaW50byBhIC50Z3ogZmlsZSB1c2luZyBcIm5wbSBwYWNrXCJcbiAgICAgKiBAbWV0aG9kXG4gICAgICogQHBhcmFtIG91dERpciAtIFRoZSBvdXRwdXQgZGlyZWN0b3J5IHdoZXJlIHRvIHBsYWNlIHRoZSBvdXRwdXQgZmlsZS4gIElmXG4gICAgICogbm90IHNwZWNpZmllZCwgdGhlIG91dHB1dCB3aWxsIGJlIHBsYWNlZCBpbiB0aGUgcGFja2FnZSdzIGZvbGRlci5cbiAgICAgKiBAcmV0dXJuIEEgRmlsZSBvYmplY3QgcmVwcmVzZW50aW5nIHRoZSBvdXRwdXQgLnRneiBmaWxlXG4gICAgICovXG4gICAgcHVibGljIHBhY2sob3V0RGlyPzogRGlyZWN0b3J5KTogUHJvbWlzZTxGaWxlPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHNwYXduKFwibnBtXCIsIFtcInBhY2tcIl0sIHtjd2Q6IHRoaXMuX3BrZ0Rpci50b1N0cmluZygpfSlcbiAgICAgICAgLmNsb3NlUHJvbWlzZVxuICAgICAgICAudGhlbigoc3Rkb3V0OiBzdHJpbmcpID0+IHtcbiAgICAgICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9wa2dEaXIsIHN0ZG91dCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCh0Z3pGaWxlOiBGaWxlKSA9PiB7XG4gICAgICAgICAgICBpZiAob3V0RGlyKVxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJldHVybiB0Z3pGaWxlLm1vdmUob3V0RGlyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2VcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGd6RmlsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBQdWJsaXNoZXMgdGhpcyBOb2RlLmpzIHBhY2thZ2UgdG8gdGhlIHNwZWNpZmllZCBkaXJlY3RvcnkuXG4gICAgICogQHBhcmFtIHB1Ymxpc2hEaXIgLSBUaGUgZGlyZWN0b3J5IHRoYXQgd2lsbCBjb250YWluIHRoZSBwdWJsaXNoZWQgdmVyc2lvblxuICAgICAqIG9mIHRoaXMgcGFja2FnZVxuICAgICAqIEBwYXJhbSBlbXB0eVB1Ymxpc2hEaXIgLSBBIGZsYWcgaW5kaWNhdGluZyB3aGV0aGVyIHB1Ymxpc2hEaXIgc2hvdWxkIGJlXG4gICAgICogZW1wdGllZCBiZWZvcmUgcHVibGlzaGluZyB0byBpdC4gIElmIHB1Ymxpc2hpbmcgdG8gYSByZWd1bGFyIGRpcmVjdG9yeSxcbiAgICAgKiB5b3UgcHJvYmFibHkgd2FudCB0byBwYXNzIHRydWUgc28gdGhhdCBhbnkgb2xkIGZpbGVzIGFyZSByZW1vdmVkLiAgSWZcbiAgICAgKiBwdWJsaXNoaW5nIHRvIGEgR2l0IHJlcG8gZGlyZWN0b3J5LCB5b3UgcHJvYmFibHkgd2FudCBmYWxzZSBiZWNhdXNlIHlvdVxuICAgICAqIGhhdmUgYWxyZWFkeSByZW1vdmVkIHRoZSBmaWxlcyB1bmRlciB2ZXJzaW9uIGNvbnRyb2wgYW5kIHdhbnQgdGhlIC5naXRcbiAgICAgKiBkaXJlY3RvcnkgdG8gcmVtYWluLlxuICAgICAqIEBwYXJhbSB0bXBEaXIgLSBBIHRlbXBvcmFyeSBkaXJlY3RvcnkgdGhhdCBjYW4gYmUgdXNlZCB3aGVuIHBhY2tpbmcgYW5kXG4gICAgICogdW5wYWNraW5nIHRoZSBwYWNrYWdlLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIGZvciBwdWJsaXNoRGlyXG4gICAgICovXG4gICAgcHVibGljIHB1Ymxpc2gocHVibGlzaERpcjogRGlyZWN0b3J5LCBlbXB0eVB1Ymxpc2hEaXI6IGJvb2xlYW4sIHRtcERpcjogRGlyZWN0b3J5KTogUHJvbWlzZTxEaXJlY3Rvcnk+XG4gICAge1xuICAgICAgICBsZXQgcGFja2FnZUJhc2VOYW1lOiBzdHJpbmc7XG4gICAgICAgIGxldCBleHRyYWN0ZWRUYXJGaWxlOiBGaWxlO1xuICAgICAgICBsZXQgdW5wYWNrZWREaXI6IERpcmVjdG9yeTtcbiAgICAgICAgbGV0IHVucGFja2VkUGFja2FnZURpcjogRGlyZWN0b3J5O1xuXG4gICAgICAgIC8vIFNpbmNlIHdlIHdpbGwgYmUgZXhlY3V0aW5nIGNvbW1hbmRzIGZyb20gZGlmZmVyZW50IGRpcmVjdG9yaWVzLCBtYWtlXG4gICAgICAgIC8vIHRoZSBkaXJlY3RvcmllcyBhYnNvbHV0ZSBzbyB0aGluZ3MgZG9uJ3QgZ2V0IGNvbmZ1c2luZy5cbiAgICAgICAgcHVibGlzaERpciA9IHB1Ymxpc2hEaXIuYWJzb2x1dGUoKTtcbiAgICAgICAgdG1wRGlyID0gdG1wRGlyLmFic29sdXRlKCk7XG5cbiAgICAgICAgaWYgKHB1Ymxpc2hEaXIuZXF1YWxzKHRtcERpcikpIHtcbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVqZWN0KFwiV2hlbiBwdWJsaXNoaW5nLCBwdWJsaXNoRGlyIGNhbm5vdCBiZSB0aGUgc2FtZSBhcyB0bXBEaXJcIik7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdGhpcy5wYWNrKHRtcERpcilcbiAgICAgICAgLnRoZW4oKHRnekZpbGU6IEZpbGUpID0+IHtcbiAgICAgICAgICAgIHBhY2thZ2VCYXNlTmFtZSA9IHRnekZpbGUuYmFzZU5hbWU7XG5cbiAgICAgICAgICAgIC8vIFJ1bm5pbmcgdGhlIGZvbGxvd2luZyBndW56aXAgY29tbWFuZCB3aWxsIGV4dHJhY3QgdGhlIC50Z3ogZmlsZVxuICAgICAgICAgICAgLy8gdG8gYSAudGFyIGZpbGUgd2l0aCB0aGUgc2FtZSBiYXNlbmFtZS4gIFRoZSBvcmlnaW5hbCAudGd6IGZpbGUgaXNcbiAgICAgICAgICAgIC8vIGRlbGV0ZWQuXG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJndW56aXBcIiwgW1wiLS1mb3JjZVwiLCB0Z3pGaWxlLmZpbGVOYW1lXSwge2N3ZDogdG1wRGlyLnRvU3RyaW5nKCl9KVxuICAgICAgICAgICAgLmNsb3NlUHJvbWlzZTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gVGhlIGFib3ZlIGd1bnppcCBjb21tYW5kIHNob3VsZCBoYXZlIGV4dHJhY3RlZCBhIC50YXIgZmlsZS4gIE1ha2VcbiAgICAgICAgICAgIC8vIHN1cmUgdGhpcyBhc3N1bXB0aW9uIGlzIHRydWUuXG4gICAgICAgICAgICBleHRyYWN0ZWRUYXJGaWxlID0gbmV3IEZpbGUodG1wRGlyLCBwYWNrYWdlQmFzZU5hbWUgKyBcIi50YXJcIik7XG4gICAgICAgICAgICByZXR1cm4gZXh0cmFjdGVkVGFyRmlsZS5leGlzdHMoKVxuICAgICAgICAgICAgLnRoZW4oKGV4aXN0cykgPT4ge1xuICAgICAgICAgICAgICAgIGlmICghZXhpc3RzKSB7XG4gICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgRXh0cmFjdGVkIC50YXIgZmlsZSAke2V4dHJhY3RlZFRhckZpbGUudG9TdHJpbmcoKX0gZG9lcyBub3QgZXhpc3QuICBBYm9ydGluZy5gKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgLy8gV2UgYXJlIGFib3V0IHRvIHVucGFjayB0aGUgdGFyIGZpbGUuICBDcmVhdGUgYW4gZW1wdHlcbiAgICAgICAgICAgIC8vIGRpcmVjdG9yeSB3aGVyZSBpdHMgY29udGVudHMgd2lsbCBiZSBwbGFjZWQuXG4gICAgICAgICAgICB1bnBhY2tlZERpciA9IG5ldyBEaXJlY3RvcnkodG1wRGlyLCBwYWNrYWdlQmFzZU5hbWUpO1xuICAgICAgICAgICAgcmV0dXJuIHVucGFja2VkRGlyLmVtcHR5KCk7ICAvLyBDcmVhdGVzIChpZiBuZWVkZWQpIGFuZCBlbXB0aWVzIHRoaXMgZGlyZWN0b3J5LlxuICAgICAgICB9KVxuICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gc3Bhd24oXCJ0YXJcIiwgW1wiLXhcIiwgXCItQ1wiLCB1bnBhY2tlZERpci50b1N0cmluZygpLCBcIi1mXCIsIGV4dHJhY3RlZFRhckZpbGUudG9TdHJpbmcoKV0sIHtjd2Q6IHRtcERpci50b1N0cmluZygpfSlcbiAgICAgICAgICAgIC5jbG9zZVByb21pc2U7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIC8vIFdoZW4gdW5jb21wcmVzc2VkLCBhbGwgY29udGVudCBpcyBjb250YWluZWQgd2l0aGluIGEgXCJwYWNrYWdlXCJcbiAgICAgICAgICAgIC8vIGRpcmVjdG9yeS5cbiAgICAgICAgICAgIHVucGFja2VkUGFja2FnZURpciA9IG5ldyBEaXJlY3RvcnkodW5wYWNrZWREaXIsIFwicGFja2FnZVwiKTtcbiAgICAgICAgICAgIHJldHVybiB1bnBhY2tlZFBhY2thZ2VEaXIuZXhpc3RzKCk7XG4gICAgICAgIH0pXG4gICAgICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAgICAgaWYgKCFzdGF0cylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJVbmNvbXByZXNzZWQgcGFja2FnZSBkb2VzIG5vdCBoYXZlIGEgJ3BhY2thZ2UnIGRpcmVjdG9yeSBhcyBleHBlY3RlZC5cIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChlbXB0eVB1Ymxpc2hEaXIpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgLy8gVGhlIGNhbGxlciB3YW50cyB1cyB0byBlbXB0eSB0aGUgcHVibGlzaCBkaXJlY3RvcnkgYmVmb3JlXG4gICAgICAgICAgICAgICAgLy8gcHVibGlzaGluZyB0byBpdC4gIERvIGl0IG5vdy5cbiAgICAgICAgICAgICAgICByZXR1cm4gcHVibGlzaERpci5lbXB0eSgpXG4gICAgICAgICAgICAgICAgLnRoZW4oKCkgPT4ge30pOyAgIC8vIFRvIG1ha2UgcmVzb2x2ZSB0eXBlIHVuZGVmaW5lZCBpbiBhbGwgY2FzZXNcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHVucGFja2VkUGFja2FnZURpci5jb3B5KHB1Ymxpc2hEaXIsIGZhbHNlKTtcbiAgICAgICAgfSlcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHB1Ymxpc2hEaXI7XG4gICAgICAgIH0pO1xuICAgIH1cblxuXG59XG4iXX0=
