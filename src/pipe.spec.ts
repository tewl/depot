import { pipe } from "./pipe";

describe("pipe()", () => {

    it("pipes a value through the specified functions", () => {
        const parse     = (text: string) => parseInt(text, 10);
        const add10     = (x: number)    => x + 10;
        const stringify = (x: number)    => `${x}`;

        const output = pipe("15", parse, add10, stringify);
        expect(output).toEqual("25");
    });

});
