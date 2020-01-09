"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var BBPromise = require("bluebird");
/**
 * A Validator is an object that can evaluate the validity of a subject by
 * invoking an array of validator functions on that subject.  This class is
 * templated on the type of the subject to be validated.
 */
var Validator = /** @class */ (function () {
    // endregion
    /**
     * Constructs a new Validator.
     *
     * @param validatorFuncs - The functions used to validate a subject.  Each
     * function must have a single parameter of the subject type and return a
     * boolean or Promise<boolean> (true=valid, false=invalid).  If an async
     * function rejects, the subject is assumed to be invalid.
     */
    function Validator(validatorFuncs) {
        this._validatorFuncs = validatorFuncs;
    }
    /**
     * Evaluates the validity of subject.
     * @param subject - The data to be validated
     * @return A promise for the validity of subject.  This promise will never
     * reject.
     */
    Validator.prototype.isValid = function (subject) {
        var promises = _.map(this._validatorFuncs, function (curValidatorFunc) {
            var result = curValidatorFunc(subject);
            // Wrap each return value in a Promise.
            return BBPromise.resolve(result);
        });
        return BBPromise.all(promises)
            .then(function (validationResults) {
            // Return true only if every validator returned true.
            return _.every(validationResults);
        })
            .catch(function () {
            // One of the validators rejected.  Assume that means a failed
            // validation.
            return false;
        });
    };
    return Validator;
}());
exports.Validator = Validator;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy92YWxpZGF0b3IudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBNEI7QUFDNUIsb0NBQXNDO0FBV3RDOzs7O0dBSUc7QUFDSDtJQUlJLFlBQVk7SUFHWjs7Ozs7OztPQU9HO0lBQ0gsbUJBQW1CLGNBQWlEO1FBRWhFLElBQUksQ0FBQyxlQUFlLEdBQUcsY0FBYyxDQUFDO0lBQzFDLENBQUM7SUFHRDs7Ozs7T0FLRztJQUNJLDJCQUFPLEdBQWQsVUFBZSxPQUFvQjtRQUUvQixJQUFNLFFBQVEsR0FBNEIsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUFFLFVBQUMsZ0JBQWdCO1lBQ25GLElBQU0sTUFBTSxHQUErQixnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztZQUNyRSx1Q0FBdUM7WUFDdkMsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQ3JDLENBQUMsQ0FBQyxDQUFDO1FBRUgsT0FBTyxTQUFTLENBQUMsR0FBRyxDQUFVLFFBQVEsQ0FBQzthQUN0QyxJQUFJLENBQUMsVUFBQyxpQkFBaUM7WUFDcEMscURBQXFEO1lBQ3JELE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDO1FBQ3RDLENBQUMsQ0FBQzthQUNELEtBQUssQ0FBQztZQUNILDhEQUE4RDtZQUM5RCxjQUFjO1lBQ2QsT0FBTyxLQUFLLENBQUM7UUFDakIsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDO0lBQ0wsZ0JBQUM7QUFBRCxDQTlDQSxBQThDQyxJQUFBO0FBOUNZLDhCQUFTIiwiZmlsZSI6InZhbGlkYXRvci5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuXG5cbi8qKlxuICogQSB0eXBlIHRoYXQgZGVzY3JpYmVzIGEgZnVuY3Rpb24gdGhhdCB2YWxpZGF0ZXMgYSBwYXJ0aWN1bGFyIHN1YmplY3QuICBUaGVcbiAqIGZ1bmN0aW9uIGFjY2VwdHMgdGhlIHN1YmplY3QgYXMgaXRzIG9ubHkgcGFyYW1ldGVyIGFuZCByZXR1cm5zIGEgYm9vbGVhbiBvciBhXG4gKiBQcm9taXNlIGZvciBhIGJvb2xlYW4uXG4gKi9cbnR5cGUgVmFsaWRhdG9yRnVuYzxTdWJqZWN0VHlwZT4gPSAoc3ViamVjdDogU3ViamVjdFR5cGUpID0+IGJvb2xlYW4gfCBQcm9taXNlPGJvb2xlYW4+O1xuXG5cbi8qKlxuICogQSBWYWxpZGF0b3IgaXMgYW4gb2JqZWN0IHRoYXQgY2FuIGV2YWx1YXRlIHRoZSB2YWxpZGl0eSBvZiBhIHN1YmplY3QgYnlcbiAqIGludm9raW5nIGFuIGFycmF5IG9mIHZhbGlkYXRvciBmdW5jdGlvbnMgb24gdGhhdCBzdWJqZWN0LiAgVGhpcyBjbGFzcyBpc1xuICogdGVtcGxhdGVkIG9uIHRoZSB0eXBlIG9mIHRoZSBzdWJqZWN0IHRvIGJlIHZhbGlkYXRlZC5cbiAqL1xuZXhwb3J0IGNsYXNzIFZhbGlkYXRvcjxTdWJqZWN0VHlwZT5cbntcbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfdmFsaWRhdG9yRnVuY3M6IEFycmF5PFZhbGlkYXRvckZ1bmM8U3ViamVjdFR5cGU+PjtcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgLyoqXG4gICAgICogQ29uc3RydWN0cyBhIG5ldyBWYWxpZGF0b3IuXG4gICAgICpcbiAgICAgKiBAcGFyYW0gdmFsaWRhdG9yRnVuY3MgLSBUaGUgZnVuY3Rpb25zIHVzZWQgdG8gdmFsaWRhdGUgYSBzdWJqZWN0LiAgRWFjaFxuICAgICAqIGZ1bmN0aW9uIG11c3QgaGF2ZSBhIHNpbmdsZSBwYXJhbWV0ZXIgb2YgdGhlIHN1YmplY3QgdHlwZSBhbmQgcmV0dXJuIGFcbiAgICAgKiBib29sZWFuIG9yIFByb21pc2U8Ym9vbGVhbj4gKHRydWU9dmFsaWQsIGZhbHNlPWludmFsaWQpLiAgSWYgYW4gYXN5bmNcbiAgICAgKiBmdW5jdGlvbiByZWplY3RzLCB0aGUgc3ViamVjdCBpcyBhc3N1bWVkIHRvIGJlIGludmFsaWQuXG4gICAgICovXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKHZhbGlkYXRvckZ1bmNzOiBBcnJheTxWYWxpZGF0b3JGdW5jPFN1YmplY3RUeXBlPj4pXG4gICAge1xuICAgICAgICB0aGlzLl92YWxpZGF0b3JGdW5jcyA9IHZhbGlkYXRvckZ1bmNzO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogRXZhbHVhdGVzIHRoZSB2YWxpZGl0eSBvZiBzdWJqZWN0LlxuICAgICAqIEBwYXJhbSBzdWJqZWN0IC0gVGhlIGRhdGEgdG8gYmUgdmFsaWRhdGVkXG4gICAgICogQHJldHVybiBBIHByb21pc2UgZm9yIHRoZSB2YWxpZGl0eSBvZiBzdWJqZWN0LiAgVGhpcyBwcm9taXNlIHdpbGwgbmV2ZXJcbiAgICAgKiByZWplY3QuXG4gICAgICovXG4gICAgcHVibGljIGlzVmFsaWQoc3ViamVjdDogU3ViamVjdFR5cGUpOiBQcm9taXNlPGJvb2xlYW4+XG4gICAge1xuICAgICAgICBjb25zdCBwcm9taXNlczogQXJyYXk8UHJvbWlzZTxib29sZWFuPj4gPSBfLm1hcCh0aGlzLl92YWxpZGF0b3JGdW5jcywgKGN1clZhbGlkYXRvckZ1bmMpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlc3VsdDogUHJvbWlzZTxib29sZWFuPiB8IGJvb2xlYW4gPSBjdXJWYWxpZGF0b3JGdW5jKHN1YmplY3QpO1xuICAgICAgICAgICAgLy8gV3JhcCBlYWNoIHJldHVybiB2YWx1ZSBpbiBhIFByb21pc2UuXG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5hbGw8Ym9vbGVhbj4ocHJvbWlzZXMpXG4gICAgICAgIC50aGVuKCh2YWxpZGF0aW9uUmVzdWx0czogQXJyYXk8Ym9vbGVhbj4pID0+IHtcbiAgICAgICAgICAgIC8vIFJldHVybiB0cnVlIG9ubHkgaWYgZXZlcnkgdmFsaWRhdG9yIHJldHVybmVkIHRydWUuXG4gICAgICAgICAgICByZXR1cm4gXy5ldmVyeSh2YWxpZGF0aW9uUmVzdWx0cyk7XG4gICAgICAgIH0pXG4gICAgICAgIC5jYXRjaCgoKSA9PiB7XG4gICAgICAgICAgICAvLyBPbmUgb2YgdGhlIHZhbGlkYXRvcnMgcmVqZWN0ZWQuICBBc3N1bWUgdGhhdCBtZWFucyBhIGZhaWxlZFxuICAgICAgICAgICAgLy8gdmFsaWRhdGlvbi5cbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfSk7XG4gICAgfVxufVxuIl19
