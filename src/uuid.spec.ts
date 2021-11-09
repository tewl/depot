import * as _ from "lodash";
import {generateUuid} from "./uuid";


describe("generateUuid()", () =>
{

    it("returns a string", () =>
    {
        expect(_.isString(generateUuid())).toEqual(true);
    });


    it("returns a unique string", () =>
    {
        const uuid1 = generateUuid();
        const uuid2 = generateUuid();

        expect(uuid1).not.toEqual(uuid2);
    });


});
