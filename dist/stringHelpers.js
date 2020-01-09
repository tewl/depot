"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var regexpHelpers_1 = require("./regexpHelpers");
/**
 * Counts the number of times padStr occurs at the beginning of str.
 * @param str - The string to inspect
 * @param padStr - The substring to count occurrences of
 * @return The number of times padStr occurs at the beginning of str
 */
function numInitial(str, padStr) {
    if (padStr === "") {
        return 0;
    }
    var curStr = str;
    var numOccurrences = 0;
    while (_.startsWith(curStr, padStr)) {
        ++numOccurrences;
        curStr = curStr.slice(padStr.length);
    }
    return numOccurrences;
}
exports.numInitial = numInitial;
/**
 * Creates a string where each line of src is indented.
 * @param src - The string to be indented
 * @param numSpacesOrPad - The number of spaces to indent each line
 * @param skipFirstLine - If truthy, the first line will not be indented
 * @return A new string where each line is indented
 */
function indent(src, numSpacesOrPad, skipFirstLine) {
    if (skipFirstLine === void 0) { skipFirstLine = false; }
    if (numSpacesOrPad === 0) {
        return src;
    }
    else {
        // If the caller specified a string, use that as the pad.  Otherwise,
        // treat the number as the number of spaces.
        var pad_1 = typeof numSpacesOrPad === "string" ?
            numSpacesOrPad :
            _.repeat(" ", numSpacesOrPad);
        // The only way replace() will replace all instances is to use the "g"
        // flag with replace(). Use the m flag so that ^ and $ match within the
        // string.
        var replaceRegex = /^(.*?)$/gm;
        var replaceFunc = function replaceFunc(match, group1, offset) {
            // If told to skip the first line and this is the first line, skip it.
            return skipFirstLine && (offset === 0) ?
                group1 :
                pad_1 + group1;
        };
        return _.replace(src, replaceRegex, replaceFunc);
    }
}
exports.indent = indent;
/**
 * Creates a new string where lines are no longer indented
 * @param str - The indented string
 * @param padStr - The string that has been used to indent lines in str
 * @param greedy - If `true`, as many occurrences of `padStr` will be removed as
 *     possible.  If `false`, only one occurrence will be removed.
 * @return A new version of str without the indentations
 */
function outdent(str, padStr, greedy) {
    if (padStr === void 0) { padStr = " "; }
    if (greedy === void 0) { greedy = true; }
    var lines = str.split(regexpHelpers_1.piNewline);
    var initOccurrences = _.map(lines, function (curLine) { return numInitial(curLine, padStr); });
    var numToRemove = _.min(initOccurrences);
    if (!greedy) {
        // We should not be greedy, so only remove (at most) 1 occurrence of
        // `padStr`.
        numToRemove = _.min([numToRemove, 1]);
    }
    var numCharsToRemove = padStr.length * numToRemove;
    var resultLines = _.map(lines, function (curLine) { return curLine.slice(numCharsToRemove); });
    // Join the lines back together again.
    return resultLines.join("\n");
}
exports.outdent = outdent;
var blankLineRegex = /^\s*$/;
/**
 * Creates a new version of str without leading and trailing blank lines
 * @param str - The original string
 * @return A version of str without leading and trailing blank lines
 */
function trimBlankLines(str) {
    var lines = str.split(regexpHelpers_1.piNewline);
    while ((lines.length > 0) &&
        blankLineRegex.test(lines[0])) {
        lines.shift();
    }
    while ((lines.length > 0) &&
        blankLineRegex.test(_.last(lines))) {
        lines.pop();
    }
    return lines.join("\n");
}
exports.trimBlankLines = trimBlankLines;
function removeBlankLines(str) {
    var lines = str.split(regexpHelpers_1.piNewline);
    lines = _.filter(lines, function (curLine) { return !blankLineRegex.test(curLine); });
    return lines.join("\n");
}
exports.removeBlankLines = removeBlankLines;
var whitespaceRegex = /\s+/g;
/**
 * Creates a new string in which all whitespace has been removed from str.
 * @param str - The original string to remove whitespace from
 * @return A new string in which all whitespace has been removed.
 */
