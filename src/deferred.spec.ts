import {connectPromiseToDeferred, Deferred} from "./deferred";
import {getTimerPromise} from "./promiseHelpers";


describe("Deferred", () => {

    it("is creatable", () => {
        const dfd = new Deferred<number>();
        expect(dfd).toBeTruthy();

    });


    it("will resolve with the expected value", (done) => {
        const dfd = new Deferred<number>();

        dfd.promise.then((result) => {
            expect(result).toEqual(4);
            done();
        });

        dfd.resolve(4);
    });


    it("will reject with the expected value", (done) => {
        const dfd = new Deferred<number>();

        dfd.promise.catch((err) => {
            expect(err).toEqual(6);
            done();
        });

        dfd.reject(6);

    });


});


describe("connectPromiseToDeferred()", () => {

    it("will force the deferred to resolve with the promise's resolve value", (done) => {
        const prom = getTimerPromise(300, 3);
        const dfd = new Deferred<number>();

        connectPromiseToDeferred(prom, dfd);

        dfd.promise
        .then((result) => {
            expect(result).toEqual(3);
            done();
        });
    });


    it("will force the deferred to reject with the promise's rejection value", (done) => {
        const sourceDfd = new Deferred<number>();
        sourceDfd.reject(new Error("rejected"));
        const dfd = new Deferred<number>();

        connectPromiseToDeferred(sourceDfd.promise, dfd);

        dfd.promise
        .catch((err: Error) => {
            expect(err.message).toEqual("rejected");
            done();
        });
    });



});
