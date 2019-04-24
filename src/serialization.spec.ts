import * as _ from "lodash";
import {Directory} from "./directory";
import {PersistentCache} from "./persistentCache";
import {
    ISerializable,
    ISerializableMap,
    IDeserializeResult,
    ISerialized,
    ISerializeResult,
    idString,
    DeserializePhase2Func,
    createId,
    SerializationRegistry,
    PersistentCacheStore
} from "./serialization";


////////////////////////////////////////////////////////////////////////////////
// Model
////////////////////////////////////////////////////////////////////////////////

interface IModelSerialized1 extends ISerialized
{
    schema: "1";
    rootPerson: undefined | string;
}

function isIModelSerialized1(serialized: ISerialized): serialized is IModelSerialized1
{
    const suspect = serialized as IModelSerialized1;

    return serialized.type === Model.type &&
           serialized.schema === "1" &&
           (_.isUndefined(suspect.rootPerson) || _.isString(suspect.rootPerson));
}

export class Model implements ISerializable
{
    // region ISerializableStatic

    public static get type(): "model"
    {
        return "model";
    }

    public static deserialize(serialized: ISerialized): IDeserializeResult
    {
        if (!isIModelSerialized1(serialized)) {
            throw new Error(`Unsupported serialized Model: ${JSON.stringify(serialized, undefined, 4)}`);
        }

        const deserialized                                 = new Model(serialized.id);
        const neededIds: Array<idString>                   = [];
        const additionalWork: Array<DeserializePhase2Func> = [];

        if (serialized.rootPerson) {
            neededIds.push(serialized.rootPerson);
            additionalWork.push((objects: ISerializableMap) => {
                deserialized.rootPerson = objects[serialized.rootPerson!] as Person;
            });
        }

        return {
            deserializedObj: deserialized,
            neededIds:       neededIds,
            completionFuncs: additionalWork
        };
    }

    // endregion

    public static create(): Model
    {
        return new Model(createId("model"));
    }

    // region Data Members
    private readonly _id: idString;
    private          _rootPerson: undefined | Person;

    // endregion

    private constructor(id: idString)
    {
        this._id         = id;
    }

    public get rootPerson(): undefined | Person
    {
        return this._rootPerson;
    }

    public set rootPerson(value: undefined | Person)
    {
        this._rootPerson = value;
    }


    // region ISerializable
    public get id(): string
    {
        return this._id;
    }

    public serialize(): ISerializeResult
    {
        const othersToSerialize: Array<ISerializable> = [];

        const serialized: IModelSerialized1 = {
            type: (this.constructor as any).type,
            id:   this._id,
            schema: "1",
            rootPerson: undefined
        };

        if (this._rootPerson) {
            serialized.rootPerson = this._rootPerson.id;
            othersToSerialize.push(this._rootPerson);
        }

        return {serialized, othersToSerialize};
    }
    // endregion


}

////////////////////////////////////////////////////////////////////////////////
// Person
////////////////////////////////////////////////////////////////////////////////

interface IPersonSerialized1 extends ISerialized
{
    schema: "1";
    firstName: string;
    lastName: string;
    mother: undefined | idString;
    father: undefined | idString;
}

function isIPersonSerialized1(serialized: ISerialized): serialized is IPersonSerialized1
{
    const suspect = serialized as IPersonSerialized1;

    return serialized.type === Person.type &&
           serialized.schema === "1" &&
           _.isString(suspect.firstName) &&
           _.isString(suspect.lastName) &&
           (_.isUndefined(suspect.mother) || _.isString(suspect.mother)) &&
           (_.isUndefined(suspect.father) || _.isString(suspect.father));
}

// tslint:disable-next-line:max-classes-per-file
export class Person implements ISerializable
{

    // region ISerializableStatic

    public static get type(): "person"
    {
        return "person";
    }


    public static deserialize(serialized: ISerialized): IDeserializeResult
    {
        if (!isIPersonSerialized1(serialized)) {
            throw new Error(`Unsupported serialized Person: ${JSON.stringify(serialized, undefined, 4)}`);
        }

        const deserialized                                 = new Person(serialized.id, serialized.firstName, serialized.lastName);
        const neededIds: Array<idString>                   = [];
        const additionalWork: Array<DeserializePhase2Func> = [];

        if (serialized.mother) {
            neededIds.push(serialized.mother);
            additionalWork.push((objects: ISerializableMap) => {
                deserialized.mother = objects[serialized.mother!] as Person;
            });
        }

        if (serialized.father) {
            neededIds.push(serialized.father);
            additionalWork.push((objects) => {
                deserialized.father = objects[serialized.father!] as Person;
            });
        }

        return {
            deserializedObj: deserialized,
            neededIds:       neededIds,
            completionFuncs: additionalWork
        };
    }

