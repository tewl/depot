import { SerializationRegistry } from "./serializationRegistry";
export declare function createId(prefix: string): string;
export interface ISerializableMap {
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
export declare type DeserializePhase2Func = (objects: ISerializableMap) => Promise<void> | void;
export declare type IdString = string;
export interface ISerialized {
    type: string;
    id: IdString;
    schema: string;
}
export interface IDeserializeResult {
    deserializedObj: ISerializable;
    neededIds?: Array<IdString>;
    completionFuncs?: Array<DeserializePhase2Func>;
}
export interface ISerializableStatic {
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
export interface ISerializeResult {
    serialized: ISerialized;
    othersToSerialize: Array<ISerializable>;
}
export interface ISerializable {
    readonly id: string;
    serialize(): ISerializeResult;
}
export declare function isISerializable(obj: any): obj is ISerializable;
export interface ISerializableWithStow<StowType> extends ISerializable {
    __stow: StowType;
}
export declare function isISerializableWithStow<StowType>(obj: any): obj is ISerializableWithStow<StowType>;
export interface IStoreGetResult<StowType> {
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
export interface IStorePutResult<StowType> {
    /**
     * The new stow data that must be applied to the original object following
     * this put() operation.
     */
    stow: StowType;
}
export interface ILoadResult<T extends ISerializable> {
    obj: T;
    allObjects: ISerializableMap;
}
export declare abstract class AStore<StowType> {
    protected readonly _registry: SerializationRegistry;
    protected constructor(registry: SerializationRegistry);
    abstract getIds(regexp?: RegExp): Promise<Array<IdString>>;
    load<T extends ISerializable>(id: IdString): Promise<ILoadResult<T>>;
    save(obj: ISerializable): Promise<void>;
    /**
     * Template method that reads the specified object from the backing store
     * @param id - The ID of the object to read
     * @return When successfully read, the returned promise resolves with the
     *   serialized form of the object and the stowed data that should be
     *   applied to the object once the serialized form is deserialized.
     */
    protected abstract get(id: IdString): Promise<IStoreGetResult<StowType>>;
    /**
     * Template method that writes the specified object to the backing store
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
    private doFirstPassDeserialize;
}
interface IMemoryStow {
}
export declare class MemoryStore extends AStore<IMemoryStow> {
    static create(registry: SerializationRegistry): Promise<MemoryStore>;
    private readonly _store;
    private constructor();
    getIds(regexp?: RegExp): Promise<Array<IdString>>;
    protected get(id: IdString): Promise<IStoreGetResult<IMemoryStow>>;
    protected put(serialized: ISerialized, stow: undefined | IMemoryStow): Promise<IStorePutResult<IMemoryStow>>;
}
export {};
