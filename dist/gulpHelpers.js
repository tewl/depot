"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Converts an Error object to a special Gulp Error object that will not display
 * the error's stack trace.
 *
 * @param err - An object describing the error.  If it does not have a `message`
 *     property, one will be created with a generic message.
 * @param defaultErrorMsg - The error message to use when `err.message` does not
 *     exist.
 * @return A Gulp error object that will not display the stack trace
 */
function toGulpError(err, defaultErrorMsg) {
    if (defaultErrorMsg === void 0) { defaultErrorMsg = "Gulp encountered one or more errors."; }
    var gulpError = new Error(err.message || defaultErrorMsg);
    // Don't show the stack trace.
    gulpError.showStack = false;
    return gulpError;
}
exports.toGulpError = toGulpError;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ndWxwSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU1BOzs7Ozs7Ozs7R0FTRztBQUNILFNBQWdCLFdBQVcsQ0FDdkIsR0FBUSxFQUNSLGVBQWdFO0lBQWhFLGdDQUFBLEVBQUEsd0RBQWdFO0lBR2hFLElBQU0sU0FBUyxHQUFlLElBQUksS0FBSyxDQUFDLEdBQUcsQ0FBQyxPQUFPLElBQUksZUFBZSxDQUFlLENBQUM7SUFDdEYsOEJBQThCO0lBQzlCLFNBQVMsQ0FBQyxTQUFTLEdBQUcsS0FBSyxDQUFDO0lBQzVCLE9BQU8sU0FBUyxDQUFDO0FBQ3JCLENBQUM7QUFURCxrQ0FTQyIsImZpbGUiOiJndWxwSGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImludGVyZmFjZSBJR3VscEVycm9yIGV4dGVuZHMgRXJyb3JcbntcbiAgICBzaG93U3RhY2s6IGZhbHNlO1xufVxuXG5cbi8qKlxuICogQ29udmVydHMgYW4gRXJyb3Igb2JqZWN0IHRvIGEgc3BlY2lhbCBHdWxwIEVycm9yIG9iamVjdCB0aGF0IHdpbGwgbm90IGRpc3BsYXlcbiAqIHRoZSBlcnJvcidzIHN0YWNrIHRyYWNlLlxuICpcbiAqIEBwYXJhbSBlcnIgLSBBbiBvYmplY3QgZGVzY3JpYmluZyB0aGUgZXJyb3IuICBJZiBpdCBkb2VzIG5vdCBoYXZlIGEgYG1lc3NhZ2VgXG4gKiAgICAgcHJvcGVydHksIG9uZSB3aWxsIGJlIGNyZWF0ZWQgd2l0aCBhIGdlbmVyaWMgbWVzc2FnZS5cbiAqIEBwYXJhbSBkZWZhdWx0RXJyb3JNc2cgLSBUaGUgZXJyb3IgbWVzc2FnZSB0byB1c2Ugd2hlbiBgZXJyLm1lc3NhZ2VgIGRvZXMgbm90XG4gKiAgICAgZXhpc3QuXG4gKiBAcmV0dXJuIEEgR3VscCBlcnJvciBvYmplY3QgdGhhdCB3aWxsIG5vdCBkaXNwbGF5IHRoZSBzdGFjayB0cmFjZVxuICovXG5leHBvcnQgZnVuY3Rpb24gdG9HdWxwRXJyb3IoXG4gICAgZXJyOiBhbnksXG4gICAgZGVmYXVsdEVycm9yTXNnOiBzdHJpbmcgPSBcIkd1bHAgZW5jb3VudGVyZWQgb25lIG9yIG1vcmUgZXJyb3JzLlwiXG4pOiBFcnJvclxue1xuICAgIGNvbnN0IGd1bHBFcnJvcjogSUd1bHBFcnJvciA9IG5ldyBFcnJvcihlcnIubWVzc2FnZSB8fCBkZWZhdWx0RXJyb3JNc2cpIGFzIElHdWxwRXJyb3I7XG4gICAgLy8gRG9uJ3Qgc2hvdyB0aGUgc3RhY2sgdHJhY2UuXG4gICAgZ3VscEVycm9yLnNob3dTdGFjayA9IGZhbHNlO1xuICAgIHJldHVybiBndWxwRXJyb3I7XG59XG4iXX0=
