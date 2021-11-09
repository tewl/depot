import * as path from "path";
import * as _ from "lodash";
import * as yargs from "yargs";
import * as inquirer from "inquirer";

/*******************************************************************************
 *  Question design considerations:
 *
 * - Interactively prompting the user for an argument may require multiple
 *   questions.  When this happens, make sure all questions have the same `name`
 *   property.  If they are different, the usage information will not be
 *   correct.
 *
 * - All scripts should be able to be run non-interactively from the command
 *   line with all arguments provided.  This is a matter of convenience for
 *   humans and required by CI environments.  In order to preserve the ability
 *   to specify answers on the command line, the answer to each question must be
 *   a single string and not more complicated data structures (e.g. objects or
 *   arrays).  For example, consider a situation where the user must specify a
 *   database or choose all databases.  If the questions returns an array of
 *   database names, there is no way for the user to specify all databases on
 *   the command line.  Instead, the question's answer should be the database
 *   name or the special string "_all".  This way, the user can specify the
 *   special string "_all" on the command line.
 *
 ******************************************************************************/

const argv = yargs.help(false).argv;


class ArgInquirer
{
    // region Data Members
    private readonly _questions: Array<inquirer.Question>;
    // endregion


    public constructor(questions: _.ListOfRecursiveArraysOrValues<inquirer.Question>)
    {
        this._questions = _.flattenDeep<inquirer.Question>(questions);
    }


    public getArgNames(): Array<string>
    {
        const argNames = _.map<inquirer.Question, string>(this._questions, (curQuestion) => curQuestion.name!);
        return _.uniq<string>(argNames);
    }


    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getArgs(): Promise<{[key: string]: any} | undefined>
    {
        const argNames = this.getArgNames();

        if (argv.help)
        {
            this.printUsage();
            return Promise.resolve(undefined);
        }
        else if (argv._.length === argNames.length)
        {
            // TODO: Run the values through each question's validate() method.

            // The user has passed in the correct number or arguments.
            const argValues: {[key: string]: string} = {};
            _.forEach(argv._, (curArg, index) =>
            {
                argValues[argNames[index]] = curArg;
            });
            // Copy any other command line arguments onto the returned object.
            _.assign(argValues, argv);
            return Promise.resolve(argValues);

        }
        else
        {
            // The user has not provided the correct number of arguments.
            // Interactively prompt them for answers using the inquirer package.
            return inquirer.prompt(this._questions)
            .then((argValues) =>
            {
                // If the user has specified --cli, we should print out a
                // command line that shows how to invoke with the current set of
                // arguments.
                if (argv.cli)
                {
                    // Get the executable name.
                    let execName = process.argv[1];
                    execName = execName.split(path.sep).slice(-1)[0];

                    // Get the argument values in the correct order.
                    const orderedArgs = _.map(this.getArgNames(), (curArgName) => argValues[curArgName]);

                    // Print the equivalent command line
                    console.log("Equivalent command line:");
                    console.log(`node ${execName}`, orderedArgs.join(" "));
                }
                // Copy any other command line arguments onto the returned object.
                _.assign(argValues, argv);
                return argValues;
            });
        }
    }

    public printUsage(): void
    {
        // Typically argv[1] is the full path to the main module.  We only want
        // to show the last part of this path, so split it by the OS's directory
        // separator then take the last part.
        let execName = process.argv[1];
        execName = execName.split(path.sep).slice(-1)[0];

        // Create a string for each argument in the form <name>.
        const argStrings = _.map(this.getArgNames(), (curArgName) =>
        {
            return `<${curArgName}>`;
        });

        console.log("Usage:");
        console.log(`node ${execName} ${argStrings.join(" ")}`);
    }
}


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
export function getArgs(
    argQuestions: _.ListOfRecursiveArraysOrValues<inquirer.Question>
): Promise<{ [key: string]: any; } | undefined>  // eslint-disable-line @typescript-eslint/no-explicit-any
{
    const argInquirer = new ArgInquirer(argQuestions);
    return argInquirer.getArgs();
}
