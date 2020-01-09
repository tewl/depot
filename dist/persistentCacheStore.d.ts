import { SerializationRegistry } from "./serializationRegistry";
import { PersistentCache } from "./persistentCache";
import { AStore, ISerialized, IdString, IStoreGetResult, IStorePutResult } from "./serialization";
interface IPersistentCacheStow {
}
export declare class PersistentCacheStore extends AStore<IPersistentCacheStow> {
    static create(registry: SerializationRegistry, persistentCache: PersistentCache<ISerialized>): Promise<PersistentCacheStore>;
    private _pcache;
    private constructor();
    getIds(regexp?: RegExp): Promise<Array<IdString>>;
    protected get(id: IdString): Promise<IStoreGetResult<IPersistentCacheStow>>;
    protected put(serialized: ISerialized, stow: undefined | IPersistentCacheStow): Promise<IStorePutResult<IPersistentCacheStow>>;
}
export {};
