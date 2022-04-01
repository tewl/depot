import { failedResult, Result, succeededResult } from "./result";
import { difference } from "./setHelpers";


export interface IAdjacencyInfo<TVertex, TEdgeAttr>
{
    edgeAttr: TEdgeAttr;
    toVertex: TVertex;
}


// export type DirectedGraph<TVertex, TEdgeAttr> = Map<TVertex, Array<IAdjacencyInfo<TVertex, TEdgeAttr>>>;
export type AdjacencyMap<TVertex, TEdgeAttr> = Map<TVertex, Array<IAdjacencyInfo<TVertex, TEdgeAttr>>>;


export interface IEdge<TVertex, TEdgeAttr>
{
    fromVertex: TVertex;
    toVertex: TVertex;
    edgeAttr: TEdgeAttr;
}


export class DirectedGraph<TVertex, TEdgeAttr>
{
    /**
     * Creates a new DirectedGraph instance.
     * @param vertices - The vertices of the graph
     * @param edges - The edges of the graph. All referenced vertices must exist
     * in _vertices_.
     * @returns A Result for the new instance. If there was an error, a failure
     * Result containing an error message string.
     */
    public static create<TVertex, TEdgeAttr>(
        vertices: Set<TVertex>,
        edges: Array<IEdge<TVertex, TEdgeAttr>>
    ): Result<DirectedGraph<TVertex, TEdgeAttr>, string>
    {
        const adjMap: AdjacencyMap<TVertex, TEdgeAttr> = new Map();

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

    private readonly _adjMap: AdjacencyMap<TVertex, TEdgeAttr>;

    /**
     * Private constructor.  Use static methods to create instances.
     * @param adjMap - The adjacency map defining the graph.
     */
    private constructor(adjMap: AdjacencyMap<TVertex, TEdgeAttr>)
    {
        this._adjMap = adjMap;
    }


    public get vertices(): Set<TVertex>
    {
        const vertices = Array.from(this._adjMap.keys());
        return new Set(vertices);
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


    public breadthFirstSearch(source: TVertex): IBfsResult<TVertex>
    {
        // Initialize data structures.
        const color: Map<TVertex, BfsPaintedColor> = new Map();
        const dist: Map<TVertex, number> = new Map();
        const pred: Map<TVertex, TVertex | undefined> = new Map();

        const nonSourceVertices = difference(this.vertices, new Set([source]));
        for (const curNonSourceVertex of nonSourceVertices)
        {
            color.set(curNonSourceVertex, BfsPaintedColor.White);
            dist.set(curNonSourceVertex, Infinity);
            pred.set(curNonSourceVertex, undefined);
        }

        color.set(source, BfsPaintedColor.Gray);
        dist.set(source, 0);
        pred.set(source, undefined);

        // A queue of gray vertices.
        const q: Array<TVertex> = [source];

        while (q.length !== 0)
        {
            const u = q[0];
            for (const curAdjInfo of this._adjMap.get(u)!) {
                const v = curAdjInfo.toVertex;
                if (color.get(v) === BfsPaintedColor.White)
                {
                    color.set(v, BfsPaintedColor.Gray);
                    dist.set(v, dist.get(u)! + 1);
                    pred.set(v, u);
                    q.push(v);
                }
            }

            q.shift();
            color.set(u, BfsPaintedColor.Black);
        }

        return {
            distance:    dist,
            predecessor: pred
        };
    }
}


export interface IBfsResult<TVertex>
{
    distance: Map<TVertex, number>;
    predecessor: Map<TVertex, TVertex | undefined>;
}


/**
 * Colors nodes are painted with while traversing a graph.
 */
enum BfsPaintedColor
{
    White = 0,    // Unvisited
    Gray = 1,     // Visited but has some white neighbors
    Black = 2     // Visited and all neighbors are black or gray
}
