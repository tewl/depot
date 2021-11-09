import * as _ from "lodash";
import urlJoin = require("url-join");
import URLParse = require("url-parse");


export class Url
{
    public static fromString(urlStr: string): Url | undefined
    {
        try
        {
            const parsed = new URLParse(urlStr);
            const inst = new Url(parsed);
            return inst;
        }
        catch (err)
        {
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


    /**
     * Creates a duplicate instance of this Url
     * @return The new instance
     */
    public clone(): Url
    {
        const newInstParsed = _.cloneDeep(this._parsed);
        const newInst = new Url(newInstParsed);
        return newInst;
    }


    public getProtocols(): Array<string>
    {
        const protocolStr = this._parsed.protocol;
        const withoutColon = protocolStr.replace(/:$/, "");

        if (withoutColon === "")
        {
            // No protocol specified.
            return [];
        }

        const protocols = withoutColon.split("+");
        return protocols;
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


    public join(...parts: Array<string>): Url | undefined
    {
        const newUrlStr = urlJoin(this.toString(), ...parts);
        return Url.fromString(newUrlStr);
    }


    /**
     * Host name with port number
     */
    public get host(): string
    {
        return this._parsed.host;
    }


    /**
     * Host name without port number
     */
    public get hostname(): string
    {
        return this._parsed.hostname;
    }


    /**
     * Optional port number.  Empty string if no port number is present.
     */
    public get port(): number | undefined
    {
        const portStr = this._parsed.port;
        if (portStr === "")
        {
            return undefined;
        }
        else
        {
            return parseInt(portStr, 10);
        }
    }


    public set port(val: number | undefined)
    {
        this._parsed.set("port", val);
    }

}
