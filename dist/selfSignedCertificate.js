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
Object.defineProperty(exports, "__esModule", { value: true });
var os_1 = require("os");
var BBPromise = require("bluebird");
var spawn_1 = require("./spawn");
var directory_1 = require("./directory");
var file_1 = require("./file");
var uniqueProcessStr_1 = require("./uniqueProcessStr");
var CertificateCountryCode;
(function (CertificateCountryCode) {
    CertificateCountryCode["US"] = "US";
})(CertificateCountryCode = exports.CertificateCountryCode || (exports.CertificateCountryCode = {}));
var SelfSignedCertificate = /** @class */ (function () {
    // endregion
    function SelfSignedCertificate(countryCode, state, location, organization, organizationalUnit, commonName, keyData, certData) {
        this._countryCode = countryCode;
        this._state = state;
        this._location = location;
        this._organization = organization;
        this._organizationalUnit = organizationalUnit;
        this._commonName = commonName;
        this._keyData = keyData;
        this._certData = certData;
    }
    SelfSignedCertificate.create = function (countryCode, state, location, organization, organizationalUnit, commonName) {
        return __awaiter(this, void 0, void 0, function () {
            var id, tmpDir, keyFile, certFile, subjStr, _a, keyData, certData, instance, err_1;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        id = uniqueProcessStr_1.getUniqueProcessStr();
                        tmpDir = new directory_1.Directory(os_1.tmpdir());
                        keyFile = new file_1.File(tmpDir, id + "_selfsignedcert.key");
                        certFile = new file_1.File(tmpDir, id + "_selfsignedcert.crt");
                        subjStr = "/C=" + countryCode + "/ST=" + state + "/L=" + location + "/O=" + organization + "/OU=" + organizationalUnit + "/CN=" + commonName;
                        _b.label = 1;
                    case 1:
                        _b.trys.push([1, 5, , 6]);
                        return [4 /*yield*/, spawn_1.spawn("openssl", [
                                "req",
                                "-nodes",
                                "-newkey", "rsa:2048",
                                "-keyout", keyFile.absolute().toString(),
                                "-out", certFile.absolute().toString(),
                                "-x509",
                                "-days", "365",
                                "-subj", subjStr
                            ]).closePromise];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, BBPromise.all([keyFile.read(), certFile.read()])];
                    case 3:
                        _a = __read.apply(void 0, [_b.sent(), 2]), keyData = _a[0], certData = _a[1];
                        instance = new SelfSignedCertificate(countryCode, state, location, organization, organizationalUnit, commonName, keyData, certData);
                        // Cleanup
                        return [4 /*yield*/, BBPromise.all([keyFile.delete(), certFile.delete()])];
                    case 4:
                        // Cleanup
                        _b.sent();
                        return [2 /*return*/, instance];
                    case 5:
                        err_1 = _b.sent();
                        throw err_1;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    Object.defineProperty(SelfSignedCertificate.prototype, "countryCode", {
        get: function () { return this._countryCode; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelfSignedCertificate.prototype, "state", {
        get: function () { return this._state; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelfSignedCertificate.prototype, "location", {
        get: function () { return this._location; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelfSignedCertificate.prototype, "organization", {
        get: function () { return this._organization; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelfSignedCertificate.prototype, "organizationalUnit", {
        get: function () { return this._organizationalUnit; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelfSignedCertificate.prototype, "commonName", {
        get: function () { return this._commonName; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelfSignedCertificate.prototype, "keyData", {
        get: function () { return this._keyData; },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(SelfSignedCertificate.prototype, "certData", {
        get: function () { return this._certData; },
        enumerable: true,
        configurable: true
    });
    return SelfSignedCertificate;
}());
exports.SelfSignedCertificate = SelfSignedCertificate;

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uL3NyYy9zZWxmU2lnbmVkQ2VydGlmaWNhdGUudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7QUFBQSx5QkFBMEI7QUFDMUIsb0NBQXNDO0FBQ3RDLGlDQUE4QjtBQUM5Qix5Q0FBc0M7QUFDdEMsK0JBQTRCO0FBQzVCLHVEQUF1RDtBQUd2RCxJQUFZLHNCQUdYO0FBSEQsV0FBWSxzQkFBc0I7SUFFOUIsbUNBQVMsQ0FBQTtBQUNiLENBQUMsRUFIVyxzQkFBc0IsR0FBdEIsOEJBQXNCLEtBQXRCLDhCQUFzQixRQUdqQztBQUdEO0lBOERJLFlBQVk7SUFHWiwrQkFDSSxXQUFtQixFQUNuQixLQUFhLEVBQ2IsUUFBZ0IsRUFDaEIsWUFBb0IsRUFDcEIsa0JBQTBCLEVBQzFCLFVBQWtCLEVBQ2xCLE9BQWUsRUFDZixRQUFnQjtRQUdoQixJQUFJLENBQUMsWUFBWSxHQUFVLFdBQVcsQ0FBQztRQUN2QyxJQUFJLENBQUMsTUFBTSxHQUFnQixLQUFLLENBQUM7UUFDakMsSUFBSSxDQUFDLFNBQVMsR0FBYSxRQUFRLENBQUM7UUFDcEMsSUFBSSxDQUFDLGFBQWEsR0FBUyxZQUFZLENBQUM7UUFDeEMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLGtCQUFrQixDQUFDO1FBQzlDLElBQUksQ0FBQyxXQUFXLEdBQVcsVUFBVSxDQUFDO1FBQ3RDLElBQUksQ0FBQyxRQUFRLEdBQWMsT0FBTyxDQUFDO1FBQ25DLElBQUksQ0FBQyxTQUFTLEdBQWEsUUFBUSxDQUFDO0lBQ3hDLENBQUM7SUFqRm1CLDRCQUFNLEdBQTFCLFVBQ0ksV0FBbUIsRUFDbkIsS0FBYSxFQUNiLFFBQWdCLEVBQ2hCLFlBQW9CLEVBQ3BCLGtCQUEwQixFQUMxQixVQUFrQjs7Ozs7O3dCQUdaLEVBQUUsR0FBRyxzQ0FBbUIsRUFBRSxDQUFDO3dCQUMzQixNQUFNLEdBQUcsSUFBSSxxQkFBUyxDQUFDLFdBQU0sRUFBRSxDQUFDLENBQUM7d0JBQ2pDLE9BQU8sR0FBRyxJQUFJLFdBQUksQ0FBQyxNQUFNLEVBQUssRUFBRSx3QkFBcUIsQ0FBQyxDQUFDO3dCQUN2RCxRQUFRLEdBQUcsSUFBSSxXQUFJLENBQUMsTUFBTSxFQUFLLEVBQUUsd0JBQXFCLENBQUMsQ0FBQzt3QkFFeEQsT0FBTyxHQUFHLFFBQU0sV0FBVyxZQUFPLEtBQUssV0FBTSxRQUFRLFdBQU0sWUFBWSxZQUFPLGtCQUFrQixZQUFPLFVBQVksQ0FBQzs7Ozt3QkFHdEgscUJBQU0sYUFBSyxDQUNQLFNBQVMsRUFDVDtnQ0FDSSxLQUFLO2dDQUNMLFFBQVE7Z0NBQ1IsU0FBUyxFQUFFLFVBQVU7Z0NBQ3JCLFNBQVMsRUFBRSxPQUFPLENBQUMsUUFBUSxFQUFFLENBQUMsUUFBUSxFQUFFO2dDQUN4QyxNQUFNLEVBQUUsUUFBUSxDQUFDLFFBQVEsRUFBRSxDQUFDLFFBQVEsRUFBRTtnQ0FDdEMsT0FBTztnQ0FDUCxPQUFPLEVBQUUsS0FBSztnQ0FDZCxPQUFPLEVBQUUsT0FBTzs2QkFDbkIsQ0FDSixDQUFDLFlBQVksRUFBQTs7d0JBWmQsU0FZYyxDQUFDO3dCQUdhLHFCQUFNLFNBQVMsQ0FBQyxHQUFHLENBQWlCLENBQUMsT0FBTyxDQUFDLElBQUksRUFBRSxFQUFFLFFBQVEsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxDQUFDLEVBQUE7O3dCQUE1RixLQUFBLHNCQUFzQixTQUFzRSxLQUFBLEVBQTNGLE9BQU8sUUFBQSxFQUFFLFFBQVEsUUFBQTt3QkFHbEIsUUFBUSxHQUFHLElBQUkscUJBQXFCLENBQ3RDLFdBQVcsRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLFlBQVksRUFBRSxrQkFBa0IsRUFBRSxVQUFVLEVBQUUsT0FBTyxFQUFFLFFBQVEsQ0FBQyxDQUFDO3dCQUVuRyxVQUFVO3dCQUNWLHFCQUFNLFNBQVMsQ0FBQyxHQUFHLENBQUMsQ0FBQyxPQUFPLENBQUMsTUFBTSxFQUFFLEVBQUUsUUFBUSxDQUFDLE1BQU0sRUFBRSxDQUFDLENBQUMsRUFBQTs7d0JBRDFELFVBQVU7d0JBQ1YsU0FBMEQsQ0FBQzt3QkFFM0Qsc0JBQU8sUUFBUSxFQUFDOzs7d0JBR2hCLE1BQU0sS0FBRyxDQUFDOzs7OztLQUdqQjtJQXFDRCxzQkFBVyw4Q0FBVzthQUF0QixjQUEwQyxPQUFPLElBQUksQ0FBQyxZQUFZLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNyRSxzQkFBVyx3Q0FBSzthQUFoQixjQUEwQyxPQUFPLElBQUksQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUMvRCxzQkFBVywyQ0FBUTthQUFuQixjQUEwQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNsRSxzQkFBVywrQ0FBWTthQUF2QixjQUEwQyxPQUFPLElBQUksQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUN0RSxzQkFBVyxxREFBa0I7YUFBN0IsY0FBMEMsT0FBTyxJQUFJLENBQUMsbUJBQW1CLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUM1RSxzQkFBVyw2Q0FBVTthQUFyQixjQUEwQyxPQUFPLElBQUksQ0FBQyxXQUFXLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNwRSxzQkFBVywwQ0FBTzthQUFsQixjQUEwQyxPQUFPLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUNqRSxzQkFBVywyQ0FBUTthQUFuQixjQUEwQyxPQUFPLElBQUksQ0FBQyxTQUFTLENBQUMsQ0FBQyxDQUFDOzs7T0FBQTtJQUN0RSw0QkFBQztBQUFELENBL0ZBLEFBK0ZDLElBQUE7QUEvRlksc0RBQXFCIiwiZmlsZSI6InNlbGZTaWduZWRDZXJ0aWZpY2F0ZS5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCB7dG1wZGlyfSBmcm9tIFwib3NcIjtcbmltcG9ydCAqIGFzIEJCUHJvbWlzZSBmcm9tIFwiYmx1ZWJpcmRcIjtcbmltcG9ydCB7c3Bhd259IGZyb20gXCIuL3NwYXduXCI7XG5pbXBvcnQge0RpcmVjdG9yeX0gZnJvbSBcIi4vZGlyZWN0b3J5XCI7XG5pbXBvcnQge0ZpbGV9IGZyb20gXCIuL2ZpbGVcIjtcbmltcG9ydCB7Z2V0VW5pcXVlUHJvY2Vzc1N0cn0gZnJvbSBcIi4vdW5pcXVlUHJvY2Vzc1N0clwiO1xuXG5cbmV4cG9ydCBlbnVtIENlcnRpZmljYXRlQ291bnRyeUNvZGVcbntcbiAgICBVUyA9IFwiVVNcIlxufVxuXG5cbmV4cG9ydCBjbGFzcyBTZWxmU2lnbmVkQ2VydGlmaWNhdGVcbntcblxuICAgIHB1YmxpYyBzdGF0aWMgYXN5bmMgY3JlYXRlKFxuICAgICAgICBjb3VudHJ5Q29kZTogc3RyaW5nLFxuICAgICAgICBzdGF0ZTogc3RyaW5nLFxuICAgICAgICBsb2NhdGlvbjogc3RyaW5nLFxuICAgICAgICBvcmdhbml6YXRpb246IHN0cmluZyxcbiAgICAgICAgb3JnYW5pemF0aW9uYWxVbml0OiBzdHJpbmcsXG4gICAgICAgIGNvbW1vbk5hbWU6IHN0cmluZ1xuICAgICk6IFByb21pc2U8U2VsZlNpZ25lZENlcnRpZmljYXRlPlxuICAgIHtcbiAgICAgICAgY29uc3QgaWQgPSBnZXRVbmlxdWVQcm9jZXNzU3RyKCk7XG4gICAgICAgIGNvbnN0IHRtcERpciA9IG5ldyBEaXJlY3RvcnkodG1wZGlyKCkpO1xuICAgICAgICBjb25zdCBrZXlGaWxlID0gbmV3IEZpbGUodG1wRGlyLCBgJHtpZH1fc2VsZnNpZ25lZGNlcnQua2V5YCk7XG4gICAgICAgIGNvbnN0IGNlcnRGaWxlID0gbmV3IEZpbGUodG1wRGlyLCBgJHtpZH1fc2VsZnNpZ25lZGNlcnQuY3J0YCk7XG5cbiAgICAgICAgY29uc3Qgc3VialN0ciA9IGAvQz0ke2NvdW50cnlDb2RlfS9TVD0ke3N0YXRlfS9MPSR7bG9jYXRpb259L089JHtvcmdhbml6YXRpb259L09VPSR7b3JnYW5pemF0aW9uYWxVbml0fS9DTj0ke2NvbW1vbk5hbWV9YDtcblxuICAgICAgICB0cnkge1xuICAgICAgICAgICAgYXdhaXQgc3Bhd24oXG4gICAgICAgICAgICAgICAgXCJvcGVuc3NsXCIsXG4gICAgICAgICAgICAgICAgW1xuICAgICAgICAgICAgICAgICAgICBcInJlcVwiLFxuICAgICAgICAgICAgICAgICAgICBcIi1ub2Rlc1wiLFxuICAgICAgICAgICAgICAgICAgICBcIi1uZXdrZXlcIiwgXCJyc2E6MjA0OFwiLFxuICAgICAgICAgICAgICAgICAgICBcIi1rZXlvdXRcIiwga2V5RmlsZS5hYnNvbHV0ZSgpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIFwiLW91dFwiLCBjZXJ0RmlsZS5hYnNvbHV0ZSgpLnRvU3RyaW5nKCksXG4gICAgICAgICAgICAgICAgICAgIFwiLXg1MDlcIixcbiAgICAgICAgICAgICAgICAgICAgXCItZGF5c1wiLCBcIjM2NVwiLFxuICAgICAgICAgICAgICAgICAgICBcIi1zdWJqXCIsIHN1YmpTdHJcbiAgICAgICAgICAgICAgICBdXG4gICAgICAgICAgICApLmNsb3NlUHJvbWlzZTtcblxuICAgICAgICAgICAgLy8gUmVhZCB0aGUga2V5IGFuZCBjZXJ0IGRhdGEgKGluIHBhcmFsbGVsKS5cbiAgICAgICAgICAgIGNvbnN0IFtrZXlEYXRhLCBjZXJ0RGF0YV0gPSBhd2FpdCBCQlByb21pc2UuYWxsPHN0cmluZywgc3RyaW5nPihba2V5RmlsZS5yZWFkKCksIGNlcnRGaWxlLnJlYWQoKV0pO1xuXG4gICAgICAgICAgICAvLyBDcmVhdGUgdGhlIG5ldyBpbnN0YW5jZS5cbiAgICAgICAgICAgIGNvbnN0IGluc3RhbmNlID0gbmV3IFNlbGZTaWduZWRDZXJ0aWZpY2F0ZShcbiAgICAgICAgICAgICAgICBjb3VudHJ5Q29kZSwgc3RhdGUsIGxvY2F0aW9uLCBvcmdhbml6YXRpb24sIG9yZ2FuaXphdGlvbmFsVW5pdCwgY29tbW9uTmFtZSwga2V5RGF0YSwgY2VydERhdGEpO1xuXG4gICAgICAgICAgICAvLyBDbGVhbnVwXG4gICAgICAgICAgICBhd2FpdCBCQlByb21pc2UuYWxsKFtrZXlGaWxlLmRlbGV0ZSgpLCBjZXJ0RmlsZS5kZWxldGUoKV0pO1xuXG4gICAgICAgICAgICByZXR1cm4gaW5zdGFuY2U7XG4gICAgICAgIH1cbiAgICAgICAgY2F0Y2ggKGVycikge1xuICAgICAgICAgICAgdGhyb3cgZXJyO1xuICAgICAgICB9XG5cbiAgICB9XG5cblxuICAgIC8vIHJlZ2lvbiBJbnN0YW5jZSBEYXRhIE1lbWJlcnNcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9jb3VudHJ5Q29kZTogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX3N0YXRlOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfbG9jYXRpb246IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vcmdhbml6YXRpb246IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9vcmdhbml6YXRpb25hbFVuaXQ6IHN0cmluZztcbiAgICBwcml2YXRlIHJlYWRvbmx5IF9jb21tb25OYW1lOiBzdHJpbmc7XG4gICAgcHJpdmF0ZSByZWFkb25seSBfa2V5RGF0YTogc3RyaW5nO1xuICAgIHByaXZhdGUgcmVhZG9ubHkgX2NlcnREYXRhOiBzdHJpbmc7XG4gICAgLy8gZW5kcmVnaW9uXG5cblxuICAgIHByaXZhdGUgY29uc3RydWN0b3IoXG4gICAgICAgIGNvdW50cnlDb2RlOiBzdHJpbmcsXG4gICAgICAgIHN0YXRlOiBzdHJpbmcsXG4gICAgICAgIGxvY2F0aW9uOiBzdHJpbmcsXG4gICAgICAgIG9yZ2FuaXphdGlvbjogc3RyaW5nLFxuICAgICAgICBvcmdhbml6YXRpb25hbFVuaXQ6IHN0cmluZyxcbiAgICAgICAgY29tbW9uTmFtZTogc3RyaW5nLFxuICAgICAgICBrZXlEYXRhOiBzdHJpbmcsXG4gICAgICAgIGNlcnREYXRhOiBzdHJpbmdcbiAgICApXG4gICAge1xuICAgICAgICB0aGlzLl9jb3VudHJ5Q29kZSAgICAgICAgPSBjb3VudHJ5Q29kZTtcbiAgICAgICAgdGhpcy5fc3RhdGUgICAgICAgICAgICAgID0gc3RhdGU7XG4gICAgICAgIHRoaXMuX2xvY2F0aW9uICAgICAgICAgICA9IGxvY2F0aW9uO1xuICAgICAgICB0aGlzLl9vcmdhbml6YXRpb24gICAgICAgPSBvcmdhbml6YXRpb247XG4gICAgICAgIHRoaXMuX29yZ2FuaXphdGlvbmFsVW5pdCA9IG9yZ2FuaXphdGlvbmFsVW5pdDtcbiAgICAgICAgdGhpcy5fY29tbW9uTmFtZSAgICAgICAgID0gY29tbW9uTmFtZTtcbiAgICAgICAgdGhpcy5fa2V5RGF0YSAgICAgICAgICAgID0ga2V5RGF0YTtcbiAgICAgICAgdGhpcy5fY2VydERhdGEgICAgICAgICAgID0gY2VydERhdGE7XG4gICAgfVxuXG5cbiAgICBwdWJsaWMgZ2V0IGNvdW50cnlDb2RlKCk6IHN0cmluZyAgICAgICAgeyByZXR1cm4gdGhpcy5fY291bnRyeUNvZGU7IH1cbiAgICBwdWJsaWMgZ2V0IHN0YXRlKCk6IHN0cmluZyAgICAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fc3RhdGU7IH1cbiAgICBwdWJsaWMgZ2V0IGxvY2F0aW9uKCk6IHN0cmluZyAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fbG9jYXRpb247IH1cbiAgICBwdWJsaWMgZ2V0IG9yZ2FuaXphdGlvbigpOiBzdHJpbmcgICAgICAgeyByZXR1cm4gdGhpcy5fb3JnYW5pemF0aW9uOyB9XG4gICAgcHVibGljIGdldCBvcmdhbml6YXRpb25hbFVuaXQoKTogc3RyaW5nIHsgcmV0dXJuIHRoaXMuX29yZ2FuaXphdGlvbmFsVW5pdDsgfVxuICAgIHB1YmxpYyBnZXQgY29tbW9uTmFtZSgpOiBzdHJpbmcgICAgICAgICB7IHJldHVybiB0aGlzLl9jb21tb25OYW1lOyB9XG4gICAgcHVibGljIGdldCBrZXlEYXRhKCk6IHN0cmluZyAgICAgICAgICAgIHsgcmV0dXJuIHRoaXMuX2tleURhdGE7IH1cbiAgICBwdWJsaWMgZ2V0IGNlcnREYXRhKCk6IHN0cmluZyAgICAgICAgICAgeyByZXR1cm4gdGhpcy5fY2VydERhdGE7IH1cbn1cbiJdfQ==
