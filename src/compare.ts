export enum CompareResult {
    LESS    = -1,  // First item is less, or this instance is less
    EQUAL   = 0,   // The instances are equal
    GREATER = 1    // Second item is less, or this instance is greater
}


export type CompareFunc<T> = (a: T, b: T) => CompareResult;


export interface IComparable<T> {
    compareTo(other: T): CompareResult;
}
