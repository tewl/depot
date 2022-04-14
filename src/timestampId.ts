import { generateUuid, UuidFormat } from "./uuid";
import { CompareResult } from "./compare";
import { IEquatable } from "./equate";


export class TimestampId implements IEquatable<TimestampId> {
    public static create(): TimestampId {
        return new TimestampId(Date.now(), generateUuid(UuidFormat.N));
    }


    public static fromParts(timestamp: number, uuid: string): TimestampId {
        return new TimestampId(timestamp, uuid);
    }


    private readonly _timestamp: number;
    private readonly _uuid: string;


    private constructor(timestamp: number, uuid: string) {
        this._timestamp = timestamp;
        this._uuid      = uuid;

        // Enforce immutability.
        Object.freeze(this);
    }


    public get timestamp(): number {
        return this._timestamp;
    }


    public get uuid(): string {
        return this._uuid;
    }


    public equals(other: TimestampId): boolean {
        return this._timestamp === other._timestamp &&
               this._uuid      === other._uuid;
    }
}


export function compareTimestampIds(a: TimestampId, b: TimestampId): CompareResult {
    if (a.timestamp < b.timestamp) {
        return CompareResult.LESS;
    }
    else if (a.timestamp > b.timestamp) {
        return CompareResult.GREATER;
    }
    else {
        if (a.uuid < b.uuid) {
            return CompareResult.LESS;
        }
        else if (a.uuid === b.uuid) {
            return CompareResult.EQUAL;
        }
        else {
            return CompareResult.GREATER;
        }
    }
}
