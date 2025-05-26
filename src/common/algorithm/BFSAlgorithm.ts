import { stringifyLocation } from '../graph/Graph';
import { Algorithm, PathFlowGraph } from './Algorithm';
import { GraphNode, Location, LocationIsEqual } from '../graph/GraphTypes';
import Queue from '../queue/Queue';

export default class BFSAlgorithm extends Algorithm {
    protected algorithmInfo: string =
        'BFS算法（广度优先搜索）：不考虑移动成本，只考虑距离。';

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
            const queue: Queue<GraphNode> = new Queue();
            queue.put(startNode);
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

                // 对邻居节点进行排序, 启发式值越小越靠前
                neighbors.sort((a, b) => {
                    const aHeuristic = this.getHeuristic(a, goalNode);
                    const bHeuristic = this.getHeuristic(b, goalNode);
                    return aHeuristic - bHeuristic;
                });
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
                    // 记录邻居节点的路径
                    cameFrom[neighborKey] = stringifyLocation(current.location);
                    // 将邻居节点加入队列以继续搜索
                    queue.put(neighbor);
                }
            }

            return this.backtrackPath(cameFrom, startNode, goalNode);
        } catch (e) {
            console.warn('Error: ', e);
            return [];
        }
    }

    getPathFlowGraph(start: Location): PathFlowGraph {
        const pathFlowGraph: PathFlowGraph = new Map();

        try {
            const startNode = this.graph.getNode(start);
            if (!startNode) {
                throw new Error('Start node not found: ' + start);
            }
            pathFlowGraph.set(stringifyLocation(start), start);
            // 创建一个队列并将起始节点加入队列
            const queue: GraphNode[] = [startNode];
            // 使用广度优先搜索遍历图
            while (queue.length > 0) {
                // 从队列中取出第一个节点
                const current = queue.shift();
                if (!current) {
                    throw new Error('Current node not found');
                }
                // 遍历当前节点的所有邻居
                for (const neighbor of this.graph.getNeighbors(current)) {
                    // 跳过权重大于1的邻居
                    const cost = neighbor.edges.some((edge) => edge.cost > 1);
                    if (cost) {
                        continue;
                    }
                    // 获取邻居节点的位置
                    const neighborLocation = neighbor.location;
                    // 将位置转换为字符串作为键
                    const neighborKey = stringifyLocation(neighborLocation);
                    if (pathFlowGraph.has(neighborKey)) {
                        // 如果该邻居已经在路径图中，则跳过
                        continue;
                    }
                    // 记录从当前节点到邻居节点的路径
                    pathFlowGraph.set(neighborKey, current.location);
                    // 将邻居节点加入队列以继续搜索
                    queue.push(neighbor);
                }
            }
        } catch (e) {
            console.warn('Error: ', e);
        }
        console.log('pathFlowGraph:', pathFlowGraph);

        // 返回构建好的路径流向图
        return pathFlowGraph;
    }
}
