/// <reference types="node" />
import { EventEmitter } from "events";
import { Task } from "./promiseHelpers";
export declare class TaskQueue extends EventEmitter {
    static EVENT_DRAINED: string;
    private readonly _numConcurrentTasks;
    private _tasks;
    private _numRunning;
    private _isProcessingLastFulfillment;
    private _isRunning;
    private readonly _pauseWhenDrained;
    /**
     * Creates a new TaskQueue instance.
     * @param numConcurrent - The maximum number of tasks that can be run
     *   concurrently.
     * @param pauseWhenDrained - Whether task execution should automatically
     *   stop when this queue is emptied.  New tasks added to the queue will not
     *   run automatically.
     * @return The new TaskQueue instance
     */
    constructor(numConcurrent: number | undefined, pauseWhenDrained?: boolean);
    /**
     * Returns the number of pending tasks not yet started.
     * @returns The number of tasks yet to be started
     */
    readonly length: number;
    /**
     * Adds a new task to this TaskQueue
     * @param task - The new task to be added
     * @param priority - The priority that the task should run at.
     * @returns A promise that will be resolved or rejected once
     * the task eventually executes.
     */
    push<ResolveType>(task: Task<ResolveType>, priority?: number): Promise<ResolveType>;
    /**
     * Cancels all pending tasks that have not been started.
     * @param err - The error that pending tasks will reject with
     */
    cancelAllPending(err?: any): void;
    /**
     * Returns a Promise that will be fulfilled (with undefined) the next time
     * this TaskQueue is completely drained.  A TaskQueue is considered
     * "drained" when all tasks have been completed and their fulfillment
     * handlers do not push any more tasks onto this TaskQueue.
     * @returns A Promise that will be fulfilled (with undefined) the next time
     * this TaskQueue is completely drained.
     */
    drain(): Promise<void>;
    run(): void;
    pause(): void;
    /**
     * Helper function that starts executing queued tasks.
     */
    private startTasks;
}
