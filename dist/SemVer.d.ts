export declare class SemVer {
    static sort(arr: Array<SemVer>): Array<SemVer>;
    static fromString(str: string): SemVer | undefined;
    private readonly _semver;
    private constructor();
    /**
     * Returns this version as a string (no prefixes)
     * @return A string representation of this version
     */
    toString(): string;
    /**
     * Gets the major version number
     */
    readonly major: number;
    /**
     * Gets the minor version number
     */
    readonly minor: number;
    /**
     * Gets the patch version number
     */
    readonly patch: number;
    readonly prerelease: {
        type: string;
        version?: number;
    } | undefined;
    /**
     * Gets this version as a version string (prefixed), including only the
     * major version number.
     * @return The major version string (prefixed)
     */
    getMajorVersionString(): string;
    /**
     * Gets this version as a version string (prefixed), including major and
     * minor version numbers.
     * @return The minor version string (prefixed)
     */
    getMinorVersionString(): string;
    /**
     * Gets this version as a version string (prefixed), including major, minor
     * and patch version numbers.
     * @return The patch version string (prefixed)
     */
    getPatchVersionString(): string;
    /**
     * Compares this version with other and determines whether the this version
     * is less, greater or equal to other.
     * @param other - The other version to compare to
     * @return -1 if this version is less than other. 1 if this version is
     * greater than other.  0 if this version equals other.
     */
    compare(other: SemVer): -1 | 0 | 1;
}
