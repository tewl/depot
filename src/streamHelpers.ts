import {Readable} from "stream";


export function readableStreamToText(readable: Readable): Promise<string> {
    return new Promise<string>((resolve, reject) => {
        readable.setEncoding("utf8");
        let accumulatedText = "";

        readable.on("readable", () => {
            const chunk = readable.read();
            if (chunk !== null) {
                accumulatedText += chunk;
            }
        });

        readable.on("end", () => {
            resolve(accumulatedText);
        });

        readable.on("error", (err) => {
            reject(err);
        });

    });
}


// A helper method used to read a Node.js readable stream into a Buffer
export function streamToBuffer(readableStream: NodeJS.ReadableStream): Promise<Buffer> {
    return new Promise((resolve, reject) => {
        const chunks: Array<Buffer> = [];
        readableStream.on("data", (data) => {
            chunks.push(data instanceof Buffer ? data : Buffer.from(data));
        });
        readableStream.on("end", () => {
            resolve(Buffer.concat(chunks));
        });
        readableStream.on("error", reject);
    });
}
