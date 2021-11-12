import * as _ from "lodash";
import { UuidFormat, reStrUuidFormatD, reStrUuidFormatN } from ".";
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


    it("returns the uuid in 'D' (dashed) format by default", () =>
    {
        const uuid = generateUuid();
        expect(uuid).toMatch(reStrUuidFormatD);
    });


    it("returns the uuid in 'N' (normal) format when asked for", () =>
    {
        const uuid = generateUuid(UuidFormat.N);
        expect(uuid).toMatch(reStrUuidFormatN);
    });


});
