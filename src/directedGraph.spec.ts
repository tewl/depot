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


        describe("findVertex()", () =>
        {
            it("returns the found vertex", () =>
            {
                const comparei = (a: string, b: string) => a.toUpperCase() === b.toUpperCase();

                const digraph = DirectedGraph.create(vertices, edges).value!;
                const vw = digraph.findVertex((vert) => comparei("W", vert));
                expect(vw).toEqual("w");
            });


            it("returns the found vertex", () =>
            {
                const comparei = (a: string, b: string) => a.toUpperCase() === b.toUpperCase();

                const createFindFn = (vertex: string) =>
                {
                    function findFn(curVertex: string)
                    {
                        return comparei(vertex, curVertex);
                    }
                    return findFn;
                };

                const digraph = DirectedGraph.create(vertices, edges).value!;
                const vt = digraph.findVertex(createFindFn("T"));
                expect(vt).toEqual("t");
            });


            it("returns the found vertex (function.bind() example)", () =>
            {
                const comparei = (a: string, b: string) => a.toUpperCase() === b.toUpperCase();

                // Example of using function.bind().
                const digraph = DirectedGraph.create(vertices, edges).value!;
                const vt = digraph.findVertex(comparei.bind(null, "T"));
                expect(vt).toEqual("t");
            });


            it("returns the found vertex (_.isEqual example)", () =>
            {
                // Convert the vertices into objects.  To facilitate this create
                // a map of name to vertex object.
                const vertexMap =
                    new Map(
                        Array.from(vertices.values())
                        .map((vertName) => [vertName, {name: vertName}] as const)
                    );
                const objVertices = new Set(Array.from(vertexMap.values()));
                const objEdges = edges.map((curEdge) => ({
                    fromVertex: vertexMap.get(curEdge.fromVertex)!,
                    toVertex:   vertexMap.get(curEdge.toVertex)!,
                    edgeAttr:   curEdge.edgeAttr
                }));
                const digraph = DirectedGraph.create(objVertices, objEdges).value!;

                // _.isEqual performs a deep comparison.
                const vw = digraph.findVertex((v) => _.isEqual({name: "w"}, v));
                expect(vw).toEqual(vertexMap.get("w"));
            });


            it("returns the found vertex (_.matches example)", () =>
            {
                // Convert the vertices into objects that have properties we
                // will be uninterested in when finding a vertex.
                const vertexMap =
                    new Map(
                        Array.from(vertices.values())
                        .map((vertName) => [vertName, {name: vertName, dontCareA: "foo", dontCareB: "bar" }] as const)
                    );
                const objVertices = new Set(Array.from(vertexMap.values()));
                const objEdges = edges.map((curEdge) => ({
                    fromVertex: vertexMap.get(curEdge.fromVertex)!,
                    toVertex:   vertexMap.get(curEdge.toVertex)!,
                    edgeAttr:   curEdge.edgeAttr
                }));
                const digraph = DirectedGraph.create(objVertices, objEdges).value!;

                // _.matches will only compare the specified properties.
                const vw = digraph.findVertex(_.matches({name: "w"}));
                expect(vw).toEqual(vertexMap.get("w"));

            });


            it("return undefined when the predicate is never truthy", () =>
            {
                const digraph = DirectedGraph.create(vertices, edges).value!;
                const vt = digraph.findVertex((v) => false);
                expect(vt).toBeUndefined();
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


        describe("getEdge()", () =>
        {
            it("when the edge exists returns the edge's value", () =>
            {
                const digraph = DirectedGraph.create(vertices, edges).value!;
                const edgeOpt = digraph.getEdge("t", "u");
                expect(isSome(edgeOpt)).toBeTrue();
                expect(edgeOpt.value).toEqual("tu");
            });


            it("when the edge does not exist return None", () =>
            {
                const digraph = DirectedGraph.create(vertices, edges).value!;
                const edgeOpt = digraph.getEdge("s", "t");
                expect(isNone(edgeOpt)).toBeTrue();
            });
        });

    });
});
