import * as _ from "lodash";
import * as BBPromise from "bluebird";
import * as PouchDB from "pouchdb";
import {SerializationRegistry} from "./serializationRegistry";
import {AStore, IdString, ISerialized, IStoreGetResult, IStorePutResult} from "./serialization";


interface IPouchDbStow
{
    _rev: string;
}


export class PouchDbStore extends AStore<IPouchDbStow>
{

    public static create(registry: SerializationRegistry, pouchDb: PouchDB.Database): Promise<PouchDbStore>
    {
        const instance = new PouchDbStore(registry, pouchDb);
        return BBPromise.resolve(instance);
    }


    // region Data Members
    private readonly _db: PouchDB.Database;
    // endregion


    private constructor(registry: SerializationRegistry, pouchDb: PouchDB.Database)
    {
        super(registry);
        this._db = pouchDb;
    }


    public async getIds(regexp?: RegExp): Promise<Array<IdString>>
    {
        const allDocsResponse = await this._db.allDocs();
        let ids: Array<string> = _.map(allDocsResponse.rows, (curRow) => curRow.id);

        if (regexp === undefined) {
            return ids;
        }

        // A regular express has been specified, so filter for the ids that match.
        ids = _.filter(ids, (curId) => regexp.test(curId));
        return ids;
    }


    protected async get(id: IdString): Promise<IStoreGetResult<IPouchDbStow>>
    {
        // Read the specified data from the backing store.
        const dbRepresentation = await this._db.get(id);

        // Transform the backing store's representation into an ISerialized.
        const serialized = _.mapKeys(dbRepresentation, (value, key) => {
            if (key === "_id") {
                return "id";
            }
            else {
                return key;
            }
        });

        return {
            serialized: serialized as ISerialized,
            stow:       {_rev: dbRepresentation._rev}
        };
    }


    protected async put(serialized: ISerialized, stow: undefined | IPouchDbStow): Promise<IStorePutResult<IPouchDbStow>>
    {
        // Transform `serialized` into the backing store's representation.
        // For PouchDB, this means:
        //   - move `id` to `_id`
        const doc = _.mapKeys(serialized, (value, key) => {
            if (key === "id") {
                return "_id";
            }
            else {
                return key;
            }
        });

        // Copy needed properties from the stowed data onto the backing store representation.
        if (stow) {
            _.assign(doc, stow);
        }

        // Write the document to the db.
        const putResult = await this._db.put(doc);

        // Return the new stow data so that it can be applied to the original object.
        return {
            stow: {
                _rev: putResult.rev
            }
        };
    }
}
