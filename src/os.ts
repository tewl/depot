import * as os from "os";
import { Directory } from "./directory";


/**
 * An enumeration of operating systems supported by this tool.
 */
export enum OperatingSystem {
    Unknown = "UNKNOWN",
    Mac = "MAC",
    Windows = "WINDOWS"
}


/**
 * Gets the current OS.
 * @return The current OS
 */
export function getOs(): OperatingSystem {
    const platform = os.platform();

    if (platform.startsWith("win")) {
        return OperatingSystem.Windows;
    }
    else if (platform === "darwin") {
        return OperatingSystem.Mac;
    }
    else {
        return OperatingSystem.Unknown;
    }
}


/**
 * Gets the current user's home directory
 * @return The current user's home directory
 */
export function getHomeDir(): Directory {
    const dirStr = os.homedir();
    return new Directory(dirStr);
}
