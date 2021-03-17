import * as _ from "lodash";
import { indent } from "./stringHelpers";


type ReporterListenerFn = (output: string) => void;
export type RemoveListenerFunc = () => void;


export class Reporter
{
    // #region Instance Member Variables
    private readonly _listeners: Array<ReporterListenerFn> = [];
    private readonly _indentationStack: Array<number> = [];
    private _currentIndentation: number = 0;
    // #endregion


    public constructor()
    {
    }


    public addListener(listener: ReporterListenerFn): RemoveListenerFunc
    {
        this._listeners.push(listener);

        return () =>
        {
            _.pull(this._listeners, listener);
        };
    }


    public pushIndentation(numSpaces: number): void
    {
        this._indentationStack.push(numSpaces);
        this._currentIndentation += numSpaces;
    }


    public popIndentation(): void
    {
        if (this._indentationStack.length > 0)
        {
            const curVal = this._indentationStack.pop()!;
            this._currentIndentation -= curVal;
        }
    }


    public getCurrentIndentation(): number
    {
        return this._currentIndentation;
    }


    public log(text: string): void
    {
        const curIndentation = this.getCurrentIndentation();
        if (curIndentation > 0) {
            text = indent(text, curIndentation);
        }

        _.forEach(this._listeners, (curListener) => curListener(text));
    }

}
