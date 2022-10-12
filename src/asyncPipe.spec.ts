import {pipeAsync} from "./asyncPipe";
import { getTimerPromise } from "./promiseHelpers";


async function parseIntAsync(str: string): Promise<number> {
    await getTimerPromise(20, undefined);
    return parseInt(str, 10);
}


async function addThreeAsync(n: number): Promise<number> {
    await getTimerPromise(10, undefined);
    return n + 3;
}


describe("pipeAsync()", () => {

    it("pipes async values through the specified functions", async () => {
        const result =
            await pipeAsync("5")
            .pipe(parseIntAsync)
            .pipe(addThreeAsync)
            .pipe(addThreeAsync)
            .end();
        expect(result).toEqual(11);
    });

});
