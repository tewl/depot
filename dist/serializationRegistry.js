"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var SerializationRegistry = /** @class */ (function () {
    // endregion
    function SerializationRegistry() {
        this._registeredClasses = {};
    }
    Object.defineProperty(SerializationRegistry.prototype, "numRegisteredClasses", {
        get: function () {
            return _.keys(this._registeredClasses).length;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Registers a class as one whose instances can be serialized and
     * deserialized
     * @param serializableClass - The class to register
     * @return A function that can be called to unregister
     */
    SerializationRegistry.prototype.register = function (serializableClass) {
        var _this = this;
        if (this._registeredClasses[serializableClass.type] !== undefined) {
            throw new Error("Serializable class already registered for type \"" + serializableClass.type + "\".");
        }
        this._registeredClasses[serializableClass.type] = serializableClass;
        // Return a function that can be used to unregister.
        return function () {
            // Remove the class from the container of registered classes.
            delete _this._registeredClasses[serializableClass.type];
        };
    };
    /**
     * Gets the class that has been registered for the specified type
     * @param type - The type string
     * @return The class associated with the specified type string
     */
    SerializationRegistry.prototype.getClass = function (type) {
        return this._registeredClasses[type];
    };
    return SerializationRegistry;
}());
exports.SerializationRegistry = SerializationRegistry;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJpYWxpemF0aW9uUmVnaXN0cnkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwwQkFBNEI7QUFJNUI7SUFRSSxZQUFZO0lBR1o7UUFFSSxJQUFJLENBQUMsa0JBQWtCLEdBQUcsRUFBRSxDQUFDO0lBQ2pDLENBQUM7SUFHRCxzQkFBVyx1REFBb0I7YUFBL0I7WUFFSSxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLGtCQUFrQixDQUFDLENBQUMsTUFBTSxDQUFDO1FBQ2xELENBQUM7OztPQUFBO0lBR0Q7Ozs7O09BS0c7SUFDSSx3Q0FBUSxHQUFmLFVBQWdCLGlCQUFzQztRQUF0RCxpQkFhQztRQVhHLElBQUksSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxLQUFLLFNBQVMsRUFBRTtZQUMvRCxNQUFNLElBQUksS0FBSyxDQUFDLHNEQUFtRCxpQkFBaUIsQ0FBQyxJQUFJLFFBQUksQ0FBQyxDQUFDO1NBQ2xHO1FBRUQsSUFBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLGlCQUFpQixDQUFDO1FBRXBFLG9EQUFvRDtRQUNwRCxPQUFPO1lBQ0gsNkRBQTZEO1lBQzdELE9BQU8sS0FBSSxDQUFDLGtCQUFrQixDQUFDLGlCQUFpQixDQUFDLElBQUksQ0FBQyxDQUFDO1FBQzNELENBQUMsQ0FBQztJQUNOLENBQUM7SUFHRDs7OztPQUlHO0lBQ0ksd0NBQVEsR0FBZixVQUFnQixJQUFZO1FBRXhCLE9BQU8sSUFBSSxDQUFDLGtCQUFrQixDQUFDLElBQUksQ0FBQyxDQUFDO0lBQ3pDLENBQUM7SUFDTCw0QkFBQztBQUFELENBdERBLEFBc0RDLElBQUE7QUF0RFksc0RBQXFCIiwiZmlsZSI6InNlcmlhbGl6YXRpb25SZWdpc3RyeS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0IHtJU2VyaWFsaXphYmxlU3RhdGljfSBmcm9tIFwiLi9zZXJpYWxpemF0aW9uXCI7XG5cblxuZXhwb3J0IGNsYXNzIFNlcmlhbGl6YXRpb25SZWdpc3RyeVxue1xuICAgIC8vIHJlZ2lvbiBJbnN0YW5jZSBEYXRhIE1lbWJlcnNcblxuICAgIC8vIEEgbWFwIG9mIHJlZ2lzdGVyZWQgY2xhc3Nlcy4gIFRoZSBrZXkgaXMgdGhlIHR5cGUgc3RyaW5nIGFuZCB0aGUgdmFsdWUgaXNcbiAgICAvLyB0aGUgY2xhc3MuXG4gICAgcHJpdmF0ZSByZWFkb25seSBfcmVnaXN0ZXJlZENsYXNzZXM6IHtbdHlwZTogc3RyaW5nXTogSVNlcmlhbGl6YWJsZVN0YXRpY307XG5cbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKClcbiAgICB7XG4gICAgICAgIHRoaXMuX3JlZ2lzdGVyZWRDbGFzc2VzID0ge307XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IG51bVJlZ2lzdGVyZWRDbGFzc2VzKCk6IG51bWJlclxuICAgIHtcbiAgICAgICAgcmV0dXJuIF8ua2V5cyh0aGlzLl9yZWdpc3RlcmVkQ2xhc3NlcykubGVuZ3RoO1xuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogUmVnaXN0ZXJzIGEgY2xhc3MgYXMgb25lIHdob3NlIGluc3RhbmNlcyBjYW4gYmUgc2VyaWFsaXplZCBhbmRcbiAgICAgKiBkZXNlcmlhbGl6ZWRcbiAgICAgKiBAcGFyYW0gc2VyaWFsaXphYmxlQ2xhc3MgLSBUaGUgY2xhc3MgdG8gcmVnaXN0ZXJcbiAgICAgKiBAcmV0dXJuIEEgZnVuY3Rpb24gdGhhdCBjYW4gYmUgY2FsbGVkIHRvIHVucmVnaXN0ZXJcbiAgICAgKi9cbiAgICBwdWJsaWMgcmVnaXN0ZXIoc2VyaWFsaXphYmxlQ2xhc3M6IElTZXJpYWxpemFibGVTdGF0aWMpOiAoKSA9PiB2b2lkXG4gICAge1xuICAgICAgICBpZiAodGhpcy5fcmVnaXN0ZXJlZENsYXNzZXNbc2VyaWFsaXphYmxlQ2xhc3MudHlwZV0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGhyb3cgbmV3IEVycm9yKGBTZXJpYWxpemFibGUgY2xhc3MgYWxyZWFkeSByZWdpc3RlcmVkIGZvciB0eXBlIFwiJHtzZXJpYWxpemFibGVDbGFzcy50eXBlfVwiLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5fcmVnaXN0ZXJlZENsYXNzZXNbc2VyaWFsaXphYmxlQ2xhc3MudHlwZV0gPSBzZXJpYWxpemFibGVDbGFzcztcblxuICAgICAgICAvLyBSZXR1cm4gYSBmdW5jdGlvbiB0aGF0IGNhbiBiZSB1c2VkIHRvIHVucmVnaXN0ZXIuXG4gICAgICAgIHJldHVybiAoKSA9PiB7XG4gICAgICAgICAgICAvLyBSZW1vdmUgdGhlIGNsYXNzIGZyb20gdGhlIGNvbnRhaW5lciBvZiByZWdpc3RlcmVkIGNsYXNzZXMuXG4gICAgICAgICAgICBkZWxldGUgdGhpcy5fcmVnaXN0ZXJlZENsYXNzZXNbc2VyaWFsaXphYmxlQ2xhc3MudHlwZV07XG4gICAgICAgIH07XG4gICAgfVxuXG5cbiAgICAvKipcbiAgICAgKiBHZXRzIHRoZSBjbGFzcyB0aGF0IGhhcyBiZWVuIHJlZ2lzdGVyZWQgZm9yIHRoZSBzcGVjaWZpZWQgdHlwZVxuICAgICAqIEBwYXJhbSB0eXBlIC0gVGhlIHR5cGUgc3RyaW5nXG4gICAgICogQHJldHVybiBUaGUgY2xhc3MgYXNzb2NpYXRlZCB3aXRoIHRoZSBzcGVjaWZpZWQgdHlwZSBzdHJpbmdcbiAgICAgKi9cbiAgICBwdWJsaWMgZ2V0Q2xhc3ModHlwZTogc3RyaW5nKTogdW5kZWZpbmVkIHwgSVNlcmlhbGl6YWJsZVN0YXRpY1xuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JlZ2lzdGVyZWRDbGFzc2VzW3R5cGVdO1xuICAgIH1cbn1cblxuIl19
