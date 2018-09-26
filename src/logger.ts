/**
 * Levels controlling what log messages are written to stdout.
 */
export enum LogLevel {
    OFF_0     = 0,
    ERROR_1   = 1,
    WARN_2    = 2,
    INFO_3    = 3,
    VERBOSE_4 = 4,
    DEBUG_5   = 5,
    SILLY_6   = 6
}
Object.freeze(LogLevel);


/**
 * Labels used to identify the severity of each log message
 * @type {string[]}
 */
const levelLabels: Array<string> = [
    "OFF",
    "ERROR",
    "WARN",
    "INFO",
    "VERBOSE",
    "DEBUG",
    "SILLY"
];
Object.freeze(levelLabels);


export class Logger {

    // region Private Data Members
    private _logLevelStack: Array<LogLevel> = [];
    private _defaultLogLevel: LogLevel = LogLevel.WARN_2;
    // endregion


    public constructor() {
        Object.seal(this);
    }

    /**
     * Resets this logger to its default state.
     */
    public reset(): void {

        if (this._logLevelStack === undefined) {
            this._logLevelStack = [];
        } else {
            this._logLevelStack.length = 0;
        }
    }


    /**
     * Sets this loggers enabled state to newLogLevel.  To put the logger back to
     * its previous state, call pop().
     * @param newLogLevel - The new state of this logger
     */
    public pushLogLevel(newLogLevel: LogLevel): void {
        this._logLevelStack.push(newLogLevel);
    }


    /**
     * Restores this logger's state to the previous state.
     */
    public pop(): void {
        if (this._logLevelStack.length > 0) {
            this._logLevelStack.pop();
        }
    }


    /**
     * Gets the current severity level for this logger.  All messages with a
     * higher or equal severity will be logged.
     * @returns {LogLevel} The current severity level
     */
    public getCurrentLevel(): LogLevel {
        if (this._logLevelStack.length > 0) {
            return this._logLevelStack[this._logLevelStack.length - 1];
        } else {
            return this._defaultLogLevel;
        }

    }

    /**
     * Logs a message with severity level ERROR_0.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    public error(msg: string): boolean { return this.log(LogLevel.ERROR_1, msg); }

    /**
     * Logs a message with severity level WARN_1.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    public warn(msg: string): boolean { return this.log(LogLevel.WARN_2, msg); }

    /**
     * Logs a message with severity level INFO_2.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    public info(msg: string): boolean { return this.log(LogLevel.INFO_3, msg); }

    /**
     * Logs a message with severity level VERBOSE_3.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    public verbose(msg: string): boolean { return this.log(LogLevel.VERBOSE_4, msg); }

    /**
     * Logs a message with severity level DEBUG_4.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    public debug(msg: string): boolean { return this.log(LogLevel.DEBUG_5, msg); }

    /**
     * Logs a message with severity level SILLY_5.
     * @param msg - The message to be logged
     * @returns {boolean} Whether the message was logged given current logger settings.
     */
    public silly(msg: string): boolean { return this.log(LogLevel.SILLY_6, msg); }


    // region Private Methods

    /**
     * Helper method that implements logging logic
     * @param {LogLevel} level - The severity level of the logged message
     * @param {string} msg - The message to log
     * @returns {boolean} Whether the message was logged.
     */
    private log(level: LogLevel, msg: string): boolean {

        const curLogLevel: LogLevel = this.getCurrentLevel();

        if (level > curLogLevel) {
            return false;
        }

        if (msg.length > 0) {
            console.log(getTimestamp() + " (" + levelLabels[level] + ") " + msg);
        }

        return true;
    }

    // endregion

}
Object.freeze(Logger.prototype);


/**
 * The one-and-only exported instance (singleton).
 * @type {Logger}
 */
export const logger: Logger = new Logger();


////////////////////////////////////////////////////////////////////////////////
// Helper methods
////////////////////////////////////////////////////////////////////////////////

function getTimestamp(): string {
    "use strict";
    return new Date().toISOString();
}


Object.freeze(exports);
