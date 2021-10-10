import {Heap, CompareResult} from "./heap";


interface IPriorityQueueItem<TPayload>
{
    priority: number;
    payload:  TPayload;
}


function comparePriority<TPayload>(
    itemA: IPriorityQueueItem<TPayload>,
    itemB: IPriorityQueueItem<TPayload>
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


export class PriorityQueue<TPayload>
{

    // region Data Members
    private readonly _heap: Heap<IPriorityQueueItem<TPayload>>;
    // endregion


    public constructor()
    {
        this._heap = new Heap<IPriorityQueueItem<TPayload>>(comparePriority);
    }


    public get length(): number
    {
        return this._heap.length;
    }


    public get isEmpty(): boolean
    {
        return this._heap.isEmpty;
    }


    public push(payload: TPayload, priority: number): void
    {
        this._heap.push({priority: priority,
                         payload:  payload});
    }


    public peak(): TPayload | undefined
    {
        const item = this._heap.peak();
        return item === undefined ? undefined : item.payload;
    }


    public pop(): TPayload | undefined
    {
        const item = this._heap.pop();
        return item === undefined ? undefined : item.payload;
    }


}
