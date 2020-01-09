"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var heap_1 = require("./heap");
function comparePriority(itemA, itemB) {
    if (itemA.priority < itemB.priority) {
        return heap_1.CompareResult.LESS;
    }
    else if (itemA.priority === itemB.priority) {
        return heap_1.CompareResult.EQUAL;
    }
    else {
        return heap_1.CompareResult.GREATER;
    }
}
var PriorityQueue = /** @class */ (function () {
    // endregion
    function PriorityQueue() {
        this._heap = new heap_1.Heap(comparePriority);
    }
    Object.defineProperty(PriorityQueue.prototype, "length", {
        get: function () {
            return this._heap.length;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PriorityQueue.prototype, "isEmpty", {
        get: function () {
            return this._heap.isEmpty;
        },
        enumerable: true,
        configurable: true
    });
    PriorityQueue.prototype.push = function (payload, priority) {
        this._heap.push({ priority: priority,
            payload: payload });
    };
    PriorityQueue.prototype.peak = function () {
        var item = this._heap.peak();
        return item === undefined ? undefined : item.payload;
    };
    PriorityQueue.prototype.pop = function () {
        var item = this._heap.pop();
        return item === undefined ? undefined : item.payload;
    };
    return PriorityQueue;
}());
exports.PriorityQueue = PriorityQueue;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcmlvcml0eVF1ZXVlLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsK0JBQTJDO0FBVTNDLFNBQVMsZUFBZSxDQUNwQixLQUFzQyxFQUN0QyxLQUFzQztJQUV0QyxJQUFJLEtBQUssQ0FBQyxRQUFRLEdBQUcsS0FBSyxDQUFDLFFBQVEsRUFBRTtRQUNqQyxPQUFPLG9CQUFhLENBQUMsSUFBSSxDQUFDO0tBQzdCO1NBQ0ksSUFBSSxLQUFLLENBQUMsUUFBUSxLQUFLLEtBQUssQ0FBQyxRQUFRLEVBQUU7UUFDeEMsT0FBTyxvQkFBYSxDQUFDLEtBQUssQ0FBQztLQUM5QjtTQUNJO1FBQ0QsT0FBTyxvQkFBYSxDQUFDLE9BQU8sQ0FBQztLQUNoQztBQUNMLENBQUM7QUFHRDtJQUtJLFlBQVk7SUFHWjtRQUVJLElBQUksQ0FBQyxLQUFLLEdBQUcsSUFBSSxXQUFJLENBQWtDLGVBQWUsQ0FBQyxDQUFDO0lBQzVFLENBQUM7SUFHRCxzQkFBVyxpQ0FBTTthQUFqQjtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxNQUFNLENBQUM7UUFDN0IsQ0FBQzs7O09BQUE7SUFHRCxzQkFBVyxrQ0FBTzthQUFsQjtZQUVJLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUM7UUFDOUIsQ0FBQzs7O09BQUE7SUFHTSw0QkFBSSxHQUFYLFVBQVksT0FBb0IsRUFBRSxRQUFnQjtRQUU5QyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxFQUFDLFFBQVEsRUFBRSxRQUFRO1lBQ2xCLE9BQU8sRUFBRSxPQUFPLEVBQUMsQ0FBQyxDQUFDO0lBQ3hDLENBQUM7SUFHTSw0QkFBSSxHQUFYO1FBRUksSUFBTSxJQUFJLEdBQUcsSUFBSSxDQUFDLEtBQUssQ0FBQyxJQUFJLEVBQUUsQ0FBQztRQUMvQixPQUFPLElBQUksS0FBSyxTQUFTLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQztJQUN6RCxDQUFDO0lBR00sMkJBQUcsR0FBVjtRQUVJLElBQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxFQUFFLENBQUM7UUFDOUIsT0FBTyxJQUFJLEtBQUssU0FBUyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUM7SUFDekQsQ0FBQztJQUdMLG9CQUFDO0FBQUQsQ0EvQ0EsQUErQ0MsSUFBQTtBQS9DWSxzQ0FBYSIsImZpbGUiOiJwcmlvcml0eVF1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHtIZWFwLCBDb21wYXJlUmVzdWx0fSBmcm9tIFwiLi9oZWFwXCI7XG5cblxuaW50ZXJmYWNlIElQcmlvcml0eVF1ZXVlSXRlbTxQYXlsb2FkVHlwZT5cbntcbiAgICBwcmlvcml0eTogbnVtYmVyO1xuICAgIHBheWxvYWQ6ICBQYXlsb2FkVHlwZTtcbn1cblxuXG5mdW5jdGlvbiBjb21wYXJlUHJpb3JpdHk8UGF5bG9hZFR5cGU+KFxuICAgIGl0ZW1BOiBJUHJpb3JpdHlRdWV1ZUl0ZW08UGF5bG9hZFR5cGU+LFxuICAgIGl0ZW1COiBJUHJpb3JpdHlRdWV1ZUl0ZW08UGF5bG9hZFR5cGU+XG4pOiBDb21wYXJlUmVzdWx0IHtcbiAgICBpZiAoaXRlbUEucHJpb3JpdHkgPCBpdGVtQi5wcmlvcml0eSkge1xuICAgICAgICByZXR1cm4gQ29tcGFyZVJlc3VsdC5MRVNTO1xuICAgIH1cbiAgICBlbHNlIGlmIChpdGVtQS5wcmlvcml0eSA9PT0gaXRlbUIucHJpb3JpdHkpIHtcbiAgICAgICAgcmV0dXJuIENvbXBhcmVSZXN1bHQuRVFVQUw7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICByZXR1cm4gQ29tcGFyZVJlc3VsdC5HUkVBVEVSO1xuICAgIH1cbn1cblxuXG5leHBvcnQgY2xhc3MgUHJpb3JpdHlRdWV1ZTxQYXlsb2FkVHlwZT5cbntcblxuICAgIC8vIHJlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIF9oZWFwOiBIZWFwPElQcmlvcml0eVF1ZXVlSXRlbTxQYXlsb2FkVHlwZT4+O1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IoKVxuICAgIHtcbiAgICAgICAgdGhpcy5faGVhcCA9IG5ldyBIZWFwPElQcmlvcml0eVF1ZXVlSXRlbTxQYXlsb2FkVHlwZT4+KGNvbXBhcmVQcmlvcml0eSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXJcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9oZWFwLmxlbmd0aDtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgaXNFbXB0eSgpOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5faGVhcC5pc0VtcHR5O1xuICAgIH1cblxuXG4gICAgcHVibGljIHB1c2gocGF5bG9hZDogUGF5bG9hZFR5cGUsIHByaW9yaXR5OiBudW1iZXIpOiB2b2lkXG4gICAge1xuICAgICAgICB0aGlzLl9oZWFwLnB1c2goe3ByaW9yaXR5OiBwcmlvcml0eSxcbiAgICAgICAgICAgICAgICAgICAgICAgICBwYXlsb2FkOiBwYXlsb2FkfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcGVhaygpOiBQYXlsb2FkVHlwZSB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuX2hlYXAucGVhaygpO1xuICAgICAgICByZXR1cm4gaXRlbSA9PT0gdW5kZWZpbmVkID8gdW5kZWZpbmVkIDogaXRlbS5wYXlsb2FkO1xuICAgIH1cblxuXG4gICAgcHVibGljIHBvcCgpOiBQYXlsb2FkVHlwZSB8IHVuZGVmaW5lZFxuICAgIHtcbiAgICAgICAgY29uc3QgaXRlbSA9IHRoaXMuX2hlYXAucG9wKCk7XG4gICAgICAgIHJldHVybiBpdGVtID09PSB1bmRlZmluZWQgPyB1bmRlZmluZWQgOiBpdGVtLnBheWxvYWQ7XG4gICAgfVxuXG5cbn1cbiJdfQ==
