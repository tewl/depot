/**
 * Gets a random key from a number based enumeration
 * @param enumObject - The enumeration to choose a key from
 * @return A key from the specified enumeration
 */
export declare function numericEnumRandomKey<T>(enumObject: T): keyof T;
/**
 * Gets a random value from a number based enumeration
 * @param enumObject - The enumeration to choose a value from
 * @return A value from the specified enumeration
 */
export declare function numericEnumRandomValue<T>(enumObject: T): T[keyof T];
/**
 * Gets a random key from a string based enumeration
 * @param enumObject - The enumeration to choose a key from
 * @return A key from the specified enumeration
 */
export declare function stringEnumRandomKey<T>(enumObject: T): keyof T;
/**
 * Gets a random value from a string based enumeration
 * @param enumObject - The enumeration to choose a value from
 * @return A value from the specified enumeration
 */
export declare function stringEnumRandomValue<T>(enumObject: T): T[keyof T];
/**
 * Converts an enumeration value to its key (as a string) in a type safe manner
 * @param enumObject - The enumeration
 * @param val - The value to convert
 * @return The key of the enumeration that has the specified value
 */
export declare function numericEnumValToString<T>(enumObject: T, val: T[keyof T]): string;
