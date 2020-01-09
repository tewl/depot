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
var util_1 = require("util");
var _ = require("lodash");
/**
 * Levels controlling what log messages are written to stdout.
 */
var LogLevel;
(function (LogLevel) {
    LogLevel[LogLevel["OFF_0"] = 0] = "OFF_0";
    LogLevel[LogLevel["ERROR_1"] = 1] = "ERROR_1";
    LogLevel[LogLevel["WARN_2"] = 2] = "WARN_2";
    LogLevel[LogLevel["INFO_3"] = 3] = "INFO_3";
    LogLevel[LogLevel["VERBOSE_4"] = 4] = "VERBOSE_4";
    LogLevel[LogLevel["DEBUG_5"] = 5] = "DEBUG_5";
    LogLevel[LogLevel["SILLY_6"] = 6] = "SILLY_6";
})(LogLevel = exports.LogLevel || (exports.LogLevel = {}));
Object.freeze(LogLevel);
/**
 * Labels used to identify the severity of each log message
 */
var levelLabels = [
    "OFF",
    "ERROR",
    "WARN",
    "INFO",
    "VERBOSE",
    "DEBUG",
    "SILLY"
];
Object.freeze(levelLabels);
var Logger = /** @class */ (function () {
    // endregion
    function Logger() {
        // region Private Data Members
        this._logLevelStack = [];
        this._defaultLogLevel = LogLevel.WARN_2;
        this._listeners = [];
    }
    Logger.prototype.addListener = function (listener) {
        var _this = this;
        this._listeners.push(listener);
        return function () {
            _.pull(_this._listeners, listener);
        };
    };
    Logger.prototype.numListeners = function () {
        return this._listeners.length;
    };
    /**
     * Resets the logging level to its default state.
     */
    Logger.prototype.reset = function () {
        this._logLevelStack.length = 0;
    };
    /**
     * Sets this loggers enabled state to newLogLevel.  To put the logger back to
     * its previous state, call pop().
     * @param newLogLevel - The new state of this logger
     */
    Logger.prototype.pushLogLevel = function (newLogLevel) {
        this._logLevelStack.push(newLogLevel);
    };
    /**
     * Restores this logger's state to the previous state.
     */
    Logger.prototype.pop = function () {
        if (this._logLevelStack.length > 0) {
            this._logLevelStack.pop();
        }
    };
    /**
     * Gets the current severity level for this logger.  All messages with a
     * higher or equal severity will be logged.
     * @returns The current severity level
     */
    Logger.prototype.getCurrentLevel = function () {
        if (this._logLevelStack.length > 0) {
            return this._logLevelStack[this._logLevelStack.length - 1];
        }
        else {
            return this._defaultLogLevel;
        }
    };
    /**
     * Logs a message with severity level ERROR_1.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    Logger.prototype.error = function (msg) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        return this.log.apply(this, __spread([LogLevel.ERROR_1, msg], optionalParams));
    };
    /**
     * Logs a message with severity level WARN_2.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    Logger.prototype.warn = function (msg) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        return this.log.apply(this, __spread([LogLevel.WARN_2, msg], optionalParams));
    };
    /**
     * Logs a message with severity level INFO_3.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    Logger.prototype.info = function (msg) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        return this.log.apply(this, __spread([LogLevel.INFO_3, msg], optionalParams));
    };
    /**
     * Logs a message with severity level VERBOSE_4.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    Logger.prototype.verbose = function (msg) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        return this.log.apply(this, __spread([LogLevel.VERBOSE_4, msg], optionalParams));
    };
    /**
     * Logs a message with severity level DEBUG_5.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    Logger.prototype.debug = function (msg) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        return this.log.apply(this, __spread([LogLevel.DEBUG_5, msg], optionalParams));
    };
    /**
     * Logs a message with severity level SILLY_6.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    Logger.prototype.silly = function (msg) {
        var optionalParams = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            optionalParams[_i - 1] = arguments[_i];
        }
        return this.log.apply(this, __spread([LogLevel.SILLY_6, msg], optionalParams));
    };
    // region Private Methods
    /**
     * Helper method that implements logging logic
     * @param level - The severity level of the logged message
     * @param msg - The message to log
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged.
     */
    Logger.prototype.log = function (level, msg) {
        var optionalParams = [];
        for (var _i = 2; _i < arguments.length; _i++) {
            optionalParams[_i - 2] = arguments[_i];
        }
        var curLogLevel = this.getCurrentLevel();
        if (level > curLogLevel) {
            return false;
        }
        var optStr = _.map(optionalParams, function (curParam) { return util_1.inspect(curParam); }).join(" ");
        if (optStr.length > 0) {
            msg += " " + optStr;
        }
        if (msg.length > 0) {
            var logMessage_1 = getTimestamp() + " (" + levelLabels[level] + ") " + msg;
            _.forEach(this._listeners, function (curListener) {
                curListener(logMessage_1);
            });
        }
        return true;
    };
    return Logger;
}());
exports.Logger = Logger;
Object.freeze(Logger.prototype);
////////////////////////////////////////////////////////////////////////////////
// Helper methods
////////////////////////////////////////////////////////////////////////////////
function getTimestamp() {
    return new Date().toISOString();
}
Object.freeze(exports);

