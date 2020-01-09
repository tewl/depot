/// <reference types="node" />
import { Readable } from "stream";
export declare function readableStreamToText(readable: Readable): Promise<string>;
