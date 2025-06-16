import { stringifyLocation } from '../graph/Graph';
import PriorityQueue from '../queue/PriorityQueue';
import { Algorithm, AlgorithmTask, PathFlowGraph } from './Algorithm';
import { GraphNode, Location, LocationIsEqual } from '../graph/GraphTypes';

// LPA*算法中的节点结构
interface LPAStarNode {
    node: GraphNode; // 图节点
    g: number; // 从起点到该节点的实际距离
    rhs: number; // 右侧值，用于增量更新
    key: [number, number]; // 优先级键值对
}

/**
 * LPA*算法实现类
 * LPA* (Lifelong Planning A*) 是一种增量式搜索算法，适用于动态环境中的路径规划
 * 当环境发生变化时，可以高效地重新计算路径而不需要从头开始
 */
export default class LPAStarAlgorithm extends Algorithm {
    protected algorithmInfo: string =
        'LPA*算法：动态A*算法，适用于动态环境中的路径规划，可以增量更新路径。';

    // g值映射表：存储每个节点从起点到该节点的最短距离
    private g: Map<string, number> = new Map();
    // rhs值映射表：存储每个节点的右侧值，用于增量更新
    private rhs: Map<string, number> = new Map();
    // 优先队列：存储待处理的节点
    private queue: PriorityQueue<LPAStarNode> = new PriorityQueue<LPAStarNode>(
        true
    );
    // 起点节点
    private startNode: GraphNode | null = null;
    // 终点节点
    private goalNode: GraphNode | null = null;

    /**
     * 计算节点的优先级键值
     * @param node 要计算键值的节点
     * @returns 返回包含两个优先级值的数组
     */
    private calculateKey(node: GraphNode): [number, number] {
        const nodeKey = stringifyLocation(node.location);
        const gValue = this.g.get(nodeKey) ?? Infinity;
        const rhsValue = this.rhs.get(nodeKey) ?? Infinity;
        const hValue = this.getHeuristic(node, this.goalNode!);
        return [
            Math.min(gValue, rhsValue) + hValue, // 第一优先级：最小值 + 启发式值
            Math.min(gValue, rhsValue), // 第二优先级：最小值
        ];
    }

    /**
     * 初始化LPA*算法
     * @param start 起点位置
     * @param goal 终点位置
     */
    private initialize(start: Location, goal: Location): void {
        const startNode = this.graph.getNode(start);
        const goalNode = this.graph.getNode(goal);

        if (!startNode || !goalNode) {
            throw new Error('Start or goal node not found');
        }

        this.startNode = startNode;
        this.goalNode = goalNode;

        // 初始化所有节点的g和rhs值为无穷大
        for (const node of this.graph.nodes) {
            const nodeKey = stringifyLocation(node.location);
            this.g.set(nodeKey, Infinity);
            this.rhs.set(nodeKey, Infinity);
        }

        // 设置起点的rhs值为0（起点到自己的距离为0）
        const startKey = stringifyLocation(start);
        this.rhs.set(startKey, 0);

        // 将起点加入优先队列
        this.queue.put(
            {
                node: this.startNode,
                g: Infinity,
                rhs: 0,
                key: this.calculateKey(this.startNode),
            },
            this.calculateKey(this.startNode)[0]
        );
    }

    /**
     * 更新节点的rhs值并维护优先队列（如果节点的g值和rhs值不一致，则将节点加入优先队列）
     * @param node 要更新的节点
     */
    private updateVertex(node: GraphNode): void {
        const nodeKey = stringifyLocation(node.location);

        // 如果不是起点，则重新计算rhs值
        if (nodeKey !== stringifyLocation(this.startNode!.location)) {
            let minRhs = Infinity;
            // 遍历所有邻居节点，找到最小的g值+边权重
            for (const edge of node.edges) {
                if (edge.cost < 0) continue; // 跳过负权重边
                const neighborKey = stringifyLocation(edge.node.location);
                // 获取邻居节点的g值
                const gValue = this.g.get(neighborKey) ?? Infinity;
                // 更新最小rhs值
                minRhs = Math.min(minRhs, gValue + edge.cost);
            }
            // 更新节点的rhs值
            this.rhs.set(nodeKey, minRhs);
        }

        // 如果g值和rhs值不一致，说明节点需要更新
        if (this.g.get(nodeKey) !== this.rhs.get(nodeKey)) {
            // 将节点加入优先队列
            this.queue.put(
                {
                    node,
                    g: this.g.get(nodeKey) ?? Infinity,
                    rhs: this.rhs.get(nodeKey) ?? Infinity,
                    key: this.calculateKey(node),
                },
                this.calculateKey(node)[0]
            );
        } else {
            // 如果g值和rhs值一致，从队列中移除该节点
            const items = this.queue['items'];
            // 找到该节点在优先队列中的索引
            const index = items.findIndex(
                (item: { item: LPAStarNode }) =>
                    stringifyLocation(item.item.node.location) === nodeKey
            );
            if (index !== -1) {
                // 从优先队列中移除该节点
                items.splice(index, 1);
            }
        }
    }

