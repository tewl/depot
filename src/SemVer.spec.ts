import {SemVer} from "./SemVer";


describe("SemVer", () =>
{

    describe("static", () =>
    {

        describe("fromString()", () =>
        {

            it("will return a SemVer instance when given a valid string", () =>
            {
                expect(SemVer.fromString("1.2.3")).toBeTruthy();
                expect(SemVer.fromString("1.2.3-alpha")).toBeTruthy();
                expect(SemVer.fromString("1.2.3-alpha.1")).toBeTruthy();
                expect(SemVer.fromString("1.2.3-beta")).toBeTruthy();
                expect(SemVer.fromString("1.2.3-beta.1")).toBeTruthy();
            });


            it("will return undefined when given an invalid string", () =>
            {
                expect(SemVer.fromString("1.2.A")).toEqual(undefined);
                expect(SemVer.fromString("1.2.3.4")).toEqual(undefined);
                expect(SemVer.fromString("1.2")).toEqual(undefined);
            });


            it("will return the expected SemVer instance when prefixed with 'v'", () =>
            {
                // No whitespace after prefix.
                expect(SemVer.fromString("v1.2.3")!.toString()).toEqual("1.2.3");
            });


        });


        describe("sort()", () =>
        {

            it("will sort an array of SemVer instances", () =>
            {
                const semvers: Array<SemVer> = [
                    SemVer.fromString("3.3.1")!,
                    SemVer.fromString("3.3.3")!,
                    SemVer.fromString("3.3.2")!,
                    SemVer.fromString("3.3.2-beta.2")!,
                    SemVer.fromString("3.3.2-beta.1")!,
                    SemVer.fromString("3.3.2-alpha.2")!,
                    SemVer.fromString("3.3.2-alpha.1")!,

                    SemVer.fromString("3.2.1")!,
                    SemVer.fromString("3.2.3")!,
                    SemVer.fromString("3.2.2")!,

                    SemVer.fromString("3.1.1")!,
                    SemVer.fromString("3.1.3")!,
                    SemVer.fromString("3.1.2")!,

                    SemVer.fromString("2.3.1")!,
                    SemVer.fromString("2.3.3")!,
                    SemVer.fromString("2.3.2")!,

                    SemVer.fromString("2.2.1")!,
                    SemVer.fromString("2.2.3")!,
                    SemVer.fromString("2.2.2")!,

                    SemVer.fromString("2.1.1")!,
                    SemVer.fromString("2.1.3")!,
                    SemVer.fromString("2.1.2")!,

                    SemVer.fromString("1.3.1")!,
                    SemVer.fromString("1.3.3")!,
                    SemVer.fromString("1.3.2")!,

                    SemVer.fromString("1.2.1")!,
                    SemVer.fromString("1.2.3")!,
                    SemVer.fromString("1.2.2")!,

                    SemVer.fromString("1.1.1")!,
                    SemVer.fromString("1.1.3")!,
                    SemVer.fromString("1.1.2")!
                ];

                const sorted =
                    SemVer.sort(semvers)
                    .map((curSemVer) => curSemVer.toString());

                expect(sorted).toEqual([
                    "1.1.1",
                    "1.1.2",
                    "1.1.3",
                    "1.2.1",
                    "1.2.2",
                    "1.2.3",
                    "1.3.1",
                    "1.3.2",
                    "1.3.3",

                    "2.1.1",
                    "2.1.2",
                    "2.1.3",
                    "2.2.1",
                    "2.2.2",
                    "2.2.3",
                    "2.3.1",
                    "2.3.2",
                    "2.3.3",

                    "3.1.1",
                    "3.1.2",
                    "3.1.3",
                    "3.2.1",
                    "3.2.2",
                    "3.2.3",
                    "3.3.1",
                    "3.3.2-alpha.1",
                    "3.3.2-alpha.2",
                    "3.3.2-beta.1",
                    "3.3.2-beta.2",
                    "3.3.2",
                    "3.3.3"
                ]);
            });


        });


    });


    describe("instance", () =>
    {

        it("major, minor, patch and prerelease properties will return the expected version", () =>
        {
            const semver = SemVer.fromString("1.2.3-alpha.4");
            expect(semver).toBeTruthy();
            expect(semver!.major).toEqual(1);
            expect(semver!.minor).toEqual(2);
            expect(semver!.patch).toEqual(3);
            expect(semver!.prerelease).toEqual({type: "alpha", version: 4});
        });


        it("major property will return the expected value", () =>
        {
            expect(SemVer.fromString("1.2.3-alpha.4")!.major).toEqual(1);
        });


        it("minor property will return the expected value", () =>
        {
            expect(SemVer.fromString("1.2.3-alpha.4")!.minor).toEqual(2);
        });


        it("patch property will return the expected value", () =>
        {
            expect(SemVer.fromString("1.2.3-alpha.4")!.patch).toEqual(3);
        });


        it("prerelease property will return the expected value", () =>
        {
            expect(SemVer.fromString("1.2.3-alpha.4")!.prerelease).toEqual({type: "alpha", version: 4});
        });


        it("prerelease property will return only a type when no version is present", () =>
        {
            expect(SemVer.fromString("1.2.3-alpha")!.prerelease).toEqual({type: "alpha"});
        });


        it("prerelease property will be undefined when not present", () =>
        {
            expect(SemVer.fromString("1.2.3")!.prerelease).toEqual(undefined);
        });


        it("toString()", () =>
        {
            const semver = SemVer.fromString("1.2.3-alpha.4");
            expect(semver!.toString()).toEqual("1.2.3-alpha.4");
        });


        it("getMajorVersionString()", () =>
        {
            const semver = SemVer.fromString("1.2.3-alpha.4");
            expect(semver!.getMajorVersionString()).toEqual("v1");
        });


        it("getMinorVersionString()", () =>
        {
            const semver = SemVer.fromString("1.2.3-alpha.4");
            expect(semver!.getMinorVersionString()).toEqual("v1.2");
        });


        it("getPatchVersionString()", () =>
        {
            const semver = SemVer.fromString("1.2.3-alpha.4");
            expect(semver!.getPatchVersionString()).toEqual("v1.2.3");
        });


        describe("compare()", () =>
        {
            //
            // Note:  We only need a minimal set of unit tests here to make sure
            // that we are calling through to the semver library correctly.  It
            // would be crazy to reproduce all of the tests for all types of
            // semvers.
            //

            it("will return 0 when this SemVer equals the other SemVer", () =>
            {
                const semver1 = SemVer.fromString("1.2.3");
                const semver2 = SemVer.fromString("1.2.3");
                expect(semver1!.compare(semver2!)).toEqual(0);
            });


            it("will return -1 when this SemVer is less than the other SemVer", () =>
            {
                const semver1 = SemVer.fromString("1.2.2");
                const semver2 = SemVer.fromString("2.1.1");
                expect(semver1!.compare(semver2!)).toEqual(-1);
            });


            it("will return 1 when this SemVer is greater than the other SemVer", () =>
            {
                const semver1 = SemVer.fromString("2.1.1");
                const semver2 = SemVer.fromString("1.1.1");
                expect(semver1!.compare(semver2!)).toEqual(1);
            });


        });


    });


});
