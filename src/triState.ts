/**
 * Represents a value that can be true, false or indeterminate.  This
 * abstraction makes checking state more explicit by comparing against the
 * possible values enumerated by the public static properties.  This is
 * less error prone than using undefined | boolean because both undefined and
 * false are falsy values.
 */
export class TriState {
    // All possible TriState values.
    public static readonly FALSE         = new TriState(false);
    public static readonly TRUE          = new TriState(true);
    public static readonly INDETERMINATE = new TriState(undefined);

    // Instance Members
    private readonly _value: undefined | boolean;

    /**
     * Private constructor.  The only allowed instances are the static values
     * provided by this class.
     * @param value - The value of the new TriState instance.
     */
    private constructor(value: undefined | boolean) {
        this._value = value;
    }

    /**
     * Gets a string representation of this TriState instance (not localized).
     * @return The string representation
     */
    public toString(): string {
        if (this._value === undefined) {
            return "indeterminate";
        }
        else if (this._value) {
            return "true";
        }
        else {
            return "false";
        }
    }
}
