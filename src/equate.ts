/**
 * Interface to be implemented by a type that is equatable with the type T.
 * Multiple specializations can be implemented if the type is equatable with
 * multiple other types.  Suitable for value objects to implement.
 */
export interface IEquatable<T> {
    equals(other: T): boolean;
}
