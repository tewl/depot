interface IGulpError extends Error
{
    showStack: false;
}


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
export function toGulpError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
    err: any,
    defaultErrorMsg = "Gulp encountered one or more errors."
): Error
{
    const errMsg = err?.message ?? defaultErrorMsg;
    const gulpError: IGulpError = new Error(errMsg) as IGulpError;
    // Don't show the stack trace.
    gulpError.showStack = false;
    return gulpError;
}
