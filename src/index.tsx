import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

// 获取根元素
const container = document.getElementById('app');

if (container) {
    const root = createRoot(container);
    root.render(<App />);
} else {
    console.error('找不到id为"app"的DOM元素');
}
