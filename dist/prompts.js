"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var inquirer = require("inquirer");
/**
 * Prompts the user to confirm whether they want to continue.
 * @param message - The message to display
 * @param defaultToConfirm - true to make confirmation the default response.
 * false to make canceling the default.
 * @param resolveValue - If the user chooses to continue, the returned promise
 * will be resolved with this value.  This makes promise chains easier to
 * create.
 * @return A promise that is resolved with resolveValue when the user chooses to
 * continue and rejects when they decline
 */
function promptToContinue(message, defaultToConfirm, resolveValue) {
    var questionConfirmation = {
        type: "confirm",
        name: "confirm",
        default: defaultToConfirm,
        message: message || "Continue?"
    };
    return inquirer.prompt([questionConfirmation])
        .then(function (answers) {
        if (!answers.confirm) {
            throw "Operation cancelled by user."; // tslint:disable-line:no-string-throw
        }
        else {
            return resolveValue;
        }
    });
}
exports.promptToContinue = promptToContinue;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9wcm9tcHRzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQUEsbUNBQXFDO0FBR3JDOzs7Ozs7Ozs7O0dBVUc7QUFDSCxTQUFnQixnQkFBZ0IsQ0FDNUIsT0FBZSxFQUNmLGdCQUF5QixFQUN6QixZQUFlO0lBRWYsSUFBTSxvQkFBb0IsR0FBc0I7UUFDNUMsSUFBSSxFQUFFLFNBQVM7UUFDZixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxnQkFBZ0I7UUFDekIsT0FBTyxFQUFFLE9BQU8sSUFBSSxXQUFXO0tBQ2xDLENBQUM7SUFFRixPQUFPLFFBQVEsQ0FBQyxNQUFNLENBQXFCLENBQUMsb0JBQW9CLENBQUMsQ0FBQztTQUNqRSxJQUFJLENBQUMsVUFBQyxPQUFPO1FBQ1YsSUFBSSxDQUFDLE9BQU8sQ0FBQyxPQUFPLEVBQUU7WUFDbEIsTUFBTSw4QkFBOEIsQ0FBQyxDQUFFLHNDQUFzQztTQUNoRjthQUNJO1lBQ0QsT0FBTyxZQUFZLENBQUM7U0FDdkI7SUFDTCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFyQkQsNENBcUJDIiwiZmlsZSI6InByb21wdHMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgKiBhcyBpbnF1aXJlciBmcm9tIFwiaW5xdWlyZXJcIjtcblxuXG4vKipcbiAqIFByb21wdHMgdGhlIHVzZXIgdG8gY29uZmlybSB3aGV0aGVyIHRoZXkgd2FudCB0byBjb250aW51ZS5cbiAqIEBwYXJhbSBtZXNzYWdlIC0gVGhlIG1lc3NhZ2UgdG8gZGlzcGxheVxuICogQHBhcmFtIGRlZmF1bHRUb0NvbmZpcm0gLSB0cnVlIHRvIG1ha2UgY29uZmlybWF0aW9uIHRoZSBkZWZhdWx0IHJlc3BvbnNlLlxuICogZmFsc2UgdG8gbWFrZSBjYW5jZWxpbmcgdGhlIGRlZmF1bHQuXG4gKiBAcGFyYW0gcmVzb2x2ZVZhbHVlIC0gSWYgdGhlIHVzZXIgY2hvb3NlcyB0byBjb250aW51ZSwgdGhlIHJldHVybmVkIHByb21pc2VcbiAqIHdpbGwgYmUgcmVzb2x2ZWQgd2l0aCB0aGlzIHZhbHVlLiAgVGhpcyBtYWtlcyBwcm9taXNlIGNoYWlucyBlYXNpZXIgdG9cbiAqIGNyZWF0ZS5cbiAqIEByZXR1cm4gQSBwcm9taXNlIHRoYXQgaXMgcmVzb2x2ZWQgd2l0aCByZXNvbHZlVmFsdWUgd2hlbiB0aGUgdXNlciBjaG9vc2VzIHRvXG4gKiBjb250aW51ZSBhbmQgcmVqZWN0cyB3aGVuIHRoZXkgZGVjbGluZVxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvbXB0VG9Db250aW51ZTxUPihcbiAgICBtZXNzYWdlOiBzdHJpbmcsXG4gICAgZGVmYXVsdFRvQ29uZmlybTogYm9vbGVhbixcbiAgICByZXNvbHZlVmFsdWU6IFRcbik6IFByb21pc2U8VD4ge1xuICAgIGNvbnN0IHF1ZXN0aW9uQ29uZmlybWF0aW9uOiBpbnF1aXJlci5RdWVzdGlvbiA9IHtcbiAgICAgICAgdHlwZTogXCJjb25maXJtXCIsXG4gICAgICAgIG5hbWU6IFwiY29uZmlybVwiLFxuICAgICAgICBkZWZhdWx0OiBkZWZhdWx0VG9Db25maXJtLFxuICAgICAgICBtZXNzYWdlOiBtZXNzYWdlIHx8IFwiQ29udGludWU/XCJcbiAgICB9O1xuXG4gICAgcmV0dXJuIGlucXVpcmVyLnByb21wdDx7Y29uZmlybTogYm9vbGVhbn0+KFtxdWVzdGlvbkNvbmZpcm1hdGlvbl0pXG4gICAgLnRoZW4oKGFuc3dlcnMpID0+IHtcbiAgICAgICAgaWYgKCFhbnN3ZXJzLmNvbmZpcm0pIHtcbiAgICAgICAgICAgIHRocm93IFwiT3BlcmF0aW9uIGNhbmNlbGxlZCBieSB1c2VyLlwiOyAgLy8gdHNsaW50OmRpc2FibGUtbGluZTpuby1zdHJpbmctdGhyb3dcbiAgICAgICAgfVxuICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgIHJldHVybiByZXNvbHZlVmFsdWU7XG4gICAgICAgIH1cbiAgICB9KTtcbn1cbiJdfQ==
