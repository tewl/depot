export function strMapToObj<TValue>(strMap: Map<string, TValue>): {[key: string]: TValue} {
    const obj: {[key: string]: TValue} = Object.create(null);
    for (const [k, v] of strMap) {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}


export function objToStrMap<TValue>(obj: {[key: string]: TValue}): Map<string, TValue> {
    const strMap = new Map<string, TValue>();
    for (const k of Object.keys(obj)) {
        strMap.set(k, obj[k]);
    }
    return strMap;
}


export function strMapToJson(
    strMap: Map<string, unknown>,
    replacer?: (this: any, key: string, value: any) => any,    // eslint-disable-line @typescript-eslint/no-explicit-any
    space?: string | number
): string {
    return JSON.stringify(strMapToObj(strMap), replacer, space);
}


export function jsonToStrMap<TValue>(jsonStr: string): Map<string, TValue> {
    return objToStrMap(JSON.parse(jsonStr));
}


/**
 * Converts a Map to a map that has string keys.  This is needed before
 * converting the map to a string-keyed map and to JSON.
 * @param srcMap - The map to be converted.
 * @param keyMapper - A function that will be invoked with each key from
 * _srcMap_ that returns the new string key.
 * @return The new Map.
 */
export function mapToStrMap<TKey, TValue>(
    srcMap: Map<TKey, TValue>,
    keyMapper: (key: TKey) => string
): Map<string, TValue> {
    const destMap = new Map<string, TValue>();
    for (const [key, value] of srcMap) {
        const newKey = keyMapper(key);
        destMap.set(newKey, value);
    }
    return destMap;
}


/**
 * Converts a map to a JSON string.
 * @param srcMap - The map to be converted.
 * @param keyMapper - A function that will be invoked with each key from
 * @param replacer - Replacer function.
 * @param space - JSON indentation.
 * @return Description
 */
export function mapToJson<TKey, TValue>(
    srcMap: Map<TKey, TValue>,
    keyMapper: (key: TKey) => string,
    replacer?: (this: any, key: string, value: any) => any,  // eslint-disable-line @typescript-eslint/no-explicit-any
    space?: string | number
): string {
    const strMap = mapToStrMap(srcMap, keyMapper);
    const obj = strMapToObj(strMap);
    const json = JSON.stringify(obj, replacer, space);
    return json;
}
