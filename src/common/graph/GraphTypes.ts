/**
 * 表示图中节点的位置坐标
 */
export type Location = {
    x: number; // x坐标
    y: number; // y坐标
};

/**
 * 图节点接口
 * 定义了图中节点的基本结构
 */
export interface GraphNode {
    // 节点的位置坐标(唯一标识)
    location: Location;
    // 从该节点出发的所有边
    edges: GraphEdge[];
}

/**
 * 图边接口
 * 定义了连接节点的边的属性
 */
export interface GraphEdge {
    node: GraphNode; // 边所连接的目标节点
    cost: number; // 边的权重或成本
}

export function LocationIsEqual(
    location1: Location,
    location2: Location
): boolean {
    return location1.x === location2.x && location1.y === location2.y;
}
