import * as _ from "lodash";
import {ISerializableStatic} from "./serialization";


export class SerializationRegistry {
    // region Instance Data Members

    // A map of registered classes.  The key is the type string and the value is
    // the class.
    private readonly _registeredClasses: {[type: string]: ISerializableStatic};

    // endregion


    public constructor() {
        this._registeredClasses = {};
    }


    public get numRegisteredClasses(): number {
        return _.keys(this._registeredClasses).length;
    }


    /**
     * Registers a class as one whose instances can be serialized and
     * deserialized
     * @param serializableClass - The class to register
     * @return A function that can be called to unregister
     */
    public register(serializableClass: ISerializableStatic): () => void {
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
    public getClass(type: string): undefined | ISerializableStatic {
        return this._registeredClasses[type];
    }
}
