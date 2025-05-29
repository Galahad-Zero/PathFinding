import React from 'react';
import { Graph } from '../common/graph/Graph';
import { PathFlowGraph } from '../common/algorithm/Algorithm';

interface GridAreaProps {
    graph: Graph;
    width: number;
    height: number;
    selectedStart: { x: number; y: number } | null;
    selectedGoal: { x: number; y: number } | null;
    path: Array<{ x: number; y: number }>;
    foundPath: Array<{ x: number; y: number }>;
    pathFlowGraph: PathFlowGraph;
    showWeights: boolean;
    showPathFlow: boolean;
    onCellClick: (x: number, y: number) => void;
    onStartDrag: (x: number, y: number) => void;
    onGoalDrag: (x: number, y: number) => void;
    onWeightDrag: (x: number, y: number) => void;
    onMouseUp: () => void;
    onMouseLeave: () => void;
    dragging: 'start' | 'goal' | 'weight' | null;
}

interface RenderInfo {
    width: number;
    height: number;
    cellSize: number;
    canvasWidth: number;
    canvasHeight: number;
    showWeights: boolean;
    showPathFlow: boolean;
}

// 绘制路径
function renderPath(
    ctx: CanvasRenderingContext2D,
    cellSize: number,
    path: Array<{ x: number; y: number }>
) {
    if (path.length <= 0) return;
    ctx.beginPath();
    ctx.strokeStyle = 'rgba(33, 150, 243, 0.7)';
    ctx.lineWidth = 5;

    // 获取路径的起始点
    const startPoint = path[0];
    // 将绘图起点移动到路径的第一个点（单元格中心）
    ctx.moveTo(
        startPoint.x * cellSize + cellSize / 2,
        startPoint.y * cellSize + cellSize / 2
    );

    // 遍历路径中的其余点，连接成线
    for (let i = 1; i < path.length; i++) {
        const point = path[i];
        // 绘制线段到当前点（单元格中心）
        ctx.lineTo(
            point.x * cellSize + cellSize / 2,
            point.y * cellSize + cellSize / 2
        );
    }

    // 完成路径线的绘制
    ctx.stroke();

    // 设置路径节点的填充颜色
    ctx.fillStyle = 'rgba(33, 150, 243, 0.7)';
    // 在路径的每个点上绘制一个圆点
    for (const point of path) {
        ctx.beginPath();
        // 在每个路径点的中心绘制一个小圆
        ctx.arc(
            point.x * cellSize + cellSize / 2,
            point.y * cellSize + cellSize / 2,
            6, // 圆点半径
            0, // 起始角度
            Math.PI * 2 // 结束角度（完整圆）
        );
        // 填充圆点
        ctx.fill();
    }
}

// 绘制流向
function renderFlow(
    ctx: CanvasRenderingContext2D,
    cellSize: number,
    pathFlowGraph: PathFlowGraph
) {
    // 遍历所有节点
    for (const [targetKey, sourceLocation] of pathFlowGraph.entries()) {
        const [targetX, targetY] = targetKey.split(',').map(Number);
        const sourceX = sourceLocation.x;
        const sourceY = sourceLocation.y;

        if (sourceX === targetX && sourceY === targetY) continue;

        // 计算箭头的位置（在路径的中间位置）
        const midX = ((sourceX + targetX) * cellSize) / 2 + cellSize / 2;
        const midY = ((sourceY + targetY) * cellSize) / 2 + cellSize / 2;

        // 计算箭头的方向
        const dx = targetX - sourceX;
        const dy = targetY - sourceY;
        const angle = Math.atan2(dy, dx);

        // 绘制箭头
        ctx.save();
        ctx.translate(midX, midY);
        ctx.rotate(angle);

        // 绘制箭头主体
        ctx.beginPath();
        ctx.moveTo(0, -5);
        ctx.lineTo(10, 0);
        ctx.lineTo(0, 5);
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.7)'; // 改为灰色
        ctx.lineWidth = 3;
        ctx.stroke();

        // 绘制横杠
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-10, 0);
        ctx.strokeStyle = 'rgba(128, 128, 128, 0.7)'; // 改为灰色
        ctx.lineWidth = 3;
        ctx.stroke();

        ctx.restore();
    }
}

