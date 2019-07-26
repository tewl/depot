import {Writable} from "stream";
import {EventEmitter} from "events";
import * as _ from "lodash";
import {ListenerTracker} from "./listenerTracker";
import * as BBPromise from "bluebird";


export type CallBackType<ResultType> = (err: any, result?: ResultType) => void;


/**
 * Adapts a Node-style async function with any number of arguments and a callback to a
 * function that has the same arguments (minus the callback) and returns a Promise.
 * @param func - The Node-style function that takes arguments followed by a
 * Node-style callback.
 * @return A function that takes the arguments and returns a Promise for the result.
 */
export function promisifyN<ResultType>(
    func: (...args: Array<any>) => void
): (...args: Array<any>) => Promise<ResultType> {

    const promisifiedFunc = function (...args: Array<any>): Promise<ResultType> {

        return new BBPromise<ResultType>((resolve: (result: ResultType) => void, reject: (err: any) => void) => {
            func.apply(undefined, args.concat((err: any, result: ResultType) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result);
                }
            }));
        });
    };
    return promisifiedFunc;
}


/**
 * Adapts a Node-style async function with one parameter and a callback to a
 * function that takes one parameter and returns a Promise.  This function is
 * similar to promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes one argument and a
 * Node-style callback.
 * @return A function that takes the one argument and returns a Promise for the
 * result.
 */
export function promisify1<ResultType, Arg1Type>(
    func: (arg1: Arg1Type, cb: CallBackType<ResultType> ) => void
): (arg1: Arg1Type) => Promise<ResultType> {

    const promisifiedFunc = function (arg1: Arg1Type): Promise<ResultType> {
        return new BBPromise<ResultType>((resolve: (result: ResultType) => void, reject: (err: any) => void) => {
            func(arg1, (err: any, result?: ResultType) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result!);
                }
            });
        });
    };
    return promisifiedFunc;

}


/**
 * Adapts a Node-style async function with two parameters and a callback to a function
 * that takes two parameters and returns a Promise.  This function is similar to
 * promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes two arguments and a
 * Node-style callback.
 * @return A function that takes the two arguments and returns a Promise for the
 * result.
 */
export function promisify2<ResultType, Arg1Type, Arg2Type>(
    func: (arg1: Arg1Type, arg2: Arg2Type, cb: CallBackType<ResultType> ) => void
): (arg1: Arg1Type, arg2: Arg2Type) => Promise<ResultType> {

    const promisifiedFunc = function (arg1: Arg1Type, arg2: Arg2Type): Promise<ResultType> {
        return new BBPromise<ResultType>((resolve: (result: ResultType) => void, reject: (err: any) => void) => {
            func(arg1, arg2, (err: any, result?: ResultType) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result!);
                }
            });
        });
    };
    return promisifiedFunc;
}


/**
 * Adapts a Node-style async function with three parameters and a callback to a function
 * that takes three parameters and returns a Promise.  This function is similar to
 * promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes three arguments and a
 * Node-style callback.
 * @return A function that takes the three arguments and returns a Promise for the
 * result.
 */
export function promisify3<ResultType, Arg1Type, Arg2Type, Arg3Type>(
    func: (arg1: Arg1Type, arg2: Arg2Type, arg3: Arg3Type, cb: CallBackType<ResultType> ) => void
): (arg1: Arg1Type, arg2: Arg2Type, arg3: Arg3Type) => Promise<ResultType> {

    const promisifiedFunc = function (arg1: Arg1Type, arg2: Arg2Type, arg3: Arg3Type): Promise<ResultType> {
        return new BBPromise<ResultType>((resolve: (result: ResultType) => void, reject: (err: any) => void) => {
            func(arg1, arg2, arg3, (err: any, result?: ResultType) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(result!);
                }
            });
        });
    };
    return promisifiedFunc;
}


/**
 * A task is any operation that can be started (i.e. called) which completes at
 * some point in the future.
 */
