import * as _ from "lodash";
import * as BBPromise from "bluebird";
import {Directory} from "./directory";
import {File} from "./file";


export interface IPersistentCacheOptions {
    dir?: string;
}


export class PersistentCache<T> {


    public static create<T>(name: string, options?: IPersistentCacheOptions): Promise<PersistentCache<T>> {

        if (!isValidFilesystemName(name)) {
            return BBPromise.reject(new Error("Illegal cache name"));
        }

        options = _.defaults({}, options, {dir: process.cwd()});

        if (!new Directory(options.dir!).existsSync()) {
            return BBPromise.reject(new Error(`Directory "${options.dir!}" does not exist.`));
        }

        // Create the directory for the cache being created.
        const cacheDir = new Directory(options.dir!, name);
        return  cacheDir.ensureExists()
        .then(() => {
            return new PersistentCache<T>(name, cacheDir);
        });
    }


    // region Instance Data Members
    private _name: string;
    private _cacheDir: Directory;
    private _memCache: {[key: string]: CacheEntry<T>} = {};
    // endregion


    private constructor(name: string, cacheDir: Directory) {
        this._name = name;
        this._cacheDir  = cacheDir;
    }


    public put(key: string, val: T): Promise<void> {
        if (!isValidFilesystemName(key)) {
            return BBPromise.reject(new Error(`Invalid character in key ${key}`));
        }

        const entry = new CacheEntry(val);
        this._memCache[key] = entry;

        const keyFile = this.keyToKeyFile(key);
        return keyFile.writeJson(entry.serialize());
    }


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
                const entry = CacheEntry.deserialize(data);
                this._memCache[key] = entry;
                return entry.payload;
            });
        });
    }


    public delete(key: string): Promise<void> {
        delete this._memCache[key];
        const keyFile = this.keyToKeyFile(key);
        return keyFile.delete();
    }


    public keys(): Promise<Array<string>> {
        return this._cacheDir.contents()
        .then((directoryContents) => {
            return _.map(directoryContents.files, (curFile) => this.keyFileToKey(curFile));
        });

    }


    private keyToKeyFile(key: string): File {
        return new File(this._cacheDir, key + ".json");
    }


    private keyFileToKey(keyFile: File): string {
        return keyFile.baseName;
    }


}


function isValidFilesystemName(name: string): boolean {
    const illegalChars = ["<", ">", ":", "\"", "/", "\\", "|", "?", "*"];

    for (const curIllegalChar of illegalChars) {
        if (name.indexOf(curIllegalChar) >= 0) {
            return false;
        }
    }

    return true;
}


// tslint:disable-next-line:max-classes-per-file
class CacheEntry<T> {

    public static deserialize(data: {payload: any}): CacheEntry<any> {
        return new CacheEntry(data.payload);
    }

    private readonly _payload: T;

    public constructor(payload: T) {
        this._payload = payload;
    }


    public serialize(): {payload: T} {
        return {
            payload: this._payload
        };
    }

    public get payload(): T {
        return this._payload;
    }
}
