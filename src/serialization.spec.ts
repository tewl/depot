import * as _ from "lodash";
import {
    SerializationRegistry,
    ISerializable,
    ISerialized,
    ISerializableMap,
    IDeserializeResult,
    ISerializeResult, IndeterminateSyncWork
} from "./serialization";


interface ISerializedBizObjMock1 extends ISerialized
{
    data:   string;
    prevId: string | undefined;
    nextId: string | undefined;
}
function isSerializedBizObjMock1(serialized: ISerialized): serialized is ISerializedBizObjMock1
{
    const ser = serialized as any;
    return ser.type === BizObjMock.type &&
           ser.schema === "1" &&
           _.isString(ser.data) &&
           (_.isString(ser.prevId) || _.isUndefined(ser.prevId)) &&
           (_.isString(ser.nextId) || _.isUndefined(ser.nextId));
}


class BizObjMock implements ISerializable
{
    public static readonly type: string = "BizObjMock";


    public static deserialize(
        serialized: ISerialized,
        deserializedSoFar: ISerializableMap
    ): IDeserializeResult
    {
        if (!isSerializedBizObjMock1(serialized)) {
            throw new Error("Unsupported BizObjMock schema.");
        }

        const deserialized = new BizObjMock(serialized.id, serialized.data);
        const additionalWork: Array<IndeterminateSyncWork<boolean>> = [];

        // If the biz object had a prev reference, queue some additional work to
        // set it.
        if (serialized.prevId) {
            additionalWork.push(() => {
                deserialized.prev = deserializedSoFar[serialized.prevId!] as BizObjMock;
                return !!deserialized.prev;
            });
        }

        // If the biz object had a next reference, queue some additional work to
        // set it.
        if (serialized.nextId) {
            additionalWork.push(() => {
                deserialized.next = deserializedSoFar[serialized.nextId!] as BizObjMock;
                return !!deserialized.next;
            });
        }

        return {
            deserializedObj: deserialized,
            additionalWork: additionalWork
        };
    }


    // region Instance Data
    private readonly _id: string;
    private readonly _data: string;
    private          _prev: undefined | BizObjMock;
    private          _next: undefined | BizObjMock;
    // endregion


    public constructor(id: string, data: string)
    {
        this._id   = id;
        this._data = data;
    }


    public get id(): string
    {
        return this._id;
    }


    public get data(): string
    {
        return this._data;
    }


    public get prev(): BizObjMock | undefined
    {
        return this._prev;
    }


    public set prev(obj: BizObjMock | undefined)
    {
        this._prev = obj;
    }


    public get next(): BizObjMock | undefined
    {
        return this._next;
    }


    public set next(obj: BizObjMock | undefined)
    {
        this._next = obj;
    }


    public serialize(): ISerializeResult
    {
        const serialized: ISerializedBizObjMock1 = {
            type:   (this.constructor as any).type,
            id:     this._id,
            schema: "1",
            data:   this._data,
            prevId: undefined,
            nextId: undefined
        };

        const othersToSerialize: Array<ISerializable> = [];

        if (this._prev) {
            serialized.prevId = this._prev.id;
            othersToSerialize.push(this._prev);
        }

        if (this._next) {
            serialized.nextId = this._next.id;
            othersToSerialize.push(this._next);
        }


        return {serialized, othersToSerialize};
    }

}


describe("SerializationRegistry", () => {

    describe("static", () => {


        describe("deserialize()", () => {


            it("will deserialize", async () => {
                const registry = new SerializationRegistry();
                registry.register(BizObjMock);

                const bizObj = new BizObjMock("123", "data");
                const serializeResult = bizObj.serialize();

                const newInstances = registry.deserialize([serializeResult.serialized]);
                expect(newInstances.length).toEqual(1);
                const newInstance = newInstances[0] as BizObjMock;
                expect(newInstance.id).toEqual("123");
                expect(newInstance.data).toEqual("data");
            });


            it("can deserialize two objects that have references to each other", async () => {
                // Create the registry.
                const registry = new SerializationRegistry();
                registry.register(BizObjMock);

                // Create two objects that hold references to each other.
                const obj1 = new BizObjMock("1", "data 1");
                const obj2 = new BizObjMock("2", "data 2");
                obj1.next = obj2;
                obj2.prev = obj1;

                const serialized1 = obj1.serialize().serialized;
                const serialized2 = obj2.serialize().serialized;

                const newBizObjects = registry.deserialize([serialized1, serialized2]);
                expect(newBizObjects.length).toEqual(2);

                const new1 = newBizObjects[0] as BizObjMock;
                const new2 = newBizObjects[1] as BizObjMock;

                expect(new1.id).toEqual("1");
                expect(new1.data).toEqual("data 1");
                expect(new1.prev).toEqual(undefined);
                expect(new1.next).toEqual(new2);

                expect(new2.id).toEqual("2");
                expect(new2.data).toEqual("data 2");
                expect(new2.prev).toEqual(new1);
                expect(new2.next).toEqual(undefined);


            });


        });


    });


    describe("instance", () => {


        describe("register()", () => {


            it("accepts registrations", () => {
                const registry = new SerializationRegistry();
                registry.register(BizObjMock);
                expect(registry.numRegisteredClasses).toEqual(1);
            });


            it("returns a function that unregisters", () => {
                const registry = new SerializationRegistry();
                const unregisterMock = registry.register(BizObjMock);
                expect(_.isFunction(unregisterMock)).toEqual(true);
                expect(registry.numRegisteredClasses).toEqual(1);
                unregisterMock();
                expect(registry.numRegisteredClasses).toEqual(0);
            });


        });


    });


});
