import * as _ from "lodash";
import * as BBPromise from "bluebird";
import {promiseWhile, sequence} from "./promiseHelpers";


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


export type WorkFunc = () => Promise<void> | void;

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
    deserializedObj: ISerializable;
    neededIds?: Array<idString>;
    completionFuncs?: Array<WorkFunc>;
}


export interface ISerializableStatic
{
    type: string;

    /**
     * Deserializes the specified object
     * @param serialized - The object to be deserialized
     * @param deserializedSoFar - Other objects that have been deserialized
     * @return An object containing the deserialized object and any
     * functions representing additional work that needs to be done to finish
     * deserializing the object.
     */
    deserialize(serialized: ISerialized, deserializedSoFar: ISerializableMap): IDeserializeResult;
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
// Registry Interfaces
////////////////////////////////////////////////////////////////////////////////

export interface IRegistryDeserializeResult<T extends ISerializable>
{
    // The requested deserialized object.
    deserialized: T;
    // All of the objects that were deserialized.
    allDeserialized: ISerializableMap;
}

export interface ISerializationRegistry
{

    /**
     * Gets the number of registered classes.
     */
    numRegisteredClasses: number;

    /**
     * Registers a serializable class with this registry.
     * @param serializableClass - The class to be registered
     * @return A function that can be called to unregister the class.  This
     *   method will throw an Error if the specified class has already been
     *   registered.
     */
    register(serializableClass: ISerializableStatic): () => void;

    // TODO: Clean up the following.

    // When asking a serialization registry to deserialize an object:
    // - we will have just an id, not a serialized form of the object (for
    //   example, an id of "myAppModelRoot").
    // - we should get back the requested object as well as a map of all
    //   deserialized objects.
    // deserialize(id: string): Promise<IRegistryDeserializeResult>;

    // serialize(obj: ISerializable): Promise<void>;
}


////////////////////////////////////////////////////////////////////////////////
// Registry Implementations
////////////////////////////////////////////////////////////////////////////////

import {PersistentCache} from "./persistentCache";
import {generateUuid} from "./uuid";


// tslint:disable-next-line: max-classes-per-file
export class PersistentCacheSerializationRegistry implements ISerializationRegistry
{

    // region Instance Data Members
    private readonly _registeredClasses: Array<ISerializableStatic> = [];
    // endregion


    public constructor()
    {
    }


    // region ISerializationRegistry

    public get numRegisteredClasses(): number
    {
        return this._registeredClasses.length;
    }

    public register(serializableClass: ISerializableStatic): () => void
    {
        if (_.includes(this._registeredClasses, serializableClass)) {
            throw new Error("Serializable class already registered");
        }

        this._registeredClasses.push(serializableClass);

        // Return a function that can be used to unregister.
        return () => {
            // Remove all registrations of the registered class.
            _.pull(this._registeredClasses, serializableClass);
        };
    }


    // TODO: Get rid of the persistentCache parameter below once it is passed
    //   into the c'tor.
    public async getIds(persistentCache: PersistentCache<ISerialized>, regexp: RegExp): Promise<Array<idString>>
    {
        const ids = await persistentCache.keys();
        return _.filter(ids, (curId) => regexp.test(curId));
    }


    public async deserialize<T extends ISerializable>(
        persistentCache: PersistentCache<ISerialized>,
        id: string
    ): Promise<IRegistryDeserializeResult<T>>
    {
        // An object that keeps track of all objects deserialized so far.
        // The key is the id and the value is the deserialized result.
        const deserializedSoFar: ISerializableMap = {};
        // An array of completion functions that need to be run when the first
        // pass has completed.
        const completionFuncs: Array<WorkFunc> = [];

        // First pass:  Recursively deserialize all objects.
        const deserialized = await this.doFirstPassDeserialize(id, deserializedSoFar, completionFuncs, persistentCache);

        // Second pass:  Run all completion functions so that each object can
        // set its references to other objects.
        const promises = _.map(completionFuncs, (curCompletionFunc) => {
            // Wrap the return value from each completion function in a promise
            // in the event the function returns void instead of Promise<void>.
            return BBPromise.resolve(curCompletionFunc());
        });
        await BBPromise.all(promises);

        return {
            deserialized: deserialized as T,
            allDeserialized: deserializedSoFar
        };
    }

    public async serialize(persistentCache: PersistentCache<ISerialized>, obj: ISerializable): Promise<void>
    {
        const alreadySerialized: ISerializableMap = {};
        const needToSerialize: Array<ISerializable> = [obj];

        await promiseWhile(
            () => needToSerialize.length > 0,
            async () => {
                const curObj = needToSerialize.shift()!;

                // Check to see if the object has already been serialized.  If
                // so, do nothing.
                if (alreadySerialized[curObj.id] !== undefined) {
                    return;
                }

                // TODO: Replace the following curObj.serialize() call with one
                //   to a helper method that will perform pre- and post
                //   processing.  For example:
                //     - after calling curObj.serialized():
                //       - transform serialized form into store-specific form
                //         - id --> _id
                //         - curObj stowed props --> store-specific properties
                //       - write the document
                //       - stow new _rev back onto curObj
                const serializeResult = curObj.serialize();
                const putPromise = persistentCache.put(curObj.id, serializeResult.serialized);

                // If other objects need to be serialized, queue them up.
                while (serializeResult.othersToSerialize && serializeResult.othersToSerialize.length > 0) {
                    needToSerialize.push(serializeResult.othersToSerialize.shift()!);
                }

                await putPromise;

            }
        );


    }
    // endregion


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
     * @param persistentCache - The store data is being read from
     * @return description
     */
    private async doFirstPassDeserialize(
        id: string,
        deserializedSoFar: ISerializableMap,
        completionFuncs: Array<WorkFunc>,
        persistentCache: PersistentCache<ISerialized>
    ): Promise<ISerializable>
    {
        // If the id being requested already appears in the dictionary of object
        // that have undergone a first pass deserialization, then return
        // immediately.
        if (deserializedSoFar[id] !== undefined) {
            return deserializedSoFar[id];
        }

        const serialized: ISerialized = await persistentCache.get(id);

        const foundClass = _.find(this._registeredClasses, (curRegisteredClass) => curRegisteredClass.type === serialized.type);
        if (!foundClass) {
            throw new Error(`No class registered for type "${serialized.type}".`);
        }

        // TODO: Replace the following foundClass.deserialize() call with one to
        //   another helper method that will perform necessary pre- and
        //   post-processing (e.g.:
        //     - before calling through to foundClass.deserialize:
        //       - transform stored document into pre-deserialize form
        //         - _id --> id
        //     - after calling through to foundClass.deserialize:
        //       - stow store-specific properties on object
        //         - _rev
        const deserializeResult = foundClass.deserialize(serialized, deserializedSoFar);

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
                    return this.doFirstPassDeserialize(curNeededId, deserializedSoFar, completionFuncs, persistentCache);
                };
            });

            await sequence(tasks, undefined);
        }

        return deserialized;
    }

}



