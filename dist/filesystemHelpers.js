"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var BBPromise = require("bluebird");
var directory_1 = require("./directory");
var file_1 = require("./file");
/**
 * Determines whether `path` represents an existing directory or file.
 * @param path - The path to the filesystem item in question
 * @return A Promise that resolves with a Directory or File object.  The Promise
 *   is rejected if `path` does not exist.
 */
function getFilesystemItem(path) {
    return new BBPromise(function (resolve, reject) {
        fs.stat(path, function (err, stats) {
            if (err) {
                reject(new Error("\"" + path + "\" does not exist."));
                return;
            }
            if (stats.isDirectory()) {
                resolve(new directory_1.Directory(path));
            }
            else if (stats.isFile()) {
                resolve(new file_1.File(path));
            }
            else {
                reject(new Error("\"" + path + "\" is not a file or directory."));
            }
        });
    });
}
exports.getFilesystemItem = getFilesystemItem;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9maWxlc3lzdGVtSGVscGVycy50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHVCQUF5QjtBQUN6QixvQ0FBc0M7QUFDdEMseUNBQXNDO0FBQ3RDLCtCQUE0QjtBQUc1Qjs7Ozs7R0FLRztBQUNILFNBQWdCLGlCQUFpQixDQUFDLElBQVk7SUFFMUMsT0FBTyxJQUFJLFNBQVMsQ0FBbUIsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUVuRCxFQUFFLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFDLEdBQUcsRUFBRSxLQUFlO1lBQy9CLElBQUksR0FBRyxFQUFFO2dCQUNMLE1BQU0sQ0FBQyxJQUFJLEtBQUssQ0FBQyxPQUFJLElBQUksdUJBQW1CLENBQUMsQ0FBQyxDQUFDO2dCQUMvQyxPQUFPO2FBQ1Y7WUFFRCxJQUFJLEtBQUssQ0FBQyxXQUFXLEVBQUUsRUFBRTtnQkFDckIsT0FBTyxDQUFDLElBQUkscUJBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDO2FBQ2hDO2lCQUNJLElBQUksS0FBSyxDQUFDLE1BQU0sRUFBRSxFQUFFO2dCQUNyQixPQUFPLENBQUMsSUFBSSxXQUFJLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQzthQUMzQjtpQkFDSTtnQkFDRCxNQUFNLENBQUMsSUFBSSxLQUFLLENBQUMsT0FBSSxJQUFJLG1DQUErQixDQUFDLENBQUMsQ0FBQzthQUM5RDtRQUNMLENBQUMsQ0FBQyxDQUFDO0lBRVAsQ0FBQyxDQUFDLENBQUM7QUFDUCxDQUFDO0FBdEJELDhDQXNCQyIsImZpbGUiOiJmaWxlc3lzdGVtSGVscGVycy5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCAqIGFzIGZzIGZyb20gXCJmc1wiO1xuaW1wb3J0ICogYXMgQkJQcm9taXNlIGZyb20gXCJibHVlYmlyZFwiO1xuaW1wb3J0IHtEaXJlY3Rvcnl9IGZyb20gXCIuL2RpcmVjdG9yeVwiO1xuaW1wb3J0IHtGaWxlfSBmcm9tIFwiLi9maWxlXCI7XG5cblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgYHBhdGhgIHJlcHJlc2VudHMgYW4gZXhpc3RpbmcgZGlyZWN0b3J5IG9yIGZpbGUuXG4gKiBAcGFyYW0gcGF0aCAtIFRoZSBwYXRoIHRvIHRoZSBmaWxlc3lzdGVtIGl0ZW0gaW4gcXVlc3Rpb25cbiAqIEByZXR1cm4gQSBQcm9taXNlIHRoYXQgcmVzb2x2ZXMgd2l0aCBhIERpcmVjdG9yeSBvciBGaWxlIG9iamVjdC4gIFRoZSBQcm9taXNlXG4gKiAgIGlzIHJlamVjdGVkIGlmIGBwYXRoYCBkb2VzIG5vdCBleGlzdC5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEZpbGVzeXN0ZW1JdGVtKHBhdGg6IHN0cmluZyk6IFByb21pc2U8RGlyZWN0b3J5IHwgRmlsZT5cbntcbiAgICByZXR1cm4gbmV3IEJCUHJvbWlzZTxEaXJlY3RvcnkgfCBGaWxlPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG5cbiAgICAgICAgZnMuc3RhdChwYXRoLCAoZXJyLCBzdGF0czogZnMuU3RhdHMpID0+IHtcbiAgICAgICAgICAgIGlmIChlcnIpIHtcbiAgICAgICAgICAgICAgICByZWplY3QobmV3IEVycm9yKGBcIiR7cGF0aH1cIiBkb2VzIG5vdCBleGlzdC5gKSk7XG4gICAgICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoc3RhdHMuaXNEaXJlY3RvcnkoKSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IERpcmVjdG9yeShwYXRoKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIGlmIChzdGF0cy5pc0ZpbGUoKSkge1xuICAgICAgICAgICAgICAgIHJlc29sdmUobmV3IEZpbGUocGF0aCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgcmVqZWN0KG5ldyBFcnJvcihgXCIke3BhdGh9XCIgaXMgbm90IGEgZmlsZSBvciBkaXJlY3RvcnkuYCkpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgIH0pO1xufVxuIl19
