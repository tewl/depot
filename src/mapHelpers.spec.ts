import { objToStrMap, strMapToObj, strMapToJson, jsonToStrMap } from "./mapHelpers";


describe("strMapToObj()", () => {

    it("converts to the expected object", () => {
        const map = new Map<string, number>();
        map.set("three", 3);
        map.set("five", 5);
        const obj = strMapToObj(map);
        expect(obj).toEqual({three: 3, five: 5});
    });

});


describe("objToStrMap()", () => {

    it("converts to the expected map", () => {
        const obj = {two: 2, six: 6, nine: 9};
        const map = objToStrMap(obj);
        expect(map.size).toEqual(3);
        expect(map.get("two")).toEqual(2);
        expect(map.get("six")).toEqual(6);
        expect(map.get("nine")).toEqual(9);
    });

});


describe("strMapToJson()", () => {

    it("converts to the expected JSON string", () => {
        const map = new Map<string, number>();
        map.set("three", 3);
        map.set("five", 5);
        expect(strMapToJson(map)).toEqual('{"three":3,"five":5}');
    });

});


describe("jsonToStrMap()", () => {

    it("converts to the expected map", () => {
        const map = jsonToStrMap('{"three":3,"five":5}');
        expect(map.size).toEqual(2);
        expect(map.get("three")).toEqual(3);
        expect(map.get("five")).toEqual(5);
    });

});
