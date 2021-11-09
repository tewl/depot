import { Reporter } from "./reporter";

describe("reporter", () =>
{

    describe("constructor", () =>
    {

        it("creates a new instance", () =>
        {
            const inst = new Reporter();
            expect(inst).not.toBeUndefined();
        });

    });


    describe("log()", () =>
    {

        it("has no ill side effects when no listeners are registered", () =>
        {
            const reporter = new Reporter();
            reporter.log("hello world");
        });


        it("logs as expected when there is no indentation applied", () =>
        {
            let reportedText = "";
            const listener = (text: string) =>
            {
                reportedText = text;
            };

            const reporter = new Reporter();
            reporter.addListener(listener);

            reporter.log("hello world");
            expect(reportedText).toEqual("hello world");
        });


        it("logs as expected when there is indentation applied", () =>
        {
            let reportedText = "";
            const listener = (text: string) =>
            {
                reportedText = text;
            };

            const reporter = new Reporter();
            reporter.addListener(listener);
            reporter.pushIndentation(4);

            reporter.log("hello world");
            expect(reportedText).toEqual("    hello world");
        });


        it("logs as expected when there is indentation and a string with newlines is logged", () =>
        {
            let reportedText = "";
            const listener = (text: string) =>
            {
                reportedText = text;
            };

            const reporter = new Reporter();
            reporter.addListener(listener);
            reporter.pushIndentation(4);

            reporter.log("hello\nworld");
            expect(reportedText).toEqual("    hello\n    world");
        });


        it("logs as expected as indentation is pushed and popped", () =>
        {
            let reportedText = "";
            const listener = (text: string) =>
            {
                reportedText = text;
            };

            const reporter = new Reporter();
            reporter.addListener(listener);

            reporter.log("hello\nworld");
            expect(reportedText).toEqual("hello\nworld");

            reporter.pushIndentation(2);
            reporter.log("hello\nworld");
            expect(reportedText).toEqual("  hello\n  world");

            reporter.pushIndentation(2);
            reporter.log("hello\nworld");
            expect(reportedText).toEqual("    hello\n    world");

            reporter.popIndentation();
            reporter.log("hello\nworld");
            expect(reportedText).toEqual("  hello\n  world");

            reporter.popIndentation();
            reporter.log("hello\nworld");
            expect(reportedText).toEqual("hello\nworld");

            reporter.popIndentation();
            reporter.log("hello\nworld");
            expect(reportedText).toEqual("hello\nworld");
        });

    });


});
