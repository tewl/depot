import {BufReader} from "./bufReader";
import {inRange} from "lodash";


describe("BufReader", () => {


    it("should be creatable", () => {
        expect(new BufReader(Buffer.from([1, 2, 3, 4]))).toBeTruthy();
    });


    it("readBOOL() will return the expected value", () => {
        const reader = new BufReader(Buffer.from([0xff, 0x01, 0x00]));
        expect(reader.readBOOL()).toEqual(1);
        expect(reader.readBOOL()).toEqual(1);
        expect(reader.readBOOL()).toEqual(0);
    });


    it("readUInt8() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04]));
        expect(reader.readUInt8()).toEqual(0x01);
        expect(reader.readUInt8()).toEqual(0x02);
        expect(reader.readUInt8()).toEqual(0x03);
        expect(reader.readUInt8()).toEqual(0x04);
    });


    it("readInt8() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0x88, 0xA9, 0xCB, 0xED]));
        expect(reader.readInt8()).toEqual(-0x78);
        expect(reader.readInt8()).toEqual(-0x57);
        expect(reader.readInt8()).toEqual(-0x35);
        expect(reader.readInt8()).toEqual(-0x13);
    });


    it("readUInt16() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04]));
        expect(reader.readUInt16()).toEqual(0x0201);
        expect(reader.readUInt16()).toEqual(0x0403);
    });


    it("readUInt16BE() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04]));
        expect(reader.readUInt16BE()).toEqual(0x0102);
        expect(reader.readUInt16BE()).toEqual(0x0304);
    });


    it("readInt16() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0xCC, 0xED]));
        expect(reader.readInt16()).toEqual(-0x1234);
    });


    it("readUInt32() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04]));
        expect(reader.readUInt32()).toEqual(0x04030201);
    });


    it("readUInt32BE() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04]));
        expect(reader.readUInt32BE()).toEqual(0x01020304);
    });


    it("readInt32() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x84]));
        expect(reader.readInt32()).toEqual(-0x7BFCFDFF);
    });


    it("readUInt64() should return the expected value", () => {
        const reader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]));
        expect(reader.readUInt64().toString(16)).toEqual("807060504030201");
    });


    it("readInt64() should return the expected value", () => {
        const reader = new BufReader(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x88]));
        // Original Value:
        //    8 8       0 7       0 6       0 5       0 4       0 3       0 2       0 1
        // 1000 1000 0000 0111 0000 0110 0000 0101 0000 0100 0000 0011 0000 0010 0000 0001
        // ------------------------------------------------------------------------------- 2's compliment
        // 0111 0111 1111 1000 1111 1001 1111 1010 1111 1011 1111 1100 1111 1101 1111 1111
        //    7 7       F 8       F 9       F A       F B       F C       F D       F F
        expect(reader.readInt64().toString(16)).toEqual("-77f8f9fafbfcfdff");
    });


    it("readFloat() should return the expected 32-bit floating point value", () => {
        const reader: BufReader = new BufReader(Buffer.from([0x9A, 0x99, 0xA9, 0x40]));
        expect(inRange(reader.readFloat(), 5.29, 5.31)).toBeTruthy();
    });


    it("readREAL() will return the expected 32-bit floating point value", () => {
        const reader = new BufReader(Buffer.from([0x9a, 0x99, 0xa9, 0x40]));
        expect(inRange(reader.readREAL(), 5.29, 5.31)).toBeTruthy();
    });


    it("readDouble() will return the expected 64-bit floating point value", () => {
        const reader = new BufReader(Buffer.from([
            0x6e, 0x86, 0x1b, 0xf0, 0xf9, 0x21, 0x09, 0x40
        ]));
        // expect(inRange(reader.readDouble(), 0.0, 1.0)).toBeTruthy();
        expect(reader.readDouble()).toEqual(3.14159);
    });


    it("readLREAL() will return the expected 64-bit floating point value", () => {
        const reader = new BufReader(Buffer.from([
            0x6e, 0x86, 0x1b, 0xf0, 0xf9, 0x21, 0x09, 0x40
        ]));
        // expect(inRange(reader.readLREAL(), 0.0, 1.0)).toBeTruthy();
        expect(reader.readLREAL()).toEqual(3.14159);
    });


    it("readShortString() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([
            0x05,        // 5 characters
            0x68,        // h
            0x65,        // e
            0x6c,        // l
            0x6c,        // l
            0x6f         // o
        ]));
        expect(reader.readShortString()).toEqual("hello");
    });


    it("readString() can read a string", () => {
        const reader: BufReader = new BufReader(Buffer.from([
            0x00,           // string length - high byte
            0x05,           // string length - low byte
            0x68,           // h
            0x65,           // e
            0x6c,           // l
            0x6c,           // l
            0x6f            // o
        ]));
        expect(reader.readString()).toEqual("hello");
    });


    it("readFixedLengthString() should return the expected value", () => {
        const reader: BufReader = new BufReader(Buffer.from([
            0x68,        // h
            0x65,        // e
            0x6c,        // l
            0x6c,        // l
            0x6f         // o
        ]));
        expect(reader.readFixedLengthString(5)).toEqual("hello");
    });


    describe("readBytes()", () => {


        it("will read to the end of the Buffer when no size is specified", () => {
            const reader: BufReader = new BufReader(Buffer.from([
                0x01, 0x02, 0x03, 0x04,
                0x05, 0x06, 0x07, 0x08]));

            reader.readUInt32();
            const remainder: Buffer = reader.readBytes();

            expect(remainder.length).toEqual(4);
            expect(remainder[0]).toEqual(0x05);
            expect(remainder[1]).toEqual(0x06);
            expect(remainder[2]).toEqual(0x07);
            expect(remainder[3]).toEqual(0x08);
        });


        it("should read the appropriate number of bytes", () => {
            const reader: BufReader = new BufReader(Buffer.from([
                0x01, 0x02, 0x03, 0x04,
                0x05, 0x06, 0x07, 0x08]));

            reader.readUInt32();
            const buf: Buffer = reader.readBytes(2);

            expect(buf[0]).toEqual(0x05);
            expect(buf[1]).toEqual(0x06);
        });


        it("should read 0 bytes if instructed to do so", () => {
            const reader: BufReader = new BufReader(Buffer.from([
                0x01, 0x02, 0x03, 0x04,
                0x05, 0x06, 0x07, 0x08]));

            reader.readUInt32();
            const buf: Buffer = reader.readBytes(0);

            expect(buf.length).toEqual(0);
        });


        it("should not read past the end of the source buffer", () => {
            const reader: BufReader = new BufReader(Buffer.from([
                0x01, 0x02]));

            const buf: Buffer = reader.readBytes(4);

            expect(buf.length).toEqual(2);
            expect(buf[0]).toEqual(0x01);
            expect(buf[1]).toEqual(0x02);
        });


        it("should allow the caller to specify a size that goes to the end of the buffer", () => {
            const reader: BufReader = new BufReader(Buffer.from([
                0x01, 0x02, 0x03, 0x04]));

            reader.readUInt8();
            const buf: Buffer = reader.readBytes(3);


            expect(buf.length).toEqual(3);
            expect(buf[0]).toEqual(0x02);
            expect(buf[1]).toEqual(0x03);
            expect(buf[2]).toEqual(0x04);
        });


        it("should return an empty buffer once the end has been reached", () => {
            const reader: BufReader = new BufReader(Buffer.from([
                0x01, 0x02, 0x03, 0x04]));
            reader.readUInt32();

            let buf: Buffer = reader.readBytes();
            expect(buf.length).toEqual(0);

            buf = reader.readBytes(1);
            expect(buf.length).toEqual(0);
        });


    });


    describe("inspectNextByte()", () => {

        it("should return the first byte if the buffer had not been read", () => {

            const reader: BufReader = new BufReader(
                Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]));

            expect(reader.inspectNextByte()).toEqual(0x01);

        });

        it("should not impact the BufReader location", () => {

            const reader: BufReader = new BufReader(
                Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]));

            const expected = reader.numBytesRemaining();
            reader.inspectNextByte();

            expect(reader.numBytesRemaining()).toEqual(expected);

        });

        it("should read the next byte after reading", () => {

            const reader: BufReader = new BufReader(
                Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]));

            reader.readBYTE();
            expect(reader.inspectNextByte()).toEqual(0x02);

            reader.readBYTE();
            expect(reader.inspectNextByte()).toEqual(0x03);

            reader.readInt16();
            expect(reader.inspectNextByte()).toEqual(0x05);

            reader.readInt32();

        });

        it("should return undefined when the BufReader has reached the end", () => {

            const reader: BufReader = new BufReader(
                Buffer.from([0x01]));

            reader.readBYTE();
            expect(reader.numBytesRemaining()).toEqual(0);
            expect(reader.inspectNextByte()).toBeUndefined();

        });

    });

    describe("numBytesRemaining()", () => {


        it("description should return the correct number of bytes remaining", () => {
            const reader: BufReader = new BufReader(
                Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]));

            expect(reader.numBytesRemaining()).toEqual(8);
            reader.readUInt16();
            expect(reader.numBytesRemaining()).toEqual(6);
            reader.readUInt8();
            expect(reader.numBytesRemaining()).toEqual(5);
            reader.readUInt8();
            expect(reader.numBytesRemaining()).toEqual(4);
            reader.readBytes();
            expect(reader.numBytesRemaining()).toEqual(0);
        });


    });


    describe("atEnd()", () => {


        it("should return true when all data has been read", () => {
            const reader: BufReader = new BufReader(Buffer.from([1, 2, 3, 4]));
            reader.readUInt32();
            expect(reader.atEnd()).toEqual(true);
        });


        it("should return false when all data has not been read", () => {
            const reader: BufReader = new BufReader(Buffer.from([1, 2, 3, 4]));
            reader.readUInt16();
            expect(reader.atEnd()).toEqual(false);
        });


        it("should return false until the buffer is read to the end", () => {
            const reader: BufReader = new BufReader(Buffer.from([1, 2, 3, 4]));
            reader.readUInt8();
            expect(reader.atEnd()).toEqual(false);
            reader.readUInt8();
            expect(reader.atEnd()).toEqual(false);
            reader.readUInt8();
            expect(reader.atEnd()).toEqual(false);
            reader.readUInt8();
            expect(reader.atEnd()).toEqual(true);
        });


    });


});
