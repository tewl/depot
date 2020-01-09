"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var request = require("request-promise");
/*
 * Note:
 * The request-promise library is a `devDependency`, because this library does
 * not expose any of its types.  If this changes in the future, request-promise
 * should be moved from `devDependencies` to `dependencies`.
 */
/**
 * Determines whether the specified URL is GET-able.
 * @param url - The URL to GET
 * @return Resolves with a boolean value indicating whether the specified URL is
 * GET-able.
 */
function urlIsGettable(url) {
    return request(url)
        .then(function () { return true; }, function () { return false; });
}
exports.urlIsGettable = urlIsGettable;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9yZXF1ZXN0SGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlDQUEyQztBQUkzQzs7Ozs7R0FLRztBQUdIOzs7OztHQUtHO0FBQ0gsU0FBZ0IsYUFBYSxDQUFDLEdBQVc7SUFDckMsT0FBTyxPQUFPLENBQUMsR0FBRyxDQUFDO1NBQ2xCLElBQUksQ0FDRCxjQUFNLE9BQUEsSUFBSSxFQUFKLENBQUksRUFDVixjQUFNLE9BQUEsS0FBSyxFQUFMLENBQUssQ0FDZCxDQUFDO0FBQ04sQ0FBQztBQU5ELHNDQU1DIiwiZmlsZSI6InJlcXVlc3RIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgcmVxdWVzdCBmcm9tIFwicmVxdWVzdC1wcm9taXNlXCI7XG5cbmV4cG9ydCB0eXBlIFJlcXVlc3RUeXBlID0gdHlwZW9mIHJlcXVlc3Q7ICAgLy8gRG9lcyB0aGlzIHdvcms/XG5cbi8qXG4gKiBOb3RlOlxuICogVGhlIHJlcXVlc3QtcHJvbWlzZSBsaWJyYXJ5IGlzIGEgYGRldkRlcGVuZGVuY3lgLCBiZWNhdXNlIHRoaXMgbGlicmFyeSBkb2VzXG4gKiBub3QgZXhwb3NlIGFueSBvZiBpdHMgdHlwZXMuICBJZiB0aGlzIGNoYW5nZXMgaW4gdGhlIGZ1dHVyZSwgcmVxdWVzdC1wcm9taXNlXG4gKiBzaG91bGQgYmUgbW92ZWQgZnJvbSBgZGV2RGVwZW5kZW5jaWVzYCB0byBgZGVwZW5kZW5jaWVzYC5cbiAqL1xuXG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVVJMIGlzIEdFVC1hYmxlLlxuICogQHBhcmFtIHVybCAtIFRoZSBVUkwgdG8gR0VUXG4gKiBAcmV0dXJuIFJlc29sdmVzIHdpdGggYSBib29sZWFuIHZhbHVlIGluZGljYXRpbmcgd2hldGhlciB0aGUgc3BlY2lmaWVkIFVSTCBpc1xuICogR0VULWFibGUuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB1cmxJc0dldHRhYmxlKHVybDogc3RyaW5nKTogUHJvbWlzZTxib29sZWFuPiB7XG4gICAgcmV0dXJuIHJlcXVlc3QodXJsKVxuICAgIC50aGVuKFxuICAgICAgICAoKSA9PiB0cnVlLFxuICAgICAgICAoKSA9PiBmYWxzZVxuICAgICk7XG59XG4iXX0=
