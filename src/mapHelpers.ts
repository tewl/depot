export function strMapToObj<TValue>(strMap: Map<string, TValue>): {[key: string]: TValue}
{
    const obj: {[key: string]: TValue} = Object.create(null);
    for (const [k, v] of strMap)
    {
        // We don’t escape the key '__proto__'
        // which can cause problems on older engines
        obj[k] = v;
    }
    return obj;
}


export function objToStrMap<TValue>(obj: {[key: string]: TValue}): Map<string, TValue>
{
    const strMap = new Map<string, TValue>();
    for (const k of Object.keys(obj))
    {
        strMap.set(k, obj[k]);
    }
    return strMap;
}


export function strMapToJson(
    strMap: Map<string, unknown>,
    replacer?: (this: any, key: string, value: any) => any,
    space?: string | number
): string
{
    return JSON.stringify(strMapToObj(strMap), replacer, space);
}


export function jsonToStrMap<TValue>(jsonStr: string): Map<string, TValue>
{
    return objToStrMap(JSON.parse(jsonStr));
}
