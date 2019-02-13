import urlJoin = require("url-join");  // tslint:disable-line:no-require-imports
import * as URLParse from "url-parse";


//
// A regex that captures the protocol part of a URL (everything up to the
// "://").
// results[1] - The string of all protocols.
//
const urlProtocolRegex = /^([a-zA-Z0-9_+]+?):\/\//;


export class Url
{
    public static fromString(urlStr: string): Url | undefined
    {
        try {
            const parsed = new URLParse(urlStr);
            const inst = new Url(parsed);
            return inst;
        }
        catch (err) {
            return undefined;
        }
    }


    // region Data Members
    private readonly _parsed: URLParse;
    // endregion


    private constructor(parsed: URLParse)
    {
        this._parsed = parsed;
    }


    public toString(): string
    {
        return this._parsed.href;
    }


    public getProtocols(): Array<string>
    {
        const results = urlProtocolRegex.exec(this._parsed.href);
        if (!results)
        {
            return [];
        }

        return results[1].split("+");
    }


    /**
     * Gets a new Url instance with a modified protocol.
     * @param newProtocol - The new instance's protocol
     * @return The new Url instance
     */
    public replaceProtocol(newProtocol: string): Url
    {
        // FUTURE: Deprecate this method in favor of cloning and mutating the URL
        //   by setting a `protocol` property similar to how the port property can
        //   be assigned to.

        const newInst = Url.fromString(this.toString())!;
        newInst._parsed.set("protocol", newProtocol);
        return newInst;
    }


    public join(...parts: Array<string>): Url | undefined {
        const newUrlStr = urlJoin(this.toString(), ...parts);
        return Url.fromString(newUrlStr);
    }


    /**
     * Host name with port number
     */
    public get host(): string {
        return this._parsed.host;
    }


    /**
     * Host name without port number
     */
    public get hostname(): string {
        return this._parsed.hostname;
    }


    /**
     * Optional port number.  Empty string if no port number is present.
     */
    public get port(): number | undefined {
        const portStr = this._parsed.port;
        if (portStr === "") {
            return undefined;
        }
        else {
            return parseInt(portStr, 10);
        }
    }


    public set port(val: number | undefined) {
        this._parsed.set("port", val);
    }



}

