import { AlgorithmType } from '../common/algorithm';
import React from 'react';

interface ControlPanelProps {
    showWeights: boolean;
    onShowWeightsChange: (show: boolean) => void;
    showPathFlow: boolean;
    onShowPathFlowChange: (show: boolean) => void;
    currentAlgorithm: AlgorithmType;
    onCurrentAlgorithmChange: (algorithm: AlgorithmType) => void;
    isAnimPath: boolean;
    onIsAnimPathChange: (isAnimPath: boolean) => void;
    onBeginAnimPath: () => void;
    onEndAnimPath: () => void;
}

export default function ControlPanel({
    showWeights,
    onShowWeightsChange,
    showPathFlow,
    onShowPathFlowChange,
    currentAlgorithm,
    onCurrentAlgorithmChange,
    isAnimPath,
    onIsAnimPathChange,
    onBeginAnimPath,
    onEndAnimPath,
}: ControlPanelProps): JSX.Element {
    const allAlgorithms = Object.values(AlgorithmType);
    return (
        <div className="control-panel">
            <h3 className="panel-title">控制面板</h3>
            <div className="panel-content">
                <div className="control-item">
                    <label className="control-label">
                        <input
                            type="checkbox"
                            checked={showWeights}
                            onChange={(e) =>
                                onShowWeightsChange(e.target.checked)
                            }
                        />
                        移动成本
                    </label>
                    <label className="control-label">
                        <input
                            type="checkbox"
                            checked={showPathFlow}
                            onChange={(e) =>
                                onShowPathFlowChange(e.target.checked)
                            }
                        />
                        流向图
                    </label>
                    <label className="control-label">
                        <input
                            type="checkbox"
                            checked={isAnimPath}
                            onChange={(e) =>
                                onIsAnimPathChange(e.target.checked)
                            }
                        />
                        动画
                    </label>
                </div>
                <div className="control-item">
                    <label className="control-label">
                        算法:
                        <select
                            value={currentAlgorithm}
                            onChange={(e) =>
                                onCurrentAlgorithmChange(
                                    e.target.value as AlgorithmType
                                )
                            }
                        >
                            {allAlgorithms.map((algorithm) => (
                                <option key={algorithm} value={algorithm}>
                                    {algorithm}
                                </option>
                            ))}
                        </select>
                    </label>
                    <button
                        onClick={onBeginAnimPath}
                        style={{ display: !isAnimPath ? 'none' : 'block' }}
                    >
                        开始动画
                    </button>
                    <button
                        onClick={onEndAnimPath}
                        style={{ display: !isAnimPath ? 'none' : 'block' }}
                    >
                        结束动画
                    </button>
                </div>
            </div>
        </div>
    );
}
