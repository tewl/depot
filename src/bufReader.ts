/**
 * Facilitates the reading of data from a Buffer.
 */
import {Lint, Ulint} from "./lint";

export class BufReader {

    private _curIndex: number = 0;
    private readonly _theBuffer: Buffer;

    /**
     * Creates a new BufReader.
     * @param theBuffer - the Buffer to be read
     */
    public constructor(theBuffer: Buffer) {
        this._theBuffer = theBuffer;
        Object.seal(this);
    }

    /**
     * Returns the first byte of data where the BufReader is pointing in the Buffer
     * for inspection without affecting the BufReader
     * @return Byte
     */
    public inspectNextByte(): number | undefined {
        // make sure it's a buffer with data
        if (this._theBuffer.length > 0) {
            // if this._curIndex is beyond the length of the Buffer, undefined will be returned
            return this._theBuffer[this._curIndex];
        }
        else {
            return undefined;
        }
    }

    /**
     * Reads the next byte of data and returns it as a 1 or 0.  This is how
     * Studio 5000 displays BOOL values.
     * @return 0 for false; 1 for true
     */
    public readBOOL(): 0 | 1 {
        const value = this.readUInt8();
        // 0                => 0
        // all other values => 1
        return value === 0 ? 0 : 1;
    }

    /**
     * Reads the next byte of data from the Buffer as an unsigned 8-bit value.
     * @returns The value read
     */
    public readUInt8(): number {
        const value: number = this._theBuffer.readUInt8(this._curIndex);
        this._curIndex += 1;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readUSINT: () => number = this.readUInt8;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readBYTE:  () => number = this.readUInt8;

    /**
     * Reads the next byte of data from the Buffer as a signed 8-bit value.
     * @returns The value read
     */
    public readInt8(): number {
        const value: number = this._theBuffer.readInt8(this._curIndex);
        this._curIndex += 1;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readSINT: () => number = this.readInt8;

    /**
     * Reads the next two bytes of data from the Buffer as an unsigned 16-bit
     * value.
     * @returns The value read
     */
    public readUInt16(): number {
        const value: number = this._theBuffer.readUInt16LE(this._curIndex);
        this._curIndex += 2;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readUINT: () => number = this.readUInt16;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readWORD: () => number = this.readUInt16;

    /**
     * Reads the next two bytes of data from the Buffer as an unsigned 16-bit big
     * endian value.
     * @returns The value read
     */
    public readUInt16BE(): number {
        const value: number = this._theBuffer.readUInt16BE(this._curIndex);
        this._curIndex += 2;
        return value;
    }

    /**
     * Reads the next two bytes of data from the Buffer as a signed 16-bit
     * value.
     * @returns The value read
     */
    public readInt16(): number {
        const value: number = this._theBuffer.readInt16LE(this._curIndex);
        this._curIndex += 2;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readINT: () => number = this.readInt16;

    /**
     * Reads the next four bytes of data from the Buffer as an unsigned 32-bit
     * value
     * @returns The value read
     */
    public readUInt32(): number {
        const value: number = this._theBuffer.readUInt32LE(this._curIndex);
        this._curIndex += 4;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readUDINT: () => number = this.readUInt32;
    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readDWORD: () => number = this.readUInt32;

    /**
     * Reads the next four bytes of data from the Buffer as an unsigned 32-bit
     * big endian value
     * @returns The value read
     */
    public readUInt32BE(): number {
        const value: number = this._theBuffer.readUInt32BE(this._curIndex);
        this._curIndex += 4;
        return value;
    }

    /**
     * Reads the next four bytes of data from the Buffer as a signed 32-bit
     * value
     * @returns The value read
     */
    public readInt32(): number {
        const value: number = this._theBuffer.readInt32LE(this._curIndex);
        this._curIndex += 4;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readDINT: () => number = this.readInt32;

    /**
     * Reads the next 8 bytes of data from the Buffer as an unsigned 64-bit value.
     * @returns The value read
     */
    public readUInt64(): Ulint {
        const value = Ulint.fromBuffer(this._theBuffer, this._curIndex);
        if (!value) {
            throw new Error("Failed to read UInt64 value from Buffer.");
        }
        this._curIndex += 8;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readULINT: () => Ulint = this.readUInt64;


    /**
     * Reads the next 8 bytes of data from the Buffer as a signed 64-bit value.
     * @returns The value read
     */
    public readInt64(): Lint {
        const value = Lint.fromBuffer(this._theBuffer, this._curIndex);
        if (!value) {
            throw new Error("Failed to read Int64 value from Buffer.");
        }
        this._curIndex += 8;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readLINT: () => Lint = this.readInt64;


    public readFloat(): number {
        const value: number = this._theBuffer.readFloatLE(this._curIndex);
        this._curIndex += 4;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readREAL: () => number = this.readFloat;


    public readDouble(): number {
        const value = this._theBuffer.readDoubleLE(this._curIndex);
        this._curIndex += 8;
        return value;
    }

    // eslint-disable-next-line @typescript-eslint/member-ordering
    public readLREAL: () => number = this.readDouble;


    /**
     * Reads a short string from the current location in the Buffer.
     * @returns The string that was read.
     */
    public readShortString(): string {
        const numChars: number = this.readUInt8();
        const str: string = this._theBuffer.toString("ascii", this._curIndex, this._curIndex + numChars);
        this._curIndex += numChars;
        return str;
    }


    /**
     * Reads a string from the current location in the Buffer.
     * @returns The string that was read.
     */
    public readString(): string {
        const numChars: number = this.readUInt16();
        const str: string = this._theBuffer.toString("ascii", this._curIndex, this._curIndex + numChars);
        this._curIndex += numChars;
        return str;
    }


    /**
     * Reads the specified number of characters from the Buffer.
     * @param numChars - Number of characters to read
     * @returns The string that was read.
     */
    public readFixedLengthString(numChars: number): string {
        const str: string = this._theBuffer.toString("ascii", this._curIndex, this._curIndex + numChars);
        this._curIndex += numChars;
        return str;
    }


    /**
     * Reads the specified number of bytes (or all remaining bytes) at the
     * current location in the Buffer.
     * @param numBytes - The number of bytes to read.  If undefined, all
     * remaining bytes will be read.  If greater than the number of bytes
     * remaining, only the remaining bytes will be read.
     * @return A Buffer containing the specified bytes
     */
    public readBytes(numBytes?: number): Buffer {

        // If not specified, the number of bytes to read will be the number of
        // bytes left in the source buffer.
        if (numBytes === undefined) {
            numBytes = this._theBuffer.length - this._curIndex;
        }
        let endIndex: number = this._curIndex + numBytes;

        // If the caller has specified that we read more bytes than what remains
        // in the source buffer, adjust the ending index.
        endIndex = Math.min(endIndex, this._theBuffer.length);

        const readBuf: Buffer = this._theBuffer.slice(this._curIndex, endIndex);
        this._curIndex = endIndex;
        return readBuf;
    }

    /**
     * Returns the number of bytes that have not been read.
     * @returns The number of bytes that have not been read.
     */
    public numBytesRemaining(): number {
        return this._theBuffer.length - this._curIndex;
    }


    /**
     * Tells the caller whether all data has been read out of the source buffer.
     * @returns true if all data has been read out of the source buffer.  false
     *     if there is still data to be read.
     */
    public atEnd(): boolean {
        return this._curIndex >= this._theBuffer.length;
    }
}
Object.freeze(BufReader.prototype);


Object.freeze(exports);
