import { AlgorithmType } from '../common/algorithm';
import React, { useState, useRef } from 'react';

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
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    // 处理文件选择，显示预览图
    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result as string);
            };
            reader.readAsDataURL(file);
        } else {
            setPreviewUrl(null);
            setSelectedFile(null);
        }
    };

    // 处理文件上传
    const handleFileUpload = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const singleResult = document.getElementById('singleResult');

        if (!selectedFile) {
            if (singleResult) {
                singleResult.innerHTML =
                    '<p style="color: red;">请先选择文件</p>';
            }
            return;
        }

        try {
            const formData = new FormData(e.currentTarget);
            const response = await fetch('http://localhost:3000/api/upload', {
                method: 'POST',
                body: formData,
                // 不要设置 Content-Type，让浏览器自动处理
                // headers: {
                //     'Content-Type': 'multipart/form-data',
                // },
            });

            // 检查响应状态
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(
                    `HTTP error! status: ${response.status}, message: ${errorText}`
                );
            }

            const result = await response.json();

            if (singleResult) {
                singleResult.innerHTML = `
                    <p style="color: green;">上传成功！</p>
                    <p>文件名: ${selectedFile.name}</p>
                    <p>大小: ${(selectedFile.size / 1024).toFixed(2)} KB</p>
                    <p>类型: ${selectedFile.type}</p>
                    <p>路径: ${result.url}</p>
                `;
            }

            // 清除选择的文件和预览
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
            setPreviewUrl(null);
            setSelectedFile(null);
        } catch (error) {
            console.error('上传错误:', error);
            if (singleResult) {
                singleResult.innerHTML = `<p style="color: red;">上传失败：${
                    error instanceof Error ? error.message : String(error)
                }</p>`;
            }
        }
    };

    // api测试
    const handleApiTest = () => {
        const url = 'http://localhost:3000/api/users/login';
        const options = {
            body: JSON.stringify({
                email: 'wqf@qq.com',
                password: 'wqf123456',
            }),
            method: 'post',
            headers: {
                'Content-Type': 'application/json',
            },
        };
        fetch(url, options)
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((error) => {
                console.error('Error:', error);
            });
    };

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
                    <button onClick={handleApiTest}>测试API</button>
                </div>

                <div className="upload-container">
                    <h2>单文件上传</h2>
                    <form id="singleUploadForm" onSubmit={handleFileUpload}>
                        <input
                            ref={fileInputRef}
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleFileSelect}
                        />
                        <button type="submit">上传图片</button>
                    </form>
                    {previewUrl && (
                        <div className="image-preview">
                            <img
                                src={previewUrl}
                                alt="预览图"
                                style={{
                                    maxWidth: '100%',
                                    maxHeight: '200px',
                                    marginTop: '10px',
                                    borderRadius: '4px',
                                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                }}
                            />
                        </div>
                    )}
                    <div id="singleResult"></div>
                </div>
            </div>
        </div>
    );
}
