"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var fs_1 = require("fs");
var os_1 = require("os");
var NODEJS_SHEBANG = "#!/usr/bin/env node";
function makeNodeScriptExecutable(file) {
    return file.read()
        .then(function (text) {
        var newText = NODEJS_SHEBANG + os_1.EOL + text;
        return file.write(newText);
    })
        .then(function () {
        // We need to set the access mode of the file to the current mode with
        // execute permissions OR'ed in (for owner, group and other).  So first
        // get the current mode bits.
        return file.exists();
    })
        .then(function (stats) {
        // Turn on all execute bits.
        var newMode = stats.mode | fs_1.constants.S_IXUSR | fs_1.constants.S_IXGRP | fs_1.constants.S_IXOTH;
        return file.chmod(newMode);
    })
        .then(function () {
        return file;
    });
}
exports.makeNodeScriptExecutable = makeNodeScriptExecutable;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9ub2RlVXRpbC50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQUFBLHlCQUE2QjtBQUM3Qix5QkFBdUI7QUFJdkIsSUFBTSxjQUFjLEdBQUcscUJBQXFCLENBQUM7QUFFN0MsU0FBZ0Isd0JBQXdCLENBQUMsSUFBVTtJQUMvQyxPQUFPLElBQUksQ0FBQyxJQUFJLEVBQUU7U0FDakIsSUFBSSxDQUFDLFVBQUMsSUFBSTtRQUNQLElBQU0sT0FBTyxHQUFHLGNBQWMsR0FBRyxRQUFHLEdBQUcsSUFBSSxDQUFDO1FBQzVDLE9BQU8sSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUMvQixDQUFDLENBQUM7U0FDRCxJQUFJLENBQUM7UUFDRixzRUFBc0U7UUFDdEUsdUVBQXVFO1FBQ3ZFLDZCQUE2QjtRQUM3QixPQUFPLElBQUksQ0FBQyxNQUFNLEVBQUUsQ0FBQztJQUN6QixDQUFDLENBQUM7U0FDRCxJQUFJLENBQUMsVUFBQyxLQUFLO1FBQ1IsNEJBQTRCO1FBQzVCLElBQU0sT0FBTyxHQUFHLEtBQU0sQ0FBQyxJQUFJLEdBQUcsY0FBUyxDQUFDLE9BQU8sR0FBRyxjQUFTLENBQUMsT0FBTyxHQUFHLGNBQVMsQ0FBQyxPQUFPLENBQUM7UUFDeEYsT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQy9CLENBQUMsQ0FBQztTQUNELElBQUksQ0FBQztRQUNGLE9BQU8sSUFBSSxDQUFDO0lBQ2hCLENBQUMsQ0FBQyxDQUFDO0FBQ1AsQ0FBQztBQXBCRCw0REFvQkMiLCJmaWxlIjoibm9kZVV0aWwuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge2NvbnN0YW50c30gZnJvbSBcImZzXCI7XG5pbXBvcnQge0VPTH0gZnJvbSBcIm9zXCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcblxuXG5jb25zdCBOT0RFSlNfU0hFQkFORyA9IFwiIyEvdXNyL2Jpbi9lbnYgbm9kZVwiO1xuXG5leHBvcnQgZnVuY3Rpb24gbWFrZU5vZGVTY3JpcHRFeGVjdXRhYmxlKGZpbGU6IEZpbGUpOiBQcm9taXNlPEZpbGU+IHtcbiAgICByZXR1cm4gZmlsZS5yZWFkKClcbiAgICAudGhlbigodGV4dCkgPT4ge1xuICAgICAgICBjb25zdCBuZXdUZXh0ID0gTk9ERUpTX1NIRUJBTkcgKyBFT0wgKyB0ZXh0O1xuICAgICAgICByZXR1cm4gZmlsZS53cml0ZShuZXdUZXh0KTtcbiAgICB9KVxuICAgIC50aGVuKCgpID0+IHtcbiAgICAgICAgLy8gV2UgbmVlZCB0byBzZXQgdGhlIGFjY2VzcyBtb2RlIG9mIHRoZSBmaWxlIHRvIHRoZSBjdXJyZW50IG1vZGUgd2l0aFxuICAgICAgICAvLyBleGVjdXRlIHBlcm1pc3Npb25zIE9SJ2VkIGluIChmb3Igb3duZXIsIGdyb3VwIGFuZCBvdGhlcikuICBTbyBmaXJzdFxuICAgICAgICAvLyBnZXQgdGhlIGN1cnJlbnQgbW9kZSBiaXRzLlxuICAgICAgICByZXR1cm4gZmlsZS5leGlzdHMoKTtcbiAgICB9KVxuICAgIC50aGVuKChzdGF0cykgPT4ge1xuICAgICAgICAvLyBUdXJuIG9uIGFsbCBleGVjdXRlIGJpdHMuXG4gICAgICAgIGNvbnN0IG5ld01vZGUgPSBzdGF0cyEubW9kZSB8IGNvbnN0YW50cy5TX0lYVVNSIHwgY29uc3RhbnRzLlNfSVhHUlAgfCBjb25zdGFudHMuU19JWE9USDtcbiAgICAgICAgcmV0dXJuIGZpbGUuY2htb2QobmV3TW9kZSk7XG4gICAgfSlcbiAgICAudGhlbigoKSA9PiB7XG4gICAgICAgIHJldHVybiBmaWxlO1xuICAgIH0pO1xufVxuIl19
