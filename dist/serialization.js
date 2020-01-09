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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var BBPromise = require("bluebird");
var promiseHelpers_1 = require("./promiseHelpers");
var uuid_1 = require("./uuid");
////////////////////////////////////////////////////////////////////////////////
// Helper Functions
////////////////////////////////////////////////////////////////////////////////
function createId(prefix) {
    var timeMs = Date.now();
    var uuid = uuid_1.generateUuid();
    return prefix + "_" + timeMs + "_" + uuid;
}
exports.createId = createId;
function isISerializable(obj) {
    return _.isString(obj.id) &&
        _.isFunction(obj.serialize) &&
        _.isFunction(obj.constructor.deserialize);
}
exports.isISerializable = isISerializable;
function isISerializableWithStow(obj) {
    return isISerializable(obj) &&
        // FUTURE: The following is pretty bogus.  Just because __stow is not
        //   undefined does not mean that it is of type StowType.  Fix this
        //   in the future.
        obj.__stow !== undefined;
}
exports.isISerializableWithStow = isISerializableWithStow;
////////////////////////////////////////////////////////////////////////////////
//
// AStore
//
// Abstract base class for backing stores .  Knows how to follow graphs of
// objects when serializing and deserializing and how to manage stowed data.
// Defines abstract methods that derived classes must implement to read and
// write data in a manner that is specific to each backing store.
//
////////////////////////////////////////////////////////////////////////////////
// tslint:disable-next-line: max-classes-per-file
var AStore = /** @class */ (function () {
    // endregion
    function AStore(registry) {
        this._registry = registry;
    }
    AStore.prototype.load = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var deserializedSoFar, completionFuncs, deserialized, promises;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        deserializedSoFar = {};
                        completionFuncs = [];
                        return [4 /*yield*/, this.doFirstPassDeserialize(id, deserializedSoFar, completionFuncs)];
                    case 1:
                        deserialized = _a.sent();
                        promises = _.map(completionFuncs, function (curCompletionFunc) {
                            // Wrap the return value from each completion function in a promise
                            // in the event the function returns void instead of Promise<void>.
                            return BBPromise.resolve(curCompletionFunc(deserializedSoFar));
                        });
                        return [4 /*yield*/, BBPromise.all(promises)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, {
                                obj: deserialized,
                                allObjects: deserializedSoFar
                            }];
                }
            });
        });
    };
    AStore.prototype.save = function (obj) {
        return __awaiter(this, void 0, void 0, function () {
            var alreadySerialized, needToSerialize;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        alreadySerialized = {};
                        needToSerialize = [obj];
                        return [4 /*yield*/, promiseHelpers_1.promiseWhile(function () { return needToSerialize.length > 0; }, function () { return __awaiter(_this, void 0, void 0, function () {
                                var curObj, serializeResult, stow, putPromise, putResult, objWithStow;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            curObj = needToSerialize.shift();
                                            // Note: We could perform a sanity check here to make sure that
                                            // the object being serialized is registered with
                                            // `this._registry` so that it could eventually be deserialized
                                            // (registration is only needed for the deserialization
                                            // process).  I have decided, however, not to perform this
                                            // check, because it would be artificially limiting.  There
                                            // could, for example, be a tool that only saved models and
                                            // never tried to read them.
                                            // Check to see if the object has already been serialized.  If
                                            // so, do nothing.
                                            if (alreadySerialized[curObj.id] !== undefined) {
                                                return [2 /*return*/];
                                            }
                                            serializeResult = curObj.serialize();
                                            stow = isISerializableWithStow(curObj) ? curObj.__stow : undefined;
                                            putPromise = this.put(serializeResult.serialized, stow);
                                            // If other objects need to be serialized, queue them up.
                                            while (serializeResult.othersToSerialize && serializeResult.othersToSerialize.length > 0) {
                                                needToSerialize.push(serializeResult.othersToSerialize.shift());
                                            }
                                            return [4 /*yield*/, putPromise];
                                        case 1:
                                            putResult = _a.sent();
                                            objWithStow = curObj;
                                            objWithStow.__stow = putResult.stow;
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * A helper method that recursively performs a first pass deserialization of
     * the specified object.  In the first pass, each object is responsible for
     * instantiating itself and setting its state.  If any references to other
     * objects exist, one or more completion functions should be returned that
     * will be run during the second pass.  The completion functions should set
     * references to other objects during this second phase, since that is when
     * all objects are guaranteed to exist.
     * @param id - The id of the object to perform first pass deserialization on
     * @param deserializedSoFar - A map of all objects deserialized thus far.
     *   Used to detect whether an object has already undergone first pass
     *   deserialization.
     * @param completionFuncs - Additional work that needs to be done (during
     *   the second pass) to set inter-object cross references.
     * @return The results of the first pass deserialization, which is an
     *   ISerializable that has its owned state set, but has not yet set
     *   references to other objects.
     */
    AStore.prototype.doFirstPassDeserialize = function (id, deserializedSoFar, completionFuncs) {
        return __awaiter(this, void 0, void 0, function () {
            var getResult, serialized, foundClass, deserializeResult, deserialized, objWithStow, completionFunc, tasks;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        // If the id being requested already appears in the dictionary of object
                        // that have undergone a first pass deserialization, then return
                        // immediately.
                        if (deserializedSoFar[id] !== undefined) {
                            return [2 /*return*/, deserializedSoFar[id]];
                        }
                        return [4 /*yield*/, this.get(id)];
                    case 1:
                        getResult = _a.sent();
                        serialized = getResult.serialized;
                        foundClass = this._registry.getClass(serialized.type);
                        if (!foundClass) {
                            throw new Error("No class registered for type \"" + serialized.type + "\".");
                        }
                        deserializeResult = foundClass.deserialize(serialized);
                        deserialized = deserializeResult.deserializedObj;
                        // Add the object to the map of objects that we have deserialized.
                        deserializedSoFar[deserialized.id] = deserialized;
                        objWithStow = deserialized;
                        objWithStow.__stow = getResult.stow;
                        // If needed, update the list of completion functions that need to be run.
                        while (deserializeResult.completionFuncs && deserializeResult.completionFuncs.length > 0) {
                            completionFunc = deserializeResult.completionFuncs.shift();
                            completionFuncs.push(completionFunc);
                        }
                        if (!deserializeResult.neededIds) return [3 /*break*/, 3];
                        tasks = _.map(deserializeResult.neededIds, function (curNeededId) {
                            return function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, this.doFirstPassDeserialize(curNeededId, deserializedSoFar, completionFuncs)];
                                });
                            }); };
                        });
                        return [4 /*yield*/, promiseHelpers_1.sequence(tasks, undefined)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3: return [2 /*return*/, deserialized];
                }
            });
        });
    };
    return AStore;
}());
exports.AStore = AStore;
// tslint:disable-next-line: max-classes-per-file
var MemoryStore = /** @class */ (function (_super) {
    __extends(MemoryStore, _super);
    // endregion
    function MemoryStore(registry) {
        var _this = _super.call(this, registry) || this;
        _this._store = {};
        return _this;
    }
    MemoryStore.create = function (registry) {
        var instance = new MemoryStore(registry);
        return BBPromise.resolve(instance);
    };
    MemoryStore.prototype.getIds = function (regexp) {
        return __awaiter(this, void 0, void 0, function () {
            var ids;
            return __generator(this, function (_a) {
                ids = _.keys(this._store);
                if (regexp === undefined) {
                    return [2 /*return*/, ids];
                }
                // A regular express has been specified, so filter for the ids that
                // match.
                ids = _.filter(ids, function (curId) { return regexp.test(curId); });
                return [2 /*return*/, ids];
            });
        });
    };
    MemoryStore.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var serialized;
            return __generator(this, function (_a) {
                serialized = this._store[id];
                // Transform the backing store's representation into an ISerialized.
                // This is not needed for MemoryStore, because it stores the data as
                // an ISerialized.
                // There is no stowed data for MemoryStore.
                return [2 /*return*/, { serialized: serialized, stow: {} }];
            });
        });
    };
    MemoryStore.prototype.put = function (serialized, stow) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Transform `serialized` into the backing store's representation.
                // This is not needed for MemoryStore, because it stores the data as
                // an ISerialized.
                // Write the data to the backing store.
                this._store[serialized.id] = serialized;
                // Return the new stow data that should be placed on the original
                // object. This is not needed for MemoryStore.
                return [2 /*return*/, { stow: {} }];
            });
        });
    };
    return MemoryStore;
}(AStore));
exports.MemoryStore = MemoryStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZXJpYWxpemF0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMEJBQTRCO0FBQzVCLG9DQUFzQztBQUN0QyxtREFBd0Q7QUFDeEQsK0JBQW9DO0FBSXBDLGdGQUFnRjtBQUNoRixtQkFBbUI7QUFDbkIsZ0ZBQWdGO0FBRWhGLFNBQWdCLFFBQVEsQ0FBQyxNQUFjO0lBRW5DLElBQU0sTUFBTSxHQUFHLElBQUksQ0FBQyxHQUFHLEVBQUUsQ0FBQztJQUMxQixJQUFNLElBQUksR0FBRyxtQkFBWSxFQUFFLENBQUM7SUFDNUIsT0FBVSxNQUFNLFNBQUksTUFBTSxTQUFJLElBQU0sQ0FBQztBQUN6QyxDQUFDO0FBTEQsNEJBS0M7QUFtRkQsU0FBZ0IsZUFBZSxDQUFDLEdBQVE7SUFFcEMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbEIsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxHQUFHLENBQUMsU0FBUyxDQUFDO1FBQzNCLENBQUMsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLFdBQVcsQ0FBQyxXQUFXLENBQUMsQ0FBQztBQUNyRCxDQUFDO0FBTEQsMENBS0M7QUFRRCxTQUFnQix1QkFBdUIsQ0FBVyxHQUFRO0lBRXRELE9BQU8sZUFBZSxDQUFDLEdBQUcsQ0FBQztRQUNwQixxRUFBcUU7UUFDckUsbUVBQW1FO1FBQ25FLG1CQUFtQjtRQUNsQixHQUFXLENBQUMsTUFBTSxLQUFLLFNBQVMsQ0FBQztBQUM3QyxDQUFDO0FBUEQsMERBT0M7QUEyQ0QsZ0ZBQWdGO0FBQ2hGLEVBQUU7QUFDRixTQUFTO0FBQ1QsRUFBRTtBQUNGLDBFQUEwRTtBQUMxRSw0RUFBNEU7QUFDNUUsMkVBQTJFO0FBQzNFLGlFQUFpRTtBQUNqRSxFQUFFO0FBQ0YsZ0ZBQWdGO0FBRWhGLGlEQUFpRDtBQUNqRDtJQUlJLFlBQVk7SUFHWixnQkFBc0IsUUFBK0I7UUFFakQsSUFBSSxDQUFDLFNBQVMsR0FBRyxRQUFRLENBQUM7SUFDOUIsQ0FBQztJQUtZLHFCQUFJLEdBQWpCLFVBQTJDLEVBQVk7Ozs7Ozt3QkFJN0MsaUJBQWlCLEdBQXFCLEVBQUUsQ0FBQzt3QkFHekMsZUFBZSxHQUFpQyxFQUFFLENBQUM7d0JBR3BDLHFCQUFNLElBQUksQ0FBQyxzQkFBc0IsQ0FBQyxFQUFFLEVBQUUsaUJBQWlCLEVBQUUsZUFBZSxDQUFDLEVBQUE7O3dCQUF4RixZQUFZLEdBQUcsU0FBeUU7d0JBSXhGLFFBQVEsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLGVBQWUsRUFBRSxVQUFDLGlCQUFpQjs0QkFDdEQsbUVBQW1FOzRCQUNuRSxtRUFBbUU7NEJBQ25FLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQyxpQkFBaUIsQ0FBQyxDQUFDLENBQUM7d0JBQ25FLENBQUMsQ0FBQyxDQUFDO3dCQUNILHFCQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUMsUUFBUSxDQUFDLEVBQUE7O3dCQUE3QixTQUE2QixDQUFDO3dCQUU5QixzQkFBTztnQ0FDSCxHQUFHLEVBQUUsWUFBaUI7Z0NBQ3RCLFVBQVUsRUFBRSxpQkFBaUI7NkJBQ2hDLEVBQUM7Ozs7S0FDTDtJQUdZLHFCQUFJLEdBQWpCLFVBQWtCLEdBQWtCOzs7Ozs7O3dCQUUxQixpQkFBaUIsR0FBcUIsRUFBRSxDQUFDO3dCQUN6QyxlQUFlLEdBQXlCLENBQUMsR0FBRyxDQUFDLENBQUM7d0JBRXBELHFCQUFNLDZCQUFZLENBQ2QsY0FBTSxPQUFBLGVBQWUsQ0FBQyxNQUFNLEdBQUcsQ0FBQyxFQUExQixDQUEwQixFQUNoQzs7Ozs7NENBQ1UsTUFBTSxHQUFHLGVBQWUsQ0FBQyxLQUFLLEVBQUcsQ0FBQzs0Q0FFeEMsK0RBQStEOzRDQUMvRCxpREFBaUQ7NENBQ2pELCtEQUErRDs0Q0FDL0QsdURBQXVEOzRDQUN2RCwwREFBMEQ7NENBQzFELDJEQUEyRDs0Q0FDM0QsMkRBQTJEOzRDQUMzRCw0QkFBNEI7NENBRTVCLDhEQUE4RDs0Q0FDOUQsa0JBQWtCOzRDQUNsQixJQUFJLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxFQUFFLENBQUMsS0FBSyxTQUFTLEVBQUU7Z0RBQzVDLHNCQUFPOzZDQUNWOzRDQUVLLGVBQWUsR0FBRyxNQUFNLENBQUMsU0FBUyxFQUFFLENBQUM7NENBQ3JDLElBQUksR0FBeUIsdUJBQXVCLENBQVcsTUFBTSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFNBQVMsQ0FBQzs0Q0FFbkcsVUFBVSxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLFVBQVUsRUFBRSxJQUFJLENBQUMsQ0FBQzs0Q0FFOUQseURBQXlEOzRDQUN6RCxPQUFPLGVBQWUsQ0FBQyxpQkFBaUIsSUFBSSxlQUFlLENBQUMsaUJBQWlCLENBQUMsTUFBTSxHQUFHLENBQUMsRUFBRTtnREFDdEYsZUFBZSxDQUFDLElBQUksQ0FBQyxlQUFlLENBQUMsaUJBQWlCLENBQUMsS0FBSyxFQUFHLENBQUMsQ0FBQzs2Q0FDcEU7NENBR2lCLHFCQUFNLFVBQVUsRUFBQTs7NENBQTVCLFNBQVMsR0FBRyxTQUFnQjs0Q0FHNUIsV0FBVyxHQUFHLE1BQXlDLENBQUM7NENBQzlELFdBQVcsQ0FBQyxNQUFNLEdBQUcsU0FBUyxDQUFDLElBQUksQ0FBQzs7OztpQ0FDdkMsQ0FDSixFQUFBOzt3QkFyQ0QsU0FxQ0MsQ0FBQzs7Ozs7S0FLTDtJQXVCRDs7Ozs7Ozs7Ozs7Ozs7Ozs7T0FpQkc7SUFDVyx1Q0FBc0IsR0FBcEMsVUFDSSxFQUFVLEVBQ1YsaUJBQW1DLEVBQ25DLGVBQTZDOzs7Ozs7O3dCQUc3Qyx3RUFBd0U7d0JBQ3hFLGdFQUFnRTt3QkFDaEUsZUFBZTt3QkFDZixJQUFJLGlCQUFpQixDQUFDLEVBQUUsQ0FBQyxLQUFLLFNBQVMsRUFBRTs0QkFDckMsc0JBQU8saUJBQWlCLENBQUMsRUFBRSxDQUFDLEVBQUM7eUJBQ2hDO3dCQUU0QyxxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFBOzt3QkFBekQsU0FBUyxHQUE4QixTQUFrQjt3QkFDekQsVUFBVSxHQUFHLFNBQVMsQ0FBQyxVQUFVLENBQUM7d0JBRWxDLFVBQVUsR0FBRyxJQUFJLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsSUFBSSxDQUFDLENBQUM7d0JBQzVELElBQUksQ0FBQyxVQUFVLEVBQUU7NEJBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxvQ0FBaUMsVUFBVSxDQUFDLElBQUksUUFBSSxDQUFDLENBQUM7eUJBQ3pFO3dCQUVLLGlCQUFpQixHQUFHLFVBQVUsQ0FBQyxXQUFXLENBQUMsVUFBVSxDQUFDLENBQUM7d0JBR3ZELFlBQVksR0FBa0IsaUJBQWlCLENBQUMsZUFBZSxDQUFDO3dCQUN0RSxrRUFBa0U7d0JBQ2xFLGlCQUFpQixDQUFDLFlBQVksQ0FBQyxFQUFFLENBQUMsR0FBRyxZQUFZLENBQUM7d0JBRzVDLFdBQVcsR0FBRyxZQUErQyxDQUFDO3dCQUNwRSxXQUFXLENBQUMsTUFBTSxHQUFHLFNBQVMsQ0FBQyxJQUFJLENBQUM7d0JBRXBDLDBFQUEwRTt3QkFDMUUsT0FBTyxpQkFBaUIsQ0FBQyxlQUFlLElBQUksaUJBQWlCLENBQUMsZUFBZSxDQUFDLE1BQU0sR0FBRyxDQUFDLEVBQUU7NEJBQ2hGLGNBQWMsR0FBRyxpQkFBaUIsQ0FBQyxlQUFlLENBQUMsS0FBSyxFQUFHLENBQUM7NEJBQ2xFLGVBQWUsQ0FBQyxJQUFJLENBQUMsY0FBYyxDQUFDLENBQUM7eUJBQ3hDOzZCQUtHLGlCQUFpQixDQUFDLFNBQVMsRUFBM0Isd0JBQTJCO3dCQU9yQixLQUFLLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxpQkFBaUIsQ0FBQyxTQUFTLEVBQUUsVUFBQyxXQUFXOzRCQUN6RCxPQUFPOztvQ0FDSCxzQkFBTyxJQUFJLENBQUMsc0JBQXNCLENBQUMsV0FBVyxFQUFFLGlCQUFpQixFQUFFLGVBQWUsQ0FBQyxFQUFDOztpQ0FDdkYsQ0FBQzt3QkFDTixDQUFDLENBQUMsQ0FBQzt3QkFFSCxxQkFBTSx5QkFBUSxDQUFDLEtBQUssRUFBRSxTQUFTLENBQUMsRUFBQTs7d0JBQWhDLFNBQWdDLENBQUM7OzRCQUdyQyxzQkFBTyxZQUFZLEVBQUM7Ozs7S0FDdkI7SUFFTCxhQUFDO0FBQUQsQ0EvTEEsQUErTEMsSUFBQTtBQS9McUIsd0JBQU07QUErTTVCLGlEQUFpRDtBQUNqRDtJQUFpQywrQkFBbUI7SUFZaEQsWUFBWTtJQUdaLHFCQUFvQixRQUErQjtRQUFuRCxZQUVJLGtCQUFNLFFBQVEsQ0FBQyxTQUVsQjtRQURHLEtBQUksQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFDOztJQUNyQixDQUFDO0lBaEJhLGtCQUFNLEdBQXBCLFVBQXFCLFFBQStCO1FBRWhELElBQU0sUUFBUSxHQUFHLElBQUksV0FBVyxDQUFDLFFBQVEsQ0FBQyxDQUFDO1FBQzNDLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBZVksNEJBQU0sR0FBbkIsVUFBb0IsTUFBZTs7OztnQkFFM0IsR0FBRyxHQUFvQixDQUFDLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQztnQkFDL0MsSUFBSSxNQUFNLEtBQUssU0FBUyxFQUFFO29CQUN0QixzQkFBTyxHQUFHLEVBQUM7aUJBQ2Q7Z0JBRUQsbUVBQW1FO2dCQUNuRSxTQUFTO2dCQUNULEdBQUcsR0FBRyxDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxVQUFDLEtBQUssSUFBSyxPQUFBLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQWxCLENBQWtCLENBQUMsQ0FBQztnQkFDbkQsc0JBQU8sR0FBRyxFQUFDOzs7S0FDZDtJQUdlLHlCQUFHLEdBQW5CLFVBQW9CLEVBQVk7Ozs7Z0JBR3RCLFVBQVUsR0FBRyxJQUFJLENBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxDQUFDO2dCQUVuQyxvRUFBb0U7Z0JBQ3BFLG9FQUFvRTtnQkFDcEUsa0JBQWtCO2dCQUVsQiwyQ0FBMkM7Z0JBQzNDLHNCQUFPLEVBQUMsVUFBVSxZQUFBLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBQyxFQUFDOzs7S0FDakM7SUFHZSx5QkFBRyxHQUFuQixVQUFvQixVQUF1QixFQUFFLElBQTZCOzs7Z0JBRXRFLGtFQUFrRTtnQkFDbEUsb0VBQW9FO2dCQUNwRSxrQkFBa0I7Z0JBRWxCLHVDQUF1QztnQkFDdkMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxVQUFVLENBQUMsRUFBRSxDQUFDLEdBQUcsVUFBVSxDQUFDO2dCQUV4QyxpRUFBaUU7Z0JBQ2pFLDhDQUE4QztnQkFDOUMsc0JBQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFDLEVBQUM7OztLQUNyQjtJQUNMLGtCQUFDO0FBQUQsQ0EvREEsQUErREMsQ0EvRGdDLE1BQU0sR0ErRHRDO0FBL0RZLGtDQUFXIiwiZmlsZSI6InNlcmlhbGl6YXRpb24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7cHJvbWlzZVdoaWxlLCBzZXF1ZW5jZX0gZnJvbSBcIi4vcHJvbWlzZUhlbHBlcnNcIjtcbmltcG9ydCB7Z2VuZXJhdGVVdWlkfSBmcm9tIFwiLi91dWlkXCI7XG5pbXBvcnQge1NlcmlhbGl6YXRpb25SZWdpc3RyeX0gZnJvbSBcIi4vc2VyaWFsaXphdGlvblJlZ2lzdHJ5XCI7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEhlbHBlciBGdW5jdGlvbnNcbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGVJZChwcmVmaXg6IHN0cmluZyk6IHN0cmluZ1xue1xuICAgIGNvbnN0IHRpbWVNcyA9IERhdGUubm93KCk7XG4gICAgY29uc3QgdXVpZCA9IGdlbmVyYXRlVXVpZCgpO1xuICAgIHJldHVybiBgJHtwcmVmaXh9XyR7dGltZU1zfV8ke3V1aWR9YDtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy8gRGF0YSBTdHJ1Y3R1cmVzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJpYWxpemFibGVNYXBcbntcbiAgICBbaWQ6IHN0cmluZ106IElTZXJpYWxpemFibGU7XG59XG5cblxuLyoqXG4gKiBBIGZ1bmN0aW9uIHR5cGUgZGVzY3JpYmluZyBmdXR1cmUgd29yayB0aGF0IG5lZWRzIHRvIGJlIGRvbmUgdG8gY29tcGxldGUgYW5cbiAqIG9iamVjdCdzIGRlc2VyaWFsaXphdGlvbi5cbiAqIEBwYXJhbSBvYmplY3RzIC0gQWxsIG9iamVjdHMgdGhhdCBoYXZlIGJlZW4gZGVzZXJpYWxpemVkLCBpbmNsdWRpbmcgYWxsXG4gKiAgIHJldHVybmVkIGZyb20gdGhlIGluaXRpYWwgYGRlc2VyaWFsaXplKClgIGludm9jYXRpb24uXG4gKiBAcmV0dXJuIHZvaWQgaWYgdGhlIGRlc2VyaWFsaXphdGlvbiBpcyBjb21wbGV0ZSBvciBhIHByb21pc2UgdGhhdCByZXNvbHZlc1xuICogICB3aGVuIGl0IGlzIGNvbXBsZXRlXG4gKi9cbmV4cG9ydCB0eXBlIERlc2VyaWFsaXplUGhhc2UyRnVuYyA9IChvYmplY3RzOiBJU2VyaWFsaXphYmxlTWFwKSA9PiBQcm9taXNlPHZvaWQ+IHwgdm9pZDtcblxuZXhwb3J0IHR5cGUgSWRTdHJpbmcgPSBzdHJpbmc7XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIEJ1c2luZXNzIE9iamVjdCBJbnRlcmZhY2VzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcmlhbGl6ZWRcbntcbiAgICB0eXBlOiAgIHN0cmluZztcbiAgICBpZDogICAgIElkU3RyaW5nO1xuICAgIHNjaGVtYTogc3RyaW5nO1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSURlc2VyaWFsaXplUmVzdWx0XG57XG4gICAgLy8gVGhlIHJlc3VsdCBvZiB0aGUgZmlyc3QgcGhhc2Ugb2YgZGVzZXJpYWxpemF0aW9uLlxuICAgIGRlc2VyaWFsaXplZE9iajogSVNlcmlhbGl6YWJsZTtcbiAgICAvLyBPdGhlciBvYmplY3RzIHRoYXQgbmVlZCB0byBiZSBkZXNlcmlhbGl6ZWQgc28gdGhhdCB0aGlzIG9iamVjdCBjYW5cbiAgICAvLyByZWVzdGFibGlzaCBpdHMgcmVmZXJlbmNlcy5cbiAgICBuZWVkZWRJZHM/OiBBcnJheTxJZFN0cmluZz47XG4gICAgLy8gRnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZSBydW4gdG8gZmluaXNoIHRoaXMgb2JqZWN0J3MgZGVzZXJpYWxpemF0aW9uXG4gICAgLy8gKG9uY2UgdGhlIG9iamVjdHMgY29ycmVzcG9uZGluZyB0byBgbmVlZGVkSWRzYCBhcmUgYXZhaWxhYmxlKS5cbiAgICBjb21wbGV0aW9uRnVuY3M/OiBBcnJheTxEZXNlcmlhbGl6ZVBoYXNlMkZ1bmM+O1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVNlcmlhbGl6YWJsZVN0YXRpY1xue1xuICAgIHR5cGU6IHN0cmluZztcblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIHRoZSBmaXJzdCBwaGFzZSBvZiBkZXNlcmlhbGl6YXRpb24gYW5kIHJldHVybnMgaW5mb3JtYXRpb24gYW5kXG4gICAgICogZnVuY3Rpb25zIG5lZWRlZCB0byBjb21wbGV0ZSB0aGUgZGVzZXJpYWxpemF0aW9uXG4gICAgICogQHBhcmFtIHNlcmlhbGl6ZWQgLSBUaGUgb2JqZWN0IHRvIGJlIGRlc2VyaWFsaXplZFxuICAgICAqIEByZXR1cm4gQW4gb2JqZWN0IGNvbnRhaW5pbmcgdGhlIGRlc2VyaWFsaXplZCBvYmplY3QsIHRoZSBJRHMgb2Ygb3RoZXJcbiAgICAgKiBvYmplY3RzIHRoYXQgYXJlIG5lZWRlZCBpbiBvcmRlciB0byBjb21wbGV0ZSB0aGUgZGVzZXJpYWxpemF0aW9uLCBhbmQgYW55XG4gICAgICogZnVuY3Rpb25zIHJlcHJlc2VudGluZyBhZGRpdGlvbmFsIHdvcmsgdGhhdCBuZWVkcyB0byBiZSBkb25lIHRvIGZpbmlzaFxuICAgICAqIGRlc2VyaWFsaXphdGlvbiAoZS5nLiBlc3RhYmxpc2hpbmcgcmVmZXJlbmNlcyB0byBvdGhlciBvYmplY3RzKS5cbiAgICAgKi9cbiAgICBkZXNlcmlhbGl6ZShzZXJpYWxpemVkOiBJU2VyaWFsaXplZCk6IElEZXNlcmlhbGl6ZVJlc3VsdDtcbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJpYWxpemVSZXN1bHRcbntcbiAgICBzZXJpYWxpemVkOiBJU2VyaWFsaXplZDtcbiAgICBvdGhlcnNUb1NlcmlhbGl6ZTogQXJyYXk8SVNlcmlhbGl6YWJsZT47XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBJU2VyaWFsaXphYmxlXG57XG4gICAgcmVhZG9ubHkgaWQ6IHN0cmluZztcbiAgICBzZXJpYWxpemUoKTogSVNlcmlhbGl6ZVJlc3VsdDtcbn1cblxuXG5leHBvcnQgZnVuY3Rpb24gaXNJU2VyaWFsaXphYmxlKG9iajogYW55KTogb2JqIGlzIElTZXJpYWxpemFibGVcbntcbiAgICByZXR1cm4gXy5pc1N0cmluZyhvYmouaWQpICYmXG4gICAgICAgICAgIF8uaXNGdW5jdGlvbihvYmouc2VyaWFsaXplKSAmJlxuICAgICAgICAgICBfLmlzRnVuY3Rpb24ob2JqLmNvbnN0cnVjdG9yLmRlc2VyaWFsaXplKTtcbn1cblxuXG5leHBvcnQgaW50ZXJmYWNlIElTZXJpYWxpemFibGVXaXRoU3RvdzxTdG93VHlwZT4gZXh0ZW5kcyBJU2VyaWFsaXphYmxlXG57XG4gICAgX19zdG93OiBTdG93VHlwZTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlzSVNlcmlhbGl6YWJsZVdpdGhTdG93PFN0b3dUeXBlPihvYmo6IGFueSk6IG9iaiBpcyBJU2VyaWFsaXphYmxlV2l0aFN0b3c8U3Rvd1R5cGU+XG57XG4gICAgcmV0dXJuIGlzSVNlcmlhbGl6YWJsZShvYmopICYmXG4gICAgICAgICAgIC8vIEZVVFVSRTogVGhlIGZvbGxvd2luZyBpcyBwcmV0dHkgYm9ndXMuICBKdXN0IGJlY2F1c2UgX19zdG93IGlzIG5vdFxuICAgICAgICAgICAvLyAgIHVuZGVmaW5lZCBkb2VzIG5vdCBtZWFuIHRoYXQgaXQgaXMgb2YgdHlwZSBTdG93VHlwZS4gIEZpeCB0aGlzXG4gICAgICAgICAgIC8vICAgaW4gdGhlIGZ1dHVyZS5cbiAgICAgICAgICAgKG9iaiBhcyBhbnkpLl9fc3RvdyAhPT0gdW5kZWZpbmVkO1xufVxuXG5cbi8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vXG4vLyBTdG9yZSBJbnRlcmZhY2VzXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVN0b3JlR2V0UmVzdWx0PFN0b3dUeXBlPlxue1xuICAgIC8qKlxuICAgICAqIFRoZSBzZXJpYWxpemVkIGZvcm0gb2YgdGhlIHNhdmVkIGRhdGEuXG4gICAgICovXG4gICAgc2VyaWFsaXplZDogSVNlcmlhbGl6ZWQ7XG5cbiAgICAvKipcbiAgICAgKiBUaGUgc3Rvd2VkIGRhdGEgdGhhdCBzaG91bGQgYmUgYXBwbGllZCB0byB0aGUgb2JqZWN0IG9uY2UgYHNlcmlhbGl6ZWRgXG4gICAgICogaGFzIGJlZW4gZGVzZXJpYWxpemVkLlxuICAgICAqL1xuICAgIHN0b3c6IFN0b3dUeXBlO1xufVxuXG5cbmV4cG9ydCBpbnRlcmZhY2UgSVN0b3JlUHV0UmVzdWx0PFN0b3dUeXBlPlxue1xuICAgIC8qKlxuICAgICAqIFRoZSBuZXcgc3RvdyBkYXRhIHRoYXQgbXVzdCBiZSBhcHBsaWVkIHRvIHRoZSBvcmlnaW5hbCBvYmplY3QgZm9sbG93aW5nXG4gICAgICogdGhpcyBwdXQoKSBvcGVyYXRpb24uXG4gICAgICovXG4gICAgc3RvdzogU3Rvd1R5cGU7XG59XG5cblxuZXhwb3J0IGludGVyZmFjZSBJTG9hZFJlc3VsdDxUIGV4dGVuZHMgSVNlcmlhbGl6YWJsZT5cbntcbiAgICAvLyBUaGUgcmVxdWVzdGVkIGRlc2VyaWFsaXplZCBvYmplY3QuXG4gICAgb2JqOiBUO1xuXG4gICAgLy8gQWxsIG9mIHRoZSBvYmplY3RzIHRoYXQgd2VyZSBkZXNlcmlhbGl6ZWQuXG4gICAgYWxsT2JqZWN0czogSVNlcmlhbGl6YWJsZU1hcDtcbn1cblxuXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuLy9cbi8vIEFTdG9yZVxuLy9cbi8vIEFic3RyYWN0IGJhc2UgY2xhc3MgZm9yIGJhY2tpbmcgc3RvcmVzIC4gIEtub3dzIGhvdyB0byBmb2xsb3cgZ3JhcGhzIG9mXG4vLyBvYmplY3RzIHdoZW4gc2VyaWFsaXppbmcgYW5kIGRlc2VyaWFsaXppbmcgYW5kIGhvdyB0byBtYW5hZ2Ugc3Rvd2VkIGRhdGEuXG4vLyBEZWZpbmVzIGFic3RyYWN0IG1ldGhvZHMgdGhhdCBkZXJpdmVkIGNsYXNzZXMgbXVzdCBpbXBsZW1lbnQgdG8gcmVhZCBhbmRcbi8vIHdyaXRlIGRhdGEgaW4gYSBtYW5uZXIgdGhhdCBpcyBzcGVjaWZpYyB0byBlYWNoIGJhY2tpbmcgc3RvcmUuXG4vL1xuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cblxuLy8gdHNsaW50OmRpc2FibGUtbmV4dC1saW5lOiBtYXgtY2xhc3Nlcy1wZXItZmlsZVxuZXhwb3J0IGFic3RyYWN0IGNsYXNzIEFTdG9yZTxTdG93VHlwZT5cbntcbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJvdGVjdGVkIHJlYWRvbmx5IF9yZWdpc3RyeTogU2VyaWFsaXphdGlvblJlZ2lzdHJ5O1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBwcm90ZWN0ZWQgY29uc3RydWN0b3IocmVnaXN0cnk6IFNlcmlhbGl6YXRpb25SZWdpc3RyeSlcbiAgICB7XG4gICAgICAgIHRoaXMuX3JlZ2lzdHJ5ID0gcmVnaXN0cnk7XG4gICAgfVxuXG4gICAgcHVibGljIGFic3RyYWN0IGdldElkcyhyZWdleHA/OiBSZWdFeHApOiBQcm9taXNlPEFycmF5PElkU3RyaW5nPj47XG5cblxuICAgIHB1YmxpYyBhc3luYyBsb2FkPFQgZXh0ZW5kcyBJU2VyaWFsaXphYmxlPihpZDogSWRTdHJpbmcpOiBQcm9taXNlPElMb2FkUmVzdWx0PFQ+PlxuICAgIHtcbiAgICAgICAgLy8gQW4gb2JqZWN0IHRoYXQga2VlcHMgdHJhY2sgb2YgYWxsIG9iamVjdHMgZGVzZXJpYWxpemVkIHNvIGZhci5cbiAgICAgICAgLy8gVGhlIGtleSBpcyB0aGUgaWQgYW5kIHRoZSB2YWx1ZSBpcyB0aGUgZGVzZXJpYWxpemVkIHJlc3VsdC5cbiAgICAgICAgY29uc3QgZGVzZXJpYWxpemVkU29GYXI6IElTZXJpYWxpemFibGVNYXAgPSB7fTtcbiAgICAgICAgLy8gQW4gYXJyYXkgb2YgY29tcGxldGlvbiBmdW5jdGlvbnMgdGhhdCBuZWVkIHRvIGJlIHJ1biB3aGVuIHRoZSBmaXJzdFxuICAgICAgICAvLyBwYXNzIGhhcyBjb21wbGV0ZWQuXG4gICAgICAgIGNvbnN0IGNvbXBsZXRpb25GdW5jczogQXJyYXk8RGVzZXJpYWxpemVQaGFzZTJGdW5jPiA9IFtdO1xuXG4gICAgICAgIC8vIEZpcnN0IHBhc3M6ICBSZWN1cnNpdmVseSBkZXNlcmlhbGl6ZSBhbGwgb2JqZWN0cy5cbiAgICAgICAgY29uc3QgZGVzZXJpYWxpemVkID0gYXdhaXQgdGhpcy5kb0ZpcnN0UGFzc0Rlc2VyaWFsaXplKGlkLCBkZXNlcmlhbGl6ZWRTb0ZhciwgY29tcGxldGlvbkZ1bmNzKTtcblxuICAgICAgICAvLyBTZWNvbmQgcGFzczogIFJ1biBhbGwgY29tcGxldGlvbiBmdW5jdGlvbnMgc28gdGhhdCBlYWNoIG9iamVjdCBjYW5cbiAgICAgICAgLy8gc2V0IGl0cyByZWZlcmVuY2VzIHRvIG90aGVyIG9iamVjdHMuXG4gICAgICAgIGNvbnN0IHByb21pc2VzID0gXy5tYXAoY29tcGxldGlvbkZ1bmNzLCAoY3VyQ29tcGxldGlvbkZ1bmMpID0+IHtcbiAgICAgICAgICAgIC8vIFdyYXAgdGhlIHJldHVybiB2YWx1ZSBmcm9tIGVhY2ggY29tcGxldGlvbiBmdW5jdGlvbiBpbiBhIHByb21pc2VcbiAgICAgICAgICAgIC8vIGluIHRoZSBldmVudCB0aGUgZnVuY3Rpb24gcmV0dXJucyB2b2lkIGluc3RlYWQgb2YgUHJvbWlzZTx2b2lkPi5cbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZShjdXJDb21wbGV0aW9uRnVuYyhkZXNlcmlhbGl6ZWRTb0ZhcikpO1xuICAgICAgICB9KTtcbiAgICAgICAgYXdhaXQgQkJQcm9taXNlLmFsbChwcm9taXNlcyk7XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9iajogZGVzZXJpYWxpemVkIGFzIFQsXG4gICAgICAgICAgICBhbGxPYmplY3RzOiBkZXNlcmlhbGl6ZWRTb0ZhclxuICAgICAgICB9O1xuICAgIH1cblxuXG4gICAgcHVibGljIGFzeW5jIHNhdmUob2JqOiBJU2VyaWFsaXphYmxlKTogUHJvbWlzZTx2b2lkPlxuICAgIHtcbiAgICAgICAgY29uc3QgYWxyZWFkeVNlcmlhbGl6ZWQ6IElTZXJpYWxpemFibGVNYXAgPSB7fTtcbiAgICAgICAgY29uc3QgbmVlZFRvU2VyaWFsaXplOiBBcnJheTxJU2VyaWFsaXphYmxlPiA9IFtvYmpdO1xuXG4gICAgICAgIGF3YWl0IHByb21pc2VXaGlsZShcbiAgICAgICAgICAgICgpID0+IG5lZWRUb1NlcmlhbGl6ZS5sZW5ndGggPiAwLFxuICAgICAgICAgICAgYXN5bmMgKCkgPT4ge1xuICAgICAgICAgICAgICAgIGNvbnN0IGN1ck9iaiA9IG5lZWRUb1NlcmlhbGl6ZS5zaGlmdCgpITtcblxuICAgICAgICAgICAgICAgIC8vIE5vdGU6IFdlIGNvdWxkIHBlcmZvcm0gYSBzYW5pdHkgY2hlY2sgaGVyZSB0byBtYWtlIHN1cmUgdGhhdFxuICAgICAgICAgICAgICAgIC8vIHRoZSBvYmplY3QgYmVpbmcgc2VyaWFsaXplZCBpcyByZWdpc3RlcmVkIHdpdGhcbiAgICAgICAgICAgICAgICAvLyBgdGhpcy5fcmVnaXN0cnlgIHNvIHRoYXQgaXQgY291bGQgZXZlbnR1YWxseSBiZSBkZXNlcmlhbGl6ZWRcbiAgICAgICAgICAgICAgICAvLyAocmVnaXN0cmF0aW9uIGlzIG9ubHkgbmVlZGVkIGZvciB0aGUgZGVzZXJpYWxpemF0aW9uXG4gICAgICAgICAgICAgICAgLy8gcHJvY2VzcykuICBJIGhhdmUgZGVjaWRlZCwgaG93ZXZlciwgbm90IHRvIHBlcmZvcm0gdGhpc1xuICAgICAgICAgICAgICAgIC8vIGNoZWNrLCBiZWNhdXNlIGl0IHdvdWxkIGJlIGFydGlmaWNpYWxseSBsaW1pdGluZy4gIFRoZXJlXG4gICAgICAgICAgICAgICAgLy8gY291bGQsIGZvciBleGFtcGxlLCBiZSBhIHRvb2wgdGhhdCBvbmx5IHNhdmVkIG1vZGVscyBhbmRcbiAgICAgICAgICAgICAgICAvLyBuZXZlciB0cmllZCB0byByZWFkIHRoZW0uXG5cbiAgICAgICAgICAgICAgICAvLyBDaGVjayB0byBzZWUgaWYgdGhlIG9iamVjdCBoYXMgYWxyZWFkeSBiZWVuIHNlcmlhbGl6ZWQuICBJZlxuICAgICAgICAgICAgICAgIC8vIHNvLCBkbyBub3RoaW5nLlxuICAgICAgICAgICAgICAgIGlmIChhbHJlYWR5U2VyaWFsaXplZFtjdXJPYmouaWRdICE9PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgICAgIGNvbnN0IHNlcmlhbGl6ZVJlc3VsdCA9IGN1ck9iai5zZXJpYWxpemUoKTtcbiAgICAgICAgICAgICAgICBjb25zdCBzdG93OiB1bmRlZmluZWQgfCBTdG93VHlwZSA9IGlzSVNlcmlhbGl6YWJsZVdpdGhTdG93PFN0b3dUeXBlPihjdXJPYmopID8gY3VyT2JqLl9fc3RvdyA6IHVuZGVmaW5lZDtcblxuICAgICAgICAgICAgICAgIGNvbnN0IHB1dFByb21pc2UgPSB0aGlzLnB1dChzZXJpYWxpemVSZXN1bHQuc2VyaWFsaXplZCwgc3Rvdyk7XG5cbiAgICAgICAgICAgICAgICAvLyBJZiBvdGhlciBvYmplY3RzIG5lZWQgdG8gYmUgc2VyaWFsaXplZCwgcXVldWUgdGhlbSB1cC5cbiAgICAgICAgICAgICAgICB3aGlsZSAoc2VyaWFsaXplUmVzdWx0Lm90aGVyc1RvU2VyaWFsaXplICYmIHNlcmlhbGl6ZVJlc3VsdC5vdGhlcnNUb1NlcmlhbGl6ZS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgICAgIG5lZWRUb1NlcmlhbGl6ZS5wdXNoKHNlcmlhbGl6ZVJlc3VsdC5vdGhlcnNUb1NlcmlhbGl6ZS5zaGlmdCgpISk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgLy8gV2FpdCBmb3IgdGhlIHB1dCgpIHRvIGNvbXBsZXRlLlxuICAgICAgICAgICAgICAgIGNvbnN0IHB1dFJlc3VsdCA9IGF3YWl0IHB1dFByb21pc2U7XG5cbiAgICAgICAgICAgICAgICAvLyBBc3NpZ24gdGhlIHN0b3dlZCBkYXRhIGJhY2sgdG8gdGhlIG9yaWdpbmFsIG9iamVjdC5cbiAgICAgICAgICAgICAgICBjb25zdCBvYmpXaXRoU3RvdyA9IGN1ck9iaiBhcyBJU2VyaWFsaXphYmxlV2l0aFN0b3c8U3Rvd1R5cGU+O1xuICAgICAgICAgICAgICAgIG9ialdpdGhTdG93Ll9fc3RvdyA9IHB1dFJlc3VsdC5zdG93O1xuICAgICAgICAgICAgfVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIFRPRE86IFByb3ZpZGUgYW4gb3B0aW9uIHRoYXQgd2lsbCBkZWxldGUgZG9jdW1lbnRzIGZyb20gdGhlIGJhY2tpbmdcbiAgICAgICAgLy8gICBzdG9yZSB0aGF0IGRvIG5vdCBhcHBlYXIgaW4gYGFscmVhZHlTZXJpYWxpemVkYC5cblxuICAgIH1cblxuXG4gICAgLyoqXG4gICAgICogVGVtcGxhdGUgbWV0aG9kIHRoYXQgcmVhZHMgdGhlIHNwZWNpZmllZCBvYmplY3QgZnJvbSB0aGUgYmFja2luZyBzdG9yZVxuICAgICAqIEBwYXJhbSBpZCAtIFRoZSBJRCBvZiB0aGUgb2JqZWN0IHRvIHJlYWRcbiAgICAgKiBAcmV0dXJuIFdoZW4gc3VjY2Vzc2Z1bGx5IHJlYWQsIHRoZSByZXR1cm5lZCBwcm9taXNlIHJlc29sdmVzIHdpdGggdGhlXG4gICAgICogICBzZXJpYWxpemVkIGZvcm0gb2YgdGhlIG9iamVjdCBhbmQgdGhlIHN0b3dlZCBkYXRhIHRoYXQgc2hvdWxkIGJlXG4gICAgICogICBhcHBsaWVkIHRvIHRoZSBvYmplY3Qgb25jZSB0aGUgc2VyaWFsaXplZCBmb3JtIGlzIGRlc2VyaWFsaXplZC5cbiAgICAgKi9cbiAgICBwcm90ZWN0ZWQgYWJzdHJhY3QgZ2V0KGlkOiBJZFN0cmluZyk6IFByb21pc2U8SVN0b3JlR2V0UmVzdWx0PFN0b3dUeXBlPj47XG5cblxuICAgIC8qKlxuICAgICAqIFRlbXBsYXRlIG1ldGhvZCB0aGF0IHdyaXRlcyB0aGUgc3BlY2lmaWVkIG9iamVjdCB0byB0aGUgYmFja2luZyBzdG9yZVxuICAgICAqIEBwYXJhbSBzZXJpYWxpemVkIC0gVGhlIHNlcmlhbGl6ZWQgZm9ybSBvZiB0aGUgb2JqZWN0IHRvIGJlIHN0b3JlZC5cbiAgICAgKiBAcGFyYW0gc3RvdyAtIFRoZSBzdG93ZWQgcHJvcGVydGllcyBmcm9tIHRoZSBvcmlnaW5hbCBvYmplY3RcbiAgICAgKiBAcmV0dXJuIFdoZW4gc3VjY2Vzc2Z1bGx5IHdyaXR0ZW4sIHRoZSByZXR1cm5lZCBwcm9taXNlIHJlc29sdmVzIHdpdGggdGhlXG4gICAgICogICBvYmplY3QncyBuZXcgc3Rvd2VkIGRhdGEuXG4gICAgICovXG4gICAgcHJvdGVjdGVkIGFic3RyYWN0IHB1dChzZXJpYWxpemVkOiBJU2VyaWFsaXplZCwgc3RvdzogdW5kZWZpbmVkIHwgU3Rvd1R5cGUpOiBQcm9taXNlPElTdG9yZVB1dFJlc3VsdDxTdG93VHlwZT4+O1xuXG5cbiAgICAvKipcbiAgICAgKiBBIGhlbHBlciBtZXRob2QgdGhhdCByZWN1cnNpdmVseSBwZXJmb3JtcyBhIGZpcnN0IHBhc3MgZGVzZXJpYWxpemF0aW9uIG9mXG4gICAgICogdGhlIHNwZWNpZmllZCBvYmplY3QuICBJbiB0aGUgZmlyc3QgcGFzcywgZWFjaCBvYmplY3QgaXMgcmVzcG9uc2libGUgZm9yXG4gICAgICogaW5zdGFudGlhdGluZyBpdHNlbGYgYW5kIHNldHRpbmcgaXRzIHN0YXRlLiAgSWYgYW55IHJlZmVyZW5jZXMgdG8gb3RoZXJcbiAgICAgKiBvYmplY3RzIGV4aXN0LCBvbmUgb3IgbW9yZSBjb21wbGV0aW9uIGZ1bmN0aW9ucyBzaG91bGQgYmUgcmV0dXJuZWQgdGhhdFxuICAgICAqIHdpbGwgYmUgcnVuIGR1cmluZyB0aGUgc2Vjb25kIHBhc3MuICBUaGUgY29tcGxldGlvbiBmdW5jdGlvbnMgc2hvdWxkIHNldFxuICAgICAqIHJlZmVyZW5jZXMgdG8gb3RoZXIgb2JqZWN0cyBkdXJpbmcgdGhpcyBzZWNvbmQgcGhhc2UsIHNpbmNlIHRoYXQgaXMgd2hlblxuICAgICAqIGFsbCBvYmplY3RzIGFyZSBndWFyYW50ZWVkIHRvIGV4aXN0LlxuICAgICAqIEBwYXJhbSBpZCAtIFRoZSBpZCBvZiB0aGUgb2JqZWN0IHRvIHBlcmZvcm0gZmlyc3QgcGFzcyBkZXNlcmlhbGl6YXRpb24gb25cbiAgICAgKiBAcGFyYW0gZGVzZXJpYWxpemVkU29GYXIgLSBBIG1hcCBvZiBhbGwgb2JqZWN0cyBkZXNlcmlhbGl6ZWQgdGh1cyBmYXIuXG4gICAgICogICBVc2VkIHRvIGRldGVjdCB3aGV0aGVyIGFuIG9iamVjdCBoYXMgYWxyZWFkeSB1bmRlcmdvbmUgZmlyc3QgcGFzc1xuICAgICAqICAgZGVzZXJpYWxpemF0aW9uLlxuICAgICAqIEBwYXJhbSBjb21wbGV0aW9uRnVuY3MgLSBBZGRpdGlvbmFsIHdvcmsgdGhhdCBuZWVkcyB0byBiZSBkb25lIChkdXJpbmdcbiAgICAgKiAgIHRoZSBzZWNvbmQgcGFzcykgdG8gc2V0IGludGVyLW9iamVjdCBjcm9zcyByZWZlcmVuY2VzLlxuICAgICAqIEByZXR1cm4gVGhlIHJlc3VsdHMgb2YgdGhlIGZpcnN0IHBhc3MgZGVzZXJpYWxpemF0aW9uLCB3aGljaCBpcyBhblxuICAgICAqICAgSVNlcmlhbGl6YWJsZSB0aGF0IGhhcyBpdHMgb3duZWQgc3RhdGUgc2V0LCBidXQgaGFzIG5vdCB5ZXQgc2V0XG4gICAgICogICByZWZlcmVuY2VzIHRvIG90aGVyIG9iamVjdHMuXG4gICAgICovXG4gICAgcHJpdmF0ZSBhc3luYyBkb0ZpcnN0UGFzc0Rlc2VyaWFsaXplKFxuICAgICAgICBpZDogc3RyaW5nLFxuICAgICAgICBkZXNlcmlhbGl6ZWRTb0ZhcjogSVNlcmlhbGl6YWJsZU1hcCxcbiAgICAgICAgY29tcGxldGlvbkZ1bmNzOiBBcnJheTxEZXNlcmlhbGl6ZVBoYXNlMkZ1bmM+XG4gICAgKTogUHJvbWlzZTxJU2VyaWFsaXphYmxlPlxuICAgIHtcbiAgICAgICAgLy8gSWYgdGhlIGlkIGJlaW5nIHJlcXVlc3RlZCBhbHJlYWR5IGFwcGVhcnMgaW4gdGhlIGRpY3Rpb25hcnkgb2Ygb2JqZWN0XG4gICAgICAgIC8vIHRoYXQgaGF2ZSB1bmRlcmdvbmUgYSBmaXJzdCBwYXNzIGRlc2VyaWFsaXphdGlvbiwgdGhlbiByZXR1cm5cbiAgICAgICAgLy8gaW1tZWRpYXRlbHkuXG4gICAgICAgIGlmIChkZXNlcmlhbGl6ZWRTb0ZhcltpZF0gIT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGRlc2VyaWFsaXplZFNvRmFyW2lkXTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGdldFJlc3VsdDogSVN0b3JlR2V0UmVzdWx0PFN0b3dUeXBlPiA9IGF3YWl0IHRoaXMuZ2V0KGlkKTtcbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZCA9IGdldFJlc3VsdC5zZXJpYWxpemVkO1xuXG4gICAgICAgIGNvbnN0IGZvdW5kQ2xhc3MgPSB0aGlzLl9yZWdpc3RyeS5nZXRDbGFzcyhzZXJpYWxpemVkLnR5cGUpO1xuICAgICAgICBpZiAoIWZvdW5kQ2xhc3MpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcihgTm8gY2xhc3MgcmVnaXN0ZXJlZCBmb3IgdHlwZSBcIiR7c2VyaWFsaXplZC50eXBlfVwiLmApO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZGVzZXJpYWxpemVSZXN1bHQgPSBmb3VuZENsYXNzLmRlc2VyaWFsaXplKHNlcmlhbGl6ZWQpO1xuXG4gICAgICAgIC8vIFRoZSBvYmplY3QgdGhhdCB3aWxsIGV2ZW50dWFsbHkgYmUgcmV0dXJuZWQuXG4gICAgICAgIGNvbnN0IGRlc2VyaWFsaXplZDogSVNlcmlhbGl6YWJsZSA9IGRlc2VyaWFsaXplUmVzdWx0LmRlc2VyaWFsaXplZE9iajtcbiAgICAgICAgLy8gQWRkIHRoZSBvYmplY3QgdG8gdGhlIG1hcCBvZiBvYmplY3RzIHRoYXQgd2UgaGF2ZSBkZXNlcmlhbGl6ZWQuXG4gICAgICAgIGRlc2VyaWFsaXplZFNvRmFyW2Rlc2VyaWFsaXplZC5pZF0gPSBkZXNlcmlhbGl6ZWQ7XG5cbiAgICAgICAgLy8gTm93IHRoYXQgd2UgaGF2ZSB0aGUgcmVhbCBvYmplY3QsIGFwcGx5IHRoZSBzdG93IGRhdGEuXG4gICAgICAgIGNvbnN0IG9ialdpdGhTdG93ID0gZGVzZXJpYWxpemVkIGFzIElTZXJpYWxpemFibGVXaXRoU3RvdzxTdG93VHlwZT47XG4gICAgICAgIG9ialdpdGhTdG93Ll9fc3RvdyA9IGdldFJlc3VsdC5zdG93O1xuXG4gICAgICAgIC8vIElmIG5lZWRlZCwgdXBkYXRlIHRoZSBsaXN0IG9mIGNvbXBsZXRpb24gZnVuY3Rpb25zIHRoYXQgbmVlZCB0byBiZSBydW4uXG4gICAgICAgIHdoaWxlIChkZXNlcmlhbGl6ZVJlc3VsdC5jb21wbGV0aW9uRnVuY3MgJiYgZGVzZXJpYWxpemVSZXN1bHQuY29tcGxldGlvbkZ1bmNzLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgIGNvbnN0IGNvbXBsZXRpb25GdW5jID0gZGVzZXJpYWxpemVSZXN1bHQuY29tcGxldGlvbkZ1bmNzLnNoaWZ0KCkhO1xuICAgICAgICAgICAgY29tcGxldGlvbkZ1bmNzLnB1c2goY29tcGxldGlvbkZ1bmMpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIGRlc2VyaWFsaXplZCBvYmplY3QgaGFzIHJldHVybmVkIElEcyBvZiBvdGhlciBvYmplY3RzIHRoYXRcbiAgICAgICAgLy8gbmVlZCB0byBiZSBkZXNlcmlhbGl6ZWQsIHJlY3Vyc2UgYW5kIGRvIGEgZmlyc3QgcGFzcyBkZXNlcmlhbGl6YXRpb25cbiAgICAgICAgLy8gb24gdGhvc2Ugb2JqZWN0cyBhcyB3ZWxsLlxuICAgICAgICBpZiAoZGVzZXJpYWxpemVSZXN1bHQubmVlZGVkSWRzKSB7XG5cbiAgICAgICAgICAgIC8vIENyZWF0ZSB0YXNrcyB0aGF0IHdpbGwgZG8gYSBmaXJzdCBwYXNzIGRlc2VyaWFsaXphdGlvbiBvbiB0aGVcbiAgICAgICAgICAgIC8vIG5lZWRlZCBvYmplY3RzLiAgV2Ugd2lsbCB0aGVuIGV4ZWN1dGUgdGhlbSBzZXJpYWxseSBzbyB0aGF0IHdlXG4gICAgICAgICAgICAvLyB3b24ndCBkZXNlcmlhbGl6ZSB0aGUgc2FtZSBvYmplY3QgbW9yZSB0aGFuIG9uY2UuICBUaGF0IHdvdWxkXG4gICAgICAgICAgICAvLyByZXN1bHQgaW4gcmVmZXJlbmNlcyB0byBkaWZmZXJlbnQgb2JqZWN0cyB3aGVyZSB3ZSBuZWVkIHRvIGhhdmVcbiAgICAgICAgICAgIC8vIHJlZmVyZW5jZXMgdGhhdCBwb2ludCB0byB0aGUgc2FtZSBvYmplY3QuXG4gICAgICAgICAgICBjb25zdCB0YXNrcyA9IF8ubWFwKGRlc2VyaWFsaXplUmVzdWx0Lm5lZWRlZElkcywgKGN1ck5lZWRlZElkKSA9PiB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGFzeW5jICgpID0+IHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuZG9GaXJzdFBhc3NEZXNlcmlhbGl6ZShjdXJOZWVkZWRJZCwgZGVzZXJpYWxpemVkU29GYXIsIGNvbXBsZXRpb25GdW5jcyk7XG4gICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgICAgICBhd2FpdCBzZXF1ZW5jZSh0YXNrcywgdW5kZWZpbmVkKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkZXNlcmlhbGl6ZWQ7XG4gICAgfVxuXG59XG5cblxuLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy9cbi8vIE1lbW9yeVN0b3JlXG4vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vLy8vL1xuXG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1lbXB0eS1pbnRlcmZhY2VcbmludGVyZmFjZSBJTWVtb3J5U3Rvd1xue1xuICAgIC8vIEludGVudGlvbmFsbHkgbGVmdCBlbXB0eS5cbiAgICAvLyBNZW1vcnlTdG9yZSBkb2VzIG5vdCByZXF1aXJlIGFueSBzdG93ZWQgZGF0YS5cbn1cblxuXG4vLyB0c2xpbnQ6ZGlzYWJsZS1uZXh0LWxpbmU6IG1heC1jbGFzc2VzLXBlci1maWxlXG5leHBvcnQgY2xhc3MgTWVtb3J5U3RvcmUgZXh0ZW5kcyBBU3RvcmU8SU1lbW9yeVN0b3c+XG57XG5cbiAgICBwdWJsaWMgc3RhdGljIGNyZWF0ZShyZWdpc3RyeTogU2VyaWFsaXphdGlvblJlZ2lzdHJ5KTogUHJvbWlzZTxNZW1vcnlTdG9yZT5cbiAgICB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IE1lbW9yeVN0b3JlKHJlZ2lzdHJ5KTtcbiAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZXNvbHZlKGluc3RhbmNlKTtcbiAgICB9XG5cblxuICAgIC8vIHJlZ2lvbiBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9zdG9yZToge1tpZDogc3RyaW5nXTogSVNlcmlhbGl6ZWR9O1xuICAgIC8vIGVuZHJlZ2lvblxuXG5cbiAgICBwcml2YXRlIGNvbnN0cnVjdG9yKHJlZ2lzdHJ5OiBTZXJpYWxpemF0aW9uUmVnaXN0cnkpXG4gICAge1xuICAgICAgICBzdXBlcihyZWdpc3RyeSk7XG4gICAgICAgIHRoaXMuX3N0b3JlID0ge307XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgYXN5bmMgZ2V0SWRzKHJlZ2V4cD86IFJlZ0V4cCk6IFByb21pc2U8QXJyYXk8SWRTdHJpbmc+PlxuICAgIHtcbiAgICAgICAgbGV0IGlkczogQXJyYXk8SWRTdHJpbmc+ID0gXy5rZXlzKHRoaXMuX3N0b3JlKTtcbiAgICAgICAgaWYgKHJlZ2V4cCA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICByZXR1cm4gaWRzO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gQSByZWd1bGFyIGV4cHJlc3MgaGFzIGJlZW4gc3BlY2lmaWVkLCBzbyBmaWx0ZXIgZm9yIHRoZSBpZHMgdGhhdFxuICAgICAgICAvLyBtYXRjaC5cbiAgICAgICAgaWRzID0gXy5maWx0ZXIoaWRzLCAoY3VySWQpID0+IHJlZ2V4cC50ZXN0KGN1cklkKSk7XG4gICAgICAgIHJldHVybiBpZHM7XG4gICAgfVxuXG5cbiAgICBwcm90ZWN0ZWQgYXN5bmMgZ2V0KGlkOiBJZFN0cmluZyk6IFByb21pc2U8SVN0b3JlR2V0UmVzdWx0PElNZW1vcnlTdG93Pj5cbiAgICB7XG4gICAgICAgIC8vIFJlYWQgdGhlIHNwZWNpZmllZCBkYXRhIGZyb20gdGhlIGJhY2tpbmcgc3RvcmUuXG4gICAgICAgIGNvbnN0IHNlcmlhbGl6ZWQgPSB0aGlzLl9zdG9yZVtpZF07XG5cbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSBiYWNraW5nIHN0b3JlJ3MgcmVwcmVzZW50YXRpb24gaW50byBhbiBJU2VyaWFsaXplZC5cbiAgICAgICAgLy8gVGhpcyBpcyBub3QgbmVlZGVkIGZvciBNZW1vcnlTdG9yZSwgYmVjYXVzZSBpdCBzdG9yZXMgdGhlIGRhdGEgYXNcbiAgICAgICAgLy8gYW4gSVNlcmlhbGl6ZWQuXG5cbiAgICAgICAgLy8gVGhlcmUgaXMgbm8gc3Rvd2VkIGRhdGEgZm9yIE1lbW9yeVN0b3JlLlxuICAgICAgICByZXR1cm4ge3NlcmlhbGl6ZWQsIHN0b3c6IHt9fTtcbiAgICB9XG5cblxuICAgIHByb3RlY3RlZCBhc3luYyBwdXQoc2VyaWFsaXplZDogSVNlcmlhbGl6ZWQsIHN0b3c6IHVuZGVmaW5lZCB8IElNZW1vcnlTdG93KTogUHJvbWlzZTxJU3RvcmVQdXRSZXN1bHQ8SU1lbW9yeVN0b3c+PlxuICAgIHtcbiAgICAgICAgLy8gVHJhbnNmb3JtIGBzZXJpYWxpemVkYCBpbnRvIHRoZSBiYWNraW5nIHN0b3JlJ3MgcmVwcmVzZW50YXRpb24uXG4gICAgICAgIC8vIFRoaXMgaXMgbm90IG5lZWRlZCBmb3IgTWVtb3J5U3RvcmUsIGJlY2F1c2UgaXQgc3RvcmVzIHRoZSBkYXRhIGFzXG4gICAgICAgIC8vIGFuIElTZXJpYWxpemVkLlxuXG4gICAgICAgIC8vIFdyaXRlIHRoZSBkYXRhIHRvIHRoZSBiYWNraW5nIHN0b3JlLlxuICAgICAgICB0aGlzLl9zdG9yZVtzZXJpYWxpemVkLmlkXSA9IHNlcmlhbGl6ZWQ7XG5cbiAgICAgICAgLy8gUmV0dXJuIHRoZSBuZXcgc3RvdyBkYXRhIHRoYXQgc2hvdWxkIGJlIHBsYWNlZCBvbiB0aGUgb3JpZ2luYWxcbiAgICAgICAgLy8gb2JqZWN0LiBUaGlzIGlzIG5vdCBuZWVkZWQgZm9yIE1lbW9yeVN0b3JlLlxuICAgICAgICByZXR1cm4ge3N0b3c6IHt9fTtcbiAgICB9XG59XG4iXX0=
