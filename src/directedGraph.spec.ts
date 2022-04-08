import * as _ from "lodash";
import { DirectedGraph } from "./directedGraph";
import { isNone, isSome } from "./option";
import { failed, succeeded } from "./result";


const vertices = new Set(["r", "s", "t", "u", "v", "w", "x", "y"]);
const edges = [
    {fromVertex: "s", toVertex: "r", edgeAttr: "sr"},
    {fromVertex: "r", toVertex: "v", edgeAttr: "rv"},
    {fromVertex: "s", toVertex: "w", edgeAttr: "sw"},
    {fromVertex: "w", toVertex: "t", edgeAttr: "wt"},
    {fromVertex: "w", toVertex: "x", edgeAttr: "wx"},
    {fromVertex: "x", toVertex: "t", edgeAttr: "xt"},
    {fromVertex: "t", toVertex: "u", edgeAttr: "tu"},
    {fromVertex: "x", toVertex: "y", edgeAttr: "xy"},
    {fromVertex: "u", toVertex: "y", edgeAttr: "uy"},
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


            it("fails when given invalid data (a vertex does not exist)", () =>
            {
                const invalidEdges = edges.concat({fromVertex: "a", toVertex: "s", edgeAttr: "as"});
                const createRes = DirectedGraph.create(vertices, invalidEdges);
                expect(failed(createRes)).toBeTrue();
                expect(createRes.error).toEqual('Edge specifies a fromVertex of "a" which is not in the vertex collection.');
            });
        });
    });


    describe("instance", () =>
    {
        describe("vertices property", () =>
        {
            it("contains the graphs's vertices", () =>
            {
                const digraph = DirectedGraph.create(vertices, edges).value!;
                expect(digraph.vertices).toEqual(new Set(["r", "s", "t", "u", "v", "w", "x", "y"]));
            });
        });


        describe("edges property", () =>
        {
            it("contains the graph's edges", () =>
            {
                const digraph = DirectedGraph.create(vertices, edges).value!;
                expect(digraph.edges).toEqual([
                    { fromVertex: "r", toVertex: "v", edgeAttr: "rv" },
                    { fromVertex: "s", toVertex: "r", edgeAttr: "sr" },
                    { fromVertex: "s", toVertex: "w", edgeAttr: "sw" },
                    { fromVertex: "t", toVertex: "u", edgeAttr: "tu" },
                    { fromVertex: "u", toVertex: "y", edgeAttr: "uy" },
                    { fromVertex: "w", toVertex: "t", edgeAttr: "wt" },
                    { fromVertex: "w", toVertex: "x", edgeAttr: "wx" },
                    { fromVertex: "x", toVertex: "t", edgeAttr: "xt" },
                    { fromVertex: "x", toVertex: "y", edgeAttr: "xy" }
                ]);
            });
        });


        describe("breadthFirstSearch()", () =>
        {
            it("returns the expected output", () =>
            {
                const digraph = DirectedGraph.create(vertices, edges).value!;
                const searchRes = digraph.breadthFirstSearch("s");
                expect(succeeded(searchRes)).toBeTrue();
                const {distance, predecessor} = searchRes.value!;
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


            it("fails when the source node does not exist in the graph", () =>
            {
                const digraph = DirectedGraph.create(vertices, edges).value!;
                const searchRes = digraph.breadthFirstSearch("a");
                expect(failed(searchRes)).toBeTrue();
            });
        });
    });
});
