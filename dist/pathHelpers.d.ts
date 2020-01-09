import { Directory } from "./directory";
export declare type PathPart = Directory | string;
export declare function reducePathParts(pathParts: Array<PathPart>): string;
