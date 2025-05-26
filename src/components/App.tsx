import React from 'react';
import GridArea from './GridArea';
import InfoPanel from './InfoPanel';
import ControlPanel from './ControlPanel';
import { Graph } from '../common/graph/Graph';
import { GraphNode } from '../common/graph/GraphTypes';
import { PathFlowGraph } from '../common/algorithm/Algorithm';
import { AlgorithmFactory, AlgorithmType } from '../common/algorithm';

import '../styles/App.css';

function getInitGraph(width: number, height: number): Graph {
    const graph = new Graph();
    const nodes: GraphNode[][] = [];

    // 第一步：创建所有节点
    for (let y = 0; y < height; y++) {
        nodes[y] = [];
        for (let x = 0; x < width; x++) {
            const node: GraphNode = {
                location: { x, y },
                edges: [],
            };
            nodes[y][x] = node;
            graph.addNode(node);
        }
    }

    // 第二步：创建边
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const currentNode = nodes[y][x];

            // 向右
            if (x + 1 < width) {
                graph.addEdge(currentNode, nodes[y][x + 1], 1);
            }

            // 向左
            if (x > 0) {
                graph.addEdge(currentNode, nodes[y][x - 1], 1);
            }

            // 向下
            if (y + 1 < height) {
                graph.addEdge(currentNode, nodes[y + 1][x], 1);
            }

            // 向上
            if (y > 0) {
                graph.addEdge(currentNode, nodes[y - 1][x], 1);
            }
        }
    }

    return graph;
}

export default function App(): JSX.Element {
    const width = 11;
    const height = 11;
    const [graph] = React.useState(() => getInitGraph(width, height));
    const [selectedStart, setSelectedStart] = React.useState<{
        x: number;
        y: number;
    } | null>(null);
    const [selectedGoal, setSelectedGoal] = React.useState<{
        x: number;
        y: number;
    } | null>(null);
    const [path, setPath] = React.useState<Array<{ x: number; y: number }>>([]);
    const [foundPath, setFoundPath] = React.useState<
        Array<{ x: number; y: number }>
    >([]);
    const [pathFlowGraph, setPathFlowGraph] = React.useState<PathFlowGraph>(
        new Map()
    );
    const [dragging, setDragging] = React.useState<
        'start' | 'goal' | 'weight' | null
    >(null);
    const [showWeights, setShowWeights] = React.useState(true);
    const [showPathFlow, setShowPathFlow] = React.useState(false);
    const [heuristic, setHeuristic] = React.useState(false);
    const [currentAlgorithm, setCurrentAlgorithm] =
        React.useState<AlgorithmType>(AlgorithmType.BFS);
    const [lastDragCell, setLastDragCell] = React.useState<{
        x: number;
        y: number;
    } | null>(null);

    // 设置默认的起点和终点
    React.useEffect(() => {
        setSelectedStart({ x: 0, y: height - 1 }); // 左下角
        setSelectedGoal({ x: width - 1, y: 0 }); // 右上角
    }, []);

    // 刷新路径
    const refreshPath = () => {
        if (selectedStart && selectedGoal) {
            const algorithm = AlgorithmFactory.createAlgorithm(
                currentAlgorithm,
                graph,
                heuristic
            );
            try {
                const nodes = algorithm.findNearestPath(
                    selectedStart,
                    selectedGoal
                );
                setPath(nodes.map((node) => node.location));
                setFoundPath(algorithm.foundPath.map((node) => node.location));
                setPathFlowGraph(algorithm.getPathFlowGraph(selectedStart));
            } catch (error) {
                console.error('路径查找失败:', error);
            }
        }
    };

    // 处理单元格点击
    const handleCellClick = (x: number, y: number) => {
        const node = graph.getNode({ x, y });
        if (node) {
            // 如果节点存在，切换其所有边的权重
            for (const edge of node.edges) {
                edge.cost = edge.cost === 1 ? 5 : 1;
            }
            // 重新计算路径
            refreshPath();
        }
    };

    // 处理权重拖拽
    const handleWeightDrag = (x: number, y: number) => {
        // 检查是否是新的网格
        if (lastDragCell && lastDragCell.x === x && lastDragCell.y === y) {
            return;
        }

        const node = graph.getNode({ x, y });
        if (node) {
            // 如果节点存在，切换其所有边的权重
            for (const edge of node.edges) {
                edge.cost = edge.cost === 1 ? 5 : 1;
            }
            // 更新最后拖拽的网格
            setLastDragCell({ x, y });
            // 重新计算路径
            refreshPath();
        }
    };

    // 处理起点拖动
    const handleStartDrag = (x: number, y: number) => {
        setSelectedStart({ x, y });
        setDragging('start');
    };

    // 处理终点拖动
    const handleGoalDrag = (x: number, y: number) => {
        setSelectedGoal({ x, y });
        setDragging('goal');
    };

    // 处理鼠标松开
    const handleMouseUp = () => {
        setDragging(null);
        setLastDragCell(null);
    };

    // 处理鼠标离开
    const handleMouseLeave = () => {
        setDragging(null);
        setLastDragCell(null);
    };

    React.useEffect(() => {
        // 当起点和终点都选择后，计算路径
        refreshPath();
    }, [selectedStart, selectedGoal, graph, currentAlgorithm]);

    return (
        <div className="app-container">
            <ControlPanel
                showWeights={showWeights}
                onShowWeightsChange={setShowWeights}
                showPathFlow={showPathFlow}
                onShowPathFlowChange={setShowPathFlow}
                currentAlgorithm={currentAlgorithm}
                onCurrentAlgorithmChange={setCurrentAlgorithm}
                heuristic={heuristic}
                onHeuristicChange={setHeuristic}
            />
            <GridArea
                graph={graph}
                width={width}
                height={height}
                selectedStart={selectedStart}
                selectedGoal={selectedGoal}
                path={path}
                pathFlowGraph={pathFlowGraph}
                showWeights={showWeights}
                showPathFlow={showPathFlow}
                onCellClick={handleCellClick}
                onStartDrag={handleStartDrag}
                onGoalDrag={handleGoalDrag}
                onWeightDrag={handleWeightDrag}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseLeave}
                dragging={dragging}
            />
            <InfoPanel
                selectedStart={selectedStart}
                selectedGoal={selectedGoal}
                path={path}
            />
        </div>
    );
}
