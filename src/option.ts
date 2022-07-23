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
     * If _input_ is "some", unwraps the value and passes it into _fn_,
     * returning its returned Option.  If _input_ is not "some" returns it.
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
     * Converts a boolean value into an Option wrapping the specified value.
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
