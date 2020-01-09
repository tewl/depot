"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var BBPromise = require("bluebird");
function readableStreamToText(readable) {
    return new BBPromise(function (resolve, reject) {
        readable.setEncoding("utf8");
        var accumulatedText = "";
        readable.on("readable", function () {
            var chunk = readable.read();
            if (chunk !== null) {
                accumulatedText += chunk;
            }
        });
        readable.on("end", function () {
            resolve(accumulatedText);
        });
        readable.on("error", function (err) {
            reject(err);
        });
    });
}
exports.readableStreamToText = readableStreamToText;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zdHJlYW1IZWxwZXJzLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBQ0Esb0NBQXNDO0FBR3RDLFNBQWdCLG9CQUFvQixDQUFDLFFBQWtCO0lBQ25ELE9BQU8sSUFBSSxTQUFTLENBQVMsVUFBQyxPQUFPLEVBQUUsTUFBTTtRQUN6QyxRQUFRLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFDO1FBQzdCLElBQUksZUFBZSxHQUFHLEVBQUUsQ0FBQztRQUV6QixRQUFRLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRTtZQUNwQixJQUFNLEtBQUssR0FBRyxRQUFRLENBQUMsSUFBSSxFQUFFLENBQUM7WUFDOUIsSUFBSSxLQUFLLEtBQUssSUFBSSxFQUFFO2dCQUNoQixlQUFlLElBQUksS0FBSyxDQUFDO2FBQzVCO1FBQ0wsQ0FBQyxDQUFDLENBQUM7UUFFSCxRQUFRLENBQUMsRUFBRSxDQUFDLEtBQUssRUFBRTtZQUNmLE9BQU8sQ0FBQyxlQUFlLENBQUMsQ0FBQztRQUM3QixDQUFDLENBQUMsQ0FBQztRQUVILFFBQVEsQ0FBQyxFQUFFLENBQUMsT0FBTyxFQUFFLFVBQUMsR0FBRztZQUNyQixNQUFNLENBQUMsR0FBRyxDQUFDLENBQUM7UUFDaEIsQ0FBQyxDQUFDLENBQUM7SUFFUCxDQUFDLENBQUMsQ0FBQztBQUNQLENBQUM7QUFyQkQsb0RBcUJDIiwiZmlsZSI6InN0cmVhbUhlbHBlcnMuanMiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQge1JlYWRhYmxlfSBmcm9tIFwic3RyZWFtXCI7XG5pbXBvcnQgKiBhcyBCQlByb21pc2UgZnJvbSBcImJsdWViaXJkXCI7XG5cblxuZXhwb3J0IGZ1bmN0aW9uIHJlYWRhYmxlU3RyZWFtVG9UZXh0KHJlYWRhYmxlOiBSZWFkYWJsZSk6IFByb21pc2U8c3RyaW5nPiB7XG4gICAgcmV0dXJuIG5ldyBCQlByb21pc2U8c3RyaW5nPigocmVzb2x2ZSwgcmVqZWN0KSA9PiB7XG4gICAgICAgIHJlYWRhYmxlLnNldEVuY29kaW5nKFwidXRmOFwiKTtcbiAgICAgICAgbGV0IGFjY3VtdWxhdGVkVGV4dCA9IFwiXCI7XG5cbiAgICAgICAgcmVhZGFibGUub24oXCJyZWFkYWJsZVwiLCAoKSA9PiB7XG4gICAgICAgICAgICBjb25zdCBjaHVuayA9IHJlYWRhYmxlLnJlYWQoKTtcbiAgICAgICAgICAgIGlmIChjaHVuayAhPT0gbnVsbCkge1xuICAgICAgICAgICAgICAgIGFjY3VtdWxhdGVkVGV4dCArPSBjaHVuaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmVhZGFibGUub24oXCJlbmRcIiwgKCkgPT4ge1xuICAgICAgICAgICAgcmVzb2x2ZShhY2N1bXVsYXRlZFRleHQpO1xuICAgICAgICB9KTtcblxuICAgICAgICByZWFkYWJsZS5vbihcImVycm9yXCIsIChlcnIpID0+IHtcbiAgICAgICAgICAgIHJlamVjdChlcnIpO1xuICAgICAgICB9KTtcblxuICAgIH0pO1xufVxuIl19
