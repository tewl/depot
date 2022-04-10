import { hr } from "./ttyHelpers";

describe("hr()", () => {
    it("returns a horizontal rule string", () => {
        expect(hr("-").length).toBeGreaterThan(0);
    });
});
