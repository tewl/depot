let counter = 0;
const startTimestamp = Date.now();
const pid = process.pid;


export function getUniqueProcessStr(): string
{
    const uniqueStr = `${startTimestamp}_pid${pid}_${counter}`;
    counter++;
    return uniqueStr;
}
