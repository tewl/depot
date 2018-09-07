import {PassThrough, Readable, Writable, Stream} from "stream";

export class CombinedStream extends PassThrough
{
    private readonly _streams: Array<Stream>;
    private _streamEnd: Stream | undefined;

    constructor(...streams: Array<Stream>)
    {
        super();
        this._streams = streams;

        this.on("pipe", (source: Readable) => {
            source.unpipe(this);

            let streamEnd: Stream = source;

            for (const curStream of this._streams)
            {
                streamEnd = streamEnd.pipe(curStream as Writable);
            }

            this._streamEnd = streamEnd;
        });
    }

    public pipe<T extends NodeJS.WritableStream>(dest: T, options?: { end?: boolean; }): T
    {
        if (!this._streamEnd) {
            throw new Error("Internal error: combinedStream.pipe() called before 'pipe' event.");
        }
        return this._streamEnd.pipe(dest, options);
    }

}
