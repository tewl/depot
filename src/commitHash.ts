

const commitHashRegexp = /^[0-9a-fA-F]{7,40}$/;

export class CommitHash
{

    public static fromString(hash: string): CommitHash | undefined
    {
        const results = commitHashRegexp.exec(hash);
        return results ? new CommitHash(hash) : undefined;
    }


    // region Data Members
    private readonly _hash: string;
    // endregion


    private constructor(hash: string)
    {
        this._hash = hash;
    }


    public toString(): string
    {
        return this._hash;
    }


    public toShortString(): string
    {
        return this._hash.slice(0, 7);
    }
}
