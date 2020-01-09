/// <reference types="node" />
import { PassThrough, Stream } from "stream";
export declare class CombinedStream extends PassThrough {
    private readonly _streams;
    private _streamEnd;
    constructor(...streams: Array<Stream>);
    pipe<T extends NodeJS.WritableStream>(dest: T, options?: {
        end?: boolean;
    }): T;
}
