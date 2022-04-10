type NodeCallback<TSuccess> = (err: unknown, result?: TSuccess) => void;

/**
 * Converts a Node-style async callback function with no arguments to a function
 * that takes no arguments and returns a Promise.
 *
 * @param fn - The Node-style function that takes only a callback function.
 * @return A function that takes no arguments and returns a Promise for the
 * result.
 */
export function promisify0<TSuccess>(
    fn: (cb: NodeCallback<TSuccess>) => void
): () => Promise<TSuccess> {
    const promisifiedFn = () => {
        return new Promise((resolve: (result: TSuccess) => void, reject) => {
            fn((err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result as TSuccess);
                }
            });
        });
    };

    return promisifiedFn;
}

/**
 * Converts a Node-style async callback function with one argument to a function
 * that takes one argument and returns a Promise.
 *
 * @param fn - The Node-style function that takes one argument and a callback
 * function.
 * @return A function that takes one argument and returns a Promise for the
 * result.
 */
export function promisify1<TSuccess, TArg1>(
    fn: (arg1: TArg1, cb: NodeCallback<TSuccess>) => void
): (arg1: TArg1) => Promise<TSuccess> {
    const promisifiedFn = (arg1: TArg1) => {
        return new Promise((resolve: (result: TSuccess) => void, reject) => {
            fn(arg1, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result as TSuccess);
                }
            });
        });
    };

    return promisifiedFn;
}

/**
 * Converts a Node-style async callback function with two arguments to a
 * function that takes two arguments and returns a Promise.
 *
 * @param fn - The Node-style function that takes two arguments and a callback
 * function.
 * @return A function that takes two arguments and returns a Promise for the
 * result.
 */
export function promisify2<TSuccess, TArg1, TArg2>(
    fn: (arg1: TArg1, arg2: TArg2, cb: NodeCallback<TSuccess>) => void
): (arg1: TArg1, arg2: TArg2) => Promise<TSuccess> {
    const promisifiedFn = (arg1: TArg1, arg2: TArg2) => {
        return new Promise((resolve: (result: TSuccess) => void, reject) => {
            fn(arg1, arg2, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result as TSuccess);
                }
            });
        });
    };

    return promisifiedFn;
}

/**
 * Converts a Node-style async callback function with three arguments to a
 * function that takes three arguments and returns a Promise.
 *
 * @param fn - The Node-style function that takes three arguments and a callback
 * function.
 * @return A function that takes three arguments and returns a Promise for the
 * result.
 */
export function promisify3<TSuccess, TArg1, TArg2, TArg3>(
    fn: (arg1: TArg1, arg2: TArg2, arg3: TArg3, cb: NodeCallback<TSuccess>) => void
): (arg1: TArg1, arg2: TArg2, arg3: TArg3) => Promise<TSuccess> {
    const promisifiedFn = (arg1: TArg1, arg2: TArg2, arg3: TArg3) => {
        return new Promise((resolve: (result: TSuccess) => void, reject) => {
            fn(arg1, arg2, arg3, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result as TSuccess);
                }
            });
        });
    };

    return promisifiedFn;
}

/**
 * Converts a Node-style async callback function with four arguments to a
 * function that takes four arguments and returns a Promise.
 *
 * @param fn - The Node-style function that takes four arguments and a callback
 * function.
 * @return A function that takes four arguments and returns a Promise for the
 * result.
 */
export function promisify4<TSuccess, TArg1, TArg2, TArg3, TArg4>(
    fn: (arg1: TArg1, arg2: TArg2, arg3: TArg3, arg4: TArg4, cb: NodeCallback<TSuccess>) => void
): (arg1: TArg1, arg2: TArg2, arg3: TArg3, arg4: TArg4) => Promise<TSuccess> {
    const promisifiedFn = (arg1: TArg1, arg2: TArg2, arg3: TArg3, arg4: TArg4) => {
        return new Promise((resolve: (result: TSuccess) => void, reject) => {
            fn(arg1, arg2, arg3, arg4, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result as TSuccess);
                }
            });
        });
    };

    return promisifiedFn;
}

/**
 * Converts a Node-style async callback function with five arguments to a
 * function that takes five arguments and returns a Promise.
 *
 * @param fn - The Node-style function that takes five arguments and a callback
 * function.
 * @return A function that takes five arguments and returns a Promise for the
 * result.
 */
export function promisify5<TSuccess, TArg1, TArg2, TArg3, TArg4, TArg5>(
    fn: (arg1: TArg1, arg2: TArg2, arg3: TArg3, arg4: TArg4, arg5: TArg5, cb: NodeCallback<TSuccess>) => void
): (arg1: TArg1, arg2: TArg2, arg3: TArg3, arg4: TArg4, arg5: TArg5) => Promise<TSuccess> {
    const promisifiedFn = (arg1: TArg1, arg2: TArg2, arg3: TArg3, arg4: TArg4, arg5: TArg5) => {
        return new Promise((resolve: (result: TSuccess) => void, reject) => {
            fn(arg1, arg2, arg3, arg4, arg5, (err, result) => {
                if (err) {
                    reject(err);
                }
                else {
                    resolve(result as TSuccess);
                }
            });
        });
    };

    return promisifiedFn;
}