export type Task<ResolveType> = () => Promise<ResolveType>;


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
export function sequence(
    tasks: Array<(previousValue: any) => any>,
    initialValue: any
): Promise<any> {
    "use strict";

    return tasks.reduce(
        (accumulator, curTask) => {
            return accumulator.then(curTask);
        },
        BBPromise.resolve(initialValue));
}


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
export function allSettled(promises: Array<Promise<any>>): Promise<Array<BBPromise.Inspection<any>>>  {
    "use strict";

    const wrappedPromises: Array<BBPromise.Inspection<any>> = _.map(
        promises,
        (curPromise: Promise<any>) => BBPromise.resolve(curPromise).reflect());
    return BBPromise.all(wrappedPromises);
}


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
export function getTimerPromise<ResolveType>(
    ms:            number,
    resolveValue:  ResolveType
): Promise<ResolveType> {
    "use strict";

    return new BBPromise(
        (resolve: (resolveValue: ResolveType) => void) => {
            setTimeout(
                () => {
                    resolve(resolveValue);
                },
                ms
            );
        }
    );

}


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
export function conditionalTask<ResolveType>(
    condition: any,
    task: Task<ResolveType>,
    falseResolveValue: ResolveType
): Promise<ResolveType> {
    if (condition) {
        return task();
    }
    else {
        return BBPromise.resolve(falseResolveValue);
    }
}


/**
 * Adapts an EventEmitter to a Promise interface
 * @param emitter - The event emitter to listen to
 * @param resolveEventName - The event that will cause the Promise to resolve
 * @param rejectEventName - The event that will cause the Promise to reject
 * @return A Promise that will will resolve and reject as specified
 */
export function eventToPromise<ResolveType>(
    emitter: EventEmitter,
    resolveEventName: string,
    rejectEventName?: string
): Promise<ResolveType>
{
    return new BBPromise<ResolveType>(
        (resolve: (result: ResolveType) => void, reject: (err: any) => void) => {
            const tracker = new ListenerTracker(emitter);

            tracker.once(resolveEventName, (result: ResolveType) => {
                tracker.removeAll();
                resolve(result);
            });

            if (rejectEventName)
            {
                tracker.once(rejectEventName, (err: any) => {
                    tracker.removeAll();
                    reject(err);
                });
            }
        }
    );
}


/**
 * Adapts a stream to a Promise interface.
 * @param stream - The stream to be adapted
 * @return A Promise that will be resolved when the stream emits the "finish"
 * event and rejects when it emits an "error" event.
 */
export function streamToPromise(stream: Writable): Promise<void> {
    return eventToPromise(stream, "finish", "error");
}


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
export function retry<ResolveType>(
    theFunc:         () => Promise<ResolveType>,
    maxNumAttempts:  number
): Promise<ResolveType> {
    "use strict";
    return retryWhileImpl(theFunc, () => true, maxNumAttempts, 0);
}


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
export function retryWhile<ResolveType>(
    theFunc: () => Promise<ResolveType>,
    whilePredicate: (err: any) => boolean,
    maxNumAttempts: number
): Promise<ResolveType> {
    "use strict";
    return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, 0);
}

/**
 * The value that will be multiplied by successively higher powers of 2 when
 * calculating delay time during exponential backoff.
 */
const BACKOFF_MULTIPLIER: number = 20;


/**
 * Recursive implementation of retryWhile(), allowing for additional
 * implementation specific arguments.
 * @param theFunc - The operation to perform
 * @param whilePredicate - Predicate that determines whether to retry
 * @param maxNumAttempts - Maximum number of invocations of theFunc
 * @param attemptsSoFar - Number of theFunc invocations so far
 * @returns The Promise returned to the client
 */
