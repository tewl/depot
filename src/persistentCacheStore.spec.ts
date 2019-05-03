import {Directory} from "./directory";
import {SerializationRegistry} from "./serializationRegistry";
import {PersistentCache} from "./persistentCache";
import {PersistentCacheStore} from "./persistentCacheStore";
import {ISerialized} from "./serialization";
import {Model, Person} from "./serializationObjects.spec";


describe("PersistentCacheStore", async () => {

    const tmpDir = new Directory(__dirname, "..", "tmp");

    beforeEach(() => {
        tmpDir.emptySync();
    });

    describe("instance", () => {


        it("can save data and then load it", async () => {

            const registry = new SerializationRegistry();
            registry.register(Person);
            registry.register(Model);

            const cacheName = "test";

            // An IIFE to save the data.
            await (async () => {
                const cache = await PersistentCache.create<ISerialized>(cacheName, {dir: tmpDir.toString()});
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

                const model = Model.create(john);
                await store.save(model);
            })();

            // An IIFE to load the data.
            await (async () => {
                const cache = await PersistentCache.create<ISerialized>(cacheName, {dir: tmpDir.toString()});
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
