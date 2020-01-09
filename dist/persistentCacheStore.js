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
var serialization_1 = require("./serialization");
var PersistentCacheStore = /** @class */ (function (_super) {
    __extends(PersistentCacheStore, _super);
    // endregion
    function PersistentCacheStore(registry, pcache) {
        var _this = _super.call(this, registry) || this;
        _this._pcache = pcache;
        return _this;
    }
    PersistentCacheStore.create = function (registry, persistentCache) {
        var instance = new PersistentCacheStore(registry, persistentCache);
        return BBPromise.resolve(instance);
    };
    PersistentCacheStore.prototype.getIds = function (regexp) {
        return __awaiter(this, void 0, void 0, function () {
            var ids;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pcache.keys()];
                    case 1:
                        ids = _a.sent();
                        if (regexp === undefined) {
                            return [2 /*return*/, ids];
                        }
                        // A regular express has been specified, so filter for the ids that
                        // match.
                        ids = _.filter(ids, function (curId) { return regexp.test(curId); });
                        return [2 /*return*/, ids];
                }
            });
        });
    };
    PersistentCacheStore.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var serialized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._pcache.get(id)];
                    case 1:
                        serialized = _a.sent();
                        // Transform the backing store's representation into an ISerialized.
                        // This is not needed for PersistentCache, because it stores the data as
                        // an ISerialized.
                        // There is no stowed data for PersistentCache.
                        return [2 /*return*/, { serialized: serialized, stow: {} }];
                }
            });
        });
    };
    PersistentCacheStore.prototype.put = function (serialized, stow) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Transform `serialized` into the backing store's representation.
                    // This is not needed for PersistentCache, because it stores the data as
                    // an ISerialized.
                    // Write the data to the backing store.
                    return [4 /*yield*/, this._pcache.put(serialized.id, serialized)];
                    case 1:
                        // Transform `serialized` into the backing store's representation.
                        // This is not needed for PersistentCache, because it stores the data as
                        // an ISerialized.
                        // Write the data to the backing store.
                        _a.sent();
                        // Return the new stow data that should be placed on the original
                        // object. This is not needed for PersistentCache.
                        return [2 /*return*/, { stow: {} }];
                }
            });
        });
    };
    return PersistentCacheStore;
}(serialization_1.AStore));
exports.PersistentCacheStore = PersistentCacheStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wZXJzaXN0ZW50Q2FjaGVTdG9yZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLDBCQUE0QjtBQUM1QixvQ0FBc0M7QUFHdEMsaURBQWdHO0FBV2hHO0lBQTBDLHdDQUE0QjtJQVlsRSxZQUFZO0lBR1osOEJBQW9CLFFBQStCLEVBQUUsTUFBb0M7UUFBekYsWUFFSSxrQkFBTSxRQUFRLENBQUMsU0FFbEI7UUFERyxLQUFJLENBQUMsT0FBTyxHQUFHLE1BQU0sQ0FBQzs7SUFDMUIsQ0FBQztJQWhCYSwyQkFBTSxHQUFwQixVQUFxQixRQUErQixFQUFFLGVBQTZDO1FBRS9GLElBQU0sUUFBUSxHQUFHLElBQUksb0JBQW9CLENBQUMsUUFBUSxFQUFFLGVBQWUsQ0FBQyxDQUFDO1FBQ3JFLE9BQU8sU0FBUyxDQUFDLE9BQU8sQ0FBQyxRQUFRLENBQUMsQ0FBQztJQUN2QyxDQUFDO0lBZVkscUNBQU0sR0FBbkIsVUFBb0IsTUFBZTs7Ozs7NEJBRUoscUJBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBQTs7d0JBQWhELEdBQUcsR0FBb0IsU0FBeUI7d0JBQ3BELElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTs0QkFDdEIsc0JBQU8sR0FBRyxFQUFDO3lCQUNkO3dCQUVELG1FQUFtRTt3QkFDbkUsU0FBUzt3QkFDVCxHQUFHLEdBQUcsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEVBQUUsVUFBQyxLQUFLLElBQUssT0FBQSxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFsQixDQUFrQixDQUFDLENBQUM7d0JBQ25ELHNCQUFPLEdBQUcsRUFBQzs7OztLQUNkO0lBR2Usa0NBQUcsR0FBbkIsVUFBb0IsRUFBWTs7Ozs7NEJBR1QscUJBQU0sSUFBSSxDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEVBQUE7O3dCQUF2QyxVQUFVLEdBQUcsU0FBMEI7d0JBRTdDLG9FQUFvRTt3QkFDcEUsd0VBQXdFO3dCQUN4RSxrQkFBa0I7d0JBRWxCLCtDQUErQzt3QkFDL0Msc0JBQU8sRUFBQyxVQUFVLFlBQUEsRUFBRSxJQUFJLEVBQUUsRUFBRSxFQUFDLEVBQUM7Ozs7S0FDakM7SUFHZSxrQ0FBRyxHQUFuQixVQUFvQixVQUF1QixFQUFFLElBQXNDOzs7OztvQkFFL0Usa0VBQWtFO29CQUNsRSx3RUFBd0U7b0JBQ3hFLGtCQUFrQjtvQkFFbEIsdUNBQXVDO29CQUN2QyxxQkFBTSxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxVQUFVLENBQUMsRUFBRSxFQUFFLFVBQVUsQ0FBQyxFQUFBOzt3QkFMakQsa0VBQWtFO3dCQUNsRSx3RUFBd0U7d0JBQ3hFLGtCQUFrQjt3QkFFbEIsdUNBQXVDO3dCQUN2QyxTQUFpRCxDQUFDO3dCQUVsRCxpRUFBaUU7d0JBQ2pFLGtEQUFrRDt3QkFDbEQsc0JBQU8sRUFBQyxJQUFJLEVBQUUsRUFBRSxFQUFDLEVBQUM7Ozs7S0FDckI7SUFDTCwyQkFBQztBQUFELENBL0RBLEFBK0RDLENBL0R5QyxzQkFBTSxHQStEL0M7QUEvRFksb0RBQW9CIiwiZmlsZSI6InBlcnNpc3RlbnRDYWNoZVN0b3JlLmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgXyBmcm9tIFwibG9kYXNoXCI7XG5pbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5pbXBvcnQge1NlcmlhbGl6YXRpb25SZWdpc3RyeX0gZnJvbSBcIi4vc2VyaWFsaXphdGlvblJlZ2lzdHJ5XCI7XG5pbXBvcnQge1BlcnNpc3RlbnRDYWNoZX0gZnJvbSBcIi4vcGVyc2lzdGVudENhY2hlXCI7XG5pbXBvcnQge0FTdG9yZSwgSVNlcmlhbGl6ZWQsIElkU3RyaW5nLCBJU3RvcmVHZXRSZXN1bHQsIElTdG9yZVB1dFJlc3VsdH0gZnJvbSBcIi4vc2VyaWFsaXphdGlvblwiO1xuXG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTpuby1lbXB0eS1pbnRlcmZhY2VcbmludGVyZmFjZSBJUGVyc2lzdGVudENhY2hlU3Rvd1xue1xuICAgIC8vIEludGVudGlvbmFsbHkgbGVmdCBlbXB0eS5cbiAgICAvLyBQZXJzaXN0ZW50Q2FjaGUgZG9lcyBub3QgcmVxdWlyZSBhbnkgc3Rvd2VkIGRhdGEuXG59XG5cblxuZXhwb3J0IGNsYXNzIFBlcnNpc3RlbnRDYWNoZVN0b3JlIGV4dGVuZHMgQVN0b3JlPElQZXJzaXN0ZW50Q2FjaGVTdG93Plxue1xuXG4gICAgcHVibGljIHN0YXRpYyBjcmVhdGUocmVnaXN0cnk6IFNlcmlhbGl6YXRpb25SZWdpc3RyeSwgcGVyc2lzdGVudENhY2hlOiBQZXJzaXN0ZW50Q2FjaGU8SVNlcmlhbGl6ZWQ+KTogUHJvbWlzZTxQZXJzaXN0ZW50Q2FjaGVTdG9yZT5cbiAgICB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFBlcnNpc3RlbnRDYWNoZVN0b3JlKHJlZ2lzdHJ5LCBwZXJzaXN0ZW50Q2FjaGUpO1xuICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlc29sdmUoaW5zdGFuY2UpO1xuICAgIH1cblxuXG4gICAgLy8gcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX3BjYWNoZTogUGVyc2lzdGVudENhY2hlPElTZXJpYWxpemVkPjtcbiAgICAvLyBlbmRyZWdpb25cblxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihyZWdpc3RyeTogU2VyaWFsaXphdGlvblJlZ2lzdHJ5LCBwY2FjaGU6IFBlcnNpc3RlbnRDYWNoZTxJU2VyaWFsaXplZD4pXG4gICAge1xuICAgICAgICBzdXBlcihyZWdpc3RyeSk7XG4gICAgICAgIHRoaXMuX3BjYWNoZSA9IHBjYWNoZTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBhc3luYyBnZXRJZHMocmVnZXhwPzogUmVnRXhwKTogUHJvbWlzZTxBcnJheTxJZFN0cmluZz4+XG4gICAge1xuICAgICAgICBsZXQgaWRzOiBBcnJheTxJZFN0cmluZz4gPSBhd2FpdCB0aGlzLl9wY2FjaGUua2V5cygpO1xuICAgICAgICBpZiAocmVnZXhwID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHJldHVybiBpZHM7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBBIHJlZ3VsYXIgZXhwcmVzcyBoYXMgYmVlbiBzcGVjaWZpZWQsIHNvIGZpbHRlciBmb3IgdGhlIGlkcyB0aGF0XG4gICAgICAgIC8vIG1hdGNoLlxuICAgICAgICBpZHMgPSBfLmZpbHRlcihpZHMsIChjdXJJZCkgPT4gcmVnZXhwLnRlc3QoY3VySWQpKTtcbiAgICAgICAgcmV0dXJuIGlkcztcbiAgICB9XG5cblxuICAgIHByb3RlY3RlZCBhc3luYyBnZXQoaWQ6IElkU3RyaW5nKTogUHJvbWlzZTxJU3RvcmVHZXRSZXN1bHQ8SVBlcnNpc3RlbnRDYWNoZVN0b3c+PlxuICAgIHtcbiAgICAgICAgLy8gUmVhZCB0aGUgc3BlY2lmaWVkIGRhdGEgZnJvbSB0aGUgYmFja2luZyBzdG9yZS5cbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZCA9IGF3YWl0IHRoaXMuX3BjYWNoZS5nZXQoaWQpO1xuXG4gICAgICAgIC8vIFRyYW5zZm9ybSB0aGUgYmFja2luZyBzdG9yZSdzIHJlcHJlc2VudGF0aW9uIGludG8gYW4gSVNlcmlhbGl6ZWQuXG4gICAgICAgIC8vIFRoaXMgaXMgbm90IG5lZWRlZCBmb3IgUGVyc2lzdGVudENhY2hlLCBiZWNhdXNlIGl0IHN0b3JlcyB0aGUgZGF0YSBhc1xuICAgICAgICAvLyBhbiBJU2VyaWFsaXplZC5cblxuICAgICAgICAvLyBUaGVyZSBpcyBubyBzdG93ZWQgZGF0YSBmb3IgUGVyc2lzdGVudENhY2hlLlxuICAgICAgICByZXR1cm4ge3NlcmlhbGl6ZWQsIHN0b3c6IHt9fTtcbiAgICB9XG5cblxuICAgIHByb3RlY3RlZCBhc3luYyBwdXQoc2VyaWFsaXplZDogSVNlcmlhbGl6ZWQsIHN0b3c6IHVuZGVmaW5lZCB8IElQZXJzaXN0ZW50Q2FjaGVTdG93KTogUHJvbWlzZTxJU3RvcmVQdXRSZXN1bHQ8SVBlcnNpc3RlbnRDYWNoZVN0b3c+PlxuICAgIHtcbiAgICAgICAgLy8gVHJhbnNmb3JtIGBzZXJpYWxpemVkYCBpbnRvIHRoZSBiYWNraW5nIHN0b3JlJ3MgcmVwcmVzZW50YXRpb24uXG4gICAgICAgIC8vIFRoaXMgaXMgbm90IG5lZWRlZCBmb3IgUGVyc2lzdGVudENhY2hlLCBiZWNhdXNlIGl0IHN0b3JlcyB0aGUgZGF0YSBhc1xuICAgICAgICAvLyBhbiBJU2VyaWFsaXplZC5cblxuICAgICAgICAvLyBXcml0ZSB0aGUgZGF0YSB0byB0aGUgYmFja2luZyBzdG9yZS5cbiAgICAgICAgYXdhaXQgdGhpcy5fcGNhY2hlLnB1dChzZXJpYWxpemVkLmlkLCBzZXJpYWxpemVkKTtcblxuICAgICAgICAvLyBSZXR1cm4gdGhlIG5ldyBzdG93IGRhdGEgdGhhdCBzaG91bGQgYmUgcGxhY2VkIG9uIHRoZSBvcmlnaW5hbFxuICAgICAgICAvLyBvYmplY3QuIFRoaXMgaXMgbm90IG5lZWRlZCBmb3IgUGVyc2lzdGVudENhY2hlLlxuICAgICAgICByZXR1cm4ge3N0b3c6IHt9fTtcbiAgICB9XG59XG4iXX0=