function retryWhileImpl<ResolveType>(
    theFunc:         () => Promise<ResolveType>,
    whilePredicate:  (err: any) => boolean,
    maxNumAttempts:  number,
    attemptsSoFar:   number
): Promise<ResolveType> {
    "use strict";
    return new BBPromise(
        (resolve: (value: ResolveType|Promise<ResolveType>) => void, reject: (err: any) => void) => {

            ++attemptsSoFar;
            theFunc()
            .then(
                (value: ResolveType) => {
                    // The current iteration resolved.  Return the value to the client
                    // immediately.
                    resolve(value);
                },
                (err: any): void => {
                    // The promise was rejected.
                    if (attemptsSoFar >= maxNumAttempts) {
                        // logger.error("Retry operation failed after " + maxNumAttempts + " attempts.");
                        reject(err);
                    } else if (!whilePredicate(err)) {
                        // logger.error("Stopped retrying operation because while predicate returned false." + err);
                        reject(err);
                    } else {
                        const backoffBaseMs: number = Math.pow(2, attemptsSoFar - 1) * BACKOFF_MULTIPLIER;

                        // A random amount of time should be added to or
                        // subtracted from the base so that multiple retries
                        // don't get stacked on top of each other, making
                        // the congestion even worse.  This random range
                        // should be either the multiplier or 25% of the
                        // calculated base, whichever is larger.

                        const randomHalfRange: number = Math.max(BACKOFF_MULTIPLIER, 0.25 * backoffBaseMs);
                        const randomMs: number = _.random(-1 * randomHalfRange, randomHalfRange);
                        const delayMs: number = backoffBaseMs + randomMs;

                        // logger.info("Failed. Queuing next attempt in " + backoffBaseMs + " + " + randomMs + " (" + delayMs + ") ms\n");
                        const timerPromise: Promise<void> = getTimerPromise(delayMs, undefined);
                        resolve(
                            timerPromise
                            .then(() => {
                                return retryWhileImpl(theFunc, whilePredicate, maxNumAttempts, attemptsSoFar);
                            })
                        );
                    }
                }
            );
        }
    );
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
export function promiseWhile(predicate: () => boolean, body: Task<void>): Promise<void> {
    "use strict";

    return new BBPromise<void>((resolve: () => void, reject: () => void) => {

        function loop(): void {
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


/**
 * Maps an array of Promises to a new same sized array of Promises.  The new
 * array of Promises will settle starting at index 0 and continue through the
 * array sequentially.
 * @param inputPromises - The array of Promises to transform
 * @returns A new array of Promises that will settle sequentially,
 * starting at index 0.
 */
export function sequentialSettle(inputPromises: Array<Promise<any>>): Array<Promise<any>> {
    "use strict";

    const outputPromises: Array<Promise<any>> = [];

    _.forEach(inputPromises, (curInputPromise) => {
        const previousPromise: Promise<any> = outputPromises.length > 0 ?
                                              outputPromises[outputPromises.length - 1] :
                                              BBPromise.resolve();

        const promise: Promise<any> = delaySettle(curInputPromise, previousPromise);
        outputPromises.push(promise);
    });

    return outputPromises;
}


/**
 * Returns a promise that wraps thePromise, but will be resolved or rejected
 * after the resolution or rejection of waitFor.
 * @param thePromise - the Promise to be wrapped/delayed
 * @param waitFor - The Promise that must be settled before the returned promise
 * will settle.
 * @returns A Promise wrapping thePromise, but will be settled after waitFor is
 * settled
 */
export function delaySettle<ResolveType>(thePromise: Promise<ResolveType>, waitFor: Promise<any>): Promise<ResolveType> {
    "use strict";

    return thePromise
    .then((result: ResolveType) => {
        // Whether waitFor resolved or rejected, we should resolve
        // with the original resolved value.
        return waitFor
        .then(() => result )
        .catch(() => result );
    })
    .catch((err: any) => {
        // Whether waitFor resolved or rejected, we should reject with the
        // original error.
        return waitFor
        .then(() => { throw err; })
        .catch(() => { throw err; });
    });
}
