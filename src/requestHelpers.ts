import request = require("request-promise");

export type RequestType = typeof request;   // Does this work?

/*
 * Note:
 * The request-promise library is a `devDependency`, because this library does
 * not expose any of its types.  If this changes in the future, request-promise
 * should be moved from `devDependencies` to `dependencies`.
 */


/**
 * Determines whether the specified URL is GET-able.
 * @param url - The URL to GET
 * @return Resolves with a boolean value indicating whether the specified URL is
 * GET-able.
 */
export function urlIsGettable(url: string): Promise<boolean> {
    return request(url)
    .then(
        () => true,
        () => false
    );
}
