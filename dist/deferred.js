"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BBPromise = require("bluebird");
var Deferred = /** @class */ (function () {
    function Deferred() {
        var _this = this;
        // The following temporary assignments are here to get rid of a bogus TS
        // error: "TS2564: Property 'resolve' has no initializer and is not
        // definitely assigned in the constructor."
        this.resolve = function () { };
        this.reject = function () { };
        this.promise = new BBPromise(function (resolve, reject) {
            _this.resolve = resolve;
            _this.reject = reject;
        });
        // Make this object immutable.
        Object.freeze(this);
    }
    return Deferred;
}());
exports.Deferred = Deferred;
/**
 * Connects a (source) Promise to a Deferred (sink).
 * @param thePromise - The promise that will serve as input to `theDeferred`
 * @param theDeferred - The Deferred that will sink the output from `thePromise`
 * @return description
 */
function connectPromiseToDeferred(thePromise, theDeferred) {
    thePromise
        .then(function (result) { theDeferred.resolve(result); }, function (err) { theDeferred.reject(err); });
}
exports.connectPromiseToDeferred = connectPromiseToDeferred;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kZWZlcnJlZC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLG9DQUFzQztBQUd0QztJQU1JO1FBQUEsaUJBZUM7UUFiRyx3RUFBd0U7UUFDeEUsbUVBQW1FO1FBQ25FLDJDQUEyQztRQUMzQyxJQUFJLENBQUMsT0FBTyxHQUFHLGNBQWEsQ0FBQyxDQUFDO1FBQzlCLElBQUksQ0FBQyxNQUFNLEdBQUcsY0FBYSxDQUFDLENBQUM7UUFFN0IsSUFBSSxDQUFDLE9BQU8sR0FBRyxJQUFJLFNBQVMsQ0FBQyxVQUFDLE9BQXNDLEVBQUUsTUFBMEI7WUFDNUYsS0FBSSxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUM7WUFDdkIsS0FBSSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7UUFDekIsQ0FBQyxDQUFDLENBQUM7UUFFSCw4QkFBOEI7UUFDOUIsTUFBTSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsQ0FBQztJQUN4QixDQUFDO0lBQ0wsZUFBQztBQUFELENBdEJBLEFBc0JDLElBQUE7QUF0QlksNEJBQVE7QUF5QnJCOzs7OztHQUtHO0FBQ0gsU0FBZ0Isd0JBQXdCLENBQ3BDLFVBQWdDLEVBQ2hDLFdBQWtDO0lBR2xDLFVBQVU7U0FDVCxJQUFJLENBQ0QsVUFBQyxNQUFtQixJQUFPLFdBQVcsQ0FBQyxPQUFPLENBQUMsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLEVBQ3pELFVBQUMsR0FBRyxJQUFPLFdBQVcsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQ3hDLENBQUM7QUFDTixDQUFDO0FBVkQsNERBVUMiLCJmaWxlIjoiZGVmZXJyZWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5cblxuZXhwb3J0IGNsYXNzIERlZmVycmVkPFJlc29sdmVUeXBlPlxue1xuICAgIHB1YmxpYyBwcm9taXNlOiBQcm9taXNlPFJlc29sdmVUeXBlPjtcbiAgICBwdWJsaWMgcmVzb2x2ZTogKHJlc3VsdDogUmVzb2x2ZVR5cGUpID0+IHZvaWQ7XG4gICAgcHVibGljIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkO1xuXG4gICAgY29uc3RydWN0b3IoKVxuICAgIHtcbiAgICAgICAgLy8gVGhlIGZvbGxvd2luZyB0ZW1wb3JhcnkgYXNzaWdubWVudHMgYXJlIGhlcmUgdG8gZ2V0IHJpZCBvZiBhIGJvZ3VzIFRTXG4gICAgICAgIC8vIGVycm9yOiBcIlRTMjU2NDogUHJvcGVydHkgJ3Jlc29sdmUnIGhhcyBubyBpbml0aWFsaXplciBhbmQgaXMgbm90XG4gICAgICAgIC8vIGRlZmluaXRlbHkgYXNzaWduZWQgaW4gdGhlIGNvbnN0cnVjdG9yLlwiXG4gICAgICAgIHRoaXMucmVzb2x2ZSA9ICgpOiB2b2lkID0+IHt9O1xuICAgICAgICB0aGlzLnJlamVjdCA9ICgpOiB2b2lkID0+IHt9O1xuXG4gICAgICAgIHRoaXMucHJvbWlzZSA9IG5ldyBCQlByb21pc2UoKHJlc29sdmU6IChyZXN1bHQ6IFJlc29sdmVUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5yZXNvbHZlID0gcmVzb2x2ZTtcbiAgICAgICAgICAgIHRoaXMucmVqZWN0ID0gcmVqZWN0O1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBNYWtlIHRoaXMgb2JqZWN0IGltbXV0YWJsZS5cbiAgICAgICAgT2JqZWN0LmZyZWV6ZSh0aGlzKTtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBDb25uZWN0cyBhIChzb3VyY2UpIFByb21pc2UgdG8gYSBEZWZlcnJlZCAoc2luaykuXG4gKiBAcGFyYW0gdGhlUHJvbWlzZSAtIFRoZSBwcm9taXNlIHRoYXQgd2lsbCBzZXJ2ZSBhcyBpbnB1dCB0byBgdGhlRGVmZXJyZWRgXG4gKiBAcGFyYW0gdGhlRGVmZXJyZWQgLSBUaGUgRGVmZXJyZWQgdGhhdCB3aWxsIHNpbmsgdGhlIG91dHB1dCBmcm9tIGB0aGVQcm9taXNlYFxuICogQHJldHVybiBkZXNjcmlwdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY29ubmVjdFByb21pc2VUb0RlZmVycmVkPFJlc29sdmVUeXBlPihcbiAgICB0aGVQcm9taXNlOiBQcm9taXNlPFJlc29sdmVUeXBlPixcbiAgICB0aGVEZWZlcnJlZDogRGVmZXJyZWQ8UmVzb2x2ZVR5cGU+XG4pOiB2b2lkXG57XG4gICAgdGhlUHJvbWlzZVxuICAgIC50aGVuKFxuICAgICAgICAocmVzdWx0OiBSZXNvbHZlVHlwZSkgPT4geyB0aGVEZWZlcnJlZC5yZXNvbHZlKHJlc3VsdCk7IH0sXG4gICAgICAgIChlcnIpID0+IHsgdGhlRGVmZXJyZWQucmVqZWN0KGVycik7IH1cbiAgICApO1xufVxuIl19
