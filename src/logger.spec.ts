import {logger, LogLevel} from "./logger";


describe("logger", () => {


    beforeEach(() => {
        logger.reset();
    });


    afterEach(() => {
        logger.reset();
    });


    it("has a default logging level of 'warning'", () => {
        expect(logger.getCurrentLevel()).toEqual(LogLevel.WARN_2);
    });


    it("when logging is disabled, nothing will be logged", () => {
        logger.pushLogLevel(LogLevel.OFF_0);
        expect(logger.error("test")).toBeFalsy();
    });


    it("logging a message with lower severity should return false.", () => {
        expect(logger.verbose("test")).toBeFalsy();
    });


    it("Logging a message with higher priority should return true.", () => {
        expect(logger.error("")).toBeTruthy();
    });


    it("Logging a message with the same priority should return true.", () => {
        expect(logger.warn("")).toBeTruthy();
    });


    describe("reset()", () => {


        it("should set the current level to WARN_2", () => {
            logger.pushLogLevel(LogLevel.VERBOSE_4);
            logger.reset();
            expect(logger.getCurrentLevel()).toEqual(LogLevel.WARN_2);
        });


    });


    describe("pop()", () => {


        it("will restore the previous logging level.", () => {
            logger.pushLogLevel(LogLevel.VERBOSE_4);
            logger.pushLogLevel(LogLevel.INFO_3);
            logger.pop();
            expect(logger.getCurrentLevel()).toEqual(LogLevel.VERBOSE_4);
        });


    });


});





