/// <reference types="node" />
/**
 * Convenience function that returns a class capable of wrapping errors defined
 * in the specified enumeration (in a type safe manner)
 * @param enumObject - The enumeration defining possible error values
 * @return A class whose instances will wrap error values from the specified
 * enumeration
 */
export declare let getEnumErrorClass: <T>(enumObject: T) => {
    new (errorNum: T[keyof T]): {
        readonly errorNum: T[keyof T];
        name: string;
        message: string;
        stack?: string | undefined;
    };
    captureStackTrace(targetObject: Object, constructorOpt?: Function | undefined): void;
    prepareStackTrace?: ((err: Error, stackTraces: NodeJS.CallSite[]) => any) | undefined;
    stackTraceLimit: number;
};
