/// <reference types="node" />
/// <reference types="pouchdb-core" />
import * as http from "http";
import * as https from "https";
import { RequestType } from "./requestHelpers";
declare type RequestListener = (request: http.IncomingMessage, response: http.ServerResponse) => void;
export interface ISslConfig {
    key: Buffer | string;
    cert: Buffer | string;
    isSelfSigned: boolean;
}
/**
 * A wrapper around a http/https server that simplifies configuration and
 * programmatic control.
 *
 * See this classes unit test file for an example of how to create a derived
 * concrete class.
 */
export declare class QuickServer {
    private readonly _port;
    private readonly _sslConfig;
    private readonly _requestListener;
    private _server;
    private _connections;
    private _isReferenced;
    /**
     * Constructs a new server instance.
     * This constructor is private, because `create()` should be used instead.
     *
     * @param port - The port number the server will run on (once `start()` is
     *   called)
     * @param sslConfig - `undefined` if a http server is desired.  If a https
     *   server is desired, this parameter must be given, specifying the private
     *   key and certificate.
     * @param requestListener - The request listener (This can be an Express
     *   app)
     */
    protected constructor(port: number, sslConfig: undefined | ISslConfig, requestListener: RequestListener);
    /**
     * Gets the wrapped HTTP server.  undefined is returned if there is no
     * server (i.e. listen() has not been called).
     */
    readonly server: undefined | http.Server | https.Server;
    /**
     * Gets the port that this server will run on (once `start()` is
     * called)
     */
    readonly port: number;
    /**
     * Gets the IP address of this server.
     */
    readonly ipAddress: string;
    /**
     * Gets the URL of this server.
     */
    readonly url: string;
    readonly isReferenced: undefined | boolean;
    /**
     * A request-promise object that can be used to make requests to this
     * server.
     */
    readonly request: RequestType;
    /**
     * Starts this server listening on its port.
     *
     * @param referenced - If false (unreferenced), the program will be allowed
     *     to exit if this is the only active server.
     * @return A promise that resolves when this server has started
     */
    listen(referenced?: boolean): Promise<void>;
    /**
     * Stops this server from listening.  No new connection will be accepted.
     *
     * @param force - If false, existing connections will remain and the
     *     returned promise will not resolve until they close naturally.  If
     *     true, existing connections will be destroyed.
     *
     * @return A promise that resolves when all existing connection have closed
     * naturally.
     */
    close(force?: boolean): Promise<void>;
}
export {};
