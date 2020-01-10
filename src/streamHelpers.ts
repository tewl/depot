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
