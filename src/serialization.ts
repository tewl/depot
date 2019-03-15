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
    deserialize(serialized: ISerialized, deserializedSoFar: ISerializableMap): IDeserializeResult;
}


export class SerializationRegistry
{

    private readonly _registered: Array<ISerializableStatic> = [];


    public get numRegisteredClasses(): number
    {
        return this._registered.length;
    }


    public register(serializableClass: ISerializableStatic): () => void
    {
        if (_.includes(this._registered, serializableClass)) {
            throw new Error("Serializable class already registered");
        }

        this._registered.push(serializableClass);

        return () => {
            // Remove all registrations of the class that was registered.
            _.pull(this._registered, serializableClass);
        };
    }


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
