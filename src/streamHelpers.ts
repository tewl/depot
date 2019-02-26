import {Readable} from "stream";
import * as BBPromise from "bluebird";


export function readableStreamToText(readable: Readable): Promise<string> {
    return new BBPromise<string>((resolve, reject) => {
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
