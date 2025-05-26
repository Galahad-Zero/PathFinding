import { Graph } from '../graph/Graph';
import { Algorithm } from './Algorithm';
import BFSAlgorithm from './BFSAlgorithm';
import DijkstraAlgorithm from './DijkstraAlgorithm';

export enum AlgorithmType {
    BFS = 'BFS',
    Dijkstra = 'Dijkstra',
    // AStar = 'AStar',
}

export const AlgorithmClass = {
    [AlgorithmType.BFS]: BFSAlgorithm,
    [AlgorithmType.Dijkstra]: DijkstraAlgorithm,
    // [AlgorithmType.AStar]: 'AStar',
} as const;

export class AlgorithmFactory {
    private static _instance: AlgorithmFactory;
    private _algorithmCache: Map<AlgorithmType, Algorithm> = new Map();

    static createAlgorithm(
        algorithmType: AlgorithmType,
        graph: Graph,
        heuristic: boolean = false
    ) {
        const factory = AlgorithmFactory.getInstance();
        return factory._getAlgorithm(algorithmType, graph, heuristic);
    }

    private _getAlgorithm(
        algorithmType: AlgorithmType,
        graph: Graph,
        heuristic: boolean
    ) {
        const algorithm = this._algorithmCache.get(algorithmType);
        if (algorithm) {
            algorithm.setHeuristic(heuristic);
            return algorithm;
        }
        const newAlgorithm = new AlgorithmClass[algorithmType](
            graph,
            heuristic
        );
        this._algorithmCache.set(algorithmType, newAlgorithm);
        return newAlgorithm;
    }

    static getInstance() {
        if (!this._instance) {
            this._instance = new AlgorithmFactory();
        }
        return this._instance;
    }
}

export { BFSAlgorithm, DijkstraAlgorithm };
