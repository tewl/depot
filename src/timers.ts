import { EventEmitter } from "events";


export class Timeout extends EventEmitter
{
    // region Events
    public static readonly EVENT_EXPIRED: string = "expired";
    // endregion

    private readonly _periodMs: number;
    private _timeoutId: undefined | NodeJS.Timeout;


    public constructor(periodMs: number)
    {
        super();
        this._periodMs = periodMs;
        this._timeoutId = undefined;
    }


    /**
     * Returns this timer's running state.
     * @return This timer's running state
     */
    public isRunning(): boolean
    {
        return !!this._timeoutId;
    }


    /**
     * Starts (or restarts) this timeout timer.
     */
    public start(): void
    {
        // Stop the current timeout, if any.
        this.stop();

        this._timeoutId = setTimeout(() => {
            this._timeoutId = undefined;
            this.emit(Timeout.EVENT_EXPIRED);
        }, this._periodMs);
    }


    /**
     * Stops this timeout timer if it is running.  Safe to call when the timer
     * is not running.
     */
    public stop(): void
    {
        // Stop the currently running time, if any.
        if (this._timeoutId) {
            clearTimeout(this._timeoutId);
        }
        this._timeoutId = undefined;
    }
}
