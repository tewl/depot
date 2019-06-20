import * as inquirer from "inquirer";


/**
 * Prompts the user to confirm whether they want to continue.
 * @param message - The message to display
 * @param defaultToConfirm - true to make confirmation the default response.
 * false to make canceling the default.
 * @param resolveValue - If the user chooses to continue, the returned promise
 * will be resolved with this value.  This makes promise chains easier to
 * create.
 * @return A promise that is resolved with resolveValue when the user chooses to
 * continue and rejects when they decline
 */
export function promptToContinue<T>(
    message: string,
    defaultToConfirm: boolean,
    resolveValue: T
): Promise<T> {
    const questionConfirmation: inquirer.Question = {
        type: "confirm",
        name: "confirm",
        default: defaultToConfirm,
        message: message || "Continue?"
    };

    return inquirer.prompt<{confirm: boolean}>([questionConfirmation])
    .then((answers) => {
        if (!answers.confirm) {
            throw "Operation cancelled by user.";  // tslint:disable-line:no-string-throw
        }
        else {
            return resolveValue;
        }
    });
}
