import {Writable, WritableOptions} from "stream";

export class NullStream extends Writable
{
    constructor(opts?: WritableOptions)
    {
        super(opts);
    }


    public _write(chunk: string | Buffer, encoding: string, callback: () => any): void
    {
        callback();
    }
}
