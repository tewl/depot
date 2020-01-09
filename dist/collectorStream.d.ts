/// <reference types="node" />
/// <reference types="pouchdb-core" />
import { Transform } from "stream";
export declare class CollectorStream extends Transform {
    private _collected;
    private _flushedDeferred;
    constructor();
    _transform(chunk: Buffer | string, encoding: string, done: () => any): void;
    _flush(done: () => any): void;
    readonly collected: string;
    readonly flushedPromise: Promise<void>;
}
