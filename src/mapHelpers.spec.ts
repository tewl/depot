import { objToStrMap, strMapToObj, strMapToJson, jsonToStrMap, mapToStrMap, mapToJson } from "./mapHelpers";


describe("strMapToObj()", () =>
{

    it("converts to the expected object", () =>
    {
        const map = new Map<string, number>();
        map.set("three", 3);
        map.set("five", 5);
        const obj = strMapToObj(map);
        expect(obj).toEqual({three: 3, five: 5});
    });

});


describe("objToStrMap()", () =>
{

    it("converts to the expected map", () =>
    {
        const obj = {two: 2, six: 6, nine: 9};
        const map = objToStrMap(obj);
        expect(map.size).toEqual(3);
        expect(map.get("two")).toEqual(2);
        expect(map.get("six")).toEqual(6);
        expect(map.get("nine")).toEqual(9);
    });

});


describe("strMapToJson()", () =>
{

    it("converts to the expected JSON string", () =>
    {
        const map = new Map<string, number>();
        map.set("three", 3);
        map.set("five", 5);
        expect(strMapToJson(map)).toEqual('{"three":3,"five":5}');
    });

});


describe("jsonToStrMap()", () =>
{

    it("converts to the expected map", () =>
    {
        const map = jsonToStrMap('{"three":3,"five":5}');
        expect(map.size).toEqual(2);
        expect(map.get("three")).toEqual(3);
        expect(map.get("five")).toEqual(5);
    });

});


describe("mapToStrMap()", () =>
{

    it("converts to the expected map", () =>
    {
        const srcMap = new Map<number, number>();
        srcMap.set(3, 3);
        srcMap.set(5, 5);

        const destMap = mapToStrMap(srcMap, (num) => num.toString());
        expect(destMap.size).toEqual(2);
        expect(destMap.get("3")).toEqual(3);
        expect(destMap.get("5")).toEqual(5);
    });

});


describe("mapToJson()", () =>
{

    it("converts to the expected JSON", () =>
    {
        const map = new Map<number, number>();
        map.set(2, 3);
        map.set(4, 5);

        const actual = mapToJson(map, (curKey) => curKey.toString(), undefined, 4);
        expect(actual).toEqual(`{\n    "2": 3,\n    "4": 5\n}`);
    });

});
