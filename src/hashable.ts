 /**
  * Interface to be implemented by types that support the ability to produce a
  * unique hash that can be used to identify instances.  When implementing this
  * interface the following must be true:
  *
  * - Instances considered equal must produce the same hash code.  Therefore, it
  *   is strongly recommended that any type implementing this interface also
  *   implement IEquatable.
  *
  * @example
  * // A good way to implement this function is to put the intrinsic properties
  * // of the instance into an object, and then hash its JSON representation.
  * public getHash(): string {
  *     const intrinsics = {first: this.first, last:  this.last};
  *     return hash(JSON.stringify(intrinsics), "sha256", "base64");
  * }
  */
export interface IHashable {
    getHash(): string;
}
