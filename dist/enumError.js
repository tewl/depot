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
var enumHelpers_1 = require("./enumHelpers");
/**
 * An Error class in which instances are constructed to wrap error values
 * from a specific enumeration.
 */
var EnumError = /** @class */ (function (_super) {
    __extends(EnumError, _super);
    /**
     * Constructs a new EnumError instance
     * @param enumObject - The enumeration containing the possible errors
     * @param errorNum - The error value to wrap
     */
    function EnumError(enumObject, errorNum) {
        var _this = 
        // Chain to the base class.
        // Unfortunately, there is a weird issue related to extending Error and
        // targeting ES5.  See: http://bit.ly/2wDu0XP
        _super.call(this, "Error " + errorNum + " (" + enumHelpers_1.numericEnumValToString(enumObject, errorNum) + ")") || this;
        Object.setPrototypeOf(_this, EnumError.prototype);
        _this.errorNum = errorNum;
        return _this;
    }
    return EnumError;
}(Error));
/**
 * Convenience function that returns a class capable of wrapping errors defined
 * in the specified enumeration (in a type safe manner)
 * @param enumObject - The enumeration defining possible error values
 * @return A class whose instances will wrap error values from the specified
 * enumeration
 */
exports.getEnumErrorClass = function (enumObject) {
    // tslint:disable-next-line:max-classes-per-file
    return /** @class */ (function (_super) {
        __extends(SpecificEnumError, _super);
        function SpecificEnumError(errorNum) {
            var _this = _super.call(this, enumObject, errorNum) || this;
            Object.setPrototypeOf(_this, SpecificEnumError.prototype);
            return _this;
        }
        return SpecificEnumError;
    }(EnumError));
};

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9lbnVtRXJyb3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsNkNBQXFEO0FBR3JEOzs7R0FHRztBQUNIO0lBQTJCLDZCQUFLO0lBSTVCOzs7O09BSUc7SUFDSCxtQkFBbUIsVUFBYSxFQUFFLFFBQW9CO1FBQXREO1FBQ0ksMkJBQTJCO1FBQzNCLHVFQUF1RTtRQUN2RSw2Q0FBNkM7UUFDN0Msa0JBQU0sV0FBUyxRQUFRLFVBQUssb0NBQXNCLENBQUMsVUFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFHLENBQUMsU0FJL0U7UUFIRyxNQUFNLENBQUMsY0FBYyxDQUFDLEtBQUksRUFBRSxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUM7UUFFakQsS0FBSSxDQUFDLFFBQVEsR0FBRyxRQUFRLENBQUM7O0lBQzdCLENBQUM7SUFDTCxnQkFBQztBQUFELENBbEJBLEFBa0JDLENBbEIwQixLQUFLLEdBa0IvQjtBQUdEOzs7Ozs7R0FNRztBQUNRLFFBQUEsaUJBQWlCLEdBQUcsVUFBSSxVQUFhO0lBRTVDLGdEQUFnRDtJQUNoRDtRQUF1QyxxQ0FBWTtRQUUvQywyQkFBbUIsUUFBb0I7WUFBdkMsWUFFSSxrQkFBTSxVQUFVLEVBQUUsUUFBUSxDQUFDLFNBRTlCO1lBREcsTUFBTSxDQUFDLGNBQWMsQ0FBQyxLQUFJLEVBQUUsaUJBQWlCLENBQUMsU0FBUyxDQUFDLENBQUM7O1FBQzdELENBQUM7UUFDTCx3QkFBQztJQUFELENBUE8sQUFPTixDQVBzQyxTQUFTLEdBTzlDO0FBQ04sQ0FBQyxDQUFDIiwiZmlsZSI6ImVudW1FcnJvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7bnVtZXJpY0VudW1WYWxUb1N0cmluZ30gZnJvbSBcIi4vZW51bUhlbHBlcnNcIjtcblxuXG4vKipcbiAqIEFuIEVycm9yIGNsYXNzIGluIHdoaWNoIGluc3RhbmNlcyBhcmUgY29uc3RydWN0ZWQgdG8gd3JhcCBlcnJvciB2YWx1ZXNcbiAqIGZyb20gYSBzcGVjaWZpYyBlbnVtZXJhdGlvbi5cbiAqL1xuY2xhc3MgRW51bUVycm9yPFQ+IGV4dGVuZHMgRXJyb3JcbntcbiAgICBwdWJsaWMgcmVhZG9ubHkgZXJyb3JOdW06IFRba2V5b2YgVF07XG5cbiAgICAvKipcbiAgICAgKiBDb25zdHJ1Y3RzIGEgbmV3IEVudW1FcnJvciBpbnN0YW5jZVxuICAgICAqIEBwYXJhbSBlbnVtT2JqZWN0IC0gVGhlIGVudW1lcmF0aW9uIGNvbnRhaW5pbmcgdGhlIHBvc3NpYmxlIGVycm9yc1xuICAgICAqIEBwYXJhbSBlcnJvck51bSAtIFRoZSBlcnJvciB2YWx1ZSB0byB3cmFwXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKGVudW1PYmplY3Q6IFQsIGVycm9yTnVtOiBUW2tleW9mIFRdKSB7XG4gICAgICAgIC8vIENoYWluIHRvIHRoZSBiYXNlIGNsYXNzLlxuICAgICAgICAvLyBVbmZvcnR1bmF0ZWx5LCB0aGVyZSBpcyBhIHdlaXJkIGlzc3VlIHJlbGF0ZWQgdG8gZXh0ZW5kaW5nIEVycm9yIGFuZFxuICAgICAgICAvLyB0YXJnZXRpbmcgRVM1LiAgU2VlOiBodHRwOi8vYml0Lmx5LzJ3RHUwWFBcbiAgICAgICAgc3VwZXIoYEVycm9yICR7ZXJyb3JOdW19ICgke251bWVyaWNFbnVtVmFsVG9TdHJpbmcoZW51bU9iamVjdCwgZXJyb3JOdW0pfSlgKTtcbiAgICAgICAgT2JqZWN0LnNldFByb3RvdHlwZU9mKHRoaXMsIEVudW1FcnJvci5wcm90b3R5cGUpO1xuXG4gICAgICAgIHRoaXMuZXJyb3JOdW0gPSBlcnJvck51bTtcbiAgICB9XG59XG5cblxuLyoqXG4gKiBDb252ZW5pZW5jZSBmdW5jdGlvbiB0aGF0IHJldHVybnMgYSBjbGFzcyBjYXBhYmxlIG9mIHdyYXBwaW5nIGVycm9ycyBkZWZpbmVkXG4gKiBpbiB0aGUgc3BlY2lmaWVkIGVudW1lcmF0aW9uIChpbiBhIHR5cGUgc2FmZSBtYW5uZXIpXG4gKiBAcGFyYW0gZW51bU9iamVjdCAtIFRoZSBlbnVtZXJhdGlvbiBkZWZpbmluZyBwb3NzaWJsZSBlcnJvciB2YWx1ZXNcbiAqIEByZXR1cm4gQSBjbGFzcyB3aG9zZSBpbnN0YW5jZXMgd2lsbCB3cmFwIGVycm9yIHZhbHVlcyBmcm9tIHRoZSBzcGVjaWZpZWRcbiAqIGVudW1lcmF0aW9uXG4gKi9cbmV4cG9ydCBsZXQgZ2V0RW51bUVycm9yQ2xhc3MgPSA8VD4oZW51bU9iamVjdDogVCkgPT4ge1xuXG4gICAgLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOm1heC1jbGFzc2VzLXBlci1maWxlXG4gICAgcmV0dXJuIGNsYXNzIFNwZWNpZmljRW51bUVycm9yIGV4dGVuZHMgRW51bUVycm9yPFQ+IHtcblxuICAgICAgICBwdWJsaWMgY29uc3RydWN0b3IoZXJyb3JOdW06IFRba2V5b2YgVF0pXG4gICAgICAgIHtcbiAgICAgICAgICAgIHN1cGVyKGVudW1PYmplY3QsIGVycm9yTnVtKTtcbiAgICAgICAgICAgIE9iamVjdC5zZXRQcm90b3R5cGVPZih0aGlzLCBTcGVjaWZpY0VudW1FcnJvci5wcm90b3R5cGUpO1xuICAgICAgICB9XG4gICAgfTtcbn07XG5cblxuIl19
