////////////////////////////////////////////////////////////////////////////////
//
// Option Types
//
////////////////////////////////////////////////////////////////////////////////

/**
 * Describes an optional value that has a value.
 */
export interface ISomeOption<T>
{
    readonly state: "some";
    readonly value: T;
}


/**
 * Describes an optional value that does not have a value.
 */
export interface INoneOption
{
    readonly state: "none";
    readonly value: undefined;
}

const noneVal: INoneOption = { state: "none", value: undefined };


/**
 * Describes an optional value that may or may not have a value.
 */
export type Option<T> = ISomeOption<T> | INoneOption;


////////////////////////////////////////////////////////////////////////////////
//
// Creation Convenience Functions
//
////////////////////////////////////////////////////////////////////////////////

/**
 * Convenience function that creates an Option that has a value.
 * @param value The value of the option
 * @returns The created "some" Option.
 */
export function someOption<T>(value: T): ISomeOption<T>
{
    return {state: "some", value: value};
}


/**
 * Convenience function that creates an Option that does not have a value.
 * @returns The created "none" Option.
 */
export function noneOption(): INoneOption
{
    return noneVal;
}


////////////////////////////////////////////////////////////////////////////////
//
// User-Defined Type Guards
//
////////////////////////////////////////////////////////////////////////////////


/**
 * User-defined type guard that determines if an Option has a value.
 * @param option - The Option to inspect
 * @returns Whether the Option instance has a value.
 */
export function isSome<T>(option: Option<T>): option is ISomeOption<T>
{
    return option.state === "some";
}


/**
 * User-defined type guard that determines if an Option does not have a value.
 * @param option The Option to inspect
 * @returns Whether the Option instance does not have a value.
 */
export function isNone<T>(option: Option<T>): option is INoneOption
{
    return option.state === "none";
}


////////////////////////////////////////////////////////////////////////////////


/**
 * If _input_ is "some", unwraps the value and passes it into _fn_.
 * @param fn - The function to invoke on _input.value_ when _input_ is "some"
 * value.
 * @param input - The input Option.
 * @returns Either the passed-through "none" option or the "some" option
 * returned from _fn_.
 */
export function bindOption<TInput, TOutput>(
    fn: (x: TInput) => Option<TOutput>,
    input: Option<TInput>
): Option<TOutput>
{
    if (isSome(input))
    {
        const ret = fn(input.value);
        return ret;
    }
    else
    {
        return input;
    }
}


/**
 * When _input_ is "some", maps the wrapped value using _fn_.
 * @param fn - Function that maps the wrapped optional value to another optional
 * value.
 * @param input - The input Option.
 * @returns Either the mapped "some" option or the passed through "none" option.
 */
export function mapSome<TInput, TOutput>(
    fn: (x: TInput) => TOutput,
    input: Option<TInput>
): Option<TOutput>
{
    if (isSome(input))
    {
        const ret = fn(input.value);
        return someOption(ret);
    }
    else
    {
        return input;
    }
}


/**
 * Converts a boolean value into an Option.
 * @param condition - The condition.
 * @param trueSomeVal - Value to be wrapped in a "Some" Option when
 * _condition_ is truthy.
 * @returns The resulting Option.
 */
export function boolToOption<TSome>(
    condition: unknown,
    trueSomeVal: TSome
): Option<TSome>
{
    return condition ?
        someOption(trueSomeVal) :
        noneOption();
}
