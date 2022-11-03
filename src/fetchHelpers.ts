import { Response, RequestInfo, RequestInit, Headers } from "node-fetch";
import { HttpError } from "./httpError";
import { retry } from "./promiseHelpers";
import { FailedResult, Result, SucceededResult } from "./result";


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
    const text = await response.text();
    errMsg += " " + text;
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


////////////////////////////////////////////////////////////////////////////////

export class NetworkError extends Error {

    public constructor(err: unknown) {
        const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
        super(errMsg);

        // Show the specific error type in stack traces.
        this.name = this.constructor.name;
    }
}

export class ResponseBodyError extends Error {
    public constructor(errMsg: string) {
        super(errMsg);

        // Show the specific error type in stack traces.
        this.name = this.constructor.name;
    }
}


////////////////////////////////////////////////////////////////////////////////

type FetchResultResponse = Response;
type FetchResultErrors = NetworkError | HttpError;

/**
 * Performs a fetch and parses the response as JSON, communicating all errors
 * via the returned Result object.
 *
 * @param fetch - The fetch() function to use
 * @param url - The URL
 * @param init - The fetch options
 * @returns A Promise that always resolves with a Result.  The Result is
 * successful if the response returns a status code in the 200 range and the
 * body could be parsed as JSON.
 */
export async function fetchResult(
    fetch: FetchFn,
    url: RequestInfo,
    init?: RequestInit
): Promise<Result<FetchResultResponse, FetchResultErrors>> {

    let resp: Response;
    try {
        resp = await fetch(url, init);
    }
    catch (err) {
        return new FailedResult(new NetworkError(err));
    }

    if (!resp.ok) {
        return new FailedResult(new HttpError(resp));
    }

    return new SucceededResult(resp);
}


////////////////////////////////////////////////////////////////////////////////

type FetchJsonResponse<TDto> = Response & {parsedBody: Partial<TDto>};
type FetchJsonErrors = NetworkError | HttpError | ResponseBodyError;

/**
 * Performs a fetch and parses the response as JSON, communicating all errors
 * via the returned Result object.
 *
 * @param fetch - The fetch() function to use
 * @param url - The URL
 * @param init - The fetch options
 * @returns A Promise that always resolves with a Result.  The Result is
 * successful if the response returns a status code in the 200 range and the
 * body could be parsed as JSON.  The parsed body is assigned to the
 * _parsedBody_ property of the returned Response.
 */
export async function fetchJson<TDto>(
    fetch: FetchFn,
    url: RequestInfo,
    init?: RequestInit
): Promise<Result<FetchJsonResponse<TDto>, FetchJsonErrors>> {
    const fetchRes = await fetchResult(fetch, url, init);
    if (fetchRes.failed) {
        return fetchRes;
    }
    const resp = fetchRes.value;

    let parsedBody: Partial<TDto>;
    try {
        parsedBody = await resp.json();
    }
    catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : JSON.stringify(err);
        return new FailedResult(new ResponseBodyError(errMsg));
    }

    const retResp = Object.assign(resp, {parsedBody});
    return new SucceededResult(retResp);
}
