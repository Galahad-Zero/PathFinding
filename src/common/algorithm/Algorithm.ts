import { Graph, parseLocation, stringifyLocation } from '../graph/Graph';
import { GraphNode, Location } from '../graph/GraphTypes';
import PriorityQueue from '../queue/PriorityQueue';
import Queue from '../queue/Queue';

/**
 * 路径流向图
 * 表示网格间路径流向;
 * 以字符串为key，表示目标节点的坐标;
 * 以Location为value，表示源节点的坐标
 */
export type PathFlowGraph = Map<string, Location>;

export interface AlgorithmTask {
    startNode: GraphNode;
    goalNode: GraphNode;
    nearestPath: GraphNode[];
    cameFrom: Record<string, string | null>;
    costSoFar: Record<string, number>;
    frontier: PriorityQueue<GraphNode> | Queue<GraphNode>;
}

/**
 * 算法抽象类
 */
export abstract class Algorithm {
    // 算法描述
    protected abstract algorithmInfo: string;
    public foundPath: GraphNode[] = [];

    // 绑定图
    constructor(protected graph: Graph) {}

    /**
     * 获取算法任务
     * @param start 起点
     * @param goal 终点
     * @param withPriorityQueue 是否使用优先队列
     * @returns 算法任务
     */
    static getAlgorithmTask(
        start: Location,
        goal: Location,
        graph: Graph,
        withPriorityQueue: boolean = false
    ): AlgorithmTask {
        const frontier = withPriorityQueue
            ? new PriorityQueue<GraphNode>(true)
            : new Queue<GraphNode>();
        const startNode = graph.getNode(start);
        if (!startNode) {
            throw new Error('Start node not found: ' + start);
        }
        const goalNode = graph.getNode(goal);
        if (!goalNode) {
            throw new Error('Goal node not found: ' + goal);
        }
        if (frontier instanceof PriorityQueue) {
            frontier.put(startNode, 0);
        } else {
            frontier.put(startNode);
        }
        return {
            startNode,
            goalNode,
            nearestPath: [],
            cameFrom: { [stringifyLocation(start)]: null },
            costSoFar: { [stringifyLocation(start)]: 0 },
            frontier,
        };
    }

    /**
     * 获取算法描述
     * @returns 算法描述
     */
    public getAlgorithmInfo(): string {
        return this.algorithmInfo;
    }

    /**
     * 回溯路径，从终点到起点
     * @param cameFrom 路径流向图
     * @param startNode 起点
     * @param goalNode 终点
     * @returns 路径，从终点到起点
     */
    protected backtrackPath(
        cameFrom: Record<string, string | null>,
        startNode: GraphNode,
        goalNode: GraphNode
    ): GraphNode[] {
        // 从目标节点开始，回溯路径
        const path: GraphNode[] = [goalNode];
        let current = goalNode;
        while (current) {
            // 如果当前节点是起始节点，则退出
            if (current === startNode) {
                break;
            }
            // 获取当前节点的路径
            const nextLocStr = cameFrom[stringifyLocation(current.location)];
            if (!nextLocStr) {
                throw new Error('Next location not found: ' + current.location);
            }
            // 获取下一个节点的位置
            const nextLoc = parseLocation(nextLocStr);
            // 获取下一个节点
            const nextNode = this.graph.getNode(nextLoc);
            if (!nextNode) {
                throw new Error('Next node not found: ' + nextLoc);
            }
            // 将下一个节点设置为当前节点
            current = nextNode;
            // 将当前节点加入路径
            path.push(current);
        }
        // 反转路径
        path.reverse();
        console.log('path: ', path);
        return path;
    }

    /**
     * 查找路径
     * @param task 任务
     * @returns 任务
     */
    abstract runAlgorithmTask(task: AlgorithmTask): void;

    /**
     * 查找路径
     * @param start 起点
     * @param goal 终点
     * @returns 路径，从起点到终点
     */
    abstract findNearestPath(_start: Location, _goal: Location): GraphNode[];

    /**
     * 获取路径流向图
     * @param start 起点
     * @returns 路径流向图, 所有节点的路径流向
     */
    abstract getPathFlowGraph(_start: Location): PathFlowGraph;

    /**
     * 获取启发式值
     * @param node1 节点1
     * @param node2 节点2
     * @returns 启发式值
     */
    protected getHeuristic(
        node1: GraphNode,
        node2: GraphNode,
        _goalNode?: GraphNode
    ): number {
        return (
            Math.abs(node1.location.x - node2.location.x) +
            Math.abs(node1.location.y - node2.location.y)
        );
    }
}
