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
var SourceStream = /** @class */ (function (_super) {
    __extends(SourceStream, _super);
    // endregion
    function SourceStream(data, opts) {
        var _this = _super.call(this, opts) || this;
        _this._curIndex = 0;
        _this._data = Array.isArray(data) ? data : [data];
        return _this;
    }
    SourceStream.prototype._read = function () {
        if (this._curIndex >= this._data.length) {
            this.push(null);
        }
        else {
            var buf = Buffer.from(this._data[this._curIndex]);
            this.push(buf);
        }
        this._curIndex++;
    };
    return SourceStream;
}(stream_1.Readable));
exports.SourceStream = SourceStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zb3VyY2VTdHJlYW0udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUNBQWlEO0FBRWpEO0lBQWtDLGdDQUFRO0lBS3RDLFlBQVk7SUFHWixzQkFBWSxJQUE0QixFQUFFLElBQXNCO1FBQWhFLFlBQ0ksa0JBQU0sSUFBSSxDQUFDLFNBRWQ7UUFQTyxlQUFTLEdBQVcsQ0FBQyxDQUFDO1FBTTFCLEtBQUksQ0FBQyxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDOztJQUNyRCxDQUFDO0lBR00sNEJBQUssR0FBWjtRQUVJLElBQUksSUFBSSxDQUFDLFNBQVMsSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLE1BQU0sRUFDdkM7WUFDSSxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxDQUFDO1NBQ25CO2FBRUQ7WUFDSSxJQUFNLEdBQUcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUM7WUFDcEQsSUFBSSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQztTQUNsQjtRQUVELElBQUksQ0FBQyxTQUFTLEVBQUUsQ0FBQztJQUNyQixDQUFDO0lBQ0wsbUJBQUM7QUFBRCxDQTVCQSxBQTRCQyxDQTVCaUMsaUJBQVEsR0E0QnpDO0FBNUJZLG9DQUFZIiwiZmlsZSI6InNvdXJjZVN0cmVhbS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7UmVhZGFibGUsIFJlYWRhYmxlT3B0aW9uc30gZnJvbSBcInN0cmVhbVwiO1xuXG5leHBvcnQgY2xhc3MgU291cmNlU3RyZWFtIGV4dGVuZHMgUmVhZGFibGVcbntcbiAgICAvLyByZWdpb24gUHJpdmF0ZSBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9kYXRhOiBBcnJheTxzdHJpbmc+O1xuICAgIHByaXZhdGUgX2N1ckluZGV4OiBudW1iZXIgPSAwO1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBjb25zdHJ1Y3RvcihkYXRhOiBBcnJheTxzdHJpbmc+IHwgc3RyaW5nLCBvcHRzPzogUmVhZGFibGVPcHRpb25zKSB7XG4gICAgICAgIHN1cGVyKG9wdHMpO1xuICAgICAgICB0aGlzLl9kYXRhID0gQXJyYXkuaXNBcnJheShkYXRhKSA/IGRhdGEgOiBbZGF0YV07XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgX3JlYWQoKTogdm9pZCB7XG5cbiAgICAgICAgaWYgKHRoaXMuX2N1ckluZGV4ID49IHRoaXMuX2RhdGEubGVuZ3RoKVxuICAgICAgICB7XG4gICAgICAgICAgICB0aGlzLnB1c2gobnVsbCk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZVxuICAgICAgICB7XG4gICAgICAgICAgICBjb25zdCBidWYgPSBCdWZmZXIuZnJvbSh0aGlzLl9kYXRhW3RoaXMuX2N1ckluZGV4XSk7XG4gICAgICAgICAgICB0aGlzLnB1c2goYnVmKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX2N1ckluZGV4Kys7XG4gICAgfVxufVxuIl19
