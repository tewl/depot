interface IGulpError extends Error
{
    showStack: false;
}


/**
 * Converts an Error object to a special Gulp Error object that will not display
 * the error's stack trace.
 *
 * @param err - An object describing the error.  If it does not have a `message`
 * property, one will be created with a generic message.
 * @return A Gulp error object that will not display the stack trace
 */
export function toGulpError(err: any): Error
{
    const gulpError: IGulpError = new Error(err.message || "Gulp encountered one or more errors.") as IGulpError;
    // Don't show the stack trace.
    gulpError.showStack = false;
    return gulpError;
}
