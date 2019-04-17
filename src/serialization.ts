import * as _ from "lodash";

//
// An indeterminate task is some work that you can start (i.e. a function that
// can be called) that will resolve with the result or another indeterminate
// task (hence the "indeterminate" nature).
//
export type IndeterminateAsyncWork<T> = () => Promise<T | IndeterminateAsyncWork<T>>;
export type IndeterminateSyncWork<T>  = () => T | IndeterminateSyncWork<T>;


export interface ISerialized
{
    type:   string;
    id:     string;
    schema: string;
}


export interface IDeserializeResult
{
    deserializedObj: ISerializable;
    additionalWork?: Array<IndeterminateSyncWork<boolean>>;
}


export interface ISerializableMap
{
    [id: string]: ISerializable;
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


export class SerializationRegistry
{

    private readonly _registered: Array<ISerializableStatic> = [];


    public get numRegisteredClasses(): number
    {
        return this._registered.length;
    }


    /**
     * Registers a serializable class with this registry.
     * @param serializableClass - The class to be registered
     * @return A function that should be called to unregister the class
     */
    public register(serializableClass: ISerializableStatic): () => void
    {
        if (_.includes(this._registered, serializableClass)) {
            throw new Error("Serializable class already registered");
        }

        this._registered.push(serializableClass);

        // Return a function that will be used to unregister.
        return () => {
            // Remove all registrations of the class that was registered.
            _.pull(this._registered, serializableClass);
        };
    }


    /**
     * Fully deserializes the specified objects, performing any necessary
     * additional work needed.
     * @param serialized - Array of serialized objects to be deserialized
     * @return An array or the corresponding deserialized objects.  The length
     *   and order of this array will match that of `serialized`.
     *   This method will throw if any of the serialized objects is of an
     *   unregistered type.
     */
    public deserialize(serialized: Array<ISerialized>): Array<ISerializable>
    {
        const bizObjects: Array<ISerializable> = [];
        const deserializedSoFar: ISerializableMap = {};
        let additionalWork: Array<IndeterminateSyncWork<boolean>> = [];

        _.forEach(serialized, (curSerialized) => {

            const foundClass = _.find(this._registered, (curClass) => curClass.type === curSerialized.type);
            if (!foundClass) {
                throw new Error(`No class is registered for type "${curSerialized.type}".`);
            }

            const result = foundClass.deserialize(curSerialized, deserializedSoFar);
            bizObjects.push(result.deserializedObj);
            deserializedSoFar[result.deserializedObj.id] = result.deserializedObj;

            if (result.additionalWork) {
                additionalWork = _.concat(additionalWork, result.additionalWork);
            }
        });

        while (additionalWork.length > 0) {
            const curWork = additionalWork.shift()!;
            const result = curWork();
            if (_.isFunction(result)) {
                additionalWork.push(result);
            }
            else {
                if (!result) {
                    throw new Error("deserialize() additional work returned false.");
                }
            }
        }

        return bizObjects;
    }

}
