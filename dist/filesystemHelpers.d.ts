import { Directory } from "./directory";
import { File } from "./file";
/**
 * Determines whether `path` represents an existing directory or file.
 * @param path - The path to the filesystem item in question
 * @return A Promise that resolves with a Directory or File object.  The Promise
 *   is rejected if `path` does not exist.
 */
export declare function getFilesystemItem(path: string): Promise<Directory | File>;
