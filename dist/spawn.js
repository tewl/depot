"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _ = require("lodash");
var BBPromise = require("bluebird");
var collectorStream_1 = require("./collectorStream");
var cp = require("child_process");
var nullStream_1 = require("./nullStream");
var promiseHelpers_1 = require("./promiseHelpers");
/**
 * Spawns a child process.  Each stdout and stderr output line is prefixed with
 * the specified label.
 * @param description - A textual description of the command that is output when
 *     the child process starts
 * @param cmd - The command to run
 * @param args - An array of arguments for cmd
 * @param options - Spawn options.  See child_process.spawn for more info.
 * @param stdoutStream - The stream to receive stdout.  A NullStream if
 *     undefined.
 *     For example:
 *     `new CombinedStream(new PrefixStream("foo"), process.stdout)`
 * @param stderrStream - The stream to receive stderr  A NullStream if
 *     undefined. For example:
 *     `new CombinedStream(new PrefixStream(".    "), process.stderr)`
 * @return An object implementing ISpawnResult.
 */
function spawn(cmd, args, options, description, stdoutStream, stderrStream) {
    var cmdLineRepresentation = getCommandLineRepresentation(cmd, args);
    if (description) {
        console.log("--------------------------------------------------------------------------------");
        console.log("" + description);
        console.log("    " + cmdLineRepresentation);
        console.log("--------------------------------------------------------------------------------");
    }
    var stdoutCollector = new collectorStream_1.CollectorStream();
    var stderrCollector = new collectorStream_1.CollectorStream();
    var childProcess;
    var closePromise = new BBPromise(function (resolve, reject) {
        var spawnOptions = _.defaults({}, options, { stdio: [process.stdin, "pipe", "pipe"] });
        childProcess = cp.spawn(cmd, args, spawnOptions);
        var outputStream = stdoutStream || new nullStream_1.NullStream();
        childProcess.stdout
            .pipe(stdoutCollector)
            .pipe(outputStream);
        var errorStream = stderrStream || new nullStream_1.NullStream();
        childProcess.stderr
            .pipe(stderrCollector) // to capture stderr in case child process errors
            .pipe(errorStream);
        childProcess.once("exit", function (exitCode) {
            // Wait for all steams to flush before reporting that the child
            // process has finished.
            promiseHelpers_1.eventToPromise(childProcess, "close")
                .then(function () {
                if (exitCode === 0) {
                    if (description) {
                        console.log("Child process succeeded: " + cmdLineRepresentation);
                    }
                    resolve(_.trim(stdoutCollector.collected));
                }
                else {
                    if (description) {
                        console.log("Child process failed: " + cmdLineRepresentation);
                    }
                    reject({ exitCode: exitCode, stderr: stderrCollector.collected, stdout: stdoutCollector.collected });
                }
            });
        });
    });
    return {
        childProcess: childProcess,
        closePromise: closePromise
    };
}
exports.spawn = spawn;
function getCommandLineRepresentation(cmd, args) {
    args = args.map(function (curArg) {
        if (_.includes(curArg, " ")) {
            return "\"" + curArg + "\"";
        }
        else {
            return curArg;
        }
    });
    return cmd + " " + args.join(" ");
}

