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
Object.defineProperty(exports, "__esModule", { value: true });
var stream_1 = require("stream");
var CombinedStream = /** @class */ (function (_super) {
    __extends(CombinedStream, _super);
    function CombinedStream() {
        var streams = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            streams[_i] = arguments[_i];
        }
        var _this = _super.call(this) || this;
        _this._streams = streams;
        _this.on("pipe", function (source) {
            var e_1, _a;
            source.unpipe(_this);
            var streamEnd = source;
            try {
                for (var _b = __values(_this._streams), _c = _b.next(); !_c.done; _c = _b.next()) {
                    var curStream = _c.value;
                    streamEnd = streamEnd.pipe(curStream);
                }
            }
            catch (e_1_1) { e_1 = { error: e_1_1 }; }
            finally {
                try {
                    if (_c && !_c.done && (_a = _b.return)) _a.call(_b);
                }
                finally { if (e_1) throw e_1.error; }
            }
            _this._streamEnd = streamEnd;
        });
        return _this;
    }
    CombinedStream.prototype.pipe = function (dest, options) {
        if (!this._streamEnd) {
            throw new Error("Internal error: combinedStream.pipe() called before 'pipe' event.");
        }
        return this._streamEnd.pipe(dest, options);
    };
    return CombinedStream;
}(stream_1.PassThrough));
exports.CombinedStream = CombinedStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21iaW5lZFN0cmVhbS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQStEO0FBRS9EO0lBQW9DLGtDQUFXO0lBSzNDO1FBQVksaUJBQXlCO2FBQXpCLFVBQXlCLEVBQXpCLHFCQUF5QixFQUF6QixJQUF5QjtZQUF6Qiw0QkFBeUI7O1FBQXJDLFlBRUksaUJBQU8sU0FlVjtRQWRHLEtBQUksQ0FBQyxRQUFRLEdBQUcsT0FBTyxDQUFDO1FBRXhCLEtBQUksQ0FBQyxFQUFFLENBQUMsTUFBTSxFQUFFLFVBQUMsTUFBZ0I7O1lBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsS0FBSSxDQUFDLENBQUM7WUFFcEIsSUFBSSxTQUFTLEdBQVcsTUFBTSxDQUFDOztnQkFFL0IsS0FBd0IsSUFBQSxLQUFBLFNBQUEsS0FBSSxDQUFDLFFBQVEsQ0FBQSxnQkFBQSw0QkFDckM7b0JBREssSUFBTSxTQUFTLFdBQUE7b0JBRWhCLFNBQVMsR0FBRyxTQUFTLENBQUMsSUFBSSxDQUFDLFNBQXFCLENBQUMsQ0FBQztpQkFDckQ7Ozs7Ozs7OztZQUVELEtBQUksQ0FBQyxVQUFVLEdBQUcsU0FBUyxDQUFDO1FBQ2hDLENBQUMsQ0FBQyxDQUFDOztJQUNQLENBQUM7SUFFTSw2QkFBSSxHQUFYLFVBQTZDLElBQU8sRUFBRSxPQUE0QjtRQUU5RSxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsRUFBRTtZQUNsQixNQUFNLElBQUksS0FBSyxDQUFDLG1FQUFtRSxDQUFDLENBQUM7U0FDeEY7UUFDRCxPQUFPLElBQUksQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPLENBQUMsQ0FBQztJQUMvQyxDQUFDO0lBRUwscUJBQUM7QUFBRCxDQWhDQSxBQWdDQyxDQWhDbUMsb0JBQVcsR0FnQzlDO0FBaENZLHdDQUFjIiwiZmlsZSI6ImNvbWJpbmVkU3RyZWFtLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtQYXNzVGhyb3VnaCwgUmVhZGFibGUsIFdyaXRhYmxlLCBTdHJlYW19IGZyb20gXCJzdHJlYW1cIjtcblxuZXhwb3J0IGNsYXNzIENvbWJpbmVkU3RyZWFtIGV4dGVuZHMgUGFzc1Rocm91Z2hcbntcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9zdHJlYW1zOiBBcnJheTxTdHJlYW0+O1xuICAgIHByaXZhdGUgX3N0cmVhbUVuZDogU3RyZWFtIHwgdW5kZWZpbmVkO1xuXG4gICAgY29uc3RydWN0b3IoLi4uc3RyZWFtczogQXJyYXk8U3RyZWFtPilcbiAgICB7XG4gICAgICAgIHN1cGVyKCk7XG4gICAgICAgIHRoaXMuX3N0cmVhbXMgPSBzdHJlYW1zO1xuXG4gICAgICAgIHRoaXMub24oXCJwaXBlXCIsIChzb3VyY2U6IFJlYWRhYmxlKSA9PiB7XG4gICAgICAgICAgICBzb3VyY2UudW5waXBlKHRoaXMpO1xuXG4gICAgICAgICAgICBsZXQgc3RyZWFtRW5kOiBTdHJlYW0gPSBzb3VyY2U7XG5cbiAgICAgICAgICAgIGZvciAoY29uc3QgY3VyU3RyZWFtIG9mIHRoaXMuX3N0cmVhbXMpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgc3RyZWFtRW5kID0gc3RyZWFtRW5kLnBpcGUoY3VyU3RyZWFtIGFzIFdyaXRhYmxlKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5fc3RyZWFtRW5kID0gc3RyZWFtRW5kO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICBwdWJsaWMgcGlwZTxUIGV4dGVuZHMgTm9kZUpTLldyaXRhYmxlU3RyZWFtPihkZXN0OiBULCBvcHRpb25zPzogeyBlbmQ/OiBib29sZWFuOyB9KTogVFxuICAgIHtcbiAgICAgICAgaWYgKCF0aGlzLl9zdHJlYW1FbmQpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihcIkludGVybmFsIGVycm9yOiBjb21iaW5lZFN0cmVhbS5waXBlKCkgY2FsbGVkIGJlZm9yZSAncGlwZScgZXZlbnQuXCIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9zdHJlYW1FbmQucGlwZShkZXN0LCBvcHRpb25zKTtcbiAgICB9XG5cbn1cbiJdfQ==
