import { Location, GraphNode, GraphEdge, LocationIsEqual } from './GraphTypes';

export function stringifyLocation(location: Location): string {
    return `${location.x},${location.y}`;
}

export function parseLocation(location: string): Location {
    const [x, y] = location.split(',').map(Number);
    return { x, y };
}

/**
 * 图类
 * 用于表示和管理图数据结构
 */
export class Graph {
    /**
     * 存储图中所有节点的数组
     */
    nodes: GraphNode[];

    /**
     * 构造函数
     * 初始化一个空图
     */
    constructor() {
        this.nodes = [];
    }

    /**
     * 向图中添加一个新节点
     * @param node 要添加的节点
     */
    addNode(node: GraphNode): void {
        if (this.getNode(node.location)) {
            throw new Error('Node already exists');
        }
        this.nodes.push(node);
    }

    /**
     * 根据位置查找节点
     * @param location 要查找的位置坐标
     * @returns 找到的节点或undefined（如果不存在）
     */
    getNode(location: Location): GraphNode | undefined {
        return this.nodes.find((node) =>
            LocationIsEqual(node.location, location)
        );
    }

    /**
     * 获取指定节点的所有相邻节点
     * @param node 要查询的节点
     * @returns 相邻节点数组
     */
    getNeighbors(node: GraphNode): GraphNode[] {
        return node.edges.map((edge) => edge.node);
    }

    /**
     * 获取连接两个节点的边
     * @param node 起始节点
     * @param neighbor 目标节点
     * @returns 连接的边或undefined（如果不存在）
     */
    getEdge(node: GraphNode, neighbor: GraphNode): GraphEdge | undefined {
        return node.edges.find((edge) => edge.node === neighbor);
    }

    /**
     * 在两个节点之间添加一条边
     * @param node 第一个节点
     * @param neighbor 第二个节点
     * @param cost 边的权重或成本
     */
    addEdge(node: GraphNode, neighbor: GraphNode, cost: number): void {
        node.edges.push({
            node: neighbor,
            cost,
        });
        // neighbor.edges.push({
        //     node,
        //     cost,
        // });
    }
}
