import * as _ from "lodash";
import { failed, Result, succeeded, succeededResult } from "./result";


/**
 * Maps values from a source collection until a failed mapping occurs.  If a
 * failure occurs, the mapping stops immediately.
 * @param srcCollection - The source collection
 * @param mappingFunc - The mapping function. Each element from _srcCollection_
 * is run through this function and it must return a successful result wrapping
 * the mapped value or a failure result wrapping the error.
 * @return A successful result wrapping an array of the mapped values or a
 * failure result wrapping the first failure encountered.
 */
export function mapWhileSuccessful<TInput, TOutput, TError>(
    srcCollection: Array<TInput>,
    mappingFunc: (curItem: TInput) => Result<TOutput, TError>
): Result<Array<TOutput>, TError>
{
    return _.reduce(
        srcCollection,
        (acc, curItem) =>
        {
            // If we have already failed, just return the error.
            if (failed(acc))
            {
                return acc;
            }

            // We have not yet failed, so process the current item.
            const res = mappingFunc(curItem);
            if (succeeded(res))
            {
                const newArr = _.concat(acc.value, res.value);
                return succeededResult(newArr);
            }
            else
            {
                return res;
            }
        },
        succeededResult([]) as Result<Array<TOutput>, TError>
    );
}
