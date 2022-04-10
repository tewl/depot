import {Directory} from "./directory";


// A regular expression to match valid Git repo URLs.
// match[1]: project name
// TODO: Convert the following regex to use named capture groups.
// eslint-disable-next-line prefer-named-capture-group
const gitUrlRegexp = /.*\/(.*)\.git$/;


/**
 * Determines whether `gitUrl` is a valid Git repo URL
 * @param gitUrl - The string to test
 * @return true if valid; false otherwise
 */
export function isGitUrl(gitUrl: string): boolean {
    return !!gitUrl.match(gitUrlRegexp);
}


/**
 * Extracts the project name from a Git URL
 * @param gitUrl - The Git URL for a repository
 * @return The name of the project.  This method will throw an Error if the
 * provided URL is invalid.
 */
export function gitUrlToProjectName(gitUrl: string): string {
    const match = gitUrl.match(gitUrlRegexp);
    if (!match) {
        throw new Error("Tried to get project name from invalid Git URL.");
    }

    return match[1];
}


/**
 * Gets the project name from a directory path
 * @param dir - The directory path
 * @return The project name
 */
export function dirToProjectName(dir: Directory): string {
    return dir.dirName;
}
