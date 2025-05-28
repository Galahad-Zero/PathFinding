import { stringifyLocation } from '../graph/Graph';
import PriorityQueue from '../queue/PriorityQueue';
import { Algorithm, PathFlowGraph } from './Algorithm';
import { GraphNode, Location, LocationIsEqual } from '../graph/GraphTypes';

export default class DijkstraAlgorithm extends Algorithm {
    protected algorithmInfo: string =
        'A*算法：Dijkstra算法+GBFS算法，启发式搜索：f(n) = g(n) + h(n)，g(n)为起点到当前节点的移动成本，h(n)为当前节点到目标节点的距离。';

    findNearestPath(start: Location, goal: Location): GraphNode[] {
        // 记录路径流向
        const cameFrom: Record<string, string | null> = {
            [stringifyLocation(start)]: null,
        };
        // 记录路径成本
        const costSoFar: Record<string, number> = {
            [stringifyLocation(start)]: 0,
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
                if (LocationIsEqual(current.location, goal)) {
                    break;
                }
                this.foundPath.push(current);
                // 获取当前节点的位置
                const currentNodeKey = stringifyLocation(current.location);
                // 遍历当前节点的所有邻居
                for (const neighbor of current.edges) {
                    // 获取邻居节点的位置
                    const neighborNodeKey = stringifyLocation(
                        neighbor.node.location
                    );
                    // 如果邻居节点的移动成本小于0，视为不可通行，跳过
                    if (neighbor.cost < 0) continue;
                    // 计算新的路径成本，g(n)
                    const newCost =
                        costSoFar[currentNodeKey] +
                        this.getHeuristic(current, neighbor.node);
                    // 获取当前节点的路径成本
                    const currentCost = costSoFar[neighborNodeKey];
                    // 如果当前节点没有路径，或者新的路径更短，则更新路径
                    if (!currentCost || newCost < currentCost) {
                        // 更新路径成本
                        costSoFar[neighborNodeKey] = newCost;
                        // 更新优先级: 新的路径成本 + 距离目标成本，h(n)
                        const priority =
                            newCost +
                            this.getDistanceToGoal(neighbor.node, goal);
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

    getPathFlowGraph(_start: Location): PathFlowGraph {
        // 记录路径流向
        const pathFlowGraph: PathFlowGraph = new Map();
        // 记录路径成本
        // const costSoFar: Record<string, number> = {
        //     [stringifyLocation(start)]: 0,
        // };

        // try {
        //     const startNode = this.graph.getNode(start);
        //     if (!startNode) {
        //         throw new Error('Start node not found: ' + start);
        //     }
        //     // 创建一个优先队列
        //     const frontier = new PriorityQueue<GraphNode>(true);
        //     // 将起点加入队列
        //     frontier.put(startNode, 0);

        //     // 当队列不为空时，继续遍历
        //     while (!frontier.isEmpty()) {
        //         // 获取当前节点
        //         const current = frontier.get();
        //         if (!current) {
        //             throw new Error('Current node not found');
        //         }
        //         // 获取当前节点的位置
        //         const currentNodeKey = stringifyLocation(current.location);
        //         // 遍历当前节点的所有邻居
        //         for (const neighbor of current.edges) {
        //             // 获取邻居节点的位置
        //             const neighborNodeKey = stringifyLocation(
        //                 neighbor.node.location
        //             );
        //             // 计算新的路径成本
        //             const newMoveCost =
        //                 costSoFar[currentNodeKey] +
        //                 this.getHeuristic(current, neighbor.node);
        //             // 获取当前节点的路径成本
        //             const currentCost = costSoFar[neighborNodeKey];
        //             // 如果当前节点没有路径，或者新的路径更短，则更新路径
        //             if (!currentCost || newMoveCost < currentCost) {
        //                 // 更新路径成本
        //                 costSoFar[neighborNodeKey] = newMoveCost;
        //                 // 更新优先级 新的路径成本 + 距离目标成本
        //                 const priority =
        //                     newMoveCost +
        //                     this.getDistanceToGoal(neighbor.node, goal);
        //                 // 将邻居节点加入队列
        //                 frontier.put(neighbor.node, priority);
        //                 // 记录路径流向
        //                 pathFlowGraph.set(neighborNodeKey, current.location);
        //             }
        //         }
        //     }
        // } catch (e) {
        //     console.warn('Error: ', e);
        // }
        // console.log('pathFlowGraph:', pathFlowGraph);

        // 返回构建好的路径流向图
        return pathFlowGraph;
    }

    protected getHeuristic(node1: GraphNode, node2: GraphNode): number {
        const { x, y } = node1.location;
        // 移动成本
        let moveCost = this.graph.getCost(node1, node2);
        if ((x + y) % 2 === 0) {
            // 如果node1到node2是水平移动，则cost+1
            if (
                Math.abs(node1.location.x - node2.location.x) > 0 &&
                node1.location.y === node2.location.y
            ) {
                moveCost += 0.5;
            }
        } else {
            // 如果node1到node2是垂直移动，则cost+1
            if (
                Math.abs(node1.location.y - node2.location.y) > 0 &&
                node1.location.x === node2.location.x
            ) {
                moveCost += 0.5;
            }
        }

        return moveCost;
    }

    protected getDistanceToGoal(node: GraphNode, goal: Location): number {
        return (
            Math.abs(node.location.x - goal.x) +
            Math.abs(node.location.y - goal.y)
        );
    }
}
