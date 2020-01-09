"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var factorialCache = [];
function factorial(val) {
    if (val === 0 || val === 1) {
        return 1;
    }
    else if (factorialCache[val] !== undefined) {
        return factorialCache[val];
    }
    else {
        var f = factorial(val - 1) * val;
        factorialCache[val] = f;
        return f;
    }
}
exports.factorial = factorial;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9tYXRoSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLElBQU0sY0FBYyxHQUFrQixFQUFFLENBQUM7QUFFekMsU0FBZ0IsU0FBUyxDQUFDLEdBQVc7SUFFakMsSUFBSSxHQUFHLEtBQUssQ0FBQyxJQUFJLEdBQUcsS0FBSyxDQUFDLEVBQUU7UUFDeEIsT0FBTyxDQUFDLENBQUM7S0FDWjtTQUNJLElBQUksY0FBYyxDQUFDLEdBQUcsQ0FBQyxLQUFLLFNBQVMsRUFBRTtRQUN4QyxPQUFPLGNBQWMsQ0FBQyxHQUFHLENBQUMsQ0FBQztLQUM5QjtTQUNJO1FBQ0QsSUFBTSxDQUFDLEdBQUcsU0FBUyxDQUFDLEdBQUcsR0FBRyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUM7UUFDbkMsY0FBYyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQztRQUN4QixPQUFPLENBQUMsQ0FBQztLQUNaO0FBRUwsQ0FBQztBQWRELDhCQWNDIiwiZmlsZSI6Im1hdGhIZWxwZXJzLmpzIiwic291cmNlc0NvbnRlbnQiOlsiY29uc3QgZmFjdG9yaWFsQ2FjaGU6IEFycmF5PG51bWJlcj4gPSBbXTtcblxuZXhwb3J0IGZ1bmN0aW9uIGZhY3RvcmlhbCh2YWw6IG51bWJlcik6IG51bWJlclxue1xuICAgIGlmICh2YWwgPT09IDAgfHwgdmFsID09PSAxKSB7XG4gICAgICAgIHJldHVybiAxO1xuICAgIH1cbiAgICBlbHNlIGlmIChmYWN0b3JpYWxDYWNoZVt2YWxdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgcmV0dXJuIGZhY3RvcmlhbENhY2hlW3ZhbF07XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBjb25zdCBmID0gZmFjdG9yaWFsKHZhbCAtIDEpICogdmFsO1xuICAgICAgICBmYWN0b3JpYWxDYWNoZVt2YWxdID0gZjtcbiAgICAgICAgcmV0dXJuIGY7XG4gICAgfVxuXG59XG4iXX0=
