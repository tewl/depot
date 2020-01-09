"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BBPromise = require("bluebird");
/**
 * Helper function that runs Jasmine and returns a promise that indicates the
 * results of the tests.
 * @param jasmineInstance - The jasmine instance to execute.
 * @return A promise that resolves when all tests pass and rejects when one or
 * more fail.  In either case, the promise does not settle until all tests have
 * completed.
 */
function runJasmine(jasmineInstance) {
    return new BBPromise(function (resolve, reject) {
        // Jasmine's execute() method does not provide the usual promise or
        // accept a callback.  Therefore, we have to rely on registering a
        // callback with onComplete().
        jasmineInstance.onComplete(function (allTestsPassed) {
            if (allTestsPassed) {
                resolve();
            }
            else {
                reject(new Error("One or more tests failed."));
            }
        });
        jasmineInstance.execute();
    });
}
exports.runJasmine = runJasmine;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9qYXNtaW5lSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9DQUFzQztBQUl0Qzs7Ozs7OztHQU9HO0FBQ0gsU0FBZ0IsVUFBVSxDQUFDLGVBQXdCO0lBQy9DLE9BQU8sSUFBSSxTQUFTLENBQUMsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUVqQyxtRUFBbUU7UUFDbkUsa0VBQWtFO1FBQ2xFLDhCQUE4QjtRQUM5QixlQUFlLENBQUMsVUFBVSxDQUFDLFVBQUMsY0FBYztZQUN0QyxJQUFJLGNBQWMsRUFBRTtnQkFDaEIsT0FBTyxFQUFFLENBQUM7YUFDYjtpQkFBTTtnQkFDSCxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsMkJBQTJCLENBQUMsQ0FBQyxDQUFDO2FBQ2xEO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxlQUFlLENBQUMsT0FBTyxFQUFFLENBQUM7SUFDOUIsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBaEJELGdDQWdCQyIsImZpbGUiOiJqYXNtaW5lSGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1yZXF1aXJlLWltcG9ydHNcbmltcG9ydCBKYXNtaW5lID0gcmVxdWlyZShcImphc21pbmVcIik7XG5cbi8qKlxuICogSGVscGVyIGZ1bmN0aW9uIHRoYXQgcnVucyBKYXNtaW5lIGFuZCByZXR1cm5zIGEgcHJvbWlzZSB0aGF0IGluZGljYXRlcyB0aGVcbiAqIHJlc3VsdHMgb2YgdGhlIHRlc3RzLlxuICogQHBhcmFtIGphc21pbmVJbnN0YW5jZSAtIFRoZSBqYXNtaW5lIGluc3RhbmNlIHRvIGV4ZWN1dGUuXG4gKiBAcmV0dXJuIEEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdoZW4gYWxsIHRlc3RzIHBhc3MgYW5kIHJlamVjdHMgd2hlbiBvbmUgb3JcbiAqIG1vcmUgZmFpbC4gIEluIGVpdGhlciBjYXNlLCB0aGUgcHJvbWlzZSBkb2VzIG5vdCBzZXR0bGUgdW50aWwgYWxsIHRlc3RzIGhhdmVcbiAqIGNvbXBsZXRlZC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJ1bkphc21pbmUoamFzbWluZUluc3RhbmNlOiBKYXNtaW5lKTogUHJvbWlzZTx2b2lkPiB7XG4gICAgcmV0dXJuIG5ldyBCQlByb21pc2UoKHJlc29sdmUsIHJlamVjdCkgPT4ge1xuXG4gICAgICAgIC8vIEphc21pbmUncyBleGVjdXRlKCkgbWV0aG9kIGRvZXMgbm90IHByb3ZpZGUgdGhlIHVzdWFsIHByb21pc2Ugb3JcbiAgICAgICAgLy8gYWNjZXB0IGEgY2FsbGJhY2suICBUaGVyZWZvcmUsIHdlIGhhdmUgdG8gcmVseSBvbiByZWdpc3RlcmluZyBhXG4gICAgICAgIC8vIGNhbGxiYWNrIHdpdGggb25Db21wbGV0ZSgpLlxuICAgICAgICBqYXNtaW5lSW5zdGFuY2Uub25Db21wbGV0ZSgoYWxsVGVzdHNQYXNzZWQpID0+IHtcbiAgICAgICAgICAgIGlmIChhbGxUZXN0c1Bhc3NlZCkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUoKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihcIk9uZSBvciBtb3JlIHRlc3RzIGZhaWxlZC5cIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBqYXNtaW5lSW5zdGFuY2UuZXhlY3V0ZSgpO1xuICAgIH0pO1xufVxuIl19
