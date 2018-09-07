import {Transform} from "stream";
import {Deferred} from "./deferred";


export class CollectorStream extends Transform
{
    // region Private Members
    private _collected: Buffer;
    private _flushedDeferred: Deferred<void>;
    // endregion


    constructor()
    {
        super();
        this._collected = new Buffer("");
        this._flushedDeferred = new Deferred<void>();
    }


    public _transform(chunk: Buffer | string, encoding: string, done: () => any): void
    {
        // Convert to a Buffer.
        const chunkBuf: Buffer = typeof chunk === "string" ? Buffer.from(chunk) : chunk;

        this._collected = Buffer.concat([this._collected, chunkBuf]);
        this.push(chunkBuf);
        done();
    }


    public _flush(done: () => any): void
    {
        this._flushedDeferred.resolve(undefined);
        done();
    }


    public get collected(): string
    {
        return this._collected.toString();
    }


    public get flushedPromise(): Promise<void>
    {
        return this._flushedDeferred.promise;
    }
}
