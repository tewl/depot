import { failed, failedResult, Result, succeededResult } from "./result";
import { mapWhileSuccessful } from "./resultHelpers";
import { difference } from "./setHelpers";
import { noneOption, Option, someOption } from "./option";


export interface IAdjacencyInfo<TVertex, TEdge>
{
    edgeAttr: TEdge;
    toVertex: TVertex;
}


export type AdjacencyMap<TVertex, TEdge> =
    Map<TVertex, Array<IAdjacencyInfo<TVertex, TEdge>>>;


export interface IEdge<TVertex, TEdge>
{
    fromVertex: TVertex;
    toVertex: TVertex;
    edgeAttr: TEdge;
}


/**
 * Models a directed graph.  Each vertex has type TVertex and each edge has
 * attached data of type TEdge.
 */
export class DirectedGraph<TVertex, TEdge>
{
    /**
     * Creates a new DirectedGraph instance.
     * @param vertices - The vertices of the graph
     * @param edges - The edges of the graph. All referenced vertices must exist
     * in _vertices_.
     * @returns A Result for the new instance. If there was an error, a failure
     * Result containing an error message string.
     */
    public static create<TVertex, TEdge>(
        vertices: Set<TVertex>,
        edges: Array<IEdge<TVertex, TEdge>>
    ): Result<DirectedGraph<TVertex, TEdge>, string>
    {
        const adjMap: AdjacencyMap<TVertex, TEdge> = new Map();

        // Create an empty adjacency map with an entry for each vertex.
        for (const curVertex of vertices)
        {
            adjMap.set(curVertex, []);
        }

        // Move each edge into the adjacency list.
        for (const curEdge of edges)
        {
            if (!adjMap.has(curEdge.fromVertex))
            {
                const vertexStr = JSON.stringify(curEdge.fromVertex);
                return failedResult(`Edge specifies a fromVertex of ${vertexStr} which is not in the vertex collection.`);
            }
            if (!adjMap.has(curEdge.toVertex))
            {
                const vertexStr = JSON.stringify(curEdge.toVertex);
                return failedResult(`Edge specifies a toVertex of ${vertexStr} which is not in the vertex collection.`);
            }

            const adjList = adjMap.get(curEdge.fromVertex)!;
            adjList.push({
                edgeAttr: curEdge.edgeAttr,
                toVertex: curEdge.toVertex
            });
        }

        const inst = new DirectedGraph(adjMap);
        return succeededResult(inst);
    }


    private readonly _adjMap: AdjacencyMap<TVertex, TEdge>;


    /**
     * Private constructor.  Use static methods to create instances.
     * @param adjMap - The adjacency map defining the graph.
     */
    private constructor(adjMap: AdjacencyMap<TVertex, TEdge>)
    {
        this._adjMap = adjMap;
    }


    public get vertices(): Set<TVertex>
    {
        return new Set(this._adjMap.keys());
    }


    public get edges(): Array<IEdge<TVertex, TEdge>>
    {
        const edges: Array<IEdge<TVertex, TEdge>> = [];
        for (const [fromVertex, adjList] of this._adjMap.entries())
        {
            for (const adjInfo of adjList)
            {
                edges.push({
                    fromVertex: fromVertex,
                    toVertex:   adjInfo.toVertex,
                    edgeAttr:   adjInfo.edgeAttr
                });
            }
        }
        return edges;
    }


    /**
     * Performs a breadth-first search from the specified source node.  This
     * results in each vertex's minimal distance from _source_ and the predecessor
     * each vertex has in its shortest path to _source_.
     * @param source  - The vertex to start searching from
     * @returns The result of the search
     */
    public breadthFirstSearch(source: TVertex): Result<IBfsResult<TVertex>, string>
    {
        return bfs(this._adjMap, source);
    }

    /**
     * Performs a depth-first search of this graph.
     * @returns The results of the search
     */
    public depthFirstSearch(): IDfsResult<TVertex>
    {
        return dfs(this._adjMap);
    }
}


export interface IBfsResult<TVertex>
{
    /**
     * The distance from the keyed vertex to the source node. Vertices that have
     * no path to the source vertex will have a distance of Infinity.
     */
    distance: Map<TVertex, number>;
    /**
     * Each vertex's predecessor along the shortest path to the source vertex.
     * Undefined if the vertex has no path to the source node or the vertex is
     * the source vertex.
     */
    predecessor: Map<TVertex, TVertex | undefined>;
}


/**
 * Colors nodes are painted with while traversing a graph.
 */
enum PaintedColor
{
    White = 0,    // Undiscovered
    Gray = 1,     // Discovered but some neighbors are undiscovered
    Black = 2     // Discovered and all neighbors are discovered (all neighbors are black or gray)
}


/**
 * Performs a breadth-first search from the specified source node.  This results
 * in each vertex's minimal distance from _source_ and the predecessor each vertex
 * has in its shortest path to _source_.
 * @param adjMap - The graph's adjacency map
 * @param source - The vertex to start searching from
 * @param stopPred - A predicate that returns truthy to stop searching early.
 * The vertices discovered so far are passed in.
 * @returns The results of the search
 */
