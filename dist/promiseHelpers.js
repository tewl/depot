"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var listenerTracker_1 = require("./listenerTracker");
var BBPromise = require("bluebird");
/**
 * Adapts a Node-style async function with any number of arguments and a callback to a
 * function that has the same arguments (minus the callback) and returns a Promise.
 * @param func - The Node-style function that takes arguments followed by a
 * Node-style callback.
 * @return A function that takes the arguments and returns a Promise for the result.
 */
function promisifyN(func) {
    var promisifiedFunc = function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        return new BBPromise(function (resolve, reject) {
            func.apply(undefined, args.concat(function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            }));
        });
    };
    return promisifiedFunc;
}
exports.promisifyN = promisifyN;
/**
 * Adapts a Node-style async function with one parameter and a callback to a
 * function that takes one parameter and returns a Promise.  This function is
 * similar to promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes one argument and a
 * Node-style callback.
 * @return A function that takes the one argument and returns a Promise for the
 * result.
 */
function promisify1(func) {
    var promisifiedFunc = function (arg1) {
        return new BBPromise(function (resolve, reject) {
            func(arg1, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    return promisifiedFunc;
}
exports.promisify1 = promisify1;
/**
 * Adapts a Node-style async function with two parameters and a callback to a function
 * that takes two parameters and returns a Promise.  This function is similar to
 * promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes two arguments and a
 * Node-style callback.
 * @return A function that takes the two arguments and returns a Promise for the
 * result.
 */
function promisify2(func) {
    var promisifiedFunc = function (arg1, arg2) {
        return new BBPromise(function (resolve, reject) {
            func(arg1, arg2, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    return promisifiedFunc;
}
exports.promisify2 = promisify2;
/**
 * Adapts a Node-style async function with three parameters and a callback to a function
 * that takes three parameters and returns a Promise.  This function is similar to
 * promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes three arguments and a
 * Node-style callback.
 * @return A function that takes the three arguments and returns a Promise for the
 * result.
 */
function promisify3(func) {
    var promisifiedFunc = function (arg1, arg2, arg3) {
        return new BBPromise(function (resolve, reject) {
            func(arg1, arg2, arg3, function (err, result) {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result);
                }
            });
        });
    };
    return promisifiedFunc;
}
exports.promisify3 = promisify3;
/**
 * Runs a sequence of functions in order with each returned value feeding into
 * the parameter of the next.
 * @param tasks - The functions to execute in sequence.  Each function will
 * receive 1 parameter, the return value of the previous function.  A function
 * should throw an exception if it wishes to terminate the sequence and reject
 * the returned promise.
 * @param initialValue - The value that will be passed into the first function.
 * @returns A promise that will be resolved with the return value
 * of the last function.
 */
function sequence(tasks, initialValue) {
    "use strict";
    return tasks.reduce(function (accumulator, curTask) {
        return accumulator.then(curTask);
    }, BBPromise.resolve(initialValue));
}
exports.sequence = sequence;
/**
 *  Creates a promise that is resolved when all input promises have been
 *  settled (resolved or rejected).  The returned Promise is resolved with an
 *  array of BBPromise.Inspection objects.
 *
 *  This is the commonly accepted way of implementing allSettled() in Bluebird.
 *  See:  http://bluebirdjs.com/docs/api/reflect.html
 *
 * @param promises - The array of input promises.
 * @returns A promise that will be resolved with an inspection object for each
 * input promise.
 */
function allSettled(promises) {
    "use strict";
    var wrappedPromises = _.map(promises, function (curPromise) { return BBPromise.resolve(curPromise).reflect(); });
    return BBPromise.all(wrappedPromises);
}
exports.allSettled = allSettled;
/**
 * Gets a Promise that will resolve with resolveValue after the specified number
 * of milliseconds.
 *
 * @param ms - The number of milliseconds to delay before the Promise will be
 * resolved.
 * @param resolveValue - The value the Promise will be resolved with.
 * @returns A Promise that will be resolved with the specified value
 * after the specified delay
 */
function getTimerPromise(ms, resolveValue) {
    "use strict";
    return new BBPromise(function (resolve) {
        setTimeout(function () {
            resolve(resolveValue);
        }, ms);
    });
}
exports.getTimerPromise = getTimerPromise;
/**
 * Invokes a task only when a condition is true.
 * @param condition - The condition that controls whether the task is run
 * @param task - The task that is run when `condition` is truthy
 * @param falseResolveValue - The value the returned promise will resolve with
 * when `condition` is falsy.
 * @return When `condition` is true, a promise that resolves with the result of
 * `task`.  When `condition` is false, a promise that resolves with
 * `falseResolveValue`.
 */
function conditionalTask(condition, task, falseResolveValue) {
    if (condition) {
        return task();
    }
    else {
        return BBPromise.resolve(falseResolveValue);
    }
}
exports.conditionalTask = conditionalTask;
/**
 * Adapts an EventEmitter to a Promise interface
 * @param emitter - The event emitter to listen to
 * @param resolveEventName - The event that will cause the Promise to resolve
 * @param rejectEventName - The event that will cause the Promise to reject
 * @return A Promise that will will resolve and reject as specified
 */
function eventToPromise(emitter, resolveEventName, rejectEventName) {
    return new BBPromise(function (resolve, reject) {
        var tracker = new listenerTracker_1.ListenerTracker(emitter);
        tracker.once(resolveEventName, function (result) {
            tracker.removeAll();
            resolve(result);
        });
        if (rejectEventName) {
            tracker.once(rejectEventName, function (err) {
                tracker.removeAll();
                reject(err);
            });
        }
    });
}
exports.eventToPromise = eventToPromise;
/**
 * Adapts a stream to a Promise interface.
 * @param stream - The stream to be adapted
 * @return A Promise that will be resolved when the stream emits the "finish"
 * event and rejects when it emits an "error" event.
 */
function streamToPromise(stream) {
    return eventToPromise(stream, "finish", "error");
}
exports.streamToPromise = streamToPromise;
/**
 * Adapts a promise-returning function into a promise-returning function that
 * will retry the operation up to maxNumAttempts times before rejecting.
 * Retries are performed using exponential backoff.
 *
 * @param theFunc - The promise-returning function that will be retried multiple
 * times
 *
 * @param maxNumAttempts - The maximum number of times to invoke theFunc before
 * rejecting the returned Promise.  This argument should always be greater than
 * or equal to 1.  If it is not, theFunc will be tried only once.
 *
 * @returns A Promise that will be resolved immediately (with the same
 * value) when the promise returned by the Func resolves.  If the Promise
 * returned by theFunc rejects, it will be retried up to maxNumAttempts
 * invocations.  If the Promise returned by the last invocation of theFunc
 * rejects, the returned Promise will be rejected with the same value.
 */
function retry(theFunc, maxNumAttempts) {
    "use strict";
    return retryWhileImpl(theFunc, function () { return true; }, maxNumAttempts, 0);
}
exports.retry = retry;
/**
 * Adapts a promise-returning function into a promise-returning function that
 * will continue to retry the operation as long as whilePredicate returns true
 * up to maxNumAttempts attempts before rejecting.  Retries are performed using
 * exponential backoff.
 *
 * @param theFunc - The promise-returning function that will be retried multiple
 * times
 *
 * @param whilePredicate - A function that determines whether the operation
 * should continue being retried.  This function takes the value returned by the
 * last rejection and returns true if retrying should continue or false otherwise.
 *
 * @param maxNumAttempts - The maximum number of times to invoke theFunc before
 * rejecting the returned Promise.  This argument should always be greater than
 * or equal to 1.  If it is not, theFunc will be tried only once.
 *
 * @returns A Promise that will be resolved immediately (with the same
 * value) when the promise returned by the Func resolves.  If the Promise
 * returned by theFunc rejects, it will be retried up to maxNumAttempts
 * invocations.  If the Promise returned by the last invocation of theFunc
 * rejects, the returned Promise will be rejected with the same value.
 */
function retryWhile(theFunc, whilePredicate, maxNumAttempts) {
    "use strict";
    return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, 0);
}
exports.retryWhile = retryWhile;
/**
 * The value that will be multiplied by successively higher powers of 2 when
 * calculating delay time during exponential backoff.
 */
var BACKOFF_MULTIPLIER = 20;
/**
 * Recursive implementation of retryWhile(), allowing for additional
 * implementation specific arguments.
 * @param theFunc - The operation to perform
 * @param whilePredicate - Predicate that determines whether to retry
 * @param maxNumAttempts - Maximum number of invocations of theFunc
 * @param attemptsSoFar - Number of theFunc invocations so far
 * @returns The Promise returned to the client
 */
function retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, attemptsSoFar) {
    "use strict";
    return new BBPromise(function (resolve, reject) {
        ++attemptsSoFar;
        theFunc()
            .then(function (value) {
            // The current iteration resolved.  Return the value to the client
            // immediately.
            resolve(value);
        }, function (err) {
            // The promise was rejected.
            if (attemptsSoFar >= maxNumAttempts) {
                // logger.error("Retry operation failed after " + maxNumAttempts + " attempts.");
                reject(err);
            }
            else if (!whilePredicate(err)) {
                // logger.error("Stopped retrying operation because while predicate returned false." + err);
                reject(err);
            }
            else {
                var backoffBaseMs = Math.pow(2, attemptsSoFar - 1) * BACKOFF_MULTIPLIER;
                // A random amount of time should be added to or
                // subtracted from the base so that multiple retries
                // don't get stacked on top of each other, making
                // the congestion even worse.  This random range
                // should be either the multiplier or 25% of the
                // calculated base, whichever is larger.
                var randomHalfRange = Math.max(BACKOFF_MULTIPLIER, 0.25 * backoffBaseMs);
                var randomMs = _.random(-1 * randomHalfRange, randomHalfRange);
                var delayMs = backoffBaseMs + randomMs;
                // logger.info("Failed. Queuing next attempt in " + backoffBaseMs + " + " + randomMs + " (" + delayMs + ") ms\n");
                var timerPromise = getTimerPromise(delayMs, undefined);
                resolve(timerPromise
                    .then(function () {
                    return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, attemptsSoFar);
                }));
            }
        });
    });
}
/**
 * A promise version of a while() {} loop
 * @param predicate - A predicate that will be invoked before each iteration of
 * body.  Iteration will stop when this function returns false.
 * @param body - A promise returning function that will be invoked for each
 * iteration.  This function is responsible for making predicate eventually return false.
 * @returns A Promise that is resolved when all iterations have
 * successfully completed or will be rejected when body returns a rejected promise.
 */
function promiseWhile(predicate, body) {
    "use strict";
    return new BBPromise(function (resolve, reject) {
        function loop() {
            if (!predicate()) {
                // We are done iterating.  Resolve with a void value.
                return resolve();
            }
            // We are not done iterating.  Invoke body() and execute this loop
            // again when it resolves.  Note: The value returned from body() is
            // wrapped in a promise in case it doesn't return a promise.
            BBPromise.resolve(body())
                .then(loop, reject);
        }
        // Get things started.  loop() will queue itself to run for further
        // iterations.
        setTimeout(loop, 0);
    });
}
exports.promiseWhile = promiseWhile;
/**
 * Maps an array of Promises to a new same sized array of Promises.  The new
 * array of Promises will settle starting at index 0 and continue through the
 * array sequentially.
 * @param inputPromises - The array of Promises to transform
 * @returns A new array of Promises that will settle sequentially,
 * starting at index 0.
 */
function sequentialSettle(inputPromises) {
    "use strict";
    var outputPromises = [];
    _.forEach(inputPromises, function (curInputPromise) {
        var previousPromise = outputPromises.length > 0 ?
            outputPromises[outputPromises.length - 1] :
            BBPromise.resolve();
        var promise = delaySettle(curInputPromise, previousPromise);
        outputPromises.push(promise);
    });
    return outputPromises;
}
exports.sequentialSettle = sequentialSettle;
/**
 * Returns a promise that wraps thePromise, but will be resolved or rejected
 * after the resolution or rejection of waitFor.
 * @param thePromise - the Promise to be wrapped/delayed
 * @param waitFor - The Promise that must be settled before the returned promise
 * will settle.
 * @returns A Promise wrapping thePromise, but will be settled after waitFor is
 * settled
 */
function delaySettle(thePromise, waitFor) {
    "use strict";
    return thePromise
        .then(function (result) {
        // Whether waitFor resolved or rejected, we should resolve
        // with the original resolved value.
        return waitFor
            .then(function () { return result; })
            .catch(function () { return result; });
    })
        .catch(function (err) {
        // Whether waitFor resolved or rejected, we should reject with the
        // original error.
        return waitFor
            .then(function () { throw err; })
            .catch(function () { throw err; });
    });
}
exports.delaySettle = delaySettle;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcm9taXNlSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUVBLDBCQUE0QjtBQUM1QixxREFBa0Q7QUFDbEQsb0NBQXNDO0FBTXRDOzs7Ozs7R0FNRztBQUNILFNBQWdCLFVBQVUsQ0FDdEIsSUFBbUM7SUFHbkMsSUFBTSxlQUFlLEdBQUc7UUFBVSxjQUFtQjthQUFuQixVQUFtQixFQUFuQixxQkFBbUIsRUFBbkIsSUFBbUI7WUFBbkIseUJBQW1COztRQUVqRCxPQUFPLElBQUksU0FBUyxDQUFhLFVBQUMsT0FBcUMsRUFBRSxNQUEwQjtZQUMvRixJQUFJLENBQUMsS0FBSyxDQUFDLFNBQVMsRUFBRSxJQUFJLENBQUMsTUFBTSxDQUFDLFVBQUMsR0FBUSxFQUFFLE1BQWtCO2dCQUMzRCxJQUFJLEdBQUcsRUFBRTtvQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLE1BQU0sQ0FBQyxDQUFDO2lCQUNuQjtZQUNMLENBQUMsQ0FBQyxDQUFDLENBQUM7UUFDUixDQUFDLENBQUMsQ0FBQztJQUNQLENBQUMsQ0FBQztJQUNGLE9BQU8sZUFBZSxDQUFDO0FBQzNCLENBQUM7QUFqQkQsZ0NBaUJDO0FBR0Q7Ozs7Ozs7O0dBUUc7QUFDSCxTQUFnQixVQUFVLENBQ3RCLElBQTZEO0lBRzdELElBQU0sZUFBZSxHQUFHLFVBQVUsSUFBYztRQUM1QyxPQUFPLElBQUksU0FBUyxDQUFhLFVBQUMsT0FBcUMsRUFBRSxNQUEwQjtZQUMvRixJQUFJLENBQUMsSUFBSSxFQUFFLFVBQUMsR0FBUSxFQUFFLE1BQW1CO2dCQUNyQyxJQUFJLEdBQUcsRUFBRTtvQkFDTCxNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7aUJBQ2Y7cUJBQU07b0JBQ0gsT0FBTyxDQUFDLE1BQU8sQ0FBQyxDQUFDO2lCQUNwQjtZQUNMLENBQUMsQ0FBQyxDQUFDO1FBQ1AsQ0FBQyxDQUFDLENBQUM7SUFDUCxDQUFDLENB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L0MsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxhQUFhLEVBQUUsVUFBQyxlQUFlO1FBQ3JDLElBQU0sZUFBZSxHQUFpQixjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDO1lBQzNCLGNBQWMsQ0FBQyxjQUFjLENBQUMsTUFBTSxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUM7WUFDM0MsU0FBUyxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBRTFELElBQU0sT0FBTyxHQUFpQixXQUFXLENBQUMsZUFBZSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQzVFLGNBQWMsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLENBQUM7SUFDakMsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFPLGNBQWMsQ0FBQztBQUMxQixDQUFDO0FBZkQsNENBZUM7QUFHRDs7Ozs7Ozs7R0FRRztBQUNILFNBQWdCLFdBQVcsQ0FBYyxVQUFnQyxFQUFFLE9BQXFCO0lBQzVGLFlBQVksQ0FBQztJQUViLE9BQU8sVUFBVTtTQUNoQixJQUFJLENBQUMsVUFBQyxNQUFtQjtRQUN0QiwwREFBMEQ7UUFDMUQsb0NBQW9DO1FBQ3BDLE9BQU8sT0FBTzthQUNiLElBQUksQ0FBQyxjQUFNLE9BQUEsTUFBTSxFQUFOLENBQU0sQ0FBRTthQUNuQixLQUFLLENBQUMsY0FBTSxPQUFBLE1BQU0sRUFBTixDQUFNLENBQUUsQ0FBQztJQUMxQixDQUFDLENBQUM7U0FDRCxLQUFLLENBQUMsVUFBQyxHQUFRO1FBQ1osa0VBQWtFO1FBQ2xFLGtCQUFrQjtRQUNsQixPQUFPLE9BQU87YUFDYixJQUFJLENBQUMsY0FBUSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQzthQUMxQixLQUFLLENBQUMsY0FBUSxNQUFNLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQ2pDLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQWxCRCxrQ0FrQkMiLCJmaWxlIjoicHJvbWlzZUhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1dyaXRhYmxlfSBmcm9tIFwic3RyZWFtXCI7XG5pbXBvcnQge0V2ZW50RW1pdHRlcn0gZnJvbSBcImV2ZW50c1wiO1xuaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQge0xpc3RlbmVyVHJhY2tlcn0gZnJvbSBcIi4vbGlzdGVuZXJUcmFja2VyXCI7XG5pbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5cblxuZXhwb3J0IHR5cGUgQ2FsbEJhY2tUeXBlPFJlc3VsdFR5cGU+ID0gKGVycjogYW55LCByZXN1bHQ/OiBSZXN1bHRUeXBlKSA9PiB2b2lkO1xuXG5cbi8qKlxuICogQWRhcHRzIGEgTm9kZS1zdHlsZSBhc3luYyBmdW5jdGlvbiB3aXRoIGFueSBudW1iZXIgb2YgYXJndW1lbnRzIGFuZCBhIGNhbGxiYWNrIHRvIGFcbiAqIGZ1bmN0aW9uIHRoYXQgaGFzIHRoZSBzYW1lIGFyZ3VtZW50cyAobWludXMgdGhlIGNhbGxiYWNrKSBhbmQgcmV0dXJucyBhIFByb21pc2UuXG4gKiBAcGFyYW0gZnVuYyAtIFRoZSBOb2RlLXN0eWxlIGZ1bmN0aW9uIHRoYXQgdGFrZXMgYXJndW1lbnRzIGZvbGxvd2VkIGJ5IGFcbiAqIE5vZGUtc3R5bGUgY2FsbGJhY2suXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgYXJndW1lbnRzIGFuZCByZXR1cm5zIGEgUHJvbWlzZSBmb3IgdGhlIHJlc3VsdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb21pc2lmeU48UmVzdWx0VHlwZT4oXG4gICAgZnVuYzogKC4uLmFyZ3M6IEFycmF5PGFueT4pID0+IHZvaWRcbik6ICguLi5hcmdzOiBBcnJheTxhbnk+KSA9PiBQcm9taXNlPFJlc3VsdFR5cGU+IHtcblxuICAgIGNvbnN0IHByb21pc2lmaWVkRnVuYyA9IGZ1bmN0aW9uICguLi5hcmdzOiBBcnJheTxhbnk+KTogUHJvbWlzZTxSZXN1bHRUeXBlPiB7XG5cbiAgICAgICAgcmV0dXJuIG5ldyBCQlByb21pc2U8UmVzdWx0VHlwZT4oKHJlc29sdmU6IChyZXN1bHQ6IFJlc3VsdFR5cGUpID0+IHZvaWQsIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBmdW5jLmFwcGx5KHVuZGVmaW5lZCwgYXJncy5jb25jYXQoKGVycjogYW55LCByZXN1bHQ6IFJlc3VsdFR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHByb21pc2lmaWVkRnVuYztcbn1cblxuXG4vKipcbiAqIEFkYXB0cyBhIE5vZGUtc3R5bGUgYXN5bmMgZnVuY3Rpb24gd2l0aCBvbmUgcGFyYW1ldGVyIGFuZCBhIGNhbGxiYWNrIHRvIGFcbiAqIGZ1bmN0aW9uIHRoYXQgdGFrZXMgb25lIHBhcmFtZXRlciBhbmQgcmV0dXJucyBhIFByb21pc2UuICBUaGlzIGZ1bmN0aW9uIGlzXG4gKiBzaW1pbGFyIHRvIHByb21pc2lmeU4oKSwgZXhjZXB0IHRoYXQgaXQgcmV0YWlucyB0eXBlIHNhZmV0eS5cbiAqIEBwYXJhbSBmdW5jIC0gVGhlIE5vZGUtc3R5bGUgZnVuY3Rpb24gdGhhdCB0YWtlcyBvbmUgYXJndW1lbnQgYW5kIGFcbiAqIE5vZGUtc3R5bGUgY2FsbGJhY2suXG4gKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCB0YWtlcyB0aGUgb25lIGFyZ3VtZW50IGFuZCByZXR1cm5zIGEgUHJvbWlzZSBmb3IgdGhlXG4gKiByZXN1bHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNpZnkxPFJlc3VsdFR5cGUsIEFyZzFUeXBlPihcbiAgICBmdW5jOiAoYXJnMTogQXJnMVR5cGUsIGNiOiBDYWxsQmFja1R5cGU8UmVzdWx0VHlwZT4gKSA9PiB2b2lkXG4pOiAoYXJnMTogQXJnMVR5cGUpID0+IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuXG4gICAgY29uc3QgcHJvbWlzaWZpZWRGdW5jID0gZnVuY3Rpb24gKGFyZzE6IEFyZzFUeXBlKTogUHJvbWlzZTxSZXN1bHRUeXBlPiB7XG4gICAgICAgIHJldHVybiBuZXcgQkJQcm9taXNlPFJlc3VsdFR5cGU+KChyZXNvbHZlOiAocmVzdWx0OiBSZXN1bHRUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgZnVuYyhhcmcxLCAoZXJyOiBhbnksIHJlc3VsdD86IFJlc3VsdFR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0ISk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHByb21pc2lmaWVkRnVuYztcblxufVxuXG5cbi8qKlxuICogQWRhcHRzIGEgTm9kZS1zdHlsZSBhc3luYyBmdW5jdGlvbiB3aXRoIHR3byBwYXJhbWV0ZXJzIGFuZCBhIGNhbGxiYWNrIHRvIGEgZnVuY3Rpb25cbiAqIHRoYXQgdGFrZXMgdHdvIHBhcmFtZXRlcnMgYW5kIHJldHVybnMgYSBQcm9taXNlLiAgVGhpcyBmdW5jdGlvbiBpcyBzaW1pbGFyIHRvXG4gKiBwcm9taXNpZnlOKCksIGV4Y2VwdCB0aGF0IGl0IHJldGFpbnMgdHlwZSBzYWZldHkuXG4gKiBAcGFyYW0gZnVuYyAtIFRoZSBOb2RlLXN0eWxlIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdHdvIGFyZ3VtZW50cyBhbmQgYVxuICogTm9kZS1zdHlsZSBjYWxsYmFjay5cbiAqIEByZXR1cm4gQSBmdW5jdGlvbiB0aGF0IHRha2VzIHRoZSB0d28gYXJndW1lbnRzIGFuZCByZXR1cm5zIGEgUHJvbWlzZSBmb3IgdGhlXG4gKiByZXN1bHQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNpZnkyPFJlc3VsdFR5cGUsIEFyZzFUeXBlLCBBcmcyVHlwZT4oXG4gICAgZnVuYzogKGFyZzE6IEFyZzFUeXBlLCBhcmcyOiBBcmcyVHlwZSwgY2I6IENhbGxCYWNrVHlwZTxSZXN1bHRUeXBlPiApID0+IHZvaWRcbik6IChhcmcxOiBBcmcxVHlwZSwgYXJnMjogQXJnMlR5cGUpID0+IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuXG4gICAgY29uc3QgcHJvbWlzaWZpZWRGdW5jID0gZnVuY3Rpb24gKGFyZzE6IEFyZzFUeXBlLCBhcmcyOiBBcmcyVHlwZSk6IFByb21pc2U8UmVzdWx0VHlwZT4ge1xuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxSZXN1bHRUeXBlPigocmVzb2x2ZTogKHJlc3VsdDogUmVzdWx0VHlwZSkgPT4gdm9pZCwgcmVqZWN0OiAoZXJyOiBhbnkpID0+IHZvaWQpID0+IHtcbiAgICAgICAgICAgIGZ1bmMoYXJnMSwgYXJnMiwgKGVycjogYW55LCByZXN1bHQ/OiBSZXN1bHRUeXBlKSA9PiB7XG4gICAgICAgICAgICAgICAgaWYgKGVycikge1xuICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICByZXNvbHZlKHJlc3VsdCEpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KTtcbiAgICB9O1xuICAgIHJldHVybiBwcm9taXNpZmllZEZ1bmM7XG59XG5cblxuLyoqXG4gKiBBZGFwdHMgYSBOb2RlLXN0eWxlIGFzeW5jIGZ1bmN0aW9uIHdpdGggdGhyZWUgcGFyYW1ldGVycyBhbmQgYSBjYWxsYmFjayB0byBhIGZ1bmN0aW9uXG4gKiB0aGF0IHRha2VzIHRocmVlIHBhcmFtZXRlcnMgYW5kIHJldHVybnMgYSBQcm9taXNlLiAgVGhpcyBmdW5jdGlvbiBpcyBzaW1pbGFyIHRvXG4gKiBwcm9taXNpZnlOKCksIGV4Y2VwdCB0aGF0IGl0IHJldGFpbnMgdHlwZSBzYWZldHkuXG4gKiBAcGFyYW0gZnVuYyAtIFRoZSBOb2RlLXN0eWxlIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhyZWUgYXJndW1lbnRzIGFuZCBhXG4gKiBOb2RlLXN0eWxlIGNhbGxiYWNrLlxuICogQHJldHVybiBBIGZ1bmN0aW9uIHRoYXQgdGFrZXMgdGhlIHRocmVlIGFyZ3VtZW50cyBhbmQgcmV0dXJucyBhIFByb21pc2UgZm9yIHRoZVxuICogcmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvbWlzaWZ5MzxSZXN1bHRUeXBlLCBBcmcxVHlwZSwgQXJnMlR5cGUsIEFyZzNUeXBlPihcbiAgICBmdW5jOiAoYXJnMTogQXJnMVR5cGUsIGFyZzI6IEFyZzJUeXBlLCBhcmczOiBBcmczVHlwZSwgY2I6IENhbGxCYWNrVHlwZTxSZXN1bHRUeXBlPiApID0+IHZvaWRcbik6IChhcmcxOiBBcmcxVHlwZSwgYXJnMjogQXJnMlR5cGUsIGFyZzM6IEFyZzNUeXBlKSA9PiBQcm9taXNlPFJlc3VsdFR5cGU+IHtcblxuICAgIGNvbnN0IHByb21pc2lmaWVkRnVuYyA9IGZ1bmN0aW9uIChhcmcxOiBBcmcxVHlwZSwgYXJnMjogQXJnMlR5cGUsIGFyZzM6IEFyZzNUeXBlKTogUHJvbWlzZTxSZXN1bHRUeXBlPiB7XG4gICAgICAgIHJldHVybiBuZXcgQkJQcm9taXNlPFJlc3VsdFR5cGU+KChyZXNvbHZlOiAocmVzdWx0OiBSZXN1bHRUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgZnVuYyhhcmcxLCBhcmcyLCBhcmczLCAoZXJyOiBhbnksIHJlc3VsdD86IFJlc3VsdFR5cGUpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAoZXJyKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUocmVzdWx0ISk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgIH0pO1xuICAgIH07XG4gICAgcmV0dXJuIHByb21pc2lmaWVkRnVuYztcbn1cblxuXG4vKipcbiAqIEEgdGFzayBpcyBhbnkgb3BlcmF0aW9uIHRoYXQgY2FuIGJlIHN0YXJ0ZWQgKGkuZS4gY2FsbGVkKSB3aGljaCBjb21wbGV0ZXMgYXRcbiAqIHNvbWUgcG9pbnQgaW4gdGhlIGZ1dHVyZS5cbiAqL1xuZXhwb3J0IHR5cGUgVGFzazxSZXNvbHZlVHlwZT4gPSAoKSA9PiBQcm9taXNlPFJlc29sdmVUeXBlPjtcblxuXG4vKipcbiAqIFJ1bnMgYSBzZXF1ZW5jZSBvZiBmdW5jdGlvbnMgaW4gb3JkZXIgd2l0aCBlYWNoIHJldHVybmVkIHZhbHVlIGZlZWRpbmcgaW50b1xuICogdGhlIHBhcmFtZXRlciBvZiB0aGUgbmV4dC5cbiAqIEBwYXJhbSB0YXNrcyAtIFRoZSBmdW5jdGlvbnMgdG8gZXhlY3V0ZSBpbiBzZXF1ZW5jZS4gIEVhY2ggZnVuY3Rpb24gd2lsbFxuICogcmVjZWl2ZSAxIHBhcmFtZXRlciwgdGhlIHJldHVybiB2YWx1ZSBvZiB0aGUgcHJldmlvdXMgZnVuY3Rpb24uICBBIGZ1bmN0aW9uXG4gKiBzaG91bGQgdGhyb3cgYW4gZXhjZXB0aW9uIGlmIGl0IHdpc2hlcyB0byB0ZXJtaW5hdGUgdGhlIHNlcXVlbmNlIGFuZCByZWplY3RcbiAqIHRoZSByZXR1cm5lZCBwcm9taXNlLlxuICogQHBhcmFtIGluaXRpYWxWYWx1ZSAtIFRoZSB2YWx1ZSB0aGF0IHdpbGwgYmUgcGFzc2VkIGludG8gdGhlIGZpcnN0IGZ1bmN0aW9uLlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aXRoIHRoZSByZXR1cm4gdmFsdWVcbiAqIG9mIHRoZSBsYXN0IGZ1bmN0aW9uLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVuY2UoXG4gICAgdGFza3M6IEFycmF5PChwcmV2aW91c1ZhbHVlOiBhbnkpID0+IGFueT4sXG4gICAgaW5pdGlhbFZhbHVlOiBhbnlcbik6IFByb21pc2U8YW55PiB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gdGFza3MucmVkdWNlKFxuICAgICAgICAoYWNjdW11bGF0b3IsIGN1clRhc2spID0+IHtcbiAgICAgICAgICAgIHJldHVybiBhY2N1bXVsYXRvci50aGVuKGN1clRhc2spO1xuICAgICAgICB9LFxuICAgICAgICBCQlByb21pc2UucmVzb2x2ZShpbml0aWFsVmFsdWUpKTtcbn1cblxuXG4vKipcbiAqICBDcmVhdGVzIGEgcHJvbWlzZSB0aGF0IGlzIHJlc29sdmVkIHdoZW4gYWxsIGlucHV0IHByb21pc2VzIGhhdmUgYmVlblxuICogIHNldHRsZWQgKHJlc29sdmVkIG9yIHJlamVjdGVkKS4gIFRoZSByZXR1cm5lZCBQcm9taXNlIGlzIHJlc29sdmVkIHdpdGggYW5cbiAqICBhcnJheSBvZiBCQlByb21pc2UuSW5zcGVjdGlvbiBvYmplY3RzLlxuICpcbiAqICBUaGlzIGlzIHRoZSBjb21tb25seSBhY2NlcHRlZCB3YXkgb2YgaW1wbGVtZW50aW5nIGFsbFNldHRsZWQoKSBpbiBCbHVlYmlyZC5cbiAqICBTZWU6ICBodHRwOi8vYmx1ZWJpcmRqcy5jb20vZG9jcy9hcGkvcmVmbGVjdC5odG1sXG4gKlxuICogQHBhcmFtIHByb21pc2VzIC0gVGhlIGFycmF5IG9mIGlucHV0IHByb21pc2VzLlxuICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aXRoIGFuIGluc3BlY3Rpb24gb2JqZWN0IGZvciBlYWNoXG4gKiBpbnB1dCBwcm9taXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gYWxsU2V0dGxlZChwcm9taXNlczogQXJyYXk8UHJvbWlzZTxhbnk+Pik6IFByb21pc2U8QXJyYXk8QkJQcm9taXNlLkluc3BlY3Rpb248YW55Pj4+ICB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBjb25zdCB3cmFwcGVkUHJvbWlzZXM6IEFycmF5PEJCUHJvbWlzZS5JbnNwZWN0aW9uPGFueT4+ID0gXy5tYXAoXG4gICAgICAgIHByb21pc2VzLFxuICAgICAgICAoY3VyUHJvbWlzZTogUHJvbWlzZTxhbnk+KSA9PiBCQlByb21pc2UucmVzb2x2ZShjdXJQcm9taXNlKS5yZWZsZWN0KCkpO1xuICAgIHJldHVybiBCQlByb21pc2UuYWxsKHdyYXBwZWRQcm9taXNlcyk7XG59XG5cblxuLyoqXG4gKiBHZXRzIGEgUHJvbWlzZSB0aGF0IHdpbGwgcmVzb2x2ZSB3aXRoIHJlc29sdmVWYWx1ZSBhZnRlciB0aGUgc3BlY2lmaWVkIG51bWJlclxuICogb2YgbWlsbGlzZWNvbmRzLlxuICpcbiAqIEBwYXJhbSBtcyAtIFRoZSBudW1iZXIgb2YgbWlsbGlzZWNvbmRzIHRvIGRlbGF5IGJlZm9yZSB0aGUgUHJvbWlzZSB3aWxsIGJlXG4gKiByZXNvbHZlZC5cbiAqIEBwYXJhbSByZXNvbHZlVmFsdWUgLSBUaGUgdmFsdWUgdGhlIFByb21pc2Ugd2lsbCBiZSByZXNvbHZlZCB3aXRoLlxuICogQHJldHVybnMgQSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aXRoIHRoZSBzcGVjaWZpZWQgdmFsdWVcbiAqIGFmdGVyIHRoZSBzcGVjaWZpZWQgZGVsYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldFRpbWVyUHJvbWlzZTxSZXNvbHZlVHlwZT4oXG4gICAgbXM6ICAgICAgICAgICAgbnVtYmVyLFxuICAgIHJlc29sdmVWYWx1ZTogIFJlc29sdmVUeXBlXG4pOiBQcm9taXNlPFJlc29sdmVUeXBlPiB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gbmV3IEJCUHJvbWlzZShcbiAgICAgICAgKHJlc29sdmU6IChyZXNvbHZlVmFsdWU6IFJlc29sdmVUeXBlKSA9PiB2b2lkKSA9PiB7XG4gICAgICAgICAgICBzZXRUaW1lb3V0KFxuICAgICAgICAgICAgICAgICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShyZXNvbHZlVmFsdWUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgbXNcbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cbiAgICApO1xuXG59XG5cblxuLyoqXG4gKiBJbnZva2VzIGEgdGFzayBvbmx5IHdoZW4gYSBjb25kaXRpb24gaXMgdHJ1ZS5cbiAqIEBwYXJhbSBjb25kaXRpb24gLSBUaGUgY29uZGl0aW9uIHRoYXQgY29udHJvbHMgd2hldGhlciB0aGUgdGFzayBpcyBydW5cbiAqIEBwYXJhbSB0YXNrIC0gVGhlIHRhc2sgdGhhdCBpcyBydW4gd2hlbiBgY29uZGl0aW9uYCBpcyB0cnV0aHlcbiAqIEBwYXJhbSBmYWxzZVJlc29sdmVWYWx1ZSAtIFRoZSB2YWx1ZSB0aGUgcmV0dXJuZWQgcHJvbWlzZSB3aWxsIHJlc29sdmUgd2l0aFxuICogd2hlbiBgY29uZGl0aW9uYCBpcyBmYWxzeS5cbiAqIEByZXR1cm4gV2hlbiBgY29uZGl0aW9uYCBpcyB0cnVlLCBhIHByb21pc2UgdGhhdCByZXNvbHZlcyB3aXRoIHRoZSByZXN1bHQgb2ZcbiAqIGB0YXNrYC4gIFdoZW4gYGNvbmRpdGlvbmAgaXMgZmFsc2UsIGEgcHJvbWlzZSB0aGF0IHJlc29sdmVzIHdpdGhcbiAqIGBmYWxzZVJlc29sdmVWYWx1ZWAuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25kaXRpb25hbFRhc2s8UmVzb2x2ZVR5cGU+KFxuICAgIGNvbmRpdGlvbjogYW55LFxuICAgIHRhc2s6IFRhc2s8UmVzb2x2ZVR5cGU+LFxuICAgIGZhbHNlUmVzb2x2ZVZhbHVlOiBSZXNvbHZlVHlwZVxuKTogUHJvbWlzZTxSZXNvbHZlVHlwZT4ge1xuICAgIGlmIChjb25kaXRpb24pIHtcbiAgICAgICAgcmV0dXJuIHRhc2soKTtcbiAgICB9XG4gICAgZWxzZSB7XG4gICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZShmYWxzZVJlc29sdmVWYWx1ZSk7XG4gICAgfVxufVxuXG5cbi8qKlxuICogQWRhcHRzIGFuIEV2ZW50RW1pdHRlciB0byBhIFByb21pc2UgaW50ZXJmYWNlXG4gKiBAcGFyYW0gZW1pdHRlciAtIFRoZSBldmVudCBlbWl0dGVyIHRvIGxpc3RlbiB0b1xuICogQHBhcmFtIHJlc29sdmVFdmVudE5hbWUgLSBUaGUgZXZlbnQgdGhhdCB3aWxsIGNhdXNlIHRoZSBQcm9taXNlIHRvIHJlc29sdmVcbiAqIEBwYXJhbSByZWplY3RFdmVudE5hbWUgLSBUaGUgZXZlbnQgdGhhdCB3aWxsIGNhdXNlIHRoZSBQcm9taXNlIHRvIHJlamVjdFxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCB3aWxsIHdpbGwgcmVzb2x2ZSBhbmQgcmVqZWN0IGFzIHNwZWNpZmllZFxuICovXG5leHBvcnQgZnVuY3Rpb24gZXZlbnRUb1Byb21pc2U8UmVzb2x2ZVR5cGU+KFxuICAgIGVtaXR0ZXI6IEV2ZW50RW1pdHRlcixcbiAgICByZXNvbHZlRXZlbnROYW1lOiBzdHJpbmcsXG4gICAgcmVqZWN0RXZlbnROYW1lPzogc3RyaW5nXG4pOiBQcm9taXNlPFJlc29sdmVUeXBlPlxue1xuICAgIHJldHVybiBuZXcgQkJQcm9taXNlPFJlc29sdmVUeXBlPihcbiAgICAgICAgKHJlc29sdmU6IChyZXN1bHQ6IFJlc29sdmVUeXBlKSA9PiB2b2lkLCByZWplY3Q6IChlcnI6IGFueSkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgY29uc3QgdHJhY2tlciA9IG5ldyBMaXN0ZW5lclRyYWNrZXIoZW1pdHRlcik7XG5cbiAgICAgICAgICAgIHRyYWNrZXIub25jZShyZXNvbHZlRXZlbnROYW1lLCAocmVzdWx0OiBSZXNvbHZlVHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgIHRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgcmVzb2x2ZShyZXN1bHQpO1xuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgICAgIGlmIChyZWplY3RFdmVudE5hbWUpXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgdHJhY2tlci5vbmNlKHJlamVjdEV2ZW50TmFtZSwgKGVycjogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIHRyYWNrZXIucmVtb3ZlQWxsKCk7XG4gICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgKTtcbn1cblxuXG4vKipcbiAqIEFkYXB0cyBhIHN0cmVhbSB0byBhIFByb21pc2UgaW50ZXJmYWNlLlxuICogQHBhcmFtIHN0cmVhbSAtIFRoZSBzdHJlYW0gdG8gYmUgYWRhcHRlZFxuICogQHJldHVybiBBIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIHdoZW4gdGhlIHN0cmVhbSBlbWl0cyB0aGUgXCJmaW5pc2hcIlxuICogZXZlbnQgYW5kIHJlamVjdHMgd2hlbiBpdCBlbWl0cyBhbiBcImVycm9yXCIgZXZlbnQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHJlYW1Ub1Byb21pc2Uoc3RyZWFtOiBXcml0YWJsZSk6IFByb21pc2U8dm9pZD4ge1xuICAgIHJldHVybiBldmVudFRvUHJvbWlzZShzdHJlYW0sIFwiZmluaXNoXCIsIFwiZXJyb3JcIik7XG59XG5cblxuLyoqXG4gKiBBZGFwdHMgYSBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbiBpbnRvIGEgcHJvbWlzZS1yZXR1cm5pbmcgZnVuY3Rpb24gdGhhdFxuICogd2lsbCByZXRyeSB0aGUgb3BlcmF0aW9uIHVwIHRvIG1heE51bUF0dGVtcHRzIHRpbWVzIGJlZm9yZSByZWplY3RpbmcuXG4gKiBSZXRyaWVzIGFyZSBwZXJmb3JtZWQgdXNpbmcgZXhwb25lbnRpYWwgYmFja29mZi5cbiAqXG4gKiBAcGFyYW0gdGhlRnVuYyAtIFRoZSBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgcmV0cmllZCBtdWx0aXBsZVxuICogdGltZXNcbiAqXG4gKiBAcGFyYW0gbWF4TnVtQXR0ZW1wdHMgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgdGltZXMgdG8gaW52b2tlIHRoZUZ1bmMgYmVmb3JlXG4gKiByZWplY3RpbmcgdGhlIHJldHVybmVkIFByb21pc2UuICBUaGlzIGFyZ3VtZW50IHNob3VsZCBhbHdheXMgYmUgZ3JlYXRlciB0aGFuXG4gKiBvciBlcXVhbCB0byAxLiAgSWYgaXQgaXMgbm90LCB0aGVGdW5jIHdpbGwgYmUgdHJpZWQgb25seSBvbmNlLlxuICpcbiAqIEByZXR1cm5zIEEgUHJvbWlzZSB0aGF0IHdpbGwgYmUgcmVzb2x2ZWQgaW1tZWRpYXRlbHkgKHdpdGggdGhlIHNhbWVcbiAqIHZhbHVlKSB3aGVuIHRoZSBwcm9taXNlIHJldHVybmVkIGJ5IHRoZSBGdW5jIHJlc29sdmVzLiAgSWYgdGhlIFByb21pc2VcbiAqIHJldHVybmVkIGJ5IHRoZUZ1bmMgcmVqZWN0cywgaXQgd2lsbCBiZSByZXRyaWVkIHVwIHRvIG1heE51bUF0dGVtcHRzXG4gKiBpbnZvY2F0aW9ucy4gIElmIHRoZSBQcm9taXNlIHJldHVybmVkIGJ5IHRoZSBsYXN0IGludm9jYXRpb24gb2YgdGhlRnVuY1xuICogcmVqZWN0cywgdGhlIHJldHVybmVkIFByb21pc2Ugd2lsbCBiZSByZWplY3RlZCB3aXRoIHRoZSBzYW1lIHZhbHVlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gcmV0cnk8UmVzb2x2ZVR5cGU+KFxuICAgIHRoZUZ1bmM6ICAgICAgICAgKCkgPT4gUHJvbWlzZTxSZXNvbHZlVHlwZT4sXG4gICAgbWF4TnVtQXR0ZW1wdHM6ICBudW1iZXJcbik6IFByb21pc2U8UmVzb2x2ZVR5cGU+IHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gcmV0cnlXaGlsZUltcGwodGhlRnVuYywgKCkgPT4gdHJ1ZSwgbWF4TnVtQXR0ZW1wdHMsIDApO1xufVxuXG5cbi8qKlxuICogQWRhcHRzIGEgcHJvbWlzZS1yZXR1cm5pbmcgZnVuY3Rpb24gaW50byBhIHByb21pc2UtcmV0dXJuaW5nIGZ1bmN0aW9uIHRoYXRcbiAqIHdpbGwgY29udGludWUgdG8gcmV0cnkgdGhlIG9wZXJhdGlvbiBhcyBsb25nIGFzIHdoaWxlUHJlZGljYXRlIHJldHVybnMgdHJ1ZVxuICogdXAgdG8gbWF4TnVtQXR0ZW1wdHMgYXR0ZW1wdHMgYmVmb3JlIHJlamVjdGluZy4gIFJldHJpZXMgYXJlIHBlcmZvcm1lZCB1c2luZ1xuICogZXhwb25lbnRpYWwgYmFja29mZi5cbiAqXG4gKiBAcGFyYW0gdGhlRnVuYyAtIFRoZSBwcm9taXNlLXJldHVybmluZyBmdW5jdGlvbiB0aGF0IHdpbGwgYmUgcmV0cmllZCBtdWx0aXBsZVxuICogdGltZXNcbiAqXG4gKiBAcGFyYW0gd2hpbGVQcmVkaWNhdGUgLSBBIGZ1bmN0aW9uIHRoYXQgZGV0ZXJtaW5lcyB3aGV0aGVyIHRoZSBvcGVyYXRpb25cbiAqIHNob3VsZCBjb250aW51ZSBiZWluZyByZXRyaWVkLiAgVGhpcyBmdW5jdGlvbiB0YWtlcyB0aGUgdmFsdWUgcmV0dXJuZWQgYnkgdGhlXG4gKiBsYXN0IHJlamVjdGlvbiBhbmQgcmV0dXJucyB0cnVlIGlmIHJldHJ5aW5nIHNob3VsZCBjb250aW51ZSBvciBmYWxzZSBvdGhlcndpc2UuXG4gKlxuICogQHBhcmFtIG1heE51bUF0dGVtcHRzIC0gVGhlIG1heGltdW0gbnVtYmVyIG9mIHRpbWVzIHRvIGludm9rZSB0aGVGdW5jIGJlZm9yZVxuICogcmVqZWN0aW5nIHRoZSByZXR1cm5lZCBQcm9taXNlLiAgVGhpcyBhcmd1bWVudCBzaG91bGQgYWx3YXlzIGJlIGdyZWF0ZXIgdGhhblxuICogb3IgZXF1YWwgdG8gMS4gIElmIGl0IGlzIG5vdCwgdGhlRnVuYyB3aWxsIGJlIHRyaWVkIG9ubHkgb25jZS5cbiAqXG4gKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCB3aWxsIGJlIHJlc29sdmVkIGltbWVkaWF0ZWx5ICh3aXRoIHRoZSBzYW1lXG4gKiB2YWx1ZSkgd2hlbiB0aGUgcHJvbWlzZSByZXR1cm5lZCBieSB0aGUgRnVuYyByZXNvbHZlcy4gIElmIHRoZSBQcm9taXNlXG4gKiByZXR1cm5lZCBieSB0aGVGdW5jIHJlamVjdHMsIGl0IHdpbGwgYmUgcmV0cmllZCB1cCB0byBtYXhOdW1BdHRlbXB0c1xuICogaW52b2NhdGlvbnMuICBJZiB0aGUgUHJvbWlzZSByZXR1cm5lZCBieSB0aGUgbGFzdCBpbnZvY2F0aW9uIG9mIHRoZUZ1bmNcbiAqIHJlamVjdHMsIHRoZSByZXR1cm5lZCBQcm9taXNlIHdpbGwgYmUgcmVqZWN0ZWQgd2l0aCB0aGUgc2FtZSB2YWx1ZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJldHJ5V2hpbGU8UmVzb2x2ZVR5cGU+KFxuICAgIHRoZUZ1bmM6ICgpID0+IFByb21pc2U8UmVzb2x2ZVR5cGU+LFxuICAgIHdoaWxlUHJlZGljYXRlOiAoZXJyOiBhbnkpID0+IGJvb2xlYW4sXG4gICAgbWF4TnVtQXR0ZW1wdHM6IG51bWJlclxuKTogUHJvbWlzZTxSZXNvbHZlVHlwZT4ge1xuICAgIFwidXNlIHN0cmljdFwiO1xuICAgIHJldHVybiByZXRyeVdoaWxlSW1wbCh0aGVGdW5jLCB3aGlsZVByZWRpY2F0ZSwgbWF4TnVtQXR0ZW1wdHMsIDApO1xufVxuXG4vKipcbiAqIFRoZSB2YWx1ZSB0aGF0IHdpbGwgYmUgbXVsdGlwbGllZCBieSBzdWNjZXNzaXZlbHkgaGlnaGVyIHBvd2VycyBvZiAyIHdoZW5cbiAqIGNhbGN1bGF0aW5nIGRlbGF5IHRpbWUgZHVyaW5nIGV4cG9uZW50aWFsIGJhY2tvZmYuXG4gKi9cbmNvbnN0IEJBQ0tPRkZfTVVMVElQTElFUjogbnVtYmVyID0gMjA7XG5cblxuLyoqXG4gKiBSZWN1cnNpdmUgaW1wbGVtZW50YXRpb24gb2YgcmV0cnlXaGlsZSgpLCBhbGxvd2luZyBmb3IgYWRkaXRpb25hbFxuICogaW1wbGVtZW50YXRpb24gc3BlY2lmaWMgYXJndW1lbnRzLlxuICogQHBhcmFtIHRoZUZ1bmMgLSBUaGUgb3BlcmF0aW9uIHRvIHBlcmZvcm1cbiAqIEBwYXJhbSB3aGlsZVByZWRpY2F0ZSAtIFByZWRpY2F0ZSB0aGF0IGRldGVybWluZXMgd2hldGhlciB0byByZXRyeVxuICogQHBhcmFtIG1heE51bUF0dGVtcHRzIC0gTWF4aW11bSBudW1iZXIgb2YgaW52b2NhdGlvbnMgb2YgdGhlRnVuY1xuICogQHBhcmFtIGF0dGVtcHRzU29GYXIgLSBOdW1iZXIgb2YgdGhlRnVuYyBpbnZvY2F0aW9ucyBzbyBmYXJcbiAqIEByZXR1cm5zIFRoZSBQcm9taXNlIHJldHVybmVkIHRvIHRoZSBjbGllbnRcbiAqL1xuZnVuY3Rpb24gcmV0cnlXaGlsZUltcGw8UmVzb2x2ZVR5cGU+KFxuICAgIHRoZUZ1bmM6ICAgICAgICAgKCkgPT4gUHJvbWlzZTxSZXNvbHZlVHlwZT4sXG4gICAgd2hpbGVQcmVkaWNhdGU6ICAoZXJyOiBhbnkpID0+IGJvb2xlYW4sXG4gICAgbWF4TnVtQXR0ZW1wdHM6ICBudW1iZXIsXG4gICAgYXR0ZW1wdHNTb0ZhcjogICBudW1iZXJcbik6IFByb21pc2U8UmVzb2x2ZVR5cGU+IHtcbiAgICBcInVzZSBzdHJpY3RcIjtcbiAgICByZXR1cm4gbmV3IEJCUHJvbWlzZShcbiAgICAgICAgKHJlc29sdmU6ICh2YWx1ZTogUmVzb2x2ZVR5cGV8UHJvbWlzZTxSZXNvbHZlVHlwZT4pID0+IHZvaWQsIHJlamVjdDogKGVycjogYW55KSA9PiB2b2lkKSA9PiB7XG5cbiAgICAgICAgICAgICsrYXR0ZW1wdHNTb0ZhcjtcbiAgICAgICAgICAgIHRoZUZ1bmMoKVxuICAgICAgICAgICAgLnRoZW4oXG4gICAgICAgICAgICAgICAgKHZhbHVlOiBSZXNvbHZlVHlwZSkgPT4ge1xuICAgICAgICAgICAgICAgICAgICAvLyBUaGUgY3VycmVudCBpdGVyYXRpb24gcmVzb2x2ZWQuICBSZXR1cm4gdGhlIHZhbHVlIHRvIHRoZSBjbGllbnRcbiAgICAgICAgICAgICAgICAgICAgLy8gaW1tZWRpYXRlbHkuXG4gICAgICAgICAgICAgICAgICAgIHJlc29sdmUodmFsdWUpO1xuICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgKGVycjogYW55KTogdm9pZCA9PiB7XG4gICAgICAgICAgICAgICAgICAgIC8vIFRoZSBwcm9taXNlIHdhcyByZWplY3RlZC5cbiAgICAgICAgICAgICAgICAgICAgaWYgKGF0dGVtcHRzU29GYXIgPj0gbWF4TnVtQXR0ZW1wdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIGxvZ2dlci5lcnJvcihcIlJldHJ5IG9wZXJhdGlvbiBmYWlsZWQgYWZ0ZXIgXCIgKyBtYXhOdW1BdHRlbXB0cyArIFwiIGF0dGVtcHRzLlwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICAgICAgICAgICAgICB9IGVsc2UgaWYgKCF3aGlsZVByZWRpY2F0ZShlcnIpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dnZXIuZXJyb3IoXCJTdG9wcGVkIHJldHJ5aW5nIG9wZXJhdGlvbiBiZWNhdXNlIHdoaWxlIHByZWRpY2F0ZSByZXR1cm5lZCBmYWxzZS5cIiArIGVycik7XG4gICAgICAgICAgICAgICAgICAgICAgICByZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IGJhY2tvZmZCYXNlTXM6IG51bWJlciA9IE1hdGgucG93KDIsIGF0dGVtcHRzU29GYXIgLSAxKSAqIEJBQ0tPRkZfTVVMVElQTElFUjtcblxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gQSByYW5kb20gYW1vdW50IG9mIHRpbWUgc2hvdWxkIGJlIGFkZGVkIHRvIG9yXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBzdWJ0cmFjdGVkIGZyb20gdGhlIGJhc2Ugc28gdGhhdCBtdWx0aXBsZSByZXRyaWVzXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBkb24ndCBnZXQgc3RhY2tlZCBvbiB0b3Agb2YgZWFjaCBvdGhlciwgbWFraW5nXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyB0aGUgY29uZ2VzdGlvbiBldmVuIHdvcnNlLiAgVGhpcyByYW5kb20gcmFuZ2VcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIHNob3VsZCBiZSBlaXRoZXIgdGhlIG11bHRpcGxpZXIgb3IgMjUlIG9mIHRoZVxuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY2FsY3VsYXRlZCBiYXNlLCB3aGljaGV2ZXIgaXMgbGFyZ2VyLlxuXG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zdCByYW5kb21IYWxmUmFuZ2U6IG51bWJlciA9IE1hdGgubWF4KEJBQ0tPRkZfTVVMVElQTElFUiwgMC4yNSAqIGJhY2tvZmZCYXNlTXMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgcmFuZG9tTXM6IG51bWJlciA9IF8ucmFuZG9tKC0xICogcmFuZG9tSGFsZlJhbmdlLCByYW5kb21IYWxmUmFuZ2UpO1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc3QgZGVsYXlNczogbnVtYmVyID0gYmFja29mZkJhc2VNcyArIHJhbmRvbU1zO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBsb2dnZXIuaW5mbyhcIkZhaWxlZC4gUXVldWluZyBuZXh0IGF0dGVtcHQgaW4gXCIgKyBiYWNrb2ZmQmFzZU1zICsgXCIgKyBcIiArIHJhbmRvbU1zICsgXCIgKFwiICsgZGVsYXlNcyArIFwiKSBtc1xcblwiKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHRpbWVyUHJvbWlzZTogUHJvbWlzZTx2b2lkPiA9IGdldFRpbWVyUHJvbWlzZShkZWxheU1zLCB1bmRlZmluZWQpO1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aW1lclByb21pc2VcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJldHVybiByZXRyeVdoaWxlSW1wbCh0aGVGdW5jLCB3aGlsZVByZWRpY2F0ZSwgbWF4TnVtQXR0ZW1wdHMsIGF0dGVtcHRzU29GYXIpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pXG4gICAgICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuICAgICk7XG59XG5cblxuLyoqXG4gKiBBIHByb21pc2UgdmVyc2lvbiBvZiBhIHdoaWxlKCkge30gbG9vcFxuICogQHBhcmFtIHByZWRpY2F0ZSAtIEEgcHJlZGljYXRlIHRoYXQgd2lsbCBiZSBpbnZva2VkIGJlZm9yZSBlYWNoIGl0ZXJhdGlvbiBvZlxuICogYm9keS4gIEl0ZXJhdGlvbiB3aWxsIHN0b3Agd2hlbiB0aGlzIGZ1bmN0aW9uIHJldHVybnMgZmFsc2UuXG4gKiBAcGFyYW0gYm9keSAtIEEgcHJvbWlzZSByZXR1cm5pbmcgZnVuY3Rpb24gdGhhdCB3aWxsIGJlIGludm9rZWQgZm9yIGVhY2hcbiAqIGl0ZXJhdGlvbi4gIFRoaXMgZnVuY3Rpb24gaXMgcmVzcG9uc2libGUgZm9yIG1ha2luZyBwcmVkaWNhdGUgZXZlbnR1YWxseSByZXR1cm4gZmFsc2UuXG4gKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aGVuIGFsbCBpdGVyYXRpb25zIGhhdmVcbiAqIHN1Y2Nlc3NmdWxseSBjb21wbGV0ZWQgb3Igd2lsbCBiZSByZWplY3RlZCB3aGVuIGJvZHkgcmV0dXJucyBhIHJlamVjdGVkIHByb21pc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwcm9taXNlV2hpbGUocHJlZGljYXRlOiAoKSA9PiBib29sZWFuLCBib2R5OiBUYXNrPHZvaWQ+KTogUHJvbWlzZTx2b2lkPiB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTx2b2lkPigocmVzb2x2ZTogKCkgPT4gdm9pZCwgcmVqZWN0OiAoKSA9PiB2b2lkKSA9PiB7XG5cbiAgICAgICAgZnVuY3Rpb24gbG9vcCgpOiB2b2lkIHtcbiAgICAgICAgICAgIGlmICghcHJlZGljYXRlKCkpIHtcbiAgICAgICAgICAgICAgICAvLyBXZSBhcmUgZG9uZSBpdGVyYXRpbmcuICBSZXNvbHZlIHdpdGggYSB2b2lkIHZhbHVlLlxuICAgICAgICAgICAgICAgIHJldHVybiByZXNvbHZlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIC8vIFdlIGFyZSBub3QgZG9uZSBpdGVyYXRpbmcuICBJbnZva2UgYm9keSgpIGFuZCBleGVjdXRlIHRoaXMgbG9vcFxuICAgICAgICAgICAgLy8gYWdhaW4gd2hlbiBpdCByZXNvbHZlcy4gIE5vdGU6IFRoZSB2YWx1ZSByZXR1cm5lZCBmcm9tIGJvZHkoKSBpc1xuICAgICAgICAgICAgLy8gd3JhcHBlZCBpbiBhIHByb21pc2UgaW4gY2FzZSBpdCBkb2Vzbid0IHJldHVybiBhIHByb21pc2UuXG4gICAgICAgICAgICBCQlByb21pc2UucmVzb2x2ZShib2R5KCkpXG4gICAgICAgICAgICAudGhlbihsb29wLCByZWplY3QpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gR2V0IHRoaW5ncyBzdGFydGVkLiAgbG9vcCgpIHdpbGwgcXVldWUgaXRzZWxmIHRvIHJ1biBmb3IgZnVydGhlclxuICAgICAgICAvLyBpdGVyYXRpb25zLlxuICAgICAgICBzZXRUaW1lb3V0KGxvb3AsIDApO1xuICAgIH0pO1xufVxuXG5cbi8qKlxuICogTWFwcyBhbiBhcnJheSBvZiBQcm9taXNlcyB0byBhIG5ldyBzYW1lIHNpemVkIGFycmF5IG9mIFByb21pc2VzLiAgVGhlIG5ld1xuICogYXJyYXkgb2YgUHJvbWlzZXMgd2lsbCBzZXR0bGUgc3RhcnRpbmcgYXQgaW5kZXggMCBhbmQgY29udGludWUgdGhyb3VnaCB0aGVcbiAqIGFycmF5IHNlcXVlbnRpYWxseS5cbiAqIEBwYXJhbSBpbnB1dFByb21pc2VzIC0gVGhlIGFycmF5IG9mIFByb21pc2VzIHRvIHRyYW5zZm9ybVxuICogQHJldHVybnMgQSBuZXcgYXJyYXkgb2YgUHJvbWlzZXMgdGhhdCB3aWxsIHNldHRsZSBzZXF1ZW50aWFsbHksXG4gKiBzdGFydGluZyBhdCBpbmRleCAwLlxuICovXG5leHBvcnQgZnVuY3Rpb24gc2VxdWVudGlhbFNldHRsZShpbnB1dFByb21pc2VzOiBBcnJheTxQcm9taXNlPGFueT4+KTogQXJyYXk8UHJvbWlzZTxhbnk+PiB7XG4gICAgXCJ1c2Ugc3RyaWN0XCI7XG5cbiAgICBjb25zdCBvdXRwdXRQcm9taXNlczogQXJyYXk8UHJvbWlzZTxhbnk+PiA9IFtdO1xuXG4gICAgXy5mb3JFYWNoKGlucHV0UHJvbWlzZXMsIChjdXJJbnB1dFByb21pc2UpID0+IHtcbiAgICAgICAgY29uc3QgcHJldmlvdXNQcm9taXNlOiBQcm9taXNlPGFueT4gPSBvdXRwdXRQcm9taXNlcy5sZW5ndGggPiAwID9cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvdXRwdXRQcm9taXNlc1tvdXRwdXRQcm9taXNlcy5sZW5ndGggLSAxXSA6XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgQkJQcm9taXNlLnJlc29sdmUoKTtcblxuICAgICAgICBjb25zdCBwcm9taXNlOiBQcm9taXNlPGFueT4gPSBkZWxheVNldHRsZShjdXJJbnB1dFByb21pc2UsIHByZXZpb3VzUHJvbWlzZSk7XG4gICAgICAgIG91dHB1dFByb21pc2VzLnB1c2gocHJvbWlzZSk7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gb3V0cHV0UHJvbWlzZXM7XG59XG5cblxuLyoqXG4gKiBSZXR1cm5zIGEgcHJvbWlzZSB0aGF0IHdyYXBzIHRoZVByb21pc2UsIGJ1dCB3aWxsIGJlIHJlc29sdmVkIG9yIHJlamVjdGVkXG4gKiBhZnRlciB0aGUgcmVzb2x1dGlvbiBvciByZWplY3Rpb24gb2Ygd2FpdEZvci5cbiAqIEBwYXJhbSB0aGVQcm9taXNlIC0gdGhlIFByb21pc2UgdG8gYmUgd3JhcHBlZC9kZWxheWVkXG4gKiBAcGFyYW0gd2FpdEZvciAtIFRoZSBQcm9taXNlIHRoYXQgbXVzdCBiZSBzZXR0bGVkIGJlZm9yZSB0aGUgcmV0dXJuZWQgcHJvbWlzZVxuICogd2lsbCBzZXR0bGUuXG4gKiBAcmV0dXJucyBBIFByb21pc2Ugd3JhcHBpbmcgdGhlUHJvbWlzZSwgYnV0IHdpbGwgYmUgc2V0dGxlZCBhZnRlciB3YWl0Rm9yIGlzXG4gKiBzZXR0bGVkXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZWxheVNldHRsZTxSZXNvbHZlVHlwZT4odGhlUHJvbWlzZTogUHJvbWlzZTxSZXNvbHZlVHlwZT4sIHdhaXRGb3I6IFByb21pc2U8YW55Pik6IFByb21pc2U8UmVzb2x2ZVR5cGU+IHtcbiAgICBcInVzZSBzdHJpY3RcIjtcblxuICAgIHJldHVybiB0aGVQcm9taXNlXG4gICAgLnRoZW4oKHJlc3VsdDogUmVzb2x2ZVR5cGUpID0+IHtcbiAgICAgICAgLy8gV2hldGhlciB3YWl0Rm9yIHJlc29sdmVkIG9yIHJlamVjdGVkLCB3ZSBzaG91bGQgcmVzb2x2ZVxuICAgICAgICAvLyB3aXRoIHRoZSBvcmlnaW5hbCByZXNvbHZlZCB2YWx1ZS5cbiAgICAgICAgcmV0dXJuIHdhaXRGb3JcbiAgICAgICAgLnRoZW4oKCkgPT4gcmVzdWx0IClcbiAgICAgICAgLmNhdGNoKCgpID0+IHJlc3VsdCApO1xuICAgIH0pXG4gICAgLmNhdGNoKChlcnI6IGFueSkgPT4ge1xuICAgICAgICAvLyBXaGV0aGVyIHdhaXRGb3IgcmVzb2x2ZWQgb3IgcmVqZWN0ZWQsIHdlIHNob3VsZCByZWplY3Qgd2l0aCB0aGVcbiAgICAgICAgLy8gb3JpZ2luYWwgZXJyb3IuXG4gICAgICAgIHJldHVybiB3YWl0Rm9yXG4gICAgICAgIC50aGVuKCgpID0+IHsgdGhyb3cgZXJyOyB9KVxuICAgICAgICAuY2F0Y2goKCkgPT4geyB0aHJvdyBlcnI7IH0pO1xuICAgIH0pO1xufVxuIl19
