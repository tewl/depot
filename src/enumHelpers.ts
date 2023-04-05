import * as _ from "lodash";


/**
 * Gets a random key from a number based enumeration
 * @param enumObject - The enumeration to choose a key from
 * @return A key from the specified enumeration
 */
export function numericEnumRandomKey<T extends Record<string, unknown>>(enumObject: T): keyof T {
    const allKeys: Array<keyof T> = Object.keys(enumObject) as Array<keyof T>;

    // Numeric enumerations contain "reverse mappings" where the key is the
    // string version of the number and the value is the string version of the
    // key.  Get rid of those.
    const normalKeys: Array<keyof T> = allKeys.filter((curKey) => {
        return typeof (enumObject[curKey]) === "number";
    });
    return normalKeys[_.random(normalKeys.length - 1)];
}


/**
 * Gets a random value from a number based enumeration
 * @param enumObject - The enumeration to choose a value from
 * @return A value from the specified enumeration
 */
export function numericEnumRandomValue<T extends Record<string, unknown>>(enumObject: T): T[keyof T] {
    return enumObject[numericEnumRandomKey(enumObject)];
}


/**
 * Gets a random key from a string based enumeration
 * @param enumObject - The enumeration to choose a key from
 * @return A key from the specified enumeration
 */
export function stringEnumRandomKey<T extends Record<string, unknown>>(enumObject: T): keyof T {
    const allKeys: Array<keyof T> = Object.keys(enumObject) as Array<keyof T>;
    return allKeys[_.random(allKeys.length - 1)];
}


/**
 * Gets a random value from a string based enumeration
 * @param enumObject - The enumeration to choose a value from
 * @return A value from the specified enumeration
 */
export function stringEnumRandomValue<T extends Record<string, unknown>>(enumObject: T): T[keyof T] {
    return enumObject[stringEnumRandomKey(enumObject)];
}


/**
 * Converts an enumeration value to its key (as a string) in a type safe manner
 * @param enumObject - The enumeration
 * @param val - The value to convert
 * @return The key of the enumeration that has the specified value
 */
export function numericEnumValToString<T>(enumObject: T, val: T[keyof T]): string {
    // Leverage the fact that the TS compiler puts the reverse mappings in
    // the generated enumeration object too.  These reverse mappings have a key
    // that is the value and a value that is the string symbol name.
    return (enumObject as any)[val];  // eslint-disable-line @typescript-eslint/no-explicit-any
}
