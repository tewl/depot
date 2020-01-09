import { ISerializableStatic } from "./serialization";
export declare class SerializationRegistry {
    private readonly _registeredClasses;
    constructor();
    readonly numRegisteredClasses: number;
    /**
     * Registers a class as one whose instances can be serialized and
     * deserialized
     * @param serializableClass - The class to register
     * @return A function that can be called to unregister
     */
    register(serializableClass: ISerializableStatic): () => void;
    /**
     * Gets the class that has been registered for the specified type
     * @param type - The type string
     * @return The class associated with the specified type string
     */
    getClass(type: string): undefined | ISerializableStatic;
}
