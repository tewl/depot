import {Readable, ReadableOptions} from "stream";

export class SourceStream extends Readable
{
    // region Private Data Members
    private readonly _data: Array<string>;
    private _curIndex: number = 0;
    // endregion


    constructor(data: Array<string> | string, opts?: ReadableOptions) {
        super(opts);
        this._data = Array.isArray(data) ? data : [data];
    }


    public _read(): void {

        if (this._curIndex >= this._data.length)
        {
            this.push(null);
        }
        else
        {
            const buf = Buffer.from(this._data[this._curIndex]);
            this.push(buf);
        }

        this._curIndex++;
    }
}