// 绘制查找过的网格
function renderFoundPath(
    ctx: CanvasRenderingContext2D,
    cellSize: number,
    foundPath: Array<{ x: number; y: number }>
): void {
    if (foundPath.length <= 0) return;
    for (const point of foundPath) {
        ctx.fillStyle = 'rgba(33, 150, 243, 0.7)';
        ctx.beginPath();
        ctx.arc(
            point.x * cellSize + 5,
            point.y * cellSize + 5,
            5,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
}

function renderGraph(
    canvas: HTMLCanvasElement,
    renderInfo: RenderInfo,
    graph: Graph,
    foundPath: Array<{ x: number; y: number }>,
    path: Array<{ x: number; y: number }>,
    pathFlowGraph: PathFlowGraph,
    selectedStart: { x: number; y: number } | null,
    selectedGoal: { x: number; y: number } | null
) {
    const {
        width,
        height,
        cellSize,
        canvasWidth,
        canvasHeight,
        showWeights,
        showPathFlow,
    } = renderInfo;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 清空画布
    ctx.clearRect(0, 0, canvasWidth, canvasHeight);

    // 绘制网格单元格
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const isStart =
                selectedStart && selectedStart.x === x && selectedStart.y === y;
            const isGoal =
                selectedGoal && selectedGoal.x === x && selectedGoal.y === y;

            // 设置单元格背景颜色
            ctx.fillStyle = 'white';
            if (isStart) ctx.fillStyle = '#4CAF50';
            if (isGoal) ctx.fillStyle = '#F44336';

            // 检查是否有边的权重大于1
            const node = graph.getNode({ x, y });
            if (node && !isStart && !isGoal) {
                const hasHighWeight = node.edges.some((edge) => edge.cost > 1);
                if (hasHighWeight) {
                    ctx.fillStyle = '#E0E0E0';
                }
            }

            // 绘制单元格
            ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
            ctx.strokeStyle = '#ccc';
            ctx.lineWidth = 1;
            ctx.strokeRect(x * cellSize, y * cellSize, cellSize, cellSize);

            // 绘制权重
            if (showWeights && node && !isStart && !isGoal) {
                ctx.fillStyle = 'black';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.font = 'bold 12px Arial';

                const up =
                    node.edges.find((e) => e.node.location.y === y - 1)?.cost ||
                    0;
                const right =
                    node.edges.find((e) => e.node.location.x === x + 1)?.cost ||
                    0;
                const down =
                    node.edges.find((e) => e.node.location.y === y + 1)?.cost ||
                    0;
                const left =
                    node.edges.find((e) => e.node.location.x === x - 1)?.cost ||
                    0;

                ctx.fillText(
                    `${up}`,
                    x * cellSize + cellSize / 2,
                    y * cellSize + 10
                );
                ctx.fillText(
                    `${right}`,
                    x * cellSize + cellSize - 10,
                    y * cellSize + cellSize / 2
                );
                ctx.fillText(
                    `${down}`,
                    x * cellSize + cellSize / 2,
                    y * cellSize + cellSize - 10
                );
                ctx.fillText(
                    `${left}`,
                    x * cellSize + 10,
                    y * cellSize + cellSize / 2
                );
            }
        }
    }

    // 绘制路径
    renderPath(ctx, cellSize, path);
    // 绘制流向
    if (showPathFlow) renderFlow(ctx, cellSize, pathFlowGraph);
    // 绘制查找过的网格
    renderFoundPath(ctx, cellSize, foundPath);
}

export default function GridArea({
    graph,
    width,
    height,
    selectedStart,
    selectedGoal,
    path,
    foundPath,
    pathFlowGraph,
    showWeights,
    showPathFlow,
    onStartDrag,
    onGoalDrag,
    onWeightDrag,
    onMouseUp,
    onMouseLeave,
    dragging,
}: GridAreaProps): JSX.Element {
    const canvasRef = React.useRef<HTMLCanvasElement>(null);
    const cellSize = 60;
    const canvasWidth = width * cellSize;
    const canvasHeight = height * cellSize;
    const [weightDragInfo, setWeightDragInfo] = React.useState<{
        x: number;
        y: number;
    } | null>(null);

    // 处理鼠标按下事件
    const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / cellSize);
        const y = Math.floor((event.clientY - rect.top) / cellSize);

        if (x >= 0 && x < width && y >= 0 && y < height) {
            if (
                selectedStart &&
                selectedStart.x === x &&
                selectedStart.y === y
            ) {
                onStartDrag(x, y);
            } else if (
                selectedGoal &&
                selectedGoal.x === x &&
                selectedGoal.y === y
            ) {
                onGoalDrag(x, y);
            } else {
                setWeightDragInfo({ x, y });
                onWeightDrag(x, y);
            }
        }
    };

    // 处理鼠标移动事件
    const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
        if (!dragging && !weightDragInfo) return;

        const canvas = canvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((event.clientX - rect.left) / cellSize);
        const y = Math.floor((event.clientY - rect.top) / cellSize);

        if (x >= 0 && x < width && y >= 0 && y < height) {
            if (dragging === 'start') {
                onStartDrag(x, y);
            } else if (dragging === 'goal') {
                onGoalDrag(x, y);
            } else if (weightDragInfo) {
                onWeightDrag(x, y);
            }
        }
    };

    // 处理鼠标松开事件
    const handleMouseUp = () => {
        setWeightDragInfo(null);
        onMouseUp();
    };

    // 处理鼠标离开事件
    const handleMouseLeave = () => {
        setWeightDragInfo(null);
        onMouseLeave();
    };

    // 绘制网格
    React.useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const renderInfo: RenderInfo = {
            width,
            height,
            cellSize,
            canvasWidth,
            canvasHeight,
            showWeights,
            showPathFlow,
        };

        renderGraph(
            canvas,
            renderInfo,
            graph,
            foundPath,
            path,
            pathFlowGraph,
            selectedStart,
            selectedGoal
        );
    }, [
        width,
        height,
        selectedStart,
        selectedGoal,
        path,
        showWeights,
        showPathFlow,
        graph,
    ]);

    return (
        <div className="grid-area">
            <h2 className="panel-title">图形网格</h2>
            <div className="grid-container">
                <canvas
                    ref={canvasRef}
                    width={canvasWidth}
                    height={canvasHeight}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseLeave}
                    style={{
                        cursor:
                            dragging || weightDragInfo ? 'grabbing' : 'pointer',
                    }}
                />
            </div>
        </div>
    );
}
