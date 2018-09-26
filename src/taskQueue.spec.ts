import {EventEmitter} from "events";
import * as BBPromise from "bluebird";
import {Task, getTimerPromise, allSettled} from "./promiseHelpers";
import {TaskQueue} from "./taskQueue";
import {Deferred} from "./deferred";


interface ITaskInfo<ResolveType> {
    task: Task<ResolveType>;
    deferred: Deferred<ResolveType>;
}


/**
 * Helper function that creates a task function and returns it along with
 * functions that should be used to resolve or reject the task.
 * @returns An object
 * containing the function that represents the task and a Deferred whose
 * resolve() and reject() should be used to force the task's returned promise to
 * resolve or reject.
 *
 */
function createTask<ResolveType>(): ITaskInfo<ResolveType>
{
    const dfd = new Deferred<ResolveType>();

    // Create a task that will return the Promise we just created (which is
    // controlled by the deferred's resolve() and reject()).
    const theTask = () => dfd.promise;

    return {
        task:     theTask,
        deferred: dfd
    };
}


/**
 * Helper function that creates a task function.  When executed, the task will
 * return a promise that will be resolved with resolveValue after a delay of
 * delayMs milliseconds.
 * @param delayMs - The number of milliseconds to delay before the returned
 * promise is fulfilled
 * @param resolveValue - The value that the returned Promise will be fulfilled
 * with
 */
function createTimerTask<ResolveType>(
    delayMs: number,
    resolveValue: ResolveType
): Task<ResolveType>
{
    const theTask = (): Promise<ResolveType> => {
        return getTimerPromise<ResolveType>(delayMs, resolveValue);
    };
    return theTask;
}


