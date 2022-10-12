////////////////////////////////////////////////////////////////////////////////
// Request/Response Header Types
////////////////////////////////////////////////////////////////////////////////

export enum HeaderName {
    Authorization = "Authorization",
    ContentType = "Content-Type",
    Accept = "Accept",
    Location = "Location"
}


////////////////////////////////////////////////////////////////////////////////
// Content Types
////////////////////////////////////////////////////////////////////////////////

export enum ContentType {
    Json       = "application/json",
    TextPlain  = "text/plain",
    Wildcard   = "*/*"
}
