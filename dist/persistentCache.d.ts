export interface IPersistentCacheOptions {
    dir?: string;
}
/**
 * @classdesc A key-value data structure that persists all data to the
 * filesystem. Inspired by:
 * https://github.com/LionC/persistent-cache/blob/master/index.js
 */
export declare class PersistentCache<T> {
    /**
     * Creates a new PersistentCache instance.
     * @param name - The name of the cache
     * @param options - configuration options.  See IPersistentCacheOptions.
     * @return A promise that resolves with the new cache instance or rejects
     * if there were any errors.
     */
    static create<T>(name: string, options?: IPersistentCacheOptions): Promise<PersistentCache<T>>;
    static createSync<T>(name: string, options?: IPersistentCacheOptions): PersistentCache<T>;
    private readonly _name;
    private readonly _cacheDir;
    private readonly _memCache;
    /**
     * Creates a new PersistentCache instance.  Private because instances should
     * be created with the static `create()` method.
     * @param name - The name of this cache
     * @param cacheDir - The name of this cache's directory.  This directory is
     * created in create() because it is async.
     */
    private constructor();
    /**
     * Adds/overwrites a key in this cache.
     * @param key - The key
     * @param val - The value
     * @return A promise that resolves when the value has been stored.  Rejects
     * if the specified key name is invalid.
     */
    put(key: string, val: T): Promise<void>;
    /**
     * Reads a value from this cache.
     * @param key - The key to read
     * @return A promise that resolves with the value.  The promise rejects if
     * `key` is not in this cache.
     */
    get(key: string): Promise<T>;
    /**
     * Deletes the specified key from this cache
     * @param key - The key to delete
     * @return A promise that resolves when the operation is complete
     */
    delete(key: string): Promise<void>;
    /**
     * Enumerates the keys in this cache
     * @return A promise that resolves with the keys present in this cache
     */
    keys(): Promise<Array<string>>;
    /**
     * Helper function that converts from a key name to its associated file in
     * the filesystem.
     * @param key - The key name to convert
     * @return The corresponding File
     */
    private keyToKeyFile;
    /**
     * Helper function that converts from a File to the cache key it represents
     * @param keyFile - The file to convert
     * @return The corresponding key string
     */
    private keyFileToKey;
}
/**
 * Helper function that returns invalid filesystem characters that cannot appear
 * in cache or key names due to the fact they are persisted in filesystem
 * directory names and file names.
 * @return An array of illegal characters.
 */
export declare function getIllegalChars(): Array<string>;
