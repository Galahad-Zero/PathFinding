import { stringifyLocation } from '../graph/Graph';
import { Algorithm, AlgorithmTask, PathFlowGraph } from './Algorithm';
import { GraphNode, Location, LocationIsEqual } from '../graph/GraphTypes';
import PriorityQueue from '../queue/PriorityQueue';

export default class BFSAlgorithm extends Algorithm {
    protected algorithmInfo: string =
        'GBFS算法（贪婪最佳优先搜索）：在BFS的基础上，优先考虑距离目标更近的节点。';

    runAlgorithmTask(task: AlgorithmTask): void {
        const { startNode, goalNode, cameFrom, frontier } = task;
        if (!frontier.isEmpty()) {
            // 从队列中取出第一个节点
            const current = frontier.get();
            if (!current) {
                throw new Error('Current node not found');
            } else if (LocationIsEqual(current.location, goalNode.location)) {
                // 如果当前节点是目标节点，则退出
                frontier.clear();
                return;
            }
            this.foundPath.push(current);

            const neighbors = this.graph.getNeighbors(current);
            for (const neighbor of neighbors) {
                // 跳过权重大于1的邻居
                const cost = neighbor.edges.some((edge) => edge.cost > 1);
                if (cost) {
                    continue;
                }
                // 获取邻居节点的位置
                const neighborLocation = neighbor.location;
                // 将位置转换为字符串作为键
                const neighborKey = stringifyLocation(neighborLocation);
                // 如果邻居节点已经在路径中，则跳过
                if (cameFrom[neighborKey]) {
                    continue;
                }
                // 计算启发式值
                const heuristic = this.getHeuristic(neighbor, goalNode);
                // 记录邻居节点的路径
                cameFrom[neighborKey] = stringifyLocation(current.location);
                // 将邻居节点加入队列以继续搜索
                (frontier as PriorityQueue<GraphNode>).put(neighbor, heuristic);
            }
        } else {
            const path = this.backtrackPath(cameFrom, startNode, goalNode);
            task.nearestPath = path;
        }
    }

    findNearestPath(start: Location, goal: Location): GraphNode[] {
        const cameFrom: Record<string, string | null> = {
            [stringifyLocation(start)]: null,
        };
        this.foundPath = [];
        try {
            const startNode = this.graph.getNode(start);
            if (!startNode) {
                throw new Error('Start node not found: ' + start);
            }
            const goalNode = this.graph.getNode(goal);
            if (!goalNode) {
                throw new Error('Goal node not found: ' + goal);
            }
            // 创建一个队列并将起始节点加入队列
            const queue: PriorityQueue<GraphNode> = new PriorityQueue(true);
            queue.put(startNode, 0);
            // 使用广度优先搜索遍历图
            while (!queue.isEmpty()) {
                // 从队列中取出第一个节点
                const current = queue.get();
                if (!current) {
                    throw new Error('Current node not found');
                } else if (LocationIsEqual(current.location, goal)) {
                    // 如果当前节点是目标节点，则退出
                    break;
                }
                this.foundPath.push(current);

                const neighbors = this.graph.getNeighbors(current);
                for (const neighbor of neighbors) {
                    // 跳过权重大于1的邻居
                    const cost = neighbor.edges.some((edge) => edge.cost > 1);
                    if (cost) {
                        continue;
                    }
                    // 获取邻居节点的位置
                    const neighborLocation = neighbor.location;
                    // 将位置转换为字符串作为键
                    const neighborKey = stringifyLocation(neighborLocation);
                    // 如果邻居节点已经在路径中，则跳过
                    if (cameFrom[neighborKey]) {
                        continue;
                    }
                    // 计算启发式值
                    const heuristic = this.getHeuristic(neighbor, goalNode);
                    // 记录邻居节点的路径
                    cameFrom[neighborKey] = stringifyLocation(current.location);
                    // 将邻居节点加入队列以继续搜索
                    queue.put(neighbor, heuristic);
                }
            }

            return this.backtrackPath(cameFrom, startNode, goalNode);
        } catch (e) {
            console.warn('Error: ', e);
            return [];
        }
    }

    getPathFlowGraph(_start: Location): PathFlowGraph {
        const pathFlowGraph: PathFlowGraph = new Map();
        // 返回构建好的路径流向图
        return pathFlowGraph;
    }

    protected getHeuristic(node1: GraphNode, node2: GraphNode): number {
        return (
            Math.abs(node1.location.x - node2.location.x) +
            Math.abs(node1.location.y - node2.location.y)
        );
    }
}
