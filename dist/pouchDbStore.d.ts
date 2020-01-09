/// <reference types="pouchdb-find" />
/// <reference types="pouchdb-core" />
/// <reference types="pouchdb-mapreduce" />
/// <reference types="pouchdb-replication" />
import { SerializationRegistry } from "./serializationRegistry";
import { AStore, IdString, ISerialized, IStoreGetResult, IStorePutResult } from "./serialization";
interface IPouchDbStow {
    _rev: string;
}
export declare class PouchDbStore extends AStore<IPouchDbStow> {
    static create(registry: SerializationRegistry, pouchDb: PouchDB.Database): Promise<PouchDbStore>;
    private readonly _db;
    private constructor();
    getIds(regexp?: RegExp): Promise<Array<IdString>>;
    protected get(id: IdString): Promise<IStoreGetResult<IPouchDbStow>>;
    protected put(serialized: ISerialized, stow: undefined | IPouchDbStow): Promise<IStorePutResult<IPouchDbStow>>;
}
export {};
