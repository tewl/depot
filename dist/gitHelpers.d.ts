import { Directory } from "./directory";
/**
 * Determines whether `gitUrl` is a valid Git repo URL
 * @param gitUrl - The string to test
 * @return true if valid; false otherwise
 */
export declare function isGitUrl(gitUrl: string): boolean;
/**
 * Extracts the project name from a Git URL
 * @param gitUrl - The Git URL for a repository
 * @return The name of the project.  This method will throw an Error if the
 * provided URL is invalid.
 */
export declare function gitUrlToProjectName(gitUrl: string): string;
/**
 * Gets the project name from a directory path
 * @param dir - The directory path
 * @return The project name
 */
export declare function dirToProjectName(dir: Directory): string;
