import {Url} from "./url";


describe("Url", () =>
{

    describe("instance", () =>
    {

        describe("clone()", () =>
        {

            it("will create a *copy* of the Url instance", () =>
            {
                const url1 = Url.fromString("http://localhost:3030")!;
                const url2 = url1.clone();

                url2.port = 3031;
                expect(url2.port).toEqual(3031);
                // The original should not be modified.
                expect(url1.port).toEqual(3030);
            });


        });


        describe("getProtocols()", () =>
        {

            it("will return an array of all protocols in the URL", () =>
            {
                const urlA = Url.fromString("https://github.com/kwpeters/sampleGitRepo.git");
                expect(urlA!.getProtocols()).toEqual(["https"]);

                const urlB = Url.fromString("git+https://github.com/kwpeters/sampleGitRepo.git");
                expect(urlB!.getProtocols()).toEqual(["git", "https"]);
            });


            it("will return an empty array when no protocols are present", () =>
            {
                const urlA = Url.fromString("github.com/kwpeters/sampleGitRepo");
                expect(urlA!.getProtocols()).toEqual([]);
            });


        });


        describe("replaceProtocol()", () =>
        {

            it("will replace the protocol with the same one", () =>
            {
                const url = Url.fromString("git+https://github.com/kwpeters/sampleGitRepo.git");
                expect(url!.replaceProtocol("git+https").toString())
                .toEqual("git+https://github.com/kwpeters/sampleGitRepo.git");
            });


            it("will replace the protocol with a different one", () =>
            {
                const url = Url.fromString("git://github.com/kwpeters/sampleGitRepo.git");
                expect(url!.replaceProtocol("https").toString())
                .toEqual("https://github.com/kwpeters/sampleGitRepo.git");
            });


            it("will replace a protocol with multiple protocols", () =>
            {
                const url = Url.fromString("https://github.com/kwpeters/sampleGitRepo.git");
                expect(url!.replaceProtocol("git+https").toString())
                .toEqual("git+https://github.com/kwpeters/sampleGitRepo.git");
            });


        });


        describe("join()", () =>
        {

            it("will join a URL when the first part does not end with a slash", () =>
            {
                const url1 = Url.fromString("http://www.foo.com/foo");
                expect(url1).toBeTruthy();
                const url2 = url1!.join("bar");
                expect(url2).toBeTruthy();
                expect(url2!.toString()).toEqual("http://www.foo.com/foo/bar");
            });


            it("will join a URL when the first part does end with a slash", () =>
            {
                const url1 = Url.fromString("http://www.foo.com/foo/");
                expect(url1).toBeTruthy();
                const url2 = url1!.join("/bar");
                expect(url2).toBeTruthy();
                expect(url2!.toString()).toEqual("http://www.foo.com/foo/bar");
            });


        });


        describe("host", () =>
        {
            it("returns the expected value", () =>
            {
                const url = Url.fromString("http://localhost:3030/foo/bar");
                expect(url).toBeTruthy();
                expect(url!.host).toEqual("localhost:3030");

            });

        });


        describe("hostname", () =>
        {

            it("returns the expected value", () =>
            {
                const url = Url.fromString("http://localhost:3030/foo/bar");
                expect(url).toBeTruthy();
                expect(url!.hostname).toEqual("localhost");
            });

        });


        describe("port", () =>
        {

            it("returns undefined when no port is specified", () =>
            {
                const url = Url.fromString("http://localhost/foo/bar");
                expect(url).toBeTruthy();
                expect(url!.port).toEqual(undefined);
            });


            it("returns the expected numeric value", () =>
            {
                const url = Url.fromString("http://localhost:3030/foo/bar");
                expect(url).toBeTruthy();
                expect(url!.port).toEqual(3030);
            });


            it("assigns a new port number", () =>
            {
                const url = Url.fromString("http://localhost:3030/foo/bar");
                expect(url).toBeTruthy();
                url!.port = 3040;
                expect(url!.toString()).toEqual("http://localhost:3040/foo/bar");
            });


            it("can clear a port number", () =>
            {
                const url = Url.fromString("http://localhost:3030/foo/bar");
                expect(url).toBeTruthy();
                url!.port = undefined;
                expect(url!.toString()).toEqual("http://localhost/foo/bar");
            });


        });


    });


});
