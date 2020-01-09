"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var commitHashRegexp = /^[0-9a-fA-F]{7,40}$/;
var CommitHash = /** @class */ (function () {
    // endregion
    function CommitHash(hash) {
        this._hash = hash;
    }
    CommitHash.fromString = function (hash) {
        var results = commitHashRegexp.exec(hash);
        return results ? new CommitHash(hash) : undefined;
    };
    CommitHash.prototype.toString = function () {
        return this._hash;
    };
    CommitHash.prototype.toShortString = function () {
        return this._hash.slice(0, 7);
    };
    return CommitHash;
}());
exports.CommitHash = CommitHash;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9jb21taXRIYXNoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBRUEsSUFBTSxnQkFBZ0IsR0FBRyxxQkFBcUIsQ0FBQztBQUUvQztJQVlJLFlBQVk7SUFHWixvQkFBb0IsSUFBWTtRQUU1QixJQUFJLENBQUMsS0FBSyxHQUFHLElBQUksQ0FBQztJQUN0QixDQUFDO0lBZmEscUJBQVUsR0FBeEIsVUFBeUIsSUFBWTtRQUVqQyxJQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLENBQUM7UUFDNUMsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksVUFBVSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUM7SUFDdEQsQ0FBQztJQWNNLDZCQUFRLEdBQWY7UUFFSSxPQUFPLElBQUksQ0FBQyxLQUFLLENBQUM7SUFDdEIsQ0FBQztJQUdNLGtDQUFhLEdBQXBCO1FBRUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUFDLENBQUM7SUFDbEMsQ0FBQztJQUNMLGlCQUFDO0FBQUQsQ0EvQkEsQUErQkMsSUFBQTtBQS9CWSxnQ0FBVSIsImZpbGUiOiJjb21taXRIYXNoLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXG5cbmNvbnN0IGNvbW1pdEhhc2hSZWdleHAgPSAvXlswLTlhLWZBLUZdezcsNDB9JC87XG5cbmV4cG9ydCBjbGFzcyBDb21taXRIYXNoXG57XG5cbiAgICBwdWJsaWMgc3RhdGljIGZyb21TdHJpbmcoaGFzaDogc3RyaW5nKTogQ29tbWl0SGFzaCB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgY29uc3QgcmVzdWx0cyA9IGNvbW1pdEhhc2hSZWdleHAuZXhlYyhoYXNoKTtcbiAgICAgICAgcmV0dXJuIHJlc3VsdHMgPyBuZXcgQ29tbWl0SGFzaChoYXNoKSA6IHVuZGVmaW5lZDtcbiAgICB9XG5cblxuICAgIC8vIHJlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9oYXNoOiBzdHJpbmc7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoaGFzaDogc3RyaW5nKVxuICAgIHtcbiAgICAgICAgdGhpcy5faGFzaCA9IGhhc2g7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgdG9TdHJpbmcoKTogc3RyaW5nXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5faGFzaDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyB0b1Nob3J0U3RyaW5nKCk6IHN0cmluZ1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2hhc2guc2xpY2UoMCwgNyk7XG4gICAgfVxufVxuIl19