//# sourceMappingURL=data:application/json;charset=utf8;base64,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QUFDO0FBQ04sQ0FBQztBQXZFRCxzQkF1RUM7QUFHRCxTQUFTLDRCQUE0QixDQUFDLEdBQVcsRUFBRSxJQUFtQjtJQUVsRSxJQUFJLEdBQUcsSUFBSSxDQUFDLEdBQUcsQ0FBQyxVQUFDLE1BQU07UUFFbkIsSUFBSSxDQUFDLENBQUMsUUFBUSxDQUFDLE1BQU0sRUFBRSxHQUFHLENBQUMsRUFDM0I7WUFDSSxPQUFPLE9BQUksTUFBTSxPQUFHLENBQUM7U0FDeEI7YUFDRDtZQUNJLE9BQU8sTUFBTSxDQUFDO1NBQ2pCO0lBQ0wsQ0FBQyxDQUFDLENBQUM7SUFFSCxPQUFVLEdBQUcsU0FBSSxJQUFJLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBRyxDQUFDO0FBQ3RDLENBQUMiLCJmaWxlIjoic3Bhd24uanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBfIGZyb20gXCJsb2Rhc2hcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7Q29sbGVjdG9yU3RyZWFtfSBmcm9tIFwiLi9jb2xsZWN0b3JTdHJlYW1cIjtcbmltcG9ydCAqIGFzIGNwIGZyb20gXCJjaGlsZF9wcm9jZXNzXCI7XG5pbXBvcnQgKiBhcyBzdHJlYW0gZnJvbSBcInN0cmVhbVwiO1xuaW1wb3J0IHtOdWxsU3RyZWFtfSBmcm9tIFwiLi9udWxsU3RyZWFtXCI7XG5pbXBvcnQge2V2ZW50VG9Qcm9taXNlfSBmcm9tIFwiLi9wcm9taXNlSGVscGVyc1wiO1xuXG5leHBvcnQgaW50ZXJmYWNlIElTcGF3blJlc3VsdFxue1xuICAgIC8qKlxuICAgICAqIFRoZSB1bmRlcmx5aW5nIGNoaWxkIHByb2Nlc3MuICBUaGlzIGlzIHByb3ZpZGVkIHNvIHRoYXQgY2xpZW50cyBjYW4gZG9cbiAgICAgKiB0aGluZ3MgbGlrZSBraWxsKCkgdGhlbS5cbiAgICAgKi9cbiAgICBjaGlsZFByb2Nlc3M6IGNwLkNoaWxkUHJvY2VzcztcbiAgICAvKipcbiAgICAgKiBBIFByb21pc2UgdGhhdCBpcyByZXNvbHZlZCB3aXRoIHRoZSBjaGlsZCBwcm9jZXNzJ3MgdHJpbW1lZCBvdXRwdXQgd2hlblxuICAgICAqIHRoZSBleGl0IGNvZGUgaXMgMCBhbmQgaXMgcmVqZWN0ZWQgd2hlbiBpdCBpcyBub24temVyby5cbiAgICAgKi9cbiAgICBjbG9zZVByb21pc2U6IFByb21pc2U8c3RyaW5nPjtcbn1cblxuLyoqXG4gKiBTcGF3bnMgYSBjaGlsZCBwcm9jZXNzLiAgRWFjaCBzdGRvdXQgYW5kIHN0ZGVyciBvdXRwdXQgbGluZSBpcyBwcmVmaXhlZCB3aXRoXG4gKiB0aGUgc3BlY2lmaWVkIGxhYmVsLlxuICogQHBhcmFtIGRlc2NyaXB0aW9uIC0gQSB0ZXh0dWFsIGRlc2NyaXB0aW9uIG9mIHRoZSBjb21tYW5kIHRoYXQgaXMgb3V0cHV0IHdoZW5cbiAqICAgICB0aGUgY2hpbGQgcHJvY2VzcyBzdGFydHNcbiAqIEBwYXJhbSBjbWQgLSBUaGUgY29tbWFuZCB0byBydW5cbiAqIEBwYXJhbSBhcmdzIC0gQW4gYXJyYXkgb2YgYXJndW1lbnRzIGZvciBjbWRcbiAqIEBwYXJhbSBvcHRpb25zIC0gU3Bhd24gb3B0aW9ucy4gIFNlZSBjaGlsZF9wcm9jZXNzLnNwYXduIGZvciBtb3JlIGluZm8uXG4gKiBAcGFyYW0gc3Rkb3V0U3RyZWFtIC0gVGhlIHN0cmVhbSB0byByZWNlaXZlIHN0ZG91dC4gIEEgTnVsbFN0cmVhbSBpZlxuICogICAgIHVuZGVmaW5lZC5cbiAqICAgICBGb3IgZXhhbXBsZTpcbiAqICAgICBgbmV3IENvbWJpbmVkU3RyZWFtKG5ldyBQcmVmaXhTdHJlYW0oXCJmb29cIiksIHByb2Nlc3Muc3Rkb3V0KWBcbiAqIEBwYXJhbSBzdGRlcnJTdHJlYW0gLSBUaGUgc3RyZWFtIHRvIHJlY2VpdmUgc3RkZXJyICBBIE51bGxTdHJlYW0gaWZcbiAqICAgICB1bmRlZmluZWQuIEZvciBleGFtcGxlOlxuICogICAgIGBuZXcgQ29tYmluZWRTdHJlYW0obmV3IFByZWZpeFN0cmVhbShcIi4gICAgXCIpLCBwcm9jZXNzLnN0ZGVycilgXG4gKiBAcmV0dXJuIEFuIG9iamVjdCBpbXBsZW1lbnRpbmcgSVNwYXduUmVzdWx0LlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3Bhd24oXG4gICAgY21kOiBzdHJpbmcsXG4gICAgYXJnczogQXJyYXk8c3RyaW5nPixcbiAgICBvcHRpb25zPzogY3AuU3Bhd25PcHRpb25zLFxuICAgIGRlc2NyaXB0aW9uPzogc3RyaW5nLFxuICAgIHN0ZG91dFN0cmVhbT86IHN0cmVhbS5Xcml0YWJsZSxcbiAgICBzdGRlcnJTdHJlYW0/OiBzdHJlYW0uV3JpdGFibGVcbik6IElTcGF3blJlc3VsdCB7XG4gICAgY29uc3QgY21kTGluZVJlcHJlc2VudGF0aW9uID0gZ2V0Q29tbWFuZExpbmVSZXByZXNlbnRhdGlvbihjbWQsIGFyZ3MpO1xuXG4gICAgaWYgKGRlc2NyaXB0aW9uKVxuICAgIHtcbiAgICAgICAgY29uc29sZS5sb2coXCItLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLVwiKTtcbiAgICAgICAgY29uc29sZS5sb2coYCR7ZGVzY3JpcHRpb259YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKGAgICAgJHtjbWRMaW5lUmVwcmVzZW50YXRpb259YCk7XG4gICAgICAgIGNvbnNvbGUubG9nKFwiLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS1cIik7XG4gICAgfVxuXG4gICAgY29uc3Qgc3Rkb3V0Q29sbGVjdG9yID0gbmV3IENvbGxlY3RvclN0cmVhbSgpO1xuICAgIGNvbnN0IHN0ZGVyckNvbGxlY3RvciA9IG5ldyBDb2xsZWN0b3JTdHJlYW0oKTtcbiAgICBsZXQgY2hpbGRQcm9jZXNzOiBjcC5DaGlsZFByb2Nlc3M7XG5cbiAgICBjb25zdCBjbG9zZVByb21pc2UgPSBuZXcgQkJQcm9taXNlKChyZXNvbHZlOiAob3V0cHV0OiBzdHJpbmcpID0+IHZvaWQsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVqZWN0OiAoZXJyOiB7ZXhpdENvZGU6IG51bWJlciwgc3RkZXJyOiBzdHJpbmcsIHN0ZG91dDogc3RyaW5nfSkgPT4gdm9pZCkgPT4ge1xuXG4gICAgICAgIGNvbnN0IHNwYXduT3B0aW9uczogY3AuU3Bhd25PcHRpb25zID0gXy5kZWZhdWx0cyhcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAgb3B0aW9ucyxcbiAgICAgICAgICAgIHtzdGRpbzogW3Byb2Nlc3Muc3RkaW4sIFwicGlwZVwiLCBcInBpcGVcIl19KTtcblxuICAgICAgICBjaGlsZFByb2Nlc3MgPSBjcC5zcGF3bihjbWQsIGFyZ3MsIHNwYXduT3B0aW9ucyk7XG5cbiAgICAgICAgY29uc3Qgb3V0cHV0U3RyZWFtID0gc3Rkb3V0U3RyZWFtIHx8IG5ldyBOdWxsU3RyZWFtKCk7XG5cbiAgICAgICAgY2hpbGRQcm9jZXNzLnN0ZG91dFxuICAgICAgICAucGlwZShzdGRvdXRDb2xsZWN0b3IpXG4gICAgICAgIC5waXBlKG91dHB1dFN0cmVhbSk7XG5cbiAgICAgICAgY29uc3QgZXJyb3JTdHJlYW0gPSBzdGRlcnJTdHJlYW0gfHwgbmV3IE51bGxTdHJlYW0oKTtcblxuICAgICAgICBjaGlsZFByb2Nlc3Muc3RkZXJyXG4gICAgICAgIC5waXBlKHN0ZGVyckNvbGxlY3RvcikgIC8vIHRvIGNhcHR1cmUgc3RkZXJyIGluIGNhc2UgY2hpbGQgcHJvY2VzcyBlcnJvcnNcbiAgICAgICAgLnBpcGUoZXJyb3JTdHJlYW0pO1xuXG4gICAgICAgIGNoaWxkUHJvY2Vzcy5vbmNlKFwiZXhpdFwiLCAoZXhpdENvZGU6IG51bWJlcikgPT4ge1xuICAgICAgICAgICAgLy8gV2FpdCBmb3IgYWxsIHN0ZWFtcyB0byBmbHVzaCBiZWZvcmUgcmVwb3J0aW5nIHRoYXQgdGhlIGNoaWxkXG4gICAgICAgICAgICAvLyBwcm9jZXNzIGhhcyBmaW5pc2hlZC5cbiAgICAgICAgICAgIGV2ZW50VG9Qcm9taXNlKGNoaWxkUHJvY2VzcywgXCJjbG9zZVwiKVxuICAgICAgICAgICAgLnRoZW4oKCkgPT4ge1xuICAgICAgICAgICAgICAgIGlmIChleGl0Q29kZSA9PT0gMCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoZGVzY3JpcHRpb24pXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnNvbGUubG9nKGBDaGlsZCBwcm9jZXNzIHN1Y2NlZWRlZDogJHtjbWRMaW5lUmVwcmVzZW50YXRpb259YCk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShfLnRyaW0oc3Rkb3V0Q29sbGVjdG9yLmNvbGxlY3RlZCkpO1xuICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChkZXNjcmlwdGlvbilcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5sb2coYENoaWxkIHByb2Nlc3MgZmFpbGVkOiAke2NtZExpbmVSZXByZXNlbnRhdGlvbn1gKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICByZWplY3Qoe2V4aXRDb2RlOiBleGl0Q29kZSwgc3RkZXJyOiBzdGRlcnJDb2xsZWN0b3IuY29sbGVjdGVkLCBzdGRvdXQ6IHN0ZG91dENvbGxlY3Rvci5jb2xsZWN0ZWR9KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG5cbiAgICB9KTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIGNoaWxkUHJvY2VzczogY2hpbGRQcm9jZXNzISxcbiAgICAgICAgY2xvc2VQcm9taXNlOiBjbG9zZVByb21pc2VcbiAgICB9O1xufVxuXG5cbmZ1bmN0aW9uIGdldENvbW1hbmRMaW5lUmVwcmVzZW50YXRpb24oY21kOiBzdHJpbmcsIGFyZ3M6IEFycmF5PHN0cmluZz4pOiBzdHJpbmdcbntcbiAgICBhcmdzID0gYXJncy5tYXAoKGN1ckFyZykgPT5cbiAgICB7XG4gICAgICAgIGlmIChfLmluY2x1ZGVzKGN1ckFyZywgXCIgXCIpKVxuICAgICAgICB7XG4gICAgICAgICAgICByZXR1cm4gYFwiJHtjdXJBcmd9XCJgO1xuICAgICAgICB9IGVsc2VcbiAgICAgICAge1xuICAgICAgICAgICAgcmV0dXJuIGN1ckFyZztcbiAgICAgICAgfVxuICAgIH0pO1xuXG4gICAgcmV0dXJuIGAke2NtZH0gJHthcmdzLmpvaW4oXCIgXCIpfWA7XG59XG4iXX0=
