"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = require("os");
var stream_1 = require("stream");
var deferred_1 = require("./deferred");
var PrefixStream = /** @class */ (function (_super) {
    __extends(PrefixStream, _super);
    // endregion
    function PrefixStream(prefix) {
        var _this = _super.call(this) || this;
        _this._prefixBuf = Buffer.from("[" + prefix + "] ");
        _this._flushedDeferred = new deferred_1.Deferred();
        return _this;
    }
    PrefixStream.prototype._transform = function (chunk, encoding, done) {
        // Convert to a Buffer.
        var chunkBuf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        this._partial = (this._partial && this._partial.length) ?
            Buffer.concat([this._partial, chunkBuf]) :
            chunkBuf;
        // While complete lines exist, push them.
        var index = this._partial.indexOf(os_1.EOL);
        while (index !== -1) {
            var line = this._partial.slice(0, ++index);
            this._partial = this._partial.slice(index);
            this.push(Buffer.concat([this._prefixBuf, line]));
            index = this._partial.indexOf(os_1.EOL);
        }
        done();
    };
    PrefixStream.prototype._flush = function (done) {
        if (this._partial && this._partial.length) {
            this.push(Buffer.concat([this._prefixBuf, this._partial]));
        }
        this._flushedDeferred.resolve(undefined);
        done();
    };
    Object.defineProperty(PrefixStream.prototype, "prefix", {
        get: function () {
            return this._prefixBuf.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PrefixStream.prototype, "flushedPromise", {
        get: function () {
            return this._flushedDeferred.promise;
        },
        enumerable: true,
        configurable: true
    });
    return PrefixStream;
}(stream_1.Transform));
exports.PrefixStream = PrefixStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmVmaXhTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEseUJBQXVCO0FBQ3ZCLGlDQUFpQztBQUNqQyx1Q0FBb0M7QUFHcEM7SUFBa0MsZ0NBQVM7SUFNdkMsWUFBWTtJQUdaLHNCQUFZLE1BQWM7UUFBMUIsWUFFSSxpQkFBTyxTQUdWO1FBRkcsS0FBSSxDQUFDLFVBQVUsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQUksTUFBTSxPQUFJLENBQUMsQ0FBQztRQUM5QyxLQUFJLENBQUMsZ0JBQWdCLEdBQUcsSUFBSSxtQkFBUSxFQUFRLENBQUM7O0lBQ2pELENBQUM7SUFHTSxpQ0FBVSxHQUFqQixVQUFrQixLQUFzQixFQUFFLFFBQWdCLEVBQUUsSUFBZTtRQUV2RSx1QkFBdUI7UUFDdkIsSUFBTSxRQUFRLEdBQVcsT0FBTyxLQUFLLEtBQUssUUFBUSxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUM7UUFFaEYsSUFBSSxDQUFDLFFBQVEsR0FBRyxDQUFDLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDO1lBQ3JELE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsUUFBUSxFQUFFLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUMxQyxRQUFRLENBQUM7UUFFYix5Q0FBeUM7UUFDekMsSUFBSSxLQUFLLEdBQVcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBRyxDQUFDLENBQUM7UUFDL0MsT0FBTyxLQUFLLEtBQUssQ0FBQyxDQUFDLEVBQUU7WUFDakIsSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFFLEVBQUUsS0FBSyxDQUFDLENBQUM7WUFDN0MsSUFBSSxDQUFDLFFBQVEsR0FBRyxJQUFJLENBQUMsUUFBUSxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztZQUMzQyxJQUFJLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxFQUFFLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUVsRCxLQUFLLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxPQUFPLENBQUMsUUFBRyxDQUFDLENBQUM7U0FDdEM7UUFDRCxJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFHTSw2QkFBTSxHQUFiLFVBQWMsSUFBZTtRQUV6QixJQUFJLElBQUksQ0FBQyxRQUFRLElBQUksSUFBSSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQ3pDO1lBQ0ksSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDO1NBQzlEO1FBQ0QsSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztRQUV6QyxJQUFJLEVBQUUsQ0FBQztJQUNYLENBQUM7SUFHRCxzQkFBVyxnQ0FBTTthQUFqQjtZQUVJLE9BQU8sSUFBSSxDQUFDLFVBQVUsQ0FBQyxRQUFRLEVBQUUsQ0FBQztRQUN0QyxDQUFDOzs7T0FBQTtJQUdELHNCQUFXLHdDQUFjO2FBQXpCO1lBRUksT0FBTyxJQUFJLENBQUMsZ0JBQWdCLENBQUMsT0FBTyxDQUFDO1FBQ3pDLENBQUM7OztPQUFBO0lBQ0wsbUJBQUM7QUFBRCxDQTdEQSxBQTZEQyxDQTdEaUMsa0JBQVMsR0E2RDFDO0FBN0RZLG9DQUFZIiwiZmlsZSI6InByZWZpeFN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7RU9MfSBmcm9tIFwib3NcIjtcbmltcG9ydCB7VHJhbnNmb3JtfSBmcm9tIFwic3RyZWFtXCI7XG5pbXBvcnQge0RlZmVycmVkfSBmcm9tIFwiLi9kZWZlcnJlZFwiO1xuXG5cbmV4cG9ydCBjbGFzcyBQcmVmaXhTdHJlYW0gZXh0ZW5kcyBUcmFuc2Zvcm1cbntcbiAgICAvLyByZWdpb24gUHJpdmF0ZSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcHJlZml4QnVmOiBCdWZmZXI7XG4gICAgcHJpdmF0ZSBfcGFydGlhbDogQnVmZmVyIHwgdW5kZWZpbmVkO1xuICAgIHByaXZhdGUgX2ZsdXNoZWREZWZlcnJlZDogRGVmZXJyZWQ8dm9pZD47XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIGNvbnN0cnVjdG9yKHByZWZpeDogc3RyaW5nKVxuICAgIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy5fcHJlZml4QnVmID0gQnVmZmVyLmZyb20oYFske3ByZWZpeH1dIGApO1xuICAgICAgICB0aGlzLl9mbHVzaGVkRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQ8dm9pZD4oKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfdHJhbnNmb3JtKGNodW5rOiBCdWZmZXIgfCBzdHJpbmcsIGVuY29kaW5nOiBzdHJpbmcsIGRvbmU6ICgpID0+IGFueSk6IHZvaWRcbiAgICB7XG4gICAgICAgIC8vIENvbnZlcnQgdG8gYSBCdWZmZXIuXG4gICAgICAgIGNvbnN0IGNodW5rQnVmOiBCdWZmZXIgPSB0eXBlb2YgY2h1bmsgPT09IFwic3RyaW5nXCIgPyBCdWZmZXIuZnJvbShjaHVuaykgOiBjaHVuaztcblxuICAgICAgICB0aGlzLl9wYXJ0aWFsID0gKHRoaXMuX3BhcnRpYWwgJiYgdGhpcy5fcGFydGlhbC5sZW5ndGgpID9cbiAgICAgICAgICAgIEJ1ZmZlci5jb25jYXQoW3RoaXMuX3BhcnRpYWwsIGNodW5rQnVmXSkgOlxuICAgICAgICAgICAgY2h1bmtCdWY7XG5cbiAgICAgICAgLy8gV2hpbGUgY29tcGxldGUgbGluZXMgZXhpc3QsIHB1c2ggdGhlbS5cbiAgICAgICAgbGV0IGluZGV4OiBudW1iZXIgPSB0aGlzLl9wYXJ0aWFsLmluZGV4T2YoRU9MKTtcbiAgICAgICAgd2hpbGUgKGluZGV4ICE9PSAtMSkge1xuICAgICAgICAgICAgY29uc3QgbGluZSA9IHRoaXMuX3BhcnRpYWwuc2xpY2UoMCwgKytpbmRleCk7XG4gICAgICAgICAgICB0aGlzLl9wYXJ0aWFsID0gdGhpcy5fcGFydGlhbC5zbGljZShpbmRleCk7XG4gICAgICAgICAgICB0aGlzLnB1c2goQnVmZmVyLmNvbmNhdChbdGhpcy5fcHJlZml4QnVmLCBsaW5lXSkpO1xuXG4gICAgICAgICAgICBpbmRleCA9IHRoaXMuX3BhcnRpYWwuaW5kZXhPZihFT0wpO1xuICAgICAgICB9XG4gICAgICAgIGRvbmUoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfZmx1c2goZG9uZTogKCkgPT4gYW55KTogdm9pZFxuICAgIHtcbiAgICAgICAgaWYgKHRoaXMuX3BhcnRpYWwgJiYgdGhpcy5fcGFydGlhbC5sZW5ndGgpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMucHVzaChCdWZmZXIuY29uY2F0KFt0aGlzLl9wcmVmaXhCdWYsIHRoaXMuX3BhcnRpYWxdKSk7XG4gICAgICAgIH1cbiAgICAgICAgdGhpcy5fZmx1c2hlZERlZmVycmVkLnJlc29sdmUodW5kZWZpbmVkKTtcblxuICAgICAgICBkb25lKCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IHByZWZpeCgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9wcmVmaXhCdWYudG9TdHJpbmcoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgZmx1c2hlZFByb21pc2UoKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2ZsdXNoZWREZWZlcnJlZC5wcm9taXNlO1xuICAgIH1cbn1cbiJdfQ==
