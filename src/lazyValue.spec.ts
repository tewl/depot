import { LazyValue } from "./lazyValue";


describe("LazyValue", () => {

    describe("value getter", () => {

        it("caches the computed value", () => {
            let numInvocations = 0;
            function compute(): number {
                numInvocations++;
                return numInvocations;
            }

            const lv = new LazyValue(compute);
            expect(lv.value).toEqual(1);
            expect(lv.value).toEqual(1);
            expect(lv.value).toEqual(1);
        });

    });


    describe("invalidate()", () => {

        it("causes subsequent reading of value to invoke the compute function", () => {
            let numInvocations = 0;
            function compute(): number {
                numInvocations++;
                return numInvocations;
            }

            const lv = new LazyValue(compute);
            expect(lv.value).toEqual(1);
            expect(lv.value).toEqual(1);
            lv.invalidate();
            expect(lv.value).toEqual(2);
            lv.invalidate();
            expect(lv.value).toEqual(3);
        });
    });

});
