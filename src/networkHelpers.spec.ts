import * as _ from "lodash";
import {getExternalIpv4Addresses} from "./networkHelpers";

describe("getExternalIpv4Addresses()", () => {


    it("will return an object with at least one string key", () => {
        const networkAddresses = getExternalIpv4Addresses();
        const firstIpAddr = _.values(networkAddresses)[0];
        expect(_.isString(firstIpAddr)).toEqual(true);
    });


});
