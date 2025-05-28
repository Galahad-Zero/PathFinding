import React from 'react';

interface InfoPanelProps {
    selectedStart: { x: number; y: number } | null;
    selectedGoal: { x: number; y: number } | null;
    path: Array<{ x: number; y: number }>;
    foundPath: Array<{ x: number; y: number }>;
}

export default function InfoPanel({
    selectedStart,
    selectedGoal,
    path,
    foundPath,
}: InfoPanelProps): JSX.Element {
    return (
        <div className="info-panel">
            <h3 className="panel-title">信息面板</h3>
            <div className="panel-content">
                <div className="info-item">选择起点和终点来查找路径</div>
                {selectedStart && (
                    <div className="info-item">
                        起点: ({selectedStart.x}, {selectedStart.y})
                    </div>
                )}
                {selectedGoal && (
                    <div className="info-item">
                        终点: ({selectedGoal.x}, {selectedGoal.y})
                    </div>
                )}
                {path.length > 0 && (
                    <div className="info-item">
                        找到路径！长度: {path.length}
                    </div>
                )}
                {foundPath.length > 0 && (
                    <div className="info-item">
                        查找过的网格数: {foundPath.length}
                    </div>
                )}
            </div>
        </div>
    );
}
