// tslint:disable:max-classes-per-file

import Long from "long";
import * as _ from "lodash";
import {BufReader} from "./bufReader";


/**
 * @classdesc A class for representing signed long (64-bit) integers
 *
 * This class uses the "long" npm library.  It is wrapped here to
 * differentiate between signed and unsigned values.
 */
export class Lint {

    public static minValue: Lint = new Lint(Long.MIN_VALUE);
    public static maxValue: Lint = new Lint(Long.MAX_VALUE);


    public static fromBuffer(buf: Buffer, offset: number = 0): Lint | undefined {
        const lastIndexToRead = offset + 8 - 1;
        if (lastIndexToRead > buf.length - 1) {
            return undefined;
        }

        const littleEndianBytes = _.map(_.range(8), (curIndex) => {
            return buf.readUInt8(offset + curIndex);
        });

        const val = Long.fromBytesLE(littleEndianBytes, false);
        return new Lint(val);
    }


    public static fromBufReader(reader: BufReader): Lint | undefined {
        if (reader.numBytesRemaining() < 8) {
            return undefined;
        }

        const littleEndianBytes = _.map(_.range(8), () => {
            return reader.readUInt8();
        });

        const val = Long.fromBytesLE(littleEndianBytes, false);
        return new Lint(val);
    }


    public static fromBytesLE(bytes: Array<number>): Lint | undefined {
        const val = Long.fromBytesLE(bytes, false);
        return new Lint(val);
    }


    // region Data Members
    private readonly _value: Long;
    // endregion


    private constructor(value: Long) {
        if (value.unsigned) {
            throw new Error("Lint internal error.  Attempted to construct with an unsigned value.");
        }

        this._value = value;

        // Make this instance immutable.
        Object.freeze(this);
    }


    public toString(radix: number = 10): string {
        return this._value.toString(radix);
    }

    public toNumber(): number {
        return this._value.toNumber();
    }


    public toBuffer(): Buffer {
        const bytes = this._value.toBytesLE();
        return Buffer.from(bytes);
    }


}

Object.freeze(Lint.prototype);
Object.freeze(Lint);


/**
 * @classdesc A class for representing unsigned long (64-bit) integers
 *
 * This class uses the "long" npm library.  It is wrapped here to
 * differentiate between signed and unsigned values.
 */
export class Ulint {

    public static minValue: Ulint = new Ulint(Long.UZERO);
    public static maxValue: Ulint = new Ulint(Long.MAX_UNSIGNED_VALUE);


    public static fromBuffer(buf: Buffer, offset: number = 0): Ulint | undefined {
        const lastIndexToRead = offset + 8 - 1;
        if (lastIndexToRead > buf.length - 1) {
            return undefined;
        }

        const littleEndianBytes = _.map(_.range(8), (curIndex) => {
            return buf.readUInt8(offset + curIndex);
        });

        const val = Long.fromBytesLE(littleEndianBytes, true);
        return new Ulint(val);
    }


    public static fromBufReader(reader: BufReader): Ulint | undefined {
        if (reader.numBytesRemaining() < 8) {
            return undefined;
        }

        const littleEndianBytes = _.map(_.range(8), () => {
            return reader.readUInt8();
        });

        const val = Long.fromBytesLE(littleEndianBytes, true);
        return new Ulint(val);
    }


    public static fromBytesLE(bytes: Array<number>): Ulint | undefined {
        const val = Long.fromBytesLE(bytes, true);
        return new Ulint(val);
    }


    // region Data Members
    private readonly _value: Long;
    // endregion


    private constructor(value: Long) {
        if (!value.unsigned) {
            throw new Error("Ulint internal error.  Attempted to construct with a signed value.");
        }

        this._value = value;

        // Make this instance immutable.
        Object.freeze(this);
    }


    public toString(radix: number = 10): string {
        return this._value.toString(radix);
    }


    public toBuffer(): Buffer {
        const bytes = this._value.toBytesLE();
        return Buffer.from(bytes);
    }

}

Object.freeze(Ulint.prototype);
Object.freeze(Ulint);


Object.freeze(exports);
