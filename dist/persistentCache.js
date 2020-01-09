"use strict";
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
var _ = require("lodash");
var BBPromise = require("bluebird");
var directory_1 = require("./directory");
var file_1 = require("./file");
/**
 * @classdesc A key-value data structure that persists all data to the
 * filesystem. Inspired by:
 * https://github.com/LionC/persistent-cache/blob/master/index.js
 */
var PersistentCache = /** @class */ (function () {
    // endregion
    /**
     * Creates a new PersistentCache instance.  Private because instances should
     * be created with the static `create()` method.
     * @param name - The name of this cache
     * @param cacheDir - The name of this cache's directory.  This directory is
     * created in create() because it is async.
     */
    function PersistentCache(name, cacheDir) {
        this._memCache = {};
        this._name = name;
        this._cacheDir = cacheDir;
    }
    /**
     * Creates a new PersistentCache instance.
     * @param name - The name of the cache
     * @param options - configuration options.  See IPersistentCacheOptions.
     * @return A promise that resolves with the new cache instance or rejects
     * if there were any errors.
     */
    PersistentCache.create = function (name, options) {
        if (!isValidFilesystemName(name)) {
            return BBPromise.reject(new Error("Illegal cache name"));
        }
        options = _.defaults({}, options, { dir: process.cwd() });
        var rootDir = new directory_1.Directory(options.dir);
        if (!rootDir.existsSync()) {
            return BBPromise.reject(new Error("Directory \"" + options.dir + "\" does not exist."));
        }
        // Create the directory for the cache being created.
        var cacheDir = new directory_1.Directory(rootDir, name);
        return cacheDir.ensureExists()
            .then(function () {
            return new PersistentCache(name, cacheDir);
        });
    };
    PersistentCache.createSync = function (name, options) {
        if (!isValidFilesystemName(name)) {
            throw new Error("Illegal cache name");
        }
        options = _.defaults({}, options, { dir: process.cwd() });
        var rootDir = new directory_1.Directory(options.dir);
        if (!rootDir.existsSync()) {
            throw new Error("Directory \"" + options.dir + "\" does not exist.");
        }
        // Create the directory for the cache being created.
        var cacheDir = new directory_1.Directory(rootDir, name);
        cacheDir.ensureExistsSync();
        return new PersistentCache(name, cacheDir);
    };
    /**
     * Adds/overwrites a key in this cache.
     * @param key - The key
     * @param val - The value
     * @return A promise that resolves when the value has been stored.  Rejects
     * if the specified key name is invalid.
     */
    PersistentCache.prototype.put = function (key, val) {
        if (!isValidFilesystemName(key)) {
            return BBPromise.reject(new Error("Invalid character in key " + key));
        }
        // Add the entry to the memory cache.
        var entry = new CacheEntry(val);
        this._memCache[key] = entry;
        // Add the entry to the persistent store.
        var keyFile = this.keyToKeyFile(key);
        return keyFile.writeJson(entry.serialize());
    };
    /**
     * Reads a value from this cache.
     * @param key - The key to read
     * @return A promise that resolves with the value.  The promise rejects if
     * `key` is not in this cache.
     */
    PersistentCache.prototype.get = function (key) {
        var _this = this;
        // If the requested key is in the memory cache, use it.
        if (this._memCache.hasOwnProperty(key)) {
            return BBPromise.resolve(this._memCache[key].payload);
        }
        // See if the requested key is persisted.
        var keyFile = this.keyToKeyFile(key);
        return keyFile.exists()
            .then(function (exists) {
            // If the requested key is not persisted, we do not have it.
            if (!exists) {
                throw new Error("No value");
            }
            // The requested key was persisted.  Load it, put it in the memory
            // cache and return the value to the caller.
            return keyFile.readJson()
                .then(function (data) {
                var entry = CacheEntry.deserialize(data);
                _this._memCache[key] = entry;
                return entry.payload;
            });
        });
    };
    /**
     * Deletes the specified key from this cache
     * @param key - The key to delete
     * @return A promise that resolves when the operation is complete
     */
    PersistentCache.prototype.delete = function (key) {
        // Remove it from the memory cache.
        delete this._memCache[key];
        // Remove it from the persistent store.
        var keyFile = this.keyToKeyFile(key);
        return keyFile.delete();
    };
    /**
     * Enumerates the keys in this cache
     * @return A promise that resolves with the keys present in this cache
     */
    PersistentCache.prototype.keys = function () {
        var _this = this;
        return this._cacheDir.contents()
            .then(function (directoryContents) {
            return _.map(directoryContents.files, function (curFile) { return _this.keyFileToKey(curFile); });
        });
    };
    // region Private Helper Methods
    /**
     * Helper function that converts from a key name to its associated file in
     * the filesystem.
     * @param key - The key name to convert
     * @return The corresponding File
     */
    PersistentCache.prototype.keyToKeyFile = function (key) {
        return new file_1.File(this._cacheDir, key + ".json");
    };
    /**
     * Helper function that converts from a File to the cache key it represents
     * @param keyFile - The file to convert
     * @return The corresponding key string
     */
    PersistentCache.prototype.keyFileToKey = function (keyFile) {
        return keyFile.baseName;
    };
    return PersistentCache;
}());
exports.PersistentCache = PersistentCache;
/**
 * Helper function that returns invalid filesystem characters that cannot appear
 * in cache or key names due to the fact they are persisted in filesystem
 * directory names and file names.
 * @return An array of illegal characters.
 */
