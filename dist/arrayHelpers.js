"use strict";
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __spread = (this && this.__spread) || function () {
    for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));
    return ar;
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
/**
 * Tests the strings in `strings` and returns the first non-null match.
 * @param strings - The array of strings to search
 * @param regex - The pattern to search for
 * @returns The first match found.  undefined if no match was found.
 */
function anyMatchRegex(strings, regex) {
    "use strict";
    var e_1, _a;
    try {
        for (var strings_1 = __values(strings), strings_1_1 = strings_1.next(); !strings_1_1.done; strings_1_1 = strings_1.next()) {
            var curString = strings_1_1.value;
            var curMatch = regex.exec(curString);
            if (curMatch) {
                return curMatch;
            }
        }
    }
    catch (e_1_1) { e_1 = { error: e_1_1 }; }
    finally {
        try {
            if (strings_1_1 && !strings_1_1.done && (_a = strings_1.return)) _a.call(strings_1);
        }
        finally { if (e_1) throw e_1.error; }
    }
    return undefined;
}
exports.anyMatchRegex = anyMatchRegex;
/**
 * Returns `items` when `condition` is truthy and returns [] when it is falsy.
 * This function and the array spread operator can be used together to
 * conditionally including array items in an array literal.  Inspired by
 * http://2ality.com/2017/04/conditional-literal-entries.html.
 *
 * @example
 * const arr = [
 *     "always present",
 *     ...insertIf(cond, "a", "b", "c"),
 *     "always present"
 * ];
 *
 * @param condition - The condition that controls whether to insert the items
 * @param items - The items that will be in the returned array if `condition` is
 * truthy
 * @return An array containing `items` if `condition` is truthy.  An empty array
 * if `condition` is falsy.
 */
