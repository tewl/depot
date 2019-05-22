import * as _ from "lodash";
import * as BBPromise from "bluebird";
import * as express from "express";
import {ISslConfig, QuickServer} from "./quickServer";
import {determinePort, getFirstExternalIpv4Address, IPortConfig} from "./networkHelpers";
import {Deferred} from "./deferred";
import {CertificateCountryCode, SelfSignedCertificate} from "./selfSignedCertificate";


describe("QuickServer", () => {


    describe("derived class", () => {

        // An example derived class.
        class DerivedServer extends QuickServer
        {

            public static create(portConfig?: IPortConfig, sslConfig?: ISslConfig): Promise<DerivedServer>
            {
                return determinePort(portConfig)
                .then((port) => {
                    const expressApp = express();
                    const derivedServer = new DerivedServer(port, sslConfig, expressApp);

                    // expressApp.use(bodyParser.json({limit: "1mb"}));
                    expressApp.get("/derived", (req, res) => {
                        derivedServer.numDerivedHandlerInvocations++;
                        res.status(200).send("derived");
                    });

                    return derivedServer;
                });
            }

            public numDerivedHandlerInvocations: number = 0;

        }


        it("can create a http server and add routes that can be accessed", async () => {
            const server = await DerivedServer.create();
            await server.listen(false);
            const res = await server.request.get("/derived");
            expect(res).toEqual("derived");
            expect(server.numDerivedHandlerInvocations).toEqual(1);
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


        describe("when creating a https server", () => {

            it("can add routes that can be accessed", async () => {

                const ipAddress = getFirstExternalIpv4Address();

                const selfSignedCertificate = await SelfSignedCertificate.create(
                    CertificateCountryCode.US, "Ohio", "Aurora", "Kwp Inc.", "Headquarters", ipAddress);

                const sslConfig: ISslConfig = {
                    key:          selfSignedCertificate.keyData,
                    cert:         selfSignedCertificate.certData,
                    isSelfSigned: true
                };

                const server = await DerivedServer.create(undefined, sslConfig);
                await server.listen(false);
                const res = await server.request.get("/derived");
                expect(res).toEqual("derived");
                expect(server.numDerivedHandlerInvocations).toEqual(1);
            });


            it("will use 'https' in the server's URL", async () => {
                const ipAddress = getFirstExternalIpv4Address();

                const selfSignedCertificate = await SelfSignedCertificate.create(
                    CertificateCountryCode.US, "Ohio", "Aurora", "Kwp Inc.", "Headquarters", ipAddress);

                const sslConfig: ISslConfig = {
                    key:          selfSignedCertificate.keyData,
                    cert:         selfSignedCertificate.certData,
                    isSelfSigned: true
                };

                const server = await DerivedServer.create(undefined, sslConfig);
                expect(_.startsWith(server.url, "https")).toBeTruthy();
            });


        });
    });


});
