/**
 * Base class for value object. Minimally useful.
 */
export abstract class ValueObject<TDerived>
{
    /**
     * Derived classes must implement structural equality using this method.
     *
     * @param other - The object to compare this to
     */
    public abstract equals(other: TDerived): boolean;
}