describe("TaskQueue", () => {


    it("will run all tasks concurrently when configured to do so", (done) => {
        const ti1: ITaskInfo<number> = createTask<number>();
        const ti2: ITaskInfo<number> = createTask<number>();

        const queue: TaskQueue = new TaskQueue(undefined);
        expect(queue.length).toEqual(0);

        // All tasks should start executing immediately.
        const t1Prom: Promise<number> = queue.push(ti1.task);
        expect(queue.length).toEqual(0);

        const t2Prom: Promise<number> = queue.push(ti2.task);
        expect(queue.length).toEqual(0);

        t1Prom
        .then((value: number) => {
            expect(value).toEqual(1);
            expect(queue.length).toEqual(0);
            ti2.deferred.resolve(2);

            t2Prom.then((value) => {
                expect(value).toEqual(2);
                expect(queue.length).toEqual(0);
                done();
            });
        });

        ti1.deferred.resolve(1);
    });


    it("will pause and resume running tasks as expected", (done) => {
        const ti1: ITaskInfo<number> = createTask<number>();
        const ti2: ITaskInfo<number> = createTask<number>();

        const queue: TaskQueue = new TaskQueue(1);
        queue.pause();
        expect(queue.length).toEqual(0);

        // Because the TaskQueue is paused, newly added tasks should *not*
        // start executing immediately.  Therefore, the number of unstarted
        // tasks should be incremented with each addition.
        const t1Prom: Promise<number> = queue.push(ti1.task);
        expect(queue.length).toEqual(1);
        const t2Prom: Promise<number> = queue.push(ti2.task);
        expect(queue.length).toEqual(2);

        queue.run();                // The first task should start running
        queue.pause();
        expect(queue.length).toEqual(1);  // Only second task should remain in the queue

        // Let the first task complete.
        ti1.deferred.resolve(1);
        t1Prom
        .then(() => {
            queue.run();                // Let the second task run
            queue.pause();
            expect(queue.length).toEqual(0);   // No more tasks in the queue

            // Let the second task complete.
            ti2.deferred.resolve(2);
            return t2Prom;
        })
        .then(() => {
            done();
        });
    });


    it("will only run the correct number of tasks concurrently", (done) => {

        const ti1: ITaskInfo<number> = createTask<number>();
        const ti2: ITaskInfo<number> = createTask<number>();

        const queue: TaskQueue = new TaskQueue(1);
        expect(queue.length).toEqual(0);

        // The first task added to the queue should start executing immediately.
        const t1Prom: Promise<number> = queue.push(ti1.task);
        expect(queue.length).toEqual(0);

        const t2Prom: Promise<number> = queue.push(ti2.task);
        expect(queue.length).toEqual(1);

        t1Prom
        .then((value: number) => {
            expect(value).toEqual(1);
            expect(queue.length).toEqual(0);
            ti2.deferred.resolve(2);

            t2Prom
            .then((value) => {
                expect(value).toEqual(2);
                expect(queue.length).toEqual(0);
                done();
            });
        });

        ti1.deferred.resolve(1);
    });


    it("is an EventEmitter", () => {
        const queue: TaskQueue = new TaskQueue(1);
        expect(queue instanceof EventEmitter).toBeTruthy();
    });


    it("will emit a drained event when the queue is drained", (done) => {
        let numDrainedEvents: number = 0;
        const queue: TaskQueue = new TaskQueue(1);

        queue.on(TaskQueue.EVENT_DRAINED, () => {
            numDrainedEvents++;
        });

        const taskInfo1 = createTask<number>();
        const taskInfo2 = createTask<number>();
        queue.push(taskInfo1.task)
        .then(() => {
            // The drained event will happen after resolving the last promise in
            // the event that promise's fulfillment handler enqueues another task.
            expect(numDrainedEvents).toEqual(0);
            taskInfo2.deferred.resolve(2);
            return queue.push(taskInfo2.task);
        })
        .then(() => {
            expect(numDrainedEvents).toEqual(0);
            return getTimerPromise(20, 5);
        })
        .then(
            () => {
                // One drain event should have been fired.
                expect(numDrainedEvents).toEqual(1);
                done();
            }
        );

        taskInfo1.deferred.resolve(1);
    });


    it("drain() will return a Promise that is fulfilled when the TaskQueue is emptied", (done) => {
        const queue = new TaskQueue(1);
        let numDrainedEvents: number = 0;
        queue.on(TaskQueue.EVENT_DRAINED, () => {
            numDrainedEvents++;
        });

        let t1Prom: Promise<number>;
        let t2Prom: Promise<number>;
        let t3Prom: Promise<number>;

        t1Prom = queue.push(createTimerTask(50, 1));
        t1Prom
        .then(() => {
            t2Prom = queue.push(createTimerTask(50, 2));
            return t2Prom;
        })
        .then(() => {
            t3Prom = queue.push(createTimerTask(50, 3));
            return t3Prom;
        });

        queue.drain()
        .then(() => {
            expect(BBPromise.resolve(t1Prom).isFulfilled()).toBeTruthy();
            expect(BBPromise.resolve(t2Prom).isFulfilled()).toBeTruthy();
            expect(BBPromise.resolve(t3Prom).isFulfilled()).toBeTruthy();
            return getTimerPromise(5, undefined);
        })
        .then(() => {
            expect(numDrainedEvents).toEqual(1);
            done();
        });
    });


    it("cancelAllPending() will cancel pending tasks with the specified error", (done) => {
        const queue: TaskQueue = new TaskQueue(1);

        const t1: Task<number> = createTimerTask(50, 1);
        const t2: Task<number> = createTimerTask(50, 2);

        const t1Prom: Promise<number> = queue.push(t1);
        const t2Prom: Promise<number> = queue.push(t2);

        queue.cancelAllPending(new Error("queue is cancelled"));

        allSettled([t1Prom, t2Prom])
        .then((inspections: Array<BBPromise.Inspection<any>>) => {
            // In-progress tasks should complete normally
            expect(inspections[0].isFulfilled()).toBeTruthy();
            // In-progress tasks should return their normal value
            expect(inspections[0].value()).toEqual(1);

            // Pending tasks should be rejected
            expect(inspections[1].isRejected()).toBeTruthy();
            // Pending tasks should be rejected with the value specified by the client
            expect(inspections[1].reason().message).toEqual("queue is cancelled");

            done();
        });
    });


    it("cancelAllPending() will cancel pending tasks with the default error if not specified", (done) => {
        const queue: TaskQueue = new TaskQueue(1);

        const t1: Task<number> = createTimerTask(50, 1);
        const t2: Task<number> = createTimerTask(50, 2);

        const t1Prom: Promise<number> = queue.push(t1);
        const t2Prom: Promise<number> = queue.push(t2);

        queue.cancelAllPending();  // Use default rejection value.

        allSettled([t1Prom, t2Prom])
        .then((inspections: Array<BBPromise.Inspection<any>>) => {

            // In-progress tasks should complete normally
            expect(inspections[0].isFulfilled()).toBeTruthy();
            // In-progress tasks should return their normal value
            expect(inspections[0].value()).toEqual(1);

            // Pending tasks should be rejected
            expect(inspections[1].isRejected()).toBeTruthy();
            // Pending tasks should be rejected with the value specified by the client
            expect(inspections[1].reason().message).toEqual("Task cancelled because its TaskQueue was cancelled.");

            done();
        });
    });


    it("will start paused when configured to pause when drained", () => {
        const queue = new TaskQueue(1, true);
        let taskHasRun = false;

        const task = (): Promise<number> => {
            taskHasRun = true;
            return BBPromise.resolve(1);
        };

        queue.push(task);
        expect(queue.length).toEqual(1);  // task should not be run
        expect(taskHasRun).toBeFalsy();   // task should not be run
    });


    it("will pause when drained when configured to do so", (done) => {
        const queue = new TaskQueue(1, true);

        const ti1: ITaskInfo<number> = createTask<number>();
        const ti2: ITaskInfo<number> = createTask<number>();
        const ti3: ITaskInfo<number> = createTask<number>();

        queue.push(ti1.task);
        expect(queue.length).toEqual(1);
        queue.run();
        expect(queue.length).toEqual(0);

        queue.drain()
        .then(() => {
            // The queue has now drained and should have paused itself.
            // So if another task is pushed, it should not start running
            // immediately.
            queue.push(ti2.task);
            expect(queue.length).toEqual(1);
            queue.run();
            expect(queue.length).toEqual(0);

            queue.drain()
            .then(() => {
                // The queue has now drained and should have paused itself.
                // So if another task is pushed, it should not start running
                // immediately.
                queue.push(ti3.task);
                expect(queue.length).toEqual(1);

                done();
            });

            ti2.deferred.resolve(2);
        });

        ti1.deferred.resolve(1);
    });


    it("when run() is called (repeatedly) on an empty queue, it will remain in the paused state", (done) => {
        let taskHasRun: boolean = false;
        const task = (): Promise<void> => {
            taskHasRun = true;
            return BBPromise.resolve();
        };

        const queue = new TaskQueue(4, true);
        queue.run();
        queue.run();
        queue.run();
        const taskProm = queue.push(task);

        taskProm
        .then(() => {
            expect(taskHasRun).toBeTruthy();
            done();
        });

        expect(taskHasRun).toBeFalsy(); // will not run until run() is invoked
        queue.run();
    });


    it("will run tasks according to their priority", (done) => {

        const log: Array<number> = [];

        const task1 = () => {
            log.push(1);      // Log that task 1 has run
            return BBPromise.resolve();
        };

        const task2 = () => {
            log.push(2);      // Log that task 2 has run
            return BBPromise.resolve();
        };

        const task3 = () => {
            log.push(3);      // Log that task 3 has run
            return BBPromise.resolve();
        };

        // Set pauseWhenDrained so tasks won't start running immediately.
        const queue = new TaskQueue(1, true);

        const t1Prom = queue.push(task1, 1);
        const t2Prom = queue.push(task2, 2);
        const t3Prom = queue.push(task3, 3);

        // Setup code that will check the results.
        BBPromise.all([t1Prom, t2Prom, t3Prom])
        .then(() => {
            expect(log).toEqual([3, 2, 1]);
            done();
        });

        // Let 'er rip!
        queue.run();
    });

});
