import React, { useRef } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { ScrollControls, useScroll, useTexture, OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'

// --- 赛博隧道组件 ---
function CyberTunnel() {
  // 1. 加载赛博霓虹贴图 (确保你的 public/neon_texture.png 依然存在)
  const texture = useTexture('neon_texture.png');
  texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

  // 重要：调整贴图重复次数，让它铺满隧道
  // 30 是让它沿着隧道长度方向重复30次，这个值可以根据效果调整
  // 1 是让它沿着隧道圆周不重复
  texture.repeat.set(1, 30); 

  // 2. 动画：让贴图在隧道内壁上“流动”
  useFrame((state, delta) => {
    // 这里是关键，让 offset 随时间变化
    // delta 是两帧之间的时间差，确保流动的速度平滑且不受帧率影响
    texture.offset.y -= delta * 0.5; // 控制流动速度，数值越小越慢，正负控制方向
  })

  return (
    // position={[0, 0, -50]} 把隧道放远一点，让相机有滚动的空间
    // rotation={[Math.PI / 2, 0, 0]} 将圆柱体放倒，变成隧道
    <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -50]}>
      {/* 旧的几何体：圆环 */}
      {/* <torusGeometry args={[10, 3, 16, 100]} /> */}

      {/* 新的几何体：圆柱体 (隧道) */}
      {/* args=[半径, 半径, 长度, 分段数, 分段数, 是否两端封口] */}
      {/* args={[20, 20, 100, 16, 1, true]} */}
      <cylinderGeometry args={[20, 20, 100, 32, 1, true]} />
      
      {/* 霓虹材质 */}
      <meshStandardMaterial 
        map={texture} 
        color={[1, 1, 1]} // 还原贴图本来颜色
        emissive={[1, 1, 4]} // 自发光，增加蓝色赛博感
        emissiveMap={texture} // 让贴图本身发光
        side={THREE.BackSide} // 重要！只渲染内壁，否则你在隧道外面看不到东西
        transparent={true}
      />
    </mesh>
  )
}

import { Text, Float, Sparkles } from '@react-three/drei'

function HologramText() {
  return (
    <Float speed={5} rotationIntensity={0.5} floatIntensity={0.5}>
      <Text
        position={[0, 2, -10]} // 放在隧道前方一点
        fontSize={2}
        color={[2, 5, 10]} // 超亮的青蓝色
        //font="https://fonts.gstatic.com/s/monoton/v15/5h1aiZUr9yb6At6KJ2Vu7Tk.woff" // 赛博风格字体
      >
        CYBER VIBE
        <meshStandardMaterial emissive={[2, 5, 10]} toneMapped={false} />
      </Text>
    </Float>
  )
}

function CyberParticles() {
  return (
    <Sparkles 
      count={2000} // 粒子数量
      scale={100}  // 覆盖范围
      size={1.5}   // 粒子大小
      speed={0.5}  // 移动速度
      color="#00ffff" 
    />
  )
}



// --- 浮空霓虹物体组 (模拟视频里的零件) ---
function FloatingObjects() {
  const meshRef = useRef();

  // 动画：让物体随机旋转和轻微浮动
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    meshRef.current.rotation.x = time * 0.1;
    meshRef.current.rotation.y = time * 0.15;
    meshRef.current.position.y = Math.sin(time) * 1;
  });

  return (
    <group ref={meshRef}>
      <mesh position={[-15, 5, -10]}>
        <dodecahedronGeometry args={[2, 0]} />
        <meshStandardMaterial color={[5, 0.5, 5]} emissive={[4, 0.1, 4]} />
      </mesh>
      <mesh position={[18, -8, -30]}>
        <octahedronGeometry args={[3, 0]} />
        <meshStandardMaterial color={[0.5, 5, 2]} emissive={[0.1, 4, 1]} />
      </mesh>
    </group>
  )
}


// --- 核心场景搭建 ---
export default function App() {
  return (
    <Canvas 
      camera={{ position: [0, 0, 10], fov: 75 }} // 设置相机初始位置和视场角
      gl={{ toneMapping: THREE.ReinhardToneMapping }} // 启用色调映射以获得更好的 HDR 效果
    >
      {/* 1. 基础灯光 */}
      <color attach="background" args={['#000']} />
      <ambientLight intensity={0.1} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#ff00ff" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#00ffff" />

      {/* 2. 滚动手稿：核心功能！ */}
      {/* pages={4} 意味着滚动长度是屏幕高度的4倍 */}
      <ScrollControls pages={4} damping={0.1}>
        <ScrollTracker />
        
        {/* 3. 我们要滚动的物体组 */}
        <ScrollContainer />
      </ScrollControls>

      {/* 4. 后期处理 (赛博感的核心) */}
      <EffectComposer disableNormalPass>
        {/* Bloom 辉光效果: 让所有 emissive 高于 1 的颜色“亮得冒泡” */}
        <Bloom 
          luminanceThreshold={1} // 只有亮度高于此值的物体才会产生辉光
          mipmapBlur 
          intensity={1.5} // 辉光强度
          radius={0.8} // 辉光半径
        />
      </EffectComposer>
    </Canvas>
  )
}

// --- 滚动容器：处理物体和相机的相对运动 ---
function ScrollContainer() {
  return (
    <group>
      <CyberTunnel />
      <HologramText />
      <CyberParticles />
      <FloatingObjects />
    </group>
  )
}

// --- 滚动跟踪器：负责相机运动逻辑 ---
function ScrollTracker() {
  const scroll = useScroll(); // 获取滚动状态
  
  // useFrame 是 R3F 的渲染循环 hooks
  useFrame((state) => {
    // scroll.offset 是一个 0 到 1 之间的值，代表滚动百分比
    const offset = scroll.offset;
    const { mouse } = state;
    // --- 相机控制核心 ---
    // 根据滚动百分比，将相机的 Z 轴从 10 移动到 -50 (穿越场景)
    // 基础滚动逻辑
    state.camera.position.z = THREE.MathUtils.lerp(10, -200, offset);

    // 鼠标追踪逻辑：让相机在 X 和 Y 轴上随鼠标轻微偏移
    state.camera.position.x = THREE.MathUtils.lerp(state.camera.position.x, mouse.x * 2, 0.1);
    state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, mouse.y * 2, 0.1);
    
    // 让相机始终注视前方的一个点，产生自然的倾斜感
    state.camera.lookAt(0, 0, -300);

    // 可以同时控制相机旋转，模拟转弯感
    // state.camera.rotation.y = offset * Math.PI * 0.1;
  });

  return null;
}