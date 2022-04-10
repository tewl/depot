import Jasmine = require("jasmine");

/**
 * Helper function that runs Jasmine and returns a promise that indicates the
 * results of the tests.
 * @param jasmineInstance - The jasmine instance to execute.
 * @return A promise that resolves when all tests pass and rejects when one or
 * more fail.  In either case, the promise does not settle until all tests have
 * completed.
 */
export function runJasmine(jasmineInstance: Jasmine): Promise<void> {
    return new Promise((resolve, reject) => {
        // Jasmine's execute() method does not provide the usual promise or
        // accept a callback.  Therefore, we have to rely on registering a
        // callback with onComplete().
        jasmineInstance.onComplete((allTestsPassed) => {
            if (allTestsPassed) {
                resolve();
            }
            else {
                reject(new Error("One or more tests failed."));
            }
        });

        jasmineInstance.execute();
    });
}
