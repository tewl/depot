import * as _ from "lodash";
import * as BBPromise from "bluebird";
import * as http from "http";
import * as net from "net";
import {getExternalIpv4Addresses} from "./networkHelpers";
import {RequestType} from "./requestHelpers";
import * as request from "request-promise";


type RequestListener = (request: http.IncomingMessage, response: http.ServerResponse) => void;


/**
 * A wrapper around a http/https server that simplifies configuration and
 * programmatic control.
 *
 * See this classes unit test file for an example of how to create a derived
 * concrete class.
 */
export class QuickServer
{

    // region Instance Members
    private readonly _port: number;
    private readonly _requestListener: RequestListener;
    private          _server: http.Server | undefined;
    private          _connections: {[remoteAddrAndPort: string]: net.Socket} = {};

    // undefined: The server is not listening/running, so it is neither
    //            referenced nor unreferenced.
    // true:      The server is referenced.
    // false:     The server is not referenced.
    private          _isReferenced: undefined | boolean;
    // endregion


    /**
     * Constructs a new server instance.
     * This constructor is private, because `create()` should be used instead.
     *
     * @param port - The port number the server will run on (once `start()` is
     *   called)
     * @param requestListener - The request listener (This can be an Express
     *   app)
     */
    protected constructor(
        port: number,
        requestListener: RequestListener
    )
    {
        this._port       = port;
        this._requestListener = requestListener;
    }


    /**
     * Gets the wrapped HTTP server.  undefined is returned if there is no
     * server (i.e. listen() has not been called).
     */
    public get server(): http.Server | undefined
    {
        return this._server;
    }


    /**
     * Gets the port that this server will run on (once `start()` is
     * called)
     */
    public get port(): number
    {
        return this._port;
    }


    /**
     * Gets the IP address of this server.
     */
    public get ipAddress(): string
    {
        const addresses = getExternalIpv4Addresses();
        const address = _.first(_.values(addresses))!;
        return address;
    }


    /**
     * Gets the URL of this server.
     */
    public get url(): string
    {
        const ipAddress = this.ipAddress;
        return `http://${ipAddress}:${this._port}`;
    }


    public get isReferenced(): undefined | boolean
    {
        return this._isReferenced;
    }


    /**
     * A request-promise object that can be used to make requests to this
     * server.
     */
    public get request(): RequestType
    {
        return request.defaults({baseUrl: this.url, json: true});
    }


    /**
     * Starts this server listening on its port.
     *
     * @param referenced - If false (unreferenced), the program will be allowed
     *     to exit if this is the only active server.
     * @return A promise that resolves when this server has started
     */
    public listen(referenced: boolean = true): Promise<void>
    {
        // If this server is already started, just resolve.
        if (this._server) {
            return BBPromise.resolve();
        }

        return new BBPromise((resolve) => {

            this._server = http.createServer(this._requestListener);
            this._server.listen(this._port, () => {

                if (!referenced) {
                    this._server!.unref();
                }
                this._isReferenced = referenced;

                // Start tracking the active connections to this server.
                // This is needed in case we have to destroy them when closing
                // this server.
                this._server!.on("connection", (conn) => {
                    const key = `${conn.remoteAddress}:${conn.remotePort}`;
                    this._connections[key] = conn;
                    conn.on("close", () => {
                        delete this._connections[key];
                    });
                });

                // The server is now running.
                resolve();
            });

        });
    }


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
    public close(force: boolean = false): Promise<void>
    {
        // If this server is already stopped, just resolve.
        if (!this._server) {
            return BBPromise.resolve();
        }

        return new BBPromise((resolve) => {
            this._server!.close(() => {
                this._server = undefined;
                this._isReferenced = undefined;
                this._connections = {};
                resolve();
            });

            // If the caller wants to force this server to close, forcibly
            // destroy all existing connections.
            if (force) {
                _.forOwn(this._connections, (curConn) => {
                    curConn.destroy();
                });
            }
        });
    }

}
