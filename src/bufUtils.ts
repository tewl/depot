import { EOL } from "os";
import { sprintf } from "sprintf-js";

/**
 * Grows a Buffer until it meets the specified size.  If theBuffer is already
 * the specified size or larger, theBuffer is returned.
 * @param theBuffer - The source Buffer
 * @param desiredNumBytes - The desired size
 * @return The original Buffer if it is already the specified size or larger.
 * Otherwise, a copy of theBuffer that has been padded.
 */
export function padBuffer(theBuffer: Buffer, desiredNumBytes: number): Buffer {
    const bytesNeeded: number = desiredNumBytes - theBuffer.length;

    if (bytesNeeded <= 0) {
        return theBuffer;
    }

    const paddedBuf: Buffer = Buffer.alloc(theBuffer.length + bytesNeeded);
    theBuffer.copy(paddedBuf);
    paddedBuf.fill(0, theBuffer.length);
    return paddedBuf;
}


/**
 * Pads theBuffer so that the size of the buffer aligns on a boundary that is a
 * multiple of numBytes
 * @param theBuffer - The buffer to be aligned
 * @param numBytes - The number of bytes to align to.  This number must be 2, 4,
 * or 8.  If any other value is passed, theBuffer is simply returned.
 * @return The aligned buffer.  If theBuffer is already aligned, it will be
 * returned.  Otherwise, a copy is made.
 */
export function alignBuffer(theBuffer: Buffer, numBytes: number): Buffer {
    // If the user did not specify an expected number of bytes, just return the
    // original buffer.
    if ((numBytes !== 2) && (numBytes !== 4) && (numBytes !== 8) ) {
        throw new Error(`alignBuffer() should only be used to to align on 2, 4, or 8 byte boundaries.  Caller specified ${numBytes} bytes.`);
        return theBuffer;
    }

    const remainder: number = theBuffer.length % numBytes;
    if (remainder === 0) {
        return theBuffer;
    }

    const newSize: number = theBuffer.length + numBytes - remainder;
    return padBuffer(theBuffer, newSize);
}


/**
 * Converts the specified number into an array of booleans.  The least
 * significant bit of num will be represented by the boolean at index 0.
 * @param num - The number to convert
 * @param numBytes - The number of bytes that should be represented in the
 * returned array.
 * @return An array representing the bits (in boolean form) of num
 */
export function boolify(num: number, numBytes: number): Array<boolean> {
    const result: Array<boolean> = [];

    for (let i: number = 0; i < 8 * numBytes; i++) {
        result.push(!!(num & 1));
        num = num >>> 1;
    }

    return result;
}


/**
 * Converts a character code into its ascii representation.  Non-printable
 * character codes are converted to ".".
 * @param charCode - The character code to convert
 * @return The converted character
 */
function getPrintableChar(charCode: number): string {
    if ((charCode >= 0x20) && (charCode <= 0x7e)) {
        return String.fromCharCode(charCode);
    }
    else {
        return ".";
    }
}


const HEX_DUMP_BYTES_PER_LINE: number = 0x10;


/**
 * Helper function that calculates a single line hex dump.
 * @param theBuffer - The Buffer to dump
 * @return A single line hexadecimal dump
 */
function hexDumpLine(theBuffer: Buffer): string {

    const bufEndIndex: number = theBuffer.length;  // 1 past the last valid index
    let hexStr: string = "";
    let asciiStr: string = "";

    for (let i: number = 0; i < HEX_DUMP_BYTES_PER_LINE; ++i) {

        let hexToAdd: string;
        let asciiToAdd: string;

        if (i < bufEndIndex) {
            const curByte: number = theBuffer[i];
            hexToAdd = sprintf("%02x", curByte);
            asciiToAdd = getPrintableChar(curByte);
        }
        else {
            hexToAdd = "  ";
            asciiToAdd = " ";
        }

        // For readability, insert a space on every 16-bit boundary.
        if ((i > 0) && (i % 2 === 0)) {
            hexStr += " ";
        }

        hexStr += hexToAdd;
        asciiStr += asciiToAdd;
    }

    return hexStr + "  " + asciiStr;
}


/**
 * Gets a hex dump of the specified Buffer
 * @param theBuffer - The Buffer to dump the contents of
 * @return The hexadecimal dump
 */
export function hexDump(theBuffer: Buffer): string {

    // The number of bytes output so far.
    let outputBytes: number = 0;
    // The string to be returned to the caller.
    let outputStr: string = "";

    while (outputBytes < theBuffer.length) {

        // Get a "sub-buffer" of the bytes that will be printed on the current line.
        const subBuf: Buffer = theBuffer.slice(outputBytes, outputBytes + HEX_DUMP_BYTES_PER_LINE);
        // Get the string for the current line.
        const line: string = hexDumpLine(subBuf);

        // If we are appending on to a previous line, append EOL.
        if (outputStr.length > 0) {
            outputStr = outputStr + EOL;
        }
        outputStr = outputStr + line;

        // Move to the next line (if there is another).
        outputBytes += HEX_DUMP_BYTES_PER_LINE;
    }

    return outputStr;
}


export function bytesToString(theBuffer: Buffer): string {
    const str =
        Array.from(theBuffer)
        .map((curByte) => sprintf("%02x", curByte))
        .join(" ");
    return str;
}
