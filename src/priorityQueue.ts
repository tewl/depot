import {Heap, CompareResult} from "./heap";


interface IPriorityQueueItem<PayloadType>
{
    priority: number;
    payload:  PayloadType;
}


function comparePriority<PayloadType>(
    itemA: IPriorityQueueItem<PayloadType>,
    itemB: IPriorityQueueItem<PayloadType>
): CompareResult {
    if (itemA.priority < itemB.priority) {
        return CompareResult.LESS;
    }
    else if (itemA.priority === itemB.priority) {
        return CompareResult.EQUAL;
    }
    else {
        return CompareResult.GREATER;
    }
}


export class PriorityQueue<PayloadType>
{

    // region Data Members
    private _heap: Heap<IPriorityQueueItem<PayloadType>>;
    // endregion


    public constructor()
    {
        this._heap = new Heap<IPriorityQueueItem<PayloadType>>(comparePriority);
    }


    public get length(): number
    {
        return this._heap.length;
    }


    public get isEmpty(): boolean
    {
        return this._heap.isEmpty;
    }


    public push(payload: PayloadType, priority: number): void
    {
        this._heap.push({priority: priority,
                         payload:  payload});
    }


    public peak(): PayloadType | undefined
    {
        const item = this._heap.peak();
        return item === undefined ? undefined : item.payload;
    }


    public pop(): PayloadType | undefined
    {
        const item = this._heap.pop();
        return item === undefined ? undefined : item.payload;
    }


}