function insertIf(condition) {
    var items = [];
    for (var _i = 1; _i < arguments.length; _i++) {
        items[_i - 1] = arguments[_i];
    }
    return condition ? items : [];
}
exports.insertIf = insertIf;
function permutations(vals) {
    if (vals.length === 0) {
        return [];
    }
    if (vals.length === 1) {
        return [vals];
    }
    var allPermutations = [];
    var _loop_1 = function (curIndex) {
        var rest = _.filter(vals, function (val, index) { return index !== curIndex; });
        var restPermutations = permutations(rest);
        allPermutations = allPermutations.concat(_.map(restPermutations, function (curRestPermutation) { return __spread([vals[curIndex]], curRestPermutation); }));
    };
    // To calculate the permutations, calculate the permutations where each
    // element is the first element.
    for (var curIndex = 0; curIndex < vals.length; ++curIndex) {
        _loop_1(curIndex);
    }
    return allPermutations;
}
exports.permutations = permutations;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hcnJheUhlbHBlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwQkFBNEI7QUFFNUI7Ozs7O0dBS0c7QUFDSCxTQUFnQixhQUFhLENBQUMsT0FBc0IsRUFBRSxLQUFhO0lBQy9ELFlBQVksQ0FBQzs7O1FBRWIsS0FBd0IsSUFBQSxZQUFBLFNBQUEsT0FBTyxDQUFBLGdDQUFBLHFEQUFFO1lBQTVCLElBQU0sU0FBUyxvQkFBQTtZQUNoQixJQUFNLFFBQVEsR0FBeUIsS0FBSyxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQztZQUM3RCxJQUFJLFFBQVEsRUFBRTtnQkFDVixPQUFPLFFBQVEsQ0FBQzthQUNuQjtTQUNKOzs7Ozs7Ozs7SUFFRCxPQUFPLFNBQVMsQ0FBQztBQUNyQixDQUFDO0FBWEQsc0NBV0M7QUFHRDs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBa0JHO0FBQ0gsU0FBZ0IsUUFBUSxDQUFXLFNBQWM7SUFBRSxlQUF5QjtTQUF6QixVQUF5QixFQUF6QixxQkFBeUIsRUFBekIsSUFBeUI7UUFBekIsOEJBQXlCOztJQUN4RSxPQUFPLFNBQVMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUM7QUFDbEMsQ0FBQztBQUZELDRCQUVDO0FBR0QsU0FBZ0IsWUFBWSxDQUFJLElBQWM7SUFDMUMsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQixPQUFPLEVBQUUsQ0FBQztLQUNiO0lBRUQsSUFBSSxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtRQUNuQixPQUFPLENBQUMsSUFBSSxDQUFDLENBQUM7S0FDakI7SUFFRCxJQUFJLGVBQWUsR0FBb0IsRUFBRSxDQUFDOzRCQUlqQyxRQUFRO1FBQ2IsSUFBTSxJQUFJLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUUsVUFBQyxHQUFHLEVBQUUsS0FBSyxJQUFLLE9BQUEsS0FBSyxLQUFLLFFBQVEsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO1FBQ2hFLElBQU0sZ0JBQWdCLEdBQUcsWUFBWSxDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzVDLGVBQWUsR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxHQUFHLENBQUMsZ0JBQWdCLEVBQUUsVUFBQyxrQkFBa0IsSUFBSyxpQkFBQyxJQUFJLENBQUMsUUFBUSxDQUFDLEdBQUssa0JBQWtCLEdBQXRDLENBQXVDLENBQUMsQ0FBQyxDQUFDOztJQUx2SSx1RUFBdUU7SUFDdkUsZ0NBQWdDO0lBQ2hDLEtBQUssSUFBSSxRQUFRLEdBQUcsQ0FBQyxFQUFFLFFBQVEsR0FBRyxJQUFJLENBQUMsTUFBTSxFQUFFLEVBQUUsUUFBUTtnQkFBaEQsUUFBUTtLQUloQjtJQUVELE9BQU8sZUFBZSxDQUFDO0FBQzNCLENBQUM7QUFwQkQsb0NBb0JDIiwiZmlsZSI6ImFycmF5SGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuXG4vKipcbiAqIFRlc3RzIHRoZSBzdHJpbmdzIGluIGBzdHJpbmdzYCBhbmQgcmV0dXJucyB0aGUgZmlyc3Qgbm9uLW51bGwgbWF0Y2guXG4gKiBAcGFyYW0gc3RyaW5ncyAtIFRoZSBhcnJheSBvZiBzdHJpbmdzIHRvIHNlYXJjaFxuICogQHBhcmFtIHJlZ2V4IC0gVGhlIHBhdHRlcm4gdG8gc2VhcmNoIGZvclxuICogQHJldHVybnMgVGhlIGZpcnN0IG1hdGNoIGZvdW5kLiAgdW5kZWZpbmVkIGlmIG5vIG1hdGNoIHdhcyBmb3VuZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFueU1hdGNoUmVnZXgoc3RyaW5nczogQXJyYXk8c3RyaW5nPiwgcmVnZXg6IFJlZ0V4cCk6IFJlZ0V4cEV4ZWNBcnJheSB8IHVuZGVmaW5lZCB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBmb3IgKGNvbnN0IGN1clN0cmluZyBvZiBzdHJpbmdzKSB7XG4gICAgICAgIGNvbnN0IGN1ck1hdGNoOiBSZWdFeHBFeGVjQXJyYXl8bnVsbCA9IHJlZ2V4LmV4ZWMoY3VyU3RyaW5nKTtcbiAgICAgICAgaWYgKGN1ck1hdGNoKSB7XG4gICAgICAgICAgICByZXR1cm4gY3VyTWF0Y2g7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXR1cm4gdW5kZWZpbmVkO1xufVxuXG5cbi8qKlxuICogUmV0dXJucyBgaXRlbXNgIHdoZW4gYGNvbmRpdGlvbmAgaXMgdHJ1dGh5IGFuZCByZXR1cm5zIFtdIHdoZW4gaXQgaXMgZmFsc3kuXG4gKiBUaGlzIGZ1bmN0aW9uIGFuZCB0aGUgYXJyYXkgc3ByZWFkIG9wZXJhdG9yIGNhbiBiZSB1c2VkIHRvZ2V0aGVyIHRvXG4gKiBjb25kaXRpb25hbGx5IGluY2x1ZGluZyBhcnJheSBpdGVtcyBpbiBhbiBhcnJheSBsaXRlcmFsLiAgSW5zcGlyZWQgYnlcbiAqIGh0dHA6Ly8yYWxpdHkuY29tLzIwMTcvMDQvY29uZGl0aW9uYWwtbGl0ZXJhbC1lbnRyaWVzLmh0bWwuXG4gKlxuICogQGV4YW1wbGVcbiAqIGNvbnN0IGFyciA9IFtcbiAqICAgICBcImFsd2F5cyBwcmVzZW50XCIsXG4gKiAgICAgLi4uaW5zZXJ0SWYoY29uZCwgXCJhXCIsIFwiYlwiLCBcImNcIiksXG4gKiAgICAgXCJhbHdheXMgcHJlc2VudFwiXG4gKiBdO1xuICpcbiAqIEBwYXJhbSBjb25kaXRpb24gLSBUaGUgY29uZGl0aW9uIHRoYXQgY29udHJvbHMgd2hldGhlciB0byBpbnNlcnQgdGhlIGl0ZW1zXG4gKiBAcGFyYW0gaXRlbXMgLSBUaGUgaXRlbXMgdGhhdCB3aWxsIGJlIGluIHRoZSByZXR1cm5lZCBhcnJheSBpZiBgY29uZGl0aW9uYCBpc1xuICogdHJ1dGh5XG4gKiBAcmV0dXJuIEFuIGFycmF5IGNvbnRhaW5pbmcgYGl0ZW1zYCBpZiBgY29uZGl0aW9uYCBpcyB0cnV0aHkuICBBbiBlbXB0eSBhcnJheVxuICogaWYgYGNvbmRpdGlvbmAgaXMgZmFsc3kuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnNlcnRJZjxJdGVtVHlwZT4oY29uZGl0aW9uOiBhbnksIC4uLml0ZW1zOiBBcnJheTxJdGVtVHlwZT4pOiBBcnJheTxJdGVtVHlwZT4ge1xuICAgIHJldHVybiBjb25kaXRpb24gPyBpdGVtcyA6IFtdO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiBwZXJtdXRhdGlvbnM8VD4odmFsczogQXJyYXk8VD4pOiBBcnJheTxBcnJheTxUPj4ge1xuICAgIGlmICh2YWxzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICByZXR1cm4gW107XG4gICAgfVxuXG4gICAgaWYgKHZhbHMubGVuZ3RoID09PSAxKSB7XG4gICAgICAgIHJldHVybiBbdmFsc107XG4gICAgfVxuXG4gICAgbGV0IGFsbFBlcm11dGF0aW9uczogQXJyYXk8QXJyYXk8VD4+ID0gW107XG5cbiAgICAvLyBUbyBjYWxjdWxhdGUgdGhlIHBlcm11dGF0aW9ucywgY2FsY3VsYXRlIHRoZSBwZXJtdXRhdGlvbnMgd2hlcmUgZWFjaFxuICAgIC8vIGVsZW1lbnQgaXMgdGhlIGZpcnN0IGVsZW1lbnQuXG4gICAgZm9yIChsZXQgY3VySW5kZXggPSAwOyBjdXJJbmRleCA8IHZhbHMubGVuZ3RoOyArK2N1ckluZGV4KSB7XG4gICAgICAgIGNvbnN0IHJlc3QgPSBfLmZpbHRlcih2YWxzLCAodmFsLCBpbmRleCkgPT4gaW5kZXggIT09IGN1ckluZGV4KTtcbiAgICAgICAgY29uc3QgcmVzdFBlcm11dGF0aW9ucyA9IHBlcm11dGF0aW9ucyhyZXN0KTtcbiAgICAgICAgYWxsUGVybXV0YXRpb25zID0gYWxsUGVybXV0YXRpb25zLmNvbmNhdChfLm1hcChyZXN0UGVybXV0YXRpb25zLCAoY3VyUmVzdFBlcm11dGF0aW9uKSA9PiBbdmFsc1tjdXJJbmRleF0sIC4uLmN1clJlc3RQZXJtdXRhdGlvbl0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gYWxsUGVybXV0YXRpb25zO1xufVxuIl19
