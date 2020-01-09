export declare enum CertificateCountryCode {
    US = "US"
}
export declare class SelfSignedCertificate {
    static create(countryCode: string, state: string, location: string, organization: string, organizationalUnit: string, commonName: string): Promise<SelfSignedCertificate>;
    private readonly _countryCode;
    private readonly _state;
    private readonly _location;
    private readonly _organization;
    private readonly _organizationalUnit;
    private readonly _commonName;
    private readonly _keyData;
    private readonly _certData;
    private constructor();
    readonly countryCode: string;
    readonly state: string;
    readonly location: string;
    readonly organization: string;
    readonly organizationalUnit: string;
    readonly commonName: string;
    readonly keyData: string;
    readonly certData: string;
}
