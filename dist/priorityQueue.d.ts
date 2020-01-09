export declare class PriorityQueue<PayloadType> {
    private _heap;
    constructor();
    readonly length: number;
    readonly isEmpty: boolean;
    push(payload: PayloadType, priority: number): void;
    peak(): PayloadType | undefined;
    pop(): PayloadType | undefined;
}
