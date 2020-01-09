/// <reference types="node" />
/// <reference types="pouchdb-core" />
import { Transform } from "stream";
export declare class PrefixStream extends Transform {
    private readonly _prefixBuf;
    private _partial;
    private _flushedDeferred;
    constructor(prefix: string);
    _transform(chunk: Buffer | string, encoding: string, done: () => any): void;
    _flush(done: () => any): void;
    readonly prefix: string;
    readonly flushedPromise: Promise<void>;
}
