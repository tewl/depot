/**
 * Converts an error object into a string
 *
 * @param err - The error to be converted
 * @returns The resulting string.  If _err_ was an Error instance, the string
 * will be the Error's message.  Otherwise, the string is the JSON
 * representation of _err_.
 */
export function errorToString(err: unknown): string {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errAny = err as any;
    if (typeof err === "string") {
        return err;
    }
    else if (errAny.message && typeof errAny.message === "string") {
        return errAny.message;
    }
    else {
        return JSON.stringify(err);
    }
}
