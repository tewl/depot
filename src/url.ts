import * as _ from "lodash";


//
// A regex that captures the protocol part of a URL (everything up to the
// "://").
// results[1] - The string of all protocols.
//
const urlProtocolRegex = /^([a-zA-Z0-9_+]+?):\/\//;


export class Url
{
    public static is(obj: any): obj is Url {
        return _.isFunction(obj.toString) &&
            _.isFunction(obj.getProtocols) &&
            _.isFunction(obj.replaceProtocol);
    }


    public static fromString(urlStr: string): Url | undefined
    {
        // TODO: Verify that urlStr is a valid URL.
        return new Url(urlStr);
    }


    // region Data Members
    private readonly _url: string;
    // endregion


    private constructor(url: string)
    {
        this._url = url;
    }


    public toString(): string
    {
        return this._url;
    }


    public getProtocols(): Array<string>
    {
        const results = urlProtocolRegex.exec(this._url);
        if (!results)
        {
            return [];
        }

        return results[1].split("+");
    }


    public replaceProtocol(newProtocol: string): Url
    {
        if (!_.endsWith(newProtocol, "://"))
        {
            newProtocol = newProtocol + "://";
        }

        const urlStr = this._url.replace(urlProtocolRegex, newProtocol);
        return new Url(urlStr);
    }
}

