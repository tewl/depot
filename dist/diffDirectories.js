"use strict";
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
var __read = (this && this.__read) || function (o, n) {
    var m = typeof Symbol === "function" && o[Symbol.iterator];
    if (!m) return o;
    var i = m.call(o), r, ar = [], e;
    try {
        while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
    }
    catch (error) { e = { error: error }; }
    finally {
        try {
            if (r && !r.done && (m = i["return"])) m.call(i);
        }
        finally { if (e) throw e.error; }
    }
    return ar;
};
var __values = (this && this.__values) || function (o) {
    var m = typeof Symbol === "function" && o[Symbol.iterator], i = 0;
    if (m) return m.call(o);
    return {
        next: function () {
            if (o && i >= o.length) o = void 0;
            return { value: o && o[i++], done: !o };
        }
    };
};
Object.defineProperty(exports, "__esModule", { value: true });
var path = require("path");
var _ = require("lodash");
var BBPromise = require("bluebird");
var file_1 = require("./file");
var ActionPriority;
(function (ActionPriority) {
    ActionPriority["L_TO_R"] = "sync left to right";
    ActionPriority["R_TO_L"] = "sync right to left";
})(ActionPriority = exports.ActionPriority || (exports.ActionPriority = {}));
var DiffDirFileItemActionType;
(function (DiffDirFileItemActionType) {
    DiffDirFileItemActionType["COPY_LEFT"] = "copy left";
    DiffDirFileItemActionType["COPY_RIGHT"] = "copy right";
    DiffDirFileItemActionType["DELETE_LEFT"] = "delete left";
    DiffDirFileItemActionType["DELETE_RIGHT"] = "delete right";
    DiffDirFileItemActionType["DELETE_BOTH"] = "delete both";
    DiffDirFileItemActionType["SKIP"] = "skip";
})(DiffDirFileItemActionType = exports.DiffDirFileItemActionType || (exports.DiffDirFileItemActionType = {}));
var DiffDirFileItemAction = /** @class */ (function () {
    function DiffDirFileItemAction(fileItem, actionType) {
        this._fileItem = fileItem;
        this._actionType = actionType;
    }
    Object.defineProperty(DiffDirFileItemAction.prototype, "type", {
        get: function () {
            return this._actionType;
        },
        enumerable: true,
        configurable: true
    });
    /**
     * Performs this action.
     * @return A promise that is resolved when the action has completed
     *     successfully or rejects if it failed.
     */
    DiffDirFileItemAction.prototype.execute = function () {
        if (this._actionType === DiffDirFileItemActionType.COPY_LEFT) {
            // In order to copy left, the right file must exist.
            if (this._fileItem.rightFile === undefined) {
                return BBPromise.reject(new Error("COPY_LEFT cannot be done without a right file."));
            }
            var destFile = new file_1.File(this._fileItem.leftRootDir, this._fileItem.relativeFilePath);
            return this._fileItem.rightFile.copy(destFile)
                .then(function () { });
        }
        else if (this._actionType === DiffDirFileItemActionType.COPY_RIGHT) {
            // In order to copy right, the left file must exist.
            if (this._fileItem.leftFile === undefined) {
                return BBPromise.reject(new Error("COPY_RIGHT cannot be done without a left file."));
            }
            var destFile = new file_1.File(this._fileItem.rightRootDir, this._fileItem.relativeFilePath);
            return this._fileItem.leftFile.copy(destFile)
                .then(function () { });
        }
        else if (this._actionType === DiffDirFileItemActionType.DELETE_LEFT) {
            // In order to delete left, the left file must exist.
            if (this._fileItem.leftFile === undefined) {
                return BBPromise.reject(new Error("DELETE_LEFT cannot be done without a left file."));
            }
            return this._fileItem.leftFile.delete();
        }
        else if (this._actionType === DiffDirFileItemActionType.DELETE_RIGHT) {
            // In order to delete right, the right file must exist.
            if (this._fileItem.rightFile === undefined) {
                return BBPromise.reject(new Error("DELETE_RIGHT cannot be done without a right file."));
            }
            return this._fileItem.rightFile.delete();
        }
        else if (this._actionType === DiffDirFileItemActionType.DELETE_BOTH) {
            // In order to delete the left file, the left file must exist.
            if (this._fileItem.leftFile === undefined) {
                return BBPromise.reject(new Error("DELETE_BOTH cannot be done without a left file."));
            }
            // In order to delete the right file, the right file must exist.
            if (this._fileItem.rightFile === undefined) {
                return BBPromise.reject(new Error("DELETE_BOTH cannot be done without a right file."));
            }
            return BBPromise.all([
                this._fileItem.leftFile.delete(),
                this._fileItem.rightFile.delete()
            ])
                .then(function () { });
        }
        else if (this._actionType === DiffDirFileItemActionType.SKIP) {
            return BBPromise.resolve();
        }
        else {
            return BBPromise.reject(new Error("Unsupported action \"" + this._actionType + "\"."));
        }
    };
    return DiffDirFileItemAction;
}());
exports.DiffDirFileItemAction = DiffDirFileItemAction;
// tslint:disable-next-line:max-classes-per-file
var DiffDirFileItem = /** @class */ (function () {
    // #endregion
    function DiffDirFileItem(leftRootDir, rightRootDir, relativeFilePath, leftFile, rightFile, bothExistAndIdentical, actionPriority) {
        this._leftRootDir = leftRootDir;
        this._rightRootDir = rightRootDir;
        this._relativeFilePath = relativeFilePath;
        this._leftFile = leftFile;
        this._rightFile = rightFile;
        this._bothExistAndIdentical = bothExistAndIdentical;
        this._actionPriority = actionPriority;
        this._actions = [];
        if (this.isLeftOnly) {
            if (actionPriority === ActionPriority.L_TO_R) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
            }
            else if (actionPriority === ActionPriority.R_TO_L) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_LEFT));
            }
        }
        else if (this.isRightOnly) {
            if (actionPriority === ActionPriority.L_TO_R) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
            }
            else if (actionPriority === ActionPriority.R_TO_L) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_RIGHT));
            }
        }
        else { // this.isInBoth() => true
            if (bothExistAndIdentical) {
                // When the files are identical, there should be no actions.
            }
            else if (actionPriority === ActionPriority.L_TO_R) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
            else if (actionPriority === ActionPriority.R_TO_L) {
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
            else {
                // No action priority specified.  Give priority to preserving
                // files.
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_RIGHT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.COPY_LEFT));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.SKIP));
                this._actions.push(new DiffDirFileItemAction(this, DiffDirFileItemActionType.DELETE_BOTH));
            }
        }
    }
    /**
     * Creates a new instance.
     * @param leftRootDir - The left directory being compared
     * @param rightRootDir - The right directory being compared
     * @param relativeFilePath - The relative file path (to the directory being
     *     compared)
     * @param leftFile - The left-side file being compared (if any)
     * @param rightFile - The right-side file being compared (if any)
     * @param actionPriority - The overall action being performed so that the
     *     actions associated with this file item can be prioritized
     * @return A newly created DiffDirFileItem instance
     */
    DiffDirFileItem.create = function (leftRootDir, rightRootDir, relativeFilePath, leftFile, rightFile, actionPriority) {
        return __awaiter(this, void 0, void 0, function () {
            var bothFilesExistAndIdentical, _a, leftHash, rightHash;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        // TODO: Need to find references to this static function and update them
                        // because this method is now async.
                        // The relative file path must be legit.
                        if (relativeFilePath.length === 0) {
                            return [2 /*return*/, BBPromise.reject(new Error("DiffDirFileItem relative file path cannot be 0-length."))];
                        }
                        // Either leftFile or rightFile or both should be defined.  If both are
                        // undefined, there is a problem.
                        if ((leftFile === undefined) && (rightFile === undefined)) {
                            return [2 /*return*/, BBPromise.reject(new Error("DiffDirFileItem cannot have undefined left and right files."))];
                        }
                        bothFilesExistAndIdentical = false;
                        if (!((leftFile !== undefined) && (rightFile !== undefined))) return [3 /*break*/, 2];
                        return [4 /*yield*/, BBPromise.all([leftFile.getHash(), rightFile.getHash()])];
                    case 1:
                        _a = __read.apply(void 0, [_b.sent(), 2]), leftHash = _a[0], rightHash = _a[1];
                        bothFilesExistAndIdentical = (leftHash === rightHash);
                        _b.label = 2;
                    case 2: return [2 /*return*/, new DiffDirFileItem(leftRootDir, rightRootDir, relativeFilePath, leftFile, rightFile, bothFilesExistAndIdentical, actionPriority)];
                }
            });
        });
    };
    Object.defineProperty(DiffDirFileItem.prototype, "leftRootDir", {
        get: function () {
            return this._leftRootDir;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "rightRootDir", {
        get: function () {
            return this._rightRootDir;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "relativeFilePath", {
        get: function () {
            return this._relativeFilePath;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "leftFile", {
        get: function () {
            return this._leftFile;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "rightFile", {
        get: function () {
            return this._rightFile;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "actionPriority", {
        get: function () {
            return this._actionPriority;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "actions", {
        get: function () {
            return this._actions;
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "isLeftOnly", {
        get: function () {
            return (this._leftFile !== undefined) && (this._rightFile === undefined);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "isRightOnly", {
        get: function () {
            return (this._leftFile === undefined) && (this._rightFile !== undefined);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "isInBoth", {
        get: function () {
            return (this._leftFile !== undefined) && (this._rightFile !== undefined);
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(DiffDirFileItem.prototype, "bothExistAndIdentical", {
        get: function () {
            return this._bothExistAndIdentical;
        },
        enumerable: true,
        configurable: true
    });
    return DiffDirFileItem;
}());
exports.DiffDirFileItem = DiffDirFileItem;
/**
 * Compares (recursively) the files within two directories.
 * @param leftDir - The left directory to be compared
 * @param rightDir - The right directory to be compared
 * @param actionPriority - The action being performed so that the actions
 *     associated with each result can be prioritized.
 * @param includeIdentical - Whether to include files that are identical in both
 *     `leftDir` and `rightDir` in the returned resuls.  If true, identical
 *     files will be included with a 0-length array of actions.
 * @return An array of items representing the differences found between
 *     `leftDir` and `rightDir`.
 */
function diffDirectories(leftDir, rightDir, actionPriority, includeIdentical) {
    if (includeIdentical === void 0) { includeIdentical = false; }
    var leftFiles;
    var rightFiles;
    // Get the left-side files, accounting for nonexistence.
    var leftContentsPromise = leftDir.contents(true)
        .then(function (leftContents) { leftFiles = leftContents.files; }, function () { leftFiles = []; });
    // Get the right-side files, accounting for nonexistence.
    var rightContentsPromise = rightDir.contents(true)
        .then(function (rightContents) { rightFiles = rightContents.files; }, function () { rightFiles = []; });
    return BBPromise.all([leftContentsPromise, rightContentsPromise])
        .then(function () {
        var e_1, _a;
        var diffMap = new Map();
        // Put the left files into the diff map.
        _.forEach(leftFiles, function (curFile) {
            var relativePath = file_1.File.relativeParts(leftDir, curFile).join(path.sep);
            diffMap.set(relativePath, { leftFile: curFile });
        });
        // Put the right files into the diff map.
        _.forEach(rightFiles, function (curFile) {
            var relativePath = file_1.File.relativeParts(rightDir, curFile).join(path.sep);
            if (diffMap.has(relativePath)) {
                diffMap.get(relativePath).rightFile = curFile;
            }
            else {
                diffMap.set(relativePath, { rightFile: curFile });
            }
        });
        // Iterate over the diff map, creating a diffDirFileItem for each entry.
        var diffDirFileItemPromises = [];
        try {
            for (var diffMap_1 = __values(diffMap), diffMap_1_1 = diffMap_1.next(); !diffMap_1_1.done; diffMap_1_1 = diffMap_1.next()) {
                var _b = __read(diffMap_1_1.value, 2), relativePath = _b[0], files = _b[1];
                diffDirFileItemPromises.push(DiffDirFileItem.create(leftDir, rightDir, relativePath, files.leftFile, files.rightFile, actionPriority));
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (diffMap_1_1 && !diffMap_1_1.done && (_a = diffMap_1.return)) _a.call(diffMap_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return BBPromise.all(diffDirFileItemPromises);
    })
        .then(function (diffDirFileItems) {
        // If not including identical files, remove them.
        if (!includeIdentical) {
            _.remove(diffDirFileItems, function (curDiffDirFileItem) {
                return curDiffDirFileItem.bothExistAndIdentical;
            });
        }
        // Sort the items so that left-only items are next to right-only items
        // in the final result.
        diffDirFileItems = _.sortBy(diffDirFileItems, function (curDiffDirFileItem) { return curDiffDirFileItem.relativeFilePath; });
        return diffDirFileItems;
    });
}
exports.diffDirectories = diffDirectories;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9kaWZmRGlyZWN0b3JpZXMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsMkJBQTZCO0FBQzdCLDBCQUE0QjtBQUM1QixvQ0FBc0M7QUFFdEMsK0JBQTRCO0FBRzVCLElBQVksY0FHWDtBQUhELFdBQVksY0FBYztJQUN0QiwrQ0FBNkIsQ0FBQTtJQUM3QiwrQ0FBNkIsQ0FBQTtBQUNqQyxDQUFDLEVBSFcsY0FBYyxHQUFkLHNCQUFjLEtBQWQsc0JBQWMsUUFHekI7QUFHRCxJQUFZLHlCQVFYO0FBUkQsV0FBWSx5QkFBeUI7SUFFakMsb0RBQTBCLENBQUE7SUFDMUIsc0RBQTJCLENBQUE7SUFDM0Isd0RBQTRCLENBQUE7SUFDNUIsMERBQTZCLENBQUE7SUFDN0Isd0RBQTRCLENBQUE7SUFDNUIsMENBQXFCLENBQUE7QUFDekIsQ0FBQyxFQVJXLHlCQUF5QixHQUF6QixpQ0FBeUIsS0FBekIsaUNBQXlCLFFBUXBDO0FBR0Q7SUFNSSwrQkFDSSxRQUF5QixFQUN6QixVQUFxQztRQUdyQyxJQUFJLENBQUMsU0FBUyxHQUFLLFFBQVEsQ0FBQztRQUM1QixJQUFJLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQztJQUNsQyxDQUFDO0lBR0Qsc0JBQVcsdUNBQUk7YUFBZjtZQUVJLE9BQU8sSUFBSSxDQUFDLFdBQVcsQ0FBQztRQUM1QixDQUFDOzs7T0FBQTtJQUdEOzs7O09BSUc7SUFDSSx1Q0FBTyxHQUFkO1FBRUksSUFBSSxJQUFJLENBQUMsV0FBVyxLQUFLLHlCQUF5QixDQUFDLFNBQVMsRUFBRTtZQUMxRCxvREFBb0Q7WUFDcEQsSUFBSSxJQUFJLENBQUMsU0FBUyxDQUFDLFNBQVMsS0FBSyxTQUFTLEVBQUU7Z0JBQ3hDLE9BQU8sU0FBUyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxnREFBZ0QsQ0FBQyxDQUFDLENB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LElBQUEsaUNBQXFCLEVBQXBCLG9CQUFZLEVBQUUsYUFBSztnQkFDM0IsdUJBQXVCLENBQUMsSUFBSSxDQUFDLGVBQWUsQ0FBQyxNQUFNLENBQy9DLE9BQU8sRUFDUCxRQUFRLEVBQ1IsWUFBWSxFQUNaLEtBQUssQ0FBQyxRQUFRLEVBQ2QsS0FBSyxDQUFDLFNBQVMsRUFDZixjQUFjLENBQ2pCLENBQUMsQ0FBQzthQUNOOzs7Ozs7Ozs7UUFFRCxPQUFPLFNBQVMsQ0FBQyxHQUFHLENBQUMsdUJBQXVCLENBQUMsQ0FBQztJQUNsRCxDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsVUFBQyxnQkFBd0M7UUFFM0MsaURBQWlEO1FBQ2pELElBQUksQ0FBQyxnQkFBZ0IsRUFBRTtZQUNuQixDQUFDLENBQUMsTUFBTSxDQUFDLGdCQUFnQixFQUFFLFVBQUMsa0JBQW1DO2dCQUMzRCxPQUFPLGtCQUFrQixDQUFDLHFCQUFxQixDQUFDO1lBQ3BELENBQUMsQ0FBQyxDQUFDO1NBQ047UUFFRCxzRUFBc0U7UUFDdEUsdUJBQXVCO1FBQ3ZCLGdCQUFnQixHQUFHLENBQUMsQ0FBQyxNQUFNLENBQUMsZ0JBQWdCLEVBQUUsVUFBQyxrQkFBa0IsSUFBSyxPQUFBLGtCQUFrQixDQUFDLGdCQUFnQixFQUFuQyxDQUFtQyxDQUFDLENBQUM7UUFDM0csT0FBTyxnQkFBZ0IsQ0FBQztJQUM1QixDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUEzRUQsMENBMkVDIiwiZmlsZSI6ImRpZmZEaXJlY3Rvcmllcy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIHBhdGggZnJvbSBcInBhdGhcIjtcbmltcG9ydCAqIGFzIF8gZnJvbSBcImxvZGFzaFwiO1xuaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0IHsgRGlyZWN0b3J5IH0gZnJvbSBcIi4vZGlyZWN0b3J5XCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcblxuXG5leHBvcnQgZW51bSBBY3Rpb25Qcmlvcml0eSB7XG4gICAgTF9UT19SID0gXCJzeW5jIGxlZnQgdG8gcmlnaHRcIixcbiAgICBSX1RPX0wgPSBcInN5bmMgcmlnaHQgdG8gbGVmdFwiXG59XG5cblxuZXhwb3J0IGVudW0gRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZVxue1xuICAgIENPUFlfTEVGVCAgICA9IFwiY29weSBsZWZ0XCIsXG4gICAgQ09QWV9SSUdIVCAgID0gXCJjb3B5IHJpZ2h0XCIsXG4gICAgREVMRVRFX0xFRlQgID0gXCJkZWxldGUgbGVmdFwiLFxuICAgIERFTEVURV9SSUdIVCA9IFwiZGVsZXRlIHJpZ2h0XCIsXG4gICAgREVMRVRFX0JPVEggID0gXCJkZWxldGUgYm90aFwiLFxuICAgIFNLSVAgICAgICAgICA9IFwic2tpcFwiXG59XG5cblxuZXhwb3J0IGNsYXNzIERpZmZEaXJGaWxlSXRlbUFjdGlvblxue1xuXG4gICAgcHJpdmF0ZSBfZmlsZUl0ZW06IERpZmZEaXJGaWxlSXRlbTtcbiAgICBwcml2YXRlIF9hY3Rpb25UeXBlOiBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlO1xuXG4gICAgcHVibGljIGNvbnN0cnVjdG9yKFxuICAgICAgICBmaWxlSXRlbTogRGlmZkRpckZpbGVJdGVtLFxuICAgICAgICBhY3Rpb25UeXBlOiBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlXG4gICAgKVxuICAgIHtcbiAgICAgICAgdGhpcy5fZmlsZUl0ZW0gICA9IGZpbGVJdGVtO1xuICAgICAgICB0aGlzLl9hY3Rpb25UeXBlID0gYWN0aW9uVHlwZTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgdHlwZSgpOiBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fYWN0aW9uVHlwZTtcbiAgICB9XG5cblxuICAgIC8qKlxuICAgICAqIFBlcmZvcm1zIHRoaXMgYWN0aW9uLlxuICAgICAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2hlbiB0aGUgYWN0aW9uIGhhcyBjb21wbGV0ZWRcbiAgICAgKiAgICAgc3VjY2Vzc2Z1bGx5IG9yIHJlamVjdHMgaWYgaXQgZmFpbGVkLlxuICAgICAqL1xuICAgIHB1YmxpYyBleGVjdXRlKCk6IFByb21pc2U8dm9pZD5cbiAgICB7XG4gICAgICAgIGlmICh0aGlzLl9hY3Rpb25UeXBlID09PSBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkNPUFlfTEVGVCkge1xuICAgICAgICAgICAgLy8gSW4gb3JkZXIgdG8gY29weSBsZWZ0LCB0aGUgcmlnaHQgZmlsZSBtdXN0IGV4aXN0LlxuICAgICAgICAgICAgaWYgKHRoaXMuX2ZpbGVJdGVtLnJpZ2h0RmlsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiQ09QWV9MRUZUIGNhbm5vdCBiZSBkb25lIHdpdGhvdXQgYSByaWdodCBmaWxlLlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjb25zdCBkZXN0RmlsZTogRmlsZSA9IG5ldyBGaWxlKHRoaXMuX2ZpbGVJdGVtLmxlZnRSb290RGlyLCB0aGlzLl9maWxlSXRlbS5yZWxhdGl2ZUZpbGVQYXRoKTtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maWxlSXRlbS5yaWdodEZpbGUuY29weShkZXN0RmlsZSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHsgfSk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSBpZiAodGhpcy5fYWN0aW9uVHlwZSA9PT0gRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5DT1BZX1JJR0hUKSB7XG4gICAgICAgICAgICAvLyBJbiBvcmRlciB0byBjb3B5IHJpZ2h0LCB0aGUgbGVmdCBmaWxlIG11c3QgZXhpc3QuXG4gICAgICAgICAgICBpZiAodGhpcy5fZmlsZUl0ZW0ubGVmdEZpbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkNPUFlfUklHSFQgY2Fubm90IGJlIGRvbmUgd2l0aG91dCBhIGxlZnQgZmlsZS5cIikpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29uc3QgZGVzdEZpbGU6IEZpbGUgPSBuZXcgRmlsZSh0aGlzLl9maWxlSXRlbS5yaWdodFJvb3REaXIsIHRoaXMuX2ZpbGVJdGVtLnJlbGF0aXZlRmlsZVBhdGgpO1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2ZpbGVJdGVtLmxlZnRGaWxlLmNvcHkoZGVzdEZpbGUpXG4gICAgICAgICAgICAudGhlbigoKSA9PiB7IH0pO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2FjdGlvblR5cGUgPT09IERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuREVMRVRFX0xFRlQpIHtcbiAgICAgICAgICAgIC8vIEluIG9yZGVyIHRvIGRlbGV0ZSBsZWZ0LCB0aGUgbGVmdCBmaWxlIG11c3QgZXhpc3QuXG4gICAgICAgICAgICBpZiAodGhpcy5fZmlsZUl0ZW0ubGVmdEZpbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkRFTEVURV9MRUZUIGNhbm5vdCBiZSBkb25lIHdpdGhvdXQgYSBsZWZ0IGZpbGUuXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9maWxlSXRlbS5sZWZ0RmlsZS5kZWxldGUoKTtcbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl9hY3Rpb25UeXBlID09PSBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkRFTEVURV9SSUdIVCkge1xuICAgICAgICAgICAgLy8gSW4gb3JkZXIgdG8gZGVsZXRlIHJpZ2h0LCB0aGUgcmlnaHQgZmlsZSBtdXN0IGV4aXN0LlxuICAgICAgICAgICAgaWYgKHRoaXMuX2ZpbGVJdGVtLnJpZ2h0RmlsZSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKFwiREVMRVRFX1JJR0hUIGNhbm5vdCBiZSBkb25lIHdpdGhvdXQgYSByaWdodCBmaWxlLlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5fZmlsZUl0ZW0ucmlnaHRGaWxlLmRlbGV0ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2UgaWYgKHRoaXMuX2FjdGlvblR5cGUgPT09IERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuREVMRVRFX0JPVEgpIHtcbiAgICAgICAgICAgIC8vIEluIG9yZGVyIHRvIGRlbGV0ZSB0aGUgbGVmdCBmaWxlLCB0aGUgbGVmdCBmaWxlIG11c3QgZXhpc3QuXG4gICAgICAgICAgICBpZiAodGhpcy5fZmlsZUl0ZW0ubGVmdEZpbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkRFTEVURV9CT1RIIGNhbm5vdCBiZSBkb25lIHdpdGhvdXQgYSBsZWZ0IGZpbGUuXCIpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIC8vIEluIG9yZGVyIHRvIGRlbGV0ZSB0aGUgcmlnaHQgZmlsZSwgdGhlIHJpZ2h0IGZpbGUgbXVzdCBleGlzdC5cbiAgICAgICAgICAgIGlmICh0aGlzLl9maWxlSXRlbS5yaWdodEZpbGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVqZWN0KG5ldyBFcnJvcihcIkRFTEVURV9CT1RIIGNhbm5vdCBiZSBkb25lIHdpdGhvdXQgYSByaWdodCBmaWxlLlwiKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLmFsbChbXG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsZUl0ZW0ubGVmdEZpbGUuZGVsZXRlKCksXG4gICAgICAgICAgICAgICAgdGhpcy5fZmlsZUl0ZW0ucmlnaHRGaWxlLmRlbGV0ZSgpXSlcbiAgICAgICAgICAgIC50aGVuKCgpID0+IHsgfSk7XG5cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLl9hY3Rpb25UeXBlID09PSBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLlNLSVApIHtcbiAgICAgICAgICAgIHJldHVybiBCQlByb21pc2UucmVzb2x2ZSgpO1xuICAgICAgICB9XG4gICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBVbnN1cHBvcnRlZCBhY3Rpb24gXCIke3RoaXMuX2FjdGlvblR5cGV9XCIuYCkpO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5cbi8vIHRzbGludDpkaXNhYmxlLW5leHQtbGluZTptYXgtY2xhc3Nlcy1wZXItZmlsZVxuZXhwb3J0IGNsYXNzIERpZmZEaXJGaWxlSXRlbVxue1xuICAgIC8qKlxuICAgICAqIENyZWF0ZXMgYSBuZXcgaW5zdGFuY2UuXG4gICAgICogQHBhcmFtIGxlZnRSb290RGlyIC0gVGhlIGxlZnQgZGlyZWN0b3J5IGJlaW5nIGNvbXBhcmVkXG4gICAgICogQHBhcmFtIHJpZ2h0Um9vdERpciAtIFRoZSByaWdodCBkaXJlY3RvcnkgYmVpbmcgY29tcGFyZWRcbiAgICAgKiBAcGFyYW0gcmVsYXRpdmVGaWxlUGF0aCAtIFRoZSByZWxhdGl2ZSBmaWxlIHBhdGggKHRvIHRoZSBkaXJlY3RvcnkgYmVpbmdcbiAgICAgKiAgICAgY29tcGFyZWQpXG4gICAgICogQHBhcmFtIGxlZnRGaWxlIC0gVGhlIGxlZnQtc2lkZSBmaWxlIGJlaW5nIGNvbXBhcmVkIChpZiBhbnkpXG4gICAgICogQHBhcmFtIHJpZ2h0RmlsZSAtIFRoZSByaWdodC1zaWRlIGZpbGUgYmVpbmcgY29tcGFyZWQgKGlmIGFueSlcbiAgICAgKiBAcGFyYW0gYWN0aW9uUHJpb3JpdHkgLSBUaGUgb3ZlcmFsbCBhY3Rpb24gYmVpbmcgcGVyZm9ybWVkIHNvIHRoYXQgdGhlXG4gICAgICogICAgIGFjdGlvbnMgYXNzb2NpYXRlZCB3aXRoIHRoaXMgZmlsZSBpdGVtIGNhbiBiZSBwcmlvcml0aXplZFxuICAgICAqIEByZXR1cm4gQSBuZXdseSBjcmVhdGVkIERpZmZEaXJGaWxlSXRlbSBpbnN0YW5jZVxuICAgICAqL1xuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgY3JlYXRlKFxuICAgICAgICBsZWZ0Um9vdERpcjogICAgICBEaXJlY3RvcnksXG4gICAgICAgIHJpZ2h0Um9vdERpcjogICAgIERpcmVjdG9yeSxcbiAgICAgICAgcmVsYXRpdmVGaWxlUGF0aDogc3RyaW5nLFxuICAgICAgICBsZWZ0RmlsZTogICAgICAgICB1bmRlZmluZWQgfCBGaWxlLFxuICAgICAgICByaWdodEZpbGU6ICAgICAgICB1bmRlZmluZWQgfCBGaWxlLFxuICAgICAgICBhY3Rpb25Qcmlvcml0eT86ICBBY3Rpb25Qcmlvcml0eVxuICAgICAgICApOiBQcm9taXNlPERpZmZEaXJGaWxlSXRlbT5cbiAgICB7XG4gICAgICAgIC8vIFRPRE86IE5lZWQgdG8gZmluZCByZWZlcmVuY2VzIHRvIHRoaXMgc3RhdGljIGZ1bmN0aW9uIGFuZCB1cGRhdGUgdGhlbVxuICAgICAgICAvLyBiZWNhdXNlIHRoaXMgbWV0aG9kIGlzIG5vdyBhc3luYy5cblxuICAgICAgICAvLyBUaGUgcmVsYXRpdmUgZmlsZSBwYXRoIG11c3QgYmUgbGVnaXQuXG4gICAgICAgIGlmIChyZWxhdGl2ZUZpbGVQYXRoLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuIEJCUHJvbWlzZS5yZWplY3QobmV3IEVycm9yKGBEaWZmRGlyRmlsZUl0ZW0gcmVsYXRpdmUgZmlsZSBwYXRoIGNhbm5vdCBiZSAwLWxlbmd0aC5gKSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBFaXRoZXIgbGVmdEZpbGUgb3IgcmlnaHRGaWxlIG9yIGJvdGggc2hvdWxkIGJlIGRlZmluZWQuICBJZiBib3RoIGFyZVxuICAgICAgICAvLyB1bmRlZmluZWQsIHRoZXJlIGlzIGEgcHJvYmxlbS5cbiAgICAgICAgaWYgKChsZWZ0RmlsZSA9PT0gdW5kZWZpbmVkKSAmJiAocmlnaHRGaWxlID09PSB1bmRlZmluZWQpKSB7XG4gICAgICAgICAgICByZXR1cm4gQkJQcm9taXNlLnJlamVjdChuZXcgRXJyb3IoYERpZmZEaXJGaWxlSXRlbSBjYW5ub3QgaGF2ZSB1bmRlZmluZWQgbGVmdCBhbmQgcmlnaHQgZmlsZXMuYCkpO1xuICAgICAgICB9XG5cbiAgICAgICAgbGV0IGJvdGhGaWxlc0V4aXN0QW5kSWRlbnRpY2FsID0gZmFsc2U7XG4gICAgICAgIGlmICgobGVmdEZpbGUgIT09IHVuZGVmaW5lZCkgJiYgKHJpZ2h0RmlsZSAhPT0gdW5kZWZpbmVkKSkge1xuICAgICAgICAgICAgY29uc3QgW2xlZnRIYXNoLCByaWdodEhhc2hdID0gYXdhaXQgQkJQcm9taXNlLmFsbChbbGVmdEZpbGUuZ2V0SGFzaCgpLCByaWdodEZpbGUuZ2V0SGFzaCgpXSk7XG4gICAgICAgICAgICBib3RoRmlsZXNFeGlzdEFuZElkZW50aWNhbCA9IChsZWZ0SGFzaCA9PT0gcmlnaHRIYXNoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBuZXcgRGlmZkRpckZpbGVJdGVtKFxuICAgICAgICAgICAgbGVmdFJvb3REaXIsXG4gICAgICAgICAgICByaWdodFJvb3REaXIsXG4gICAgICAgICAgICByZWxhdGl2ZUZpbGVQYXRoLFxuICAgICAgICAgICAgbGVmdEZpbGUsXG4gICAgICAgICAgICByaWdodEZpbGUsXG4gICAgICAgICAgICBib3RoRmlsZXNFeGlzdEFuZElkZW50aWNhbCxcbiAgICAgICAgICAgIGFjdGlvblByaW9yaXR5XG4gICAgICAgICk7XG4gICAgfVxuXG5cbiAgICAvLyAjcmVnaW9uIERhdGEgTWVtYmVyc1xuICAgIHByaXZhdGUgX2xlZnRSb290RGlyOiAgICAgICAgICAgRGlyZWN0b3J5O1xuICAgIHByaXZhdGUgX3JpZ2h0Um9vdERpcjogICAgICAgICAgRGlyZWN0b3J5O1xuICAgIHByaXZhdGUgX3JlbGF0aXZlRmlsZVBhdGg6ICAgICAgc3RyaW5nO1xuICAgIHByaXZhdGUgX2xlZnRGaWxlOiAgICAgICAgICAgICAgdW5kZWZpbmVkIHwgRmlsZTtcbiAgICBwcml2YXRlIF9yaWdodEZpbGU6ICAgICAgICAgICAgIHVuZGVmaW5lZCB8IEZpbGU7XG4gICAgcHJpdmF0ZSBfYWN0aW9uUHJpb3JpdHk6ICAgICAgICB1bmRlZmluZWQgfCBBY3Rpb25Qcmlvcml0eTtcbiAgICBwcml2YXRlIF9hY3Rpb25zOiAgICAgICAgICAgICAgIEFycmF5PERpZmZEaXJGaWxlSXRlbUFjdGlvbj47XG4gICAgcHJpdmF0ZSBfYm90aEV4aXN0QW5kSWRlbnRpY2FsOiBib29sZWFuO1xuICAgIC8vICNlbmRyZWdpb25cblxuXG4gICAgcHJpdmF0ZSBjb25zdHJ1Y3RvcihcbiAgICAgICAgbGVmdFJvb3REaXI6ICAgICAgICAgICBEaXJlY3RvcnksXG4gICAgICAgIHJpZ2h0Um9vdERpcjogICAgICAgICAgRGlyZWN0b3J5LFxuICAgICAgICByZWxhdGl2ZUZpbGVQYXRoOiAgICAgIHN0cmluZyxcbiAgICAgICAgbGVmdEZpbGU6ICAgICAgICAgICAgICB1bmRlZmluZWQgfCBGaWxlLFxuICAgICAgICByaWdodEZpbGU6ICAgICAgICAgICAgIHVuZGVmaW5lZCB8IEZpbGUsXG4gICAgICAgIGJvdGhFeGlzdEFuZElkZW50aWNhbDogYm9vbGVhbixcbiAgICAgICAgYWN0aW9uUHJpb3JpdHk/OiAgICAgICBBY3Rpb25Qcmlvcml0eVxuXG4gICAgKVxuICAgIHtcbiAgICAgICAgdGhpcy5fbGVmdFJvb3REaXIgICAgICAgICAgID0gbGVmdFJvb3REaXI7XG4gICAgICAgIHRoaXMuX3JpZ2h0Um9vdERpciAgICAgICAgICA9IHJpZ2h0Um9vdERpcjtcbiAgICAgICAgdGhpcy5fcmVsYXRpdmVGaWxlUGF0aCAgICAgID0gcmVsYXRpdmVGaWxlUGF0aDtcbiAgICAgICAgdGhpcy5fbGVmdEZpbGUgICAgICAgICAgICAgID0gbGVmdEZpbGU7XG4gICAgICAgIHRoaXMuX3JpZ2h0RmlsZSAgICAgICAgICAgICA9IHJpZ2h0RmlsZTtcbiAgICAgICAgdGhpcy5fYm90aEV4aXN0QW5kSWRlbnRpY2FsID0gYm90aEV4aXN0QW5kSWRlbnRpY2FsO1xuICAgICAgICB0aGlzLl9hY3Rpb25Qcmlvcml0eSAgICAgICAgPSBhY3Rpb25Qcmlvcml0eTtcbiAgICAgICAgdGhpcy5fYWN0aW9ucyAgICAgICAgICAgICAgID0gW107XG5cbiAgICAgICAgaWYgKHRoaXMuaXNMZWZ0T25seSkge1xuICAgICAgICAgICAgaWYgKGFjdGlvblByaW9yaXR5ID09PSBBY3Rpb25Qcmlvcml0eS5MX1RPX1IpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkNPUFlfUklHSFQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLlNLSVApKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkRFTEVURV9MRUZUKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhY3Rpb25Qcmlvcml0eSA9PT0gQWN0aW9uUHJpb3JpdHkuUl9UT19MKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5ERUxFVEVfTEVGVCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMucHVzaChuZXcgRGlmZkRpckZpbGVJdGVtQWN0aW9uKHRoaXMsIERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuU0tJUCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMucHVzaChuZXcgRGlmZkRpckZpbGVJdGVtQWN0aW9uKHRoaXMsIERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuQ09QWV9SSUdIVCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgLy8gTm8gYWN0aW9uIHByaW9yaXR5IHNwZWNpZmllZC4gIEdpdmUgcHJpb3JpdHkgdG8gcHJlc2VydmluZ1xuICAgICAgICAgICAgICAgIC8vIGZpbGVzLlxuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMucHVzaChuZXcgRGlmZkRpckZpbGVJdGVtQWN0aW9uKHRoaXMsIERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuQ09QWV9SSUdIVCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMucHVzaChuZXcgRGlmZkRpckZpbGVJdGVtQWN0aW9uKHRoaXMsIERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuU0tJUCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMucHVzaChuZXcgRGlmZkRpckZpbGVJdGVtQWN0aW9uKHRoaXMsIERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuREVMRVRFX0xFRlQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBlbHNlIGlmICh0aGlzLmlzUmlnaHRPbmx5KVxuICAgICAgICB7XG4gICAgICAgICAgICBpZiAoYWN0aW9uUHJpb3JpdHkgPT09IEFjdGlvblByaW9yaXR5LkxfVE9fUikge1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMucHVzaChuZXcgRGlmZkRpckZpbGVJdGVtQWN0aW9uKHRoaXMsIERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuREVMRVRFX1JJR0hUKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5TS0lQKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5DT1BZX0xFRlQpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2UgaWYgKGFjdGlvblByaW9yaXR5ID09PSBBY3Rpb25Qcmlvcml0eS5SX1RPX0wpIHtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkNPUFlfTEVGVCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMucHVzaChuZXcgRGlmZkRpckZpbGVJdGVtQWN0aW9uKHRoaXMsIERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuU0tJUCkpO1xuICAgICAgICAgICAgICAgIHRoaXMuX2FjdGlvbnMucHVzaChuZXcgRGlmZkRpckZpbGVJdGVtQWN0aW9uKHRoaXMsIERpZmZEaXJGaWxlSXRlbUFjdGlvblR5cGUuREVMRVRFX1JJR0hUKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBObyBhY3Rpb24gcHJpb3JpdHkgc3BlY2lmaWVkLiAgR2l2ZSBwcmlvcml0eSB0byBwcmVzZXJ2aW5nXG4gICAgICAgICAgICAgICAgLy8gZmlsZXMuXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5DT1BZX0xFRlQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLlNLSVApKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkRFTEVURV9SSUdIVCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGVsc2UgeyAvLyB0aGlzLmlzSW5Cb3RoKCkgPT4gdHJ1ZVxuXG4gICAgICAgICAgICBpZiAoYm90aEV4aXN0QW5kSWRlbnRpY2FsKSB7XG4gICAgICAgICAgICAgICAgLy8gV2hlbiB0aGUgZmlsZXMgYXJlIGlkZW50aWNhbCwgdGhlcmUgc2hvdWxkIGJlIG5vIGFjdGlvbnMuXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhY3Rpb25Qcmlvcml0eSA9PT0gQWN0aW9uUHJpb3JpdHkuTF9UT19SKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5DT1BZX1JJR0hUKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5TS0lQKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5DT1BZX0xFRlQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkRFTEVURV9CT1RIKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChhY3Rpb25Qcmlvcml0eSA9PT0gQWN0aW9uUHJpb3JpdHkuUl9UT19MKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5DT1BZX0xFRlQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLlNLSVApKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkNPUFlfUklHSFQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkRFTEVURV9CT1RIKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAvLyBObyBhY3Rpb24gcHJpb3JpdHkgc3BlY2lmaWVkLiAgR2l2ZSBwcmlvcml0eSB0byBwcmVzZXJ2aW5nXG4gICAgICAgICAgICAgICAgLy8gZmlsZXMuXG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5DT1BZX1JJR0hUKSk7XG4gICAgICAgICAgICAgICAgdGhpcy5fYWN0aW9ucy5wdXNoKG5ldyBEaWZmRGlyRmlsZUl0ZW1BY3Rpb24odGhpcywgRGlmZkRpckZpbGVJdGVtQWN0aW9uVHlwZS5DT1BZX0xFRlQpKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLlNLSVApKTtcbiAgICAgICAgICAgICAgICB0aGlzLl9hY3Rpb25zLnB1c2gobmV3IERpZmZEaXJGaWxlSXRlbUFjdGlvbih0aGlzLCBEaWZmRGlyRmlsZUl0ZW1BY3Rpb25UeXBlLkRFTEVURV9CT1RIKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBsZWZ0Um9vdERpcigpOiBEaXJlY3RvcnlcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sZWZ0Um9vdERpcjtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgcmlnaHRSb290RGlyKCk6IERpcmVjdG9yeVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX3JpZ2h0Um9vdERpcjtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgcmVsYXRpdmVGaWxlUGF0aCgpOiBzdHJpbmdcbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9yZWxhdGl2ZUZpbGVQYXRoO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBsZWZ0RmlsZSgpOiB1bmRlZmluZWQgfCBGaWxlXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fbGVmdEZpbGU7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IHJpZ2h0RmlsZSgpOiB1bmRlZmluZWQgfCBGaWxlXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fcmlnaHRGaWxlO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBhY3Rpb25Qcmlvcml0eSgpOiB1bmRlZmluZWQgfCBBY3Rpb25Qcmlvcml0eVxuICAgIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2FjdGlvblByaW9yaXR5O1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBhY3Rpb25zKCk6IEFycmF5PERpZmZEaXJGaWxlSXRlbUFjdGlvbj5cbiAgICB7XG4gICAgICAgIHJldHVybiB0aGlzLl9hY3Rpb25zO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBpc0xlZnRPbmx5KCk6IGJvb2xlYW5cbiAgICB7XG4gICAgICAgIHJldHVybiAodGhpcy5fbGVmdEZpbGUgIT09IHVuZGVmaW5lZCkgJiYgKHRoaXMuX3JpZ2h0RmlsZSA9PT0gdW5kZWZpbmVkKTtcbiAgICB9XG5cblxuICAgIHB1YmxpYyBnZXQgaXNSaWdodE9ubHkoKTogYm9vbGVhblxuICAgIHtcbiAgICAgICAgcmV0dXJuICh0aGlzLl9sZWZ0RmlsZSA9PT0gdW5kZWZpbmVkKSAmJiAodGhpcy5fcmlnaHRGaWxlICE9PSB1bmRlZmluZWQpO1xuICAgIH1cblxuXG4gICAgcHVibGljIGdldCBpc0luQm90aCgpOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gKHRoaXMuX2xlZnRGaWxlICE9PSB1bmRlZmluZWQpICYmICh0aGlzLl9yaWdodEZpbGUgIT09IHVuZGVmaW5lZCk7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGJvdGhFeGlzdEFuZElkZW50aWNhbCgpOiBib29sZWFuXG4gICAge1xuICAgICAgICByZXR1cm4gdGhpcy5fYm90aEV4aXN0QW5kSWRlbnRpY2FsO1xuICAgIH1cblxufVxuXG5cblxuLyoqXG4gKiBDb21wYXJlcyAocmVjdXJzaXZlbHkpIHRoZSBmaWxlcyB3aXRoaW4gdHdvIGRpcmVjdG9yaWVzLlxuICogQHBhcmFtIGxlZnREaXIgLSBUaGUgbGVmdCBkaXJlY3RvcnkgdG8gYmUgY29tcGFyZWRcbiAqIEBwYXJhbSByaWdodERpciAtIFRoZSByaWdodCBkaXJlY3RvcnkgdG8gYmUgY29tcGFyZWRcbiAqIEBwYXJhbSBhY3Rpb25Qcmlvcml0eSAtIFRoZSBhY3Rpb24gYmVpbmcgcGVyZm9ybWVkIHNvIHRoYXQgdGhlIGFjdGlvbnNcbiAqICAgICBhc3NvY2lhdGVkIHdpdGggZWFjaCByZXN1bHQgY2FuIGJlIHByaW9yaXRpemVkLlxuICogQHBhcmFtIGluY2x1ZGVJZGVudGljYWwgLSBXaGV0aGVyIHRvIGluY2x1ZGUgZmlsZXMgdGhhdCBhcmUgaWRlbnRpY2FsIGluIGJvdGhcbiAqICAgICBgbGVmdERpcmAgYW5kIGByaWdodERpcmAgaW4gdGhlIHJldHVybmVkIHJlc3Vscy4gIElmIHRydWUsIGlkZW50aWNhbFxuICogICAgIGZpbGVzIHdpbGwgYmUgaW5jbHVkZWQgd2l0aCBhIDAtbGVuZ3RoIGFycmF5IG9mIGFjdGlvbnMuXG4gKiBAcmV0dXJuIEFuIGFycmF5IG9mIGl0ZW1zIHJlcHJlc2VudGluZyB0aGUgZGlmZmVyZW5jZXMgZm91bmQgYmV0d2VlblxuICogICAgIGBsZWZ0RGlyYCBhbmQgYHJpZ2h0RGlyYC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpZmZEaXJlY3RvcmllcyhcbiAgICBsZWZ0RGlyOiBEaXJlY3RvcnksXG4gICAgcmlnaHREaXI6IERpcmVjdG9yeSxcbiAgICBhY3Rpb25Qcmlvcml0eT86IEFjdGlvblByaW9yaXR5LFxuICAgIGluY2x1ZGVJZGVudGljYWw6IGJvb2xlYW4gPSBmYWxzZVxuKTogUHJvbWlzZTxBcnJheTxEaWZmRGlyRmlsZUl0ZW0+Plxue1xuICAgIGxldCBsZWZ0RmlsZXM6IEFycmF5PEZpbGU+O1xuICAgIGxldCByaWdodEZpbGVzOiBBcnJheTxGaWxlPjtcblxuICAgIC8vIEdldCB0aGUgbGVmdC1zaWRlIGZpbGVzLCBhY2NvdW50aW5nIGZvciBub25leGlzdGVuY2UuXG4gICAgY29uc3QgbGVmdENvbnRlbnRzUHJvbWlzZSA9IGxlZnREaXIuY29udGVudHModHJ1ZSlcbiAgICAudGhlbihcbiAgICAgICAgKGxlZnRDb250ZW50cykgPT4geyBsZWZ0RmlsZXMgPSBsZWZ0Q29udGVudHMuZmlsZXM7IH0sXG4gICAgICAgICgpID0+IHsgbGVmdEZpbGVzID0gW107IH1cbiAgICApO1xuXG4gICAgLy8gR2V0IHRoZSByaWdodC1zaWRlIGZpbGVzLCBhY2NvdW50aW5nIGZvciBub25leGlzdGVuY2UuXG4gICAgY29uc3QgcmlnaHRDb250ZW50c1Byb21pc2UgPSByaWdodERpci5jb250ZW50cyh0cnVlKVxuICAgIC50aGVuKFxuICAgICAgICAocmlnaHRDb250ZW50cykgPT4geyByaWdodEZpbGVzID0gcmlnaHRDb250ZW50cy5maWxlczsgfSxcbiAgICAgICAgKCkgPT4geyByaWdodEZpbGVzID0gW107IH1cbiAgICApO1xuXG4gICAgcmV0dXJuIEJCUHJvbWlzZS5hbGwoW2xlZnRDb250ZW50c1Byb21pc2UsIHJpZ2h0Q29udGVudHNQcm9taXNlXSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIGNvbnN0IGRpZmZNYXAgPSBuZXcgTWFwPHN0cmluZywgeyBsZWZ0RmlsZT86IEZpbGUsIHJpZ2h0RmlsZT86IEZpbGU7IH0+KCk7XG5cbiAgICAgICAgLy8gUHV0IHRoZSBsZWZ0IGZpbGVzIGludG8gdGhlIGRpZmYgbWFwLlxuICAgICAgICBfLmZvckVhY2gobGVmdEZpbGVzLCAoY3VyRmlsZSkgPT4ge1xuICAgICAgICAgICAgY29uc3QgcmVsYXRpdmVQYXRoID0gRmlsZS5yZWxhdGl2ZVBhcnRzKGxlZnREaXIsIGN1ckZpbGUpLmpvaW4ocGF0aC5zZXApO1xuICAgICAgICAgICAgZGlmZk1hcC5zZXQocmVsYXRpdmVQYXRoLCB7IGxlZnRGaWxlOiBjdXJGaWxlIH0pO1xuICAgICAgICB9KTtcblxuICAgICAgICAvLyBQdXQgdGhlIHJpZ2h0IGZpbGVzIGludG8gdGhlIGRpZmYgbWFwLlxuICAgICAgICBfLmZvckVhY2gocmlnaHRGaWxlcywgKGN1ckZpbGUpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IHJlbGF0aXZlUGF0aCA9IEZpbGUucmVsYXRpdmVQYXJ0cyhyaWdodERpciwgY3VyRmlsZSkuam9pbihwYXRoLnNlcCk7XG5cbiAgICAgICAgICAgIGlmIChkaWZmTWFwLmhhcyhyZWxhdGl2ZVBhdGgpKSB7XG4gICAgICAgICAgICAgICAgZGlmZk1hcC5nZXQocmVsYXRpdmVQYXRoKSEucmlnaHRGaWxlID0gY3VyRmlsZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgIGRpZmZNYXAuc2V0KHJlbGF0aXZlUGF0aCwgeyByaWdodEZpbGU6IGN1ckZpbGUgfSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIEl0ZXJhdGUgb3ZlciB0aGUgZGlmZiBtYXAsIGNyZWF0aW5nIGEgZGlmZkRpckZpbGVJdGVtIGZvciBlYWNoIGVudHJ5LlxuICAgICAgICBjb25zdCBkaWZmRGlyRmlsZUl0ZW1Qcm9taXNlczogQXJyYXk8UHJvbWlzZTxEaWZmRGlyRmlsZUl0ZW0+PiA9IFtdO1xuICAgICAgICBmb3IgKGNvbnN0IFtyZWxhdGl2ZVBhdGgsIGZpbGVzXSBvZiBkaWZmTWFwKSB7XG4gICAgICAgICAgICBkaWZmRGlyRmlsZUl0ZW1Qcm9taXNlcy5wdXNoKERpZmZEaXJGaWxlSXRlbS5jcmVhdGUoXG4gICAgICAgICAgICAgICAgbGVmdERpcixcbiAgICAgICAgICAgICAgICByaWdodERpcixcbiAgICAgICAgICAgICAgICByZWxhdGl2ZVBhdGgsXG4gICAgICAgICAgICAgICAgZmlsZXMubGVmdEZpbGUsXG4gICAgICAgICAgICAgICAgZmlsZXMucmlnaHRGaWxlLFxuICAgICAgICAgICAgICAgIGFjdGlvblByaW9yaXR5XG4gICAgICAgICAgICApKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBCQlByb21pc2UuYWxsKGRpZmZEaXJGaWxlSXRlbVByb21pc2VzKTtcbiAgICB9KVxuICAgIC50aGVuKChkaWZmRGlyRmlsZUl0ZW1zOiBBcnJheTxEaWZmRGlyRmlsZUl0ZW0+KSA9PiB7XG5cbiAgICAgICAgLy8gSWYgbm90IGluY2x1ZGluZyBpZGVudGljYWwgZmlsZXMsIHJlbW92ZSB0aGVtLlxuICAgICAgICBpZiAoIWluY2x1ZGVJZGVudGljYWwpIHtcbiAgICAgICAgICAgIF8ucmVtb3ZlKGRpZmZEaXJGaWxlSXRlbXMsIChjdXJEaWZmRGlyRmlsZUl0ZW06IERpZmZEaXJGaWxlSXRlbSkgPT4ge1xuICAgICAgICAgICAgICAgIHJldHVybiBjdXJEaWZmRGlyRmlsZUl0ZW0uYm90aEV4aXN0QW5kSWRlbnRpY2FsO1xuICAgICAgICAgICAgfSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBTb3J0IHRoZSBpdGVtcyBzbyB0aGF0IGxlZnQtb25seSBpdGVtcyBhcmUgbmV4dCB0byByaWdodC1vbmx5IGl0ZW1zXG4gICAgICAgIC8vIGluIHRoZSBmaW5hbCByZXN1bHQuXG4gICAgICAgIGRpZmZEaXJGaWxlSXRlbXMgPSBfLnNvcnRCeShkaWZmRGlyRmlsZUl0ZW1zLCAoY3VyRGlmZkRpckZpbGVJdGVtKSA9PiBjdXJEaWZmRGlyRmlsZUl0ZW0ucmVsYXRpdmVGaWxlUGF0aCk7XG4gICAgICAgIHJldHVybiBkaWZmRGlyRmlsZUl0ZW1zO1xuICAgIH0pO1xufVxuIl19
