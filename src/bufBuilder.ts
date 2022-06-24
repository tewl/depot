// tslint:disable:member-ordering

import * as _ from "lodash";
import {Lint, Ulint} from "./lint";

/**
 * Used to dynamically build Buffers.
 */
export class BufBuilder {

    private readonly _parts: Array<Buffer> = [];

    public constructor() {
        Object.seal(this);
    }

    /**
     * Appends a BOOL (8-bit) value.
     * @param value - The boolean value to be appended
     */
    public appendBOOL(value: boolean | 0 | 1): void {
        // CIP spec vol. 1 C-5.2.1 states that 0x00 is used for false and 0x01
        // is used for true.
        this.appendUInt8(value ? 0x01 : 0x00);
    }

    /**
     * Appends an unsigned 8-bit value.
     * @param value - The value to append
     */
    public appendUInt8(value: number): void {
        const buf: Buffer = Buffer.alloc(1);
        buf.writeUInt8(value, 0);
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendUSINT: (value: number) => void = this.appendUInt8;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendBYTE:  (value: number) => void = this.appendUInt8;

    /**
     * Appends a signed 8-bit value.
     * @param value - The value to append
     */
    public appendInt8(value: number): void {
        const buf: Buffer = Buffer.alloc(1);
        buf.writeInt8(value, 0);
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendSINT: (value: number) => void = this.appendInt8;

    /**
     * Appends an unsigned 16-bit value.
     * @param value - The value to append
     */
    public appendUInt16(value: number): void {
        const buf: Buffer = Buffer.alloc(2);
        buf.writeUInt16LE(value, 0);
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendUINT: (value: number) => void = this.appendUInt16;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendWORD: (value: number) => void = this.appendUInt16;

    /**
     * Appends a signed 16-bit value.
     * @param value - The value to append
     */
    public appendInt16(value: number): void {
        const buf: Buffer = Buffer.alloc(2);
        buf.writeInt16LE(value, 0);
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendINT: (value: number) => void = this.appendInt16;

    /**
     * Appends an unsigned 32-bit value.
     * @param value - The value to append
     */
    public appendUInt32(value: number): void {
        const buf: Buffer = Buffer.alloc(4);
        buf.writeUInt32LE(value, 0);
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendUDINT: (value: number) => void = this.appendUInt32;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendDWORD: (value: number) => void = this.appendUInt32;

    /**
     * Appends a signed 32-bit value.
     * @param value - The value to append
     */
    public appendInt32(value: number): void {
        const buf: Buffer = Buffer.alloc(4);
        buf.writeInt32LE(value, 0);
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendDINT: (value: number) => void = this.appendInt32;


    public appendUInt64(value: Ulint): void {
        const buf = value.toBuffer();
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendULINT: (value: Ulint) => void = this.appendUInt64;


    public appendInt64(value: Lint): void {
        const buf = value.toBuffer();
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendLINT: (value: Lint) => void = this.appendInt64;


    /**
     * Appends a IEEE 754 format floating point value.
     * @param value - The value to append
     */
    public appendFloat(value: number): void {
        const buf: Buffer = Buffer.alloc(4);
        buf.writeFloatLE(value, 0);
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendREAL: (value: number) => void = this.appendFloat;


    public appendDouble(value: number): void {
        const buf = Buffer.alloc(8);
        buf.writeDoubleLE(value, 0);
        this._parts.push(buf);
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public appendLREAL: (value: number) => void = this.appendDouble;


    /**
     * Appends the length and a string value.
     * @param value - The value to append
     */
    public appendString(value: string): void {
        const sizeBytes: number = 2;                // size of the string length field
        const neededBytes: number = sizeBytes + value.length;

        const buf: Buffer = Buffer.alloc(neededBytes);
        buf.writeUInt16LE(value.length, 0);
        buf.write(value, sizeBytes, value.length, "ascii");
        this._parts.push(buf);
    }

    /**
     * Appends the specified Buffer onto the end of this BufBuilder's contents.
     * @param buffer - The Buffer to be appended
     */
    public appendBuffer(buffer: Buffer): void {
        const copied: Buffer = Buffer.from(buffer);
        this._parts.push(copied);
    }

    /**
     * Appends the contents of the specified BufBuilder onto the end of this
     * BufBuilder's contents.
     * @param src - The data to be appended
     */
    public appendBufBuilder(src: BufBuilder): void {
        this._parts.push(src.toBuffer());
    }

    /**
     * Returns the contents of this BufBuilder as a Buffer.
     * @returns A Buffer containing the data from this BufBuilder.
     */
    public toBuffer(): Buffer {
        return Buffer.concat(this._parts);
    }

    public get length(): number {
        return _.reduce(this._parts, (accum, cur) => accum + cur.length, 0);
    }

}
Object.freeze(BufBuilder.prototype);


Object.freeze(exports);
