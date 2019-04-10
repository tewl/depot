import * as express from "express";
import {QuickServer} from "./quickServer";
import {determinePort, IPortConfig} from "./networkHelpers";


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


    });


});
