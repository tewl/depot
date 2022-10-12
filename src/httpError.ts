import _ from "lodash";
import { Response } from "node-fetch";
import { ContentType, HeaderName } from "./httpConstants";


export class HttpError {

    public static fromResponse(response: Response, description?: string): HttpError {
        if (response.ok) {
            throw new Error("Attempted to create HttpError instance with a successful response.");
        }

        return new HttpError(response, description);
    }

    private readonly _response: Response;
    private readonly _description: undefined | string;
    private _toString: undefined | string;

    private constructor(response: Response, description?: string) {
        this._response = response;
        this._description = description;
    }

    public get type(): "HttpError" {
        return "HttpError";
    }

    public async toString(): Promise<string> {
        if (this._toString === undefined) {
            this._toString = await responseErrorMessage(this._description || "", this._response);
        }

        return this._toString;
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
