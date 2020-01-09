/// <reference types="node" />
import { Writable } from "stream";
import { EventEmitter } from "events";
import * as BBPromise from "bluebird";
export declare type CallBackType<ResultType> = (err: any, result?: ResultType) => void;
/**
 * Adapts a Node-style async function with any number of arguments and a callback to a
 * function that has the same arguments (minus the callback) and returns a Promise.
 * @param func - The Node-style function that takes arguments followed by a
 * Node-style callback.
 * @return A function that takes the arguments and returns a Promise for the result.
 */
export declare function promisifyN<ResultType>(func: (...args: Array<any>) => void): (...args: Array<any>) => Promise<ResultType>;
/**
 * Adapts a Node-style async function with one parameter and a callback to a
 * function that takes one parameter and returns a Promise.  This function is
 * similar to promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes one argument and a
 * Node-style callback.
 * @return A function that takes the one argument and returns a Promise for the
 * result.
 */
export declare function promisify1<ResultType, Arg1Type>(func: (arg1: Arg1Type, cb: CallBackType<ResultType>) => void): (arg1: Arg1Type) => Promise<ResultType>;
/**
 * Adapts a Node-style async function with two parameters and a callback to a function
 * that takes two parameters and returns a Promise.  This function is similar to
 * promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes two arguments and a
 * Node-style callback.
 * @return A function that takes the two arguments and returns a Promise for the
 * result.
 */
export declare function promisify2<ResultType, Arg1Type, Arg2Type>(func: (arg1: Arg1Type, arg2: Arg2Type, cb: CallBackType<ResultType>) => void): (arg1: Arg1Type, arg2: Arg2Type) => Promise<ResultType>;
/**
 * Adapts a Node-style async function with three parameters and a callback to a function
 * that takes three parameters and returns a Promise.  This function is similar to
 * promisifyN(), except that it retains type safety.
 * @param func - The Node-style function that takes three arguments and a
 * Node-style callback.
 * @return A function that takes the three arguments and returns a Promise for the
 * result.
 */
export declare function promisify3<ResultType, Arg1Type, Arg2Type, Arg3Type>(func: (arg1: Arg1Type, arg2: Arg2Type, arg3: Arg3Type, cb: CallBackType<ResultType>) => void): (arg1: Arg1Type, arg2: Arg2Type, arg3: Arg3Type) => Promise<ResultType>;
/**
 * A task is any operation that can be started (i.e. called) which completes at
 * some point in the future.
 */
export declare type Task<ResolveType> = () => Promise<ResolveType>;
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
export declare function sequence(tasks: Array<(previousValue: any) => any>, initialValue: any): Promise<any>;
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
export declare function allSettled(promises: Array<Promise<any>>): Promise<Array<BBPromise.Inspection<any>>>;
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
export declare function getTimerPromise<ResolveType>(ms: number, resolveValue: ResolveType): Promise<ResolveType>;
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
export declare function conditionalTask<ResolveType>(condition: any, task: Task<ResolveType>, falseResolveValue: ResolveType): Promise<ResolveType>;
/**
 * Adapts an EventEmitter to a Promise interface
 * @param emitter - The event emitter to listen to
 * @param resolveEventName - The event that will cause the Promise to resolve
 * @param rejectEventName - The event that will cause the Promise to reject
 * @return A Promise that will will resolve and reject as specified
 */
export declare function eventToPromise<ResolveType>(emitter: EventEmitter, resolveEventName: string, rejectEventName?: string): Promise<ResolveType>;
/**
 * Adapts a stream to a Promise interface.
 * @param stream - The stream to be adapted
 * @return A Promise that will be resolved when the stream emits the "finish"
 * event and rejects when it emits an "error" event.
 */
export declare function streamToPromise(stream: Writable): Promise<void>;
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
export declare function retry<ResolveType>(theFunc: () => Promise<ResolveType>, maxNumAttempts: number): Promise<ResolveType>;
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
export declare function retryWhile<ResolveType>(theFunc: () => Promise<ResolveType>, whilePredicate: (err: any) => boolean, maxNumAttempts: number): Promise<ResolveType>;
/**
 * A promise version of a while() {} loop
 * @param predicate - A predicate that will be invoked before each iteration of
 * body.  Iteration will stop when this function returns false.
 * @param body - A promise returning function that will be invoked for each
 * iteration.  This function is responsible for making predicate eventually return false.
 * @returns A Promise that is resolved when all iterations have
 * successfully completed or will be rejected when body returns a rejected promise.
 */
export declare function promiseWhile(predicate: () => boolean, body: Task<void>): Promise<void>;
/**
 * Maps an array of Promises to a new same sized array of Promises.  The new
 * array of Promises will settle starting at index 0 and continue through the
 * array sequentially.
 * @param inputPromises - The array of Promises to transform
 * @returns A new array of Promises that will settle sequentially,
 * starting at index 0.
 */
export declare function sequentialSettle(inputPromises: Array<Promise<any>>): Array<Promise<any>>;
/**
 * Returns a promise that wraps thePromise, but will be resolved or rejected
 * after the resolution or rejection of waitFor.
 * @param thePromise - the Promise to be wrapped/delayed
 * @param waitFor - The Promise that must be settled before the returned promise
 * will settle.
 * @returns A Promise wrapping thePromise, but will be settled after waitFor is
 * settled
 */
export declare function delaySettle<ResolveType>(thePromise: Promise<ResolveType>, waitFor: Promise<any>): Promise<ResolveType>;
