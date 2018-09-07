import {Deferred} from "./deferred";


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
