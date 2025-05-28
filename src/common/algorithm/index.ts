import { Graph } from '../graph/Graph';
import { Algorithm } from './Algorithm';
import BFSAlgorithm from './BFSAlgorithm';
import GBFSAlgorithm from './GBFSAlgorithm';
import DijkstraAlgorithm from './DijkstraAlgorithm';
import AStarAlgorithm from './AStarAlgorithm';

export enum AlgorithmType {
    BFS = 'BFS',
    Dijkstra = 'Dijkstra',
    GBFS = 'GBFS',
    AStar = 'AStar',
}

export const AlgorithmClass = {
    [AlgorithmType.BFS]: BFSAlgorithm,
    [AlgorithmType.Dijkstra]: DijkstraAlgorithm,
    [AlgorithmType.GBFS]: GBFSAlgorithm,
    [AlgorithmType.AStar]: AStarAlgorithm,
} as const;

export class AlgorithmFactory {
    private static _instance: AlgorithmFactory;
    private _algorithmCache: Map<AlgorithmType, Algorithm> = new Map();

    static createAlgorithm(algorithmType: AlgorithmType, graph: Graph) {
        const factory = AlgorithmFactory.getInstance();
        return factory._getAlgorithm(algorithmType, graph);
    }

    private _getAlgorithm(algorithmType: AlgorithmType, graph: Graph) {
        const algorithm = this._algorithmCache.get(algorithmType);
        if (algorithm) {
            return algorithm;
        }
        const newAlgorithm = new AlgorithmClass[algorithmType](graph);
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
