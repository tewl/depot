// import {Directory} from "./directory";
// import {SerializationRegistry} from "./serializationRegistry";
// import * as PouchDB from "pouchdb";
// import * as path from "path";
// import {PouchDbStore} from "./pouchDbStore";
// import {Model, Person} from "./serializationObjects.spec";
//
//
// describe("PouchDbStore", async () => {
//
//
//     describe("instance", () => {
//
//         const tmpDir = new Directory(__dirname, "..", "tmp").absolute();
//
//         beforeEach(() => {
//             tmpDir.emptySync();
//         });
//
//
//         it("can save data and then load it", async () => {
//
//             const registry = new SerializationRegistry();
//             registry.register(Person);
//             registry.register(Model);
//
//             // TODO: Make the following into a PouchDBUtil.
//             const PouchDbTmpDir = PouchDB.defaults({prefix: tmpDir.toString() + path.sep});
//             const db = new PouchDbTmpDir("Unit Test DB");
//             const store = await PouchDbStore.create(registry, db);
//
//             // An IIFE to save the data.
//             await (async () => {
//                 const aerys = Person.create("Aerys", "Targaryen");
//                 const rhaella = Person.create("Rhaella", "Targaryen");
//
//                 const rhaegar = Person.create("Rhaegar", "Targaryen");
//                 rhaegar.father = aerys;
//                 rhaegar.mother = rhaella;
//                 const lyanna = Person.create("Lyanna", "Stark");
//
//                 const john = Person.create("John", "Snow");
//                 john.father = rhaegar;
//                 john.mother = lyanna;
//
//                 const model = Model.create(john);
//                 await store.save(model);
//             })();
//
//             // An IIFE to load the data.
//             await (async () => {
//                 const modelIds = await store.getIds(/^model/);
//                 if (modelIds.length === 0) {
//                     fail("Unable to find model in PouchDbStore.");
//                 }
//                 const modelId = modelIds[0];
//
//                 const loadResult = await store.load<Model>(modelId);
//                 // There should have been 6 objects created in total:
//                 // the model, John, Lyanna, Rhaegar, Rhaella, Aerys.
//                 expect(Object.keys(loadResult.allObjects).length).toEqual(6);
//                 const model: Model = loadResult.obj;
//                 expect(model.rootPerson!.firstName).toEqual("John");
//                 expect(model.rootPerson!.mother!.firstName).toEqual("Lyanna");
//                 expect(model.rootPerson!.father!.firstName).toEqual("Rhaegar");
//                 expect(model.rootPerson!.father!.mother!.firstName).toEqual("Rhaella");
//                 expect(model.rootPerson!.father!.father!.firstName).toEqual("Aerys");
//             })();
//
//             await db.close();
//         });
//
//
//     });
//
//
// });
//
