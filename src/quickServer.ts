import * as _ from "lodash";
import * as BBPromise from "bluebird";
import * as http from "http";
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

        // A hook for derived classes to add their routes.
        this.addRoutes();
    }


    /**
     * Gets the wrapped Express app instance
     */
    public get express(): express.Express
    {
        return this._expressApp;
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
    public start(referenced: boolean = true): Promise<void>
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

                // The server is now running.
                resolve();
            });
        });
    }


    /**
     * Stops this server from listening on its port
     *
     * @return A promise that resolves when this server has closed
     */
    public stop(): Promise<void>
    {
        // If this server is already stopped, just resolve.
        if (!this._server) {
            return BBPromise.resolve();
        }

        return new BBPromise((resolve) => {
            this._server!.close(() => {
                this._server = undefined;
                resolve();
            });
        });
    }


    /**
     * A template method for derived classes to mount their own routes.  When
     * this method is called, derived classes should add routes using
     * `this.express`.
     *
     * @example
     * this.express.get("/derived", (req, res) => {
     *     res.status(200).send("derived");
     * });
     */
    protected addRoutes(): void
    {
    }


}
