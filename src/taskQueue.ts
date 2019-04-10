import * as BBPromise from "bluebird";
import {EventEmitter} from "events";
import {PriorityQueue} from "./priorityQueue";
import {Task} from "./promiseHelpers";
import {Deferred} from "./deferred";


interface ITaskInfo<ResolveType> {
    task: Task<ResolveType>;
    deferred: Deferred<ResolveType>;
}


export class TaskQueue extends EventEmitter
{
    // region Events
    public static EVENT_DRAINED: string = "drained";
    // endregion


    // region Private Members
    private readonly _numConcurrentTasks: number | undefined;
    private _tasks: PriorityQueue<ITaskInfo<any>>;
    private _numRunning: number;
    private _isProcessingLastFulfillment: boolean;
    private _isRunning: boolean;
    private readonly _pauseWhenDrained: boolean;
    // endregion


    public constructor(numConcurrent: number | undefined, pauseWhenDrained?: boolean)
    {
        super();

        // numConcurrent set to 0 does not make any sense.  We will assume that
        // the caller wants to allow maximum concurrency.
        if (numConcurrent === 0) {
            numConcurrent = undefined;
        }

        this._numConcurrentTasks = numConcurrent;
        this._tasks = new PriorityQueue<ITaskInfo<any>>();
        this._numRunning = 0;
        this._isProcessingLastFulfillment = false;
        this._isRunning = !Boolean(pauseWhenDrained);
        this._pauseWhenDrained = Boolean(pauseWhenDrained);

        Object.seal(this);
    }


    /**
     * Returns the number of pending tasks not yet started.
     * @returns The number of tasks yet to be started
     */
    public get length(): number
    {
        return this._tasks.length;
    }


    /**
     * Adds a new task to this TaskQueue
     * @param task - The new task to be added
     * @param priority - The priority that the task should run at.
     * @returns A promise that will be resolved or rejected once
     * the task eventually executes.
     */
    public push<ResolveType>(task: Task<ResolveType>, priority: number = 0): Promise<ResolveType>
    {
        const dfd = new Deferred<ResolveType>();
        this._tasks.push({task: task, deferred: dfd}, priority);
        this.startTasks(true);
        return dfd.promise;
    }


    /**
     * Cancels all pending tasks that have not been started.
     * @param err - The error that pending tasks will reject with
     */
    public cancelAllPending(err?: any): void
    {
        err = err || new Error("Task cancelled because its TaskQueue was cancelled.");

        while (this._tasks.length > 0) {
            const curTask = this._tasks.pop();
            if (curTask) {
                curTask.deferred.reject(err);
            }
        }
    }


    /**
     * Returns a Promise that will be fulfilled (with undefined) the next time
     * this TaskQueue is completely drained.  A TaskQueue is considered
     * "drained" when all tasks have been completed and their fulfillment
     * handlers do not push any more tasks onto this TaskQueue.
     * @returns A Promise that will be fulfilled (with undefined) the next time
     * this TaskQueue is completely drained.
     */
    public drain(): Promise<void>
    {
        // This TaskQueue is already drained if...
        if ((this._tasks.length === 0) &&         // there are no pending tasks
            (this._numRunning === 0) &&           // there are no tasks currently running
            (!this._isProcessingLastFulfillment)  // we are not waiting for the last client fulfillment handler to run
                                                  // (if this._isProcessingLastFulfillment is true
                                                  // there will be a drained event fired in the future)
        ) {
            return BBPromise.resolve();
        }

        // Return a Promise that will be resolved when this TaskQueue eventually
        // drains.
        return new BBPromise<void>((resolve: () => void) => {
            this.once(TaskQueue.EVENT_DRAINED, resolve);
        });
    }


    public run(): void
    {
        // Only start running if we are currently not running and there is a
        // task queued.
        if (!this._isRunning && (this._tasks.length > 0))
        {
            this._isRunning = true;
            this.startTasks(false);
        }
    }


    public pause(): void
    {
        this._isRunning = false;
    }


    ////////////////////////////////////////////////////////////////////////////
    // Helper Methods
    ////////////////////////////////////////////////////////////////////////////

    /**
     * Helper function that starts executing queued tasks.
     */
    private startTasks(justAddedNewTask: boolean): void
    {
        if (justAddedNewTask) {
            this._isProcessingLastFulfillment = false;
        }

        if (this._tasks.length === 0 && this._numRunning === 0) {
            // The queue of tasks is empty.  Assume that we are running the last
            // fulfillment handler and wait one more tick to see if any new
            // tasks get enqueued.  If the last fulfillment handler enqueues a
            // new task, this_isProcessingLastFulfillment will be set to false.
            this._isProcessingLastFulfillment = true;
            // console.log("Looks like we might be done.  Waiting 1 tick.");

            BBPromise.resolve()
            .then(() => {
                if (this._isProcessingLastFulfillment) {
                    // console.log(`We are done and _numRunning is ${this._numRunning}`);

                    // We waited one more tick and no new tasks have been
                    // enqueued.  It is safe to say that this queue is now
                    // drained.
                    if (this._pauseWhenDrained) {
                        this.pause();
                    }
                    this.emit(TaskQueue.EVENT_DRAINED);
                    this._isProcessingLastFulfillment = false;
                }
            });

            return;
        }

        while (
            (this._tasks.length > 0) &&                 // While we have tasks to run and...
            this._isRunning          &&                 // ...we could be running more
            (
                (this._numConcurrentTasks === undefined) ||
                this._numRunning < this._numConcurrentTasks
            )
        )
        {
            // Run another task.
            const curTask: ITaskInfo<any> | undefined = this._tasks.pop();

            if (curTask) {
                ++this._numRunning;
                curTask.task()
                .then((value: any) => {
                    curTask.deferred.resolve(value);
                    --this._numRunning;
                    this.startTasks(false);
                })
                .catch((err: any) => {
                    curTask.deferred.reject(err);
                    --this._numRunning;
                    this.startTasks(false);
                });
            }
        }
    }

}


Object.freeze(TaskQueue.prototype);
