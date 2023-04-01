import * as crypto from "crypto";
import { Brand } from "./brand";


/**
 * A hash value in string form.
 */
export type HashString = Brand<string, "HashString">;


/**
 * A function that takes a value and returns its hash.
 */
export type HashFn<T> = (val: T) => HashString;


/**
 * Hashes the specified string
 * @param str - The string to be hashed
 * @param algorithm - The hashing algorithm to use (e.g. "md5", "sha1",
 * "sha256", "sha512")
 * @param encoding - The encoding used in the returned string ("base64" or
 * "hex")
 * @returns The hashed value of the string
 */
export function hash(
    str: string,
    algorithm: string = "sha256",
    encoding: crypto.BinaryToTextEncoding = "hex"
): HashString {
    const hash = crypto.createHash(algorithm).update(str).digest(encoding);
    return hash as HashString;
}
