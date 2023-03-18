import { dateRange, dayOfWeek } from "./dateHelpers";


describe("dayOfWeek()", () => {

    it("correctly calculates each day of the week", () => {

        const sun = new Date(2023, 2, 19);
        expect(dayOfWeek(sun)).toEqual("Sunday");

        const mon = new Date(2023, 2, 20);
        expect(dayOfWeek(mon)).toEqual("Monday");

        const tues = new Date(2023, 2, 21);
        expect(dayOfWeek(tues)).toEqual("Tuesday");

        const wed = new Date(2023, 2, 22);
        expect(dayOfWeek(wed)).toEqual("Wednesday");

        const thurs = new Date(2023, 2, 23);
        expect(dayOfWeek(thurs)).toEqual("Thursday");

        const fri = new Date(2023, 2, 24);
        expect(dayOfWeek(fri)).toEqual("Friday");

        const sat = new Date(2023, 2, 25);
        expect(dayOfWeek(sat)).toEqual("Saturday");
    });
});


describe("dateRange()", () => {

    it("produces an empty array when the start is later than the end", () => {
        const start = new Date(2023, 2, 22);
        const end = new Date(2023, 2, 21);
        expect(Array.from(dateRange(start, end))).toEqual([]);
    });


    it("produces an empty array when the start and end are equal", () => {
        const start = new Date(2023, 2, 22);
        const end = new Date(2023, 2, 22);
        expect(Array.from(dateRange(start, end))).toEqual([]);
    });


    it("produces the expected Dates when start and end are legal", () => {
        const start = new Date(2023, 2, 19);
        const end = new Date(2023, 2, 26);
        expect(Array.from(dateRange(start, end))).toEqual([
            new Date(2023, 2, 19),
            new Date(2023, 2, 20),
            new Date(2023, 2, 21),
            new Date(2023, 2, 22),
            new Date(2023, 2, 23),
            new Date(2023, 2, 24),
            new Date(2023, 2, 25),
        ]);
    });

});
