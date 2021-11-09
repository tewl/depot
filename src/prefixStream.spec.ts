import {PrefixStream} from "./prefixStream";
import {SourceStream} from "./sourceStream";
import {CollectorStream} from "./collectorStream";


describe("PrefixStream", () =>
{

    it("is creatable", () =>
    {
        const ps = new PrefixStream("prefix");
        expect(ps).toBeTruthy();
    });


    it("prefixes each line when the line endings are posix style (\\n)", (done) =>
    {
        const sourceStream = new SourceStream("a\nb\nc\n");
        const prefixStream = new PrefixStream("prefix");
        const collectorStream = new CollectorStream();

        sourceStream
        .pipe(prefixStream)
        .pipe(collectorStream);

        collectorStream.on("finish", () =>
        {
            expect(collectorStream.collected).toEqual("[prefix] a\n[prefix] b\n[prefix] c\n");
            done();
        });
    });


    it("prefixes each line when the line endings are Windows style (\\r\\n)", (done) =>
    {
        const sourceStream = new SourceStream("a\r\nb\r\nc\r\n");
        const prefixStream = new PrefixStream("prefix");
        const collectorStream = new CollectorStream();

        sourceStream
        .pipe(prefixStream)
        .pipe(collectorStream);

        collectorStream.on("finish", () =>
        {
            expect(collectorStream.collected).toEqual("[prefix] a\r\n[prefix] b\r\n[prefix] c\r\n");
            done();
        });
    });


    it("provides the prefix label that will be prepended to each line", () =>
    {
        const prefixStream = new PrefixStream("the prefix");
        expect(prefixStream.prefix).toEqual("[the prefix] ");
    });


});
