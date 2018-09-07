import {Url} from "./url";


describe("Url", () => {


    describe("instance", () => {


        describe("getProtocols()", () => {


            it("will return an array of all protocols in the URL", () => {

                const urlA = Url.fromString("https://github.com/kwpeters/sampleGitRepo.git");
                expect(urlA!.getProtocols()).toEqual(["https"]);

                const urlB = Url.fromString("git+https://github.com/kwpeters/sampleGitRepo.git");
                expect(urlB!.getProtocols()).toEqual(["git", "https"]);
            });


            it("will return an empty array when no protocols are present", () => {
                const urlA = Url.fromString("github.com/kwpeters/sampleGitRepo");
                expect(urlA!.getProtocols()).toEqual([]);
            });


        });


        describe("replaceProtocol()", () => {


            it("will replace the protocol with the same one", () => {
                const url = Url.fromString("git+https://github.com/kwpeters/sampleGitRepo.git");
                expect(url!.replaceProtocol("git+https").toString())
                .toEqual("git+https://github.com/kwpeters/sampleGitRepo.git");
            });


            it("will replace the protocol with a different one", () => {
                const url = Url.fromString("git://github.com/kwpeters/sampleGitRepo.git");
                expect(url!.replaceProtocol("https").toString())
                .toEqual("https://github.com/kwpeters/sampleGitRepo.git");
            });


            it("will replace a protocol with multiple protocols", () => {
                const url = Url.fromString("https://github.com/kwpeters/sampleGitRepo.git");
                expect(url!.replaceProtocol("git+https").toString())
                .toEqual("git+https://github.com/kwpeters/sampleGitRepo.git");
            });


        });

    });


});
