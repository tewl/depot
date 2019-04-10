import * as BBPromise from "bluebird";
import * as express from "express";
import {QuickServer} from "./quickServer";
import {determinePort, IPortConfig} from "./networkHelpers";
import {Deferred} from "./deferred";


describe("QuickServer", () => {


    describe("derived class", () => {

        let numDerivedHandlerInvocations = 0;

        // An example derived class.
        class DerivedServer extends QuickServer
        {


            public static create(portConfig?: IPortConfig): Promise<DerivedServer>
            {
                return determinePort(portConfig)
                .then((port) => {
                    const expressApp = express();
                    // expressApp.use(bodyParser.json({limit: "1mb"}));
                    expressApp.get("/derived", (req, res) => {
                        numDerivedHandlerInvocations++;
                        res.status(200).send("derived");
                    });

                    return new DerivedServer(port, expressApp);
                });
            }


        }


        it("can add routes that can be accessed", async () => {
            const server = await DerivedServer.create();
            await server.listen(false);
            const res = await server.request.get("/derived");
            expect(res).toEqual("derived");
            expect(numDerivedHandlerInvocations).toEqual(1);
        });


        describe("close()", () => {


            it("can forcibly terminate connections to the server", (done) => {

                let derivedServer: DerivedServer;
                const errorCodeDfd = new Deferred<string>();

                DerivedServer.create()
                .then((theServer) => {
                    derivedServer = theServer;
                    return derivedServer.listen(false);
                })
                .then(() => {

                    return new BBPromise((resolve) => {
                        derivedServer.server!.on("connection", () => {
                            // Now that we have a connection, close the server
                            // forcibly closing all existing connections.
                            const closePromise = derivedServer.close(true);
                            resolve(closePromise);
                        });

                        // Send a request to the server so a connection is made.
                        // Once the connection is made, the server will forcibly
                        // terminate the connection, so this request should fail
                        // with ECONNRESET.
                        derivedServer.request.get("/derived")
                        .catch((err) => {
                            errorCodeDfd.resolve(err.cause.code);
                        });
                    });
                })
                .then(() => {
                    return errorCodeDfd.promise;
                })
                .then((errorCode) => {
                    expect(errorCode).toEqual("ECONNRESET");
                    done();
                });
            });


        });
    });


});
