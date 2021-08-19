import {Action} from "./action";
import { getTimerPromise } from "./promiseHelpers";


describe("Action", () => {


    it("can be constructed", () => {
        new Action(() => {});
    });


    describe("description", () => {

        it("can be read after creation", () =>
        {
            const action = new Action(() => {}, "Do something interesting.");
            expect(action.description).toEqual("Do something interesting.");
        });

    });


    describe("execute()", () => {


        it("will run a synchronous function", async () =>
        {
            let theValue = 0;
            const theFunc = () => { theValue++; };

            const action = new Action(theFunc);
            expect(theValue).toEqual(0);

            await action.execute();
            expect(theValue).toEqual(1);
        });


        it("will run an async function", async () =>
        {
            let theValue = 0;
            const theFunc = async () => {
                await getTimerPromise(20, undefined);
                theValue++;
            };

            const action = new Action(theFunc);

            const thePromise = action.execute();
            expect(theValue).toEqual(0);
            await thePromise;
            expect(theValue).toEqual(1);
        });


        it("rejects when contained action rejects", (done) => {

            const action = new Action(() => {
                return getTimerPromise(20, undefined)
                .then(() => Promise.reject(new Error("The error.")));
            });

            action.execute()
            .catch(() => {
                done();
            });
        });

    });


});
