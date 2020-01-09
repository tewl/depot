export declare class Url {
    static fromString(urlStr: string): Url | undefined;
    private readonly _parsed;
    private constructor();
    toString(): string;
    /**
     * Creates a duplicate instance of this Url
     * @return The new instance
     */
    clone(): Url;
    getProtocols(): Array<string>;
    /**
     * Gets a new Url instance with a modified protocol.
     * @param newProtocol - The new instance's protocol
     * @return The new Url instance
     */
    replaceProtocol(newProtocol: string): Url;
    join(...parts: Array<string>): Url | undefined;
    /**
     * Host name with port number
     */
    readonly host: string;
    /**
     * Host name without port number
     */
    readonly hostname: string;
    /**
     * Optional port number.  Empty string if no port number is present.
     */
    port: number | undefined;
}
