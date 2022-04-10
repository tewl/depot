import * as path from "path";
import * as _ from "lodash";
import {Directory} from "./directory";


export type PathPart = Directory | string;


export function reducePathParts(pathParts: Array<PathPart>): string {
    return _.reduce(pathParts, (acc: string, curPathPart: PathPart): string => {
        if (curPathPart instanceof Directory) {
            return curPathPart.toString();
        }

        const curPathPartStr = curPathPart.toString();

        // If we are starting with a Windows drive letter, just return it.
        if (acc.length === 0 && _.endsWith(curPathPartStr, ":")) {
            return curPathPart;
        }

        return path.join(acc, curPathPartStr);
    }, "");
}
