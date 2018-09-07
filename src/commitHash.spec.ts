import {CommitHash} from "./commitHash";

describe("CommitHash", () => {

    describe("static", () => {


        describe("fromString()", () => {


            it("will return a new instance if legal", () => {
                expect(CommitHash.fromString("d667bf542896f467b4f9a98b3fb18f1a0ab9d23f")).toBeTruthy();
                expect(CommitHash.fromString("D667BF542896F467B4F9A98B3fB18F1A0AB9D23F")).toBeTruthy();
                expect(CommitHash.fromString("ea4a37b")).toBeTruthy();
                expect(CommitHash.fromString("EA4A37B")).toBeTruthy();
            });


            it("will return undefined when the hash contains an illegal character", () => {
                expect(CommitHash.fromString("d667bf542896f467b4f9a98b3fb18f1a0ab9d23g")).toEqual(undefined);
                expect(CommitHash.fromString("D667BF542896F467B4F9A98B3fB18F1A0AB9D23G")).toEqual(undefined);
            });


            it("will return undefined when the hash is too long", () => {
                expect(CommitHash.fromString("d667bf542896f467b4f9a98b3fb18f1a0ab9d23f1")).toEqual(undefined);
                expect(CommitHash.fromString("D667BF542896F467B4F9A98B3fB18F1A0AB9D23F1")).toEqual(undefined);
            });


            it("will return undefined when the hash is too short", () => {
                expect(CommitHash.fromString("ea4a37")).toEqual(undefined);
                expect(CommitHash.fromString("EA4A37")).toEqual(undefined);
            });

        });


    });


    describe("instance", () => {

        describe("toString()", () => {


            it("will return the hash as a string", () => {
                const hash = CommitHash.fromString("d667bf542896f467b4f9a98b3fb18f1a0ab9d23f");
                expect(hash!.toString()).toEqual("d667bf542896f467b4f9a98b3fb18f1a0ab9d23f");
            });


        });


        describe("toShortString()", () => {


            it("will return a shorter version of the hash", () => {
                const hash = CommitHash.fromString("d667bf542896f467b4f9a98b3fb18f1a0ab9d23f");
                expect(hash!.toShortString()).toEqual("d667bf5");
            });


        });

    });


});
