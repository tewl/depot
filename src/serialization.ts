import * as _ from "lodash";
import * as BBPromise from "bluebird";
import {promiseWhile, sequence} from "./promiseHelpers";
import {PersistentCache} from "./persistentCache";
import {generateUuid} from "./uuid";


////////////////////////////////////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////////////////////////////////////

export function createId(prefix: string): string
{
    const timeMs = Date.now();
    const uuid = generateUuid();
    return `${prefix}_${timeMs}_${uuid}`;
}


////////////////////////////////////////////////////////////////////////////////
// Data Structures
////////////////////////////////////////////////////////////////////////////////

export interface ISerializableMap
{
    [id: string]: ISerializable;
}


/**
 * A function type describing future work that needs to be done to complete an
 * object's deserialization.
 * @param objects - All objects that have been deserialized, including all
 *   returned from the initial `deserialize()` invocation.
 * @return void if the deserialization is complete or a promise that resolves
 *   when it is complete
 */
export type DeserializePhase2Func = (objects: ISerializableMap) => Promise<void> | void;

export type IdString = string;


////////////////////////////////////////////////////////////////////////////////
// Business Object Interfaces
////////////////////////////////////////////////////////////////////////////////


export interface ISerialized
{
    type:   string;
    id:     IdString;
    schema: string;
}


export interface IDeserializeResult
{
    // The result of the first phase of deserialization.
    deserializedObj: ISerializable;
    // Other objects that need to be deserialized so that this object can
    // reestablish its references.
    neededIds?: Array<IdString>;
    // Functions that need to be run to finish this object's deserialization
    // (once the objects corresponding to `neededIds` are available).
    completionFuncs?: Array<DeserializePhase2Func>;
}


export interface ISerializableStatic
{
    type: string;

    /**
     * Performs the first phase of deserialization and returns information and
     * functions needed to complete the deserialization
     * @param serialized - The object to be deserialized
     * @return An object containing the deserialized object, the IDs of other
     * objects that are needed in order to complete the deserialization, and any
     * functions representing additional work that needs to be done to finish
     * deserialization (e.g. establishing references to other objects).
     */
    deserialize(serialized: ISerialized): IDeserializeResult;
}


export interface ISerializeResult
{
    serialized: ISerialized;
    othersToSerialize: Array<ISerializable>;
}


export interface ISerializable
{
    readonly id: string;
    serialize(): ISerializeResult;
}


export function isISerializable(obj: any): obj is ISerializable
{
    return _.isString(obj.id) &&
           _.isFunction(obj.serialize) &&
           _.isFunction(obj.constructor.deserialize);
}


export interface ISerializableWithStow<StowType> extends ISerializable
{
    __stow: StowType;
}

export function isISerializableWithStow<StowType>(obj: any): obj is ISerializableWithStow<StowType>
{
    return isISerializable(obj) &&
           // FUTURE: The following is pretty bogus.  Just because __stow is not
           //   undefined does not mean that it is of type StowType.  Fix this
           //   in the future.
           (obj as any).__stow !== undefined;
}


////////////////////////////////////////////////////////////////////////////////
// SerializationRegistry
////////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line: max-classes-per-file
export class SerializationRegistry
{
    // region Instance Data Members

    // A map of registered classes.  The key is the type string and the value is
    // the class.
    private readonly _registeredClasses: {[type: string]: ISerializableStatic};

    // endregion


    public constructor()
    {
        this._registeredClasses = {};
    }


    public get numRegisteredClasses(): number
    {
        return _.keys(this._registeredClasses).length;
    }


    /**
     * Registers a class as one whose instances can be serialized and
     * deserialized
     * @param serializableClass - The class to register
     * @return A function that can be called to unregister
     */
    public register(serializableClass: ISerializableStatic): () => void
    {
        if (this._registeredClasses[serializableClass.type] !== undefined) {
            throw new Error(`Serializable class already registered for type "${serializableClass.type}".`);
        }

        this._registeredClasses[serializableClass.type] = serializableClass;

        // Return a function that can be used to unregister.
        return () => {
            // Remove the class from the container of registered classes.
            delete this._registeredClasses[serializableClass.type];
        };
    }


