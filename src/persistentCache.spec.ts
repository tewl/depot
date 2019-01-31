import * as _ from "lodash";
import * as BBPromise from "bluebird";
import {PersistentCache} from "./persistentCache";
import {generateUuid} from "./uuid";
import {tmpDir} from "../test/ut/specHelpers";
import {Directory} from "./directory";
import {allSettled} from "./promiseHelpers";


describe("PersistentCache", () => {

    beforeEach(() => {
        tmpDir.emptySync();
    });


    describe("static", () => {


        describe("create()", () => {


            it("rejects when the cache name contains an illegal character", () => {
                const illegalChars = ["<", ">", ":", "\"", "/", "\\", "|", "?", "*"];

                const promises = _.map(illegalChars, (curIllegalChar) => {
                    const name = "foo" + curIllegalChar + "bar";
                    return PersistentCache.create<string>(name, {dir: tmpDir.toString()});
                });

                allSettled(promises)
                .then((inspections) => {
                    const numRejections = _.sumBy(inspections, (curInspection) => curInspection.isRejected() ? 1 : 0);
                    expect(numRejections).toEqual(illegalChars.length);
                });
            });


            it("creates a PersistentCache instance", (done) => {
                PersistentCache.create(generateUuid(), {dir: tmpDir.toString()})
                .then((cache) => {
                    expect(cache).toBeTruthy();
                    done();
                });
            });


            it("rejects when the specified directory does not exist", (done) => {
                PersistentCache.create(generateUuid(), {dir: generateUuid()})
                .catch(() => {
                    done();
                });
            });


            it("puts files in the requested directory", (done) => {
                const cacheName = generateUuid();
                PersistentCache.create(cacheName, {dir: tmpDir.toString()})
                .then((cache) => {
                    expect(cache).toBeTruthy();
                    const expectedDir = new Directory(tmpDir, cacheName);
                    expect(expectedDir.existsSync()).toBeTruthy();
                    done();
                });
            });


        });


    });


    describe("instance", () => {


        describe("put()", () => {


            it("will reject when an illegal character appears in the key name", (done) => {
                const illegalChars = ["<", ">", ":", "\"", "/", "\\", "|", "?", "*"];

                PersistentCache.create<string>(generateUuid(), {dir: tmpDir.toString()})
                .then((cache) => {

                    const promises = _.map(illegalChars, (curIllegalChar) => {
                        return cache.put("foo" + curIllegalChar + "bar", "quux");
                    });

                    allSettled(promises)
                    .then((inspections) => {
                        const numRejections = _.sumBy(inspections, (curInspection) => curInspection.isRejected() ? 1 : 0);
                        expect(numRejections).toEqual(illegalChars.length);
                        done();
                    });
                });
            });


            it("will store a value and resolve the returned promise", (done) => {
                PersistentCache.create<string>(generateUuid(), {dir: tmpDir.toString()})!
                .then((cache) => {
                    return cache.put("key", "value")
                    .then(() => {
                        return cache.get("key");
                    })
                    .then((val) => {
                        expect(val).toEqual("value");
                        done();
                    });
                });
            });


            it("will persist values so that another instance can read the value", (done) => {
                const cacheName = generateUuid();
                const key = generateUuid();
                const val = generateUuid();

                PersistentCache.create<string>(cacheName, {dir: tmpDir.toString()})
                .then((cache) => {
                    return cache.put(key, val);
                })
                .then(() => {
                    return PersistentCache.create<string>(cacheName, {dir: tmpDir.toString()});
                })
                .then((cache) => {
                    return cache.get(key);
                })
                .then((readVal) => {
                    expect(readVal).toEqual(val);
                    done();
                });
            });


        });


        describe("get()", () => {


            it("will reject when the requested key does not exist", (done) => {

                PersistentCache.create<string>(generateUuid(), {dir: tmpDir.toString()})
                .then((cache) => {
                    return cache.get(generateUuid())
                    .catch((err) => {
                        expect(err.message).toMatch("No value");
                        done();
                    });
                });

            });


        });


        describe("delete()", () => {


            it("will remove the key from the cache", (done) => {
                PersistentCache.create<string>(generateUuid(), {dir: tmpDir.toString()})
                .then((cache) => {
                    const key = generateUuid();
                    const val = generateUuid();

                    return cache.put(key, val)
                    .then(() => {
                        // Make sure the value was set by reading it back.
                        return cache.get(key)
                        .then((readVal) => {
                            expect(readVal).toEqual(val);
                        });
                    })
                    .then(() => {
                        // Delete the key.
                        return cache.delete(key);
                    })
                    .then(() => {
                        return cache.get(key)
                        .catch((err) => {
                            expect(err.message).toMatch("No value");
                            done();
                        });
                    });
                });
            });


        });


        describe("keys()", () => {


            it("will enumerate the existing keys", (done) => {

                const cacheName = generateUuid();
                const key1 = generateUuid();
                const key2 = generateUuid();
                const key3 = generateUuid();

                PersistentCache.create(cacheName, {dir: tmpDir.toString()})
                .then((cache) => {
                    return BBPromise.all([cache.put(key1, generateUuid()),
                                          cache.put(key2, generateUuid()),
                                          cache.put(key3, generateUuid())]);
                })
                .then(() => {
                    return PersistentCache.create(cacheName, {dir: tmpDir.toString()});
                })
                .then((cache) => {
                    return cache.keys();
                })
                .then((keys) => {
                    expect(keys.length).toEqual(3);
                    expect(keys.indexOf(key1)).toBeGreaterThanOrEqual(0);
                    expect(keys.indexOf(key2)).toBeGreaterThanOrEqual(0);
                    expect(keys.indexOf(key3)).toBeGreaterThanOrEqual(0);
                    done();
                });
            });


        });

    });


});
