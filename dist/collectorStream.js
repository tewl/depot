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
var stream_1 = require("stream");
var deferred_1 = require("./deferred");
var CollectorStream = /** @class */ (function (_super) {
    __extends(CollectorStream, _super);
    // endregion
    function CollectorStream() {
        var _this = _super.call(this) || this;
        _this._collected = Buffer.from("");
        _this._flushedDeferred = new deferred_1.Deferred();
        return _this;
    }
    CollectorStream.prototype._transform = function (chunk, encoding, done) {
        // Convert to a Buffer.
        var chunkBuf = typeof chunk === "string" ? Buffer.from(chunk) : chunk;
        this._collected = Buffer.concat([this._collected, chunkBuf]);
        this.push(chunkBuf);
        done();
    };
    CollectorStream.prototype._flush = function (done) {
        this._flushedDeferred.resolve(undefined);
        done();
    };
    Object.defineProperty(CollectorStream.prototype, "collected", {
        get: function () {
            return this._collected.toString();
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(CollectorStream.prototype, "flushedPromise", {
        get: function () {
            return this._flushedDeferred.promise;
        },
        enumerable: true,
        configurable: true
    });
    return CollectorStream;
}(stream_1.Transform));
exports.CollectorStream = CollectorStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb2xsZWN0b3JTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlDO0FBQ2pDLHVDQUFvQztBQUdwQztJQUFxQyxtQ0FBUztJQUsxQyxZQUFZO0lBR1o7UUFBQSxZQUVJLGlCQUFPLFNBR1Y7UUFGRyxLQUFJLENBQUMsVUFBVSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsRUFBRSxDQUFDLENBQUM7UUFDbEMsS0FBSSxDQUFDLGdCQUFnQixHQUFHLElBQUksbUJBQVEsRUFBUSxDQUFDOztJQUNqRCxDQUFDO0lBR00sb0NBQVUsR0FBakIsVUFBa0IsS0FBc0IsRUFBRSxRQUFnQixFQUFFLElBQWU7UUFFdkUsdUJBQXVCO1FBQ3ZCLElBQU0sUUFBUSxHQUFXLE9BQU8sS0FBSyxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO1FBRWhGLElBQUksQ0FBQyxVQUFVLEdBQUcsTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDLElBQUksQ0FBQyxVQUFVLEVBQUUsUUFBUSxDQUFDLENBQUMsQ0FBQztRQUM3RCxJQUFJLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3BCLElBQUksRUFBRSxDQUFDO0lBQ1gsQ0FBQztJQUdNLGdDQUFNLEdBQWIsVUFBYyxJQUFlO1FBRXpCLElBQUksQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUM7UUFDekMsSUFBSSxFQUFFLENBQUM7SUFDWCxDQUFDO0lBR0Qsc0JBQVcsc0NBQVM7YUFBcEI7WUFFSSxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDdEMsQ0FBQzs7O09BQUE7SUFHRCxzQkFBVywyQ0FBYzthQUF6QjtZQUVJLE9BQU8sSUFBSSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQztRQUN6QyxDQUFDOzs7T0FBQTtJQUNMLHNCQUFDO0FBQUQsQ0E1Q0EsQUE0Q0MsQ0E1Q29DLGtCQUFTLEdBNEM3QztBQTVDWSwwQ0FBZSIsImZpbGUiOiJjb2xsZWN0b3JTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1RyYW5zZm9ybX0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSBcIi4vZGVmZXJyZWRcIjtcblxuXG5leHBvcnQgY2xhc3MgQ29sbGVjdG9yU3RyZWFtIGV4dGVuZHMgVHJhbnNmb3JtXG57XG4gICAgLy8gcmVnaW9uIFByaXZhdGUgTWVtYmVyc1xuICAgIHByaXZhdGUgX2NvbGxlY3RlZDogQnVmZmVyO1xuICAgIHByaXZhdGUgX2ZsdXNoZWREZWZlcnJlZDogRGVmZXJyZWQ8dm9pZD47XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIGNvbnN0cnVjdG9yKClcbiAgICB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX2NvbGxlY3RlZCA9IEJ1ZmZlci5mcm9tKFwiXCIpO1xuICAgICAgICB0aGlzLl9mbHVzaGVkRGVmZXJyZWQgPSBuZXcgRGVmZXJyZWQ8dm9pZD4oKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfdHJhbnNmb3JtKGNodW5rOiBCdWZmZXIgfCBzdHJpbmcsIGVuY29kaW5nOiBzdHJpbmcsIGRvbmU6ICgpID0+IGFueSk6IHZvaWRcbiAgICB7XG4gICAgICAgIC8vIENvbnZlcnQgdG8gYSBCdWZmZXIuXG4gICAgICAgIGNvbnN0IGNodW5rQnVmOiBCdWZmZXIgPSB0eXBlb2YgY2h1bmsgPT09IFwic3RyaW5nXCIgPyBCdWZmZXIuZnJvbShjaHVuaykgOiBjaHVuaztcblxuICAgICAgICB0aGlzLl9jb2xsZWN0ZWQgPSBCdWZmZXIuY29uY2F0KFt0aGlzLl9jb2xsZWN0ZWQsIGNodW5rQnVmXSk7XG4gICAgICAgIHRoaXMucHVzaChjaHVua0J1Zik7XG4gICAgICAgIGRvbmUoKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfZmx1c2goZG9uZTogKCkgPT4gYW55KTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5fZmx1c2hlZERlZmVycmVkLnJlc29sdmUodW5kZWZpbmVkKTtcbiAgICAgICAgZG9uZSgpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBjb2xsZWN0ZWQoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fY29sbGVjdGVkLnRvU3RyaW5nKCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGZsdXNoZWRQcm9taXNlKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9mbHVzaGVkRGVmZXJyZWQucHJvbWlzZTtcbiAgICB9XG59XG4iXX0=
