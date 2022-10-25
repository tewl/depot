import {Response, RequestInfo, RequestInit, Headers} from "node-fetch";
import { compareStrI } from "./compare";
import { ContentType, HeaderName } from "./httpConstants";
import { retry } from "./promiseHelpers";


/**
 * Creates a string describing a failure response.
 *
 * @param response - The failed response
 * @returns - A string describing the failed response
 */
export async function failedResponseToString(response: Response): Promise<string> {
    if (response.ok) {
        throw new Error("Attempted to get failure description from a successful response.");
    }

    // Always include the status code and text.
    let errMsg = `${response.status} ${response.statusText}`;

    // Append any response body data.
    const contentType = response.headers.get(HeaderName.ContentType);
    if (contentType) {
        if (compareStrI(contentType, ContentType.Json)) {
            const obj = await response.json();
            errMsg += " " + JSON.stringify(obj);
        }
        else if (compareStrI(contentType, ContentType.TextPlain)) {
            const text = await response.text();
            errMsg += " " + text;
        }
    }
    return errMsg;
}


////////////////////////////////////////////////////////////////////////////////
// fetch function wrapping
////////////////////////////////////////////////////////////////////////////////

export type FetchFn = (url: RequestInfo, init?: RequestInit) => Promise<Response>;


/**
 * Creates a fetch function variant that will perform the specified number of
 * retries.  Retries will be attempted when _innerFetch_ *rejects*, not when it
 * returns an error HTTP status code.
 *
 * @param numAttempts - The number of attempts that will be made
 * @param innerFetch - The fetch function to wrap
 * @returns A new fetch function that will perform the specified number of
 * retries before rejecting.
 */
export function getFetchWithRetry(
    numAttempts: number,
    innerFetch: FetchFn
): FetchFn {
    const fetchWithRetry: FetchFn = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
        return retry(() => innerFetch(url, init), numAttempts);
    };
    return fetchWithRetry;
}


/**
 * Creates a fetch function variant that will always include the specified
 * request header.
 *
 * @param headerName - The name of the header
 * @param headerValue - The value of the header
 * @param innerFetch - The fetch function to wrap
 * @returns A new fetch function that will always include the specified request
 * header
 */
export function getFetchWithHeader(
    headerName: string,
    headerValue: string,
    innerFetch: FetchFn
): FetchFn {
    const fetchWithHeader: FetchFn = (url: RequestInfo, init?: RequestInit): Promise<Response> => {
        const headers = new Headers(init?.headers);
        headers.append(headerName, headerValue);

        const newInit = {...(init || {}), ...{headers}};
        return innerFetch(url, newInit);
    };
    return fetchWithHeader;
}
