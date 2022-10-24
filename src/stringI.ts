import { CompareResult, compareStrI } from "./compare";
import { IEquatable } from "./equate";


/**
 * A string type that only performs case-insensitive comparisons.
 */
export class StringI implements IEquatable<StringI>, IEquatable<string> {

    private readonly _strVal: string;


    public constructor(str: string) {
        this._strVal = str;
    }


    public toString(): string {
        return this._strVal;
    }


    public equals(other: StringI | string): boolean {
        if (other instanceof StringI) {
            return compareStrI(this._strVal, other._strVal) === CompareResult.EQUAL;
        }
        else {
            return compareStrI(this._strVal, other) === CompareResult.EQUAL;
        }
    }


}
