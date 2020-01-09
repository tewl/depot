export declare type LogListenerFunc = (logMessage: string) => void;
export declare type RemoveListenerFunc = () => void;
/**
 * Levels controlling what log messages are written to stdout.
 */
export declare enum LogLevel {
    OFF_0 = 0,
    ERROR_1 = 1,
    WARN_2 = 2,
    INFO_3 = 3,
    VERBOSE_4 = 4,
    DEBUG_5 = 5,
    SILLY_6 = 6
}
export declare class Logger {
    private readonly _logLevelStack;
    private readonly _defaultLogLevel;
    private readonly _listeners;
    constructor();
    addListener(listener: LogListenerFunc): RemoveListenerFunc;
    numListeners(): number;
    /**
     * Resets the logging level to its default state.
     */
    reset(): void;
    /**
     * Sets this loggers enabled state to newLogLevel.  To put the logger back to
     * its previous state, call pop().
     * @param newLogLevel - The new state of this logger
     */
    pushLogLevel(newLogLevel: LogLevel): void;
    /**
     * Restores this logger's state to the previous state.
     */
    pop(): void;
    /**
     * Gets the current severity level for this logger.  All messages with a
     * higher or equal severity will be logged.
     * @returns The current severity level
     */
    getCurrentLevel(): LogLevel;
    /**
     * Logs a message with severity level ERROR_1.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    error(msg: string, ...optionalParams: Array<any>): boolean;
    /**
     * Logs a message with severity level WARN_2.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    warn(msg: string, ...optionalParams: Array<any>): boolean;
    /**
     * Logs a message with severity level INFO_3.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    info(msg: string, ...optionalParams: Array<any>): boolean;
    /**
     * Logs a message with severity level VERBOSE_4.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    verbose(msg: string, ...optionalParams: Array<any>): boolean;
    /**
     * Logs a message with severity level DEBUG_5.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    debug(msg: string, ...optionalParams: Array<any>): boolean;
    /**
     * Logs a message with severity level SILLY_6.
     * @param msg - The message to be logged
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged given current logger settings.
     */
    silly(msg: string, ...optionalParams: Array<any>): boolean;
    /**
     * Helper method that implements logging logic
     * @param level - The severity level of the logged message
     * @param msg - The message to log
     * @param optionalParams - Additional values to be logged
     * @returns Whether the message was logged.
     */
    private log;
}
