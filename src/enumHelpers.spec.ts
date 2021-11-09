import * as _ from "lodash";
import {
    numericEnumRandomKey,
    numericEnumRandomValue,
    stringEnumRandomKey,
    stringEnumRandomValue,
    numericEnumValToString
} from "./enumHelpers";


enum Color {
    RED = 1,
    GREEN,
    BLUE
}


enum DayOfWeek {
    SUNDAY    = "Sunday",
    MONDAY    = "Monday",
    TUESDAY   = "Tuesday",
    WEDNESDAY = "Wednesday",
    THURSDAY  = "Thursday",
    FRIDAY    = "Friday",
    SATURDAY  = "Saturday"
}

describe("numericEnumRandomKey()", () =>
{

    it("will return a random sampling of the enumeration's keys", () =>
    {
        const groups = _.groupBy(_.range(100), () => numericEnumRandomKey(Color));

        expect(Object.keys(groups).length).toEqual(3);
        expect(groups.RED.length).toBeGreaterThan(0);
        expect(groups.GREEN.length).toBeGreaterThan(0);
        expect(groups.BLUE.length).toBeGreaterThan(0);
    });


});


describe("numericEnumRandomValue()", () =>
{

    it("will return a random sampling of the enumeration's values", () =>
    {
        const groups = _.groupBy(_.range(100), () => numericEnumRandomValue(Color));

        expect(Object.keys(groups).length).toEqual(3);
        expect(groups["1"].length).toBeGreaterThan(0);
        expect(groups["2"].length).toBeGreaterThan(0);
        expect(groups["3"].length).toBeGreaterThan(0);
    });


});


describe("stringEnumRandomKey()", () =>
{

    it("description", () =>
    {
        const groups = _.groupBy(_.range(100), () => stringEnumRandomKey(DayOfWeek));

        expect(Object.keys(groups).length).toEqual(7);
        expect(groups.SUNDAY.length).toBeGreaterThan(0);
        expect(groups.MONDAY.length).toBeGreaterThan(0);
        expect(groups.TUESDAY.length).toBeGreaterThan(0);
        expect(groups.WEDNESDAY.length).toBeGreaterThan(0);
        expect(groups.THURSDAY.length).toBeGreaterThan(0);
        expect(groups.FRIDAY.length).toBeGreaterThan(0);
        expect(groups.SATURDAY.length).toBeGreaterThan(0);
    });


});


describe("stringEnumRandomValue()", () =>
{

    it("will return a random sampling of the enumeration's values", () =>
    {
        const groups = _.groupBy(_.range(100), () => stringEnumRandomValue(DayOfWeek));

        expect(Object.keys(groups).length).toEqual(7);
        expect(groups.Sunday.length).toBeGreaterThan(0);
        expect(groups.Monday.length).toBeGreaterThan(0);
        expect(groups.Tuesday.length).toBeGreaterThan(0);
        expect(groups.Wednesday.length).toBeGreaterThan(0);
        expect(groups.Thursday.length).toBeGreaterThan(0);
        expect(groups.Friday.length).toBeGreaterThan(0);
        expect(groups.Saturday.length).toBeGreaterThan(0);
    });


});


describe("numericEnumValToString()", () =>
{

    it("wil convert an enumeration's values to their string keys", () =>
    {
        expect(numericEnumValToString(Color, Color.RED)).toEqual("RED");
        expect(numericEnumValToString(Color, Color.GREEN)).toEqual("GREEN");
        expect(numericEnumValToString(Color, Color.BLUE)).toEqual("BLUE");
    });


});
