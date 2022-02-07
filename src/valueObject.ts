/**
 * Base class for value objects that should not be compatible with any other
 * type (i.e. branded).  Loosely based on the base class described here:
 * https://khalilstemmler.com/articles/typescript-value-object/
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
