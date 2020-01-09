"use strict";
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
var urlJoin = require("url-join"); // tslint:disable-line:no-require-imports
var URLParse = require("url-parse");
var Url = /** @class */ (function () {
    // endregion
    function Url(parsed) {
        this._parsed = parsed;
    }
    Url.fromString = function (urlStr) {
        try {
            var parsed = new URLParse(urlStr);
            var inst = new Url(parsed);
            return inst;
        }
        catch (err) {
            return undefined;
        }
    };
    Url.prototype.toString = function () {
        return this._parsed.href;
    };
    /**
     * Creates a duplicate instance of this Url
     * @return The new instance
     */
    Url.prototype.clone = function () {
        var newInstParsed = _.cloneDeep(this._parsed);
        var newInst = new Url(newInstParsed);
        return newInst;
    };
    Url.prototype.getProtocols = function () {
        var protocolStr = this._parsed.protocol;
        var withoutColon = protocolStr.replace(/:$/, "");
        if (withoutColon === "") {
            // No protocol specified.
            return [];
        }
        var protocols = withoutColon.split("+");
        return protocols;
    };
    /**
     * Gets a new Url instance with a modified protocol.
     * @param newProtocol - The new instance's protocol
     * @return The new Url instance
     */
    Url.prototype.replaceProtocol = function (newProtocol) {
        // FUTURE: Deprecate this method in favor of cloning and mutating the URL
        //   by setting a `protocol` property similar to how the port property can
        //   be assigned to.
        var newInst = Url.fromString(this.toString());
        newInst._parsed.set("protocol", newProtocol);
        return newInst;
    };
    Url.prototype.join = function () {
        var parts = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            parts[_i] = arguments[_i];
        }
        var newUrlStr = urlJoin.apply(void 0, __spread([this.toString()], parts));
        return Url.fromString(newUrlStr);
    };
    Object.defineProperty(Url.prototype, "host", {
        /**
         * Host name with port number
         */
        get: function () {
            return this._parsed.host;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Url.prototype, "hostname", {
        /**
         * Host name without port number
         */
        get: function () {
            return this._parsed.hostname;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(Url.prototype, "port", {
        /**
         * Optional port number.  Empty string if no port number is present.
         */
        get: function () {
            var portStr = this._parsed.port;
            if (portStr === "") {
                return undefined;
            }
            else {
                return parseInt(portStr, 10);
            }
        },
        set: function (val) {
            this._parsed.set("port", val);
        },
        enumerable: true,
        configurable: true
    });
    return Url;
}());
exports.Url = Url;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy91cmwudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBCQUE0QjtBQUM1QixrQ0FBcUMsQ0FBRSx5Q0FBeUM7QUFDaEYsb0NBQXNDO0FBR3RDO0lBaUJJLFlBQVk7SUFHWixhQUFvQixNQUFnQjtRQUVoQyxJQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQztJQUMxQixDQUFDO0lBckJhLGNBQVUsR0FBeEIsVUFBeUIsTUFBYztRQUVuQyxJQUFJO1lBQ0EsSUFBTSxNQUFNLEdBQUcsSUFBSSxRQUFRLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDcEMsSUFBTSxJQUFJLEdBQUcsSUFBSSxHQUFHLENBQUMsTUFBTSxDQUFDLENBQUM7WUFDN0IsT0FBTyxJQUFJLENBQUM7U0FDZjtRQUNELE9BQU8sR0FBRyxFQUFFO1lBQ1IsT0FBTyxTQUFTLENBQUM7U0FDcEI7SUFDTCxDQUFDO0lBY00sc0JBQVEsR0FBZjtRQUVJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7SUFDN0IsQ0FBQztJQUdEOzs7T0FHRztJQUNJLG1CQUFLLEdBQVo7UUFDSSxJQUFNLGFBQWEsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQztRQUNoRCxJQUFNLE9BQU8sR0FBRyxJQUFJLEdBQUcsQ0FBQyxhQUFhLENBQUMsQ0FBQztRQUN2QyxPQUFPLE9BQU8sQ0FBQztJQUNuQixDQUFDO0lBR00sMEJBQVksR0FBbkI7UUFFSSxJQUFNLFdBQVcsR0FBRyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUMxQyxJQUFNLFlBQVksR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLENBQUMsQ0FBQztRQUVuRCxJQUFJLFlBQVksS0FBSyxFQUFFLEVBQUU7WUFDckIseUJBQXlCO1lBQ3pCLE9BQU8sRUFBRSxDQUFDO1NBQ2I7UUFFRCxJQUFNLFNBQVMsR0FBRyxZQUFZLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDO1FBQzFDLE9BQU8sU0FBUyxDQUFDO0lBQ3JCLENBQUM7SUFHRDs7OztPQUlHO0lBQ0ksNkJBQWUsR0FBdEIsVUFBdUIsV0FBbUI7UUFFdEMseUVBQXlFO1FBQ3pFLDBFQUEwRTtRQUMxRSxvQkFBb0I7UUFFcEIsSUFBTSxPQUFPLEdBQUcsR0FBRyxDQUFDLFVBQVUsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLENBQUUsQ0FBQztRQUNqRCxPQUFPLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLEVBQUUsV0FBVyxDQUFDLENBQUM7UUFDN0MsT0FBTyxPQUFPLENBQUM7SUFDbkIsQ0FBQztJQUdNLGtCQUFJLEdBQVg7UUFBWSxlQUF1QjthQUF2QixVQUF1QixFQUF2QixxQkFBdUIsRUFBdkIsSUFBdUI7WUFBdkIsMEJBQXVCOztRQUMvQixJQUFNLFNBQVMsR0FBRyxPQUFPLHlCQUFDLElBQUksQ0FBQyxRQUFRLEVBQUUsR0FBSyxLQUFLLEVBQUMsQ0FBQztRQUNyRCxPQUFPLEdBQUcsQ0FBQyxVQUFVLENBQUMsU0FBUyxDQUFDLENBQUM7SUFDckMsQ0FBQztJQU1ELHNCQUFXLHFCQUFJO1FBSGY7O1dBRUc7YUFDSDtZQUNJLE9BQU8sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUM7UUFDN0IsQ0FBQzs7O09BQUE7SUFNRCxzQkFBVyx5QkFBUTtRQUhuQjs7V0FFRzthQUNIO1lBQ0ksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQztRQUNqQyxDQUFDOzs7T0FBQTtJQU1ELHNCQUFXLHFCQUFJO1FBSGY7O1dBRUc7YUFDSDtZQUNJLElBQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDO1lBQ2xDLElBQUksT0FBTyxLQUFLLEVBQUUsRUFBRTtnQkFDaEIsT0FBTyxTQUFTLENBQUM7YUFDcEI7aUJBQ0k7Z0JBQ0QsT0FBTyxRQUFRLENBQUMsT0FBTyxFQUFFLEVBQUUsQ0FBQyxDQUFDO2FBQ2hDO1FBQ0wsQ0FBQzthQUdELFVBQWdCLEdBQXVCO1lBQ25DLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsQ0FBQztRQUNsQyxDQUFDOzs7T0FMQTtJQVNMLFVBQUM7QUFBRCxDQXJIQSxBQXFIQyxJQUFBO0FBckhZLGtCQUFHIiwiZmlsZSI6InVybC5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHVybEpvaW4gPSByZXF1aXJlKFwidXJsLWpvaW5cIik7ICAvLyB0c2xpbnQ6ZGlzYWJsZS1saW5lOm5vLXJlcXVpcmUtaW1wb3J0c1xuaW1wb3J0ICogYXMgVVJMUGFyc2UgZnJvbSBcInVybC1wYXJzZVwiO1xuXG5cbmV4cG9ydCBjbGFzcyBVcmxcbntcbiAgICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcodXJsU3RyOiBzdHJpbmcpOiBVcmwgfCB1bmRlZmluZWRcbiAgICB7XG4gICAgICAgIHRyeSB7XG4gICAgICAgICAgICBjb25zdCBwYXJzZWQgPSBuZXcgVVJMUGFyc2UodXJsU3RyKTtcbiAgICAgICAgICAgIGNvbnN0IGluc3QgPSBuZXcgVXJsKHBhcnNlZCk7XG4gICAgICAgICAgICByZXR1cm4gaW5zdDtcbiAgICAgICAgfVxuICAgICAgICBjYXRjaCAoZXJyKSB7XG4gICAgICAgICAgICByZXR1cm4gdW5kZWZpbmVkO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcGFyc2VkOiBVUkxQYXJzZTtcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihwYXJzZWQ6IFVSTFBhcnNlKVxuICAgIHtcbiAgICAgICAgdGhpcy5fcGFyc2VkID0gcGFyc2VkO1xuICAgIH1cblxuXG4gICAgcHVibGljIHRvU3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3BhcnNlZC5ocmVmO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIGR1cGxpY2F0ZSBpbnN0YW5jZSBvZiB0aGlzIFVybFxuICAgICAqIEByZXR1cm4gVGhlIG5ldyBpbnN0YW5jZVxuICAgICAqL1xuICAgIHB1YmxpYyBjbG9uZSgpOiBVcmwge1xuICAgICAgICBjb25zdCBuZXdJbnN0UGFyc2VkID0gXy5jbG9uZURlZXAodGhpcy5fcGFyc2VkKTtcbiAgICAgICAgY29uc3QgbmV3SW5zdCA9IG5ldyBVcmwobmV3SW5zdFBhcnNlZCk7XG4gICAgICAgIHJldHVybiBuZXdJbnN0O1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldFByb3RvY29scygpOiBBcnJheTxzdHJpbmc+XG4gICAge1xuICAgICAgICBjb25zdCBwcm90b2NvbFN0ciA9IHRoaXMuX3BhcnNlZC5wcm90b2NvbDtcbiAgICAgICAgY29uc3Qgd2l0aG91dENvbG9uID0gcHJvdG9jb2xTdHIucmVwbGFjZSgvOiQvLCBcIlwiKTtcblxuICAgICAgICBpZiAod2l0aG91dENvbG9uID09PSBcIlwiKSB7XG4gICAgICAgICAgICAvLyBObyBwcm90b2NvbCBzcGVjaWZpZWQuXG4gICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBwcm90b2NvbHMgPSB3aXRob3V0Q29sb24uc3BsaXQoXCIrXCIpO1xuICAgICAgICByZXR1cm4gcHJvdG9jb2xzO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogR2V0cyBhIG5ldyBVcmwgaW5zdGFuY2Ugd2l0aCBhIG1vZGlmaWVkIHByb3RvY29sLlxuICAgICAqIEBwYXJhbSBuZXdQcm90b2NvbCAtIFRoZSBuZXcgaW5zdGFuY2UncyBwcm90b2NvbFxuICAgICAqIEByZXR1cm4gVGhlIG5ldyBVcmwgaW5zdGFuY2VcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVwbGFjZVByb3RvY29sKG5ld1Byb3RvY29sOiBzdHJpbmcpOiBVcmxcbiAgICB7XG4gICAgICAgIC8vIEZVVFVSRTogRGVwcmVjYXRlIHRoaXMgbWV0aG9kIGluIGZhdm9yIG9mIGNsb25pbmcgYW5kIG11dGF0aW5nIHRoZSBVUkxcbiAgICAgICAgLy8gICBieSBzZXR0aW5nIGEgYHByb3RvY29sYCBwcm9wZXJ0eSBzaW1pbGFyIHRvIGhvdyB0aGUgcG9ydCBwcm9wZXJ0eSBjYW5cbiAgICAgICAgLy8gICBiZSBhc3NpZ25lZCB0by5cblxuICAgICAgICBjb25zdCBuZXdJbnN0ID0gVXJsLmZyb21TdHJpbmcodGhpcy50b1N0cmluZygpKSE7XG4gICAgICAgIG5ld0luc3QuX3BhcnNlZC5zZXQoXCJwcm90b2NvbFwiLCBuZXdQcm90b2NvbCk7XG4gICAgICAgIHJldHVybiBuZXdJbnN0O1xuICAgIH1cblxuXG4gICAgcHVibGljIGpvaW4oLi4ucGFydHM6IEFycmF5PHN0cmluZz4pOiBVcmwgfCB1bmRlZmluZWQge1xuICAgICAgICBjb25zdCBuZXdVcmxTdHIgPSB1cmxKb2luKHRoaXMudG9TdHJpbmcoKSwgLi4ucGFydHMpO1xuICAgICAgICByZXR1cm4gVXJsLmZyb21TdHJpbmcobmV3VXJsU3RyKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEhvc3QgbmFtZSB3aXRoIHBvcnQgbnVtYmVyXG4gICAgICovXG4gICAgcHVibGljIGdldCBob3N0KCk6IHN0cmluZyB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wYXJzZWQuaG9zdDtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIEhvc3QgbmFtZSB3aXRob3V0IHBvcnQgbnVtYmVyXG4gICAgICovXG4gICAgcHVibGljIGdldCBob3N0bmFtZSgpOiBzdHJpbmcge1xuICAgICAgICByZXR1cm4gdGhpcy5fcGFyc2VkLmhvc3RuYW1lO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogT3B0aW9uYWwgcG9ydCBudW1iZXIuICBFbXB0eSBzdHJpbmcgaWYgbm8gcG9ydCBudW1iZXIgaXMgcHJlc2VudC5cbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IHBvcnQoKTogbnVtYmVyIHwgdW5kZWZpbmVkIHtcbiAgICAgICAgY29uc3QgcG9ydFN0ciA9IHRoaXMuX3BhcnNlZC5wb3J0O1xuICAgICAgICBpZiAocG9ydFN0ciA9PT0gXCJcIikge1xuICAgICAgICAgICAgcmV0dXJuIHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiBwYXJzZUludChwb3J0U3RyLCAxMCk7XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIHB1YmxpYyBzZXQgcG9ydCh2YWw6IG51bWJlciB8IHVuZGVmaW5lZCkge1xuICAgICAgICB0aGlzLl9wYXJzZWQuc2V0KFwicG9ydFwiLCB2YWwpO1xuICAgIH1cblxuXG5cbn1cblxuIl19
