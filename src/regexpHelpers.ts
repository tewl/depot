/**
 * Creates a new regular expression capable of detecting EOL.  Because regular
 * expressions have state, a function is used here to create new instances for
 * clients.
 * @param flags - Any RegExp flag that should be used when creating the regex.
 * @return The newly created regex
 */
export function createEolRegex(flags?: string): RegExp
{
    return new RegExp("\\r?\\n", flags);
}
