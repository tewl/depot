import * as _ from "lodash";
import {
    Duration, add, IntervalAbsolute, CompletedOccurrence, SkippedOccurrence,
    IntervalRelative
} from "./reminder";


describe("Duration", () => {


    describe("static", () => {


        describe("days()", () => {


            it("creates a Duration representing the specified number of days", () => {
                const duration = Duration.days(2);
                expect(duration.ms).toEqual(1000 * 60 * 60 * 24 * 2);
            });


        });

    });


    describe("instance", () => {


        describe("ms getter", () => {


            it("returns the expected value in milliseconds", () => {
                const duration = Duration.days(2);
                expect(duration.ms).toEqual(1000 * 60 * 60 * 24 * 2);
            });

        });


    });


});


describe("add()", () => {


    it("returns the expected Date", () => {
        const now = new Date();
        const tomorrow = add(now, Duration.days(1));
        expect(tomorrow.valueOf() - now.valueOf()).toEqual(Duration.days(1).ms);
    });


    it("returns the expected Date when the duration is negative", () => {
        const now = new Date();
        const yesterday = add(now, Duration.days(-1));
        expect(now.valueOf() - yesterday.valueOf()).toEqual(Duration.days(1).ms);
    });


});


describe("AbsoluteInterval", () => {

    describe("instance", () => {

        describe("getFutureOccurrences()", () => {


            it("returns the next n future occurences when there are no existing ones", () => {
                // Create a Date object representing the first of next month.
                const jan1 = new Date(2019, 0, 1);

                // An interval starting on Jan. 1, repeating every 2 days.
                const interval = new IntervalAbsolute(jan1, Duration.days(2));
                const futureOccurrences = interval.getFutureOccurrences(5);
                expect(futureOccurrences.length).toEqual(5);

                expect(futureOccurrences[0].toLocaleDateString("en-US")).toEqual("1/1/2019");
                expect(futureOccurrences[1].toLocaleDateString("en-US")).toEqual("1/3/2019");
                expect(futureOccurrences[2].toLocaleDateString("en-US")).toEqual("1/5/2019");
                expect(futureOccurrences[3].toLocaleDateString("en-US")).toEqual("1/7/2019");
                expect(futureOccurrences[4].toLocaleDateString("en-US")).toEqual("1/9/2019");
            });


            it("returns the next n future occurrences when there are existing completed occurrences", () => {
                // Create a Date object representing Jan. 1.
                const jan1 = new Date(2019, 0, 1);

                const interval = new IntervalAbsolute(jan1, Duration.days(2));
                interval.addOccurrence(new CompletedOccurrence(
                    jan1,
                    add(jan1, Duration.days(1)),
                    "Done.",
                    "Oops. This was done a day late."));
                const futureOccurrences = interval.getFutureOccurrences(5);
                expect(futureOccurrences.length).toEqual(5);
                expect(futureOccurrences[0].toLocaleDateString("en-US")).toEqual("1/3/2019");
                expect(futureOccurrences[1].toLocaleDateString("en-US")).toEqual("1/5/2019");
                expect(futureOccurrences[2].toLocaleDateString("en-US")).toEqual("1/7/2019");
                expect(futureOccurrences[3].toLocaleDateString("en-US")).toEqual("1/9/2019");
                expect(futureOccurrences[4].toLocaleDateString("en-US")).toEqual("1/11/2019");
            });


            it("returns the next n future occurrences when there are existing skipped occurrences", () => {
                // Create a Date object representing Jan. 1.
                const Jan1 = new Date(2019, 0, 1);

                const interval = new IntervalAbsolute(Jan1, Duration.days(2));
                const occurrence = new SkippedOccurrence(
                    Jan1,
                    add(Jan1, Duration.days(1)),
                    "Skipped. Don't need to do this occurrence.",
                    "This was recorded a day late.");
                interval.addOccurrence(occurrence);
                const futureOccurrences = interval.getFutureOccurrences(5);
                expect(futureOccurrences.length).toEqual(5);
                expect(futureOccurrences[0].toLocaleDateString("en-US")).toEqual("1/3/2019");
                expect(futureOccurrences[1].toLocaleDateString("en-US")).toEqual("1/5/2019");
                expect(futureOccurrences[2].toLocaleDateString("en-US")).toEqual("1/7/2019");
                expect(futureOccurrences[3].toLocaleDateString("en-US")).toEqual("1/9/2019");
                expect(futureOccurrences[4].toLocaleDateString("en-US")).toEqual("1/11/2019");
            });


            it("returns the next n future occurrences when there are existing completed and skipped occurrences and they are added out-of-order", () => {
                // Create a Date object representing Jan. 1.
                const jan1 = new Date(2019, 0, 1);
                const jan3 = new Date(2019, 0, 3);

                const interval = new IntervalAbsolute(jan1, Duration.days(2));

                // Note: We are intentionally adding these occurrences in the wrong
                // order to make sure they get sorted when added to the
                // AbsoluteInterval's internal collection.
                interval.addOccurrence(new CompletedOccurrence(
                    jan3,
                    jan3,
                    "Done.",
                    "Note text."));

                interval.addOccurrence(new SkippedOccurrence(
                    jan1,
                    jan1,
                    "Skipped. Don't need to do this occurrence.",
                    "Note text."));

                const futureOccurrences = interval.getFutureOccurrences(5);
                expect(futureOccurrences.length).toEqual(5);
                expect(futureOccurrences[0].toLocaleDateString("en-US")).toEqual("1/5/2019");
                expect(futureOccurrences[1].toLocaleDateString("en-US")).toEqual("1/7/2019");
                expect(futureOccurrences[2].toLocaleDateString("en-US")).toEqual("1/9/2019");
                expect(futureOccurrences[3].toLocaleDateString("en-US")).toEqual("1/11/2019");
                expect(futureOccurrences[4].toLocaleDateString("en-US")).toEqual("1/13/2019");
            });


        });
    });



});


