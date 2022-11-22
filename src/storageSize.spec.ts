import { StorageSize } from "./storageSize";



describe("StorageSize", () => {

    describe("fromBytes()", () => {

        it("creates a new instance representing the specified size", () => {
            const s = StorageSize.fromBytes(1024);
            expect(s.bytes).toEqual(1024);
        });

    });


    describe("bytes property", () => {

        it("returns the expected number of bytes", () => {
            const s = StorageSize.fromBytes(37281613);
            expect(s.bytes).toEqual(37281613);
        });

    });


    describe("toString()", () => {

        it("Provides the normalized value followed by the number of bytes in parenthesis", () => {
            const numBytes = (62 * 1024 * 1024) + (51 * 1024) + 441;
            const s = StorageSize.fromBytes(numBytes);
            expect(s.toString()).toEqual(`62.05 MB (${numBytes.toLocaleString()} bytes)`);
        });
    });


    describe("normalized()", () => {

        it("scales the number so that it is between 0 and 1000", () => {
            const s = StorageSize.fromBytes((337 * 1024 * 1024) + (38 * 1024) + 821);
            const [val, units] = s.normalized();
            expect(val).toEqual(337.04);
            expect(units).toEqual("MB");
        });

    });

});
