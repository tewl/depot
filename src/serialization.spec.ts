import {SerializationRegistry} from "./serializationRegistry";
import {Model, Person} from "./serializationObjects.spec";
import {MemoryStore} from "./serialization";


describe("MemoryStore", () =>
{

    describe("instance", () =>
    {

        it("can save data and then load it", async () =>
        {
            const registry = new SerializationRegistry();
            registry.register(Person);
            registry.register(Model);
            const store = await MemoryStore.create(registry);

            // An IIFE to save the data.
            await (async () =>
            {
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
            await (async () =>
            {
                const modelIds = await store.getIds(/^model/);
                if (modelIds.length === 0)
                {
                    fail("Unable to find model in MemoryStore.");
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
