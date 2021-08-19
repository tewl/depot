import {Logger, LogLevel} from "./logger";


describe("logger", () => {

    let logger: Logger;

    beforeEach(() => {
        logger = new Logger();
    });


    it("has a default logging level of 'warning'", () => {
        expect(logger.getCurrentLevel()).toEqual(LogLevel.WARN_2);
    });


    it("when logging is disabled, nothing will be logged", () => {
        logger.pushLogLevel(LogLevel.OFF_0);
        expect(logger.error("test")).toBeFalsy();
    });


    it("logging a message with lower severity returns false.", () => {
        expect(logger.verbose("test")).toBeFalsy();
    });


    it("Logging a message with higher priority returns true.", () => {
        expect(logger.error("")).toBeTruthy();
    });


    it("Logging a message with the same priority returns true.", () => {
        expect(logger.warn("")).toBeTruthy();
    });


    describe("addListener()", () => {


        it("will add the new listener", () => {
            const initialListenerCount = logger.numListeners();
            logger.addListener(() => {});
            expect(logger.numListeners()).toEqual(initialListenerCount + 1);
        });


        it("will add the new listener and it will be used", () => {
            let invocationCounter = 0;
            let loggedMessage = "";
            const myListener = (msg: string) => {
                invocationCounter++;
                loggedMessage = msg;
            };
            logger.addListener(myListener);
            const wasLogged = logger.error("test message");
            expect(wasLogged).toBeTruthy();
            expect(invocationCounter).toEqual(1);
            expect(loggedMessage).toMatch(/test message/);
        });


        it("will return a function that can be called to remove the listener", () => {
            let invocationCounter = 0;
            let lastMessageLogged = "";
            const myListener = (msg: string) => {
                invocationCounter++;
                lastMessageLogged = msg;
            };
            const initialListenerCount = logger.numListeners();

            const stopListening = logger.addListener(myListener);
            expect(logger.numListeners()).toEqual(initialListenerCount + 1);
            logger.error("message 1");
            expect(invocationCounter).toEqual(1);
            expect(lastMessageLogged).toMatch(/message 1/);
            stopListening();

            // myListener will not be invoked any more.
            expect(logger.numListeners()).toEqual(initialListenerCount);
            logger.error("message 2");
            expect(lastMessageLogged).toMatch(/message 1/);
            expect(invocationCounter).toEqual(1);
        });


    });


    describe("reset()", () => {


        it("sets the current level to WARN_2", () => {
            logger.pushLogLevel(LogLevel.VERBOSE_4);
            logger.reset();
            expect(logger.getCurrentLevel()).toEqual(LogLevel.WARN_2);
        });


    });


    describe("pop()", () => {


        it("restores the previous logging level.", () => {
            logger.pushLogLevel(LogLevel.VERBOSE_4);
            logger.pushLogLevel(LogLevel.INFO_3);
            logger.pop();
            expect(logger.getCurrentLevel()).toEqual(LogLevel.VERBOSE_4);
        });


    });


    describe("logging methods", () => {


        it("log additional parameters", () => {
            let logMsg = "";
            logger.pushLogLevel(LogLevel.SILLY_6);
            logger.addListener((msg: string): void => {
                logMsg = msg;
            });

            let wasLogged = logger.error("Message goes here.", {foo: "bar", baz: "quux"}, [1, 2, 3], /foo/);
            expect(wasLogged).toEqual(true);
            expect(logMsg).toMatch(/.*\(ERROR\) Message goes here. { foo: 'bar', baz: 'quux' } \[ 1, 2, 3 ] \/foo\//);

            wasLogged = logger.warn("Message goes here.", {foo: "bar", baz: "quux"}, [1, 2, 3], /foo/);
            expect(wasLogged).toEqual(true);
            expect(logMsg).toMatch(/.*\(WARN\) Message goes here. { foo: 'bar', baz: 'quux' } \[ 1, 2, 3 ] \/foo\//);

            wasLogged = logger.info("Message goes here.", {foo: "bar", baz: "quux"}, [1, 2, 3], /foo/);
            expect(wasLogged).toEqual(true);
            expect(logMsg).toMatch(/.*\(INFO\) Message goes here. { foo: 'bar', baz: 'quux' } \[ 1, 2, 3 ] \/foo\//);

            wasLogged = logger.verbose("Message goes here.", {foo: "bar", baz: "quux"}, [1, 2, 3], /foo/);
            expect(wasLogged).toEqual(true);
            expect(logMsg).toMatch(/.*\(VERBOSE\) Message goes here. { foo: 'bar', baz: 'quux' } \[ 1, 2, 3 ] \/foo\//);

            wasLogged = logger.debug("Message goes here.", {foo: "bar", baz: "quux"}, [1, 2, 3], /foo/);
            expect(wasLogged).toEqual(true);
            expect(logMsg).toMatch(/.*\(DEBUG\) Message goes here. { foo: 'bar', baz: 'quux' } \[ 1, 2, 3 ] \/foo\//);

            wasLogged = logger.silly("Message goes here.", {foo: "bar", baz: "quux"}, [1, 2, 3], /foo/);
            expect(wasLogged).toEqual(true);
            expect(logMsg).toMatch(/.*\(SILLY\) Message goes here. { foo: 'bar', baz: 'quux' } \[ 1, 2, 3 ] \/foo\//);
        });


    });


});





