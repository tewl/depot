import {tmpdir} from "os";
import {spawn} from "./spawn";
import {Directory} from "./directory";
import {File} from "./file";
import {getUniqueProcessStr} from "./uniqueProcessStr";


export enum CertificateCountryCode
{
    US = "US"
}


export class SelfSignedCertificate
{

    public static async create(
        countryCode: string,
        state: string,
        location: string,
        organization: string,
        organizationalUnit: string,
        commonName: string
    ): Promise<SelfSignedCertificate>
    {
        const id = getUniqueProcessStr();
        const tmpDir = new Directory(tmpdir());
        const keyFile = new File(tmpDir, `${id}_selfsignedcert.key`);
        const certFile = new File(tmpDir, `${id}_selfsignedcert.crt`);

        const subjStr = `/C=${countryCode}/ST=${state}/L=${location}/O=${organization}/OU=${organizationalUnit}/CN=${commonName}`;

        await spawn(
            "openssl",
            [
                "req",
                "-nodes",
                "-newkey", "rsa:2048",
                "-keyout", keyFile.absolute().toString(),
                "-out", certFile.absolute().toString(),
                "-x509",
                "-days", "365",
                "-subj", subjStr
            ]
        ).closePromise;

        // Read the key and cert data (in parallel).
        const [keyData, certData] = await Promise.all([keyFile.read(), certFile.read()]);

        // Create the new instance.
        const instance = new SelfSignedCertificate(
            countryCode, state, location, organization, organizationalUnit, commonName, keyData, certData
        );

        // Cleanup
        await Promise.all([keyFile.delete(), certFile.delete()]);

        return instance;
    }


    // region Instance Data Members
    private readonly _countryCode: string;
    private readonly _state: string;
    private readonly _location: string;
    private readonly _organization: string;
    private readonly _organizationalUnit: string;
    private readonly _commonName: string;
    private readonly _keyData: string;
    private readonly _certData: string;
    // endregion


    private constructor(
        countryCode: string,
        state: string,
        location: string,
        organization: string,
        organizationalUnit: string,
        commonName: string,
        keyData: string,
        certData: string
    )
    {
        this._countryCode        = countryCode;
        this._state              = state;
        this._location           = location;
        this._organization       = organization;
        this._organizationalUnit = organizationalUnit;
        this._commonName         = commonName;
        this._keyData            = keyData;
        this._certData           = certData;
    }


    public get countryCode(): string        { return this._countryCode; }
    public get state(): string              { return this._state; }
    public get location(): string           { return this._location; }
    public get organization(): string       { return this._organization; }
    public get organizationalUnit(): string { return this._organizationalUnit; }
    public get commonName(): string         { return this._commonName; }
    public get keyData(): string            { return this._keyData; }
    public get certData(): string           { return this._certData; }
}
