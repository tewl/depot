import {BufBuilder} from "./bufBuilder";
import {Lint, Ulint} from "./lint";


describe("BufBuilder", () => {


    it("can be constructed", () => {
        const bb: BufBuilder = new BufBuilder();
        expect(bb).toBeTruthy();
    });


    it("appendBOOL() will append a BOOL", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendBOOL(true);
        bb.appendBOOL(false);
        bb.appendBOOL(1);
        bb.appendBOOL(0);

        const buf = bb.toBuffer();
        expect(buf.length).toEqual(4);
        expect(buf[0]).toEqual(0x01);
        expect(buf[1]).toEqual(0x00);
        expect(buf[2]).toEqual(0x01);
        expect(buf[3]).toEqual(0x00);
    });


    it("appendUInt8() can append an UInt8", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendUInt8(0x12);

        const buf: Buffer = bb.toBuffer();
        expect(buf[0]).toEqual(0x12);
        expect(buf.length).toEqual(1);
    });


    it("appendInt8() can append an Int8", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendInt8(-1);

        const buf: Buffer = bb.toBuffer();
        expect(buf[0]).toEqual(0xFF);
        expect(buf.length).toEqual(1);
    });


    it("appendUInt16() can append an UInt16", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendUInt16(0x1234);

        const buf: Buffer = bb.toBuffer();
        expect(buf[0]).toEqual(0x34);
        expect(buf[1]).toEqual(0x12);
        expect(buf.length).toEqual(2);
    });


    it("appendInt16() can append an Int16", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendInt16(-2);

        const buf: Buffer = bb.toBuffer();
        expect(buf[0]).toEqual(0xFE);
        expect(buf[1]).toEqual(0xFF);
        expect(buf.length).toEqual(2);
    });


    it("appendUInt32() can append an UInt32", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendUInt32(0x12345678);

        const buf: Buffer = bb.toBuffer();
        expect(buf[0]).toEqual(0x78);
        expect(buf[1]).toEqual(0x56);
        expect(buf[2]).toEqual(0x34);
        expect(buf[3]).toEqual(0x12);
        expect(buf.length).toEqual(4);
    });


    it("appendInt32() can append an Int32", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendInt32(-0x64);

        const buf: Buffer = bb.toBuffer();
        expect(buf[0]).toEqual(0x9C);
        expect(buf[1]).toEqual(0xFF);
        expect(buf[2]).toEqual(0xFF);
        expect(buf[3]).toEqual(0xFF);
        expect(buf.length).toEqual(4);
    });


    it("appendUInt64() can append a UInt64", () => {

        const ulint = Ulint.fromBuffer(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08]))!;
        const bb = new BufBuilder();
        bb.appendUInt64(ulint);

        const buf = bb.toBuffer();
        expect(buf[0]).toEqual(0x01);
        expect(buf[1]).toEqual(0x02);
        expect(buf[2]).toEqual(0x03);
        expect(buf[3]).toEqual(0x04);
        expect(buf[4]).toEqual(0x05);
        expect(buf[5]).toEqual(0x06);
        expect(buf[6]).toEqual(0x07);
        expect(buf[7]).toEqual(0x08);
    });


    it("appendInt64() can append a Int64", () => {
        const lint = Lint.fromBuffer(Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x88]))!;
        const bb = new BufBuilder();
        bb.appendInt64(lint);

        const buf = bb.toBuffer();
        expect(buf[0]).toEqual(0x01);
        expect(buf[1]).toEqual(0x02);
        expect(buf[2]).toEqual(0x03);
        expect(buf[3]).toEqual(0x04);
        expect(buf[4]).toEqual(0x05);
        expect(buf[5]).toEqual(0x06);
        expect(buf[6]).toEqual(0x07);
        expect(buf[7]).toEqual(0x88);
    });


    it("appendFloat() can append a IEEE 754 float", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendFloat(5.3);

        const buf: Buffer = bb.toBuffer();
        expect(buf.length).toEqual(4);
        expect(buf[0]).toEqual(0x9A);
        expect(buf[1]).toEqual(0x99);
        expect(buf[2]).toEqual(0xA9);
        expect(buf[3]).toEqual(0x40);
    });


    it("appendREAL() will append a 32-bit float", () => {
        const bb = new BufBuilder();
        bb.appendREAL(5.3);

        const buf: Buffer = bb.toBuffer();
        expect(buf.length).toEqual(4);
        expect(buf[0]).toEqual(0x9A);
        expect(buf[1]).toEqual(0x99);
        expect(buf[2]).toEqual(0xA9);
        expect(buf[3]).toEqual(0x40);
    });


    it("appendDouble() can append a 64-bit floating point value", () => {
        const bb = new BufBuilder();
        bb.appendDouble(3.14159);

        const buf = bb.toBuffer();
        expect(buf.length).toEqual(8);
        expect(buf[0]).toEqual(0x6e);
        expect(buf[1]).toEqual(0x86);
        expect(buf[2]).toEqual(0x1b);
        expect(buf[3]).toEqual(0xf0);
        expect(buf[4]).toEqual(0xf9);
        expect(buf[5]).toEqual(0x21);
        expect(buf[6]).toEqual(0x09);
        expect(buf[7]).toEqual(0x40);
    });


    it("appendLREAL() can append a 64-bit floating point value", () => {
        const bb = new BufBuilder();
        bb.appendLREAL(3.14159);

        const buf = bb.toBuffer();
        expect(buf.length).toEqual(8);
        expect(buf[0]).toEqual(0x6e);
        expect(buf[1]).toEqual(0x86);
        expect(buf[2]).toEqual(0x1b);
        expect(buf[3]).toEqual(0xf0);
        expect(buf[4]).toEqual(0xf9);
        expect(buf[5]).toEqual(0x21);
        expect(buf[6]).toEqual(0x09);
        expect(buf[7]).toEqual(0x40);
    });


    it("appendString() can append a string value", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendString("test");

        const buf: Buffer = bb.toBuffer();
        expect(buf[0]).toEqual(0x04);
        expect(buf[1]).toEqual(0x00);
        expect(buf[2]).toEqual(0x74);
        expect(buf[3]).toEqual(0x65);
        expect(buf[4]).toEqual(0x73);
        expect(buf[5]).toEqual(0x74);
    });


    it("appendBuffer() can append a Buffer", () => {
        const buf: Buffer = Buffer.from([0x01, 0x02, 0x03, 0x04]);
        const bb: BufBuilder = new BufBuilder();
        bb.appendBuffer(buf);

        const actualBuf: Buffer = bb.toBuffer();
        expect(actualBuf[0]).toEqual(0x01);
        expect(actualBuf[1]).toEqual(0x02);
        expect(actualBuf[2]).toEqual(0x03);
        expect(actualBuf[3]).toEqual(0x04);
    });


    it("appendBufBuilder() should append the contents of another BufBuilder", () => {
        const buf1: BufBuilder = new BufBuilder();
        buf1.appendUInt8(1);
        buf1.appendUInt8(2);

        const buf2: BufBuilder = new BufBuilder();
        buf2.appendUInt8(3);
        buf2.appendUInt8(4);

        buf1.appendBufBuilder(buf2);
        const actual: Buffer = buf1.toBuffer();

        expect(actual[0]).toEqual(1);
        expect(actual[1]).toEqual(2);
        expect(actual[2]).toEqual(3);
        expect(actual[3]).toEqual(4);
    });


    it("toBuffer() should concatenate all of the parts and return a Buffer", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendUInt8(0x01);
        bb.appendUInt8(0x02);
        bb.appendUInt8(0x03);
        bb.appendUInt8(0x04);
        bb.appendBuffer(Buffer.from([0x05, 0x06]));

        const actualBuf: Buffer = bb.toBuffer();
        expect(actualBuf instanceof Buffer).toBeTruthy();
        expect(actualBuf.length).toEqual(6);
        expect(actualBuf[0]).toEqual(0x01);
        expect(actualBuf[1]).toEqual(0x02);
        expect(actualBuf[2]).toEqual(0x03);
        expect(actualBuf[3]).toEqual(0x04);
        expect(actualBuf[4]).toEqual(0x05);
        expect(actualBuf[5]).toEqual(0x06);
    });


    it("length should return the appropriate length", () => {
        const bb: BufBuilder = new BufBuilder();
        bb.appendUInt8(1);
        expect(bb.length).toEqual(1);

        bb.appendUInt8(2);
        expect(bb.length).toEqual(2);

        bb.appendUInt16(3);
        expect(bb.length).toEqual(4);

        bb.appendUInt32(4);
        expect(bb.length).toEqual(8);
    });
});
