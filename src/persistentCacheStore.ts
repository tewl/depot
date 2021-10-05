import * as _ from "lodash";
import {SerializationRegistry} from "./serializationRegistry";
import {PersistentCache} from "./persistentCache";
import {AStore, ISerialized, IdString, IStoreGetResult, IStorePutResult} from "./serialization";


// eslint-disable-next-line @typescript-eslint/no-empty-interface
interface IPersistentCacheStow
{
    // Intentionally left empty.
    // PersistentCache does not require any stowed data.
}


export class PersistentCacheStore extends AStore<IPersistentCacheStow>
{

    public static create(
        registry: SerializationRegistry,
        persistentCache: PersistentCache<ISerialized>
    ): Promise<PersistentCacheStore>
    {
        const instance = new PersistentCacheStore(registry, persistentCache);
        return Promise.resolve(instance);
    }


    // region Data Members
    private readonly _pcache: PersistentCache<ISerialized>;
    // endregion


    private constructor(registry: SerializationRegistry, pcache: PersistentCache<ISerialized>)
    {
        super(registry);
        this._pcache = pcache;
    }


    public async getIds(regexp?: RegExp): Promise<Array<IdString>>
    {
        let ids: Array<IdString> = await this._pcache.keys();
        if (regexp === undefined) {
            return ids;
        }

        // A regular express has been specified, so filter for the ids that
        // match.
        ids = _.filter(ids, (curId) => regexp.test(curId));
        return ids;
    }


    protected async get(id: IdString): Promise<IStoreGetResult<IPersistentCacheStow>>
    {
        // Read the specified data from the backing store.
        const serialized = await this._pcache.get(id);

        // Transform the backing store's representation into an ISerialized.
        // This is not needed for PersistentCache, because it stores the data as
        // an ISerialized.

        // There is no stowed data for PersistentCache.
        return {serialized, stow: {}};
    }


    protected async put(
        serialized: ISerialized,
        stow: undefined | IPersistentCacheStow
    ): Promise<IStorePutResult<IPersistentCacheStow>>
    {
        // Transform `serialized` into the backing store's representation.
        // This is not needed for PersistentCache, because it stores the data as
        // an ISerialized.

        // Write the data to the backing store.
        await this._pcache.put(serialized.id, serialized);

        // Return the new stow data that should be placed on the original
        // object. This is not needed for PersistentCache.
        return {stow: {}};
    }
}
