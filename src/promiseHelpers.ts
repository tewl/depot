import {Writable} from "stream";
import {EventEmitter} from "events";
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
 * Runs a sequence of functions in order with each returned value feeding into
 * the parameter of the next.
 * @param tasks - The functions to execute in sequence.  Each function will
 * receive 1 parameter, the return value of the previous function.  A function
 * should throw an exception if it wishes to terminate the sequence and reject
 * the returned promise.
 * @param initialValue - The value that will be passed into the first function.
 * @returns {Promise<any>} A promise that will be resolved with the return value
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
