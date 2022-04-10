import {numericEnumValToString} from "./enumHelpers";


/**
 * An Error class in which instances are constructed to wrap error values
 * from a specific enumeration.
 */
class EnumError<T> extends Error {
    public readonly errorNum: T[keyof T];

    /**
     * Constructs a new EnumError instance
     * @param enumObject - The enumeration containing the possible errors
     * @param errorNum - The error value to wrap
     */
    public constructor(enumObject: T, errorNum: T[keyof T]) {
        // Chain to the base class.
        // Unfortunately, there is a weird issue related to extending Error and
        // targeting ES5.  See: http://bit.ly/2wDu0XP
        super(`Error ${errorNum} (${numericEnumValToString(enumObject, errorNum)})`);
        Object.setPrototypeOf(this, EnumError.prototype);

        this.errorNum = errorNum;
    }
}


/**
 * Convenience function that returns a class capable of wrapping errors defined
 * in the specified enumeration (in a type safe manner)
 * @param enumObject - The enumeration defining possible error values
 * @return A class whose instances will wrap error values from the specified
 * enumeration
 */
export const getEnumErrorClass = <T>(enumObject: T) => {  // eslint-disable-line @typescript-eslint/explicit-module-boundary-types
    return class SpecificEnumError extends EnumError<T> {
        public constructor(errorNum: T[keyof T]) {
            super(enumObject, errorNum);
            Object.setPrototypeOf(this, SpecificEnumError.prototype);
        }
    };
};