fdescribe("RelativeInterval", () => {


    describe("instance", () => {


        describe("getFutureOccurrences()", () => {


            it("will base the next occurrence off of the previous CompletedOccurrence's actual completion", () => {
                const jan1     = new Date(2019, 0, 1);
                const jan2     = new Date(2019, 0, 2);
                const interval = new IntervalRelative(jan1, Duration.days(2));

                interval.addOccurrence(new CompletedOccurrence(jan1, jan2, "description", "notes"));

                const futureOccurrences = interval.getFutureOccurrences(5);

                expect(futureOccurrences.length).toEqual(5);
                expect(futureOccurrences[0].toLocaleDateString("en-US")).toEqual("1/4/2019");
                expect(futureOccurrences[1].toLocaleDateString("en-US")).toEqual("1/6/2019");
                expect(futureOccurrences[2].toLocaleDateString("en-US")).toEqual("1/8/2019");
                expect(futureOccurrences[3].toLocaleDateString("en-US")).toEqual("1/10/2019");
                expect(futureOccurrences[4].toLocaleDateString("en-US")).toEqual("1/12/2019");
            });


            it("will base the next occurence off of the previous SkippedOccurence's resolved date", () => {
                const jan1     = new Date(2019, 0, 1);
                const jan2     = new Date(2019, 0, 2);
                const interval = new IntervalRelative(jan1, Duration.days(2));

                interval.addOccurrence(new SkippedOccurrence(jan1, jan2, "description", "notes"));

                const futureOccurrences = interval.getFutureOccurrences(5);

                expect(futureOccurrences.length).toEqual(5);
                expect(futureOccurrences[0].toLocaleDateString("en-US")).toEqual("1/4/2019");
                expect(futureOccurrences[1].toLocaleDateString("en-US")).toEqual("1/6/2019");
                expect(futureOccurrences[2].toLocaleDateString("en-US")).toEqual("1/8/2019");
                expect(futureOccurrences[3].toLocaleDateString("en-US")).toEqual("1/10/2019");
                expect(futureOccurrences[4].toLocaleDateString("en-US")).toEqual("1/12/2019");
            });

        });


    });


});
