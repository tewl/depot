import * as _ from "lodash";
import {getExternalIpv4Addresses} from "./networkHelpers";

describe("getExternalIpv4Addresses()", () => {


    it("will return an object with at least one string key", () => {
        const networkAddresses = getExternalIpv4Addresses();
        const firstKey = Object.keys(networkAddresses)[0];
        expect(_.isString(networkAddresses[firstKey])).toEqual(true);
        console.log("networkAddresses =", JSON.stringify(networkAddresses, undefined, 4));
    });


});
