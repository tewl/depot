"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var os = require("os");
var directory_1 = require("./directory");
/**
 * An enumeration of operating systems supported by this tool.
 */
var OperatingSystem;
(function (OperatingSystem) {
    OperatingSystem["UNKNOWN"] = "UNKNOWN";
    OperatingSystem["MAC"] = "MAC";
    OperatingSystem["WINDOWS"] = "WINDOWS";
})(OperatingSystem = exports.OperatingSystem || (exports.OperatingSystem = {}));
/**
 * Gets the current OS.
 * @return The current OS
 */
function getOs() {
    var platform = os.platform();
    if (platform.startsWith("win")) {
        return OperatingSystem.WINDOWS;
    }
    else if (platform === "darwin") {
        return OperatingSystem.MAC;
    }
    else {
        return OperatingSystem.UNKNOWN;
    }
}
exports.getOs = getOs;
/**
 * Gets the current user's home directory
 * @return The current user's home directory
 */
function getHomeDir() {
    var dirStr = os.homedir();
    return new directory_1.Directory(dirStr);
}
exports.getHomeDir = getHomeDir;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9vcy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVCQUF5QjtBQUN6Qix5Q0FBd0M7QUFHeEM7O0dBRUc7QUFDSCxJQUFZLGVBSVg7QUFKRCxXQUFZLGVBQWU7SUFDdkIsc0NBQW1CLENBQUE7SUFDbkIsOEJBQVcsQ0FBQTtJQUNYLHNDQUFtQixDQUFBO0FBQ3ZCLENBQUMsRUFKVyxlQUFlLEdBQWYsdUJBQWUsS0FBZix1QkFBZSxRQUkxQjtBQUdEOzs7R0FHRztBQUNILFNBQWdCLEtBQUs7SUFDakIsSUFBTSxRQUFRLEdBQUcsRUFBRSxDQUFDLFFBQVEsRUFBRSxDQUFDO0lBRS9CLElBQUksUUFBUSxDQUFDLFVBQVUsQ0FBQyxLQUFLLENBQUMsRUFBRTtRQUM1QixPQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUM7S0FDbEM7U0FDSSxJQUFJLFFBQVEsS0FBSyxRQUFRLEVBQUU7UUFDNUIsT0FBTyxlQUFlLENBQUMsR0FBRyxDQUFDO0tBQzlCO1NBQ0k7UUFDRCxPQUFPLGVBQWUsQ0FBQyxPQUFPLENBQUM7S0FDbEM7QUFDTCxDQUFDO0FBWkQsc0JBWUM7QUFHRDs7O0dBR0c7QUFDSCxTQUFnQixVQUFVO0lBQ3RCLElBQU0sTUFBTSxHQUFHLEVBQUUsQ0FBQyxPQUFPLEVBQUUsQ0FBQztJQUM1QixPQUFPLElBQUkscUJBQVMsQ0FBQyxNQUFNLENBQUMsQ0FBQztBQUNqQyxDQUFDO0FBSEQsZ0NBR0MiLCJmaWxlIjoib3MuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBvcyBmcm9tIFwib3NcIjtcbmltcG9ydCB7IERpcmVjdG9yeSB9IGZyb20gXCIuL2RpcmVjdG9yeVwiO1xuXG5cbi8qKlxuICogQW4gZW51bWVyYXRpb24gb2Ygb3BlcmF0aW5nIHN5c3RlbXMgc3VwcG9ydGVkIGJ5IHRoaXMgdG9vbC5cbiAqL1xuZXhwb3J0IGVudW0gT3BlcmF0aW5nU3lzdGVtIHtcbiAgICBVTktOT1dOID0gXCJVTktOT1dOXCIsXG4gICAgTUFDID0gXCJNQUNcIixcbiAgICBXSU5ET1dTID0gXCJXSU5ET1dTXCJcbn1cblxuXG4vKipcbiAqIEdldHMgdGhlIGN1cnJlbnQgT1MuXG4gKiBAcmV0dXJuIFRoZSBjdXJyZW50IE9TXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRPcygpOiBPcGVyYXRpbmdTeXN0ZW0ge1xuICAgIGNvbnN0IHBsYXRmb3JtID0gb3MucGxhdGZvcm0oKTtcblxuICAgIGlmIChwbGF0Zm9ybS5zdGFydHNXaXRoKFwid2luXCIpKSB7XG4gICAgICAgIHJldHVybiBPcGVyYXRpbmdTeXN0ZW0uV0lORE9XUztcbiAgICB9XG4gICAgZWxzZSBpZiAocGxhdGZvcm0gPT09IFwiZGFyd2luXCIpIHtcbiAgICAgICAgcmV0dXJuIE9wZXJhdGluZ1N5c3RlbS5NQUM7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gT3BlcmF0aW5nU3lzdGVtLlVOS05PV047XG4gICAgfVxufVxuXG5cbi8qKlxuICogR2V0cyB0aGUgY3VycmVudCB1c2VyJ3MgaG9tZSBkaXJlY3RvcnlcbiAqIEByZXR1cm4gVGhlIGN1cnJlbnQgdXNlcidzIGhvbWUgZGlyZWN0b3J5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRIb21lRGlyKCk6IERpcmVjdG9yeSB7XG4gICAgY29uc3QgZGlyU3RyID0gb3MuaG9tZWRpcigpO1xuICAgIHJldHVybiBuZXcgRGlyZWN0b3J5KGRpclN0cik7XG59XG4iXX0=
