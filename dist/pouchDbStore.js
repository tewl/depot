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
var PouchDbStore = /** @class */ (function (_super) {
    __extends(PouchDbStore, _super);
    // endregion
    function PouchDbStore(registry, pouchDb) {
        var _this = _super.call(this, registry) || this;
        _this._db = pouchDb;
        return _this;
    }
    PouchDbStore.create = function (registry, pouchDb) {
        var instance = new PouchDbStore(registry, pouchDb);
        return BBPromise.resolve(instance);
    };
    PouchDbStore.prototype.getIds = function (regexp) {
        return __awaiter(this, void 0, void 0, function () {
            var allDocsResponse, ids;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._db.allDocs()];
                    case 1:
                        allDocsResponse = _a.sent();
                        ids = _.map(allDocsResponse.rows, function (curRow) { return curRow.id; });
                        if (regexp === undefined) {
                            return [2 /*return*/, ids];
                        }
                        // A regular express has been specified, so filter for the ids that match.
                        ids = _.filter(ids, function (curId) { return regexp.test(curId); });
                        return [2 /*return*/, ids];
                }
            });
        });
    };
    PouchDbStore.prototype.get = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var dbRepresentation, serialized;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._db.get(id)];
                    case 1:
                        dbRepresentation = _a.sent();
                        serialized = _.mapKeys(dbRepresentation, function (value, key) {
                            if (key === "_id") {
                                return "id";
                            }
                            else {
                                return key;
                            }
                        });
                        return [2 /*return*/, {
                                serialized: serialized,
                                stow: { _rev: dbRepresentation._rev }
                            }];
                }
            });
        });
    };
    PouchDbStore.prototype.put = function (serialized, stow) {
        return __awaiter(this, void 0, void 0, function () {
            var doc, putResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        doc = _.mapKeys(serialized, function (value, key) {
                            if (key === "id") {
                                return "_id";
                            }
                            else {
                                return key;
                            }
                        });
                        // Copy needed properties from the stowed data onto the backing store representation.
                        if (stow) {
                            _.assign(doc, stow);
                        }
                        return [4 /*yield*/, this._db.put(doc)];
                    case 1:
                        putResult = _a.sent();
                        // Return the new stow data so that it can be applied to the original object.
                        return [2 /*return*/, {
                                stow: {
                                    _rev: putResult.rev
                                }
                            }];
                }
            });
        });
    };
    return PouchDbStore;
}(serialization_1.AStore));
exports.PouchDbStore = PouchDbStore;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wb3VjaERiU3RvcmUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSwwQkFBNEI7QUFDNUIsb0NBQXNDO0FBR3RDLGlEQUFnRztBQVNoRztJQUFrQyxnQ0FBb0I7SUFZbEQsWUFBWTtJQUdaLHNCQUFvQixRQUErQixFQUFFLE9BQXlCO1FBQTlFLFlBRUksa0JBQU0sUUFBUSxDQUFDLFNBRWxCO1FBREcsS0FBSSxDQUFDLEdBQUcsR0FBRyxPQUFPLENBQUM7O0lBQ3ZCLENBQUM7SUFoQmEsbUJBQU0sR0FBcEIsVUFBcUIsUUFBK0IsRUFBRSxPQUF5QjtRQUUzRSxJQUFNLFFBQVEsR0FBRyxJQUFJLFlBQVksQ0FBQyxRQUFRLEVBQUUsT0FBTyxDQUFDLENBQUM7UUFDckQsT0FBTyxTQUFTLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDO0lBQ3ZDLENBQUM7SUFlWSw2QkFBTSxHQUFuQixVQUFvQixNQUFlOzs7Ozs0QkFFUCxxQkFBTSxJQUFJLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxFQUFBOzt3QkFBMUMsZUFBZSxHQUFHLFNBQXdCO3dCQUM1QyxHQUFHLEdBQWtCLENBQUMsQ0FBQyxHQUFHLENBQUMsZUFBZSxDQUFDLElBQUksRUFBRSxVQUFDLE1BQU0sSUFBSyxPQUFBLE1BQU0sQ0FBQyxFQUFFLEVBQVQsQ0FBUyxDQUFDLENBQUM7d0JBRTVFLElBQUksTUFBTSxLQUFLLFNBQVMsRUFBRTs0QkFDdEIsc0JBQU8sR0FBRyxFQUFDO3lCQUNkO3dCQUVELDBFQUEwRTt3QkFDMUUsR0FBRyxHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxFQUFFLFVBQUMsS0FBSyxJQUFLLE9BQUEsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBbEIsQ0FBa0IsQ0FBQyxDQUFDO3dCQUNuRCxzQkFBTyxHQUFHLEVBQUM7Ozs7S0FDZDtJQUdlLDBCQUFHLEdBQW5CLFVBQW9CLEVBQVk7Ozs7OzRCQUdILHFCQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEVBQUUsQ0FBQyxFQUFBOzt3QkFBekMsZ0JBQWdCLEdBQUcsU0FBc0I7d0JBR3pDLFVBQVUsR0FBRyxDQUFDLENBQUMsT0FBTyxDQUFDLGdCQUFnQixFQUFFLFVBQUMsS0FBSyxFQUFFLEdBQUc7NEJBQ3RELElBQUksR0FBRyxLQUFLLEtBQUssRUFBRTtnQ0FDZixPQUFPLElBQUksQ0FBQzs2QkFDZjtpQ0FDSTtnQ0FDRCxPQUFPLEdBQUcsQ0FBQzs2QkFDZDt3QkFDTCxDQUFDLENBQUMsQ0FBQzt3QkFFSCxzQkFBTztnQ0FDSCxVQUFVLEVBQUUsVUFBb0M7Z0NBQ2hELElBQUksRUFBUSxFQUFDLElBQUksRUFBRSxnQkFBZ0IsQ0FBQyxJQUFJLEVBQUM7NkJBQzVDLEVBQUM7Ozs7S0FDTDtJQUdlLDBCQUFHLEdBQW5CLFVBQW9CLFVBQXVCLEVBQUUsSUFBOEI7Ozs7Ozt3QkFLakUsR0FBRyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsVUFBVSxFQUFFLFVBQUMsS0FBSyxFQUFFLEdBQUc7NEJBQ3pDLElBQUksR0FBRyxLQUFLLElBQUksRUFBRTtnQ0FDZCxPQUFPLEtBQUssQ0FBQzs2QkFDaEI7aUNBQ0k7Z0NBQ0QsT0FBTyxHQUFHLENBQUM7NkJBQ2Q7d0JBQ0wsQ0FBQyxDQUFDLENBQUM7d0JBRUgscUZBQXFGO3dCQUNyRixJQUFJLElBQUksRUFBRTs0QkFDTixDQUFDLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRSxJQUFJLENBQUMsQ0FBQzt5QkFDdkI7d0JBR2lCLHFCQUFNLElBQUksQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLEdBQUcsQ0FBQyxFQUFBOzt3QkFBbkMsU0FBUyxHQUFHLFNBQXVCO3dCQUV6Qyw2RUFBNkU7d0JBQzdFLHNCQUFPO2dDQUNILElBQUksRUFBRTtvQ0FDRixJQUFJLEVBQUUsU0FBUyxDQUFDLEdBQUc7aUNBQ3RCOzZCQUNKLEVBQUM7Ozs7S0FDTDtJQUNMLG1CQUFDO0FBQUQsQ0F4RkEsQUF3RkMsQ0F4RmlDLHNCQUFNLEdBd0Z2QztBQXhGWSxvQ0FBWSIsImZpbGUiOiJwb3VjaERiU3RvcmUuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCAqIGFzIFBvdWNoREIgZnJvbSBcInBvdWNoZGJcIjtcbmltcG9ydCB7U2VyaWFsaXphdGlvblJlZ2lzdHJ5fSBmcm9tIFwiLi9zZXJpYWxpemF0aW9uUmVnaXN0cnlcIjtcbmltcG9ydCB7QVN0b3JlLCBJZFN0cmluZywgSVNlcmlhbGl6ZWQsIElTdG9yZUdldFJlc3VsdCwgSVN0b3JlUHV0UmVzdWx0fSBmcm9tIFwiLi9zZXJpYWxpemF0aW9uXCI7XG5cblxuaW50ZXJmYWNlIElQb3VjaERiU3Rvd1xue1xuICAgIF9yZXY6IHN0cmluZztcbn1cblxuXG5leHBvcnQgY2xhc3MgUG91Y2hEYlN0b3JlIGV4dGVuZHMgQVN0b3JlPElQb3VjaERiU3Rvdz5cbntcblxuICAgIHB1YmxpYyBzdGF0aWMgY3JlYXRlKHJlZ2lzdHJ5OiBTZXJpYWxpemF0aW9uUmVnaXN0cnksIHBvdWNoRGI6IFBvdWNoREIuRGF0YWJhc2UpOiBQcm9taXNlPFBvdWNoRGJTdG9yZT5cbiAgICB7XG4gICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFBvdWNoRGJTdG9yZShyZWdpc3RyeSwgcG91Y2hEYik7XG4gICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZShpbnN0YW5jZSk7XG4gICAgfVxuXG5cbiAgICAvLyByZWdpb24gRGF0YSBNZW1iZXJzXG4gICAgcHJpdmF0ZSByZWFkb25seSBfZGI6IFBvdWNoREIuRGF0YWJhc2U7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IocmVnaXN0cnk6IFNlcmlhbGl6YXRpb25SZWdpc3RyeSwgcG91Y2hEYjogUG91Y2hEQi5EYXRhYmFzZSlcbiAgICB7XG4gICAgICAgIHN1cGVyKHJlZ2lzdHJ5KTtcbiAgICAgICAgdGhpcy5fZGIgPSBwb3VjaERiO1xuICAgIH1cblxuXG4gICAgcHVibGljIGFzeW5jIGdldElkcyhyZWdleHA/OiBSZWdFeHApOiBQcm9taXNlPEFycmF5PElkU3RyaW5nPj5cbiAgICB7XG4gICAgICAgIGNvbnN0IGFsbERvY3NSZXNwb25zZSA9IGF3YWl0IHRoaXMuX2RiLmFsbERvY3MoKTtcbiAgICAgICAgbGV0IGlkczogQXJyYXk8c3RyaW5nPiA9IF8ubWFwKGFsbERvY3NSZXNwb25zZS5yb3dzLCAoY3VyUm93KSA9PiBjdXJSb3cuaWQpO1xuXG4gICAgICAgIGlmIChyZWdleHAgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgcmV0dXJuIGlkcztcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIEEgcmVndWxhciBleHByZXNzIGhhcyBiZWVuIHNwZWNpZmllZCwgc28gZmlsdGVyIGZvciB0aGUgaWRzIHRoYXQgbWF0Y2guXG4gICAgICAgIGlkcyA9IF8uZmlsdGVyKGlkcywgKGN1cklkKSA9PiByZWdleHAudGVzdChjdXJJZCkpO1xuICAgICAgICByZXR1cm4gaWRzO1xuICAgIH1cblxuXG4gICAgcHJvdGVjdGVkIGFzeW5jIGdldChpZDogSWRTdHJpbmcpOiBQcm9taXNlPElTdG9yZUdldFJlc3VsdDxJUG91Y2hEYlN0b3c+PlxuICAgIHtcbiAgICAgICAgLy8gUmVhZCB0aGUgc3BlY2lmaWVkIGRhdGEgZnJvbSB0aGUgYmFja2luZyBzdG9yZS5cbiAgICAgICAgY29uc3QgZGJSZXByZXNlbnRhdGlvbiA9IGF3YWl0IHRoaXMuX2RiLmdldChpZCk7XG5cbiAgICAgICAgLy8gVHJhbnNmb3JtIHRoZSBiYWNraW5nIHN0b3JlJ3MgcmVwcmVzZW50YXRpb24gaW50byBhbiBJU2VyaWFsaXplZC5cbiAgICAgICAgY29uc3Qgc2VyaWFsaXplZCA9IF8ubWFwS2V5cyhkYlJlcHJlc2VudGF0aW9uLCAodmFsdWUsIGtleSkgPT4ge1xuICAgICAgICAgICAgaWYgKGtleSA9PT0gXCJfaWRcIikge1xuICAgICAgICAgICAgICAgIHJldHVybiBcImlkXCI7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4ga2V5O1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2VyaWFsaXplZDogc2VyaWFsaXplZCBhcyB1bmtub3duIGFzIElTZXJpYWxpemVkLFxuICAgICAgICAgICAgc3RvdzogICAgICAge19yZXY6IGRiUmVwcmVzZW50YXRpb24uX3Jldn1cbiAgICAgICAgfTtcbiAgICB9XG5cblxuICAgIHByb3RlY3RlZCBhc3luYyBwdXQoc2VyaWFsaXplZDogSVNlcmlhbGl6ZWQsIHN0b3c6IHVuZGVmaW5lZCB8IElQb3VjaERiU3Rvdyk6IFByb21pc2U8SVN0b3JlUHV0UmVzdWx0PElQb3VjaERiU3Rvdz4+XG4gICAge1xuICAgICAgICAvLyBUcmFuc2Zvcm0gYHNlcmlhbGl6ZWRgIGludG8gdGhlIGJhY2tpbmcgc3RvcmUncyByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgLy8gRm9yIFBvdWNoREIsIHRoaXMgbWVhbnM6XG4gICAgICAgIC8vICAgLSBtb3ZlIGBpZGAgdG8gYF9pZGBcbiAgICAgICAgY29uc3QgZG9jID0gXy5tYXBLZXlzKHNlcmlhbGl6ZWQsICh2YWx1ZSwga2V5KSA9PiB7XG4gICAgICAgICAgICBpZiAoa2V5ID09PSBcImlkXCIpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gXCJfaWRcIjtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIHJldHVybiBrZXk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIENvcHkgbmVlZGVkIHByb3BlcnRpZXMgZnJvbSB0aGUgc3Rvd2VkIGRhdGEgb250byB0aGUgYmFja2luZyBzdG9yZSByZXByZXNlbnRhdGlvbi5cbiAgICAgICAgaWYgKHN0b3cpIHtcbiAgICAgICAgICAgIF8uYXNzaWduKGRvYywgc3Rvdyk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBXcml0ZSB0aGUgZG9jdW1lbnQgdG8gdGhlIGRiLlxuICAgICAgICBjb25zdCBwdXRSZXN1bHQgPSBhd2FpdCB0aGlzLl9kYi5wdXQoZG9jKTtcblxuICAgICAgICAvLyBSZXR1cm4gdGhlIG5ldyBzdG93IGRhdGEgc28gdGhhdCBpdCBjYW4gYmUgYXBwbGllZCB0byB0aGUgb3JpZ2luYWwgb2JqZWN0LlxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc3Rvdzoge1xuICAgICAgICAgICAgICAgIF9yZXY6IHB1dFJlc3VsdC5yZXZcbiAgICAgICAgICAgIH1cbiAgICAgICAgfTtcbiAgICB9XG59XG4iXX0=