    /**
     * Gets the class that has been registered for the specified type
     * @param type - The type string
     * @return The class associated with the specified type string
     */
    public getClass(type: string): undefined | ISerializableStatic
    {
        return this._registeredClasses[type];
    }
}


////////////////////////////////////////////////////////////////////////////////
// Store Interfaces
////////////////////////////////////////////////////////////////////////////////


export interface IStoreGetResult<StowType>
{
    /**
     * The serialized form of the saved data.
     */
    serialized: ISerialized;

    /**
     * The stowed data that should be applied to the object once `serialized`
     * has been deserialized.
     */
    stow: StowType;
}


export interface IStorePutResult<StowType>
{
    /**
     * The new stow data that must be applied to the original object following
     * this put() operation.
     */
    stow: StowType;
}


export interface ILoadResult<T extends ISerializable>
{
    // The requested deserialized object.
    obj: T;

    // All of the objects that were deserialized.
    allObjects: ISerializableMap;
}


////////////////////////////////////////////////////////////////////////////////
//
// AStore
//
// Abstract base class for backing stores .  Knows how to follow graphs of
// objects when serializing and deserializing and how to manage stowed data.
// Defines abstract methods that derived classes must implement to read and
// write data in a manner that is specific to each backing store.
//
////////////////////////////////////////////////////////////////////////////////

// tslint:disable-next-line: max-classes-per-file
export abstract class AStore<StowType>
{
    // region Data Members
    protected readonly _registry: SerializationRegistry;
    // endregion


    protected constructor(registry: SerializationRegistry)
    {
        this._registry = registry;
    }

    public abstract getIds(regexp?: RegExp): Promise<Array<IdString>>;


    public async load<T extends ISerializable>(id: IdString): Promise<ILoadResult<T>>
    {
        // An object that keeps track of all objects deserialized so far.
        // The key is the id and the value is the deserialized result.
        const deserializedSoFar: ISerializableMap = {};
        // An array of completion functions that need to be run when the first
        // pass has completed.
        const completionFuncs: Array<DeserializePhase2Func> = [];

        // First pass:  Recursively deserialize all objects.
        const deserialized = await this.doFirstPassDeserialize(id, deserializedSoFar, completionFuncs);

        // Second pass:  Run all completion functions so that each object can
        // set its references to other objects.
        const promises = _.map(completionFuncs, (curCompletionFunc) => {
            // Wrap the return value from each completion function in a promise
            // in the event the function returns void instead of Promise<void>.
            return BBPromise.resolve(curCompletionFunc(deserializedSoFar));
        });
        await BBPromise.all(promises);

        return {
            obj: deserialized as T,
            allObjects: deserializedSoFar
        };
    }


    public async save(obj: ISerializable): Promise<void>
    {
        const alreadySerialized: ISerializableMap = {};
        const needToSerialize: Array<ISerializable> = [obj];

        await promiseWhile(
            () => needToSerialize.length > 0,
            async () => {
                const curObj = needToSerialize.shift()!;

                // Note: We could perform a sanity check here to make sure that
                // the object being serialized is registered with
                // `this._registry` so that it could eventually be deserialized
                // (registration is only needed for the deserialization
                // process).  I have decided, however, not to perform this
                // check, because it would be artificially limiting.  There
                // could, for example, be a tool that only saved models and
                // never tried to read them.

                // Check to see if the object has already been serialized.  If
                // so, do nothing.
                if (alreadySerialized[curObj.id] !== undefined) {
                    return;
                }

                const serializeResult = curObj.serialize();
                const stow: undefined | StowType = isISerializableWithStow<StowType>(curObj) ? curObj.__stow : undefined;

                const putPromise = this.put(serializeResult.serialized, stow);

                // If other objects need to be serialized, queue them up.
                while (serializeResult.othersToSerialize && serializeResult.othersToSerialize.length > 0) {
                    needToSerialize.push(serializeResult.othersToSerialize.shift()!);
                }

                // Wait for the put() to complete.
                const putResult = await putPromise;

                // Assign the stowed data back to the original object.
                const objWithStow = curObj as ISerializableWithStow<StowType>;
                objWithStow.__stow = putResult.stow;
            }
        );

    }


