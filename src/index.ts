// import { Graph } from './common/graph/Graph';
// import { GraphNode, LocationIsEqual } from './common/graph/GraphTypes';
// import { AStarAlgorithm } from './common/algorithm';

// function getInitGraph(): Graph {
//     const graph = new Graph();
//     const queue: GraphNode[] = [
//         {
//             location: { x: 0, y: 0 },
//             edges: [],
//         },
//     ];
//     // 构建一个5*5的网格图
//     while (queue.length > 0) {
//         const current = queue.shift();
//         if (!current) break;
//         graph.addNode(current);
//         const curLoc = current.location;
//         if (curLoc.x + 1 < 5) {
//             const nextLoc = { x: curLoc.x + 1, y: curLoc.y };
//             const hasNext = queue.find((node) =>
//                 LocationIsEqual(node.location, nextLoc)
//             );
//             if (!hasNext) {
//                 const nextNode = {
//                     location: nextLoc,
//                     edges: [],
//                 };
//                 graph.addEdge(current, nextNode, 1);
//                 queue.push(nextNode);
//             }
//         }
//         if (curLoc.y + 1 < 5) {
//             const nextLoc = { x: curLoc.x, y: curLoc.y + 1 };
//             const hasNext = queue.find((node) =>
//                 LocationIsEqual(node.location, nextLoc)
//             );
//             if (!hasNext) {
//                 const nextNode = {
//                     location: nextLoc,
//                     edges: [],
//                 };
//                 graph.addEdge(current, nextNode, 1);
//                 queue.push(nextNode);
//             }
//         }
//     }

//     return graph;
// }

// function aStarAlgorithmTest(): void {
//     const graph = getInitGraph();
//     const aStar = new AStarAlgorithm(graph);
//     const path = aStar.findNearestPath({ x: 0, y: 0 }, { x: 4, y: 4 });
//     console.log(
//         '路径：',
//         path.map((n) => n.location)
//     );
// }

// aStarAlgorithmTest();
