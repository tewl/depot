import * as os from "os";
import * as net from "net";
import * as _ from "lodash";
import * as BBPromise from "bluebird";


/**
 * Enumerates the external IPv4 addresses
 * @return An object in which the keys are the names of the network interfaces
 * and the values are the IPv4 addresses (as strings)
 */
export function getExternalIpv4Addresses(): {[networkInterfaceName: string]: string} {

    const foundInterfaces: {[networkInterfaceName: string]: string} = {};

    const networkInterfaces = os.networkInterfaces();

    for (const curInterfaceName in networkInterfaces) {
        if (networkInterfaces.hasOwnProperty(curInterfaceName)) {
            const addrArray = networkInterfaces[curInterfaceName];
            for (const curAddr of addrArray) {
                if ((curAddr.family === "IPv4") && (!curAddr.internal)) {
                    foundInterfaces[curInterfaceName] = curAddr.address;
                }
            }
        }
    }

    return foundInterfaces;
}


/**
 * Gets the first externally exposed IPv4 address
 * @return The first externally exposed IPv4 address
 */
export function getFirstExternalIpv4Address(): string
{
    const addresses = getExternalIpv4Addresses();
    const address = _.first(_.values(addresses))!;
    return address;
}


/**
 * Helper function that will determine if the specified port is available.
 * @param port - The port to test.  Specify 0 if you want to find the first
 * available port.
 * @return A promise that resolves with the port when available.  It rejects if
 * the specified port is not available.
 */
function isAvailable(port: number): Promise<number>
{
    return new BBPromise<number>((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on("error", reject);
        server.listen({port}, () => {
            const {port} = server.address();
            server.close(() => {
                resolve(port);
            });
        });
    });
}


/**
 * Determines whether the specified TCP port is available.
 * @param port - The port to check
 * @return A promise that always resolves with a boolean indicating whether the
 * specified port is available.
 */
export function isTcpPortAvailable(port: number): Promise<boolean>
{
    return isAvailable(port)
    .then(() => true)
    .catch(() => false);
}


/**
 * Gets an available TCP port number
 * @return An available TCP port number
 */
export function getAvailableTcpPort(): Promise<number>
{
    return isAvailable(0);
}


/**
 * Gets an available TCP port number, choosing from the optional preferred ports
 * first.  If none of those are available, the first available TCP port is
 * returned.
 * @param preferredPorts - Ports that will be checked first to see if they are
 * available
 * @return An available TCP port number
 */
export function selectAvailableTcpPort(...preferredPorts: Array<number>): Promise<number>
{
    // Remove any preferred ports that we know cannot be used.
    _.remove(preferredPorts, (curPort) => curPort === 0);

    return _.reduce<number, Promise<number>>(
        [...preferredPorts, 0],
        (acc, curPort) => {
            return acc.catch(() => isAvailable(curPort));
        },
        BBPromise.reject(undefined)
    );
}


export interface IPortConfig
{
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
export function determinePort(portConfig?: IPortConfig): Promise<number>
{
    portConfig = portConfig || {};

    return BBPromise.resolve()
    .then(() => {
        if (!(portConfig!.requiredPort)) {
            // There is no required port.  Yield 0.
            return 0;
        }

        // There is a required port.  If it is available, use it.  Otherwise
        // reject.
        return isTcpPortAvailable(portConfig!.requiredPort!)
        .then((isAvailable) => {
            if (isAvailable) { return portConfig!.requiredPort; }
            throw new Error(`Required port ${portConfig!.requiredPort} is not available.`);
        });
    })
    .then((port) => {
        // If we have decided on a port, use it.
        if (port) {
            return port;
        }

        // If the client specified a preferred port, try to use that.
        // If not available, select a random one.
        return selectAvailableTcpPort(portConfig!.preferredPort || 0);
    });
}
