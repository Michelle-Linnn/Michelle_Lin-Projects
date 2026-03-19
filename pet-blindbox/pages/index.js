import React from 'react';
import Link from 'next/link';

// 定义首页组件 / Define Home Component
export default function Home() {
  return (
    <div className="min-h-screen flex flex-col md:flex-row font-sans bg-white">
      {/* 左侧：猫咪入口 / Left: Cat Entrance */}
      <Link href="/cat" className="flex-1 group relative overflow-hidden bg-purple-50 flex items-center justify-center transition-all duration-700 hover:flex-[1.2] no-underline">
        <div className="z-10 text-center p-8">
          <span className="text-6xl mb-4 block transform group-hover:scale-110 transition-transform">🐱</span>
          <h2 className="text-4xl font-black text-purple-900 mb-2">猫咪空间 / Cat Space</h2>
          <p className="text-purple-600 opacity-70">精致、优雅的月度惊喜 / Elegant monthly surprises</p>
          <div className="mt-8 px-8 py-3 bg-purple-600 text-white rounded-full font-bold shadow-lg transform group-hover:translate-y-[-5px] transition-all inline-block">
            进入频道 / Enter
          </div>
        </div>
      </Link>

      {/* 右侧：狗狗入口 / Right: Dog Entrance */}
      <Link href="/dog" className="flex-1 group relative overflow-hidden bg-blue-50 flex items-center justify-center transition-all duration-700 hover:flex-[1.2] no-underline border-t md:border-t-0 md:border-l border-gray-100">
        <div className="z-10 text-center p-8">
          <span className="text-6xl mb-4 block transform group-hover:scale-110 transition-transform">🐶</span>
          <h2 className="text-4xl font-black text-blue-900 mb-2">狗狗乐园 / Dog Park</h2>
          <p className="text-blue-600 opacity-70">活力、快乐的成长盲盒 / Joyful growth boxes</p>
          <div className="mt-8 px-8 py-3 bg-blue-600 text-white rounded-full font-bold shadow-lg transform group-hover:translate-y-[-5px] transition-all inline-block">
            进入频道 / Enter
          </div>
        </div>
      </Link>

      {/* 悬浮 Logo / Floating Logo */}
      <div className="absolute top-10 left-1/2 -translate-x-1/2 z-30 bg-white/80 backdrop-blur-md px-6 py-2 rounded-full shadow-xl">
        <h1 className="text-xl font-black tracking-tighter text-gray-800">
          PET<span className="text-orange-500">SURPRISE</span>
        </h1>
      </div>
    </div>
  );
}