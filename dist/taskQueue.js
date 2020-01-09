"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
var BBPromise = require("bluebird");
var events_1 = require("events");
var priorityQueue_1 = require("./priorityQueue");
var deferred_1 = require("./deferred");
var TaskQueue = /** @class */ (function (_super) {
    __extends(TaskQueue, _super);
    // endregion
    /**
     * Creates a new TaskQueue instance.
     * @param numConcurrent - The maximum number of tasks that can be run
     *   concurrently.
     * @param pauseWhenDrained - Whether task execution should automatically
     *   stop when this queue is emptied.  New tasks added to the queue will not
     *   run automatically.
     * @return The new TaskQueue instance
     */
    function TaskQueue(numConcurrent, pauseWhenDrained) {
        if (pauseWhenDrained === void 0) { pauseWhenDrained = false; }
        var _this = _super.call(this) || this;
        // numConcurrent set to 0 does not make any sense.  We will assume that
        // the caller wants to allow maximum concurrency.
        if (numConcurrent === 0) {
            numConcurrent = undefined;
        }
        _this._numConcurrentTasks = numConcurrent;
        _this._tasks = new priorityQueue_1.PriorityQueue();
        _this._numRunning = 0;
        _this._isProcessingLastFulfillment = false;
        _this._isRunning = !Boolean(pauseWhenDrained);
        _this._pauseWhenDrained = Boolean(pauseWhenDrained);
        Object.seal(_this);
        return _this;
    }
    Object.defineProperty(TaskQueue.prototype, "length", {
        /**
         * Returns the number of pending tasks not yet started.
         * @returns The number of tasks yet to be started
         */
        get: function () {
            return this._tasks.length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Adds a new task to this TaskQueue
     * @param task - The new task to be added
     * @param priority - The priority that the task should run at.
     * @returns A promise that will be resolved or rejected once
     * the task eventually executes.
     */
    TaskQueue.prototype.push = function (task, priority) {
        if (priority === void 0) { priority = 0; }
        var dfd = new deferred_1.Deferred();
        this._tasks.push({ task: task, deferred: dfd }, priority);
        this.startTasks(true);
        return dfd.promise;
    };
    /**
     * Cancels all pending tasks that have not been started.
     * @param err - The error that pending tasks will reject with
     */
    TaskQueue.prototype.cancelAllPending = function (err) {
        err = err || new Error("Task cancelled because its TaskQueue was cancelled.");
        while (this._tasks.length > 0) {
            var curTask = this._tasks.pop();
            if (curTask) {
                curTask.deferred.reject(err);
            }
        }
    };
    /**
     * Returns a Promise that will be fulfilled (with undefined) the next time
     * this TaskQueue is completely drained.  A TaskQueue is considered
     * "drained" when all tasks have been completed and their fulfillment
     * handlers do not push any more tasks onto this TaskQueue.
     * @returns A Promise that will be fulfilled (with undefined) the next time
     * this TaskQueue is completely drained.
     */
    TaskQueue.prototype.drain = function () {
        var _this = this;
        // This TaskQueue is already drained if...
        if ((this._tasks.length === 0) && // there are no pending tasks
            (this._numRunning === 0) && // there are no tasks currently running
            (!this._isProcessingLastFulfillment) // we are not waiting for the last client fulfillment handler to run
        // (if this._isProcessingLastFulfillment is true
        // there will be a drained event fired in the future)
        ) {
            return BBPromise.resolve();
        }
        // Return a Promise that will be resolved when this TaskQueue eventually
        // drains.
        return new BBPromise(function (resolve) {
            _this.once(TaskQueue.EVENT_DRAINED, resolve);
        });
    };
    TaskQueue.prototype.run = function () {
        // Only start running if we are currently not running and there is a
        // task queued.
        if (!this._isRunning && (this._tasks.length > 0)) {
            this._isRunning = true;
            this.startTasks(false);
        }
    };
    TaskQueue.prototype.pause = function () {
        this._isRunning = false;
    };
    ////////////////////////////////////////////////////////////////////////////
    // Helper Methods
    ////////////////////////////////////////////////////////////////////////////
    /**
     * Helper function that starts executing queued tasks.
     */
    TaskQueue.prototype.startTasks = function (justAddedNewTask) {
        var _this = this;
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
                .then(function () {
                if (_this._isProcessingLastFulfillment) {
                    // console.log(`We are done and _numRunning is ${this._numRunning}`);
                    // We waited one more tick and no new tasks have been
                    // enqueued.  It is safe to say that this queue is now
                    // drained.
                    if (_this._pauseWhenDrained) {
                        _this.pause();
                    }
                    _this.emit(TaskQueue.EVENT_DRAINED);
                    _this._isProcessingLastFulfillment = false;
                }
            });
            return;
        }
        var _loop_1 = function () {
            // Run another task.
            var curTask = this_1._tasks.pop();
            if (curTask) {
                ++this_1._numRunning;
                curTask.task()
                    .then(function (value) {
                    curTask.deferred.resolve(value);
                    --_this._numRunning;
                    _this.startTasks(false);
                })
                    .catch(function (err) {
                    curTask.deferred.reject(err);
                    --_this._numRunning;
                    _this.startTasks(false);
                });
            }
        };
        var this_1 = this;
        while ((this._tasks.length > 0) && // While we have tasks to run and...
            this._isRunning && // ...we could be running more
            ((this._numConcurrentTasks === undefined) ||
                this._numRunning < this._numConcurrentTasks)) {
            _loop_1();
        }
    };
    // region Events
    TaskQueue.EVENT_DRAINED = "drained";
    return TaskQueue;
}(events_1.EventEmitter));
exports.TaskQueue = TaskQueue;
Object.freeze(TaskQueue.prototype);

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QyxTQUFTLENBQUMsU0FBUyxDQUFDLENBQUMiLCJmaWxlIjoidGFza1F1ZXVlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0IHtFdmVudEVtaXR0ZXJ9IGZyb20gXCJldmVudHNcIjtcbmltcG9ydCB7UHJpb3JpdHlRdWV1ZX0gZnJvbSBcIi4vcHJpb3JpdHlRdWV1ZVwiO1xuaW1wb3J0IHtUYXNrfSBmcm9tIFwiLi9wcm9taXNlSGVscGVyc1wiO1xuaW1wb3J0IHtEZWZlcnJlZH0gZnJvbSBcIi4vZGVmZXJyZWRcIjtcblxuXG5pbnRlcmZhY2UgSVRhc2tJbmZvPFJlc29sdmVUeXBlPiB7XG4gICAgdGFzazogVGFzazxSZXNvbHZlVHlwZT47XG4gICAgZGVmZXJyZWQ6IERlZmVycmVkPFJlc29sdmVUeXBlPjtcbn1cblxuXG5leHBvcnQgY2xhc3MgVGFza1F1ZXVlIGV4dGVuZHMgRXZlbnRFbWl0dGVyXG57XG4gICAgLy8gcmVnaW9uIEV2ZW50c1xuICAgIHB1YmxpYyBzdGF0aWMgRVZFTlRfRFJBSU5FRDogc3RyaW5nID0gXCJkcmFpbmVkXCI7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIC8vIHJlZ2lvbiBQcml2YXRlIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9udW1Db25jdXJyZW50VGFza3M6IG51bWJlciB8IHVuZGVmaW5lZDtcbiAgICBwcml2YXRlIF90YXNrczogUHJpb3JpdHlRdWV1ZTxJVGFza0luZm88YW55Pj47XG4gICAgcHJpdmF0ZSBfbnVtUnVubmluZzogbnVtYmVyO1xuICAgIHByaXZhdGUgX2lzUHJvY2Vzc2luZ0xhc3RGdWxmaWxsbWVudDogYm9vbGVhbjtcbiAgICBwcml2YXRlIF9pc1J1bm5pbmc6IGJvb2xlYW47XG4gICAgcHJpdmF0ZSByZWFkb25seSBfcGF1c2VXaGVuRHJhaW5lZDogYm9vbGVhbjtcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgLyoqXG4gICAgICogQ3JlYXRlcyBhIG5ldyBUYXNrUXVldWUgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIG51bUNvbmN1cnJlbnQgLSBUaGUgbWF4aW11bSBudW1iZXIgb2YgdGFza3MgdGhhdCBjYW4gYmUgcnVuXG4gICAgICogICBjb25jdXJyZW50bHkuXG4gICAgICogQHBhcmFtIHBhdXNlV2hlbkRyYWluZWQgLSBXaGV0aGVyIHRhc2sgZXhlY3V0aW9uIHNob3VsZCBhdXRvbWF0aWNhbGx5XG4gICAgICogICBzdG9wIHdoZW4gdGhpcyBxdWV1ZSBpcyBlbXB0aWVkLiAgTmV3IHRhc2tzIGFkZGVkIHRvIHRoZSBxdWV1ZSB3aWxsIG5vdFxuICAgICAqICAgcnVuIGF1dG9tYXRpY2FsbHkuXG4gICAgICogQHJldHVybiBUaGUgbmV3IFRhc2tRdWV1ZSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHB1YmxpYyBjb25zdHJ1Y3RvcihudW1Db25jdXJyZW50OiBudW1iZXIgfCB1bmRlZmluZWQsIHBhdXNlV2hlbkRyYWluZWQ6IGJvb2xlYW4gPSBmYWxzZSlcbiAgICB7XG4gICAgICAgIHN1cGVyKCk7XG5cbiAgICAgICAgLy8gbnVtQ29uY3VycmVudCBzZXQgdG8gMCBkb2VzIG5vdCBtYWtlIGFueSBzZW5zZS4gIFdlIHdpbGwgYXNzdW1lIHRoYXRcbiAgICAgICAgLy8gdGhlIGNhbGxlciB3YW50cyB0byBhbGxvdyBtYXhpbXVtIGNvbmN1cnJlbmN5LlxuICAgICAgICBpZiAobnVtQ29uY3VycmVudCA9PT0gMCkge1xuICAgICAgICAgICAgbnVtQ29uY3VycmVudCA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX251bUNvbmN1cnJlbnRUYXNrcyA9IG51bUNvbmN1cnJlbnQ7XG4gICAgICAgIHRoaXMuX3Rhc2tzID0gbmV3IFByaW9yaXR5UXVldWU8SVRhc2tJbmZvPGFueT4+KCk7XG4gICAgICAgIHRoaXMuX251bVJ1bm5pbmcgPSAwO1xuICAgICAgICB0aGlzLl9pc1Byb2Nlc3NpbmdMYXN0RnVsZmlsbG1lbnQgPSBmYWxzZTtcbiAgICAgICAgdGhpcy5faXNSdW5uaW5nID0gIUJvb2xlYW4ocGF1c2VXaGVuRHJhaW5lZCk7XG4gICAgICAgIHRoaXMuX3BhdXNlV2hlbkRyYWluZWQgPSBCb29sZWFuKHBhdXNlV2hlbkRyYWluZWQpO1xuXG4gICAgICAgIE9iamVjdC5zZWFsKHRoaXMpO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmV0dXJucyB0aGUgbnVtYmVyIG9mIHBlbmRpbmcgdGFza3Mgbm90IHlldCBzdGFydGVkLlxuICAgICAqIEByZXR1cm5zIFRoZSBudW1iZXIgb2YgdGFza3MgeWV0IHRvIGJlIHN0YXJ0ZWRcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0IGxlbmd0aCgpOiBudW1iZXJcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl90YXNrcy5sZW5ndGg7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgbmV3IHRhc2sgdG8gdGhpcyBUYXNrUXVldWVcbiAgICAgKiBAcGFyYW0gdGFzayAtIFRoZSBuZXcgdGFzayB0byBiZSBhZGRlZFxuICAgICAqIEBwYXJhbSBwcmlvcml0eSAtIFRoZSBwcmlvcml0eSB0aGF0IHRoZSB0YXNrIHNob3VsZCBydW4gYXQuXG4gICAgICogQHJldHVybnMgQSBwcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCBvciByZWplY3RlZCBvbmNlXG4gICAgICogdGhlIHRhc2sgZXZlbnR1YWxseSBleGVjdXRlcy5cbiAgICAgKi9cbiAgICBwdWJsaWMgcHVzaDxSZXNvbHZlVHlwZT4odGFzazogVGFzazxSZXNvbHZlVHlwZT4sIHByaW9yaXR5OiBudW1iZXIgPSAwKTogUHJvbWlzZTxSZXNvbHZlVHlwZT5cbiAgICB7XG4gICAgICAgIGNvbnN0IGRmZCA9IG5ldyBEZWZlcnJlZDxSZXNvbHZlVHlwZT4oKTtcbiAgICAgICAgdGhpcy5fdGFza3MucHVzaCh7dGFzazogdGFzaywgZGVmZXJyZWQ6IGRmZH0sIHByaW9yaXR5KTtcbiAgICAgICAgdGhpcy5zdGFydFRhc2tzKHRydWUpO1xuICAgICAgICByZXR1cm4gZGZkLnByb21pc2U7XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBDYW5jZWxzIGFsbCBwZW5kaW5nIHRhc2tzIHRoYXQgaGF2ZSBub3QgYmVlbiBzdGFydGVkLlxuICAgICAqIEBwYXJhbSBlcnIgLSBUaGUgZXJyb3IgdGhhdCBwZW5kaW5nIHRhc2tzIHdpbGwgcmVqZWN0IHdpdGhcbiAgICAgKi9cbiAgICBwdWJsaWMgY2FuY2VsQWxsUGVuZGluZyhlcnI/OiBhbnkpOiB2b2lkXG4gICAge1xuICAgICAgICBlcnIgPSBlcnIgfHwgbmV3IEVycm9yKFwiVGFzayBjYW5jZWxsZWQgYmVjYXVzZSBpdHMgVGFza1F1ZXVlIHdhcyBjYW5jZWxsZWQuXCIpO1xuXG4gICAgICAgIHdoaWxlICh0aGlzLl90YXNrcy5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICBjb25zdCBjdXJUYXNrID0gdGhpcy5fdGFza3MucG9wKCk7XG4gICAgICAgICAgICBpZiAoY3VyVGFzaykge1xuICAgICAgICAgICAgICAgIGN1clRhc2suZGVmZXJyZWQucmVqZWN0KGVycik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFJldHVybnMgYSBQcm9taXNlIHRoYXQgd2lsbCBiZSBmdWxmaWxsZWQgKHdpdGggdW5kZWZpbmVkKSB0aGUgbmV4dCB0aW1lXG4gICAgICogdGhpcyBUYXNrUXVldWUgaXMgY29tcGxldGVseSBkcmFpbmVkLiAgQSBUYXNrUXVldWUgaXMgY29uc2lkZXJlZFxuICAgICAqIFwiZHJhaW5lZFwiIHdoZW4gYWxsIHRhc2tzIGhhdmUgYmVlbiBjb21wbGV0ZWQgYW5kIHRoZWlyIGZ1bGZpbGxtZW50XG4gICAgICogaGFuZGxlcnMgZG8gbm90IHB1c2ggYW55IG1vcmUgdGFza3Mgb250byB0aGlzIFRhc2tRdWV1ZS5cbiAgICAgKiBAcmV0dXJucyBBIFByb21pc2UgdGhhdCB3aWxsIGJlIGZ1bGZpbGxlZCAod2l0aCB1bmRlZmluZWQpIHRoZSBuZXh0IHRpbWVcbiAgICAgKiB0aGlzIFRhc2tRdWV1ZSBpcyBjb21wbGV0ZWx5IGRyYWluZWQuXG4gICAgICovXG4gICAgcHVibGljIGRyYWluKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIC8vIFRoaXMgVGFza1F1ZXVlIGlzIGFscmVhZHkgZHJhaW5lZCBpZi4uLlxuICAgICAgICBpZiAoKHRoaXMuX3Rhc2tzLmxlbmd0aCA9PT0gMCkgJiYgICAgICAgICAvLyB0aGVyZSBhcmUgbm8gcGVuZGluZyB0YXNrc1xuICAgICAgICAgICAgKHRoaXMuX251bVJ1bm5pbmcgPT09IDApICYmICAgICAgICAgICAvLyB0aGVyZSBhcmUgbm8gdGFza3MgY3VycmVudGx5IHJ1bm5pbmdcbiAgICAgICAgICAgICghdGhpcy5faXNQcm9jZXNzaW5nTGFzdEZ1bGZpbGxtZW50KSAgLy8gd2UgYXJlIG5vdCB3YWl0aW5nIGZvciB0aGUgbGFzdCBjbGllbnQgZnVsZmlsbG1lbnQgaGFuZGxlciB0byBydW5cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8gKGlmIHRoaXMuX2lzUHJvY2Vzc2luZ0xhc3RGdWxmaWxsbWVudCBpcyB0cnVlXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vIHRoZXJlIHdpbGwgYmUgYSBkcmFpbmVkIGV2ZW50IGZpcmVkIGluIHRoZSBmdXR1cmUpXG4gICAgICAgICkge1xuICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZXNvbHZlKCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBSZXR1cm4gYSBQcm9taXNlIHRoYXQgd2lsbCBiZSByZXNvbHZlZCB3aGVuIHRoaXMgVGFza1F1ZXVlIGV2ZW50dWFsbHlcbiAgICAgICAgLy8gZHJhaW5zLlxuICAgICAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTx2b2lkPigocmVzb2x2ZTogKCkgPT4gdm9pZCkgPT4ge1xuICAgICAgICAgICAgdGhpcy5vbmNlKFRhc2tRdWV1ZS5FVkVOVF9EUkFJTkVELCByZXNvbHZlKTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcnVuKCk6IHZvaWRcbiAgICB7XG4gICAgICAgIC8vIE9ubHkgc3RhcnQgcnVubmluZyBpZiB3ZSBhcmUgY3VycmVudGx5IG5vdCBydW5uaW5nIGFuZCB0aGVyZSBpcyBhXG4gICAgICAgIC8vIHRhc2sgcXVldWVkLlxuICAgICAgICBpZiAoIXRoaXMuX2lzUnVubmluZyAmJiAodGhpcy5fdGFza3MubGVuZ3RoID4gMCkpXG4gICAgICAgIHtcbiAgICAgICAgICAgIHRoaXMuX2lzUnVubmluZyA9IHRydWU7XG4gICAgICAgICAgICB0aGlzLnN0YXJ0VGFza3MoZmFsc2UpO1xuICAgICAgICB9XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgcGF1c2UoKTogdm9pZFxuICAgIHtcbiAgICAgICAgdGhpcy5faXNSdW5uaW5nID0gZmFsc2U7XG4gICAgfVxuXG5cbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4gICAgLy8gSGVscGVyIE1ldGhvZHNcbiAgICAvLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbiAgICAvKipcbiAgICAgKiBIZWxwZXIgZnVuY3Rpb24gdGhhdCBzdGFydHMgZXhlY3V0aW5nIHF1ZXVlZCB0YXNrcy5cbiAgICAgKi9cbiAgICBwcml2YXRlIHN0YXJ0VGFza3MoanVzdEFkZGVkTmV3VGFzazogYm9vbGVhbik6IHZvaWRcbiAgICB7XG4gICAgICAgIGlmIChqdXN0QWRkZWROZXdUYXNrKSB7XG4gICAgICAgICAgICB0aGlzLl9pc1Byb2Nlc3NpbmdMYXN0RnVsZmlsbG1lbnQgPSBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0aGlzLl90YXNrcy5sZW5ndGggPT09IDAgJiYgdGhpcy5fbnVtUnVubmluZyA9PT0gMCkge1xuICAgICAgICAgICAgLy8gVGhlIHF1ZXVlIG9mIHRhc2tzIGlzIGVtcHR5LiAgQXNzdW1lIHRoYXQgd2UgYXJlIHJ1bm5pbmcgdGhlIGxhc3RcbiAgICAgICAgICAgIC8vIGZ1bGZpbGxtZW50IGhhbmRsZXIgYW5kIHdhaXQgb25lIG1vcmUgdGljayB0byBzZWUgaWYgYW55IG5ld1xuICAgICAgICAgICAgLy8gdGFza3MgZ2V0IGVucXVldWVkLiAgSWYgdGhlIGxhc3QgZnVsZmlsbG1lbnQgaGFuZGxlciBlbnF1ZXVlcyBhXG4gICAgICAgICAgICAvLyBuZXcgdGFzaywgdGhpc19pc1Byb2Nlc3NpbmdMYXN0RnVsZmlsbG1lbnQgd2lsbCBiZSBzZXQgdG8gZmFsc2UuXG4gICAgICAgICAgICB0aGlzLl9pc1Byb2Nlc3NpbmdMYXN0RnVsZmlsbG1lbnQgPSB0cnVlO1xuICAgICAgICAgICAgLy8gY29uc29sZS5sb2coXCJMb29rcyBsaWtlIHdlIG1pZ2h0IGJlIGRvbmUuICBXYWl0aW5nIDEgdGljay5cIik7XG5cbiAgICAgICAgICAgIEJCUHJvbWlzZS5yZXNvbHZlKClcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgICAgICAgICBpZiAodGhpcy5faXNQcm9jZXNzaW5nTGFzdEZ1bGZpbGxtZW50KSB7XG4gICAgICAgICAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKGBXZSBhcmUgZG9uZSBhbmQgX251bVJ1bm5pbmcgaXMgJHt0aGlzLl9udW1SdW5uaW5nfWApO1xuXG4gICAgICAgICAgICAgICAgICAgIC8vIFdlIHdhaXRlZCBvbmUgbW9yZSB0aWNrIGFuZCBubyBuZXcgdGFza3MgaGF2ZSBiZWVuXG4gICAgICAgICAgICAgICAgICAgIC8vIGVucXVldWVkLiAgSXQgaXMgc2FmZSB0byBzYXkgdGhhdCB0aGlzIHF1ZXVlIGlzIG5vd1xuICAgICAgICAgICAgICAgICAgICAvLyBkcmFpbmVkLlxuICAgICAgICAgICAgICAgICAgICBpZiAodGhpcy5fcGF1c2VXaGVuRHJhaW5lZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy5wYXVzZSgpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuZW1pdChUYXNrUXVldWUuRVZFTlRfRFJBSU5FRCk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMuX2lzUHJvY2Vzc2luZ0xhc3RGdWxmaWxsbWVudCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB3aGlsZSAoXG4gICAgICAgICAgICAodGhpcy5fdGFza3MubGVuZ3RoID4gMCkgJiYgICAgICAgICAgICAgICAgIC8vIFdoaWxlIHdlIGhhdmUgdGFza3MgdG8gcnVuIGFuZC4uLlxuICAgICAgICAgICAgdGhpcy5faXNSdW5uaW5nICAgICAgICAgICYmICAgICAgICAgICAgICAgICAvLyAuLi53ZSBjb3VsZCBiZSBydW5uaW5nIG1vcmVcbiAgICAgICAgICAgIChcbiAgICAgICAgICAgICAgICAodGhpcy5fbnVtQ29uY3VycmVudFRhc2tzID09PSB1bmRlZmluZWQpIHx8XG4gICAgICAgICAgICAgICAgdGhpcy5fbnVtUnVubmluZyA8IHRoaXMuX251bUNvbmN1cnJlbnRUYXNrc1xuICAgICAgICAgICAgKVxuICAgICAgICApXG4gICAgICAgIHtcbiAgICAgICAgICAgIC8vIFJ1biBhbm90aGVyIHRhc2suXG4gICAgICAgICAgICBjb25zdCBjdXJUYXNrOiBJVGFza0luZm88YW55PiB8IHVuZGVmaW5lZCA9IHRoaXMuX3Rhc2tzLnBvcCgpO1xuXG4gICAgICAgICAgICBpZiAoY3VyVGFzaykge1xuICAgICAgICAgICAgICAgICsrdGhpcy5fbnVtUnVubmluZztcbiAgICAgICAgICAgICAgICBjdXJUYXNrLnRhc2soKVxuICAgICAgICAgICAgICAgIC50aGVuKCh2YWx1ZTogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgICAgIGN1clRhc2suZGVmZXJyZWQucmVzb2x2ZSh2YWx1ZSk7XG4gICAgICAgICAgICAgICAgICAgIC0tdGhpcy5fbnVtUnVubmluZztcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zdGFydFRhc2tzKGZhbHNlKTtcbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIC5jYXRjaCgoZXJyOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgY3VyVGFzay5kZWZlcnJlZC5yZWplY3QoZXJyKTtcbiAgICAgICAgICAgICAgICAgICAgLS10aGlzLl9udW1SdW5uaW5nO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnN0YXJ0VGFza3MoZmFsc2UpO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG59XG5cblxuT2JqZWN0LmZyZWV6ZShUYXNrUXVldWUucHJvdG90eXBlKTtcbiJdfQ==
