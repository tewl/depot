import _ from "lodash";
import { Response } from "node-fetch";
import { ContentType, HeaderName } from "./httpConstants";


export class HttpError extends Error {

    private readonly _response: Response;


    public constructor(response: Response) {

        if (response.ok) {
            throw new Error("Attempted to create a HttpError from a successful response.");
        }

        const errMsg = `${response.status} - ${response.statusText}`;
        super(errMsg);

        // Show the specific error type in stack traces.
        this.name = this.constructor.name;

        this._response = response;
    }


    public get response(): Response {
        return this._response;
    }
}


/**
 * Creates a descriptive error message from a failed response.
 * @param description - A description of the failed operation.  This will be the
 * first part of the returned error message.  Typically, "Failed to..."
 * @param resp - The failed response
 * @return The error message string
 */
export async function responseErrorMessage(description: string, resp: Response): Promise<string> {
    if (resp.ok) {
        throw new Error("Attempted to create error message from successful response.");
    }

    let errMsg = description && _.trim(description).length ? description + " " : "";
    errMsg += `${resp.status} ${resp.statusText}`;
    let responseContentType = resp.headers.get(HeaderName.ContentType);
    if (responseContentType) {
        responseContentType = _.toLower(responseContentType);
        if (responseContentType.includes(ContentType.Json)) {
            const obj = await resp.json();
            errMsg += " " + JSON.stringify(obj);
        }
        else if (responseContentType.includes(ContentType.TextPlain)) {
            const text = await resp.text();
            errMsg += " " + text;
        }
    }

    return errMsg;
}
