import * as os from "os";


// Returns an object in which the keys are the names of the network interfaces
// and the values are the IPv4 addresses (as strings).
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
