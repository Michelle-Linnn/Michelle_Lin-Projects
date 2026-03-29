import React, { useState } from 'react';
import { useControls, button } from 'leva';
import dynamic from 'next/dynamic';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), { ssr: false });

const StyleVault = () => {
  const [activeStyle, setActiveStyle] = useState('FlowField');

  // --- 1. 噪声流动场参数 (Noise Flow Parameters) ---
  const flowParams = useControls('Flow Field Settings', {
    particleCount: { value: 800, min: 100, max: 2000 },
    noiseScale: { value: 0.01, min: 0.001, max: 0.1 },
    speed: { value: 2, min: 0.5, max: 5 },
    lineColor: '#ffffff',
    background: '#000000',
    saveConfig: button(() => console.log('Current Config:', flowParams)),
  }, { render: () => activeStyle === 'FlowField' });

  // --- 2. 毛玻璃效果参数 (Glassmorphism Parameters) ---
  const glassParams = useControls('Glass Settings', {
    blur: { value: 15, min: 0, max: 40 },
    opacity: { value: 0.3, min: 0.1, max: 0.9 },
    saturation: { value: 150, min: 100, max: 200 },
    borderRadius: { value: 24, min: 0, max: 100 },
  }, { render: () => activeStyle === 'Glass' });

  // --- 3. p5.js 渲染逻辑 (p5.js Render Logic) ---
  let particles = [];
  const setup = (p5, canvasParentRef) => {
    p5.createCanvas(800, 600).parent(canvasParentRef);
    p5.background(flowParams.background);
  };

  const draw = (p5) => {
    if (activeStyle === 'FlowField') {
      p5.stroke(flowParams.lineColor);
      p5.strokeWeight(1);
      // 这里的流动场逻辑会读取 flowParams.noiseScale 等
      // The flow field logic will read flowParams.noiseScale, etc.
    }
  };

  return (
    <div style={{ display: 'flex', background: '#111', height: '100vh', color: 'white' }}>
      {/* 左侧导航 (Sidebar) */}
      <nav style={{ width: '200px', padding: '20px', borderRight: '1px solid #333' }}>
        <h3>Style Vault</h3>
        <button onClick={() => setActiveStyle('FlowField')}>Noise Flow</button>
        <button onClick={() => setActiveStyle('Glass')}>Glassmorphism</button>
      </nav>

      {/* 中间画布 (Main Canvas) */}
      <main style={{ flex: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
        {activeStyle === 'FlowField' ? (
          <Sketch setup={setup} draw={draw} />
        ) : (
          <div style={{
            width: '400px', height: '250px',
            backdropFilter: `blur(${glassParams.blur}px) saturate(${glassParams.saturation}%)`,
            backgroundColor: `rgba(255, 255, 255, ${glassParams.opacity})`,
            borderRadius: `${glassParams.borderRadius}px`,
            border: '1px solid rgba(255,255,255,0.2)'
          }}>
            <p style={{ padding: '20px' }}>Preview Text (Glassmorphism)</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default StyleVault;