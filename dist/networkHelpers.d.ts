/**
 * Enumerates the external IPv4 addresses
 * @return An object in which the keys are the names of the network interfaces
 * and the values are the IPv4 addresses (as strings)
 */
export declare function getExternalIpv4Addresses(): {
    [networkInterfaceName: string]: string;
};
/**
 * Gets the first externally exposed IPv4 address
 * @return The first externally exposed IPv4 address
 */
export declare function getFirstExternalIpv4Address(): string;
/**
 * Determines whether the specified TCP port is available.
 * @param port - The port to check
 * @return A promise that always resolves with a boolean indicating whether the
 * specified port is available.
 */
export declare function isTcpPortAvailable(port: number): Promise<boolean>;
/**
 * Gets an available TCP port number
 * @return An available TCP port number
 */
export declare function getAvailableTcpPort(): Promise<number>;
/**
 * Gets an available TCP port number, choosing from the optional preferred ports
 * first.  If none of those are available, the first available TCP port is
 * returned.
 * @param preferredPorts - Ports that will be checked first to see if they are
 * available
 * @return An available TCP port number
 */
export declare function selectAvailableTcpPort(...preferredPorts: Array<number>): Promise<number>;
export interface IPortConfig {
    requiredPort?: number;
    preferredPort?: number;
}
/**
 * Determines a TCP port that a server can run at.
 * @param portConfig - Object describing the port requirements/preferences
 * @return A promise that resolves with an available TCP port number.  The
 * promise rejects if the caller specified a required port number that is
 * not available.
 */
export declare function determinePort(portConfig?: IPortConfig): Promise<number>;
