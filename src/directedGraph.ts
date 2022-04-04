import { failed, failedResult, Result, succeededResult } from "./result";
import { mapWhileSuccessful } from "./resultHelpers";
import { difference } from "./setHelpers";
import { noneOption, Option, someOption } from "./option";


export interface IAdjacencyInfo<TVertex, TEdge>
{
    edgeAttr: TEdge;
    toVertex: TVertex;
}


export type AdjacencyMap<TVertex, TEdge> = Map<TVertex, Array<IAdjacencyInfo<TVertex, TEdge>>>;


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


    /**
     * Iterates over this graph's vertices, returning the first vertex
     * _predicate_ returns truthy for.  This facilitates getting the vertex when
     * TVertex is a reference type.
     * @param predicate - The function invoked on each vertex
     * @returns The found vertex or undefined
     */
    public findVertex(predicate: (vertex: TVertex, allVertices: Set<TVertex>) => boolean): undefined | TVertex
    {
        const vertices = new Set(Array.from(this._adjMap.keys()));

        for (const curVertex of vertices)
        {
            const predicateResult = predicate(curVertex, vertices);
            if (predicateResult)
            {
                return curVertex;
            }
        }

        return undefined;
    }


    /**
     * Performs a breadth-first search from the specified source node.  This
     * results in each node's minimal distance from _source_ and the predecessor
     * each node has in its shortest path to _source_.
     * @param source  - The vertex to start searching from
     * @returns The results of the search
     */
    public breadthFirstSearch(source: TVertex): Result<IBfsResult<TVertex>, string>
    {
        return bfs(this._adjMap, source);
    }


    /**
     * Find the specified edge within this graph.
     * @param fromVertex - Originating vertex of the edge being retrieved
     * @param toVertex - Destination vertex of the edge being retrieved
     * @returns If found, a Some option wrapping the edge's value.  A None
     * option if there is no edge connecting the specified vertices.
     */
    public getEdge(fromVertex: TVertex, toVertex: TVertex): Option<TEdge>
    {
        return getEdge(this._adjMap, fromVertex, toVertex);
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
enum BfsPaintedColor
{
    White = 0,    // Undiscovered
    Gray = 1,     // Discovered but some neighbors are undiscovered
    Black = 2     // Discovered and all neighbors are discovered (all neighbors are black or gray)
}


/**
 * Performs a breadth-first search from the specified source node.  This results
 * in each node's minimal distance from _source_ and the predecessor each node
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
    const color: Map<TVertex, BfsPaintedColor> = new Map();
    const dist: Map<TVertex, number> = new Map();
    const pred: Map<TVertex, TVertex | undefined> = new Map();
    const discovered: Set<TVertex> = new Set();

    const nonSourceVertices = difference(allVertices, new Set([source]));
    for (const curNonSourceVertex of nonSourceVertices)
    {
        color.set(curNonSourceVertex, BfsPaintedColor.White);
        dist.set(curNonSourceVertex, Infinity);
        pred.set(curNonSourceVertex, undefined);
    }

    color.set(source, BfsPaintedColor.Gray);
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
            if (color.get(v) === BfsPaintedColor.White)
            {
                // Vertex v is now discovered.
                color.set(v, BfsPaintedColor.Gray);
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
        color.set(u, BfsPaintedColor.Black);
        q.shift();
    }

    return succeededResult({distance: dist, predecessor: pred});
}


/**
 * Finds the specified edge within the graph.
 * @param adjMap - The graph's adjacency map.
 * @param fromVertex - Originating vertex of the edge being retrieved
 * @param toVertex  - Destination vertex of the edge being retrieved
 * @returns If found, a Some option wrapping the edge's value.  A None option
 * if there is no edge connecting the specified vertices.
 */
function getEdge<TVertex, TEdge>(
    adjMap: AdjacencyMap<TVertex, TEdge>,
    fromVertex: TVertex,
    toVertex: TVertex
): Option<TEdge>
{
    const vertices = new Set(adjMap.keys());
    const validationRes = mapWhileSuccessful(
        [fromVertex, toVertex],
        (v) => vertices.has(v) ?
                succeededResult(v) :
                failedResult(`Vertex ${JSON.stringify(v)} is not a vertex in this graph.`)
    );
    if (failed(validationRes))
    {
        throw new Error(validationRes.error);
    }

    const adjInfo =
        adjMap.get(fromVertex)
        ?.find((curAdjInfo) => curAdjInfo.toVertex === toVertex);

    if (adjInfo)
    {
        return someOption(adjInfo.edgeAttr);
    }
    else
    {
        // There is no edge connecting the two vertices.
        return noneOption();
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
