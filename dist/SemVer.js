"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var semver = require("semver");
//
// The string that is prefixed onto version strings.
//
var VERSION_STRING_PREFIX = "v";
var SemVer = /** @class */ (function () {
    // endregion
    function SemVer(semver) {
        this._semver = semver;
    }
    SemVer.sort = function (arr) {
        return arr.sort(function (semverA, semverB) {
            return semver.compare(semverA._semver, semverB._semver);
        });
    };
    SemVer.fromString = function (str) {
        var sv = semver.parse(str);
        return sv ? new SemVer(sv) : undefined;
    };
    /**
     * Returns this version as a string (no prefixes)
     * @return A string representation of this version
     */
    SemVer.prototype.toString = function () {
        return this._semver.toString();
    };
    Object.defineProperty(SemVer.prototype, "major", {
        /**
         * Gets the major version number
         */
        get: function () {
            return this._semver.major;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemVer.prototype, "minor", {
        /**
         * Gets the minor version number
         */
        get: function () {
            return this._semver.minor;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemVer.prototype, "patch", {
        /**
         * Gets the patch version number
         */
        get: function () {
            return this._semver.patch;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SemVer.prototype, "prerelease", {
        get: function () {
            // The type definition for semver.prerelease is Array<string>, which is
            // wrong.  Unfortunately, in TS, tuples cannot have optional values, so
            // in order to make this more strongly typed we will convert it into an
            // object.  In order to do the conversion, we must temporarily treat the
            // returned array as an Array<any>.
            var prereleaseParts = this._semver.prerelease;
            if (prereleaseParts.length === 0) {
                return undefined;
            }
            var prerelease = { type: prereleaseParts[0] };
            if (prereleaseParts.length >= 2) {
                prerelease.version = prereleaseParts[1];
            }
            return prerelease;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Gets this version as a version string (prefixed), including only the
     * major version number.
     * @return The major version string (prefixed)
     */
    SemVer.prototype.getMajorVersionString = function () {
        return "" + VERSION_STRING_PREFIX + this._semver.major;
    };
    /**
     * Gets this version as a version string (prefixed), including major and
     * minor version numbers.
     * @return The minor version string (prefixed)
     */
    SemVer.prototype.getMinorVersionString = function () {
        return "" + VERSION_STRING_PREFIX + this._semver.major + "." + this._semver.minor;
    };
    /**
     * Gets this version as a version string (prefixed), including major, minor
     * and patch version numbers.
     * @return The patch version string (prefixed)
     */
    SemVer.prototype.getPatchVersionString = function () {
        return "" + VERSION_STRING_PREFIX + this._semver.major + "." + this._semver.minor + "." + this._semver.patch;
    };
    /**
     * Compares this version with other and determines whether the this version
     * is less, greater or equal to other.
     * @param other - The other version to compare to
     * @return -1 if this version is less than other. 1 if this version is
     * greater than other.  0 if this version equals other.
     */
    SemVer.prototype.compare = function (other) {
        return semver.compare(this._semver, other._semver);
    };
    return SemVer;
}());
exports.SemVer = SemVer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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LE1BQU0sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDdkQsQ0FBQztJQUVMLGFBQUM7QUFBRCxDQXRJQSxBQXNJQyxJQUFBO0FBdElZLHdCQUFNIiwiZmlsZSI6IlNlbVZlci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHNlbXZlciBmcm9tIFwic2VtdmVyXCI7XG5cblxuLy9cbi8vIFRoZSBzdHJpbmcgdGhhdCBpcyBwcmVmaXhlZCBvbnRvIHZlcnNpb24gc3RyaW5ncy5cbi8vXG5jb25zdCBWRVJTSU9OX1NUUklOR19QUkVGSVggPSBcInZcIjtcblxuXG5leHBvcnQgY2xhc3MgU2VtVmVyXG57XG4gICAgcHVibGljIHN0YXRpYyBzb3J0KGFycjogQXJyYXk8U2VtVmVyPik6IEFycmF5PFNlbVZlcj5cbiAgICB7XG4gICAgICAgIHJldHVybiBhcnIuc29ydCgoc2VtdmVyQSwgc2VtdmVyQikgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIHNlbXZlci5jb21wYXJlKHNlbXZlckEuX3NlbXZlciwgc2VtdmVyQi5fc2VtdmVyKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcHVibGljIHN0YXRpYyBmcm9tU3RyaW5nKHN0cjogc3RyaW5nKTogU2VtVmVyIHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICBjb25zdCBzdiA9IHNlbXZlci5wYXJzZShzdHIpO1xuICAgICAgICByZXR1cm4gc3YgPyBuZXcgU2VtVmVyKHN2KSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cblxuICAgIC8vIHJlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9zZW12ZXI6IHNlbXZlci5TZW1WZXI7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3Ioc2VtdmVyOiBzZW12ZXIuU2VtVmVyKVxuICAgIHtcbiAgICAgICAgdGhpcy5fc2VtdmVyID0gc2VtdmVyO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGlzIHZlcnNpb24gYXMgYSBzdHJpbmcgKG5vIHByZWZpeGVzKVxuICAgICAqIEByZXR1cm4gQSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhpcyB2ZXJzaW9uXG4gICAgICovXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbXZlci50b1N0cmluZygpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgbWFqb3IgdmVyc2lvbiBudW1iZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IG1ham9yKCk6IG51bWJlclxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3NlbXZlci5tYWpvcjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIG1pbm9yIHZlcnNpb24gbnVtYmVyXG4gICAgICovXG4gICAgcHVibGljIGdldCBtaW5vcigpOiBudW1iZXJcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZW12ZXIubWlub3I7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBwYXRjaCB2ZXJzaW9uIG51bWJlclxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcGF0Y2goKTogbnVtYmVyXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fc2VtdmVyLnBhdGNoO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBwcmVyZWxlYXNlKCk6IHt0eXBlOiBzdHJpbmcsIHZlcnNpb24/OiBudW1iZXJ9IHwgdW5kZWZpbmVkXG4gICAge1xuICAgICAgICAvLyBUaGUgdHlwZSBkZWZpbml0aW9uIGZvciBzZW12ZXIucHJlcmVsZWFzZSBpcyBBcnJheTxzdHJpbmc+LCB3aGljaCBpc1xuICAgICAgICAvLyB3cm9uZy4gIFVuZm9ydHVuYXRlbHksIGluIFRTLCB0dXBsZXMgY2Fubm90IGhhdmUgb3B0aW9uYWwgdmFsdWVzLCBzb1xuICAgICAgICAvLyBpbiBvcmRlciB0byBtYWtlIHRoaXMgbW9yZSBzdHJvbmdseSB0eXBlZCB3ZSB3aWxsIGNvbnZlcnQgaXQgaW50byBhblxuICAgICAgICAvLyBvYmplY3QuICBJbiBvcmRlciB0byBkbyB0aGUgY29udmVyc2lvbiwgd2UgbXVzdCB0ZW1wb3JhcmlseSB0cmVhdCB0aGVcbiAgICAgICAgLy8gcmV0dXJuZWQgYXJyYXkgYXMgYW4gQXJyYXk8YW55Pi5cbiAgICAgICAgY29uc3QgcHJlcmVsZWFzZVBhcnRzOiBBcnJheTxhbnk+ID0gdGhpcy5fc2VtdmVyLnByZXJlbGVhc2U7XG5cbiAgICAgICAgaWYgKHByZXJlbGVhc2VQYXJ0cy5sZW5ndGggPT09IDApXG4gICAgICAgIHtcbiAgICAgICAgICAgIHJldHVybiB1bmRlZmluZWQ7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcmVyZWxlYXNlOiB7dHlwZTogc3RyaW5nLCB2ZXJzaW9uPzogbnVtYmVyfSA9IHt0eXBlOiBwcmVyZWxlYXNlUGFydHNbMF19O1xuXG4gICAgICAgIGlmIChwcmVyZWxlYXNlUGFydHMubGVuZ3RoID49IDIpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHByZXJlbGVhc2UudmVyc2lvbiA9IHByZXJlbGVhc2VQYXJ0c1sxXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBwcmVyZWxlYXNlO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGlzIHZlcnNpb24gYXMgYSB2ZXJzaW9uIHN0cmluZyAocHJlZml4ZWQpLCBpbmNsdWRpbmcgb25seSB0aGVcbiAgICAgKiBtYWpvciB2ZXJzaW9uIG51bWJlci5cbiAgICAgKiBAcmV0dXJuIFRoZSBtYWpvciB2ZXJzaW9uIHN0cmluZyAocHJlZml4ZWQpXG4gICAgICovXG4gICAgcHVibGljIGdldE1ham9yVmVyc2lvblN0cmluZygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBgJHtWRVJTSU9OX1NUUklOR19QUkVGSVh9JHt0aGlzLl9zZW12ZXIubWFqb3J9YDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhpcyB2ZXJzaW9uIGFzIGEgdmVyc2lvbiBzdHJpbmcgKHByZWZpeGVkKSwgaW5jbHVkaW5nIG1ham9yIGFuZFxuICAgICAqIG1pbm9yIHZlcnNpb24gbnVtYmVycy5cbiAgICAgKiBAcmV0dXJuIFRoZSBtaW5vciB2ZXJzaW9uIHN0cmluZyAocHJlZml4ZWQpXG4gICAgICovXG4gICAgcHVibGljIGdldE1pbm9yVmVyc2lvblN0cmluZygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBgJHtWRVJTSU9OX1NUUklOR19QUkVGSVh9JHt0aGlzLl9zZW12ZXIubWFqb3J9LiR7dGhpcy5fc2VtdmVyLm1pbm9yfWA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoaXMgdmVyc2lvbiBhcyBhIHZlcnNpb24gc3RyaW5nIChwcmVmaXhlZCksIGluY2x1ZGluZyBtYWpvciwgbWlub3JcbiAgICAgKiBhbmQgcGF0Y2ggdmVyc2lvbiBudW1iZXJzLlxuICAgICAqIEByZXR1cm4gVGhlIHBhdGNoIHZlcnNpb24gc3RyaW5nIChwcmVmaXhlZClcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0UGF0Y2hWZXJzaW9uU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIGAke1ZFUlNJT05fU1RSSU5HX1BSRUZJWH0ke3RoaXMuX3NlbXZlci5tYWpvcn0uJHt0aGlzLl9zZW12ZXIubWlub3J9LiR7dGhpcy5fc2VtdmVyLnBhdGNofWA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDb21wYXJlcyB0aGlzIHZlcnNpb24gd2l0aCBvdGhlciBhbmQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSB0aGlzIHZlcnNpb25cbiAgICAgKiBpcyBsZXNzLCBncmVhdGVyIG9yIGVxdWFsIHRvIG90aGVyLlxuICAgICAqIEBwYXJhbSBvdGhlciAtIFRoZSBvdGhlciB2ZXJzaW9uIHRvIGNvbXBhcmUgdG9cbiAgICAgKiBAcmV0dXJuIC0xIGlmIHRoaXMgdmVyc2lvbiBpcyBsZXNzIHRoYW4gb3RoZXIuIDEgaWYgdGhpcyB2ZXJzaW9uIGlzXG4gICAgICogZ3JlYXRlciB0aGFuIG90aGVyLiAgMCBpZiB0aGlzIHZlcnNpb24gZXF1YWxzIG90aGVyLlxuICAgICAqL1xuICAgIHB1YmxpYyBjb21wYXJlKG90aGVyOiBTZW1WZXIpOiAtMSB8IDAgfCAxXG4gICAge1xuICAgICAgICByZXR1cm4gc2VtdmVyLmNvbXBhcmUodGhpcy5fc2VtdmVyLCBvdGhlci5fc2VtdmVyKTtcbiAgICB9XG5cbn1cbiJdfQ==
