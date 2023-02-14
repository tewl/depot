import {Timeout} from "./timers";
import { getTimerPromise } from "./promiseHelpers";


describe("Timeout", () => {

    it("can be created", () => {
        expect(new Timeout(1000)).toBeDefined();
    });


    describe("constructor", () => {

        it("starts the Timeout instance in a not running state", () => {
            const t1 = new Timeout(100);
            expect(t1.isRunning()).toEqual(false);
        });


    });


    describe("isRunning()", () => {

        it("returns true while the timeout timer is running", () => {
            const t1 = new Timeout(100);
            t1.start();
            expect(t1.isRunning()).toEqual(true);
        });


        it("returns false after the timeout has expired", (done) => {
            const t1 = new Timeout(100);
            t1.start();

            setTimeout(() => {
                expect(t1.isRunning()).toEqual(false);
                done();
            }, 105);
        });


    });


    describe("stop()", () => {

        it("stops the timer", (done) => {
            const t1 = new Timeout(100);

            let numExpiredEvents = 0;
            t1.on(Timeout.EVENT_NAME_EXPIRED, () => {
                numExpiredEvents++;
            });

            t1.start();

            getTimerPromise(50, undefined)
            .then(() => {
                expect(t1.isRunning()).toEqual(true);
                t1.stop();
                expect(t1.isRunning()).toEqual(false);
                expect(numExpiredEvents).toEqual(0);

                // We have already waited 50 ms.  Wait another 60 ms and we
                // should see that the expired event has *not* fired.
                return getTimerPromise(60, undefined);
            })
            .then(() => {
                expect(t1.isRunning()).toEqual(false);
                expect(numExpiredEvents).toEqual(0);
                done();
            });
        });


    });


    describe("EVENT_EXPIRED", () => {

        it("will not be fired if the timer is restarted within timeout period", (done) => {
            const t1 = new Timeout(100);
            let numExpiredEvents = 0;

            t1.on(Timeout.EVENT_NAME_EXPIRED, () => {
                numExpiredEvents++;
            });

            t1.start();

            getTimerPromise(50, undefined)
            .then(() => {
                t1.start();
                return getTimerPromise(50, undefined);
            })
            .then(() => {
                t1.start();
                return getTimerPromise(50, undefined);
            })
            .then(() => {
                t1.start();
                return getTimerPromise(50, undefined);
            })
            .then(() => {
                expect(numExpiredEvents).toEqual(0);
                // We have already waited 50 ms.  Wait another 60 ms and we
                // should see that the expired event has fired.
                return getTimerPromise(60, undefined);
            })
            .then(() => {
                expect(numExpiredEvents).toEqual(1);
                done();

            });



        });
    });


});
