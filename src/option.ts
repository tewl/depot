/* eslint-disable @typescript-eslint/no-namespace */


interface IOption<T> {
    /**
     * Returns whether this option contains a value.
     */
    readonly isSome: boolean;

    /**
     * Returns whether this option does not contain a value.
     */
    readonly isNone: boolean;

    /**
     * Gets the value contained within this option, if any.
     */
    readonly value: T | undefined;
}


/**
 * Represents an optional value that is set.
 */
export class SomeOption<T> implements IOption<T> {
    private readonly _value: T;

    public constructor(value: T) {
        this._value = value;
    }

    public get isSome(): true {
        return true;
    }

    public get isNone(): false {
        return false;
    }

    public get value(): T {
        return this._value;
    }

    public toString(): string {
        return `SomeOption (${this._value})`;
    }
}


/**
 * Represents an optional value that is not set.
 */
export class NoneOption implements IOption<undefined> {

    private static readonly _instance: NoneOption = new NoneOption();

    /**
     * Gets the one-and-only instance.  Implemented as a single (1) to reduce
     * memory consumption and (2) to allow JS's === operator (which uses
     * reference equality) to work as expected.
     *
     * @returns The singleton instance
     */
    public static get(): NoneOption {
        return NoneOption._instance;
    }

    /**
     * Private constructor.  Use static get() method to get the one-and-only
     * instance.
     */
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    private constructor() {
    }

    public get isSome(): false {
        return false;
    }

    public get isNone(): true {
        return true;
    }

    public get value(): undefined {
        return undefined;
    }

    public toString(): string {
        return "NoneOption";
    }
}


/**
 * Represents an object that may or may not contain a value.
 */
export type Option<T> = SomeOption<T> | NoneOption;


/**
 * A namespace that will be merged with the Option type.  Serves as a useful
 * place to create functions that operate on Option objects.
 */
export namespace Option {

    /**
     * When all input Options are "some", returns a "some" Option containing an
     * array of the values.  If the input contains one (or more) "none" options,
     * the first "none" Option is returned.
     *
     * @param collection - The input collection
     * @returns
     */
    export function all<T>(
        collection: Array<Option<T>>
    ): Option<Array<T>> {
        const firstNone = collection.find((curOpt): curOpt is NoneOption => curOpt instanceof NoneOption);
        return firstNone ?
            firstNone :
            new SomeOption(collection.map((curOpt) => curOpt.value!));
    }


    /**
     * If the input Option is Some, invokes _fn_ with the value.  If a Some
     * Option is returned, the original input value is augmented with the value.
     * Augment is a lot like bind(), except it automatically includes all of the
     * input's properties.  It can also serve as a reality check or gate when
     * augmenting no additional properties.
     *
     * @param fn - Function that will be invoked if the input is a Some Option.
     * Returns an Option.  If Some, the  properties will be added to _input_ and
     * returned as a Some Option.
     * @param input - The input Option
     * @returns An None Option if the input is None or _fn_ returns None.
     * Otherwise, a successful Option containing all properties of the original
     * input and the value returned by _fn_.
     */
    export function augment<TInput, TFn>(
        fn: (input: TInput) => Option<TFn>,
        input: Option<TInput>
    ): Option<TInput & TFn> {

        if (input.isNone) {
            return input;
        }

        // The input is a some Result.
        const fnOpt = fn(input.value);
        if (fnOpt.isNone) {
            // _fn_ has returned None.  Return None.
            return fnOpt;
        }

        // _fn_ has returned Some.  Return an object containing all properties of
        // the original input and the value returned by _fn_.
        const augmented = { ...input.value, ...fnOpt.value};
        return new SomeOption(augmented);
    }


    /**
     * If _input_ is "some", unwraps the value and passes it into _fn_,
     * returning its returned Option.  If _input_ is not "some" returns it.
     *
     * @param fn - The function to invoke on _input.value_ when _input_ is
     * "some"
     * @param - The input Option
     * @returns Either the passed-through NoneOption or the Option returned from
     * _fn_.
     */
    export function bind<TIn, TOut>(
        fn: (x: TIn) => Option<TOut>,
        input: Option<TIn>
    ): Option<TOut> {
        return input.isSome ?
            fn(input.value) :
            input;
    }


    /**
     * Maps each input value through the specified mapping function.  If the
     * mapping function returns a Some result, its value is added to the
     * output array; otherwise nothing is added to the output array.
     *
     * @param fn - The function that will map each input value to either a
     * Some value that will be included in the output array or a None value.
     * @param input - The input sequence
     * @returns  The output array
     */
    export function choose<TIn, TOut>(fn: (v: TIn,) => Option<TOut>, input: Iterable<TIn>): Array<TOut> {
        const inputArr = Array.from(input);
        const output =
            inputArr.reduce<Array<TOut>>(
                (acc, cur) => {
                    const res = fn(cur);
                    if (res.isSome) {
                        acc.push(res.value);
                    }
                    return acc;
                },
                []
            );
        return output;
    }


    /**
     * If the input is Some value, returns the contained value, else returns the
     * default value.
     *
     * @param defaultValue - The default value to use if input is a None Option
     * Otherwise, returns the specified default value.
     * @param input - The input Option
     * @returns The contained value if input is Some, else the default value.
     */
    export function defaultValue<T>(defaultValue: T, input: Option<T>): T {
        return input.isSome ?
            input.value :
            defaultValue;
    }


    /**
     * If the input is a Some value, returns the contained value, else
     * returns _fn()_.  This function is useful when getting the default value
     * is expensive.
     *
     * @param fn - A function that can be invoked to get the default value.  Not
     * executed unless input is None.
     * @param input - The input Result
     * @returns The contained value if input is Some, else the value
     * returned by _fn_.
     */
    export function defaultWith<T>(fn: () => T, input: Option<T>): T {
        return input.isSome ?
            input.value :
            fn();
    }


    /**
     * Converts a boolean value into an Option wrapping the specified value.
     *
     * @param condition - The condition
     * @param trueVal - Value to be wrapped in a "some" Option when _condition_
     * is truthy
     * @returns The resulting Option
     */
    export function fromBool<T>(
        condition: unknown,
        trueVal: T
    ): Option<T> {
        return condition ?
            new SomeOption(trueVal) :
            NoneOption.get();
    }


    /**
     * When _input_ is "some", maps the wrapped value using _fn_.
     *
     * @param fn - The function that maps the wrapped value to another value.
     * @param input - The input Option
     * @returns Either the mapped "some" option or the passed-through "none"
     * Option.
     */
    export function mapSome<TIn, TOut>(
        fn: (x: TIn) => TOut,
        input: Option<TIn>
    ): Option<TOut> {
        return input.isSome ?
            new SomeOption(fn(input.value)) :
            input;
    }

}
