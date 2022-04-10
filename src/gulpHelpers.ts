export interface IGulpError extends Error {
    showStack: false;
}


/**
 * Converts an Error object to a special Gulp Error object that will not display
 * the error's stack trace.
 *
 * @param err - An object that optionally describes the error.
 * @param defaultErrorMsg - The error message to use when `err.message` does not
 *     exist.
 * @return A Gulp error object that will not display the stack trace
 */
export function toGulpError(
    err: Error | string | {message: string} | undefined
): IGulpError {
    const defaultErrorMsg = "Gulp encountered one or more errors.";
    let gulpError: IGulpError;
    if (err === undefined) {
        gulpError = new Error(defaultErrorMsg) as IGulpError;
    }
    else if (err instanceof Error && err.message.trim()) {
        gulpError = err as IGulpError;
    }
    else if (typeof err === "string") {
        gulpError = new Error(err) as IGulpError;
    }
    else if (typeof err.message === "string" &&  err.message.trim()) {
        gulpError = new Error(err.message) as IGulpError;
    }
    else {
        gulpError = new Error(defaultErrorMsg) as IGulpError;
    }

    // Don't show the stack trace.
    gulpError.showStack = false;
    return gulpError;
}
