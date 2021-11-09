import {getRandom, getRandomFloat, getRandomInt, getRandomIntInclusive} from "./random";


describe("getRandom", () =>
{

    it("returns a number in [0, 1)", () =>
    {
        for (let i = 0; i < 100; ++i)
        {
            const random = getRandom();
            expect((random >= 0) && (random < 1)).toBeTruthy();
        }

    });

});


describe("getRandomFloat()", () =>
{

    it("returns a number in [lower, upper)", () =>
    {
        for (let i = 0; i < 100; ++i)
        {
            const random = getRandomFloat(2.5, 8.5);
            expect((random >= 2.5) && (random < 8.5)).toBeTruthy();
        }
    });


});


describe("getRandomInt()", () =>
{

    it("returns an integer in [lower, upper)", () =>
    {
        for (let i = 0; i < 100; ++i)
        {
            const random = getRandomInt(1, 20);
            expect((random >= 1) && (random < 20)).toBeTruthy();
        }
    });


});


describe("getRandomIntInclusive()", () =>
{

    it("returns an integer in [lower, upper]", () =>
    {
        for (let i = 0; i < 100; ++i)
        {
            const random = getRandomIntInclusive(1, 10);
            expect((random >= 1) && (random <= 10)).toBeTruthy();
        }
    });


});
