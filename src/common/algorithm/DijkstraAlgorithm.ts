import { stringifyLocation } from '../graph/Graph';
import PriorityQueue from '../queue/PriorityQueue';
import { Algorithm, PathFlowGraph } from './Algorithm';
import { GraphNode, Location } from '../graph/GraphTypes';

export default class DijkstraAlgorithm extends Algorithm {
    protected algorithmInfo: string =
        'Dijkstra算法（统一成本搜索）：考虑移动成本和距离。';

    findNearestPath(start: Location, goal: Location): GraphNode[] {
        // 记录路径流向
        const cameFrom: Record<string, string | null> = {
            [stringifyLocation(start)]: null,
        };
        // 记录路径成本
        const costSoFar: Record<string, number> = {
            [stringifyLocation(start)]: 0,
        };

        try {
            const startNode = this.graph.getNode(start);
            if (!startNode) {
                throw new Error('Start node not found: ' + start);
            }
            const goalNode = this.graph.getNode(goal);
            if (!goalNode) {
                throw new Error('Goal node not found: ' + goal);
            }
            // 创建一个优先队列
            const frontier = new PriorityQueue<GraphNode>(true);
            // 将起点加入队列
            frontier.put(startNode, 0);

            // 当队列不为空时，继续遍历
            while (!frontier.isEmpty()) {
                // 获取当前节点
                const current = frontier.get();
                if (!current) {
                    throw new Error('Current node not found');
                }
                if (current.location === goal) {
                    break;
                }
                // 获取当前节点的位置
                const currentNodeKey = stringifyLocation(current.location);
                // 遍历当前节点的所有邻居
                for (const neighbor of current.edges) {
                    // 获取邻居节点的位置
                    const neighborNodeKey = stringifyLocation(
                        neighbor.node.location
                    );
                    // 计算新的路径成本
                    const newCost = costSoFar[currentNodeKey] + neighbor.cost;
                    // 获取当前节点的路径成本
                    const currentCost = costSoFar[neighborNodeKey];
                    // 如果当前节点没有路径，或者新的路径更短，则更新路径
                    // if (!currentCost || newCost < currentCost) {
                    //     // 更新路径成本
                    //     costSoFar[neighborNodeKey] = newCost;
                    //     // 更新优先级
                    //     const priority = newCost;
                    //     // 将邻居节点加入队列
                    //     frontier.put(neighbor.node, priority);
                    //     // 记录路径流向
                    //     cameFrom[neighborNodeKey] = currentNodeKey;
                    // }
                    if (!cameFrom[neighborNodeKey]) {
                        // costSoFar[neighborNodeKey] = newCost;
                        // 更新优先级
                        const priority =
                            this.getHeuristic(neighbor.node, goalNode) +
                            newCost;
                        // 将邻居节点加入队列
                        frontier.put(neighbor.node, priority);
                        // 记录路径流向
                        cameFrom[neighborNodeKey] = currentNodeKey;
                    }
                }
            }

            // 回溯路径
            return this.backtrackPath(cameFrom, startNode, goalNode);
        } catch (e) {
            console.warn('Error: ', e);
            return [];
        }
    }

    getPathFlowGraph(start: Location): PathFlowGraph {
        // 记录路径流向
        const pathFlowGraph: PathFlowGraph = new Map();
        // 记录路径成本
        const costSoFar: Record<string, number> = {
            [stringifyLocation(start)]: 0,
        };

        try {
            const startNode = this.graph.getNode(start);
            if (!startNode) {
                throw new Error('Start node not found: ' + start);
            }
            // 创建一个优先队列
            const frontier = new PriorityQueue<GraphNode>(true);
            // 将起点加入队列
            frontier.put(startNode, 0);

            // 当队列不为空时，继续遍历
            while (!frontier.isEmpty()) {
                // 获取当前节点
                const current = frontier.get();
                if (!current) {
                    throw new Error('Current node not found');
                }
                // 获取当前节点的位置
                const currentNodeKey = stringifyLocation(current.location);
                // 遍历当前节点的所有邻居
                for (const neighbor of current.edges) {
                    // 获取邻居节点的位置
                    const neighborNodeKey = stringifyLocation(
                        neighbor.node.location
                    );
                    // 计算新的路径成本
                    const newCost = costSoFar[currentNodeKey] + neighbor.cost;
                    // 获取当前节点的路径成本
                    const currentCost = costSoFar[neighborNodeKey];
                    // 如果当前节点没有路径，或者新的路径更短，则更新路径
                    if (!currentCost || newCost < currentCost) {
                        // 更新路径成本
                        costSoFar[neighborNodeKey] = newCost;
                        // 更新优先级
                        const priority = newCost;
                        // 将邻居节点加入队列
                        frontier.put(neighbor.node, priority);
                        // 记录路径流向
                        pathFlowGraph.set(neighborNodeKey, current.location);
                    }
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
