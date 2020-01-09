import * as request from "request-promise";
export declare type RequestType = typeof request;
/**
 * Determines whether the specified URL is GET-able.
 * @param url - The URL to GET
 * @return Resolves with a boolean value indicating whether the specified URL is
 * GET-able.
 */
export declare function urlIsGettable(url: string): Promise<boolean>;