    /**
     * 计算最短路径的核心算法
     * 持续处理优先队列中的节点，直到找到最优路径
     */
    private computeShortestPath(): void {
        // 持续处理优先队列中的节点，直到找到最优路径
        while (
            !this.queue.isEmpty() &&
            (this.calculateKey(this.queue['items'][0]?.item.node)[0] <
                this.calculateKey(this.goalNode!)[0] ||
                this.rhs.get(stringifyLocation(this.goalNode!.location)) !==
                    this.g.get(stringifyLocation(this.goalNode!.location)))
        ) {
            // 从优先队列中获取当前节点
            const current = this.queue.get();
            if (!current) break;

            // 获取当前节点的键值
            const nodeKey = stringifyLocation(current.node.location);
            const oldKey = current.key;
            const newKey = this.calculateKey(current.node);

            // 如果键值发生变化，重新插入队列
            if (oldKey[0] > newKey[0]) {
                this.queue.put(current, newKey[0]);
                continue;
            }

            // 如果g值大于rhs值，说明找到了更好的路径
            if (this.g.get(nodeKey)! > this.rhs.get(nodeKey)!) {
                // 更新g值
                this.g.set(nodeKey, this.rhs.get(nodeKey)!);
                // 更新所有邻居节点
                for (const edge of current.node.edges) {
                    this.updateVertex(edge.node);
                }
            } else {
                // 如果g值小于rhs值，将g值设为无穷大，重新计算rhs值
                this.g.set(nodeKey, Infinity);
                // 更新当前节点
                this.updateVertex(current.node);
                // 更新所有邻居节点
                for (const edge of current.node.edges) {
                    this.updateVertex(edge.node);
                }
            }
        }
    }

    /**
     * 寻找从起点到终点的最短路径
     * @param start 起点位置
     * @param goal 终点位置
     * @returns 返回路径节点数组
     */
    findNearestPath(start: Location, goal: Location): GraphNode[] {
        // 初始化算法
        this.initialize(start, goal);
        // 计算最短路径
        this.computeShortestPath();

        // 从终点开始回溯路径
        const path: GraphNode[] = [];
        let current = this.goalNode;

        while (current && !LocationIsEqual(current.location, start)) {
            path.unshift(current);
            let minCost = Infinity;
            let nextNode: GraphNode | null = null;

            // 找到具有最小g值的邻居节点
            for (const edge of current.edges) {
                if (edge.cost < 0) continue; // 跳过负权重边
                const neighborKey = stringifyLocation(edge.node.location);
                const gValue = this.g.get(neighborKey) ?? Infinity;
                if (gValue + edge.cost < minCost) {
                    minCost = gValue + edge.cost;
                    nextNode = edge.node;
                }
            }

            current = nextNode;
        }

        // 如果找到了起点，将其加入路径
        if (current) {
            path.unshift(current);
        }

        return path;
    }

    /**
     * 运行算法任务
     * @param task 算法任务对象
     */
    runAlgorithmTask(task: AlgorithmTask): void {
        const { startNode, goalNode } = task;
        const path = this.findNearestPath(
            startNode.location,
            goalNode.location
        );
        task.nearestPath = path;
    }

    /**
     * 获取路径流向图（暂未实现）
     * @param _start 起点位置
     * @returns 返回空的路径流向图
     */
    getPathFlowGraph(_start: Location): PathFlowGraph {
        // 实现路径流向图的生成
        return new Map();
    }

    /**
     * 计算启发式函数值（曼哈顿距离）
     * @param node 当前节点
     * @param goalNode 目标节点
     * @returns 返回启发式距离值
     */
    protected getHeuristic(node: GraphNode, goalNode: GraphNode): number {
        return (
            Math.abs(node.location.x - goalNode.location.x) +
            Math.abs(node.location.y - goalNode.location.y)
        );
    }
}
