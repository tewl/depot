export class NIError<TLiteral> {
    private readonly _code: TLiteral;
    private readonly _msg?: string;


    public constructor(code: TLiteral, msg?: string) {
        this._code = code;
        this._msg = msg;
    }


    public get code(): TLiteral {
        return this._code;
    }


    public toString(): string {
        let errMsg = `Error ${this._code}`;
        if (this._msg) {
            errMsg += `: ${this._msg}`;
        }
        return errMsg;
    }
}