function bfs<TVertex, TEdge>(
    adjMap: AdjacencyMap<TVertex, TEdge>,
    source: TVertex,
    stopPred: (discovered: Set<TVertex>) => boolean = () => false
): Result<IBfsResult<TVertex>, string>
{
    const allVertices = new Set(adjMap.keys());
    if (!allVertices.has(source))
    {
        const sourceText = JSON.stringify(source);
        return failedResult(`Source vertex ${sourceText} is not a vertex in the graph.`);
    }

    // Initialize data structures.
    const color: Map<TVertex, PaintedColor> = new Map();
    const dist: Map<TVertex, number> = new Map();
    const pred: Map<TVertex, TVertex | undefined> = new Map();
    const discovered: Set<TVertex> = new Set();

    const nonSourceVertices = difference(allVertices, new Set([source]));
    for (const curNonSourceVertex of nonSourceVertices)
    {
        color.set(curNonSourceVertex, PaintedColor.White);
        dist.set(curNonSourceVertex, Infinity);
        pred.set(curNonSourceVertex, undefined);
    }

    color.set(source, PaintedColor.Gray);
    discovered.add(source);
    dist.set(source, 0);
    pred.set(source, undefined);

    // A queue of discovered (gray) vertices whose neighbors may be
    // undiscovered.
    const q: Array<TVertex> = [source];

    while (q.length !== 0)
    {
        const u = q[0];
        for (const curAdjInfo of adjMap.get(u)!)
        {
            const v = curAdjInfo.toVertex;
            if (color.get(v) === PaintedColor.White)
            {
                // Vertex v is now discovered.
                color.set(v, PaintedColor.Gray);
                dist.set(v, dist.get(u)! + 1);
                pred.set(v, u);
                discovered.add(v);

                // Invoke the stop predicate to see if we should stop searching.
                if (stopPred(discovered))
                {
                    return succeededResult({distance: dist, predecessor: pred});
                }

                // Put v in the gray queue so we will eventually discover
                // v's neighbors.
                q.push(v);
            }
        }

        // All of u's neighbors were discovered in the above for loop.
        // Therefore, this vertex is now black.
        color.set(u, PaintedColor.Black);
        q.shift();
    }

    return succeededResult({distance: dist, predecessor: pred});
}


export interface IDfsResult<TVertex>
{
    /**
     * Each vertex's predecessor within a tree of the resulting depth-first
     * forest.  Undefined indicates the vertex is the root of tree within the
     * resulting depth-first forest.
     */
    predecessor: Map<TVertex, TVertex | undefined>;
    /**
     * A timestamp indicating when the vertex was discovered during the
     * depth-first search.  Used to classify the edges of the graph.
     */
    discoveryTimestamp: Map<TVertex, number>;
    /**
     * A timestamp indicating when the vertex was done being explored during the
     * depth-first search.  Used when performing a topological sort or finding
     * strongly connected components.
     */
    finishTimestamp: Map<TVertex, number>;
}


/**
 * Performs a depth-first search of the specified graph.
 * @param adjMap - The graph's adjacency map
 * @returns The result of the search
 */
function dfs<TVertex, TEdge>(
    adjMap: AdjacencyMap<TVertex, TEdge>
): IDfsResult<TVertex>
{
    const color: Map<TVertex, PaintedColor> = new Map();
    const pred: Map<TVertex, TVertex | undefined> = new Map();
    const discoveryTimestamp: Map<TVertex, number> = new Map();
    const finishTimestamp: Map<TVertex, number> = new Map();
    for (const curVertex of adjMap.keys()) {
        color.set(curVertex, PaintedColor.White);
        pred.set(curVertex, undefined);
    }
    let time = 0;
    for (const curVertex of adjMap.keys())
    {
        if (color.get(curVertex) === PaintedColor.White)
        {
            // curVertex has become the root of a new tree in the depth-first
            // forest.
            dfsVisit(curVertex);
        }
    }

    return {
        predecessor:        pred,
        discoveryTimestamp: discoveryTimestamp,
        finishTimestamp:    finishTimestamp
    };

    function dfsVisit(u: TVertex)
    {
        // White vertex u has just been discovered.
        color.set(u, PaintedColor.Gray);
        discoveryTimestamp.set(u, ++time);

        // Explore u's neighbors.
        const neighborVertices = adjMap.get(u)!.map((adjInfo) => adjInfo.toVertex);
        for (const v of neighborVertices)
        {
            if (color.get(v) === PaintedColor.White)
            {
                pred.set(v, u);
                dfsVisit(v);
            }
        }

        // u's neighbors have been explored.  u is now finished.
        color.set(u, PaintedColor.Black);
        finishTimestamp.set(u, ++time);
    }
}


// function shortestPath<TVertex, TEdge>(
//     adjMap: AdjacencyMap<TVertex, TEdge>,
//     startVertex: TVertex,
//     endVertex: TVertex
// ): Array<TVertex>
// {
//     bfs
// }
