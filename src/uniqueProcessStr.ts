let counter = 0;
const startTimestamp = Date.now();
const pid = process.pid;


/**
 * Creates a string that will be unique across this machine.
 * @return Returns a unique string comprised of a timestamp, pid and counter.
 */
export function getUniqueProcessStr(): string {
    const uniqueStr = `${startTimestamp}_pid${pid}_${counter}`;
    counter++;
    return uniqueStr;
}
