import {EventEmitter} from "events";
import {ListenerTracker} from "./listenerTracker";


describe("ListenerTracker", () => {

    it("on() will register for the specified event using on()", () => {
        const ee      = new EventEmitter();
        const tracker = new ListenerTracker(ee);

        let listener1Count = 0;
        let listener2Count = 0;

        tracker.on("event-a", () => { listener1Count++; });
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(1);
        tracker.on("event-a", () => { listener2Count++; });
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(2);

        ee.emit("event-b");
        expect(listener1Count).toEqual(0);
        expect(listener2Count).toEqual(0);

        ee.emit("event-a");
        expect(listener1Count).toEqual(1);
        expect(listener2Count).toEqual(1);

        ee.emit("event-a");
        expect(listener1Count).toEqual(2);
        expect(listener2Count).toEqual(2);
    });


    it("once() will register for the specified event using once()", () => {
        const ee = new EventEmitter();
        const tracker = new ListenerTracker(ee);

        let listener1Count = 0;
        let listener2Count = 0;

        tracker.once("event-a", () => { listener1Count++; });
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(1);
        tracker.once("event-a", () => { listener2Count++; });
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(2);

        ee.emit("event-b");
        expect(listener1Count).toEqual(0);
        expect(listener2Count).toEqual(0);

        ee.emit("event-a");
        expect(listener1Count).toEqual(1);
        expect(listener2Count).toEqual(1);
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(0);

        ee.emit("event-a");
        expect(listener1Count).toEqual(1);
        expect(listener2Count).toEqual(1);
    });


    it("removeAll() will remove all listeners", () => {
        const ee = new EventEmitter();
        const tracker = new ListenerTracker(ee);

        tracker.on("event-a", () => {});
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(1);

        tracker.on("event-a", () => {});
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(2);

        tracker.once("event-a", () => {});
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(3);

        tracker.once("event-a", () => {});
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(4);

        tracker.removeAll();
        expect(EventEmitter.listenerCount(ee, "event-a")).toEqual(0);
    });


});
