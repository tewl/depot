export enum CompareResult {
    LESS    = -1,
    EQUAL   = 0,
    GREATER = 1
}


export type CompareFunc<T> = (a: T, b: T) => CompareResult;
