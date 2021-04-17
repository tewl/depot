import * as _ from "lodash";
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


/**
 * Prompts the user to enter a string.
 * @param message - The prompt message to display
 * @param defaultValue - The default input value
 * @return A promise that resolves with the string the user entered.
 */
export function promtpForString(
    message: string,
    defaultValue?: string
): Promise<string>
{
    const question: inquirer.Question = {
        type: "input",
        name: "inputValue",
        message: message,
        default: defaultValue
    };

    return inquirer.prompt<{inputValue: string}>([question])
    .then((answers) =>
    {
        return answers.inputValue;
    });
}


/**
 * Interface defining the properties of a choice of type string.
 */
export interface IChoiceString {
    name: string;
    value: string;
}


/**
 * Prompts the user to choose one of the provided choices or to enter their own
 * "other" string value.
 * @param message - The prompt to display
 * @param choices - The provided choices to present along with "other"
 * @return A promise that resolves with the string entered by the user.
 */
export async function promptForStringWithChoices(
    message: string,
    choices: Array<IChoiceString>
): Promise<string>
{
    const otherValue = "otherValueXyzzy";
    const actualChoices =
        _.chain(choices)
        .map((curChoice) => ({name: curChoice.name, value: curChoice.value, short: curChoice.name}))
        .concat({name: "other", value: otherValue, short: "other"})
        .value();

    const question: inquirer.Question = {
        type: "list",
        name: "inputValue",
        message: message,
        choices: actualChoices
    };

    const answers = await inquirer.prompt<{inputValue: string}>([question]);
    return answers.inputValue === otherValue ?
        promtpForString(message) :
        answers.inputValue;

}


/**
 * Prompts the user to enter a string via their default editor.
 * @param message - The prompt message to display
 * @param defaultValue - The default input value
 * @return A promise that resolves with the string the user entered.
 */
export function promtpForStringInEditor(
    message: string,
    defaultValue?: string
): Promise<string>
{
    const question: inquirer.Question = {
        type: "editor",
        name: "editorInput",
        message: message,
        default: defaultValue
    };

    return inquirer.prompt<{editorInput: string}>([question])
    .then((answers) => {
        return answers.editorInput;
    });
}
