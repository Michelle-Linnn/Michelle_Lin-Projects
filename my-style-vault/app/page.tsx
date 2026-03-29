'use client';

import React, { useState, useRef } from 'react';
import { useControls, button } from 'leva';
import dynamic from 'next/dynamic';
import { Delaunay } from 'd3-delaunay';

const Sketch = dynamic(() => import('react-p5').then((mod) => mod.default), { ssr: false });

type StyleType = 
  | 'Voronoi' | 'Flow' | 'Glass' | 'Matrix' | 'Liquid' | 'Moire' | 'Diffusion' | 'Stretch'
  | 'Ascii' | 'Glitch' | 'Kaleido' | 'Particles' | 'Aura' | 'Zebra' | 'Truchet' | 'Metaballs' 
  | 'Starfield' | 'Ribbon' 
  | 'Pixelate' | 'DotGrid' | 'String' | 'Halftone' | 'Feedback' | 'Crystal' | 'Warp' | 'AsciiVideo' | 'Spray' | 'NoiseGrain'
  | 'Fluid' | 'Topo' | 'Orbit' | 'Interference' | 'Pulse' | 'Snake' | 'GridWarp' | 'Recursive'
  | 'Bloom' | 'Dither' | 'Vortex' | 'Scanline' | 'NoiseField' | 'Spiro' | 'Mosaic' | 'PixelSort'
  | 'Lissajous' | 'Chladni' | 'VoronoiAnim' | 'Sand';
