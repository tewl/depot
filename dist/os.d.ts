import { Directory } from "./directory";
/**
 * An enumeration of operating systems supported by this tool.
 */
export declare enum OperatingSystem {
    UNKNOWN = "UNKNOWN",
    MAC = "MAC",
    WINDOWS = "WINDOWS"
}
/**
 * Gets the current OS.
 * @return The current OS
 */
export declare function getOs(): OperatingSystem;
/**
 * Gets the current user's home directory
 * @return The current user's home directory
 */
export declare function getHomeDir(): Directory;
