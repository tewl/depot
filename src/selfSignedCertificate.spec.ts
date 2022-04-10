import {SelfSignedCertificate, CertificateCountryCode} from "./selfSignedCertificate";


describe("SelfSignedCertificate", () => {

    describe("static", () => {

        describe("create()", () => {

            it("will return a new instance when given valid data", async () => {
                const certPair = await SelfSignedCertificate.create(
                    CertificateCountryCode.US,
                    "Ohio",
                    "Aurora",
                    "Kwp Inc.",
                    "Headquarters",
                    "foo.bar.com"
                );

                expect(certPair).toBeTruthy();
                expect(certPair.countryCode).toEqual("US");
                expect(certPair.state).toEqual("Ohio");
                expect(certPair.location).toEqual("Aurora");
                expect(certPair.organization).toEqual("Kwp Inc.");
                expect(certPair.organizationalUnit).toEqual("Headquarters");
                expect(certPair.commonName).toEqual("foo.bar.com");
                expect(certPair.keyData.length).toBeGreaterThan(0);
                expect(certPair.certData.length).toBeGreaterThan(0);
            });


        });


    });


});