//# sourceMappingURL=data:application/json;charset=utf8;base64,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ci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7aW5zcGVjdH0gZnJvbSBcInV0aWxcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuXG5cbmV4cG9ydCB0eXBlIExvZ0xpc3RlbmVyRnVuYyAgICA9IChsb2dNZXNzYWdlOiBzdHJpbmcpID0+IHZvaWQ7XG5leHBvcnQgdHlwZSBSZW1vdmVMaXN0ZW5lckZ1bmMgPSAoKSA9PiB2b2lkO1xuXG5cbi8qKlxuICogTGV2ZWxzIGNvbnRyb2xsaW5nIHdoYXQgbG9nIG1lc3NhZ2VzIGFyZSB3cml0dGVuIHRvIHN0ZG91dC5cbiAqL1xuZXhwb3J0IGVudW0gTG9nTGV2ZWwge1xuICAgIE9GRl8wICAgICA9IDAsXG4gICAgRVJST1JfMSAgID0gMSxcbiAgICBXQVJOXzIgICAgPSAyLFxuICAgIElORk9fMyAgICA9IDMsXG4gICAgVkVSQk9TRV80ID0gNCxcbiAgICBERUJVR181ICAgPSA1LFxuICAgIFNJTExZXzYgICA9IDZcbn1cbk9iamVjdC5mcmVlemUoTG9nTGV2ZWwpO1xuXG5cbi8qKlxuICogTGFiZWxzIHVzZWQgdG8gaWRlbnRpZnkgdGhlIHNldmVyaXR5IG9mIGVhY2ggbG9nIG1lc3NhZ2VcbiAqL1xuY29uc3QgbGV2ZWxMYWJlbHM6IEFycmF5PHN0cmluZz4gPSBbXG4gICAgXCJPRkZcIixcbiAgICBcIkVSUk9SXCIsXG4gICAgXCJXQVJOXCIsXG4gICAgXCJJTkZPXCIsXG4gICAgXCJWRVJCT1NFXCIsXG4gICAgXCJERUJVR1wiLFxuICAgIFwiU0lMTFlcIlxuXTtcbk9iamVjdC5mcmVlemUobGV2ZWxMYWJlbHMpO1xuXG5cbmV4cG9ydCBjbGFzcyBMb2dnZXJcbntcbiAgICAvLyByZWdpb24gUHJpdmF0ZSBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9sb2dMZXZlbFN0YWNrOiBBcnJheTxMb2dMZXZlbD4gICAgPSBbXTtcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9kZWZhdWx0TG9nTGV2ZWw6IExvZ0xldmVsICAgICAgICAgPSBMb2dMZXZlbC5XQVJOXzI7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfbGlzdGVuZXJzOiBBcnJheTxMb2dMaXN0ZW5lckZ1bmM+ID0gW107XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcigpXG4gICAge1xuICAgIH1cblxuXG4gICAgcHVibGljIGFkZExpc3RlbmVyKGxpc3RlbmVyOiBMb2dMaXN0ZW5lckZ1bmMpOiBSZW1vdmVMaXN0ZW5lckZ1bmNcbiAgICB7XG4gICAgICAgIHRoaXMuX2xpc3RlbmVycy5wdXNoKGxpc3RlbmVyKTtcblxuICAgICAgICByZXR1cm4gKCkgPT4ge1xuICAgICAgICAgICAgXy5wdWxsKHRoaXMuX2xpc3RlbmVycywgbGlzdGVuZXIpO1xuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgcHVibGljIG51bUxpc3RlbmVycygpOiBudW1iZXJcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9saXN0ZW5lcnMubGVuZ3RoO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVzZXRzIHRoZSBsb2dnaW5nIGxldmVsIHRvIGl0cyBkZWZhdWx0IHN0YXRlLlxuICAgICAqL1xuICAgIHB1YmxpYyByZXNldCgpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLl9sb2dMZXZlbFN0YWNrLmxlbmd0aCA9IDA7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBTZXRzIHRoaXMgbG9nZ2VycyBlbmFibGVkIHN0YXRlIHRvIG5ld0xvZ0xldmVsLiAgVG8gcHV0IHRoZSBsb2dnZXIgYmFjayB0b1xuICAgICAqIGl0cyBwcmV2aW91cyBzdGF0ZSwgY2FsbCBwb3AoKS5cbiAgICAgKiBAcGFyYW0gbmV3TG9nTGV2ZWwgLSBUaGUgbmV3IHN0YXRlIG9mIHRoaXMgbG9nZ2VyXG4gICAgICovXG4gICAgcHVibGljIHB1c2hMb2dMZXZlbChuZXdMb2dMZXZlbDogTG9nTGV2ZWwpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLl9sb2dMZXZlbFN0YWNrLnB1c2gobmV3TG9nTGV2ZWwpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVzdG9yZXMgdGhpcyBsb2dnZXIncyBzdGF0ZSB0byB0aGUgcHJldmlvdXMgc3RhdGUuXG4gICAgICovXG4gICAgcHVibGljIHBvcCgpOiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5fbG9nTGV2ZWxTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICB0aGlzLl9sb2dMZXZlbFN0YWNrLnBvcCgpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjdXJyZW50IHNldmVyaXR5IGxldmVsIGZvciB0aGlzIGxvZ2dlci4gIEFsbCBtZXNzYWdlcyB3aXRoIGFcbiAgICAgKiBoaWdoZXIgb3IgZXF1YWwgc2V2ZXJpdHkgd2lsbCBiZSBsb2dnZWQuXG4gICAgICogQHJldHVybnMgVGhlIGN1cnJlbnQgc2V2ZXJpdHkgbGV2ZWxcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q3VycmVudExldmVsKCk6IExvZ0xldmVsXG4gICAge1xuICAgICAgICBpZiAodGhpcy5fbG9nTGV2ZWxTdGFjay5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9nTGV2ZWxTdGFja1t0aGlzLl9sb2dMZXZlbFN0YWNrLmxlbmd0aCAtIDFdO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2RlZmF1bHRMb2dMZXZlbDtcbiAgICAgICAgfVxuXG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSB3aXRoIHNldmVyaXR5IGxldmVsIEVSUk9SXzEuXG4gICAgICogQHBhcmFtIG1zZyAtIFRoZSBtZXNzYWdlIHRvIGJlIGxvZ2dlZFxuICAgICAqIEBwYXJhbSBvcHRpb25hbFBhcmFtcyAtIEFkZGl0aW9uYWwgdmFsdWVzIHRvIGJlIGxvZ2dlZFxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIG1lc3NhZ2Ugd2FzIGxvZ2dlZCBnaXZlbiBjdXJyZW50IGxvZ2dlciBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBwdWJsaWMgZXJyb3IobXNnOiBzdHJpbmcsIC4uLm9wdGlvbmFsUGFyYW1zOiBBcnJheTxhbnk+KTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nKExvZ0xldmVsLkVSUk9SXzEsIG1zZywgLi4ub3B0aW9uYWxQYXJhbXMpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTG9ncyBhIG1lc3NhZ2Ugd2l0aCBzZXZlcml0eSBsZXZlbCBXQVJOXzIuXG4gICAgICogQHBhcmFtIG1zZyAtIFRoZSBtZXNzYWdlIHRvIGJlIGxvZ2dlZFxuICAgICAqIEBwYXJhbSBvcHRpb25hbFBhcmFtcyAtIEFkZGl0aW9uYWwgdmFsdWVzIHRvIGJlIGxvZ2dlZFxuICAgICAqIEByZXR1cm5zIFdoZXRoZXIgdGhlIG1lc3NhZ2Ugd2FzIGxvZ2dlZCBnaXZlbiBjdXJyZW50IGxvZ2dlciBzZXR0aW5ncy5cbiAgICAgKi9cbiAgICBwdWJsaWMgd2Fybihtc2c6IHN0cmluZywgLi4ub3B0aW9uYWxQYXJhbXM6IEFycmF5PGFueT4pOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2coTG9nTGV2ZWwuV0FSTl8yLCBtc2csIC4uLm9wdGlvbmFsUGFyYW1zKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIExvZ3MgYSBtZXNzYWdlIHdpdGggc2V2ZXJpdHkgbGV2ZWwgSU5GT18zLlxuICAgICAqIEBwYXJhbSBtc2cgLSBUaGUgbWVzc2FnZSB0byBiZSBsb2dnZWRcbiAgICAgKiBAcGFyYW0gb3B0aW9uYWxQYXJhbXMgLSBBZGRpdGlvbmFsIHZhbHVlcyB0byBiZSBsb2dnZWRcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXNzYWdlIHdhcyBsb2dnZWQgZ2l2ZW4gY3VycmVudCBsb2dnZXIgc2V0dGluZ3MuXG4gICAgICovXG4gICAgcHVibGljIGluZm8obXNnOiBzdHJpbmcsIC4uLm9wdGlvbmFsUGFyYW1zOiBBcnJheTxhbnk+KTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMubG9nKExvZ0xldmVsLklORk9fMywgbXNnLCAuLi5vcHRpb25hbFBhcmFtcyk7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBMb2dzIGEgbWVzc2FnZSB3aXRoIHNldmVyaXR5IGxldmVsIFZFUkJPU0VfNC5cbiAgICAgKiBAcGFyYW0gbXNnIC0gVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkXG4gICAgICogQHBhcmFtIG9wdGlvbmFsUGFyYW1zIC0gQWRkaXRpb25hbCB2YWx1ZXMgdG8gYmUgbG9nZ2VkXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgbWVzc2FnZSB3YXMgbG9nZ2VkIGdpdmVuIGN1cnJlbnQgbG9nZ2VyIHNldHRpbmdzLlxuICAgICAqL1xuICAgIHB1YmxpYyB2ZXJib3NlKG1zZzogc3RyaW5nLCAuLi5vcHRpb25hbFBhcmFtczogQXJyYXk8YW55Pik6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZyhMb2dMZXZlbC5WRVJCT1NFXzQsIG1zZywgLi4ub3B0aW9uYWxQYXJhbXMpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogTG9ncyBhIG1lc3NhZ2Ugd2l0aCBzZXZlcml0eSBsZXZlbCBERUJVR181LlxuICAgICAqIEBwYXJhbSBtc2cgLSBUaGUgbWVzc2FnZSB0byBiZSBsb2dnZWRcbiAgICAgKiBAcGFyYW0gb3B0aW9uYWxQYXJhbXMgLSBBZGRpdGlvbmFsIHZhbHVlcyB0byBiZSBsb2dnZWRcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXNzYWdlIHdhcyBsb2dnZWQgZ2l2ZW4gY3VycmVudCBsb2dnZXIgc2V0dGluZ3MuXG4gICAgICovXG4gICAgcHVibGljIGRlYnVnKG1zZzogc3RyaW5nLCAuLi5vcHRpb25hbFBhcmFtczogQXJyYXk8YW55Pik6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLmxvZyhMb2dMZXZlbC5ERUJVR181LCBtc2csIC4uLm9wdGlvbmFsUGFyYW1zKTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIExvZ3MgYSBtZXNzYWdlIHdpdGggc2V2ZXJpdHkgbGV2ZWwgU0lMTFlfNi5cbiAgICAgKiBAcGFyYW0gbXNnIC0gVGhlIG1lc3NhZ2UgdG8gYmUgbG9nZ2VkXG4gICAgICogQHBhcmFtIG9wdGlvbmFsUGFyYW1zIC0gQWRkaXRpb25hbCB2YWx1ZXMgdG8gYmUgbG9nZ2VkXG4gICAgICogQHJldHVybnMgV2hldGhlciB0aGUgbWVzc2FnZSB3YXMgbG9nZ2VkIGdpdmVuIGN1cnJlbnQgbG9nZ2VyIHNldHRpbmdzLlxuICAgICAqL1xuICAgIHB1YmxpYyBzaWxseShtc2c6IHN0cmluZywgLi4ub3B0aW9uYWxQYXJhbXM6IEFycmF5PGFueT4pOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5sb2coTG9nTGV2ZWwuU0lMTFlfNiwgbXNnLCAuLi5vcHRpb25hbFBhcmFtcyk7XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gUHJpdmF0ZSBNZXRob2RzXG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgbWV0aG9kIHRoYXQgaW1wbGVtZW50cyBsb2dnaW5nIGxvZ2ljXG4gICAgICogQHBhcmFtIGxldmVsIC0gVGhlIHNldmVyaXR5IGxldmVsIG9mIHRoZSBsb2dnZWQgbWVzc2FnZVxuICAgICAqIEBwYXJhbSBtc2cgLSBUaGUgbWVzc2FnZSB0byBsb2dcbiAgICAgKiBAcGFyYW0gb3B0aW9uYWxQYXJhbXMgLSBBZGRpdGlvbmFsIHZhbHVlcyB0byBiZSBsb2dnZWRcbiAgICAgKiBAcmV0dXJucyBXaGV0aGVyIHRoZSBtZXNzYWdlIHdhcyBsb2dnZWQuXG4gICAgICovXG4gICAgcHJpdmF0ZSBsb2cobGV2ZWw6IExvZ0xldmVsLCBtc2c6IHN0cmluZywgLi4ub3B0aW9uYWxQYXJhbXM6IEFycmF5PGFueT4pOiBib29sZWFuXG4gICAge1xuICAgICAgICBjb25zdCBjdXJMb2dMZXZlbDogTG9nTGV2ZWwgPSB0aGlzLmdldEN1cnJlbnRMZXZlbCgpO1xuXG4gICAgICAgIGlmIChsZXZlbCA+IGN1ckxvZ0xldmVsKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBvcHRTdHIgPSBfLm1hcChvcHRpb25hbFBhcmFtcywgKGN1clBhcmFtKSA9PiBpbnNwZWN0KGN1clBhcmFtKSkuam9pbihcIiBcIik7XG4gICAgICAgIGlmIChvcHRTdHIubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgbXNnICs9IFwiIFwiICsgb3B0U3RyO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKG1zZy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBsb2dNZXNzYWdlID0gZ2V0VGltZXN0YW1wKCkgKyBcIiAoXCIgKyBsZXZlbExhYmVsc1tsZXZlbF0gKyBcIikgXCIgKyBtc2c7XG4gICAgICAgICAgICBfLmZvckVhY2godGhpcy5fbGlzdGVuZXJzLCAoY3VyTGlzdGVuZXIpID0+IHtcbiAgICAgICAgICAgICAgICBjdXJMaXN0ZW5lcihsb2dNZXNzYWdlKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuXG4gICAgLy8gZW5kcmVnaW9uXG5cbn1cbk9iamVjdC5mcmVlemUoTG9nZ2VyLnByb3RvdHlwZSk7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEhlbHBlciBtZXRob2RzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5mdW5jdGlvbiBnZXRUaW1lc3RhbXAoKTogc3RyaW5nXG57XG4gICAgcmV0dXJuIG5ldyBEYXRlKCkudG9JU09TdHJpbmcoKTtcbn1cblxuXG5PYmplY3QuZnJlZXplKGV4cG9ydHMpO1xuIl19
