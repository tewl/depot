/// <reference types="node" />
import { EventEmitter } from "events";
/**
 * @classdesc This class was created to help track the listeners that have been
 * registered with an EventEmitter.  Most of the time this is not needed,
 * because you can simply call emitter.removeAllListeners().  In old versions of
 * Node.js (i.e. 0.10.40 and JXcore), however, there are bugs that cause Node.js
 * *internal* listeners to also be removed when removeAllListeners() is called
 * (specifically in the net module's TCP socket implementation), causing
 * the socket object to stop working properly.  To work around this problem, a
 * client must keep track of each listener and remove each one individually.
 * This class helps facilitate that bookkeeping.
 */
export declare class ListenerTracker {
    private _emitter;
    private _listenerMap;
    /**
     * Creates a new ListenerTracker that can be used to track listeners for the
     * specified EventEmitter.  Only listeners registered using the methods on
     * this instance will be tracked.
     * @param emitter - The EventEmitter to be wrapped
     */
    constructor(emitter: EventEmitter);
    /**
     * Registers a new event listener.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     * @return This ListenerTracker instance so that calls can be chained.
     */
    on(eventName: string, listenerCallback: (...args: Array<any>) => void): this;
    /**
     * Registers a new event listener that will be invoked only the first time
     * the event occurs.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     * @return This ListenerTracker instance so that calls can be chained.
     */
    once(eventName: string, listenerCallback: (...args: Array<any>) => void): this;
    /**
     * Removes all listeners that have been registered using this
     * ListenerTracker object.  Note, if the client registered listeners
     * directly with the wrapped emitter, those listeners will not be removed.
     */
    removeAll(): void;
    /**
     * Helper function that stores information to track the specified listener.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     */
    private addListener;
}
