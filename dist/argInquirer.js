"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var _ = require("lodash");
var BBPromise = require("bluebird");
var yargs = require("yargs");
var inquirer = require("inquirer");
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
var argv = yargs.help(false).argv;
var ArgInquirer = /** @class */ (function () {
    // endregion
    function ArgInquirer(questions) {
        this._questions = _.flattenDeep(questions);
    }
    ArgInquirer.prototype.getArgNames = function () {
        var argNames = _.map(this._questions, function (curQuestion) { return curQuestion.name; });
        return _.uniq(argNames);
    };
    ArgInquirer.prototype.getArgs = function () {
        var _this = this;
        var argNames = this.getArgNames();
        if (argv.help) {
            this.printUsage();
            return BBPromise.resolve(undefined);
        }
        else if (argv._.length === argNames.length) {
            // TODO: Run the values through each question's validate() method.
            // The user has passed in the correct number or arguments.
            var argValues_1 = {};
            _.forEach(argv._, function (curArg, index) {
                argValues_1[argNames[index]] = curArg;
            });
            // Copy any other command line arguments onto the returned object.
            _.assign(argValues_1, argv);
            return BBPromise.resolve(argValues_1);
        }
        else {
            // The user has not provided the correct number of arguments.
            // Interactively prompt them for answers using the inquirer package.
            return inquirer.prompt(this._questions)
                .then(function (argValues) {
                // If the user has specified --cli, we should print out a
                // command line that shows how to invoke with the current set of
                // arguments.
                if (argv.cli) {
                    // Get the executable name.
                    var execName = process.argv[1];
                    execName = execName.split(path.sep).slice(-1)[0];
                    // Get the argument values in the correct order.
                    var orderedArgs = _.map(_this.getArgNames(), function (curArgName) { return argValues[curArgName]; });
                    // Print the equivalent command line
                    console.log("Equivalent command line:");
                    console.log("node " + execName, orderedArgs.join(" "));
                }
                // Copy any other command line arguments onto the returned object.
                _.assign(argValues, argv);
                return argValues;
            });
        }
    };
    ArgInquirer.prototype.printUsage = function () {
        // Typically argv[1] is the full path to the main module.  We only want
        // to show the last part of this path, so split it by the OS's directory
        // separator then take the last part.
        var execName = process.argv[1];
        execName = execName.split(path.sep).slice(-1)[0];
        // Create a string for each argument in the form <name>.
        var argStrings = _.map(this.getArgNames(), function (curArgName) {
            return "<" + curArgName + ">";
        });
        console.log("Usage:");
        console.log("node " + execName + " " + argStrings.join(" "));
    };
    return ArgInquirer;
}());
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
function getArgs(argQuestions) {
    var argInquirer = new ArgInquirer(argQuestions);
    return argInquirer.getArgs();
}
exports.getArgs = getArgs;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9hcmdJbnF1aXJlci50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUM7O0FBRWIsMkJBQTZCO0FBQzdCLDBCQUE0QjtBQUM1QixvQ0FBc0M7QUFDdEMsNkJBQStCO0FBQy9CLG1DQUFxQztBQUVyQzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Z0ZBb0JnRjtBQUVoRixJQUFNLElBQUksR0FBRyxLQUFLLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLElBQUksQ0FBQztBQUdwQztJQUlJLFlBQVk7SUFHWixxQkFBbUIsU0FBNkQ7UUFDNUUsSUFBSSxDQUFDLFVBQVUsR0FBRyxDQUFDLENBQUMsV0FBVyxDQUFvQixTQUFTLENBQUMsQ0FBQztJQUNsRSxDQUFDO0lBR00saUNBQVcsR0FBbEI7UUFDSSxJQUFNLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUE0QixJQUFJLENBQUMsVUFBVSxFQUFFLFVBQUMsV0FBVyxJQUFLLE9BQUEsV0FBVyxDQUFDLElBQUssRUFBakIsQ0FBaUIsQ0FBQyxDQUFDO1FBQ3ZHLE9BQU8sQ0FBQyxDQUFDLElBQUksQ0FBUyxRQUFRLENBQUMsQ0FBQztJQUNwQyxDQUFDO0lBR00sNkJBQU8sR0FBZDtRQUFBLGlCQTJDQztRQTFDRyxJQUFNLFFBQVEsR0FBRyxJQUFJLENBQUMsV0FBVyxFQUFFLENBQUM7UUFFcEMsSUFBSSxJQUFJLENBQUMsSUFBSSxFQUFFO1lBQ1gsSUFBSSxDQUFDLFVBQVUsRUFBRSxDQUFDO1lBQ2xCLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxTQUFTLENBQUMsQ0FBQztTQUN2QzthQUFNLElBQUksSUFBSSxDQUFDLENBQUMsQ0FBQyxNQUFNLEtBQUssUUFBUSxDQUFDLE1BQU0sRUFBRTtZQUMxQyxrRUFBa0U7WUFFbEUsMERBQTBEO1lBQzFELElBQU0sV0FBUyxHQUE0QixFQUFFLENBQUM7WUFDOUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxFQUFFLFVBQUMsTUFBTSxFQUFFLEtBQUs7Z0JBQzVCLFdBQVMsQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUMsR0FBRyxNQUFNLENBQUM7WUFDeEMsQ0FBQyxDQUFDLENBQUM7WUFDSCxrRUFBa0U7WUFDbEUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxXQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7WUFDMUIsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLFdBQVMsQ0FBQyxDQUFDO1NBRXZDO2FBQU07WUFDSCw2REFBNkQ7WUFDN0Qsb0VBQW9FO1lBQ3BFLE9BQU8sUUFBUSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDO2lCQUN0QyxJQUFJLENBQUMsVUFBQyxTQUFTO2dCQUNaLHlEQUF5RDtnQkFDekQsZ0VBQWdFO2dCQUNoRSxhQUFhO2dCQUNiLElBQUksSUFBSSxDQUFDLEdBQUcsRUFBRTtvQkFDViwyQkFBMkI7b0JBQzNCLElBQUksUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUM7b0JBQy9CLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztvQkFFakQsZ0RBQWdEO29CQUNoRCxJQUFNLFdBQVcsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEtBQUksQ0FBQyxXQUFXLEVBQUUsRUFBRSxVQUFDLFVBQVUsSUFBSyxPQUFBLFNBQVMsQ0FBQyxVQUFVLENBQUMsRUFBckIsQ0FBcUIsQ0FBQyxDQUFDO29CQUVyRixvQ0FBb0M7b0JBQ3BDLE9BQU8sQ0FBQyxHQUFHLENBQUMsMEJBQTBCLENBQUMsQ0FBQztvQkFDeEMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFRLFFBQVUsRUFBRSxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUM7aUJBQzFEO2dCQUNELGtFQUFrRTtnQkFDbEUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxTQUFTLEVBQUUsSUFBSSxDQUFDLENBQUM7Z0JBQzFCLE9BQU8sU0FBUyxDQUFDO1lBQ3JCLENBQUMsQ0FBQyxDQUFDO1NBQ047SUFDTCxDQUFDO0lBRU0sZ0NBQVUsR0FBakI7UUFFSSx1RUFBdUU7UUFDdkUsd0VBQXdFO1FBQ3hFLHFDQUFxQztRQUNyQyxJQUFJLFFBQVEsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQy9CLFFBQVEsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztRQUVqRCx3REFBd0Q7UUFDeEQsSUFBTSxVQUFVLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsV0FBVyxFQUFFLEVBQUUsVUFBQyxVQUFVO1lBQ3BELE9BQU8sR0FBRyxHQUFHLFVBQVUsR0FBRyxHQUFHLENBQUM7UUFDbEMsQ0FBQyxDQUFDLENBQUM7UUFFSCxPQUFPLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQ3RCLE9BQU8sQ0FBQyxHQUFHLENBQUMsT0FBTyxHQUFHLFFBQVEsR0FBRyxHQUFHLEdBQUcsVUFBVSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDO0lBQ2pFLENBQUM7SUFFTCxrQkFBQztBQUFELENBaEZBLEFBZ0ZDLElBQUE7QUFHRDs7Ozs7Ozs7Ozs7Ozs7OztHQWdCRztBQUNILFNBQWdCLE9BQU8sQ0FDbkIsWUFBZ0U7SUFFaEUsSUFBTSxXQUFXLEdBQUcsSUFBSSxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7SUFDbEQsT0FBTyxXQUFXLENBQUMsT0FBTyxFQUFFLENBQUM7QUFDakMsQ0FBQztBQUxELDBCQUtDIiwiZmlsZSI6ImFyZ0lucXVpcmVyLmpzIiwic291cmNlc0NvbnRlbnQiOlsiXCJ1c2Ugc3RyaWN0XCI7XG5cbmltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0ICogYXMgeWFyZ3MgZnJvbSBcInlhcmdzXCI7XG5pbXBvcnQgKiBhcyBpbnF1aXJlciBmcm9tIFwiaW5xdWlyZXJcIjtcblxuLyoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKipcbiAqICBRdWVzdGlvbiBkZXNpZ24gY29uc2lkZXJhdGlvbnM6XG4gKlxuICogLSBJbnRlcmFjdGl2ZWx5IHByb21wdGluZyB0aGUgdXNlciBmb3IgYW4gYXJndW1lbnQgbWF5IHJlcXVpcmUgbXVsdGlwbGVcbiAqICAgcXVlc3Rpb25zLiAgV2hlbiB0aGlzIGhhcHBlbnMsIG1ha2Ugc3VyZSBhbGwgcXVlc3Rpb25zIGhhdmUgdGhlIHNhbWUgYG5hbWVgXG4gKiAgIHByb3BlcnR5LiAgSWYgdGhleSBhcmUgZGlmZmVyZW50LCB0aGUgdXNhZ2UgaW5mb3JtYXRpb24gd2lsbCBub3QgYmVcbiAqICAgY29ycmVjdC5cbiAqXG4gKiAtIEFsbCBzY3JpcHRzIHNob3VsZCBiZSBhYmxlIHRvIGJlIHJ1biBub24taW50ZXJhY3RpdmVseSBmcm9tIHRoZSBjb21tYW5kXG4gKiAgIGxpbmUgd2l0aCBhbGwgYXJndW1lbnRzIHByb3ZpZGVkLiAgVGhpcyBpcyBhIG1hdHRlciBvZiBjb252ZW5pZW5jZSBmb3JcbiAqICAgaHVtYW5zIGFuZCByZXF1aXJlZCBieSBDSSBlbnZpcm9ubWVudHMuICBJbiBvcmRlciB0byBwcmVzZXJ2ZSB0aGUgYWJpbGl0eVxuICogICB0byBzcGVjaWZ5IGFuc3dlcnMgb24gdGhlIGNvbW1hbmQgbGluZSwgdGhlIGFuc3dlciB0byBlYWNoIHF1ZXN0aW9uIG11c3QgYmVcbiAqICAgYSBzaW5nbGUgc3RyaW5nIGFuZCBub3QgbW9yZSBjb21wbGljYXRlZCBkYXRhIHN0cnVjdHVyZXMgKGUuZy4gb2JqZWN0cyBvclxuICogICBhcnJheXMpLiAgRm9yIGV4YW1wbGUsIGNvbnNpZGVyIGEgc2l0dWF0aW9uIHdoZXJlIHRoZSB1c2VyIG11c3Qgc3BlY2lmeSBhXG4gKiAgIGRhdGFiYXNlIG9yIGNob29zZSBhbGwgZGF0YWJhc2VzLiAgSWYgdGhlIHF1ZXN0aW9ucyByZXR1cm5zIGFuIGFycmF5IG9mXG4gKiAgIGRhdGFiYXNlIG5hbWVzLCB0aGVyZSBpcyBubyB3YXkgZm9yIHRoZSB1c2VyIHRvIHNwZWNpZnkgYWxsIGRhdGFiYXNlcyBvblxuICogICB0aGUgY29tbWFuZCBsaW5lLiAgSW5zdGVhZCwgdGhlIHF1ZXN0aW9uJ3MgYW5zd2VyIHNob3VsZCBiZSB0aGUgZGF0YWJhc2VcbiAqICAgbmFtZSBvciB0aGUgc3BlY2lhbCBzdHJpbmcgXCJfYWxsXCIuICBUaGlzIHdheSwgdGhlIHVzZXIgY2FuIHNwZWNpZnkgdGhlXG4gKiAgIHNwZWNpYWwgc3RyaW5nIFwiX2FsbFwiIG9uIHRoZSBjb21tYW5kIGxpbmUuXG4gKlxuICoqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKioqKi9cblxuY29uc3QgYXJndiA9IHlhcmdzLmhlbHAoZmFsc2UpLmFyZ3Y7XG5cblxuY2xhc3MgQXJnSW5xdWlyZXIge1xuXG4gICAgLy8gcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3F1ZXN0aW9uczogQXJyYXk8aW5xdWlyZXIuUXVlc3Rpb24+O1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBwdWJsaWMgY29uc3RydWN0b3IocXVlc3Rpb25zOiBfLkxpc3RPZlJlY3Vyc2l2ZUFycmF5c09yVmFsdWVzPGlucXVpcmVyLlF1ZXN0aW9uPikge1xuICAgICAgICB0aGlzLl9xdWVzdGlvbnMgPSBfLmZsYXR0ZW5EZWVwPGlucXVpcmVyLlF1ZXN0aW9uPihxdWVzdGlvbnMpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldEFyZ05hbWVzKCk6IEFycmF5PHN0cmluZz4ge1xuICAgICAgICBjb25zdCBhcmdOYW1lcyA9IF8ubWFwPGlucXVpcmVyLlF1ZXN0aW9uLCBzdHJpbmc+KHRoaXMuX3F1ZXN0aW9ucywgKGN1clF1ZXN0aW9uKSA9PiBjdXJRdWVzdGlvbi5uYW1lISk7XG4gICAgICAgIHJldHVybiBfLnVuaXE8c3RyaW5nPihhcmdOYW1lcyk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0QXJncygpOiBQcm9taXNlPHtba2V5OiBzdHJpbmddOiBhbnl9IHwgdW5kZWZpbmVkPiB7XG4gICAgICAgIGNvbnN0IGFyZ05hbWVzID0gdGhpcy5nZXRBcmdOYW1lcygpO1xuXG4gICAgICAgIGlmIChhcmd2LmhlbHApIHtcbiAgICAgICAgICAgIHRoaXMucHJpbnRVc2FnZSgpO1xuICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZXNvbHZlKHVuZGVmaW5lZCk7XG4gICAgICAgIH0gZWxzZSBpZiAoYXJndi5fLmxlbmd0aCA9PT0gYXJnTmFtZXMubGVuZ3RoKSB7XG4gICAgICAgICAgICAvLyBUT0RPOiBSdW4gdGhlIHZhbHVlcyB0aHJvdWdoIGVhY2ggcXVlc3Rpb24ncyB2YWxpZGF0ZSgpIG1ldGhvZC5cblxuICAgICAgICAgICAgLy8gVGhlIHVzZXIgaGFzIHBhc3NlZCBpbiB0aGUgY29ycmVjdCBudW1iZXIgb3IgYXJndW1lbnRzLlxuICAgICAgICAgICAgY29uc3QgYXJnVmFsdWVzOiB7W2tleTogc3RyaW5nXTogc3RyaW5nfSA9IHt9O1xuICAgICAgICAgICAgXy5mb3JFYWNoKGFyZ3YuXywgKGN1ckFyZywgaW5kZXgpID0+IHtcbiAgICAgICAgICAgICAgICBhcmdWYWx1ZXNbYXJnTmFtZXNbaW5kZXhdXSA9IGN1ckFyZztcbiAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgLy8gQ29weSBhbnkgb3RoZXIgY29tbWFuZCBsaW5lIGFyZ3VtZW50cyBvbnRvIHRoZSByZXR1cm5lZCBvYmplY3QuXG4gICAgICAgICAgICBfLmFzc2lnbihhcmdWYWx1ZXMsIGFyZ3YpO1xuICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZXNvbHZlKGFyZ1ZhbHVlcyk7XG5cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIFRoZSB1c2VyIGhhcyBub3QgcHJvdmlkZWQgdGhlIGNvcnJlY3QgbnVtYmVyIG9mIGFyZ3VtZW50cy5cbiAgICAgICAgICAgIC8vIEludGVyYWN0aXZlbHkgcHJvbXB0IHRoZW0gZm9yIGFuc3dlcnMgdXNpbmcgdGhlIGlucXVpcmVyIHBhY2thZ2UuXG4gICAgICAgICAgICByZXR1cm4gaW5xdWlyZXIucHJvbXB0KHRoaXMuX3F1ZXN0aW9ucylcbiAgICAgICAgICAgIC50aGVuKChhcmdWYWx1ZXMpID0+IHtcbiAgICAgICAgICAgICAgICAvLyBJZiB0aGUgdXNlciBoYXMgc3BlY2lmaWVkIC0tY2xpLCB3ZSBzaG91bGQgcHJpbnQgb3V0IGFcbiAgICAgICAgICAgICAgICAvLyBjb21tYW5kIGxpbmUgdGhhdCBzaG93cyBob3cgdG8gaW52b2tlIHdpdGggdGhlIGN1cnJlbnQgc2V0IG9mXG4gICAgICAgICAgICAgICAgLy8gYXJndW1lbnRzLlxuICAgICAgICAgICAgICAgIGlmIChhcmd2LmNsaSkge1xuICAgICAgICAgICAgICAgICAgICAvLyBHZXQgdGhlIGV4ZWN1dGFibGUgbmFtZS5cbiAgICAgICAgICAgICAgICAgICAgbGV0IGV4ZWNOYW1lID0gcHJvY2Vzcy5hcmd2WzFdO1xuICAgICAgICAgICAgICAgICAgICBleGVjTmFtZSA9IGV4ZWNOYW1lLnNwbGl0KHBhdGguc2VwKS5zbGljZSgtMSlbMF07XG5cbiAgICAgICAgICAgICAgICAgICAgLy8gR2V0IHRoZSBhcmd1bWVudCB2YWx1ZXMgaW4gdGhlIGNvcnJlY3Qgb3JkZXIuXG4gICAgICAgICAgICAgICAgICAgIGNvbnN0IG9yZGVyZWRBcmdzID0gXy5tYXAodGhpcy5nZXRBcmdOYW1lcygpLCAoY3VyQXJnTmFtZSkgPT4gYXJnVmFsdWVzW2N1ckFyZ05hbWVdKTtcblxuICAgICAgICAgICAgICAgICAgICAvLyBQcmludCB0aGUgZXF1aXZhbGVudCBjb21tYW5kIGxpbmVcbiAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coXCJFcXVpdmFsZW50IGNvbW1hbmQgbGluZTpcIik7XG4gICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBub2RlICR7ZXhlY05hbWV9YCwgb3JkZXJlZEFyZ3Muam9pbihcIiBcIikpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyBDb3B5IGFueSBvdGhlciBjb21tYW5kIGxpbmUgYXJndW1lbnRzIG9udG8gdGhlIHJldHVybmVkIG9iamVjdC5cbiAgICAgICAgICAgICAgICBfLmFzc2lnbihhcmdWYWx1ZXMsIGFyZ3YpO1xuICAgICAgICAgICAgICAgIHJldHVybiBhcmdWYWx1ZXM7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHB1YmxpYyBwcmludFVzYWdlKCk6IHZvaWQge1xuXG4gICAgICAgIC8vIFR5cGljYWxseSBhcmd2WzFdIGlzIHRoZSBmdWxsIHBhdGggdG8gdGhlIG1haW4gbW9kdWxlLiAgV2Ugb25seSB3YW50XG4gICAgICAgIC8vIHRvIHNob3cgdGhlIGxhc3QgcGFydCBvZiB0aGlzIHBhdGgsIHNvIHNwbGl0IGl0IGJ5IHRoZSBPUydzIGRpcmVjdG9yeVxuICAgICAgICAvLyBzZXBhcmF0b3IgdGhlbiB0YWtlIHRoZSBsYXN0IHBhcnQuXG4gICAgICAgIGxldCBleGVjTmFtZSA9IHByb2Nlc3MuYXJndlsxXTtcbiAgICAgICAgZXhlY05hbWUgPSBleGVjTmFtZS5zcGxpdChwYXRoLnNlcCkuc2xpY2UoLTEpWzBdO1xuXG4gICAgICAgIC8vIENyZWF0ZSBhIHN0cmluZyBmb3IgZWFjaCBhcmd1bWVudCBpbiB0aGUgZm9ybSA8bmFtZT4uXG4gICAgICAgIGNvbnN0IGFyZ1N0cmluZ3MgPSBfLm1hcCh0aGlzLmdldEFyZ05hbWVzKCksIChjdXJBcmdOYW1lKSA9PiB7XG4gICAgICAgICAgICByZXR1cm4gXCI8XCIgKyBjdXJBcmdOYW1lICsgXCI+XCI7XG4gICAgICAgIH0pO1xuXG4gICAgICAgIGNvbnNvbGUubG9nKFwiVXNhZ2U6XCIpO1xuICAgICAgICBjb25zb2xlLmxvZyhcIm5vZGUgXCIgKyBleGVjTmFtZSArIFwiIFwiICsgYXJnU3RyaW5ncy5qb2luKFwiIFwiKSk7XG4gICAgfVxuXG59XG5cblxuLyoqXG4gKiBBdHRlbXB0cyB0byBwYXJzZSB0aGUgY29tbWFuZCBsaW5lIHBhcmFtZXRlcnMgYWNjb3JkaW5nIHRvIHRoZSBzcGVjaWZpZWRcbiAqIGBhcmdRdWVzdGlvbnNgLiAgVGhlIGV4cGVjdGVkIGNvbW1hbmQgbGluZSBhcmd1bWVudHMgYXJlIGluZmVycmVkIGJ5IHRha2luZ1xuICogdGhlIGBuYW1lYCBwcm9wZXJ0eSBvZiBlYWNoIHF1ZXN0aW9uIG9iamVjdCBhbmQgcmVtb3ZpbmcgZHVwbGljYXRlcy4gIElmIHRoZVxuICogbnVtYmVyIG9mIGNvbW1hbmQgbGluZSBhcmd1bWVudHMgbWF0Y2hlcywgYSBkaWN0aW9uYXJ5IG9mIHRoZWlyIHZhbHVlcyBpc1xuICogcmV0dXJuZWQuICBPdGhlcndpc2UsIHRoZSBpbnF1aXJlciBwYWNrYWdlIGlzIHVzZWQgdG8gcHJvbXB0IHRoZSB1c2VyIHRvXG4gKiBzcGVjaWZ5IHRoZSB2YWx1ZSBvZiBlYWNoIGV4cGVjdGVkIGFyZ3VtZW50LlxuICogSWYgYC0taGVscGAgaGFzIGJlZW4gc3BlY2lmaWVkLCB1c2FnZSBpbmZvcm1hdGlvbiBpcyBwcmludGVkIGFuZCB0aGUgcmV0dXJuZWRcbiAqIHByb21pc2UgcmVzb2x2ZXMgd2l0aCB1bmRlZmluZWQuXG4gKiBJZiBgLS1jbGlgIGhhcyBiZWVuIHNwZWNpZmllZCwgdGhlIGNvbW1hbmQgbGluZSBlcXVpdmFsZW50IG9mIHRoZSBpbnRlcmFjdGl2ZVxuICogcHJvbXB0cyBpcyBwcmludGVkIHNvIHRoYXQgdGhlIHVzZXIgY2FuIGVhc2lseSByZXBlYXQgdGhlIGNvbW1hbmRcbiAqIG5vbi1pbnRlcmFjdGl2ZWx5LlxuICogQHBhcmFtIGFyZ1F1ZXN0aW9ucyAtIFF1ZXN0aW9ucyB0aGF0IGRlZmluZSB0aGUgbmVlZGVkIGNvbW1hbmQgbGluZVxuICogYXJndW1lbnRzLlxuICogQHJldHVybiBBIFByb21pc2UgZm9yIGEgZGljdGlvbmFyeSBvZiBhcmd1bWVudCBuYW1lcyB0byB0aGVpciB2YWx1ZS4gIElmXG4gKiBgLS1oZWxwYCB3YXMgc3BlY2lmaWVkIHRoZSBQcm9taXNlIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB1bmRlZmluZWQuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRBcmdzKFxuICAgIGFyZ1F1ZXN0aW9uczogXy5MaXN0T2ZSZWN1cnNpdmVBcnJheXNPclZhbHVlczxpbnF1aXJlci5RdWVzdGlvbj5cbik6IFByb21pc2U8e1trZXk6IHN0cmluZ106IGFueX0gfCB1bmRlZmluZWQ+IHtcbiAgICBjb25zdCBhcmdJbnF1aXJlciA9IG5ldyBBcmdJbnF1aXJlcihhcmdRdWVzdGlvbnMpO1xuICAgIHJldHVybiBhcmdJbnF1aXJlci5nZXRBcmdzKCk7XG59XG4iXX0=
