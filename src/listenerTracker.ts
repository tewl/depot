import {EventEmitter} from "events";


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
export class ListenerTracker {

    private _emitter: EventEmitter;
    private _listenerMap: {[eventName: string]: Array<(...args: Array<any>) => void>};

    /**
     * Creates a new ListenerTracker that can be used to track listeners for the
     * specified EventEmitter.  Only listeners registered using the methods on
     * this instance will be tracked.
     * @param emitter - The EventEmitter to be wrapped
     */
    public constructor(emitter: EventEmitter) {
        this._emitter = emitter;
        this._listenerMap = {};
    }

    /**
     * Registers a new event listener.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     * @return This ListenerTracker instance so that calls can be chained.
     */
    public on(eventName: string, listenerCallback: (...args: Array<any>) => void): this {
        this._emitter.on(eventName, listenerCallback);
        this.addListener(eventName, listenerCallback);
        return this;
    }

    /**
     * Registers a new event listener that will be invoked only the first time
     * the event occurs.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     * @return This ListenerTracker instance so that calls can be chained.
     */
    public once(eventName: string, listenerCallback: (...args: Array<any>) => void): this {
        this._emitter.once(eventName, listenerCallback);
        this.addListener(eventName, listenerCallback);
        return this;
    }

    /**
     * Removes all listeners that have been registered using this
     * ListenerTracker object.  Note, if the client registered listeners
     * directly with the wrapped emitter, those listeners will not be removed.
     */
    public removeAll(): void {
        Object.keys(this._listenerMap).forEach((eventName) => {

            const listeners = this._listenerMap[eventName];
            listeners.forEach((curListener) => {
                this._emitter.removeListener(eventName, curListener);
            });

        });

        this._listenerMap = {};
    }

    /**
     * Helper function that stores information to track the specified listener.
     * @param eventName - The name of the event being subscribed to
     * @param listenerCallback - The callback function/listener
     */
    private addListener(eventName: string, listenerCallback: (...args: Array<any>) => void): void {
        if (!this._listenerMap[eventName]) {
            this._listenerMap[eventName] = [];
        }
        this._listenerMap[eventName].push(listenerCallback);
    }

}
