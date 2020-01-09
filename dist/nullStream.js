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
var NullStream = /** @class */ (function (_super) {
    __extends(NullStream, _super);
    function NullStream(opts) {
        return _super.call(this, opts) || this;
    }
    NullStream.prototype._write = function (chunk, encoding, callback) {
        callback();
    };
    return NullStream;
}(stream_1.Writable));
exports.NullStream = NullStream;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9udWxsU3RyZWFtLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlDQUFpRDtBQUVqRDtJQUFnQyw4QkFBUTtJQUVwQyxvQkFBWSxJQUFzQjtlQUU5QixrQkFBTSxJQUFJLENBQUM7SUFDZixDQUFDO0lBR00sMkJBQU0sR0FBYixVQUFjLEtBQXNCLEVBQUUsUUFBZ0IsRUFBRSxRQUFtQjtRQUV2RSxRQUFRLEVBQUUsQ0FBQztJQUNmLENBQUM7SUFDTCxpQkFBQztBQUFELENBWkEsQUFZQyxDQVorQixpQkFBUSxHQVl2QztBQVpZLGdDQUFVIiwiZmlsZSI6Im51bGxTdHJlYW0uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1dyaXRhYmxlLCBXcml0YWJsZU9wdGlvbnN9IGZyb20gXCJzdHJlYW1cIjtcblxuZXhwb3J0IGNsYXNzIE51bGxTdHJlYW0gZXh0ZW5kcyBXcml0YWJsZVxue1xuICAgIGNvbnN0cnVjdG9yKG9wdHM/OiBXcml0YWJsZU9wdGlvbnMpXG4gICAge1xuICAgICAgICBzdXBlcihvcHRzKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBfd3JpdGUoY2h1bms6IHN0cmluZyB8IEJ1ZmZlciwgZW5jb2Rpbmc6IHN0cmluZywgY2FsbGJhY2s6ICgpID0+IGFueSk6IHZvaWRcbiAgICB7XG4gICAgICAgIGNhbGxiYWNrKCk7XG4gICAgfVxufVxuIl19
