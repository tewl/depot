import { IndentingWriter, WriterFn } from "./indentingWriter";
import { EOL } from "os";

class TestWriter {

    private readonly _lines: Array<string> = [];


    public get lines(): Array<string> {
        return this._lines;
    }


    public write(str: string): void {
        this._lines.push(str);
    }
}


describe("IndentingWriter", () => {

    describe("instance", () => {


        describe("write()", () => {

            it("writes at level zero initially", () => {
                const testWriter = new TestWriter();
                const writer = new IndentingWriter((str) => testWriter.write(str));

                expect(writer.indentLevel).toEqual(0);
                writer.write("line 1");
                writer.write("line 2");
                writer.write("line 3");
                expect(testWriter.lines).toEqual([
                    "line 1",
                    "line 2",
                    "line 3"
                ]);
            });

        });


        describe("indent()", () => {

            it("causes the writer to increase the indent by the specified amount", () => {
                const testWriter = new TestWriter();
                const writer = new IndentingWriter((str) => testWriter.write(str));

                writer.write("line 1");
                writer.indent();
                writer.write("line 2");
                writer.indent();
                writer.write("line 3");
                expect(testWriter.lines).toEqual([
                    "line 1",
                    "    line 2",
                    "        line 3"
                ]);
            });


            it("causes the writer to increase the indent by the specified amount (multiline)", () => {
                const testWriter = new TestWriter();
                const writer = new IndentingWriter((str) => testWriter.write(str));

                writer.write(`line 1a${EOL}line 1b`);
                writer.indent();
                writer.write(`line 2a${EOL}line 2b`);
                writer.indent();
                writer.write(`line 3a${EOL}line 3b`);
                expect(testWriter.lines).toEqual([
                    "line 1a",
                    "line 1b",
                    "    line 2a",
                    "    line 2b",
                    "        line 3a",
                    "        line 3b"
                ]);

            });
        });


        describe("outdent()", () => {

            it("causes the writer to decrease the indent by the specified amount", () => {
                const testWriter = new TestWriter();
                const writer = new IndentingWriter((str) => testWriter.write(str));

                writer.indent();     // move to level 1
                writer.indent();     // move to level 2
                writer.write("line 1");
                writer.outdent();    // move to level 1
                writer.write("line 2");
                writer.outdent();    // move to level 0
                writer.write("line 3");
                expect(testWriter.lines).toEqual([
                    "        line 1",
                    "    line 2",
                    "line 3"
                ]);
            });


            it("causes the writer to decrease the indent by the specified amount (multiline EOL)", () => {
                const testWriter = new TestWriter();
                const writer = new IndentingWriter((str) => testWriter.write(str));

                writer.indent();     // move to level 1
                writer.indent();     // move to level 2
                writer.write(`line 1a${EOL}line 1b`);
                writer.outdent();    // move to level 1
                writer.write(`line 2a${EOL}line 2b`);
                writer.outdent();    // move to level 0
                writer.write(`line 3a${EOL}line 3b`);
                expect(testWriter.lines).toEqual([
                    "        line 1a",
                    "        line 1b",
                    "    line 2a",
                    "    line 2b",
                    "line 3a",
                    "line 3b"
                ]);

            });


            it("causes the writer to decrease the indent by the specified amount (multiline newline)", () => {
                const testWriter = new TestWriter();
                const writer = new IndentingWriter((str) => testWriter.write(str));

                writer.indent();     // move to level 1
                writer.indent();     // move to level 2
                writer.write(`line 1a\nline 1b`);
                writer.outdent();    // move to level 1
                writer.write(`line 2a\nline 2b`);
                writer.outdent();    // move to level 0
                writer.write(`line 3a\nline 3b`);
                expect(testWriter.lines).toEqual([
                    "        line 1a",
                    "        line 1b",
                    "    line 2a",
                    "    line 2b",
                    "line 3a",
                    "line 3b"
                ]);

            });


            it("will not outdent past level zero", () => {
                const testWriter = new TestWriter();
                const writer = new IndentingWriter((str) => testWriter.write(str));
                expect(writer.indentLevel).toEqual(0);
                writer.outdent();
                expect(writer.indentLevel).toEqual(0);
                writer.outdent();
                expect(writer.indentLevel).toEqual(0);
            });
        });


        describe("reset()", () => {


            it("resets the writer to indentation level zero", () => {
                const testWriter = new TestWriter();
                const writer = new IndentingWriter((str) => testWriter.write(str));
                expect(writer.indentLevel).toEqual(0);
                writer.indent();
                expect(writer.indentLevel).toEqual(1);
                writer.indent();
                expect(writer.indentLevel).toEqual(2);
                writer.reset();
                expect(writer.indentLevel).toEqual(0);
            });

        });

    });

});
