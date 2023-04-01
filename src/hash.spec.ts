import { hash } from "./hash";


describe("hash()", () => {

    it("returns a non-empty string", () => {
        const hashVal = hash("foo");
        expect(hashVal.length).toBeGreaterThan(0);
    });


    it("when given an empty string, returns a non-empty string", () => {
        const hashVal = hash("");
        expect(hashVal.length).toBeGreaterThan(0);
    });


    it("returns the same hash for an equal string", () => {
        const hash1 = hash("foo");
        const hash2 = hash("foo");
        expect(hash1).toEqual(hash2);
    });


    it("returns hexadecimal output when requested", () => {
        const hash1 = hash("foo", "sha256", "hex");
        expect(hash1).toEqual("2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae");
    });


    it("returns base64 output when requested", () => {
        const hash1 = hash("foo", "sha256", "base64");
        expect(hash1).toEqual("LCa0a2j/xo/5m0U8HTBBNBNCLXBkg7+g+YpeiGJm564=");
    });
});
