import { EOL } from "os";
import * as _ from "lodash";
import { alignBuffer, boolify, hexDump, padBuffer } from "./bufUtils";


describe("padBuffer()", () => {


    it("should add appropriate bytes when needed", () => {
        const buf = Buffer.from([1]);
        const actual: Buffer = padBuffer(buf, 4);
        expect(actual).toEqual(Buffer.from([1, 0, 0, 0]));
    });


    it("should return the original Buffer when 0 additional bytes are needed", () => {
        const buf = Buffer.from([1, 2, 3, 4]);
        const actual: Buffer = padBuffer(buf, 4);
        expect(actual).toEqual(buf);
        expect(actual).toEqual(Buffer.from([1, 2, 3, 4]));
    });


    it("should return the original Buffer when it is already too big", () => {
        const buf: Buffer = Buffer.from([1, 2, 3, 4, 5, 6]);
        const actual: Buffer = padBuffer(buf, 4);
        expect(actual).toEqual(buf);
        expect(actual).toEqual(Buffer.from([1, 2, 3, 4, 5, 6]));
    });


});


describe("alignBuffer()", () => {


    it("will do nothing if the buffer is already aligned", () => {
        let result: Buffer;

        result = alignBuffer(Buffer.from([1, 2]), 2);
        expect(result).toEqual(Buffer.from([1, 2]));

        result = alignBuffer(Buffer.from([1, 2, 3, 4]), 4);
        expect(result).toEqual(Buffer.from([1, 2, 3, 4]));

        result = alignBuffer(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]), 8);
        expect(result).toEqual(Buffer.from([1, 2, 3, 4, 5, 6, 7, 8]));
    });


    it("will add bytes to make the buffer aligned properly", () => {
        let result: Buffer;

        result = alignBuffer(Buffer.from([1]), 2);
        expect(result).toEqual(Buffer.from([1, 0]));

        result = alignBuffer(Buffer.from([1]), 4);
        expect(result).toEqual(Buffer.from([1, 0, 0, 0]));

        result = alignBuffer(Buffer.from([1]), 8);
        expect(result).toEqual(Buffer.from([1, 0, 0, 0, 0, 0, 0, 0]));
    });


});


describe("boolify()", () => {

    it("converts an 8-bit number to bool array", () => {
        expect(boolify(0b0000_1011, 1)).toEqual([true, true, false, true, false, false, false, false]);
    });


    it("converts an 16-bit number to bool array", () => {
        expect(boolify(0b0000_1111_0101_1010, 2)).toEqual([
            false, true, false, true, true, false, true, false,
            true, true, true, true, false, false, false, false
        ]);
    });


    it("converts an 32-bit number to bool array", () => {
        expect(boolify(0x04030201, 4)).toEqual([
            true,  false, false, false, false, false, false, false,
            false, true,  false, false, false, false, false, false,
            true,  true,  false, false, false, false, false, false,
            false, false, true, false, false, false, false, false,
        ]);
    });


    it("ignores extra bits", () => {
        expect(boolify(0x04030201, 2)).toEqual([
            true,  false, false, false, false, false, false, false,
            false, true,  false, false, false, false, false, false
        ]);
    });


});


describe("hexDump()", () => {


    it("will generate the expected output for a single full line (16 bytes)", () => {
        const buf: Buffer = Buffer.from(_.range(0, 0x10));
        const actual: string = hexDump(buf);
        expect(actual).toEqual("0001 0203 0405 0607 0809 0a0b 0c0d 0e0f  ................");
    });


    it("will generate the expected output for a partial line (24 bytes)", () => {
        const buf: Buffer = Buffer.from(_.range(0, 0x18));
        const actual: string = hexDump(buf);
        expect(actual).toEqual("0001 0203 0405 0607 0809 0a0b 0c0d 0e0f  ................" + EOL +
            "1011 1213 1415 1617                      ........        ");
    });


    it("will generate the expected output for all byte values", () => {
        const buf: Buffer = Buffer.from(_.range(0, 256));
        const actual: string = hexDump(buf);
        const expected: string = [
            "0001 0203 0405 0607 0809 0a0b 0c0d 0e0f  ................",
            "1011 1213 1415 1617 1819 1a1b 1c1d 1e1f  ................",
            `2021 2223 2425 2627 2829 2a2b 2c2d 2e2f   !"#$%&'()*+,-./`,
            "3031 3233 3435 3637 3839 3a3b 3c3d 3e3f  0123456789:;<=>?",
            "4041 4243 4445 4647 4849 4a4b 4c4d 4e4f  @ABCDEFGHIJKLMNO",
            "5051 5253 5455 5657 5859 5a5b 5c5d 5e5f  PQRSTUVWXYZ[\\]^_",
            "6061 6263 6465 6667 6869 6a6b 6c6d 6e6f  `abcdefghijklmno",
            "7071 7273 7475 7677 7879 7a7b 7c7d 7e7f  pqrstuvwxyz{|}~.",
            "8081 8283 8485 8687 8889 8a8b 8c8d 8e8f  ................",
            "9091 9293 9495 9697 9899 9a9b 9c9d 9e9f  ................",
            "a0a1 a2a3 a4a5 a6a7 a8a9 aaab acad aeaf  ................",
            "b0b1 b2b3 b4b5 b6b7 b8b9 babb bcbd bebf  ................",
            "c0c1 c2c3 c4c5 c6c7 c8c9 cacb cccd cecf  ................",
            "d0d1 d2d3 d4d5 d6d7 d8d9 dadb dcdd dedf  ................",
            "e0e1 e2e3 e4e5 e6e7 e8e9 eaeb eced eeef  ................",
            "f0f1 f2f3 f4f5 f6f7 f8f9 fafb fcfd feff  ................"
        ].join(EOL);
        expect(actual).toEqual(expected);
    });


});


describe("bufferHelpers", () => {

    it("foo", () => {
        const n = -92;

        const buf = Buffer.alloc(8);







    });
});
