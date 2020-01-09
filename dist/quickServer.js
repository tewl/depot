"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var http = require("http");
var https = require("https");
var _ = require("lodash");
var BBPromise = require("bluebird");
var networkHelpers_1 = require("./networkHelpers");
var request = require("request-promise");
/**
 * A wrapper around a http/https server that simplifies configuration and
 * programmatic control.
 *
 * See this classes unit test file for an example of how to create a derived
 * concrete class.
 */
var QuickServer = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new server instance.
     * This constructor is private, because `create()` should be used instead.
     *
     * @param port - The port number the server will run on (once `start()` is
     *   called)
     * @param sslConfig - `undefined` if a http server is desired.  If a https
     *   server is desired, this parameter must be given, specifying the private
     *   key and certificate.
     * @param requestListener - The request listener (This can be an Express
     *   app)
     */
    function QuickServer(port, sslConfig, requestListener) {
        this._connections = {};
        this._port = port;
        this._sslConfig = sslConfig;
        this._requestListener = requestListener;
    }
    Object.defineProperty(QuickServer.prototype, "server", {
        /**
         * Gets the wrapped HTTP server.  undefined is returned if there is no
         * server (i.e. listen() has not been called).
         */
        get: function () {
            return this._server;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QuickServer.prototype, "port", {
        /**
         * Gets the port that this server will run on (once `start()` is
         * called)
         */
        get: function () {
            return this._port;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QuickServer.prototype, "ipAddress", {
        /**
         * Gets the IP address of this server.
         */
        get: function () {
            return networkHelpers_1.getFirstExternalIpv4Address();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QuickServer.prototype, "url", {
        /**
         * Gets the URL of this server.
         */
        get: function () {
            var ipAddress = this.ipAddress;
            var protocol = this._sslConfig ? "https" : "http";
            return protocol + "://" + ipAddress + ":" + this._port;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QuickServer.prototype, "isReferenced", {
        get: function () {
            return this._isReferenced;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(QuickServer.prototype, "request", {
        /**
         * A request-promise object that can be used to make requests to this
         * server.
         */
        get: function () {
            var requestOptions = {
                baseUrl: this.url,
                json: true
            };
            // If this server is using a self-signed certificate, clients will not
            // be able to walk the certificate chain back to a root CA.  Typically,
            // this would cause a "self signed certificate" error.  To get around
            // this, we will not require this authorization.
            if (this._sslConfig && this._sslConfig.isSelfSigned) {
                requestOptions.rejectUnauthorized = false;
            }
            return request.defaults(requestOptions);
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Starts this server listening on its port.
     *
     * @param referenced - If false (unreferenced), the program will be allowed
     *     to exit if this is the only active server.
     * @return A promise that resolves when this server has started
     */
    QuickServer.prototype.listen = function (referenced) {
        var _this = this;
        if (referenced === void 0) { referenced = true; }
        // If this server is already started, just resolve.
        if (this._server) {
            return BBPromise.resolve();
        }
        return new BBPromise(function (resolve) {
            if (_this._sslConfig) {
                _this._server = https.createServer(_this._sslConfig, _this._requestListener);
            }
            else {
                _this._server = http.createServer(_this._requestListener);
            }
            _this._server.listen(_this._port, function () {
                if (!referenced) {
                    _this._server.unref();
                }
                _this._isReferenced = referenced;
                // Start tracking the active connections to this server.
                // This is needed in case we have to destroy them when closing
                // this server.
                _this._server.on("connection", function (conn) {
                    var key = conn.remoteAddress + ":" + conn.remotePort;
                    _this._connections[key] = conn;
                    conn.on("close", function () {
                        delete _this._connections[key];
                    });
                });
                // The server is now running.
                resolve();
            });
        });
    };
    /**
     * Stops this server from listening.  No new connection will be accepted.
     *
     * @param force - If false, existing connections will remain and the
     *     returned promise will not resolve until they close naturally.  If
     *     true, existing connections will be destroyed.
     *
     * @return A promise that resolves when all existing connection have closed
     * naturally.
     */
    QuickServer.prototype.close = function (force) {
        var _this = this;
        if (force === void 0) { force = false; }
        // If this server is already stopped, just resolve.
        if (!this._server) {
            return BBPromise.resolve();
        }
        return new BBPromise(function (resolve) {
            _this._server.close(function () {
                _this._server = undefined;
                _this._isReferenced = undefined;
                _this._connections = {};
                resolve();
            });
            // If the caller wants to force this server to close, forcibly
            // destroy all existing connections.
            if (force) {
                _.forOwn(_this._connections, function (curConn) {
                    curConn.destroy();
                });
            }
        });
    };
    return QuickServer;
}());
exports.QuickServer = QuickServer;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9xdWlja1NlcnZlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLDJCQUE2QjtBQUM3Qiw2QkFBK0I7QUFDL0IsMEJBQTRCO0FBQzVCLG9DQUFzQztBQUV0QyxtREFBNkQ7QUFFN0QseUNBQTJDO0FBWTNDOzs7Ozs7R0FNRztBQUNIO0lBZUksWUFBWTtJQUdaOzs7Ozs7Ozs7OztPQVdHO0lBQ0gscUJBQ0ksSUFBWSxFQUNaLFNBQWlDLEVBQ2pDLGVBQWdDO1FBekJuQixpQkFBWSxHQUFrRCxFQUFFLENBQUM7UUE0QjlFLElBQUksQ0FBQyxLQUFLLEdBQWMsSUFBSSxDQUFDO1FBQzdCLElBQUksQ0FBQyxVQUFVLEdBQVMsU0FBUyxDQUFDO1FBQ2xDLElBQUksQ0FBQyxnQkFBZ0IsR0FBRyxlQUFlLENBQUM7SUFDNUMsQ0FBQztJQU9ELHNCQUFXLCtCQUFNO1FBSmpCOzs7V0FHRzthQUNIO1lBRUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDO1FBQ3hCLENBQUM7OztPQUFBO0lBT0Qsc0JBQVcsNkJBQUk7UUFKZjs7O1dBR0c7YUFDSDtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQztRQUN0QixDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLGtDQUFTO1FBSHBCOztXQUVHO2FBQ0g7WUFFSSxPQUFPLDRDQUEyQixFQUFFLENBQUM7UUFDekMsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyw0QkFBRztRQUhkOztXQUVHO2FBQ0g7WUFFSSxJQUFNLFNBQVMsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDO1lBQ2pDLElBQU0sUUFBUSxHQUFHLElBQUksQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDO1lBQ3BELE9BQVUsUUFBUSxXQUFNLFNBQVMsU0FBSSxJQUFJLENBQUMsS0FBTyxDQUFDO1FBQ3RELENBQUM7OztPQUFBO0lBR0Qsc0JBQVcscUNBQVk7YUFBdkI7WUFFSSxPQUFPLElBQUksQ0FB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QUFJLEtBQUssRUFBRTtnQkFDUCxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUksQ0FBQyxZQUFZLEVBQUUsVUFBQyxPQUFPO29CQUNoQyxPQUFPLENBQUMsT0FBTyxFQUFFLENBQUM7Z0JBQ3RCLENBQUMsQ0FBQyxDQUFDO2FBQ047UUFDTCxDQUFDLENBQUMsQ0FBQztJQUNQLENBQUM7SUFFTCxrQkFBQztBQUFELENBbk1BLEFBbU1DLElBQUE7QUFuTVksa0NBQVciLCJmaWxlIjoicXVpY2tTZXJ2ZXIuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBodHRwIGZyb20gXCJodHRwXCI7XG5pbXBvcnQgKiBhcyBodHRwcyBmcm9tIFwiaHR0cHNcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0ICogYXMgbmV0IGZyb20gXCJuZXRcIjtcbmltcG9ydCB7Z2V0Rmlyc3RFeHRlcm5hbElwdjRBZGRyZXNzfSBmcm9tIFwiLi9uZXR3b3JrSGVscGVyc1wiO1xuaW1wb3J0IHtSZXF1ZXN0VHlwZX0gZnJvbSBcIi4vcmVxdWVzdEhlbHBlcnNcIjtcbmltcG9ydCAqIGFzIHJlcXVlc3QgZnJvbSBcInJlcXVlc3QtcHJvbWlzZVwiO1xuXG5cbnR5cGUgUmVxdWVzdExpc3RlbmVyID0gKHJlcXVlc3Q6IGh0dHAuSW5jb21pbmdNZXNzYWdlLCByZXNwb25zZTogaHR0cC5TZXJ2ZXJSZXNwb25zZSkgPT4gdm9pZDtcblxuXG5leHBvcnQgaW50ZXJmYWNlIElTc2xDb25maWcge1xuICAgIGtleTogICAgICAgICAgQnVmZmVyIHwgc3RyaW5nO1xuICAgIGNlcnQ6ICAgICAgICAgQnVmZmVyIHwgc3RyaW5nO1xuICAgIGlzU2VsZlNpZ25lZDogYm9vbGVhbjtcbn1cblxuLyoqXG4gKiBBIHdyYXBwZXIgYXJvdW5kIGEgaHR0cC9odHRwcyBzZXJ2ZXIgdGhhdCBzaW1wbGlmaWVzIGNvbmZpZ3VyYXRpb24gYW5kXG4gKiBwcm9ncmFtbWF0aWMgY29udHJvbC5cbiAqXG4gKiBTZWUgdGhpcyBjbGFzc2VzIHVuaXQgdGVzdCBmaWxlIGZvciBhbiBleGFtcGxlIG9mIGhvdyB0byBjcmVhdGUgYSBkZXJpdmVkXG4gKiBjb25jcmV0ZSBjbGFzcy5cbiAqL1xuZXhwb3J0IGNsYXNzIFF1aWNrU2VydmVyXG57XG5cbiAgICAvLyByZWdpb24gSW5zdGFuY2UgTWVtYmVyc1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3BvcnQ6ICAgICAgICAgICAgbnVtYmVyO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3NzbENvbmZpZzogICAgICAgdW5kZWZpbmVkIHwgSVNzbENvbmZpZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9yZXF1ZXN0TGlzdGVuZXI6IFJlcXVlc3RMaXN0ZW5lcjtcbiAgICBwcml2YXRlICAgICAgICAgIF9zZXJ2ZXI6ICAgICAgICAgIHVuZGVmaW5lZCB8IGh0dHAuU2VydmVyIHwgaHR0cHMuU2VydmVyO1xuICAgIHByaXZhdGUgICAgICAgICAgX2Nvbm5lY3Rpb25zOiAgICAge1tyZW1vdGVBZGRyQW5kUG9ydDogc3RyaW5nXTogbmV0LlNvY2tldH0gPSB7fTtcblxuICAgIC8vIHVuZGVmaW5lZDogVGhlIHNlcnZlciBpcyBub3QgbGlzdGVuaW5nL3J1bm5pbmcsIHNvIGl0IGlzIG5laXRoZXJcbiAgICAvLyAgICAgICAgICAgIHJlZmVyZW5jZWQgbm9yIHVucmVmZXJlbmNlZC5cbiAgICAvLyB0cnVlOiAgICAgIFRoZSBzZXJ2ZXIgaXMgcmVmZXJlbmNlZC5cbiAgICAvLyBmYWxzZTogICAgIFRoZSBzZXJ2ZXIgaXMgbm90IHJlZmVyZW5jZWQuXG4gICAgcHJpdmF0ZSAgICAgICAgICBfaXNSZWZlcmVuY2VkOiB1bmRlZmluZWQgfCBib29sZWFuO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IHNlcnZlciBpbnN0YW5jZS5cbiAgICAgKiBUaGlzIGNvbnN0cnVjdG9yIGlzIHByaXZhdGUsIGJlY2F1c2UgYGNyZWF0ZSgpYCBzaG91bGQgYmUgdXNlZCBpbnN0ZWFkLlxuICAgICAqXG4gICAgICogQHBhcmFtIHBvcnQgLSBUaGUgcG9ydCBudW1iZXIgdGhlIHNlcnZlciB3aWxsIHJ1biBvbiAob25jZSBgc3RhcnQoKWAgaXNcbiAgICAgKiAgIGNhbGxlZClcbiAgICAgKiBAcGFyYW0gc3NsQ29uZmlnIC0gYHVuZGVmaW5lZGAgaWYgYSBodHRwIHNlcnZlciBpcyBkZXNpcmVkLiAgSWYgYSBodHRwc1xuICAgICAqICAgc2VydmVyIGlzIGRlc2lyZWQsIHRoaXMgcGFyYW1ldGVyIG11c3QgYmUgZ2l2ZW4sIHNwZWNpZnlpbmcgdGhlIHByaXZhdGVcbiAgICAgKiAgIGtleSBhbmQgY2VydGlmaWNhdGUuXG4gICAgICogQHBhcmFtIHJlcXVlc3RMaXN0ZW5lciAtIFRoZSByZXF1ZXN0IGxpc3RlbmVyIChUaGlzIGNhbiBiZSBhbiBFeHByZXNzXG4gICAgICogICBhcHApXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGNvbnN0cnVjdG9yKFxuICAgICAgICBwb3J0OiBudW1iZXIsXG4gICAgICAgIHNzbENvbmZpZzogdW5kZWZpbmVkIHwgSVNzbENvbmZpZyxcbiAgICAgICAgcmVxdWVzdExpc3RlbmVyOiBSZXF1ZXN0TGlzdGVuZXJcbiAgICApXG4gICAge1xuICAgICAgICB0aGlzLl9wb3J0ICAgICAgICAgICAgPSBwb3J0O1xuICAgICAgICB0aGlzLl9zc2xDb25maWcgICAgICAgPSBzc2xDb25maWc7XG4gICAgICAgIHRoaXMuX3JlcXVlc3RMaXN0ZW5lciA9IHJlcXVlc3RMaXN0ZW5lcjtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIHdyYXBwZWQgSFRUUCBzZXJ2ZXIuICB1bmRlZmluZWQgaXMgcmV0dXJuZWQgaWYgdGhlcmUgaXMgbm9cbiAgICAgKiBzZXJ2ZXIgKGkuZS4gbGlzdGVuKCkgaGFzIG5vdCBiZWVuIGNhbGxlZCkuXG4gICAgICovXG4gICAgcHVibGljIGdldCBzZXJ2ZXIoKTogdW5kZWZpbmVkIHwgaHR0cC5TZXJ2ZXIgfCBodHRwcy5TZXJ2ZXJcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9zZXJ2ZXI7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBwb3J0IHRoYXQgdGhpcyBzZXJ2ZXIgd2lsbCBydW4gb24gKG9uY2UgYHN0YXJ0KClgIGlzXG4gICAgICogY2FsbGVkKVxuICAgICAqL1xuICAgIHB1YmxpYyBnZXQgcG9ydCgpOiBudW1iZXJcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wb3J0O1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyB0aGUgSVAgYWRkcmVzcyBvZiB0aGlzIHNlcnZlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGlwQWRkcmVzcygpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiBnZXRGaXJzdEV4dGVybmFsSXB2NEFkZHJlc3MoKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEdldHMgdGhlIFVSTCBvZiB0aGlzIHNlcnZlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHVybCgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIGNvbnN0IGlwQWRkcmVzcyA9IHRoaXMuaXBBZGRyZXNzO1xuICAgICAgICBjb25zdCBwcm90b2NvbCA9IHRoaXMuX3NzbENvbmZpZyA/IFwiaHR0cHNcIiA6IFwiaHR0cFwiO1xuICAgICAgICByZXR1cm4gYCR7cHJvdG9jb2x9Oi8vJHtpcEFkZHJlc3N9OiR7dGhpcy5fcG9ydH1gO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBpc1JlZmVyZW5jZWQoKTogdW5kZWZpbmVkIHwgYm9vbGVhblxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2lzUmVmZXJlbmNlZDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEEgcmVxdWVzdC1wcm9taXNlIG9iamVjdCB0aGF0IGNhbiBiZSB1c2VkIHRvIG1ha2UgcmVxdWVzdHMgdG8gdGhpc1xuICAgICAqIHNlcnZlci5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHJlcXVlc3QoKTogUmVxdWVzdFR5cGVcbiAgICB7XG4gICAgICAgIGNvbnN0IHJlcXVlc3RPcHRpb25zOiByZXF1ZXN0LlJlcXVlc3RQcm9taXNlT3B0aW9ucyA9IHtcbiAgICAgICAgICAgIGJhc2VVcmw6IHRoaXMudXJsLFxuICAgICAgICAgICAganNvbjogICAgdHJ1ZVxuICAgICAgICB9O1xuXG4gICAgICAgIC8vIElmIHRoaXMgc2VydmVyIGlzIHVzaW5nIGEgc2VsZi1zaWduZWQgY2VydGlmaWNhdGUsIGNsaWVudHMgd2lsbCBub3RcbiAgICAgICAgLy8gYmUgYWJsZSB0byB3YWxrIHRoZSBjZXJ0aWZpY2F0ZSBjaGFpbiBiYWNrIHRvIGEgcm9vdCBDQS4gIFR5cGljYWxseSxcbiAgICAgICAgLy8gdGhpcyB3b3VsZCBjYXVzZSBhIFwic2VsZiBzaWduZWQgY2VydGlmaWNhdGVcIiBlcnJvci4gIFRvIGdldCBhcm91bmRcbiAgICAgICAgLy8gdGhpcywgd2Ugd2lsbCBub3QgcmVxdWlyZSB0aGlzIGF1dGhvcml6YXRpb24uXG4gICAgICAgIGlmICh0aGlzLl9zc2xDb25maWcgJiYgdGhpcy5fc3NsQ29uZmlnLmlzU2VsZlNpZ25lZCkge1xuICAgICAgICAgICAgcmVxdWVzdE9wdGlvbnMucmVqZWN0VW5hdXRob3JpemVkID0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gcmVxdWVzdC5kZWZhdWx0cyhyZXF1ZXN0T3B0aW9ucyk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBTdGFydHMgdGhpcyBzZXJ2ZXIgbGlzdGVuaW5nIG9uIGl0cyBwb3J0LlxuICAgICAqXG4gICAgICogQHBhcmFtIHJlZmVyZW5jZWQgLSBJZiBmYWxzZSAodW5yZWZlcmVuY2VkKSwgdGhlIHByb2dyYW0gd2lsbCBiZSBhbGxvd2VkXG4gICAgICogICAgIHRvIGV4aXQgaWYgdGhpcyBpcyB0aGUgb25seSBhY3RpdmUgc2VydmVyLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2hlbiB0aGlzIHNlcnZlciBoYXMgc3RhcnRlZFxuICAgICAqL1xuICAgIHB1YmxpYyBsaXN0ZW4ocmVmZXJlbmNlZDogYm9vbGVhbiA9IHRydWUpOiBQcm9taXNlPHZvaWQ+XG4gICAge1xuICAgICAgICAvLyBJZiB0aGlzIHNlcnZlciBpcyBhbHJlYWR5IHN0YXJ0ZWQsIGp1c3QgcmVzb2x2ZS5cbiAgICAgICAgaWYgKHRoaXMuX3NlcnZlcikge1xuICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZSgocmVzb2x2ZSkgPT4ge1xuXG4gICAgICAgICAgICBpZiAodGhpcy5fc3NsQ29uZmlnKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fc2VydmVyID0gaHR0cHMuY3JlYXRlU2VydmVyKHRoaXMuX3NzbENvbmZpZywgdGhpcy5fcmVxdWVzdExpc3RlbmVyKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuX3NlcnZlciA9IGh0dHAuY3JlYXRlU2VydmVyKHRoaXMuX3JlcXVlc3RMaXN0ZW5lcik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuX3NlcnZlci5saXN0ZW4odGhpcy5fcG9ydCwgKCkgPT4ge1xuXG4gICAgICAgICAgICAgICAgaWYgKCFyZWZlcmVuY2VkKSB7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX3NlcnZlciEudW5yZWYoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy5faXNSZWZlcmVuY2VkID0gcmVmZXJlbmNlZDtcblxuICAgICAgICAgICAgICAgIC8vIFN0YXJ0IHRyYWNraW5nIHRoZSBhY3RpdmUgY29ubmVjdGlvbnMgdG8gdGhpcyBzZXJ2ZXIuXG4gICAgICAgICAgICAgICAgLy8gVGhpcyBpcyBuZWVkZWQgaW4gY2FzZSB3ZSBoYXZlIHRvIGRlc3Ryb3kgdGhlbSB3aGVuIGNsb3NpbmdcbiAgICAgICAgICAgICAgICAvLyB0aGlzIHNlcnZlci5cbiAgICAgICAgICAgICAgICB0aGlzLl9zZXJ2ZXIhLm9uKFwiY29ubmVjdGlvblwiLCAoY29ubikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjb25zdCBrZXkgPSBgJHtjb25uLnJlbW90ZUFkZHJlc3N9OiR7Y29ubi5yZW1vdGVQb3J0fWA7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zW2tleV0gPSBjb25uO1xuICAgICAgICAgICAgICAgICAgICBjb25uLm9uKFwiY2xvc2VcIiwgKCkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAgICAgZGVsZXRlIHRoaXMuX2Nvbm5lY3Rpb25zW2tleV07XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICAgICAgLy8gVGhlIHNlcnZlciBpcyBub3cgcnVubmluZy5cbiAgICAgICAgICAgICAgICByZXNvbHZlKCk7XG4gICAgICAgICAgICB9KTtcblxuICAgICAgICB9KTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFN0b3BzIHRoaXMgc2VydmVyIGZyb20gbGlzdGVuaW5nLiAgTm8gbmV3IGNvbm5lY3Rpb24gd2lsbCBiZSBhY2NlcHRlZC5cbiAgICAgKlxuICAgICAqIEBwYXJhbSBmb3JjZSAtIElmIGZhbHNlLCBleGlzdGluZyBjb25uZWN0aW9ucyB3aWxsIHJlbWFpbiBhbmQgdGhlXG4gICAgICogICAgIHJldHVybmVkIHByb21pc2Ugd2lsbCBub3QgcmVzb2x2ZSB1bnRpbCB0aGV5IGNsb3NlIG5hdHVyYWxseS4gIElmXG4gICAgICogICAgIHRydWUsIGV4aXN0aW5nIGNvbm5lY3Rpb25zIHdpbGwgYmUgZGVzdHJveWVkLlxuICAgICAqXG4gICAgICogQHJldHVybiBBIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aGVuIGFsbCBleGlzdGluZyBjb25uZWN0aW9uIGhhdmUgY2xvc2VkXG4gICAgICogbmF0dXJhbGx5LlxuICAgICAqL1xuICAgIHB1YmxpYyBjbG9zZShmb3JjZTogYm9vbGVhbiA9IGZhbHNlKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgLy8gSWYgdGhpcyBzZXJ2ZXIgaXMgYWxyZWFkeSBzdG9wcGVkLCBqdXN0IHJlc29sdmUuXG4gICAgICAgIGlmICghdGhpcy5fc2VydmVyKSB7XG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlc29sdmUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgQkJQcm9taXNlKChyZXNvbHZlKSA9PiB7XG4gICAgICAgICAgICB0aGlzLl9zZXJ2ZXIhLmNsb3NlKCgpID0+IHtcbiAgICAgICAgICAgICAgICB0aGlzLl9zZXJ2ZXIgPSB1bmRlZmluZWQ7XG4gICAgICAgICAgICAgICAgdGhpcy5faXNSZWZlcmVuY2VkID0gdW5kZWZpbmVkO1xuICAgICAgICAgICAgICAgIHRoaXMuX2Nvbm5lY3Rpb25zID0ge307XG4gICAgICAgICAgICAgICAgcmVzb2x2ZSgpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIC8vIElmIHRoZSBjYWxsZXIgd2FudHMgdG8gZm9yY2UgdGhpcyBzZXJ2ZXIgdG8gY2xvc2UsIGZvcmNpYmx5XG4gICAgICAgICAgICAvLyBkZXN0cm95IGFsbCBleGlzdGluZyBjb25uZWN0aW9ucy5cbiAgICAgICAgICAgIGlmIChmb3JjZSkge1xuICAgICAgICAgICAgICAgIF8uZm9yT3duKHRoaXMuX2Nvbm5lY3Rpb25zLCAoY3VyQ29ubikgPT4ge1xuICAgICAgICAgICAgICAgICAgICBjdXJDb25uLmRlc3Ryb3koKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfVxuXG59XG4iXX0=
