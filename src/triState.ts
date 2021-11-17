/**
 * Represents a value that can be true, false or indeterminate.
 */
export class TriState
{
    // All possible TriState values.
    public static readonly false         = new TriState(false);
    public static readonly true          = new TriState(true);
    public static readonly indeterminate = new TriState(undefined);

    // Instance Members
    private readonly _value: undefined | boolean;

    /**
     * Private constructor.  The only allowed instances are the static values
     * provided by this class.
     * @param value - The value of the new TriState instance.
     */
    private constructor(value: undefined | boolean)
    {
        this._value = value;
    }

    /**
     * Gets a string representation of this TriState instance (not localized).
     * @return The string representation
     */
    public toString(): string
    {
        if (this._value === undefined)
        {
            return "indeterminate";
        }
        else if (this._value)
        {
            return "true";
        }
        else {
            return "false";
        }
    }
}
