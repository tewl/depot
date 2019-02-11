import {urlIsGettable} from "./requestHelpers";


describe("urlIsGettable()", () => {


    it("will resolve with true when the URL is gettable", (done) => {
        urlIsGettable("http://www.google.com")
        .then((isGettable) => {
            expect(isGettable).toEqual(true);
            done();
        });
    });


    it("will resolve with false when the URL is not gettable", (done) => {
        urlIsGettable("https://github.com/kwpeters/nonexistantproject")
        .then((isGettable) => {
            expect(isGettable).toEqual(false);
            done();
        });
    });


});
