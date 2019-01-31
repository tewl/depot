import * as _ from "lodash";
import * as BBPromise from "bluebird";
import {Directory} from "./directory";
import {File} from "./file";


export interface IPersistentCacheOptions {
    dir?: string;    // default is process.cwd()
}


export class PersistentCache<T> {


    /**
     * Creates a new PersistentCache instance.
     * @param name - The name of the cache
     * @param options - configuration options.  See IPersistentCacheOptions.
     * @return A promise that resolves with the new cache instance or rejects
     * if there were any errors.
     */
    public static create<T>(name: string, options?: IPersistentCacheOptions): Promise<PersistentCache<T>> {

        if (!isValidFilesystemName(name)) {
            return BBPromise.reject(new Error("Illegal cache name"));
        }

        options = _.defaults({}, options, {dir: process.cwd()});

        const rootDir = new Directory(options.dir!);

        if (!rootDir.existsSync()) {
            return BBPromise.reject(new Error(`Directory "${options.dir!}" does not exist.`));
        }

        // Create the directory for the cache being created.
        const cacheDir = new Directory(rootDir, name);
        return  cacheDir.ensureExists()
        .then(() => {
            return new PersistentCache<T>(name, cacheDir);
        });
    }


    // region Instance Data Members
    private readonly _name: string;
    private readonly _cacheDir: Directory;
    private readonly _memCache: {[key: string]: CacheEntry<T>} = {};
    // endregion


    /**
     * Creates a new PersistentCache instance.  Private because instances should
     * be created with the static `create()` method.
     * @param name - The name of this cache
     * @param cacheDir - The name of this cache's directory.  This directory is
     * created in create() because it is async.
     */
    private constructor(name: string, cacheDir: Directory) {
        this._name     = name;
        this._cacheDir = cacheDir;
    }


    /**
     * Adds/overwrites a key in this cache.
     * @param key - The key
     * @param val - The value
     * @return A promise that resolves when the value has been stored.  Rejects
     * if the specified key name is invalid.
     */
    public put(key: string, val: T): Promise<void> {
        if (!isValidFilesystemName(key)) {
            return BBPromise.reject(new Error(`Invalid character in key ${key}`));
        }

        // Add the entry to the memory cache.
        const entry = new CacheEntry(val);
        this._memCache[key] = entry;

        // Add the entry to the persistent store.
        const keyFile = this.keyToKeyFile(key);
        return keyFile.writeJson(entry.serialize());
    }


    /**
     * Reads a value from this cache.
     * @param key - The key to read
     * @return A promise that resolves with the value.  The promise rejects if
     * `key` is not in this cache.
     */
    public get(key: string): Promise<T> {
        // If the requested key is in the memory cache, use it.
        if (this._memCache.hasOwnProperty(key)) {
            return BBPromise.resolve(this._memCache[key].payload);
        }

        // See if the requested key is persisted.
        const keyFile = this.keyToKeyFile(key);
        return keyFile.exists()
        .then((exists) => {

            // If the requested key is not persisted, we do not have it.
            if (!exists) {
                throw new Error("No value");
            }

            // The requested key was persisted.  Load it, put it in the memory
            // cache and return the value to the caller.
            return keyFile.readJson<{payload: T}>()
            .then((data) => {
                const entry = CacheEntry.deserialize<T>(data);
                this._memCache[key] = entry;
                return entry.payload;
            });
        });
    }


    /**
     * Deletes the specified key from this cache
     * @param key - The key to delete
     * @return A promise that resolves when the operation is complete
     */
    public delete(key: string): Promise<void> {
        // Remove it from the memory cache.
        delete this._memCache[key];
        // Remove it from the persistent store.
        const keyFile = this.keyToKeyFile(key);
        return keyFile.delete();
    }


    /**
     * Enumerates the keys in this cache
     * @return A promise that resolves with the keys present in this cache
     */
    public keys(): Promise<Array<string>> {
        return this._cacheDir.contents()
        .then((directoryContents) => {
            return _.map(directoryContents.files, (curFile) => this.keyFileToKey(curFile));
        });

    }


    // region Private Helper Methods


    /**
     * Helper function that converts from a key name to its associated file in
     * the filesystem.
     * @param key - The key name to convert
     * @return The corresponding File
     */
    private keyToKeyFile(key: string): File {
        return new File(this._cacheDir, key + ".json");
    }


    /**
     * Helper function that converts from a File to the cache key it represents
     * @param keyFile - The file to convert
     * @return The corresponding key string
     */
    private keyFileToKey(keyFile: File): string {
        return keyFile.baseName;
    }


    // endregion


}


/**
 * Helper function that returns invalid filesystem characters that cannot appear
 * in cache or key names due to the fact they are persisted in filesystem
 * directory names and file names.
 * @return An array of illegal characters.
 */
export function getIllegalChars(): Array<string> {
    return [
        "<",     // illegal in: NTFS, FAT
        ">",     // illegal in: NTFS, FAT
        ":",     // illegal in: NTFS, FAT, OS X
        "\"",    // illegal in: NTFS, FAT
        "/",     // illegal in: NTFS, FAT
        "\\",    // illegal in: NTFS, FAT
        "|",     // illegal in: NTFS, FAT
        "?",     // illegal in: NTFS, FAT
        "*",     // illegal in: NTFS, FAT
        "^"      // illegal in: FAT
    ];
}



/**
 * Determines whether the specified name is allowed (according to underlying
 * filesystem)
 * @param name - The name to be validated
 * @return true if `name` is valid.  false otherwise.
 */
function isValidFilesystemName(name: string): boolean {

    // FUTURE: Could use the info in the following article to do a better job
    //         validating names.
    //         https://kb.acronis.com/content/39790
    const illegalChars = getIllegalChars();

    for (const curIllegalChar of illegalChars) {
        if (name.indexOf(curIllegalChar) >= 0) {
            return false;
        }
    }

    return true;
}


// tslint:disable-next-line:max-classes-per-file
class CacheEntry<T> {

    /**
     * Creates a CacheEntry instance from its serialized form.  Templated on
     * type "U", which represents the type of user data stored in the payload.
     * Note, static methods cannot use the class template type "T".
     * @param serialized - The serialized CacheEntry
     * @return A CacheEntry instance
     */
    public static deserialize<U>(serialized: {payload: U}): CacheEntry<U> {
        return new CacheEntry<U>(serialized.payload);
    }


    // region Instance Members
    private readonly _payload: T;
    // endregion


    /**
     * Creates a new CacheEntry instance
     * @param payload - The user's data to be stored in this entry
     */
    public constructor(payload: T) {
        this._payload = payload;
    }


    /**
     * Serializes this entry to an object that can be persisted.
     * @return A version of this object that can be persisted and later
     * deserialized
     */
    public serialize(): {payload: T} {
        return {
            payload: this._payload
        };
    }


    /**
     * Retrieves the user data stored in this entry.
     * @return The user data
     */
    public get payload(): T {
        return this._payload;
    }
}
