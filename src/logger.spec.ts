import {logger, LogLevel} from "./logger";


it("When logging is disabled, nothing should be logged.", () => {
    logger.pushLogLevel(LogLevel.OFF_0);
    expect(logger.error("test")).toBeFalsy();
    logger.reset();
});


it("The default logging level should be warning.", () => {
    expect(logger.getCurrentLevel()).toEqual(LogLevel.WARN_2);
    logger.reset();
});


it("reset() should set the current level to WARN_2", () => {
    logger.pushLogLevel(LogLevel.VERBOSE_4);
    logger.reset();

    expect(logger.getCurrentLevel()).toEqual(LogLevel.WARN_2);
    logger.reset();
});


it("pop() should restore the previous logging level.", () => {
    logger.pushLogLevel(LogLevel.VERBOSE_4);
    logger.pushLogLevel(LogLevel.INFO_3);
    logger.pop();
    expect(logger.getCurrentLevel()).toEqual(LogLevel.VERBOSE_4);
    logger.reset();
});


it("Logging a message with lower priority should return false.", () => {
    expect(logger.verbose("test")).toBeFalsy();
    logger.reset();
});


it("Logging a message with higher priority should return true.", () => {
    expect(logger.error("")).toBeTruthy();
    logger.reset();
});


it("Logging a message with the same priority should return true.", () => {
    expect(logger.warn("")).toBeTruthy();
    logger.reset();
});