function removeWhitespace(str) {
    return str.replace(whitespaceRegex, "");
}
exports.removeWhitespace = removeWhitespace;

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUMsZUFBZSxFQUFFLEVBQUUsQ0FBQyxDQUFDO0FBQzVDLENBQUM7QUFIRCw0Q0FHQyIsImZpbGUiOiJzdHJpbmdIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge3BpTmV3bGluZX0gZnJvbSBcIi4vcmVnZXhwSGVscGVyc1wiO1xuXG5cbi8qKlxuICogQ291bnRzIHRoZSBudW1iZXIgb2YgdGltZXMgcGFkU3RyIG9jY3VycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHN0ci5cbiAqIEBwYXJhbSBzdHIgLSBUaGUgc3RyaW5nIHRvIGluc3BlY3RcbiAqIEBwYXJhbSBwYWRTdHIgLSBUaGUgc3Vic3RyaW5nIHRvIGNvdW50IG9jY3VycmVuY2VzIG9mXG4gKiBAcmV0dXJuIFRoZSBudW1iZXIgb2YgdGltZXMgcGFkU3RyIG9jY3VycyBhdCB0aGUgYmVnaW5uaW5nIG9mIHN0clxuICovXG5leHBvcnQgZnVuY3Rpb24gbnVtSW5pdGlhbChzdHI6IHN0cmluZywgcGFkU3RyOiBzdHJpbmcpOiBudW1iZXJcbntcbiAgICBpZiAocGFkU3RyID09PSBcIlwiKVxuICAgIHtcbiAgICAgICAgcmV0dXJuIDA7XG4gICAgfVxuXG4gICAgbGV0IGN1clN0ciA9IHN0cjtcbiAgICBsZXQgbnVtT2NjdXJyZW5jZXMgPSAwO1xuXG4gICAgd2hpbGUgKF8uc3RhcnRzV2l0aChjdXJTdHIsIHBhZFN0cikpXG4gICAge1xuICAgICAgICArK251bU9jY3VycmVuY2VzO1xuICAgICAgICBjdXJTdHIgPSBjdXJTdHIuc2xpY2UocGFkU3RyLmxlbmd0aCk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG51bU9jY3VycmVuY2VzO1xufVxuXG5cbi8qKlxuICogQ3JlYXRlcyBhIHN0cmluZyB3aGVyZSBlYWNoIGxpbmUgb2Ygc3JjIGlzIGluZGVudGVkLlxuICogQHBhcmFtIHNyYyAtIFRoZSBzdHJpbmcgdG8gYmUgaW5kZW50ZWRcbiAqIEBwYXJhbSBudW1TcGFjZXNPclBhZCAtIFRoZSBudW1iZXIgb2Ygc3BhY2VzIHRvIGluZGVudCBlYWNoIGxpbmVcbiAqIEBwYXJhbSBza2lwRmlyc3RMaW5lIC0gSWYgdHJ1dGh5LCB0aGUgZmlyc3QgbGluZSB3aWxsIG5vdCBiZSBpbmRlbnRlZFxuICogQHJldHVybiBBIG5ldyBzdHJpbmcgd2hlcmUgZWFjaCBsaW5lIGlzIGluZGVudGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbmRlbnQoXG4gICAgc3JjOiBzdHJpbmcsXG4gICAgbnVtU3BhY2VzT3JQYWQ6IG51bWJlciB8IHN0cmluZyxcbiAgICBza2lwRmlyc3RMaW5lOiBib29sZWFuID0gZmFsc2Vcbik6IHN0cmluZyB7XG4gICAgaWYgKG51bVNwYWNlc09yUGFkID09PSAwKSB7XG4gICAgICAgIHJldHVybiBzcmM7XG4gICAgfVxuICAgIGVsc2VcbiAgICB7XG4gICAgICAgIC8vIElmIHRoZSBjYWxsZXIgc3BlY2lmaWVkIGEgc3RyaW5nLCB1c2UgdGhhdCBhcyB0aGUgcGFkLiAgT3RoZXJ3aXNlLFxuICAgICAgICAvLyB0cmVhdCB0aGUgbnVtYmVyIGFzIHRoZSBudW1iZXIgb2Ygc3BhY2VzLlxuICAgICAgICBjb25zdCBwYWQ6IHN0cmluZyA9IHR5cGVvZiBudW1TcGFjZXNPclBhZCA9PT0gXCJzdHJpbmdcIiA/XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgbnVtU3BhY2VzT3JQYWQgOlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF8ucmVwZWF0KFwiIFwiLCBudW1TcGFjZXNPclBhZCk7XG5cbiAgICAgICAgLy8gVGhlIG9ubHkgd2F5IHJlcGxhY2UoKSB3aWxsIHJlcGxhY2UgYWxsIGluc3RhbmNlcyBpcyB0byB1c2UgdGhlIFwiZ1wiXG4gICAgICAgIC8vIGZsYWcgd2l0aCByZXBsYWNlKCkuIFVzZSB0aGUgbSBmbGFnIHNvIHRoYXQgXiBhbmQgJCBtYXRjaCB3aXRoaW4gdGhlXG4gICAgICAgIC8vIHN0cmluZy5cbiAgICAgICAgY29uc3QgcmVwbGFjZVJlZ2V4OiBSZWdFeHAgPSAvXiguKj8pJC9nbTtcbiAgICAgICAgY29uc3QgcmVwbGFjZUZ1bmMgPSBmdW5jdGlvbiByZXBsYWNlRnVuYyhcbiAgICAgICAgICAgIG1hdGNoOiBhbnksXG4gICAgICAgICAgICBncm91cDE6IHN0cmluZyxcbiAgICAgICAgICAgIG9mZnNldDogbnVtYmVyXG4gICAgICAgICk6IHN0cmluZyB7XG4gICAgICAgICAgICAvLyBJZiB0b2xkIHRvIHNraXAgdGhlIGZpcnN0IGxpbmUgYW5kIHRoaXMgaXMgdGhlIGZpcnN0IGxpbmUsIHNraXAgaXQuXG4gICAgICAgICAgICByZXR1cm4gc2tpcEZpcnN0TGluZSAmJiAob2Zmc2V0ID09PSAwKSA/XG4gICAgICAgICAgICAgICAgICAgZ3JvdXAxIDpcbiAgICAgICAgICAgICAgICAgICBwYWQgKyBncm91cDE7XG4gICAgICAgIH07XG5cbiAgICAgICAgcmV0dXJuIF8ucmVwbGFjZShzcmMsIHJlcGxhY2VSZWdleCwgcmVwbGFjZUZ1bmMpO1xuICAgIH1cbn1cblxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgc3RyaW5nIHdoZXJlIGxpbmVzIGFyZSBubyBsb25nZXIgaW5kZW50ZWRcbiAqIEBwYXJhbSBzdHIgLSBUaGUgaW5kZW50ZWQgc3RyaW5nXG4gKiBAcGFyYW0gcGFkU3RyIC0gVGhlIHN0cmluZyB0aGF0IGhhcyBiZWVuIHVzZWQgdG8gaW5kZW50IGxpbmVzIGluIHN0clxuICogQHBhcmFtIGdyZWVkeSAtIElmIGB0cnVlYCwgYXMgbWFueSBvY2N1cnJlbmNlcyBvZiBgcGFkU3RyYCB3aWxsIGJlIHJlbW92ZWQgYXNcbiAqICAgICBwb3NzaWJsZS4gIElmIGBmYWxzZWAsIG9ubHkgb25lIG9jY3VycmVuY2Ugd2lsbCBiZSByZW1vdmVkLlxuICogQHJldHVybiBBIG5ldyB2ZXJzaW9uIG9mIHN0ciB3aXRob3V0IHRoZSBpbmRlbnRhdGlvbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG91dGRlbnQoc3RyOiBzdHJpbmcsIHBhZFN0cjogc3RyaW5nID0gXCIgXCIsIGdyZWVkeTogYm9vbGVhbiA9IHRydWUpOiBzdHJpbmdcbntcbiAgICBjb25zdCBsaW5lcyA9IHN0ci5zcGxpdChwaU5ld2xpbmUpO1xuICAgIGNvbnN0IGluaXRPY2N1cnJlbmNlcyA9IF8ubWFwKGxpbmVzLCAoY3VyTGluZSkgPT4gbnVtSW5pdGlhbChjdXJMaW5lLCBwYWRTdHIpKTtcbiAgICBsZXQgbnVtVG9SZW1vdmUgPSBfLm1pbihpbml0T2NjdXJyZW5jZXMpO1xuICAgIGlmICghZ3JlZWR5KSB7XG4gICAgICAgIC8vIFdlIHNob3VsZCBub3QgYmUgZ3JlZWR5LCBzbyBvbmx5IHJlbW92ZSAoYXQgbW9zdCkgMSBvY2N1cnJlbmNlIG9mXG4gICAgICAgIC8vIGBwYWRTdHJgLlxuICAgICAgICBudW1Ub1JlbW92ZSA9IF8ubWluKFtudW1Ub1JlbW92ZSwgMV0pO1xuICAgIH1cblxuICAgIGNvbnN0IG51bUNoYXJzVG9SZW1vdmUgPSBwYWRTdHIubGVuZ3RoICogbnVtVG9SZW1vdmUhO1xuXG4gICAgY29uc3QgcmVzdWx0TGluZXMgPSBfLm1hcChsaW5lcywgKGN1ckxpbmUpID0+IGN1ckxpbmUuc2xpY2UobnVtQ2hhcnNUb1JlbW92ZSkpO1xuICAgIC8vIEpvaW4gdGhlIGxpbmVzIGJhY2sgdG9nZXRoZXIgYWdhaW4uXG4gICAgcmV0dXJuIHJlc3VsdExpbmVzLmpvaW4oXCJcXG5cIik7XG59XG5cblxuY29uc3QgYmxhbmtMaW5lUmVnZXggPSAvXlxccyokLztcblxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVyc2lvbiBvZiBzdHIgd2l0aG91dCBsZWFkaW5nIGFuZCB0cmFpbGluZyBibGFuayBsaW5lc1xuICogQHBhcmFtIHN0ciAtIFRoZSBvcmlnaW5hbCBzdHJpbmdcbiAqIEByZXR1cm4gQSB2ZXJzaW9uIG9mIHN0ciB3aXRob3V0IGxlYWRpbmcgYW5kIHRyYWlsaW5nIGJsYW5rIGxpbmVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmltQmxhbmtMaW5lcyhzdHI6IHN0cmluZyk6IHN0cmluZ1xue1xuICAgIGNvbnN0IGxpbmVzID0gc3RyLnNwbGl0KHBpTmV3bGluZSk7XG5cbiAgICB3aGlsZSAoKGxpbmVzLmxlbmd0aCA+IDApICYmXG4gICAgICAgICAgYmxhbmtMaW5lUmVnZXgudGVzdChsaW5lc1swXSkpXG4gICAge1xuICAgICAgICBsaW5lcy5zaGlmdCgpO1xuICAgIH1cblxuICAgIHdoaWxlICgobGluZXMubGVuZ3RoID4gMCkgJiZcbiAgICAgICAgICBibGFua0xpbmVSZWdleC50ZXN0KF8ubGFzdChsaW5lcykhKSlcbiAgICB7XG4gICAgICAgIGxpbmVzLnBvcCgpO1xuICAgIH1cblxuICAgIHJldHVybiBsaW5lcy5qb2luKFwiXFxuXCIpO1xufVxuXG5cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVCbGFua0xpbmVzKHN0cjogc3RyaW5nKTogc3RyaW5nXG57XG4gICAgbGV0IGxpbmVzID0gc3RyLnNwbGl0KHBpTmV3bGluZSk7XG4gICAgbGluZXMgPSBfLmZpbHRlcihsaW5lcywgKGN1ckxpbmUpID0+ICFibGFua0xpbmVSZWdleC50ZXN0KGN1ckxpbmUpKTtcbiAgICByZXR1cm4gbGluZXMuam9pbihcIlxcblwiKTtcbn1cblxuXG5jb25zdCB3aGl0ZXNwYWNlUmVnZXggPSAvXFxzKy9nO1xuXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBzdHJpbmcgaW4gd2hpY2ggYWxsIHdoaXRlc3BhY2UgaGFzIGJlZW4gcmVtb3ZlZCBmcm9tIHN0ci5cbiAqIEBwYXJhbSBzdHIgLSBUaGUgb3JpZ2luYWwgc3RyaW5nIHRvIHJlbW92ZSB3aGl0ZXNwYWNlIGZyb21cbiAqIEByZXR1cm4gQSBuZXcgc3RyaW5nIGluIHdoaWNoIGFsbCB3aGl0ZXNwYWNlIGhhcyBiZWVuIHJlbW92ZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByZW1vdmVXaGl0ZXNwYWNlKHN0cjogc3RyaW5nKTogc3RyaW5nXG57XG4gICAgcmV0dXJuIHN0ci5yZXBsYWNlKHdoaXRlc3BhY2VSZWdleCwgXCJcIik7XG59XG4iXX0=
