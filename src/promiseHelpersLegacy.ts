import * as _ from "lodash";
import BBPromise = require("bluebird");


// This file contains functions that rely upon the non-native Promise
// implementation provided by Bluebird.  This code has been moved to this file
// so that clients wanting to use promiseHelpers.ts do not need to take on a
// the Bluebird dependency.


/**
 *  Creates a promise that is resolved when all input promises have been settled
 *  (resolved or rejected).  The returned Promise is resolved with an array of
 *  BBPromise.Inspection objects.
 *
 *  This is the commonly accepted way of implementing allSettled() in Bluebird.
 *  See:  http://bluebirdjs.com/docs/api/reflect.html
 *
 *  Note: This function has been added to Node.js 12.9.0 (according to
 *  node.green) and later and can be removed once I stop using earlier
 *  versions.
 *
 * @param promises - The array of input promises.
 * @returns A promise that will be resolved with an inspection object for each
 * input promise.
 */
export function allSettled(promises: Array<Promise<unknown>>): Promise<Array<BBPromise.Inspection<unknown>>>
{
    "use strict";

    const wrappedPromises: Array<BBPromise.Inspection<unknown>> = _.map(
        promises,
        (curPromise: Promise<unknown>) => BBPromise.resolve(curPromise).reflect()
    );
    return Promise.all(wrappedPromises);
}
