/**
 * For a type T removes the optionality for each property name in TRequiredKeys.
 * TRequiredKeys can be a single property name or a union of property names.
 */
export type MakePropsRequired<T, TRequiredKeys extends keyof T> = {
  // All keys not in TRequiredKeys will remain as-is.
  [X in Exclude<keyof T, TRequiredKeys>]: T[X]
} & {
  // All keys in TRequiredKeys, will become required (i.e. lose their optionality).
  [P in TRequiredKeys]-?: T[P]
};


/**
 * For a type T removes null and undefined from the type for each property name
 * in TNonNullableKeys. TNonNullableKeys can be a single property name or a
 * union of property names.
 */
export type MakePropsNonNullable<T, TNonNullableKeys extends keyof T> = {
  // All keys not in TRequiredKeys will remain as-is.
  [X in Exclude<keyof T, TNonNullableKeys>]: T[X]
} & {
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