    /**
     * Reads the specified object from the backing store.
     * @param id - The ID of the object to read
     * @return When successfully read, the returned promise resolves with the
     *   serialized form of the object and the stowed data that should be
     *   applied to the object once the serialized form is deserialized.
     */
    protected abstract get(id: IdString): Promise<IStoreGetResult<StowType>>;


    /**
     * Writes the specified object to the backing store.
     * @param serialized - The serialized form of the object to be stored.
     * @param stow - The stowed properties from the original object
     * @return When successfully written, the returned promise resolves with the
     *   object's new stowed data.
     */
    protected abstract put(serialized: ISerialized, stow: undefined | StowType): Promise<IStorePutResult<StowType>>;


    /**
     * A helper method that recursively performs a first pass deserialization of
     * the specified object.  In the first pass, each object is responsible for
     * instantiating itself and setting its state.  If any references to other
     * objects exist, one or more completion functions should be returned that
     * will be run during the second pass.  The completion functions should set
     * references to other objects during this second phase, since that is when
     * all objects are guaranteed to exist.
     * @param id - The id of the object to perform first pass deserialization on
     * @param deserializedSoFar - A map of all objects deserialized thus far.
     *   Used to detect whether an object has already undergone first pass
     *   deserialization.
     * @param completionFuncs - Additional work that needs to be done (during
     *   the second pass) to set inter-object cross references.
     * @return The results of the first pass deserialization, which is an
     *   ISerializable that has its owned state set, but has not yet set
     *   references to other objects.
     */
    private async doFirstPassDeserialize(
        id: string,
        deserializedSoFar: ISerializableMap,
        completionFuncs: Array<DeserializePhase2Func>
    ): Promise<ISerializable>
    {
        // If the id being requested already appears in the dictionary of object
        // that have undergone a first pass deserialization, then return
        // immediately.
        if (deserializedSoFar[id] !== undefined) {
            return deserializedSoFar[id];
        }

        const getResult: IStoreGetResult<StowType> = await this.get(id);
        const serialized = getResult.serialized;

        const foundClass = this._registry.getClass(serialized.type);
        if (!foundClass) {
            throw new Error(`No class registered for type "${serialized.type}".`);
        }

        const deserializeResult = foundClass.deserialize(serialized);

        // The object that will eventually be returned.
        const deserialized: ISerializable = deserializeResult.deserializedObj;
        // Add the object to the map of objects that we have deserialized.
        deserializedSoFar[deserialized.id] = deserialized;

        // Now that we have the real object, apply the stow data.
        const objWithStow = deserialized as ISerializableWithStow<StowType>;
        objWithStow.__stow = getResult.stow;

        // If needed, update the list of completion functions that need to be run.
        while (deserializeResult.completionFuncs && deserializeResult.completionFuncs.length > 0) {
            const completionFunc = deserializeResult.completionFuncs.shift()!;
            completionFuncs.push(completionFunc);
        }

        // If the deserialized object has returned IDs of other objects that
        // need to be deserialized, recurse and do a first pass deserialization
        // on those objects as well.
        if (deserializeResult.neededIds) {

            // Create tasks that will do a first pass deserialization on the
            // needed objects.  We will then execute them serially so that we
            // won't deserialize the same object more than once.  That would
            // result in references to different objects where we need to have
            // references that point to the same object.
            const tasks = _.map(deserializeResult.neededIds, (curNeededId) => {
                return async () => {
                    return this.doFirstPassDeserialize(curNeededId, deserializedSoFar, completionFuncs);
                };
            });

            await sequence(tasks, undefined);
        }

        return deserialized;
    }

}


