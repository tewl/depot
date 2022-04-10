/**
 * For a type T adds optionality for each property name in TRequiredKeys.
 * TRequiredKeys can be a single property name or a union of property names.
 */
export type MakePropsOptional<T, TOptionalKeys extends keyof T> =
    // Pick all keys not in TOptionalKeys so they are left as-is.
    Pick<T, Exclude<keyof T, TOptionalKeys>> &
    {
        // All keys in TOptionalKeys, will become optional.
        [P in TOptionalKeys]?: T[P]
    };


/**
 * For a type T removes the optionality for each property name in TRequiredKeys.
 * TRequiredKeys can be a single property name or a union of property names.
 */
export type MakePropsRequired<T, TRequiredKeys extends keyof T> =
    // Pick all keys not in TRequiredKeys so they are left as-is.
    Pick<T, Exclude<keyof T, TRequiredKeys>> &
    {
        // All keys in TRequiredKeys, will become required (i.e. lose their optionality).
        [P in TRequiredKeys]-?: T[P]
    };


/**
 * For a type T removes null and undefined from the type for each property name
 * in TNonNullableKeys. TNonNullableKeys can be a single property name or a
 * union of property names.
 */
export type MakePropsNonNullable<T, TNonNullableKeys extends keyof T> =
    // Pick all keys not in TNonNullableKeys so they are left as-is.
    Pick<T, Exclude<keyof T, TNonNullableKeys>> &
    {
        // All keys in TNonNullableKeys, will become non-nullable.
        [P in TNonNullableKeys]: NonNullable<T[P]>
    };


/**
 * For a type T, makes each of the specified properties required and
 * non-nullable. TNonNullableRequiredKeys can be a single property name or a
 * union of property names.
 */
export type MakePropsNonNullableAndRequired<T, TNonNullableRequiredKeys extends keyof T> =
    MakePropsNonNullable<
        MakePropsRequired<T, TNonNullableRequiredKeys>,
        TNonNullableRequiredKeys
    >;


/**
 * For a type T, makes all properties optional (recursively).  This includes all
 * fields, properties and methods.
 */
export type RecursivePartial<T> = {
    [P in keyof T]?: RecursivePartial<T[P]>
};


/**
 * Convenience function that casts a partial object to the full type.  This
 * function should not be used in production code, because use of the returned
 * value as a T is unsafe.  It may, however, be useful when creating stubs
 * within unit tests.
 *
 * @param partial - The partial object containing some properties of T.
 * @returns The partial object casted as T
 */
export function createStub<T>(partial: RecursivePartial<T>): T {
    return partial as T;
}
