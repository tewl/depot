import * as path from "path";
import * as _ from "lodash";
import {Directory} from "./directory";


export type PathPart = Directory | string;


export function reducePathParts(pathParts: Array<PathPart>): string
{
    return _.reduce(pathParts, (acc: string, curPathPart: PathPart): string => {
        if (curPathPart instanceof Directory)
        {
            return curPathPart.toString();
        }
        return path.join(acc, curPathPart.toString());
    }, "");
}
