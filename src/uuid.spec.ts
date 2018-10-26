import * as _       from "lodash";
import {generateId} from "./serialize";


describe("generateId()", () => {


    it("returns a unique string", () => {
        expect(_.isString(generateId())).toEqual(true);
    });


});
