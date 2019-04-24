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

export type idString = string;


////////////////////////////////////////////////////////////////////////////////
// Business Object Interfaces
////////////////////////////////////////////////////////////////////////////////


export interface ISerialized
{
    type:   string;
    id:     idString;
    schema: string;
}


export interface IDeserializeResult
{
    // The result of the first phase of deserialization.
    deserializedObj: ISerializable;
    // Other objects that need to be deserialized so that this object can
    // reestablish its references.
    neededIds?: Array<idString>;
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

// TODO: Define the following more specifically.  Possibly add generic type to this class to define specific stow type
type IStow = object;

export interface IStoreGetResult
{
    serialized: ISerialized;
    stow: IStow;
}


export interface IStorePutResult
{
    stow: IStow;
}


// TODO: Rename this to something like "ILoadResult"
export interface IRegistryDeserializeResult<T extends ISerializable>
{
    // The requested deserialized object.
    deserialized: T;

    // TODO: Rename this to something like "allObjects"
    // All of the objects that were deserialized.
    allDeserialized: ISerializableMap;
}

// tslint:disable-next-line: max-classes-per-file
export abstract class AStore
{
    // region Data Members
    protected readonly _registry: SerializationRegistry;
    // endregion


    protected constructor(registry: SerializationRegistry)
    {
        this._registry = registry;
    }

    public abstract getIds(regexp?: RegExp): Promise<Array<idString>>;


    public async load<T extends ISerializable>(id: idString): Promise<IRegistryDeserializeResult<T>>
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
            deserialized: deserialized as T,
            allDeserialized: deserializedSoFar
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

                // FUTURE: As a sanity check, we should make sure the
                //   curObj.constructor.type has been registered with
                //   this._registry.  Even though we don't need the registry to
                //   save the object, we will need it when loading it.  This
                //   could catch errors where a new type of object is created
                //   and is used in the object graph, but the developer forgets
                //   to register it, resulting in a saved file that cannot be
                //   loaded.

                // Check to see if the object has already been serialized.  If
                // so, do nothing.
                if (alreadySerialized[curObj.id] !== undefined) {
                    return;
                }

                const serializeResult = curObj.serialize();

                const putPromise = this.put(serializeResult.serialized);

                // If other objects need to be serialized, queue them up.
                while (serializeResult.othersToSerialize && serializeResult.othersToSerialize.length > 0) {
                    needToSerialize.push(serializeResult.othersToSerialize.shift()!);
                }

                const putResult = await putPromise;

                // MUST: Put the contents of putResult.stow back onto the object.

            }
        );


    }

    protected abstract get(id: idString): Promise<IStoreGetResult>;

    protected abstract put(serialized: ISerialized): Promise<IStorePutResult>;


    /**
     * A helper method that recursively performs a first pass deserialization of
     * the specified object.  In the first pass, each object is responsible for
     * instantiating itself and setting its state.  If any references to other
     * objects exist, one or more completion functions should be returned that
     * set those references.
     * @param id - The id of the object to deserialize
     * @param deserializedSoFar - A map of all objects deserialized thus far
     * @param completionFuncs - Additional work that needs to be done to set
     *   inter-object cross references.
     * @return The results of the first pass deserialization
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

        // TODO: Apply the stowed data that is returned from the following get().
        const getResult: IStoreGetResult = await this.get(id);
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
        // If needed, update the list of completion functions that need to be run.
        while (deserializeResult.completionFuncs && deserializeResult.completionFuncs.length > 0) {
            const completionFunc = deserializeResult.completionFuncs.shift()!;
            completionFuncs.push(completionFunc);
        }

        // If the deserialized objects has returned references to other objects
        // that need to be deserialized, recurse and do a first pass
        // deserialization on those objects as well.
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
// Store Implementations
////////////////////////////////////////////////////////////////////////////////


// tslint:disable-next-line: max-classes-per-file
export class PersistentCacheStore extends AStore
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


    public async getIds(regexp?: RegExp): Promise<Array<idString>>
    {
        let ids: Array<idString> = await this._pcache.keys();
        if (regexp === undefined) {
            return ids;
        }

        // A regular express has been specified, so filter for the ids that
        // match.
        ids = _.filter(ids, (curId) => regexp.test(curId));
        return ids;
    }


    protected async get(id: idString): Promise<IStoreGetResult>
    {
        // Read the specified data from the backing store.
        const serialized = await this._pcache.get(id);

        // Transform the backing store's representation into an ISerialized.
        // For example, for PouchDB we should move `_id` to `id`.
        // This is not needed for PersistentCache, because it stores the data as
        // an ISerialized.

        // There is no stowed data for PersistentCache.
        const stow = {};

        return {serialized, stow};
    }


    protected async put(serialized: ISerialized): Promise<IStorePutResult>
    {
        // Transform `serialized` into the backing store's representation.
        // For example, for PouchDB we should:
        //   - move `id` to `_id`
        //   - move needed stowed properties into the backing store's
        //     representation
        // This is not needed for PersistentCache, because it stores the data as
        // an ISerialized.

        // Write the data to the backing store.
        await this._pcache.put(serialized.id, serialized);

        // Return data that needs to be stowed on the object for future use.
        // For example, for PouchDB, we need the updated _rev to be stowed.
        // This is not needed for PersistentCache.
        return {stow: {}};
    }
}
