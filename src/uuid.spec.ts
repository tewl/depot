import * as _ from "lodash";
import { UuidFormat, reStrUuidFormatD, reStrUuidFormatN, Uuid, failed, succeeded } from ".";
import {generateUuid} from "./uuid";


describe("generateUuid()", () => {

    it("returns a string", () => {
        expect(_.isString(generateUuid())).toEqual(true);
    });


    it("returns a unique string", () => {
        const uuid1 = generateUuid();
        const uuid2 = generateUuid();

        expect(uuid1).not.toEqual(uuid2);
    });


    it("returns the uuid in 'D' (dashed) format by default", () => {
        const uuid = generateUuid();
        expect(uuid).toMatch(reStrUuidFormatD);
    });


    it("returns the uuid in 'N' (normal) format when asked for", () => {
        const uuid = generateUuid(UuidFormat.N);
        expect(uuid).toMatch(reStrUuidFormatN);
    });


});


describe("Uuid", () => {
    describe("static", () => {
        describe("isValid()", () => {
            it("returns true when given a valid uuid string", () => {
                // D format (lowercase and uppercase)
                expect(Uuid.isValid("b8d7a702-5f65-491a-9aad-5ce704ddd566")).toBeTrue();
                expect(Uuid.isValid("B8D7A702-5F65-491A-9AAD-5CE704DDD566")).toBeTrue();

                // N format (lowercase and uppercase)
                expect(Uuid.isValid("a1096b4bdb344926997fb97256373e2f")).toBeTrue();
                expect(Uuid.isValid("A1096B4BDB344926997FB97256373E2F")).toBeTrue();
            });


            it("return false when given an invalid uuid string", () => {
                // Invalid character ("g").
                expect(Uuid.isValid("g8d7a702-5f65-491a-9aad-5ce704ddd566")).toBeFalse();

                // Too few characters.
                expect(Uuid.isValid("8d7a702-5f65-491a-9aad-5ce704ddd566")).toBeFalse();

                // Too many characters.
                expect(Uuid.isValid("0b8d7a702-5f65-491a-9aad-5ce704ddd566")).toBeFalse();

            });
        });


        describe("create()", () => {
            it("creates a new instance with an automatically generated uuid", () => {
                const uuid = Uuid.create();
                expect(uuid).toBeDefined();
            });


            it("creates the uuid in the specified format", () => {
                const dRegex = new RegExp(reStrUuidFormatD);
                const nRegex = new RegExp(reStrUuidFormatN);

                const dUuid = Uuid.create(UuidFormat.D);
                expect(dRegex.test(dUuid.toString())).toBeTrue();

                const nUuid = Uuid.create(UuidFormat.N);
                expect(nRegex.test(nUuid.toString())).toBeTrue();
            });
        });


        describe("fromString()", () => {

            it("returns a failed result when given an invalid uuid string", () => {
                const result = Uuid.fromString("zb8d7a702-5f65-491a-9aad-5ce704ddd566");
                expect(failed(result)).toBeTrue();
            });


            it("returns a successful result with the new instance when given a valid D format string", () => {
                const result = Uuid.fromString("b8d7a702-5f65-491a-9aad-5ce704ddd566");
                expect(succeeded(result)).toBeTrue();
            });


            it("returns a successful result with the new instance when given a valid N format string", () => {
                const result = Uuid.fromString("a1096b4bdb344926997fb97256373e2f");
                expect(succeeded(result)).toBeTrue();
            });

        });
    });


    describe("instnace", () => {
        describe("equals()", () => {
            it("returns false when two instances are different", () => {
                const uuid1 = Uuid.fromString("a1096b4bdb344926997fb97256373e2f").value!;
                const uuid2 = Uuid.fromString("b1096b4bdb344926997fb97256373e2f").value!;
                expect(uuid1.equals(uuid2)).toBeFalse();
            });


            it("returns true when two instances are equal", () => {
                const uuid1 = Uuid.fromString("a1096b4bdb344926997fb97256373e2f").value!;
                const uuid2 = Uuid.fromString("a1096b4bdb344926997fb97256373e2f").value!;
                expect(uuid1.equals(uuid2)).toBeTrue();
            });


            it("returns true when two instances are equal but and are using different formats", () => {
                const uuid1 = Uuid.fromString("a1096b4b-db34-4926-997f-b97256373e2f").value!;
                const uuid2 = Uuid.fromString("a1096b4bdb344926997fb97256373e2f").value!;
                expect(uuid1.equals(uuid2)).toBeTrue();
            });
        });


        describe("toString()", () => {
            it("always returns the uuid in the format specified during creation", () => {
                const dUuid = Uuid.fromString("b8d7a702-5f65-491a-9aad-5ce704ddd566").value!;
                expect(dUuid.toString()).toEqual("b8d7a702-5f65-491a-9aad-5ce704ddd566");

                const nUuid = Uuid.fromString("a1096b4bdb344926997fb97256373e2f").value!;
                expect(nUuid.toString()).toEqual("a1096b4bdb344926997fb97256373e2f");
            });
        });
    });
});
