/// <reference types="node" />
import { Readable, ReadableOptions } from "stream";
export declare class SourceStream extends Readable {
    private readonly _data;
    private _curIndex;
    constructor(data: Array<string> | string, opts?: ReadableOptions);
    _read(): void;
}
