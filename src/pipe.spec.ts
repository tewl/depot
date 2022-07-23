import { pipe } from "./pipe";

describe("pipe()", () => {


    it("pipes a value through the specified functions", () => {
        const result =
            pipe(
                "5",
                (str) => parseInt(str, 10),
                (n) => n * 3,
                (n) => n + 1,
                (n) => n.toString(),
                (str) => str + "!"
            );
        expect(result).toEqual("16!");
    });


});
