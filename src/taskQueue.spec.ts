import {EventEmitter} from "events";
import {Task, getTimerPromise} from "./promiseHelpers";
import {allSettled} from "./promiseHelpersLegacy";
import {TaskQueue} from "./taskQueue";
import {Deferred} from "./deferred";


interface ITaskInfo<TResolve> {
    task: Task<TResolve>;
    deferred: Deferred<TResolve>;
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
function createTask<TResolve>(): ITaskInfo<TResolve>
{
    const dfd = new Deferred<TResolve>();

    // Create a task that will return the Promise we just created (which is
    // controlled by the deferred's resolve() and reject()).
    const theTask = () => {
        // Uncomment the following lines to assist debugging.
        // const msg = name ? `Running task ${name}.` : "Running task.";
        // console.log(msg);
        return dfd.promise;
    };

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
function createTimerTask<TResolve>(
    delayMs: number,
    resolveValue: TResolve
): Task<TResolve>
{
    const theTask = (): Promise<TResolve> => {
        return getTimerPromise<TResolve>(delayMs, resolveValue);
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
        let numDrainedEvents = 0;
        const queue: TaskQueue = new TaskQueue(1);

        queue.on(TaskQueue.eventNameDrained, () => {
            numDrainedEvents++;
        });

        const taskInfo1 = createTask<number>();
        const taskInfo2 = createTask<number>();
        queue.push(taskInfo1.task)
        .then(() => {
            // The drained event should not have fired, because handlers should
            // have the opportunity to queue more work.  If they do, the queue
            // should not emit the drained event.
            expect(numDrainedEvents).toEqual(0);

            getTimerPromise(10, 5)
            .then(() => taskInfo2.deferred.resolve(2));

            return queue.push(taskInfo2.task);
        })
        .then(() => {
            // Again, the drained event should not have fired, because this
            // handler has the ability to queue more work.
            expect(numDrainedEvents).toEqual(0);

            // Once this handler returns without queuing more work, the drained
            // event should fire.
        })
        .then(() => {
            expect(numDrainedEvents).toEqual(1);
            done();
        });

        taskInfo1.deferred.resolve(1);
    });


    it("will not emit a drained event if the last task's fulfillment handler enqueues more work", (done) => {

        // Setup a TaskQueue and a means to tell whether the "drained" event has
        // been emitted.
        const queue = new TaskQueue(1);
        let numDrainedEvents = 0;
        queue.on(TaskQueue.eventNameDrained, () => {
            numDrainedEvents++;
        });

        const task1 = createTimerTask(200, undefined);
        const task2 = createTimerTask(200, undefined);

        queue.push(task1)
        .then(() => {
            // task1 is now complete.  The client should always be given the
            // opportunity to enqueue more work (before the TaskQueue can
            // officially say that it has been drained).  So we will queue task2
            // and make sure that the drained event is not fired.
            expect(numDrainedEvents).toEqual(0);
            return queue.push(task2);
        })
        .then(() => {
            // task2 is now complete and the client should be given yet another
            // opportunity to queue more work (before the TaskQueue can
            // officailly say that it has been drained).  This time, we will not
            // queue more work.
            expect(numDrainedEvents).toEqual(0);

            // Once we return from this handler without queuing more work, the
            // drained event should fire.
        })
        .then(() => {
            expect(numDrainedEvents).toEqual(1);
            done();
        });

    });


    it("drain() will return a Promise that is fulfilled when the TaskQueue is emptied", (done) => {
        const queue = new TaskQueue(1);
        let numDrainedEvents = 0;
        queue.on(TaskQueue.eventNameDrained, () => {
            numDrainedEvents++;
        });

        let t1HasResolved = false;
        let t2HasResolved = false;
        let t3HasResolved = false;

        const task1: Task<boolean> = () => {
            return getTimerPromise(10, undefined)
            .then(() => (t1HasResolved = true));
        };

        const task2: Task<boolean> = () => {
            return getTimerPromise(10, undefined)
            .then(() => (t2HasResolved = true));
        };

        const task3: Task<boolean> = () => {
            return getTimerPromise(10, undefined)
            .then(() => (t3HasResolved = true));
        };

        queue.push(task1)
        .then(() => {
            return queue.push(task2);
        })
        .then(() => {
            return queue.push(task3);
        });

        queue.drain()
        .then(() => {
            expect(t1HasResolved).toBeTruthy();
            expect(t2HasResolved).toBeTruthy();
            expect(t3HasResolved).toBeTruthy();
            expect(numDrainedEvents).toEqual(1);
            done();
        });
    });


    it("cancelAllPending() will cancel pending tasks with the specified error", (done) => {
        const queue: TaskQueue = new TaskQueue(1);

        const t1 = createTimerTask(50, 1);
        const t2 = createTimerTask(50, 2);

        let t1Value: number | undefined;
        let t1Error: Error  | undefined;
        let t2Value: number | undefined;
        let t2Error: Error  | undefined;

        const t1Prom = queue.push(t1)
        .then(
            (val) => (t1Value = val),
            (err) => (t1Error = err)
        );

        const t2Prom = queue.push(t2)
        .then(
            (val) => (t2Value = val),
            (err) => (t2Error = err)
        );

        // Cancel the tasks before they have a chance to complete.
        // Only task1 should have had a chance to start.
        queue.cancelAllPending(new Error("queue is cancelled"));

        allSettled([t1Prom, t2Prom])
        .then(() => {
            // In-progress tasks should complete normally and return their
            // normal value.
            expect(t1Value).toEqual(1);
            expect(t1Error).toEqual(undefined);

            // Pending tasks should be rejected with the specified Error.
            expect(t2Value).toEqual(undefined);
            expect(t2Error).toBeDefined();
            expect(t2Error!.message).toEqual("queue is cancelled");

            done();
        });
    });


    it("cancelAllPending() will cancel pending tasks with the default error if not specified", (done) => {
        const queue: TaskQueue = new TaskQueue(1);

        const t1 = createTimerTask(50, 1);
        const t2 = createTimerTask(50, 2);

        let t1Value: number | undefined;
        let t1Error: Error | undefined;
        let t2Value: number | undefined;
        let t2Error: Error | undefined;

        const t1Prom = queue.push(t1)
        .then(
            (val) => (t1Value = val),
            (err) => (t1Error = err)
        );

        const t2Prom = queue.push(t2)
        .then(
            (val) => (t2Value = val),
            (err) => (t2Error = err)
        );

        // Cancel the tasks before they have a chance to complete.
        // Only task1 should have had a chance to start.
        queue.cancelAllPending();

        allSettled([t1Prom, t2Prom])
        .then(() => {
            // In-progress tasks should complete normally and return their
            // normal value.
            expect(t1Value).toEqual(1);
            expect(t1Error).toEqual(undefined);

            // Pending tasks should be rejected with the specified Error.
            expect(t2Value).toEqual(undefined);
            expect(t2Error).toBeDefined();
            expect(t2Error!.message).toEqual("Task cancelled because its TaskQueue was cancelled.");

            done();
        });
    });


    it("will start paused when configured to pause when drained", () => {
        const queue = new TaskQueue(1, true);
        let taskHasRun = false;

        const task = (): Promise<number> => {
            taskHasRun = true;
            return Promise.resolve(1);
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
        let taskHasRun = false;
        const task = (): Promise<void> => {
            taskHasRun = true;
            return Promise.resolve();
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
            return Promise.resolve();
        };

        const task2 = () => {
            log.push(2);      // Log that task 2 has run
            return Promise.resolve();
        };

        const task3 = () => {
            log.push(3);      // Log that task 3 has run
            return Promise.resolve();
        };

        // Set pauseWhenDrained so tasks won't start running immediately.
        const queue = new TaskQueue(1, true);

        const t1Prom = queue.push(task1, 1);
        const t2Prom = queue.push(task2, 2);
        const t3Prom = queue.push(task3, 3);

        // Setup code that will check the results.
        Promise.all([t1Prom, t2Prom, t3Prom])
        .then(() => {
            expect(log).toEqual([3, 2, 1]);
            done();
        });

        // Let 'er rip!
        queue.run();
    });

});
