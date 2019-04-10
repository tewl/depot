import * as _ from "lodash";
import * as BBPromise from "bluebird";
import * as http from "http";
import * as net from "net";
import * as express from "express";
import {getExternalIpv4Addresses} from "./networkHelpers";
import {RequestType} from "./requestHelpers";
import * as request from "request-promise";


/**
 * A wrapper around an Express application that simplifies configuration and
 * programmatic control.
 *
 * See this classes unit test file for an example of how to create a derived
 * concrete class.
 */
export class QuickServer
{

    // region Instance Members
    private readonly _port: number;
    private readonly _expressApp: express.Express;
    private          _server:  http.Server | undefined;
    private          _connections: {[remoteAddrAndPort: string]: net.Socket} = {};
    // endregion


    /**
     * Constructs a new server instance.
     * This constructor is private, because `create()` should be used instead.
     *
     * @param port - The port number the Express will run on (once `start()` is
     * called)
     * @param expressApp - The wrapped Express app
     */
    protected constructor(
        port: number,
        expressApp: express.Express
    )
    {
        this._port       = port;
        this._expressApp = expressApp;
    }


    /**
     * Gets the wrapped Express app instance
     */
    public get express(): express.Express
    {
        return this._expressApp;
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
            this._server = this._expressApp.listen(this._port, () => {

                if (!referenced) {
                    this._server!.unref();
                }

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
     * Stops this server from listening on its port.  No new connection will be
     * accepted. , but existing ones will remain open until they close naturally.
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
