import { pipe } from "./pipe3";



describe("Pipe", () => {


    it("pipes a value through the specified functions", () => {
        const result =
            pipe("5")
            .pipe((str) => parseInt(str, 10))
            .pipe((n) => n * 3)
            .pipe((n) => n + 1)
            .pipe((n) => n.toString())
            .pipe((str) => str + "!")
            .end();
        expect(result).toEqual("16!");
    });


});