export default function StyleLab() {
  const [activeStyle, setActiveStyle] = useState<StyleType>('Voronoi');
  const p5Ref = useRef<any>(null);

  // --- 1. 全局控制 ---
  useControls('Global', { 
    'Export PNG': button(() => p5Ref.current?.saveCanvas('style_lab_design', 'png')) 
  });

  // --- 2. 18 种风格的参数面板 ---
  const voronoiP = useControls('Voronoi', { pts: { value: 60, min: 10, max: 300 }, stroke: '#ffffff', fill: '#111111' }, { render: () => activeStyle === 'Voronoi' });
  const flowP = useControls('Flow', { noise: { value: 0.01, min: 0.001, max: 0.05 }, spd: { value: 2, min: 0.5, max: 8 }, color: '#00f2ff' }, { render: () => activeStyle === 'Flow' });
  const glassP = useControls('Glass', { blur: { value: 20, min: 0, max: 50 }, op: { value: 0.15, min: 0, max: 0.6 } }, { render: () => activeStyle === 'Glass' });
  const matrixP = useControls('Matrix', { gap: { value: 25, min: 10, max: 60 }, size: { value: 4, min: 1, max: 15 }, spd: { value: 0.08, min: 0.01, max: 0.3 }, color: '#ffffff' }, { render: () => activeStyle === 'Matrix' });
  const liquidP = useControls('Liquid', { visc: { value: 0.06, min: 0.01, max: 0.2 }, detail: { value: 0.006, min: 0.001, max: 0.02 }, bright: { value: 180, min: 50, max: 255 } }, { render: () => activeStyle === 'Liquid' });
  const moireP = useControls('Moire', { lines: { value: 80, min: 20, max: 200 }, rot: { value: 0.005, min: 0, max: 0.05 }, gap: { value: 8, min: 2, max: 20 }, color: '#ffffff' }, { render: () => activeStyle === 'Moire' });
  const diffP = useControls('Diffusion', { scale: { value: 0.02, min: 0.005, max: 0.1 }, threshold: { value: 0.5, min: 0.3, max: 0.7 }, colorA: '#ff0055', colorB: '#00ffee' }, { render: () => activeStyle === 'Diffusion' });
  const stretchP = useControls('Stretch', { stripes: { value: 40, min: 10, max: 100 }, spd: { value: 0.02, min: 0, max: 0.1 }, h: { value: 1.5, min: 0.5, max: 3 } }, { render: () => activeStyle === 'Stretch' });
  const asciiP = useControls('Ascii', { size: { value: 12, min: 8, max: 24 }, char: '@#W$?!;:. ' }, { render: () => activeStyle === 'Ascii' });
  const glitchP = useControls('Glitch', { freq: { value: 0.1, min: 0, max: 0.5 }, offset: { value: 50, min: 10, max: 200 } }, { render: () => activeStyle === 'Glitch' });
  const kaleidoP = useControls('Kaleido', { segments: { value: 8, min: 4, max: 24 }, zoom: { value: 1, min: 0.5, max: 2 } }, { render: () => activeStyle === 'Kaleido' });
  const partP = useControls('Particles', { count: { value: 100, min: 20, max: 500 }, speed: { value: 1, min: 0.1, max: 5 } }, { render: () => activeStyle === 'Particles' });
  const auraP = useControls('Aura', { range: { value: 200, min: 50, max: 500 }, pulse: { value: 0.05, min: 0.01, max: 0.2 } }, { render: () => activeStyle === 'Aura' });
  const zebraP = useControls('Zebra', { scale: { value: 0.05, min: 0.01, max: 0.2 }, density: { value: 10, min: 1, max: 20 } }, { render: () => activeStyle === 'Zebra' });
  const truchetP = useControls('Truchet', { size: { value: 40, min: 20, max: 100 }, weight: { value: 2, min: 1, max: 8 } }, { render: () => activeStyle === 'Truchet' });
  const metaP = useControls('Metaballs', { blobs: { value: 5, min: 2, max: 12 }, threshold: { value: 40, min: 10, max: 100 } }, { render: () => activeStyle === 'Metaballs' });
  const starP = useControls('Starfield', { speed: { value: 5, min: 1, max: 20 }, size: { value: 2, min: 1, max: 5 } }, { render: () => activeStyle === 'Starfield' });
  const ribbonP = useControls('Ribbon', { waves: { value: 10, min: 2, max: 30 }, amp: { value: 50, min: 10, max: 200 } }, { render: () => activeStyle === 'Ribbon' });
  // --- 新增 10 种风格的参数面板 ---
  const pixP = useControls('Pixelate', { res: { value: 20, min: 5, max: 50 }, color: '#ffffff' }, { render: () => activeStyle === 'Pixelate' });
  const dotP = useControls('DotGrid', { spacing: { value: 30, min: 10, max: 60 }, noise: { value: 0.005, min: 0.001, max: 0.02 } }, { render: () => activeStyle === 'DotGrid' });
  const strP = useControls('String', { lines: { value: 50, min: 10, max: 150 }, tension: { value: 0.5, min: 0.1, max: 2 } }, { render: () => activeStyle === 'String' });
  const halfP = useControls('Halftone', { size: { value: 15, min: 5, max: 40 }, angle: { value: 45, min: 0, max: 90 } }, { render: () => activeStyle === 'Halftone' });
  const feedP = useControls('Feedback', { decay: { value: 0.95, min: 0.8, max: 0.99 }, zoom: { value: 1.02, min: 1, max: 1.1 } }, { render: () => activeStyle === 'Feedback' });
  const cryP = useControls('Crystal', { sides: { value: 6, min: 3, max: 12 }, scale: { value: 100, min: 20, max: 300 } }, { render: () => activeStyle === 'Crystal' });
  const warpP = useControls('Warp', { intensity: { value: 50, min: 10, max: 200 }, freq: { value: 0.01, min: 0.001, max: 0.05 } }, { render: () => activeStyle === 'Warp' });
  const avP = useControls('AsciiVideo', { detail: { value: 10, min: 5, max: 20 } }, { render: () => activeStyle === 'AsciiVideo' });
  const sprayP = useControls('Spray', { density: { value: 100, min: 10, max: 500 }, radius: { value: 50, min: 10, max: 200 } }, { render: () => activeStyle === 'Spray' });
  const grainP = useControls('NoiseGrain', { amount: { value: 50, min: 10, max: 150 }, monochrome: true }, { render: () => activeStyle === 'NoiseGrain' });
  // --- 1. Fluid (流体) ---
  const fluidP = useControls('Fluid', { viscosity: { value: 0.05, min: 0.01, max: 0.2 }, density: { value: 0.5, min: 0.1, max: 1.0 }, color: '#ffffff' }, { render: () => activeStyle === 'Fluid' });
  
  // --- 2. Topo (等高线) ---
  const topoP = useControls('Topo', { res: { value: 0.01, min: 0.001, max: 0.05 }, layers: { value: 12, min: 2, max: 40 }, noiseZ: { value: 0.01, min: 0, max: 0.05 } }, { render: () => activeStyle === 'Topo' });
  
  // --- 3. Orbit (轨道) ---
  const orbitP = useControls('Orbit', { count: { value: 15, min: 2, max: 60 }, radius: { value: 180, min: 50, max: 400 }, speed: { value: 0.02, min: 0.005, max: 0.1 } }, { render: () => activeStyle === 'Orbit' });
  
  // --- 4. Interference (干涉波) ---
  const interP = useControls('Interference', { freq: { value: 0.05, min: 0.01, max: 0.2 }, strength: { value: 10, min: 1, max: 50 } }, { render: () => activeStyle === 'Interference' });
  
  // --- 5. Pulse (脉冲) ---
  const pulseP = useControls('Pulse', { speed: { value: 0.05, min: 0.01, max: 0.2 }, thickness: { value: 2, min: 0.5, max: 10 }, interval: { value: 40, min: 10, max: 100 } }, { render: () => activeStyle === 'Pulse' });
  
  // --- 6. Snake (蛇形路径) ---
  const snakeP = useControls('Snake', { length: { value: 20, min: 5, max: 100 }, flexibility: { value: 0.1, min: 0.01, max: 0.5 }, color: '#ffffff' }, { render: () => activeStyle === 'Snake' });
  
  // --- 7. GridWarp (网格扭曲) ---
  const gWarpP = useControls('GridWarp', { gridRes: { value: 25, min: 10, max: 60 }, warpMag: { value: 50, min: 0, max: 200 } }, { render: () => activeStyle === 'GridWarp' });
  
  // --- 8. Recursive (递归分形) ---
  const recurP = useControls('Recursive', { depth: { value: 5, min: 1, max: 8 }, angle: { value: 0.52, min: 0, max: 1.57 }, ratio: { value: 0.7, min: 0.4, max: 0.9 } }, { render: () => activeStyle === 'Recursive' });
  
  // --- 9. Bloom (辉光) ---
  const bloomP = useControls('Bloom', { radius: { value: 20, min: 5, max: 100 }, intensity: { value: 0.5, min: 0, max: 1.0 } }, { render: () => activeStyle === 'Bloom' });
  
  // --- 10. Dither (抖动处理) ---
  const ditherP = useControls('Dither', { bayer: { value: 4, options: [2, 4, 8] }, scale: { value: 1, min: 1, max: 4 } }, { render: () => activeStyle === 'Dither' });
  
  // --- 11. Vortex (漩涡) ---
  const vortexP = useControls('Vortex', { swirl: { value: 2, min: 0.1, max: 10 }, speed: { value: 0.03, min: 0.005, max: 0.1 } }, { render: () => activeStyle === 'Vortex' });
  
  // --- 12. Scanline (扫描线) ---
  const scanP = useControls('Scanline', { density: { value: 4, min: 1, max: 20 }, opacity: { value: 0.3, min: 0, max: 1.0 }, drift: { value: 0.5, min: 0, max: 5 } }, { render: () => activeStyle === 'Scanline' });
  
  // --- 13. NoiseField (噪声场) ---
  const nfP = useControls('NoiseField', { scale: { value: 0.005, min: 0.001, max: 0.02 }, lineWeight: { value: 1, min: 0.1, max: 5 }, opacity: { value: 100, min: 10, max: 255 } }, { render: () => activeStyle === 'NoiseField' });
  
  // --- 14. Spiro (万花尺) ---
  const spiroP = useControls('Spiro', { innerR: { value: 50, min: 10, max: 150 }, outerR: { value: 120, min: 50, max: 300 }, loops: { value: 10, min: 1, max: 50 } }, { render: () => activeStyle === 'Spiro' });
  
  // --- 15. Mosaic (马赛克) ---
  const mosaicP = useControls('Mosaic', { tileSize: { value: 20, min: 5, max: 80 }, jitter: { value: 0.1, min: 0, max: 1.0 } }, { render: () => activeStyle === 'Mosaic' });
  
  // --- 16. PixelSort (像素排序) ---
  const psP = useControls('PixelSort', { threshold: { value: 0.3, min: 0, max: 1.0 }, vertical: false, length: { value: 50, min: 5, max: 200 } }, { render: () => activeStyle === 'PixelSort' });
  
  // --- 17. Lissajous (利萨茹) ---
  const lissaP = useControls('Lissajous', { freqA: { value: 3, min: 1, max: 10 }, freqB: { value: 2, min: 1, max: 10 }, phase: { value: 0.1, min: 0, max: 3.14 } }, { render: () => activeStyle === 'Lissajous' });
  
  // --- 18. Chladni (克拉德尼图形) ---
  const chladniP = useControls('Chladni', { m: { value: 4, min: 1, max: 10 }, n: { value: 3, min: 1, max: 10 }, vib: { value: 0.02, min: 0.005, max: 0.1 } }, { render: () => activeStyle === 'Chladni' });
  
  // --- 19. VoronoiAnim (动态沃罗诺伊) ---
  const vAnimP = useControls('VoronoiAnim', { moveSpeed: { value: 1.5, min: 0.1, max: 5 }, cellCount: { value: 40, min: 10, max: 100 } }, { render: () => activeStyle === 'VoronoiAnim' });
  
  // --- 20. Sand (沙粒感) ---
  const sandP = useControls('Sand', { grainSize: { value: 1, min: 1, max: 5 }, density: { value: 300, min: 50, max: 1000 }, fallSpeed: { value: 2, min: 0.5, max: 10 } }, { render: () => activeStyle === 'Sand' });
  const setup = (p5: any, canvasRef: Element) => {
    p5.createCanvas(800, 600).parent(canvasRef);
    p5Ref.current = p5;
  };

  const draw = (p5: any) => {
    p5.background(10);
    // 统一派发绘制函数
    const drawMap: Record<string, (p: any) => void> = {
      Voronoi: drawVoronoi, Flow: drawFlow, Matrix: drawMatrix, Liquid: drawLiquid,
      Moire: drawMoire, Diffusion: drawDiffusion, Stretch: drawStretch, Ascii: drawAscii,
      Glitch: drawGlitch, Kaleido: drawKaleido, Particles: drawParticles, Aura: drawAura,
      Zebra: drawZebra, Truchet: drawTruchet, Metaballs: drawMetaballs, Starfield: drawStarfield,
      Ribbon: drawRibbon, Pixelate: drawPixelate, DotGrid: drawDotGrid, String: drawString, 
      Halftone: drawHalftone, Feedback: drawFeedback, Crystal: drawCrystal, Warp: drawWarp, 
      AsciiVideo: drawAsciiVideo, Spray: drawSpray, NoiseGrain: drawNoiseGrain,
      Glass: () => {}, Fluid: drawFluid, Topo: drawTopo, Orbit: drawOrbit, Interference: drawInterference,
      Pulse: drawPulse, Snake: drawSnake, GridWarp: drawGridWarp, Recursive: drawRecursive,
      Bloom: drawBloom, Dither: drawDither, Vortex: drawVortex, Scanline: drawScanline,
      NoiseField: drawNoiseField, Spiro: drawSpiro, Mosaic: drawMosaic, PixelSort: drawPixelSort,
      Lissajous: drawLissajous, Chladni: drawChladni, VoronoiAnim: drawVoronoiAnim, Sand: drawSand
        };

    // 关键修复：先检查是否存在，再调用
    const currentDrawFn = drawMap[activeStyle];
    if (currentDrawFn) {
      currentDrawFn(p5);
    }
  }
  // --- 完整渲染逻辑实现 ---

  function drawVoronoi(p5: any) {
    let pts: [number, number][] = [];
    for (let i = 0; i < voronoiP.pts; i++) {
      p5.randomSeed(i);
      pts.push([p5.random(p5.width), p5.random(p5.height)]);
    }
    const voronoi = Delaunay.from(pts).voronoi([0, 0, p5.width, p5.height]);
    p5.stroke(voronoiP.stroke);
    p5.fill(voronoiP.fill);
    for (let i = 0; i < pts.length; i++) {
      const cell = voronoi.cellPolygon(i);
      if (cell) {
        p5.beginShape();
        cell.forEach((p: any) => p5.vertex(p[0], p[1]));
        p5.endShape(p5.CLOSE);
      }
    }
  }

  function drawFlow(p5: any) {
    p5.stroke(flowP.color); p5.noFill();
    for (let i = 0; i < 1000; i += 2) {
      p5.randomSeed(i);
      let x = p5.random(p5.width); let y = p5.random(p5.height);
      p5.beginShape();
      for (let j = 0; j < 15; j++) {
        p5.vertex(x, y);
        let angle = p5.noise(x * flowP.noise, y * flowP.noise, p5.frameCount * 0.01) * p5.TWO_PI * 4;
        x += Math.cos(angle) * flowP.spd;
        y += Math.sin(angle) * flowP.spd;
      }
      p5.endShape();
    }
  }

  function drawMatrix(p5: any) {
    p5.noStroke(); p5.fill(matrixP.color);
    for (let x = 0; x < p5.width; x += matrixP.gap) {
      for (let y = 0; y < p5.height; y += matrixP.gap) {
        let d = p5.dist(x, y, p5.width / 2, p5.height / 2);
        let s = p5.sin(d * 0.05 - p5.frameCount * matrixP.spd) * matrixP.size + matrixP.size;
        p5.ellipse(x, y, s, s);
      }
    }
  }

  function drawLiquid(p5: any) {
    p5.loadPixels();
    for (let x = 0; x < p5.width; x += 4) {
      for (let y = 0; y < p5.height; y += 4) {
        let n = p5.noise(x * liquidP.detail, y * liquidP.detail, p5.frameCount * liquidP.visc);
        let c = n * liquidP.bright;
        for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) p5.set(x + i, y + j, p5.color(c));
      }
    }
    p5.updatePixels();
  }

  function drawMoire(p5: any) {
    p5.stroke(moireP.color); p5.noFill(); p5.push();
    p5.translate(p5.width/2, p5.height/2);
    for (let i = 0; i < moireP.lines; i++) {
      p5.rotate(p5.frameCount * moireP.rot);
      p5.rect(0, 0, i * moireP.gap, i * moireP.gap);
    }
    p5.pop();
  }

  function drawDiffusion(p5: any) {
    p5.noStroke();
    for (let x = 0; x < p5.width; x += 15) {
      for (let y = 0; y < p5.height; y += 15) {
        let n = p5.noise(x * diffP.scale, y * diffP.scale, p5.frameCount * 0.02);
        if (n > diffP.threshold) {
          p5.fill(p5.lerpColor(p5.color(diffP.colorA), p5.color(diffP.colorB), n));
          p5.rect(x, y, 12, 12, 4);
        }
      }
    }
  }

  function drawStretch(p5: any) {
    p5.noStroke();
    for (let i = 0; i < stretchP.stripes; i++) {
      p5.randomSeed(i);
      let x = (p5.width / stretchP.stripes) * i;
      let h = p5.noise(i, p5.frameCount * stretchP.spd) * p5.height * stretchP.h;
      p5.fill(p5.map(i, 0, stretchP.stripes, 100, 255));
      p5.rect(x, p5.height / 2 - h / 2, p5.width / stretchP.stripes - 1, h);
    }
  }

  function drawAscii(p5: any) {
    p5.fill(255); p5.textSize(asciiP.size);
    for (let x = 0; x < p5.width; x += asciiP.size) {
      for (let y = 0; y < p5.height; y += asciiP.size) {
        let n = p5.noise(x * 0.005, y * 0.005, p5.frameCount * 0.01);
        p5.text(asciiP.char[Math.floor(n * asciiP.char.length)], x, y);
      }
    }
  }

  function drawGlitch(p5: any) {
    p5.push();
    if (p5.random() < glitchP.freq) {
      for (let i = 0; i < 5; i++) {
        let x = p5.random(p5.width);
        let y = p5.random(p5.height);
        let w = p5.random(50, 200);
        let h = p5.random(2, 20);
        
        // 绘制偏移切片
        p5.copy(p5Ref.current, x, y, w, h, x + p5.random(-glitchP.offset, glitchP.offset), y, w, h);
        
        // 增加随机色块
        p5.noStroke();
        p5.fill(255, p5.random(100, 200));
        if(p5.random() > 0.8) p5.rect(x, y, w/2, h);
      }
    }
    p5.pop();
  }

  function drawKaleido(p5: any) {
    p5.translate(p5.width / 2, p5.height / 2);
    p5.stroke(255);
    for (let i = 0; i < kaleidoP.segments; i++) {
      p5.rotate(p5.TWO_PI / kaleidoP.segments);
      p5.line(0, 0, 150 * kaleidoP.zoom, 100 * p5.sin(p5.frameCount * 0.02));
    }
  }

  function drawParticles(p5: any) {
    p5.noStroke(); p5.fill(255);
    for (let i = 0; i < partP.count; i++) {
      p5.randomSeed(i);
      let x = (p5.width * p5.noise(i, p5.frameCount * 0.005 * partP.speed)) % p5.width;
      let y = (p5.height * p5.noise(i + 100, p5.frameCount * 0.005 * partP.speed)) % p5.height;
      p5.ellipse(x, y, 3, 3);
    }
  }

  function drawAura(p5: any) {
    p5.noFill();
    for (let i = 0; i < 8; i++) {
      p5.stroke(255, 255 - i * 30);
      let s = auraP.range * p5.noise(p5.frameCount * auraP.pulse + i * 0.1);
      p5.ellipse(p5.width / 2, p5.height / 2, s, s);
    }
  }

  function drawZebra(p5: any) {
    p5.noStroke();
    for (let i = 0; i < p5.width; i += zebraP.density) {
      for (let j = 0; j < p5.height; j += zebraP.density) {
        let n = p5.noise(i * zebraP.scale, j * zebraP.scale, p5.frameCount * 0.02);
        p5.fill(n > 0.5 ? 255 : 0);
        p5.rect(i, j, zebraP.density, zebraP.density);
      }
    }
  }

  // --- 修复后的 Truchet (让它动起来) ---
  function drawTruchet(p5: any) {
    p5.stroke(255);
    p5.strokeWeight(truchetP.weight);
    p5.noFill();
    for (let x = 0; x < p5.width; x += truchetP.size) {
      for (let y = 0; y < p5.height; y += truchetP.size) {
        // 关键点：将 frameCount 加入种子或逻辑，或者使用 noise
        p5.randomSeed(x * 1000 + y);
        // 通过时间偏移来改变旋转逻辑
        let threshold = p5.noise(x * 0.01, y * 0.01, p5.frameCount * 0.01);
        
        if (threshold > 0.5) {
          p5.arc(x, y, truchetP.size, truchetP.size, 0, p5.HALF_PI);
          p5.arc(x + truchetP.size, y + truchetP.size, truchetP.size, truchetP.size, p5.PI, p5.PI + p5.HALF_PI);
        } else {
          p5.arc(x + truchetP.size, y, truchetP.size, truchetP.size, p5.HALF_PI, p5.PI);
          p5.arc(x, y + truchetP.size, truchetP.size, truchetP.size, p5.PI + p5.HALF_PI, p5.TWO_PI);
        }
      }
    }
  }

  function drawMetaballs(p5: any) {
    p5.noStroke(); p5.fill(255);
    for (let x = 0; x < p5.width; x += 10) {
      for (let y = 0; y < p5.height; y += 10) {
        let sum = 0;
        for (let i = 0; i < metaP.blobs; i++) {
          let bx = p5.width/2 + 150 * p5.cos(p5.frameCount * 0.02 + i);
          let by = p5.height/2 + 150 * p5.sin(p5.frameCount * 0.02 + i);
          sum += 800 / p5.dist(x, y, bx, by);
        }
        if (sum > metaP.threshold) p5.rect(x, y, 9, 9);
      }
    }
  }

  function drawStarfield(p5: any) {
    p5.push();
    p5.translate(p5.width / 2, p5.height / 2);
    
    // 增加星星数量和速度感
    const starCount = 400; 
    const speed = starP.speed * 2; // 提速

    for (let i = 0; i < starCount; i++) {
      p5.randomSeed(i * 999);
      
      // 初始位置随机
      let x = p5.random(-p5.width, p5.width);
      let y = p5.random(-p5.height, p5.height);
      
      // 计算深度 Z，并随时间循环
      let z = (p5.random(1000) - (p5.frameCount * speed)) % 1000;
      if (z < 0) z += 1000;

      // 投影公式：x' = x / z, y' = y / z
      let sx = p5.map(x / z, 0, 1, 0, p5.width);
      let sy = p5.map(y / z, 0, 1, 0, p5.height);

      // 计算上一帧的位置，用来画线产生“拖尾”
      let pz = z + speed; 
      let px = p5.map(x / pz, 0, 1, 0, p5.width);
      let py = p5.map(y / pz, 0, 1, 0, p5.height);

      // 越近（z越小）越亮，越厚
      let alpha = p5.map(z, 0, 1000, 255, 0);
      let weight = p5.map(z, 0, 1000, starP.size * 2, 0.1);

      p5.stroke(255, alpha);
      p5.strokeWeight(weight);
      
      // 用线连接当前点和上一帧的点，产生速度拉伸感
      p5.line(px, py, sx, sy);
    }
    p5.pop();
  }

  function drawRibbon(p5: any) {
    p5.noFill(); p5.stroke(255, 150);
    for (let i = 0; i < ribbonP.waves; i++) {
      p5.beginShape();
      for (let x = 0; x < p5.width; x += 30) {
        let y = p5.height / 2 + p5.sin(x * 0.01 + p5.frameCount * 0.05 + i * 0.5) * ribbonP.amp;
        p5.vertex(x, y + i * 8);
      }
      p5.endShape();
    }
  }
 
  function drawPixelate(p5: any) {
    p5.noStroke(); p5.fill(pixP.color);
    for (let x = 0; x < p5.width; x += pixP.res) {
      for (let y = 0; y < p5.height; y += pixP.res) {
        let n = p5.noise(x * 0.01, y * 0.01, p5.frameCount * 0.02);
        if (n > 0.4) p5.rect(x, y, pixP.res - 1, pixP.res - 1);
      }
    }
  }

  function drawDotGrid(p5: any) {
    p5.fill(255); p5.noStroke();
    for (let x = 0; x < p5.width; x += dotP.spacing) {
      for (let y = 0; y < p5.height; y += dotP.spacing) {
        let off = p5.noise(x * dotP.noise, y * dotP.noise, p5.frameCount * 0.01) * dotP.spacing;
        p5.ellipse(x + off, y + off, 2, 2);
      }
    }
  }

  function drawString(p5: any) {
    p5.noFill(); p5.stroke(255, 100);
    for (let i = 0; i < strP.lines; i++) {
      let x1 = p5.width * p5.noise(i * 0.1, p5.frameCount * 0.005);
      let y1 = 0;
      let x2 = p5.width * p5.noise(i * 0.1 + 10, p5.frameCount * 0.005);
      let y2 = p5.height;
      p5.bezier(x1, y1, p5.width/2, p5.height/2 * strP.tension, p5.width/2, p5.height/2, x2, y2);
    }
  }

  function drawHalftone(p5: any) {
    p5.push();
    p5.fill(255); p5.noStroke();
    for (let x = 0; x < p5.width; x += halfP.size) {
      for (let y = 0; y < p5.height; y += halfP.size) {
        let d = p5.dist(x, y, p5.mouseX || p5.width/2, p5.mouseY || p5.height/2);
        let r = p5.map(p5.sin(d * 0.02 - p5.frameCount * 0.1), -1, 1, 1, halfP.size * 0.8);
        p5.ellipse(x, y, r, r);
      }
    }
    p5.pop();
  }

  function drawFeedback(p5: any) {
    // 模拟视觉反馈，使用 copy 缩放
    p5.image(p5Ref.current, (p5.width - p5.width * feedP.zoom)/2, (p5.height - p5.height * feedP.zoom)/2, p5.width * feedP.zoom, p5.height * feedP.zoom);
    p5.stroke(255); p5.noFill();
    p5.ellipse(p5.width/2 + p5.sin(p5.frameCount * 0.05) * 100, p5.height/2, 50, 50);
  }

  function drawCrystal(p5: any) {
    p5.push(); p5.translate(p5.width/2, p5.height/2);
    p5.noFill(); p5.stroke(255);
    for (let i = 0; i < 5; i++) {
      p5.rotate(p5.frameCount * 0.01);
      p5.beginShape();
      for (let a = 0; a < p5.TWO_PI; a += p5.TWO_PI / cryP.sides) {
        let r = cryP.scale * p5.noise(a, i, p5.frameCount * 0.01);
        p5.vertex(p5.cos(a) * r, p5.sin(a) * r);
      }
      p5.endShape(p5.CLOSE);
    }
    p5.pop();
  }

  function drawWarp(p5: any) {
    p5.stroke(255, 150); p5.noFill();
    for (let y = 0; y < p5.height; y += 20) {
      p5.beginShape();
      for (let x = 0; x < p5.width; x += 10) {
        let nx = x + p5.noise(x * warpP.freq, y * warpP.freq, p5.frameCount * 0.02) * warpP.intensity;
        p5.vertex(nx, y);
      }
      p5.endShape();
    }
  }

  function drawAsciiVideo(p5: any) {
    p5.fill(255); p5.textSize(avP.detail);
    let chars = ".:-=+*#%@";
    for (let x = 0; x < p5.width; x += avP.detail) {
      for (let y = 0; y < p5.height; y += avP.detail) {
        let n = p5.noise(x * 0.01, y * 0.01, p5.frameCount * 0.05);
        let index = Math.floor(p5.map(n, 0, 1, 0, chars.length));
        p5.text(chars[index], x, y);
      }
    }
  }

  function drawSpray(p5: any) {
    p5.stroke(255, 100);
    let mx = p5.mouseX || p5.width/2;
    let my = p5.mouseY || p5.height/2;
    for (let i = 0; i < sprayP.density; i++) {
      let r = p5.random(sprayP.radius);
      let angle = p5.random(p5.TWO_PI);
      p5.point(mx + p5.cos(angle) * r, my + p5.sin(angle) * r);
    }
  }

  function drawNoiseGrain(p5: any) {
    for (let i = 0; i < grainP.amount * 10; i++) {
      let x = p5.random(p5.width);
      let y = p5.random(p5.height);
      p5.stroke(p5.random(255), 150);
      p5.point(x, y);
    }
  }

  // --- 1. Fluid (模拟流体流向) ---
  function drawFluid(p5: any) {
    p5.noFill(); p5.stroke(fluidP.color);
    for (let i = 0; i < 400; i += 10) {
      let x = p5.noise(i, p5.frameCount * fluidP.viscosity) * p5.width;
      let y = p5.noise(i + 10, p5.frameCount * fluidP.viscosity) * p5.height;
      p5.ellipse(x, y, fluidP.density * 50, fluidP.density * 50);
    }
  }

  // --- 2. Topo (等高线) ---
  function drawTopo(p5: any) {
    p5.noFill(); p5.stroke(255, 150);
    for (let i = 0; i < topoP.layers; i++) {
      p5.beginShape();
      for (let x = 0; x <= p5.width; x += 20) {
        let n = p5.noise(x * topoP.res, i * 0.2, p5.frameCount * topoP.noiseZ);
        p5.vertex(x, p5.map(n, 0, 1, 0, p5.height));
      }
      p5.endShape();
    }
  }

  // --- 3. Orbit (轨道) ---
  function drawOrbit(p5: any) {
    p5.push(); p5.translate(p5.width / 2, p5.height / 2);
    for (let i = 0; i < orbitP.count; i++) {
      let r = orbitP.radius * (i / orbitP.count);
      let ang = p5.frameCount * orbitP.speed + i;
      p5.stroke(255, 100); p5.noFill();
      p5.ellipse(0, 0, r * 2, r * 2);
      p5.fill(255);
      p5.ellipse(p5.cos(ang) * r, p5.sin(ang) * r, 4, 4);
    }
    p5.pop();
  }

  // --- 4. Interference (干涉波) ---
  function drawInterference(p5: any) {
    p5.loadPixels();
    for (let x = 0; x < p5.width; x += 5) {
      for (let y = 0; y < p5.height; y += 5) {
        let d1 = p5.dist(x, y, p5.width * 0.3, p5.height * 0.5);
        let d2 = p5.dist(x, y, p5.width * 0.7, p5.height * 0.5);
        let val = p5.sin(d1 * interP.freq) + p5.sin(d2 * interP.freq + p5.frameCount * 0.1);
        p5.fill(p5.map(val, -2, 2, 0, 255));
        p5.rect(x, y, 5, 5);
      }
    }
  }

  // --- 5. Pulse (脉冲) ---
  function drawPulse(p5: any) {
    p5.noFill(); p5.strokeWeight(pulseP.thickness);
    for (let i = 0; i < 5; i++) {
      let r = (p5.frameCount * pulseP.speed * 100 + i * pulseP.interval) % p5.width;
      p5.stroke(255, p5.map(r, 0, p5.width, 255, 0));
      p5.ellipse(p5.width / 2, p5.height / 2, r, r);
    }
  }

  // --- 6. Snake (蛇形路径) ---
  function drawSnake(p5: any) {
    p5.noFill(); p5.stroke(snakeP.color);
    p5.beginShape();
    for (let i = 0; i < snakeP.length; i++) {
      let x = p5.noise(i * snakeP.flexibility, p5.frameCount * 0.02) * p5.width;
      let y = p5.noise(i * snakeP.flexibility + 100, p5.frameCount * 0.02) * p5.height;
      p5.vertex(x, y);
    }
    p5.endShape();
  }

  // --- 7. GridWarp (网格扭曲) ---
  function drawGridWarp(p5: any) {
    p5.stroke(255, 100); p5.noFill();
    for (let x = 0; x <= p5.width; x += gWarpP.gridRes) {
      p5.beginShape();
      for (let y = 0; y <= p5.height; y += 10) {
        let nx = x + p5.sin(y * 0.01 + p5.frameCount * 0.05) * gWarpP.warpMag;
        p5.vertex(nx, y);
      }
      p5.endShape();
    }
  }

  // --- 8. Recursive (递归树/分形) ---
  function drawRecursive(p5: any) {
    p5.push(); p5.translate(p5.width / 2, p5.height); p5.stroke(255);
    const branch = (len: number, d: number) => {
      p5.line(0, 0, 0, -len); p5.translate(0, -len);
      if (d > 0) {
        p5.push(); p5.rotate(recurP.angle); branch(len * recurP.ratio, d - 1); p5.pop();
        p5.push(); p5.rotate(-recurP.angle); branch(len * recurP.ratio, d - 1); p5.pop();
      }
    };
    branch(150, recurP.depth); p5.pop();
  }

  // --- 9. Bloom (简易辉光感) ---
  function drawBloom(p5: any) {
    p5.noStroke();
    for (let i = bloomP.radius; i > 0; i -= 5) {
      p5.fill(255, p5.map(i, 0, bloomP.radius, bloomP.intensity * 50, 0));
      p5.ellipse(p5.width / 2, p5.height / 2, i * 4, i * 4);
    }
    p5.fill(255); p5.ellipse(p5.width / 2, p5.height / 2, 20, 20);
  }

  // --- 10. Dither (有序抖动) ---
  function drawDither(p5: any) {
    p5.loadPixels();
    for (let x = 0; x < p5.width; x += ditherP.scale) {
      for (let y = 0; y < p5.height; y += ditherP.scale) {
        let lum = p5.noise(x * 0.01, y * 0.01, p5.frameCount * 0.02) * 255;
        let threshold = ( (x % ditherP.bayer) + (y % ditherP.bayer) ) * (255 / (ditherP.bayer * 2));
        p5.fill(lum > threshold ? 255 : 0);
        p5.rect(x, y, ditherP.scale, ditherP.scale);
      }
    }
  }

  // --- 11. Vortex (漩涡) ---
  function drawVortex(p5: any) {
    p5.push(); p5.translate(p5.width/2, p5.height/2); p5.noFill(); p5.stroke(255);
    for (let i = 0; i < 100; i++) {
      p5.rotate(p5.frameCount * vortexP.speed * 0.1);
      p5.rect(0, 0, i * vortexP.swirl, i * vortexP.swirl);
    }
    p5.pop();
  }

  // --- 12. Scanline (扫描线效果) ---
  function drawScanline(p5: any) {
    p5.stroke(255, scanP.opacity * 255);
    for (let y = 0; y < p5.height; y += scanP.density) {
      let offset = (p5.frameCount * scanP.drift) % scanP.density;
      p5.line(0, y + offset, p5.width, y + offset);
    }
  }

  // --- 13. NoiseField (噪声矢量场) ---
  function drawNoiseField(p5: any) {
    p5.stroke(255, nfP.opacity); p5.strokeWeight(nfP.lineWeight);
    for (let x = 0; x < p5.width; x += 30) {
      for (let y = 0; y < p5.height; y += 30) {
        let angle = p5.noise(x * nfP.scale, y * nfP.scale, p5.frameCount * 0.01) * p5.TWO_PI * 2;
        p5.line(x, y, x + p5.cos(angle) * 20, y + p5.sin(angle) * 20);
      }
    }
  }

  // --- 14. Spiro (万花尺) ---
  function drawSpiro(p5: any) {
    p5.push(); p5.translate(p5.width/2, p5.height/2); p5.noFill(); p5.stroke(255);
    p5.beginShape();
    for (let a = 0; a < p5.TWO_PI * spiroP.loops; a += 0.1) {
      let x = (spiroP.outerR - spiroP.innerR) * p5.cos(a) + 30 * p5.cos(((spiroP.outerR - spiroP.innerR) / spiroP.innerR) * a);
      let y = (spiroP.outerR - spiroP.innerR) * p5.sin(a) - 30 * p5.sin(((spiroP.outerR - spiroP.innerR) / spiroP.innerR) * a);
      p5.vertex(x, y);
    }
    p5.endShape(); p5.pop();
  }

  // --- 15. Mosaic (马赛克) ---
  function drawMosaic(p5: any) {
    p5.noStroke();
    for (let x = 0; x < p5.width; x += mosaicP.tileSize) {
      for (let y = 0; y < p5.height; y += mosaicP.tileSize) {
        let n = p5.noise(x * 0.01, y * 0.01, p5.frameCount * 0.01);
        p5.fill(n * 255);
        let j = p5.random(-mosaicP.jitter, mosaicP.jitter) * 10;
        p5.rect(x + j, y + j, mosaicP.tileSize - 2, mosaicP.tileSize - 2);
      }
    }
  }

  // --- 16. PixelSort (伪像素排序) ---
  function drawPixelSort(p5: any) {
    p5.loadPixels();
    for (let i = 0; i < 200; i++) {
      let x = p5.floor(p5.random(p5.width));
      let y = p5.floor(p5.random(p5.height));
      if (p5.noise(x * 0.01, y * 0.01) > psP.threshold) {
        p5.stroke(255, 150);
        psP.vertical ? p5.line(x, y, x, y + psP.length) : p5.line(x, y, x + psP.length, y);
      }
    }
  }

  // --- 17. Lissajous (利萨茹图形) ---
  function drawLissajous(p5: any) {
    p5.push(); p5.translate(p5.width/2, p5.height/2); p5.noFill(); p5.stroke(255);
    p5.beginShape();
    for (let t = 0; t < p5.TWO_PI; t += 0.01) {
      let x = 200 * p5.sin(lissaP.freqA * t + p5.frameCount * lissaP.phase);
      let y = 200 * p5.sin(lissaP.freqB * t);
      p5.vertex(x, y);
    }
    p5.endShape(); p5.pop();
  }

  // --- 18. Chladni (克拉德尼波形) ---
  function drawChladni(p5: any) {
    p5.stroke(255, 150);
    for (let i = 0; i < 500; i++) {
      let x = p5.random(p5.width); let y = p5.random(p5.height);
      let nx = p5.map(x, 0, p5.width, -1, 1);
      let ny = p5.map(y, 0, p5.height, -1, 1);
      let val = p5.cos(p5.PI * chladniP.n * nx) * p5.cos(p5.PI * chladniP.m * ny) - 
                p5.cos(p5.PI * chladniP.m * nx) * p5.cos(p5.PI * chladniP.n * ny);
      if (Math.abs(val) < chladniP.vib) p5.point(x, y);
    }
  }

  // --- 19. VoronoiAnim (动态沃罗诺伊) ---
  function drawVoronoiAnim(p5: any) {
    let pts: [number, number][] = [];
    for (let i = 0; i < vAnimP.cellCount; i++) {
      p5.randomSeed(i);
      let x = (p5.noise(i, p5.frameCount * 0.005 * vAnimP.moveSpeed) * p5.width);
      let y = (p5.noise(i + 10, p5.frameCount * 0.005 * vAnimP.moveSpeed) * p5.height);
      pts.push([x, y]);
    }
    const voronoi = Delaunay.from(pts).voronoi([0, 0, p5.width, p5.height]);
    p5.stroke(255, 50); p5.noFill();
    for (let i = 0; i < pts.length; i++) {
      const cell = voronoi.cellPolygon(i);
      if (cell) {
        p5.beginShape(); cell.forEach((p: any) => p5.vertex(p[0], p[1])); p5.endShape(p5.CLOSE);
      }
    }
  }

  // --- 20. Sand (沙粒沉积) ---
  function drawSand(p5: any) {
    p5.stroke(255, 180);
    for (let i = 0; i < sandP.density; i++) {
      p5.randomSeed(i);
      let x = p5.random(p5.width);
      let y = (p5.random(p5.height) + p5.frameCount * sandP.fallSpeed) % p5.height;
      p5.strokeWeight(sandP.grainSize);
      p5.point(x, y);
    }
  }
  

  return (
    <main className="flex h-screen bg-[#050505] text-white overflow-hidden font-sans">
      <aside className="w-72 border-r border-white/5 p-8 flex flex-col z-10 bg-black/50 backdrop-blur-md overflow-y-auto">
        <div className="mb-8 shrink-0">
          <h1 className="text-xl font-bold tracking-tighter">STYLE LAB</h1>
          <p className="text-[10px] text-gray-500 uppercase tracking-widest mt-1">18 GENERATIVE STYLES</p>
        </div>
        <div className="flex flex-col gap-2 pb-8">
          {(['Voronoi', 'Flow', 'Glass', 'Matrix', 'Liquid', 'Moire', 'Diffusion', 'Stretch', 'Ascii', 'Glitch', 'Kaleido', 'Particles', 'Aura', 'Zebra', 'Truchet', 'Metaballs', 'Starfield', 'Ribbon', 'Pixelate', 'DotGrid', 'String', 'Halftone', 'Feedback', 
    'Crystal', 'Warp', 'AsciiVideo', 'Spray', 'NoiseGrain','Fluid', 'Topo', 'Orbit', 'Interference', 'Pulse', 'Snake', 'GridWarp', 'Recursive',
    'Bloom', 'Dither', 'Vortex', 'Scanline', 'NoiseField', 'Spiro', 'Mosaic', 'PixelSort',
    'Lissajous', 'Chladni', 'VoronoiAnim', 'Sand'] as StyleType[]).map((s) => (
            <button 
              key={s} 
              onClick={() => setActiveStyle(s)} 
              className={`py-3 px-5 rounded-xl text-[11px] transition-all text-left border ${
                activeStyle === s ? 'bg-white text-black border-white shadow-xl font-bold' : 'border-white/5 text-gray-400 hover:bg-white/5'
              }`}
            >
              {s.toUpperCase()}
            </button>
          ))}
        </div>
      </aside>

      <section className="flex-1 flex items-center justify-center relative bg-[#080808]">
        {activeStyle === 'Glass' ? (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-indigo-950 via-slate-900 to-black">
            <div className="relative w-[550px] h-[320px]">
              <div className="absolute top-[-40px] right-[-40px] w-64 h-64 bg-purple-600 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
              <div className="absolute bottom-[-40px] left-[-40px] w-64 h-64 bg-cyan-600 rounded-full blur-[100px] opacity-30 animate-pulse"></div>
              <div style={{
                backdropFilter: `blur(${glassP.blur}px)`,
                backgroundColor: `rgba(255, 255, 255, ${glassP.op})`,
                borderRadius: '40px',
                border: '1px solid rgba(255,255,255,0.15)'
              }} className="w-full h-full shadow-2xl flex flex-col items-center justify-center p-12">
                <div className="w-12 h-[1px] bg-white/30 mb-6"></div>
                <h2 className="text-4xl font-extralight tracking-[0.4em] uppercase">Refract</h2>
                <div className="w-12 h-[1px] bg-white/30 mt-6"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[40px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 transform scale-90">
            <Sketch setup={setup} draw={draw} />
          </div>
        )}
      </section>
    </main>
  );
}