////////////////////////////////////////////////////////////////////////////////
// PersistentCacheStore
////////////////////////////////////////////////////////////////////////////////


// tslint:disable-next-line:no-empty-interface
interface IPersistentCacheStow
{
    // Intentionally left empty.
    // PersistentCache does not require any stowed data.
}


// tslint:disable-next-line: max-classes-per-file
export class PersistentCacheStore extends AStore<IPersistentCacheStow>
{

    public static create(registry: SerializationRegistry, persistentCache: PersistentCache<ISerialized>): Promise<PersistentCacheStore>
    {
        const instance = new PersistentCacheStore(registry, persistentCache);
        return BBPromise.resolve(instance);
    }


    // region Data Members
    private _pcache: PersistentCache<ISerialized>;
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


    protected async put(serialized: ISerialized, stow: undefined | IPersistentCacheStow): Promise<IStorePutResult<IPersistentCacheStow>>
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


////////////////////////////////////////////////////////////////////////////////
// MemoryStore
////////////////////////////////////////////////////////////////////////////////


// tslint:disable-next-line:no-empty-interface
interface IMemoryStow
{
    // Intentionally left empty.
    // MemoryStore does not require any stowed data.
}


// tslint:disable-next-line: max-classes-per-file
export class MemoryStore extends AStore<IMemoryStow>
{

    public static create(registry: SerializationRegistry): Promise<MemoryStore>
    {
        const instance = new MemoryStore(registry);
        return BBPromise.resolve(instance);
    }


    // region Data Members
    private readonly _store: {[id: string]: ISerialized};
    // endregion


    private constructor(registry: SerializationRegistry)
    {
        super(registry);
        this._store = {};
    }


    public async getIds(regexp?: RegExp): Promise<Array<IdString>>
    {
        let ids: Array<IdString> = _.keys(this._store);
        if (regexp === undefined) {
            return ids;
        }

        // A regular express has been specified, so filter for the ids that
        // match.
        ids = _.filter(ids, (curId) => regexp.test(curId));
        return ids;
    }


    protected async get(id: IdString): Promise<IStoreGetResult<IMemoryStow>>
    {
        // Read the specified data from the backing store.
        const serialized = this._store[id];

        // Transform the backing store's representation into an ISerialized.
        // This is not needed for MemoryStore, because it stores the data as
        // an ISerialized.

        // There is no stowed data for MemoryStore.
        return {serialized, stow: {}};
    }


    protected async put(serialized: ISerialized, stow: undefined | IMemoryStow): Promise<IStorePutResult<IMemoryStow>>
    {
        // Transform `serialized` into the backing store's representation.
        // This is not needed for MemoryStore, because it stores the data as
        // an ISerialized.

        // Write the data to the backing store.
        this._store[serialized.id] = serialized;

        // Return the new stow data that should be placed on the original
        // object. This is not needed for MemoryStore.
        return {stow: {}};
    }
}


////////////////////////////////////////////////////////////////////////////////
// PouchDbStore
////////////////////////////////////////////////////////////////////////////////
import * as PouchDB from "pouchdb";

// tslint:disable-next-line:no-empty-interface
interface IPouchDbStow
{
    _rev: string;
}


// tslint:disable-next-line: max-classes-per-file
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

        // A regular express has been specified, so filter for the ids that
        // match.
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
        //   - move needed stowed properties into the backing store's
        //     representation
        const doc = _.mapKeys(serialized, (value, key) => {
            if (key === "id") {
                return "_id";
            }
            else {
                return key;
            }
        });

        // Copy needed properties from the stowed datat onto the backing store
        // representation.
        if (stow) {
            _.assign(doc, stow);
        }


        // Write the document to the db.
        const putResult = await this._db.put(doc);

        // Return the new stow data so that it can be applied to the original
        // object.
        return {
            stow: {
                _rev: putResult.rev
            }
        };
    }
}
