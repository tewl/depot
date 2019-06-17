import {inspect} from "util";
import * as _ from "lodash";


export type LogListenerFunc    = (logMessage: string) => void;
export type RemoveListenerFunc = () => void;


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


export class Logger
{
    // region Private Data Members
    private readonly _logLevelStack: Array<LogLevel>    = [];
    private readonly _defaultLogLevel: LogLevel         = LogLevel.WARN_2;
    private readonly _listeners: Array<LogListenerFunc> = [];
    // endregion


    public constructor()
    {
    }


    public addListener(listener: LogListenerFunc): RemoveListenerFunc
    {
        this._listeners.push(listener);

        return () => {
            _.pull(this._listeners, listener);
        };
    }


    public numListeners(): number
    {
        return this._listeners.length;
    }


    /**
     * Resets the logging level to its default state.
     */
    public reset(): void
    {
        this._logLevelStack.length = 0;
    }


    /**
     * Sets this loggers enabled state to newLogLevel.  To put the logger back to
     * its previous state, call pop().
     * @param newLogLevel - The new state of this logger
     */
    public pushLogLevel(newLogLevel: LogLevel): void
    {
        this._logLevelStack.push(newLogLevel);
    }


    /**
     * Restores this logger's state to the previous state.
     */
    public pop(): void
    {
        if (this._logLevelStack.length > 0) {
            this._logLevelStack.pop();
        }
    }


    /**
     * Gets the current severity level for this logger.  All messages with a
     * higher or equal severity will be logged.
     * @returns The current severity level
     */
    public getCurrentLevel(): LogLevel
    {
        if (this._logLevelStack.length > 0) {
            return this._logLevelStack[this._logLevelStack.length - 1];
        } else {
            return this._defaultLogLevel;
        }

    }


    /**
     * Logs a message with severity level ERROR_1.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    public error(msg: string, ...optionalParams: Array<any>): boolean
    {
        return this.log(LogLevel.ERROR_1, msg, ...optionalParams);
    }


    /**
     * Logs a message with severity level WARN_2.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    public warn(msg: string, ...optionalParams: Array<any>): boolean
    {
        return this.log(LogLevel.WARN_2, msg, ...optionalParams);
    }


    /**
     * Logs a message with severity level INFO_3.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    public info(msg: string, ...optionalParams: Array<any>): boolean
    {
        return this.log(LogLevel.INFO_3, msg, ...optionalParams);
    }


    /**
     * Logs a message with severity level VERBOSE_4.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    public verbose(msg: string, ...optionalParams: Array<any>): boolean
    {
        return this.log(LogLevel.VERBOSE_4, msg, ...optionalParams);
    }


    /**
     * Logs a message with severity level DEBUG_5.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    public debug(msg: string, ...optionalParams: Array<any>): boolean
    {
        return this.log(LogLevel.DEBUG_5, msg, ...optionalParams);
    }


    /**
     * Logs a message with severity level SILLY_6.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    public silly(msg: string, ...optionalParams: Array<any>): boolean
    {
        return this.log(LogLevel.SILLY_6, msg, ...optionalParams);
    }


    // region Private Methods

    /**
     * Helper method that implements logging logic
     * @param level - The severity level of the logged message
     * @param msg - The message to log
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged.
     */
    private log(level: LogLevel, msg: string, ...optionalParams: Array<any>): boolean
    {
        const curLogLevel: LogLevel = this.getCurrentLevel();

        if (level > curLogLevel) {
            return false;
        }

        const optStr = _.map(optionalParams, (curParam) => inspect(curParam)).join(" ");
        if (optStr.length > 0) {
            msg += " " + optStr;
        }

        if (msg.length > 0) {
            const logMessage = getTimestamp() + " (" + levelLabels[level] + ") " + msg;
            _.forEach(this._listeners, (curListener) => {
                curListener(logMessage);
            });
        }

        return true;
    }

    // endregion

}
Object.freeze(Logger.prototype);


////////////////////////////////////////////////////////////////////////////////
// Helper methods
////////////////////////////////////////////////////////////////////////////////

function getTimestamp(): string
{
    return new Date().toISOString();
}


Object.freeze(exports);