function getIllegalChars() {
    return [
        "<",
        ">",
        ":",
        "\"",
        "/",
        "\\",
        "|",
        "?",
        "*",
        "^" // illegal in: FAT
    ];
}
exports.getIllegalChars = getIllegalChars;
/**
 * Determines whether the specified name is allowed (according to underlying
 * filesystem)
 * @param name - The name to be validated
 * @return true if `name` is valid.  false otherwise.
 */
function isValidFilesystemName(name) {
    var e_1, _a;
    // FUTURE: Could use the info in the following article to do a better job
    //         validating names.
    //         https://kb.acronis.com/content/39790
    var illegalChars = getIllegalChars();
    try {
        for (var illegalChars_1 = __values(illegalChars), illegalChars_1_1 = illegalChars_1.next(); !illegalChars_1_1.done; illegalChars_1_1 = illegalChars_1.next()) {
            var curIllegalChar = illegalChars_1_1.value;
            if (name.indexOf(curIllegalChar) >= 0) {
                return false;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (illegalChars_1_1 && !illegalChars_1_1.done && (_a = illegalChars_1.return)) _a.call(illegalChars_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return true;
}
// tslint:disable-next-line:max-classes-per-file
var CacheEntry = /** @class */ (function () {
    // endregion
    /**
     * Creates a new CacheEntry instance
     * @param payload - The user's data to be stored in this entry
     */
    function CacheEntry(payload) {
        this._payload = payload;
    }
    /**
     * Creates a CacheEntry instance from its serialized form.  Templated on
     * type "U", which represents the type of user data stored in the payload.
     * Note, static methods cannot use the class template type "T".
     * @param serialized - The serialized CacheEntry
     * @return A CacheEntry instance
     */
    CacheEntry.deserialize = function (serialized) {
        return new CacheEntry(serialized.payload);
    };
    /**
     * Serializes this entry to an object that can be persisted.
     * @return A version of this object that can be persisted and later
     * deserialized
     */
    CacheEntry.prototype.serialize = function () {
        return {
            payload: this._payload
        };
    };
    Object.defineProperty(CacheEntry.prototype, "payload", {
        /**
         * Retrieves the user data stored in this entry.
         * @return The user data
         */
        get: function () {
            return this._payload;
        },
        enumerable: true,
        configurable: true
    });
    return CacheEntry;
}());

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wZXJzaXN0ZW50Q2FjaGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7O0FBQUEsMEJBQTRCO0FBQzVCLG9DQUFzQztBQUN0Qyx5Q0FBc0M7QUFDdEMsK0JBQTRCO0FBUTVCOzs7O0dBSUc7QUFDSDtJQXlESSxZQUFZO0lBR1o7Ozs7OztPQU1HO0lBQ0gseUJBQW9CLElBQVksRUFBRSxRQUFtQjtRQVhwQyxjQUFTLEdBQW1DLEVBQUUsQ0FBQztRQVk1RCxJQUFJLENBQUMsS0FBSyxHQUFPLElBQUksQ0FBQztRQUN0QixJQUFJLENBQUMsU0FBUyxHQUFHLFFBQVEsQ0FBQztJQUM5QixDQUFDO0lBbkVEOzs7Ozs7T0FNRztJQUNXLHNCQUFNLEdBQXBCLFVBQXdCLElBQVksRUFBRSxPQUFpQztRQUVuRSxJQUFJLENBQUMscUJBQXFCLENBQUMsSUFBSSxDQUFDLEVBQUU7WUFDOUIsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLG9CQUFvQixDQUFDLENBQUMsQ0FBQztTQUM1RDtRQUVELE9BQU8sR0FBRyxDQUFDLENBQUMsUUFBUSxDQUFDLEVBQUUsRUFBRSxPQUFPLEVBQUUsRUFBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLEdBQUcsRUFBRSxFQUFDLENBQUMsQ0FBQztRQUV4RCxJQUFNLE9BQU8sR0FBRyxJQUFJLHFCQUFTLENBQUMsT0FBTyxDQUFDLEdBQUksQ0FBQyxDQUFDO1FBRTVDLElBQUksQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLEVBQUU7WUFDdkIsT0FBTyxTQUFTLENBQUMsTUFBTSxDQUFDLElBQUksS0FBSyxDQUFDLGlCQUFjLE9BQU8sQ0FBQyxHQUFJLHVCQUFtQixDQUFDLENBQUMsQ0FBQztTQUNyRjtRQUVELG9EQUFvRDtRQUNwRCxJQUFNLFFBQVEsR0FBRyxJQUFJLHFCQUFTLENBQUMsT0FBTyxFQUFFLElBQUksQ0FBQyxDQUFDO1FBQzlDLE9BQVEsUUFBUSxDQUFDLFlBQVksRUFB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OUIsQ0FBQztBQUNOLENBQUM7QUFiRCwwQ0FhQztBQUlEOzs7OztHQUtHO0FBQ0gsU0FBUyxxQkFBcUIsQ0FBQyxJQUFZOztJQUV2Qyx5RUFBeUU7SUFDekUsNEJBQTRCO0lBQzVCLCtDQUErQztJQUMvQyxJQUFNLFlBQVksR0FBRyxlQUFlLEVBQUUsQ0FBQzs7UUFFdkMsS0FBNkIsSUFBQSxpQkFBQSxTQUFBLFlBQVksQ0FBQSwwQ0FBQSxvRUFBRTtZQUF0QyxJQUFNLGNBQWMseUJBQUE7WUFDckIsSUFBSSxJQUFJLENBQUMsT0FBTyxDQUFDLGNBQWMsQ0FBQyxJQUFJLENBQUMsRUFBRTtnQkFDbkMsT0FBTyxLQUFLLENBQUM7YUFDaEI7U0FDSjs7Ozs7Ozs7O0lBRUQsT0FBTyxJQUFJLENBQUM7QUFDaEIsQ0FBQztBQUdELGdEQUFnRDtBQUNoRDtJQWdCSSxZQUFZO0lBR1o7OztPQUdHO0lBQ0gsb0JBQW1CLE9BQVU7UUFDekIsSUFBSSxDQUFDLFFBQVEsR0FBRyxPQUFPLENBQUM7SUFDNUIsQ0FBQztJQXZCRDs7Ozs7O09BTUc7SUFDVyxzQkFBVyxHQUF6QixVQUE2QixVQUF3QjtRQUNqRCxPQUFPLElBQUksVUFBVSxDQUFJLFVBQVUsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUNqRCxDQUFDO0lBaUJEOzs7O09BSUc7SUFDSSw4QkFBUyxHQUFoQjtRQUNJLE9BQU87WUFDSCxPQUFPLEVBQUUsSUFBSSxDQUFDLFFBQVE7U0FDekIsQ0FBQztJQUNOLENBQUM7SUFPRCxzQkFBVywrQkFBTztRQUpsQjs7O1dBR0c7YUFDSDtZQUNJLE9BQU8sSUFBSSxDQUFDLFFBQVEsQ0FBQztRQUN6QixDQUFDOzs7T0FBQTtJQUNMLGlCQUFDO0FBQUQsQ0EvQ0EsQUErQ0MsSUFBQSIsImZpbGUiOiJwZXJzaXN0ZW50Q2FjaGUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7RGlyZWN0b3J5fSBmcm9tIFwiLi9kaXJlY3RvcnlcIjtcbmltcG9ydCB7RmlsZX0gZnJvbSBcIi4vZmlsZVwiO1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVBlcnNpc3RlbnRDYWNoZU9wdGlvbnMge1xuICAgIGRpcj86IHN0cmluZzsgICAgLy8gZGVmYXVsdCBpcyBwcm9jZXNzLmN3ZCgpXG59XG5cblxuLyoqXG4gKiBAY2xhc3NkZXNjIEEga2V5LXZhbHVlIGRhdGEgc3RydWN0dXJlIHRoYXQgcGVyc2lzdHMgYWxsIGRhdGEgdG8gdGhlXG4gKiBmaWxlc3lzdGVtLiBJbnNwaXJlZCBieTpcbiAqIGh0dHBzOi8vZ2l0aHViLmNvbS9MaW9uQy9wZXJzaXN0ZW50LWNhY2hlL2Jsb2IvbWFzdGVyL2luZGV4LmpzXG4gKi9cbmV4cG9ydCBjbGFzcyBQZXJzaXN0ZW50Q2FjaGU8VD4ge1xuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IFBlcnNpc3RlbnRDYWNoZSBpbnN0YW5jZS5cbiAgICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoZSBjYWNoZVxuICAgICAqIEBwYXJhbSBvcHRpb25zIC0gY29uZmlndXJhdGlvbiBvcHRpb25zLiAgU2VlIElQZXJzaXN0ZW50Q2FjaGVPcHRpb25zLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgbmV3IGNhY2hlIGluc3RhbmNlIG9yIHJlamVjdHNcbiAgICAgKiBpZiB0aGVyZSB3ZXJlIGFueSBlcnJvcnMuXG4gICAgICovXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGU8VD4obmFtZTogc3RyaW5nLCBvcHRpb25zPzogSVBlcnNpc3RlbnRDYWNoZU9wdGlvbnMpOiBQcm9taXNlPFBlcnNpc3RlbnRDYWNoZTxUPj4ge1xuXG4gICAgICAgIGlmICghaXNWYWxpZEZpbGVzeXN0ZW1OYW1lKG5hbWUpKSB7XG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoXCJJbGxlZ2FsIGNhY2hlIG5hbWVcIikpO1xuICAgICAgICB9XG5cbiAgICAgICAgb3B0aW9ucyA9IF8uZGVmYXVsdHMoe30sIG9wdGlvbnMsIHtkaXI6IHByb2Nlc3MuY3dkKCl9KTtcblxuICAgICAgICBjb25zdCByb290RGlyID0gbmV3IERpcmVjdG9yeShvcHRpb25zLmRpciEpO1xuXG4gICAgICAgIGlmICghcm9vdERpci5leGlzdHNTeW5jKCkpIHtcbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVqZWN0KG5ldyBFcnJvcihgRGlyZWN0b3J5IFwiJHtvcHRpb25zLmRpciF9XCIgZG9lcyBub3QgZXhpc3QuYCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQ3JlYXRlIHRoZSBkaXJlY3RvcnkgZm9yIHRoZSBjYWNoZSBiZWluZyBjcmVhdGVkLlxuICAgICAgICBjb25zdCBjYWNoZURpciA9IG5ldyBEaXJlY3Rvcnkocm9vdERpciwgbmFtZSk7XG4gICAgICAgIHJldHVybiAgY2FjaGVEaXIuZW5zdXJlRXhpc3RzKClcbiAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIG5ldyBQZXJzaXN0ZW50Q2FjaGU8VD4obmFtZSwgY2FjaGVEaXIpO1xuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlU3luYzxUPihuYW1lOiBzdHJpbmcsIG9wdGlvbnM/OiBJUGVyc2lzdGVudENhY2hlT3B0aW9ucyk6IFBlcnNpc3RlbnRDYWNoZTxUPiB7XG4gICAgICAgIGlmICghaXNWYWxpZEZpbGVzeXN0ZW1OYW1lKG5hbWUpKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJJbGxlZ2FsIGNhY2hlIG5hbWVcIik7XG4gICAgICAgIH1cblxuICAgICAgICBvcHRpb25zID0gXy5kZWZhdWx0cyh7fSwgb3B0aW9ucywge2RpcjogcHJvY2Vzcy5jd2QoKX0pO1xuXG4gICAgICAgIGNvbnN0IHJvb3REaXIgPSBuZXcgRGlyZWN0b3J5KG9wdGlvbnMuZGlyISk7XG5cbiAgICAgICAgaWYgKCFyb290RGlyLmV4aXN0c1N5bmMoKSkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBEaXJlY3RvcnkgXCIke29wdGlvbnMuZGlyIX1cIiBkb2VzIG5vdCBleGlzdC5gKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIENyZWF0ZSB0aGUgZGlyZWN0b3J5IGZvciB0aGUgY2FjaGUgYmVpbmcgY3JlYXRlZC5cbiAgICAgICAgY29uc3QgY2FjaGVEaXIgPSBuZXcgRGlyZWN0b3J5KHJvb3REaXIsIG5hbWUpO1xuICAgICAgICBjYWNoZURpci5lbnN1cmVFeGlzdHNTeW5jKCk7XG4gICAgICAgIHJldHVybiBuZXcgUGVyc2lzdGVudENhY2hlPFQ+KG5hbWUsIGNhY2hlRGlyKTtcbiAgICB9XG5cblxuICAgIC8vIHJlZ2lvbiBJbnN0YW5jZSBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9uYW1lOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfY2FjaGVEaXI6IERpcmVjdG9yeTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9tZW1DYWNoZToge1trZXk6IHN0cmluZ106IENhY2hlRW50cnk8VD59ID0ge307XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgUGVyc2lzdGVudENhY2hlIGluc3RhbmNlLiAgUHJpdmF0ZSBiZWNhdXNlIGluc3RhbmNlcyBzaG91bGRcbiAgICAgKiBiZSBjcmVhdGVkIHdpdGggdGhlIHN0YXRpYyBgY3JlYXRlKClgIG1ldGhvZC5cbiAgICAgKiBAcGFyYW0gbmFtZSAtIFRoZSBuYW1lIG9mIHRoaXMgY2FjaGVcbiAgICAgKiBAcGFyYW0gY2FjaGVEaXIgLSBUaGUgbmFtZSBvZiB0aGlzIGNhY2hlJ3MgZGlyZWN0b3J5LiAgVGhpcyBkaXJlY3RvcnkgaXNcbiAgICAgKiBjcmVhdGVkIGluIGNyZWF0ZSgpIGJlY2F1c2UgaXQgaXMgYXN5bmMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihuYW1lOiBzdHJpbmcsIGNhY2hlRGlyOiBEaXJlY3RvcnkpIHtcbiAgICAgICAgdGhpcy5fbmFtZSAgICAgPSBuYW1lO1xuICAgICAgICB0aGlzLl9jYWNoZURpciA9IGNhY2hlRGlyO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQWRkcy9vdmVyd3JpdGVzIGEga2V5IGluIHRoaXMgY2FjaGUuXG4gICAgICogQHBhcmFtIGtleSAtIFRoZSBrZXlcbiAgICAgKiBAcGFyYW0gdmFsIC0gVGhlIHZhbHVlXG4gICAgICogQHJldHVybiBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIHRoZSB2YWx1ZSBoYXMgYmVlbiBzdG9yZWQuICBSZWplY3RzXG4gICAgICogaWYgdGhlIHNwZWNpZmllZCBrZXkgbmFtZSBpcyBpbnZhbGlkLlxuICAgICAqL1xuICAgIHB1YmxpYyBwdXQoa2V5OiBzdHJpbmcsIHZhbDogVCk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICBpZiAoIWlzVmFsaWRGaWxlc3lzdGVtTmFtZShrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYEludmFsaWQgY2hhcmFjdGVyIGluIGtleSAke2tleX1gKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBZGQgdGhlIGVudHJ5IHRvIHRoZSBtZW1vcnkgY2FjaGUuXG4gICAgICAgIGNvbnN0IGVudHJ5ID0gbmV3IENhY2hlRW50cnkodmFsKTtcbiAgICAgICAgdGhpcy5fbWVtQ2FjaGVba2V5XSA9IGVudHJ5O1xuXG4gICAgICAgIC8vIEFkZCB0aGUgZW50cnkgdG8gdGhlIHBlcnNpc3RlbnQgc3RvcmUuXG4gICAgICAgIGNvbnN0IGtleUZpbGUgPSB0aGlzLmtleVRvS2V5RmlsZShrZXkpO1xuICAgICAgICByZXR1cm4ga2V5RmlsZS53cml0ZUpzb24oZW50cnkuc2VyaWFsaXplKCkpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVhZHMgYSB2YWx1ZSBmcm9tIHRoaXMgY2FjaGUuXG4gICAgICogQHBhcmFtIGtleSAtIFRoZSBrZXkgdG8gcmVhZFxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgdmFsdWUuICBUaGUgcHJvbWlzZSByZWplY3RzIGlmXG4gICAgICogYGtleWAgaXMgbm90IGluIHRoaXMgY2FjaGUuXG4gICAgICovXG4gICAgcHVibGljIGdldChrZXk6IHN0cmluZyk6IFByb21pc2U8VD4ge1xuICAgICAgICAvLyBJZiB0aGUgcmVxdWVzdGVkIGtleSBpcyBpbiB0aGUgbWVtb3J5IGNhY2hlLCB1c2UgaXQuXG4gICAgICAgIGlmICh0aGlzLl9tZW1DYWNoZS5oYXNPd25Qcm9wZXJ0eShrZXkpKSB7XG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlc29sdmUodGhpcy5fbWVtQ2FjaGVba2V5XS5wYXlsb2FkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFNlZSBpZiB0aGUgcmVxdWVzdGVkIGtleSBpcyBwZXJzaXN0ZWQuXG4gICAgICAgIGNvbnN0IGtleUZpbGUgPSB0aGlzLmtleVRvS2V5RmlsZShrZXkpO1xuICAgICAgICByZXR1cm4ga2V5RmlsZS5leGlzdHMoKVxuICAgICAgICAudGhlbigoZXhpc3RzKSA9PiB7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSByZXF1ZXN0ZWQga2V5IGlzIG5vdCBwZXJzaXN0ZWQsIHdlIGRvIG5vdCBoYXZlIGl0LlxuICAgICAgICAgICAgaWYgKCFleGlzdHMpIHtcbiAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJObyB2YWx1ZVwiKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgLy8gVGhlIHJlcXVlc3RlZCBrZXkgd2FzIHBlcnNpc3RlZC4gIExvYWQgaXQsIHB1dCBpdCBpbiB0aGUgbWVtb3J5XG4gICAgICAgICAgICAvLyBjYWNoZSBhbmQgcmV0dXJuIHRoZSB2YWx1ZSB0byB0aGUgY2FsbGVyLlxuICAgICAgICAgICAgcmV0dXJuIGtleUZpbGUucmVhZEpzb248e3BheWxvYWQ6IFR9PigpXG4gICAgICAgICAgICAudGhlbigoZGF0YSkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGVudHJ5ID0gQ2FjaGVFbnRyeS5kZXNlcmlhbGl6ZTxUPihkYXRhKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9tZW1DYWNoZVtrZXldID0gZW50cnk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGVudHJ5LnBheWxvYWQ7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBEZWxldGVzIHRoZSBzcGVjaWZpZWQga2V5IGZyb20gdGhpcyBjYWNoZVxuICAgICAqIEBwYXJhbSBrZXkgLSBUaGUga2V5IHRvIGRlbGV0ZVxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGUgb3BlcmF0aW9uIGlzIGNvbXBsZXRlXG4gICAgICovXG4gICAgcHVibGljIGRlbGV0ZShrZXk6IHN0cmluZyk6IFByb21pc2U8dm9pZD4ge1xuICAgICAgICAvLyBSZW1vdmUgaXQgZnJvbSB0aGUgbWVtb3J5IGNhY2hlLlxuICAgICAgICBkZWxldGUgdGhpcy5fbWVtQ2FjaGVba2V5XTtcbiAgICAgICAgLy8gUmVtb3ZlIGl0IGZyb20gdGhlIHBlcnNpc3RlbnQgc3RvcmUuXG4gICAgICAgIGNvbnN0IGtleUZpbGUgPSB0aGlzLmtleVRvS2V5RmlsZShrZXkpO1xuICAgICAgICByZXR1cm4ga2V5RmlsZS5kZWxldGUoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEVudW1lcmF0ZXMgdGhlIGtleXMgaW4gdGhpcyBjYWNoZVxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUga2V5cyBwcmVzZW50IGluIHRoaXMgY2FjaGVcbiAgICAgKi9cbiAgICBwdWJsaWMga2V5cygpOiBQcm9taXNlPEFycmF5PHN0cmluZz4+IHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2NhY2hlRGlyLmNvbnRlbnRzKClcbiAgICAgICAgLnRoZW4oKGRpcmVjdG9yeUNvbnRlbnRzKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXy5tYXAoZGlyZWN0b3J5Q29udGVudHMuZmlsZXMsIChjdXJGaWxlKSA9PiB0aGlzLmtleUZpbGVUb0tleShjdXJGaWxlKSk7XG4gICAgICAgIH0pO1xuXG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gUHJpdmF0ZSBIZWxwZXIgTWV0aG9kc1xuXG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBjb252ZXJ0cyBmcm9tIGEga2V5IG5hbWUgdG8gaXRzIGFzc29jaWF0ZWQgZmlsZSBpblxuICAgICAqIHRoZSBmaWxlc3lzdGVtLlxuICAgICAqIEBwYXJhbSBrZXkgLSBUaGUga2V5IG5hbWUgdG8gY29udmVydFxuICAgICAqIEByZXR1cm4gVGhlIGNvcnJlc3BvbmRpbmcgRmlsZVxuICAgICAqL1xuICAgIHByaXZhdGUga2V5VG9LZXlGaWxlKGtleTogc3RyaW5nKTogRmlsZSB7XG4gICAgICAgIHJldHVybiBuZXcgRmlsZSh0aGlzLl9jYWNoZURpciwga2V5ICsgXCIuanNvblwiKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IGNvbnZlcnRzIGZyb20gYSBGaWxlIHRvIHRoZSBjYWNoZSBrZXkgaXQgcmVwcmVzZW50c1xuICAgICAqIEBwYXJhbSBrZXlGaWxlIC0gVGhlIGZpbGUgdG8gY29udmVydFxuICAgICAqIEByZXR1cm4gVGhlIGNvcnJlc3BvbmRpbmcga2V5IHN0cmluZ1xuICAgICAqL1xuICAgIHByaXZhdGUga2V5RmlsZVRvS2V5KGtleUZpbGU6IEZpbGUpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4ga2V5RmlsZS5iYXNlTmFtZTtcbiAgICB9XG5cblxuICAgIC8vIGVuZHJlZ2lvblxuXG5cbn1cblxuXG4vKipcbiAqIEhlbHBlciBmdW5jdGlvbiB0aGF0IHJldHVybnMgaW52YWxpZCBmaWxlc3lzdGVtIGNoYXJhY3RlcnMgdGhhdCBjYW5ub3QgYXBwZWFyXG4gKiBpbiBjYWNoZSBvciBrZXkgbmFtZXMgZHVlIHRvIHRoZSBmYWN0IHRoZXkgYXJlIHBlcnNpc3RlZCBpbiBmaWxlc3lzdGVtXG4gKiBkaXJlY3RvcnkgbmFtZXMgYW5kIGZpbGUgbmFtZXMuXG4gKiBAcmV0dXJuIEFuIGFycmF5IG9mIGlsbGVnYWwgY2hhcmFjdGVycy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldElsbGVnYWxDaGFycygpOiBBcnJheTxzdHJpbmc+IHtcbiAgICByZXR1cm4gW1xuICAgICAgICBcIjxcIiwgICAgIC8vIGlsbGVnYWwgaW46IE5URlMsIEZBVFxuICAgICAgICBcIj5cIiwgICAgIC8vIGlsbGVnYWwgaW46IE5URlMsIEZBVFxuICAgICAgICBcIjpcIiwgICAgIC8vIGlsbGVnYWwgaW46IE5URlMsIEZBVCwgT1MgWFxuICAgICAgICBcIlxcXCJcIiwgICAgLy8gaWxsZWdhbCBpbjogTlRGUywgRkFUXG4gICAgICAgIFwiL1wiLCAgICAgLy8gaWxsZWdhbCBpbjogTlRGUywgRkFUXG4gICAgICAgIFwiXFxcXFwiLCAgICAvLyBpbGxlZ2FsIGluOiBOVEZTLCBGQVRcbiAgICAgICAgXCJ8XCIsICAgICAvLyBpbGxlZ2FsIGluOiBOVEZTLCBGQVRcbiAgICAgICAgXCI/XCIsICAgICAvLyBpbGxlZ2FsIGluOiBOVEZTLCBGQVRcbiAgICAgICAgXCIqXCIsICAgICAvLyBpbGxlZ2FsIGluOiBOVEZTLCBGQVRcbiAgICAgICAgXCJeXCIgICAgICAvLyBpbGxlZ2FsIGluOiBGQVRcbiAgICBdO1xufVxuXG5cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgdGhlIHNwZWNpZmllZCBuYW1lIGlzIGFsbG93ZWQgKGFjY29yZGluZyB0byB1bmRlcmx5aW5nXG4gKiBmaWxlc3lzdGVtKVxuICogQHBhcmFtIG5hbWUgLSBUaGUgbmFtZSB0byBiZSB2YWxpZGF0ZWRcbiAqIEByZXR1cm4gdHJ1ZSBpZiBgbmFtZWAgaXMgdmFsaWQuICBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmZ1bmN0aW9uIGlzVmFsaWRGaWxlc3lzdGVtTmFtZShuYW1lOiBzdHJpbmcpOiBib29sZWFuIHtcblxuICAgIC8vIEZVVFVSRTogQ291bGQgdXNlIHRoZSBpbmZvIGluIHRoZSBmb2xsb3dpbmcgYXJ0aWNsZSB0byBkbyBhIGJldHRlciBqb2JcbiAgICAvLyAgICAgICAgIHZhbGlkYXRpbmcgbmFtZXMuXG4gICAgLy8gICAgICAgICBodHRwczovL2tiLmFjcm9uaXMuY29tL2NvbnRlbnQvMzk3OTBcbiAgICBjb25zdCBpbGxlZ2FsQ2hhcnMgPSBnZXRJbGxlZ2FsQ2hhcnMoKTtcblxuICAgIGZvciAoY29uc3QgY3VySWxsZWdhbENoYXIgb2YgaWxsZWdhbENoYXJzKSB7XG4gICAgICAgIGlmIChuYW1lLmluZGV4T2YoY3VySWxsZWdhbENoYXIpID49IDApIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJldHVybiB0cnVlO1xufVxuXG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtY2xhc3Nlcy1wZXItZmlsZVxuY2xhc3MgQ2FjaGVFbnRyeTxUPiB7XG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgQ2FjaGVFbnRyeSBpbnN0YW5jZSBmcm9tIGl0cyBzZXJpYWxpemVkIGZvcm0uICBUZW1wbGF0ZWQgb25cbiAgICAgKiB0eXBlIFwiVVwiLCB3aGljaCByZXByZXNlbnRzIHRoZSB0eXBlIG9mIHVzZXIgZGF0YSBzdG9yZWQgaW4gdGhlIHBheWxvYWQuXG4gICAgICogTm90ZSwgc3RhdGljIG1ldGhvZHMgY2Fubm90IHVzZSB0aGUgY2xhc3MgdGVtcGxhdGUgdHlwZSBcIlRcIi5cbiAgICAgKiBAcGFyYW0gc2VyaWFsaXplZCAtIFRoZSBzZXJpYWxpemVkIENhY2hlRW50cnlcbiAgICAgKiBAcmV0dXJuIEEgQ2FjaGVFbnRyeSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgZGVzZXJpYWxpemU8VT4oc2VyaWFsaXplZDoge3BheWxvYWQ6IFV9KTogQ2FjaGVFbnRyeTxVPiB7XG4gICAgICAgIHJldHVybiBuZXcgQ2FjaGVFbnRyeTxVPihzZXJpYWxpemVkLnBheWxvYWQpO1xuICAgIH1cblxuXG4gICAgLy8gcmVnaW9uIEluc3RhbmNlIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9wYXlsb2FkOiBUO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgbmV3IENhY2hlRW50cnkgaW5zdGFuY2VcbiAgICAgKiBAcGFyYW0gcGF5bG9hZCAtIFRoZSB1c2VyJ3MgZGF0YSB0byBiZSBzdG9yZWQgaW4gdGhpcyBlbnRyeVxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihwYXlsb2FkOiBUKSB7XG4gICAgICAgIHRoaXMuX3BheWxvYWQgPSBwYXlsb2FkO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogU2VyaWFsaXplcyB0aGlzIGVudHJ5IHRvIGFuIG9iamVjdCB0aGF0IGNhbiBiZSBwZXJzaXN0ZWQuXG4gICAgICogQHJldHVybiBBIHZlcnNpb24gb2YgdGhpcyBvYmplY3QgdGhhdCBjYW4gYmUgcGVyc2lzdGVkIGFuZCBsYXRlclxuICAgICAqIGRlc2VyaWFsaXplZFxuICAgICAqL1xuICAgIHB1YmxpYyBzZXJpYWxpemUoKToge3BheWxvYWQ6IFR9IHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBheWxvYWQ6IHRoaXMuX3BheWxvYWRcbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJldHJpZXZlcyB0aGUgdXNlciBkYXRhIHN0b3JlZCBpbiB0aGlzIGVudHJ5LlxuICAgICAqIEByZXR1cm4gVGhlIHVzZXIgZGF0YVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcGF5bG9hZCgpOiBUIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BheWxvYWQ7XG4gICAgfVxufVxuIl19
