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
var os = require("os");
var net = require("net");
var _ = require("lodash");
var BBPromise = require("bluebird");
/**
 * Enumerates the external IPv4 addresses
 * @return An object in which the keys are the names of the network interfaces
 * and the values are the IPv4 addresses (as strings)
 */
function getExternalIpv4Addresses() {
    var e_1, _a;
    var foundInterfaces = {};
    var networkInterfaces = os.networkInterfaces();
    for (var curInterfaceName in networkInterfaces) {
        if (networkInterfaces.hasOwnProperty(curInterfaceName)) {
            var addrArray = networkInterfaces[curInterfaceName];
            try {
                for (var addrArray_1 = (e_1 = void 0, __values(addrArray)), addrArray_1_1 = addrArray_1.next(); !addrArray_1_1.done; addrArray_1_1 = addrArray_1.next()) {
                    var curAddr = addrArray_1_1.value;
                    if ((curAddr.family === "IPv4") && (!curAddr.internal)) {
                        foundInterfaces[curInterfaceName] = curAddr.address;
                    }
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (addrArray_1_1 && !addrArray_1_1.done && (_a = addrArray_1.return)) _a.call(addrArray_1);
                }
                finally { if (e_1) throw e_1.error; }
            }
        }
    }
    return foundInterfaces;
}
exports.getExternalIpv4Addresses = getExternalIpv4Addresses;
/**
 * Gets the first externally exposed IPv4 address
 * @return The first externally exposed IPv4 address
 */
function getFirstExternalIpv4Address() {
    var addresses = getExternalIpv4Addresses();
    var address = _.first(_.values(addresses));
    return address;
}
exports.getFirstExternalIpv4Address = getFirstExternalIpv4Address;
/**
 * Helper function that will determine if the specified port is available.
 * @param port - The port to test.  Specify 0 if you want to find the first
 * available port.
 * @return A promise that resolves with the port when available.  It rejects if
 * the specified port is not available.
 */
function isAvailable(port) {
    return new BBPromise(function (resolve, reject) {
        var server = net.createServer();
        server.unref();
        server.on("error", reject);
        server.listen({ port: port }, function () {
            // address() will return a string when listening on a pipe or UNIX
            // domain socket, but we are not doing that and will always get an
            // AddressInfo.
            var port = server.address().port;
            server.close(function () {
                resolve(port);
            });
        });
    });
}
/**
 * Determines whether the specified TCP port is available.
 * @param port - The port to check
 * @return A promise that always resolves with a boolean indicating whether the
 * specified port is available.
 */
function isTcpPortAvailable(port) {
    return isAvailable(port)
        .then(function () { return true; })
        .catch(function () { return false; });
}
exports.isTcpPortAvailable = isTcpPortAvailable;
/**
 * Gets an available TCP port number
 * @return An available TCP port number
 */
function getAvailableTcpPort() {
    return isAvailable(0);
}
exports.getAvailableTcpPort = getAvailableTcpPort;
/**
 * Gets an available TCP port number, choosing from the optional preferred ports
 * first.  If none of those are available, the first available TCP port is
 * returned.
 * @param preferredPorts - Ports that will be checked first to see if they are
 * available
 * @return An available TCP port number
 */
function selectAvailableTcpPort() {
    var preferredPorts = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        preferredPorts[_i] = arguments[_i];
    }
    // Remove any preferred ports that we know cannot be used.
    _.remove(preferredPorts, function (curPort) { return curPort === 0; });
    return _.reduce(__spread(preferredPorts, [0]), function (acc, curPort) {
        return acc.catch(function () { return isAvailable(curPort); });
    }, BBPromise.reject(undefined));
}
exports.selectAvailableTcpPort = selectAvailableTcpPort;
/**
 * Determines a TCP port that a server can run at.
 * @param portConfig - Object describing the port requirements/preferences
 * @return A promise that resolves with an available TCP port number.  The
 * promise rejects if the caller specified a required port number that is
 * not available.
 */
