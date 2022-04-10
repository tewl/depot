import {Writable, WritableOptions} from "stream";

export class NullStream extends Writable {
    constructor(opts?: WritableOptions) {
        super(opts);
    }


    public override _write(chunk: string | Buffer, encoding: string, callback: () => unknown): void {
        callback();
    }
}
