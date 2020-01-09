/**
 * A type that describes a function that validates a particular subject.  The
 * function accepts the subject as its only parameter and returns a boolean or a
 * Promise for a boolean.
 */
declare type ValidatorFunc<SubjectType> = (subject: SubjectType) => boolean | Promise<boolean>;
/**
 * A Validator is an object that can evaluate the validity of a subject by
 * invoking an array of validator functions on that subject.  This class is
 * templated on the type of the subject to be validated.
 */
export declare class Validator<SubjectType> {
    private readonly _validatorFuncs;
    /**
     * Constructs a new Validator.
     *
     * @param validatorFuncs - The functions used to validate a subject.  Each
     * function must have a single parameter of the subject type and return a
     * boolean or Promise<boolean> (true=valid, false=invalid).  If an async
     * function rejects, the subject is assumed to be invalid.
     */
    constructor(validatorFuncs: Array<ValidatorFunc<SubjectType>>);
    /**
     * Evaluates the validity of subject.
     * @param subject - The data to be validated
     * @return A promise for the validity of subject.  This promise will never
     * reject.
     */
    isValid(subject: SubjectType): Promise<boolean>;
}
export {};