    // endregion

    public static create(firstName: string, lastName: string): Person
    {
        return new Person(createId("person"), firstName, lastName);
    }


    // region Data Members
    private readonly _id:        idString;
    private readonly _firstName: string;
    private readonly _lastName:  string;
    private          _mother:    undefined | Person;
    private          _father:    undefined | Person;
    // endregion

    private constructor(id: idString, firstName: string, lastName: string)
    {
        this._id = id;
        this._firstName = firstName;
        this._lastName = lastName;
    }

    public get firstName(): string
    {
        return this._firstName;
    }

    public get lastName(): string
    {
        return this._lastName;
    }

    public get mother(): undefined | Person
    {
        return this._mother;
    }

    public set mother(value: undefined | Person)
    {
        this._mother = value;
    }

    public get father(): undefined | Person
    {
        return this._father;
    }

    public set father(value: undefined | Person)
    {
        this._father = value;
    }


    // region ISerializable

    public get id(): string
    {
        return this._id;
    }

    public serialize(): ISerializeResult
    {
        const othersToSerialize: Array<ISerializable> = [];

        const serialized: IPersonSerialized1 = {
            type: (this.constructor as any).type,
            id:   this._id,
            schema: "1",
            firstName: this._firstName,
            lastName: this._lastName,
            mother: undefined,
            father: undefined
        };

        if (this._mother) {
            serialized.mother = this._mother.id;
            othersToSerialize.push(this._mother);
        }

        if (this._father) {
            serialized.father = this._father.id;
            othersToSerialize.push(this._father);
        }

        return {serialized, othersToSerialize};
    }

    // endregion

}


////////////////////////////////////////////////////////////////////////////////

describe("PersistentCacheStore", async () => {

    const tmpDir = new Directory(__dirname, "..", "tmp");

    beforeEach(() => {
        tmpDir.emptySync();
    });

    describe("instance", () => {


        it("can save data and then load it", async () => {

            // An IIFE to save the data.
            await (async () => {
                const registry = new SerializationRegistry();
                registry.register(Person);
                registry.register(Model);

                const cache = await PersistentCache.create<ISerialized>("test", {dir: tmpDir.toString()});
                const store = await PersistentCacheStore.create(registry, cache);

                const aerys = Person.create("Aerys", "Targaryen");
                const rhaella = Person.create("Rhaella", "Targaryen");

                const rhaegar = Person.create("Rhaegar", "Targaryen");
                rhaegar.father = aerys;
                rhaegar.mother = rhaella;
                const lyanna = Person.create("Lyanna", "Stark");

                const john = Person.create("John", "Snow");
                john.father = rhaegar;
                john.mother = lyanna;

                const model = Model.create();
                model.rootPerson = john;

                await store.save(model);
            })();

            // An IIFE to load the data.
            await (async () => {
                const registry = new SerializationRegistry();
                registry.register(Person);
                registry.register(Model);

                const cache = await PersistentCache.create<ISerialized>("test", {dir: tmpDir.toString()});
                const store = await PersistentCacheStore.create(registry, cache);

                const modelIds = await store.getIds(/^model/);
                if (modelIds.length === 0) {
                    fail("Unable to find model in persistent cache.");
                }
                const modelId = modelIds[0];

                const loadResult = await store.load<Model>(modelId);
                // There should have been 6 objects created in total:
                // the model, John, Lyanna, Rhaegar, Rhaella, Aerys.
                expect(Object.keys(loadResult.allObjects).length).toEqual(6);
                const model: Model = loadResult.obj;
                expect(model.rootPerson!.firstName).toEqual("John");
                expect(model.rootPerson!.mother!.firstName).toEqual("Lyanna");
                expect(model.rootPerson!.father!.firstName).toEqual("Rhaegar");
                expect(model.rootPerson!.father!.mother!.firstName).toEqual("Rhaella");
                expect(model.rootPerson!.father!.father!.firstName).toEqual("Aerys");
            })();

        });


    });


});



