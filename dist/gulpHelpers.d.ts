/**
 * Converts an Error object to a special Gulp Error object that will not display
 * the error's stack trace.
 *
 * @param err - An object describing the error.  If it does not have a `message`
 *     property, one will be created with a generic message.
 * @param defaultErrorMsg - The error message to use when `err.message` does not
 *     exist.
 * @return A Gulp error object that will not display the stack trace
 */
export declare function toGulpError(err: any, defaultErrorMsg?: string): Error;
