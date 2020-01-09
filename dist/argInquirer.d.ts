import * as _ from "lodash";
import * as inquirer from "inquirer";
/**
 * Attempts to parse the command line parameters according to the specified
 * `argQuestions`.  The expected command line arguments are inferred by taking
 * the `name` property of each question object and removing duplicates.  If the
 * number of command line arguments matches, a dictionary of their values is
 * returned.  Otherwise, the inquirer package is used to prompt the user to
 * specify the value of each expected argument.
 * If `--help` has been specified, usage information is printed and the returned
 * promise resolves with undefined.
 * If `--cli` has been specified, the command line equivalent of the interactive
 * prompts is printed so that the user can easily repeat the command
 * non-interactively.
 * @param argQuestions - Questions that define the needed command line
 * arguments.
 * @return A Promise for a dictionary of argument names to their value.  If
 * `--help` was specified the Promise will be resolved with undefined.
 */
export declare function getArgs(argQuestions: _.ListOfRecursiveArraysOrValues<inquirer.Question>): Promise<{
    [key: string]: any;
} | undefined>;
