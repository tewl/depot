import { DirectedGraph } from "./directedGraph";
import { failed, succeeded } from "./result";


const vertices = new Set(["r", "s", "t", "u", "v", "w", "x", "y"]);
const edges = [
    {fromVertex: "s", toVertex: "r", edgeAttr: undefined},
    {fromVertex: "r", toVertex: "v", edgeAttr: undefined},
    {fromVertex: "s", toVertex: "w", edgeAttr: undefined},
    {fromVertex: "w", toVertex: "t", edgeAttr: undefined},
    {fromVertex: "w", toVertex: "x", edgeAttr: undefined},
    {fromVertex: "x", toVertex: "t", edgeAttr: undefined},
    {fromVertex: "t", toVertex: "u", edgeAttr: undefined},
    {fromVertex: "x", toVertex: "y", edgeAttr: undefined},
    {fromVertex: "u", toVertex: "y", edgeAttr: undefined},
];


describe("DirectedGraph()", () =>
{
    describe("static", () =>
    {
        describe("create()", () =>
        {
            it("succeeds when given valid data", () =>
            {
                const createRes = DirectedGraph.create(vertices, edges);
                expect(succeeded(createRes)).toBeTrue();
            });


            it("fails when given invalid data", () =>
            {
                const invalidEdges = edges.concat({fromVertex: "a", toVertex: "s", edgeAttr: undefined});
                const createRes = DirectedGraph.create(vertices, invalidEdges);
                expect(failed(createRes)).toBeTrue();
                expect(createRes.error).toEqual('Edge specifies a fromVertex of "a" which is not in the vertex collection.');
            });
        });
    });


    describe("instance", () =>
    {
        describe("breadthFirstSearch()", () =>
        {
            it("returns the expected output", () =>
            {
                const digraph = DirectedGraph.create(vertices, edges).value!;
                const {distance, predecessor} = digraph.breadthFirstSearch("s");
                expect(distance).toEqual(new Map([
                    ["r", 1],
                    ["s", 0],
                    ["t", 2],
                    ["u", 3],
                    ["v", 2],
                    ["w", 1],
                    ["x", 2],
                    ["y", 3]
                ]));
                expect(predecessor).toEqual(new Map([
                    ["r", "s"],
                    ["s", undefined],
                    ["t", "w"],
                    ["u", "t"],
                    ["v", "r"],
                    ["w", "s"],
                    ["x", "w"],
                    ["y", "x"]
                ]));
            });
        });
    });

});
