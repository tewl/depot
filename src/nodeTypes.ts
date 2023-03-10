/**
 * A Node.js error type that is not defined within the Node.js type definitions.
 * https://github.com/DefinitelyTyped/DefinitelyTyped/issues/33217
 */
export interface ISystemError {
    address?: string;  // If present, the address to which a network connection failed
    code?: string;  // The string error code
    dest?: string;  // If present, the file path destination when reporting a file system error
    errno?: number;  // The system-provided error number
    // eslint-disable-next-line @typescript-eslint/ban-types
    info?: object;  // If present, extra details about the error condition
    message?: string;  // A system-provided human - readable description of the error
    path?: string;  // If present, the file path when reporting a file system error
    port?: number;  // If present, the network connection port that is not available
    syscall?: string;  // The name of the system call that triggered the error
}