function determinePort(portConfig) {
    portConfig = portConfig || {};
    return BBPromise.resolve()
        .then(function () {
        if (!(portConfig.requiredPort)) {
            // There is no required port.  Yield 0.
            return 0;
        }
        // There is a required port.  If it is available, use it.  Otherwise
        // reject.
        return isTcpPortAvailable(portConfig.requiredPort)
            .then(function (isAvailable) {
            if (isAvailable) {
                return portConfig.requiredPort;
            }
            throw new Error("Required port " + portConfig.requiredPort + " is not available.");
        });
    })
        .then(function (port) {
        // If we have decided on a port, use it.
        if (port) {
            return port;
        }
        // If the client specified a preferred port, try to use that.
        // If not available, select a random one.
        return selectAvailableTcpPort(portConfig.preferredPort || 0);
    });
}
exports.determinePort = determinePort;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9uZXR3b3JrSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLHVCQUF5QjtBQUN6Qix5QkFBMkI7QUFDM0IsMEJBQTRCO0FBQzVCLG9DQUFzQztBQUd0Qzs7OztHQUlHO0FBQ0gsU0FBZ0Isd0JBQXdCOztJQUVwQyxJQUFNLGVBQWUsR0FBNkMsRUFBRSxDQUFDO0lBRXJFLElBQU0saUJBQWlCLEdBQUcsRUFBRSxDQUFDLGlCQUFpQixFQUFFLENBQUM7SUFFakQsS0FBSyxJQUFNLGdCQUFnQixJQUFJLGlCQUFpQixFQUFFO1FBQzlDLElBQUksaUJBQWlCLENBQUMsY0FBYyxDQUFDLGdCQUFnQixDQUFDLEVBQUU7WUFDcEQsSUFBTSxTQUFTLEdBQUcsaUJBQWlCLENBQUMsZ0JBQWdCLENBQUMsQ0FBQzs7Z0JBQ3RELEtBQXNCLElBQUEsNkJBQUEsU0FBQSxTQUFTLENBQUEsQ0FBQSxvQ0FBQSwyREFBRTtvQkFBNUIsSUFBTSxPQUFPLHNCQUFBO29CQUNkLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxLQUFLLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQyxPQUFPLENBQUMsUUFBUSxDQUFDLEVBQUU7d0JBQ3BELGVBQWUsQ0FBQyxnQkFBZ0IsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxPQUFPLENBQUM7cUJBQ3ZEO2lCQUNKOzs7Ozs7Ozs7U0FDSjtLQUNKO0lBRUQsT0FBTyxlQUFlLENBQUM7QUFDM0IsQ0FBQztBQWxCRCw0REFrQkM7QUFHRDs7O0dBR0c7QUFDSCxTQUFnQiwyQkFBMkI7SUFFdkMsSUFBTSxTQUFTLEdBQUcsd0JBQXdCLEVBQUUsQ0FBQztJQUM3QyxJQUFNLE9BQU8sR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLENBQUUsQ0FBQztJQUM5QyxPQUFPLE9BQU8sQ0FBQztBQUNuQixDQUFDO0FBTEQsa0VBS0M7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QUMsQ0FBQztBQUNQLENBQUM7QUE3QkQsc0NBNkJDIiwiZmlsZSI6Im5ldHdvcmtIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgb3MgZnJvbSBcIm9zXCI7XG5pbXBvcnQgKiBhcyBuZXQgZnJvbSBcIm5ldFwiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5cblxuLyoqXG4gKiBFbnVtZXJhdGVzIHRoZSBleHRlcm5hbCBJUHY0IGFkZHJlc3Nlc1xuICogQHJldHVybiBBbiBvYmplY3QgaW4gd2hpY2ggdGhlIGtleXMgYXJlIHRoZSBuYW1lcyBvZiB0aGUgbmV0d29yayBpbnRlcmZhY2VzXG4gKiBhbmQgdGhlIHZhbHVlcyBhcmUgdGhlIElQdjQgYWRkcmVzc2VzIChhcyBzdHJpbmdzKVxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0RXh0ZXJuYWxJcHY0QWRkcmVzc2VzKCk6IHtbbmV0d29ya0ludGVyZmFjZU5hbWU6IHN0cmluZ106IHN0cmluZ30ge1xuXG4gICAgY29uc3QgZm91bmRJbnRlcmZhY2VzOiB7W25ldHdvcmtJbnRlcmZhY2VOYW1lOiBzdHJpbmddOiBzdHJpbmd9ID0ge307XG5cbiAgICBjb25zdCBuZXR3b3JrSW50ZXJmYWNlcyA9IG9zLm5ldHdvcmtJbnRlcmZhY2VzKCk7XG5cbiAgICBmb3IgKGNvbnN0IGN1ckludGVyZmFjZU5hbWUgaW4gbmV0d29ya0ludGVyZmFjZXMpIHtcbiAgICAgICAgaWYgKG5ldHdvcmtJbnRlcmZhY2VzLmhhc093blByb3BlcnR5KGN1ckludGVyZmFjZU5hbWUpKSB7XG4gICAgICAgICAgICBjb25zdCBhZGRyQXJyYXkgPSBuZXR3b3JrSW50ZXJmYWNlc1tjdXJJbnRlcmZhY2VOYW1lXTtcbiAgICAgICAgICAgIGZvciAoY29uc3QgY3VyQWRkciBvZiBhZGRyQXJyYXkpIHtcbiAgICAgICAgICAgICAgICBpZiAoKGN1ckFkZHIuZmFtaWx5ID09PSBcIklQdjRcIikgJiYgKCFjdXJBZGRyLmludGVybmFsKSkge1xuICAgICAgICAgICAgICAgICAgICBmb3VuZEludGVyZmFjZXNbY3VySW50ZXJmYWNlTmFtZV0gPSBjdXJBZGRyLmFkZHJlc3M7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgcmV0dXJuIGZvdW5kSW50ZXJmYWNlcztcbn1cblxuXG4vKipcbiAqIEdldHMgdGhlIGZpcnN0IGV4dGVybmFsbHkgZXhwb3NlZCBJUHY0IGFkZHJlc3NcbiAqIEByZXR1cm4gVGhlIGZpcnN0IGV4dGVybmFsbHkgZXhwb3NlZCBJUHY0IGFkZHJlc3NcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpcnN0RXh0ZXJuYWxJcHY0QWRkcmVzcygpOiBzdHJpbmdcbntcbiAgICBjb25zdCBhZGRyZXNzZXMgPSBnZXRFeHRlcm5hbElwdjRBZGRyZXNzZXMoKTtcbiAgICBjb25zdCBhZGRyZXNzID0gXy5maXJzdChfLnZhbHVlcyhhZGRyZXNzZXMpKSE7XG4gICAgcmV0dXJuIGFkZHJlc3M7XG59XG5cblxuLyoqXG4gKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCB3aWxsIGRldGVybWluZSBpZiB0aGUgc3BlY2lmaWVkIHBvcnQgaXMgYXZhaWxhYmxlLlxuICogQHBhcmFtIHBvcnQgLSBUaGUgcG9ydCB0byB0ZXN0LiAgU3BlY2lmeSAwIGlmIHlvdSB3YW50IHRvIGZpbmQgdGhlIGZpcnN0XG4gKiBhdmFpbGFibGUgcG9ydC5cbiAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCB0aGUgcG9ydCB3aGVuIGF2YWlsYWJsZS4gIEl0IHJlamVjdHMgaWZcbiAqIHRoZSBzcGVjaWZpZWQgcG9ydCBpcyBub3QgYXZhaWxhYmxlLlxuICovXG5mdW5jdGlvbiBpc0F2YWlsYWJsZShwb3J0OiBudW1iZXIpOiBQcm9taXNlPG51bWJlcj5cbntcbiAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxudW1iZXI+KChyZXNvbHZlLCByZWplY3QpID0+IHtcbiAgICAgICAgY29uc3Qgc2VydmVyID0gbmV0LmNyZWF0ZVNlcnZlcigpO1xuICAgICAgICBzZXJ2ZXIudW5yZWYoKTtcbiAgICAgICAgc2VydmVyLm9uKFwiZXJyb3JcIiwgcmVqZWN0KTtcbiAgICAgICAgc2VydmVyLmxpc3Rlbih7cG9ydH0sICgpID0+IHtcbiAgICAgICAgICAgIC8vIGFkZHJlc3MoKSB3aWxsIHJldHVybiBhIHN0cmluZyB3aGVuIGxpc3RlbmluZyBvbiBhIHBpcGUgb3IgVU5JWFxuICAgICAgICAgICAgLy8gZG9tYWluIHNvY2tldCwgYnV0IHdlIGFyZSBub3QgZG9pbmcgdGhhdCBhbmQgd2lsbCBhbHdheXMgZ2V0IGFuXG4gICAgICAgICAgICAvLyBBZGRyZXNzSW5mby5cbiAgICAgICAgICAgIGNvbnN0IHtwb3J0fSA9IHNlcnZlci5hZGRyZXNzKCkgYXMgbmV0LkFkZHJlc3NJbmZvO1xuICAgICAgICAgICAgc2VydmVyLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICAgICAgICByZXNvbHZlKHBvcnQpO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBzcGVjaWZpZWQgVENQIHBvcnQgaXMgYXZhaWxhYmxlLlxuICogQHBhcmFtIHBvcnQgLSBUaGUgcG9ydCB0byBjaGVja1xuICogQHJldHVybiBBIHByb21pc2UgdGhhdCBhbHdheXMgcmVzb2x2ZXMgd2l0aCBhIGJvb2xlYW4gaW5kaWNhdGluZyB3aGV0aGVyIHRoZVxuICogc3BlY2lmaWVkIHBvcnQgaXMgYXZhaWxhYmxlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gaXNUY3BQb3J0QXZhaWxhYmxlKHBvcnQ6IG51bWJlcik6IFByb21pc2U8Ym9vbGVhbj5cbntcbiAgICByZXR1cm4gaXNBdmFpbGFibGUocG9ydClcbiAgICAudGhlbigoKSA9PiB0cnVlKVxuICAgIC5jYXRjaCgoKSA9PiBmYWxzZSk7XG59XG5cblxuLyoqXG4gKiBHZXRzIGFuIGF2YWlsYWJsZSBUQ1AgcG9ydCBudW1iZXJcbiAqIEByZXR1cm4gQW4gYXZhaWxhYmxlIFRDUCBwb3J0IG51bWJlclxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXZhaWxhYmxlVGNwUG9ydCgpOiBQcm9taXNlPG51bWJlcj5cbntcbiAgICByZXR1cm4gaXNBdmFpbGFibGUoMCk7XG59XG5cblxuLyoqXG4gKiBHZXRzIGFuIGF2YWlsYWJsZSBUQ1AgcG9ydCBudW1iZXIsIGNob29zaW5nIGZyb20gdGhlIG9wdGlvbmFsIHByZWZlcnJlZCBwb3J0c1xuICogZmlyc3QuICBJZiBub25lIG9mIHRob3NlIGFyZSBhdmFpbGFibGUsIHRoZSBmaXJzdCBhdmFpbGFibGUgVENQIHBvcnQgaXNcbiAqIHJldHVybmVkLlxuICogQHBhcmFtIHByZWZlcnJlZFBvcnRzIC0gUG9ydHMgdGhhdCB3aWxsIGJlIGNoZWNrZWQgZmlyc3QgdG8gc2VlIGlmIHRoZXkgYXJlXG4gKiBhdmFpbGFibGVcbiAqIEByZXR1cm4gQW4gYXZhaWxhYmxlIFRDUCBwb3J0IG51bWJlclxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VsZWN0QXZhaWxhYmxlVGNwUG9ydCguLi5wcmVmZXJyZWRQb3J0czogQXJyYXk8bnVtYmVyPik6IFByb21pc2U8bnVtYmVyPlxue1xuICAgIC8vIFJlbW92ZSBhbnkgcHJlZmVycmVkIHBvcnRzIHRoYXQgd2Uga25vdyBjYW5ub3QgYmUgdXNlZC5cbiAgICBfLnJlbW92ZShwcmVmZXJyZWRQb3J0cywgKGN1clBvcnQpID0+IGN1clBvcnQgPT09IDApO1xuXG4gICAgcmV0dXJuIF8ucmVkdWNlPG51bWJlciwgUHJvbWlzZTxudW1iZXI+PihcbiAgICAgICAgWy4uLnByZWZlcnJlZFBvcnRzLCAwXSxcbiAgICAgICAgKGFjYywgY3VyUG9ydCkgPT4ge1xuICAgICAgICAgICAgcmV0dXJuIGFjYy5jYXRjaCgoKSA9PiBpc0F2YWlsYWJsZShjdXJQb3J0KSk7XG4gICAgICAgIH0sXG4gICAgICAgIEJCUHJvbWlzZS5yZWplY3QodW5kZWZpbmVkKVxuICAgICk7XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBJUG9ydENvbmZpZ1xue1xuICAgIHJlcXVpcmVkUG9ydD86IG51bWJlcjtcbiAgICBwcmVmZXJyZWRQb3J0PzogbnVtYmVyO1xufVxuXG5cbi8qKlxuICogRGV0ZXJtaW5lcyBhIFRDUCBwb3J0IHRoYXQgYSBzZXJ2ZXIgY2FuIHJ1biBhdC5cbiAqIEBwYXJhbSBwb3J0Q29uZmlnIC0gT2JqZWN0IGRlc2NyaWJpbmcgdGhlIHBvcnQgcmVxdWlyZW1lbnRzL3ByZWZlcmVuY2VzXG4gKiBAcmV0dXJuIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGggYW4gYXZhaWxhYmxlIFRDUCBwb3J0IG51bWJlci4gIFRoZVxuICogcHJvbWlzZSByZWplY3RzIGlmIHRoZSBjYWxsZXIgc3BlY2lmaWVkIGEgcmVxdWlyZWQgcG9ydCBudW1iZXIgdGhhdCBpc1xuICogbm90IGF2YWlsYWJsZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluZVBvcnQocG9ydENvbmZpZz86IElQb3J0Q29uZmlnKTogUHJvbWlzZTxudW1iZXI+XG57XG4gICAgcG9ydENvbmZpZyA9IHBvcnRDb25maWcgfHwge307XG5cbiAgICByZXR1cm4gQkJQcm9taXNlLnJlc29sdmUoKVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgaWYgKCEocG9ydENvbmZpZyEucmVxdWlyZWRQb3J0KSkge1xuICAgICAgICAgICAgLy8gVGhlcmUgaXMgbm8gcmVxdWlyZWQgcG9ydC4gIFlpZWxkIDAuXG4gICAgICAgICAgICByZXR1cm4gMDtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRoZXJlIGlzIGEgcmVxdWlyZWQgcG9ydC4gIElmIGl0IGlzIGF2YWlsYWJsZSwgdXNlIGl0LiAgT3RoZXJ3aXNlXG4gICAgICAgIC8vIHJlamVjdC5cbiAgICAgICAgcmV0dXJuIGlzVGNwUG9ydEF2YWlsYWJsZShwb3J0Q29uZmlnIS5yZXF1aXJlZFBvcnQhKVxuICAgICAgICAudGhlbigoaXNBdmFpbGFibGUpID0+IHtcbiAgICAgICAgICAgIGlmIChpc0F2YWlsYWJsZSkgeyByZXR1cm4gcG9ydENvbmZpZyEucmVxdWlyZWRQb3J0OyB9XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoYFJlcXVpcmVkIHBvcnQgJHtwb3J0Q29uZmlnIS5yZXF1aXJlZFBvcnR9IGlzIG5vdCBhdmFpbGFibGUuYCk7XG4gICAgICAgIH0pO1xuICAgIH0pXG4gICAgLnRoZW4oKHBvcnQpID0+IHtcbiAgICAgICAgLy8gSWYgd2UgaGF2ZSBkZWNpZGVkIG9uIGEgcG9ydCwgdXNlIGl0LlxuICAgICAgICBpZiAocG9ydCkge1xuICAgICAgICAgICAgcmV0dXJuIHBvcnQ7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBJZiB0aGUgY2xpZW50IHNwZWNpZmllZCBhIHByZWZlcnJlZCBwb3J0LCB0cnkgdG8gdXNlIHRoYXQuXG4gICAgICAgIC8vIElmIG5vdCBhdmFpbGFibGUsIHNlbGVjdCBhIHJhbmRvbSBvbmUuXG4gICAgICAgIHJldHVybiBzZWxlY3RBdmFpbGFibGVUY3BQb3J0KHBvcnRDb25maWchLnByZWZlcnJlZFBvcnQgfHwgMCk7XG4gICAgfSk7XG59XG4iXX0=
