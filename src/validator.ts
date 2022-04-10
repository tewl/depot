import * as _ from "lodash";
import {mapAsync} from "./promiseHelpers";


/**
 * A type that describes a function that validates a particular subject.  The
 * function accepts the subject as its only parameter and returns a boolean or a
 * Promise for a boolean.
 */
type ValidatorFunc<TSubject> = (subject: TSubject) => boolean | Promise<boolean>;


/**
 * A Validator is an object that can evaluate the validity of a subject by
 * invoking an array of validator functions on that subject.  This class is
 * templated on the type of the subject to be validated.
 */
export class Validator<TSubject> {
    // region Data Members
    private readonly _validatorFuncs: Array<ValidatorFunc<TSubject>>;
    // endregion


    /**
     * Constructs a new Validator.
     *
     * @param validatorFuncs - The functions used to validate a subject.  Each
     * function must have a single parameter of the subject type and return a
     * boolean or Promise<boolean> (true=valid, false=invalid).  If an async
     * function rejects, the subject is assumed to be invalid.
     */
    public constructor(validatorFuncs: Array<ValidatorFunc<TSubject>>) {
        this._validatorFuncs = validatorFuncs;
    }


    /**
     * Evaluates the validity of subject.
     * @param subject - The data to be validated
     * @return A promise for the validity of subject.  This promise will never
     * reject.
     */
    public isValid(subject: TSubject): Promise<boolean> {
        return mapAsync(this._validatorFuncs, (curValidatorFunc) => {
            const result: Promise<boolean> | boolean = curValidatorFunc(subject);
            // Wrap each return value in a Promise.
            return Promise.resolve(result);
        })
        .then((validationResults: Array<boolean>) => {
            // Return true only if every validator returned true.
            return _.every(validationResults);
        })
        .catch(() => {
            // One of the validators rejected.  Assume that means a failed
            // validation.
            return false;
        });
    }
}
