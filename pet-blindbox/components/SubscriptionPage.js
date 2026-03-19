import React from 'react';
// .. 代表跳出 components 文件夹，进入 data 文件夹
import { themes } from '../data/themeConfig'; 
import AuthButton from './Auth';

const SubscriptionPage = ({ type = 'cat' }) => {
  // 根据传入的 type (cat 或 dog) 获取对应的配置
  const config = themes[type];

  // 如果配置没找到，防止页面崩溃
  if (!config) return (
    <div className="min-h-screen flex items-center justify-center font-sans">
      <div className="p-20 text-center bg-gray-50 rounded-3xl">
        <span className="text-4xl mb-4 block">🔍</span>
        <p className="text-gray-500 font-bold">正在加载配置 / Loading Configuration...</p>
      </div>
    </div>
  );

  // 预留的支付处理函数
  const handleCheckout = () => {
    console.log(`正在为 ${type} 发起支付请求...`);
    alert('正在连接 Stripe 支付网关... (Stripe Gateway Connecting)');
  };

  return (
    <div className={`min-h-screen ${config.primaryColor} transition-colors duration-700 font-sans selection:bg-white selection:text-black`}>
      {/* 导航栏 / Navigation */}
      <nav className="p-6 flex justify-between items-center max-w-7xl mx-auto">
        <div className="flex items-center gap-2 group cursor-pointer">
          <span className="text-2xl transform group-hover:rotate-12 transition-transform">📦</span>
          <h1 className={`text-2xl font-black tracking-tighter ${config.textColor}`}>
            PET<span className="text-orange-500">SURPRISE</span>
          </h1>
        </div>
        <AuthButton />
      </nav>

      {/* Hero 区域 / Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-12 lg:py-24 grid md:grid-cols-2 gap-16 items-center">
        <div className="order-2 md:order-1">
          <span className={`px-4 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] bg-white ${config.textColor} shadow-sm inline-block mb-6`}>
            每月限定盲盒 / Limited Edition
          </span>
          <h2 className={`text-5xl lg:text-7xl font-black leading-[1.1] ${config.textColor} mb-8`}>
            {config.title}
          </h2>
          <p className="text-lg text-gray-700 opacity-80 leading-relaxed mb-10 max-w-md">
            {type === 'cat' 
              ? "精选天然冻干、趣味逗猫棒与专业行为导师的互动指南。给爱宠最好的陪伴。" 
              : "耐咬互动玩具、高蛋白训练零食与户外随行课程。让每一天都充满活力。"}
          </p>
          
          {/* 价格与订阅卡片 / Pricing Card */}
          <div className="p-8 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-2xl inline-block w-full sm:w-auto border border-white">
            <div className="flex items-baseline gap-2 mb-8">
              <span className="text-5xl font-black tracking-tighter">${config.price}</span>
              <span className="text-gray-400 font-bold text-sm">/ 每月订阅 (Monthly)</span>
            </div>
            
            <button 
              onClick={handleCheckout}
              className={`w-full py-5 px-12 rounded-2xl text-white font-black text-xl shadow-xl transition-all transform hover:scale-[1.03] active:scale-95 hover:shadow-2xl ${config.accentColor}`}
            >
              立即订阅 {config.name} 盲盒
            </button>
            
            <div className="mt-6 flex items-center justify-center gap-6 text-[10px] font-bold text-gray-400 uppercase tracking-widest">
              <span className="flex items-center gap-1">🚚 免运费</span>
              <span className="flex items-center gap-1">🛡️ 随时取消</span>
              <span className="flex items-center gap-1">🌍 环保</span>
            </div>
          </div>
        </div>

        {/* 右侧视觉预览 / Visual Preview */}
        <div className="relative aspect-square order-1 md:order-2">
          {/* 动态背景装饰 */}
          <div className={`absolute inset-0 opacity-30 blur-[120px] rounded-full animate-pulse ${config.accentColor}`}></div>
          
          <div className="z-10 relative w-full h-full bg-white/30 backdrop-blur-md border-2 border-white rounded-[4rem] flex flex-col items-center justify-center text-gray-500 p-12 text-center group transition-all hover:bg-white/50">
             <div className="text-[12rem] mb-8 drop-shadow-2xl transform group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500">
               {type === 'cat' ? '🐈' : '🐕'}
             </div>
             <div className="space-y-2">
               <p className="font-black text-xl text-gray-800 uppercase tracking-tighter">Your {config.name} Box</p>
               <p className="text-sm font-medium opacity-60">插画预览区域 / Illustration Preview</p>
             </div>
          </div>
        </div>
      </main>

      {/* 清单展示 / Feature Grid */}
      <section className="bg-white/40 backdrop-blur-2xl py-24 mt-12 border-t border-white/50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h3 className={`text-4xl font-black mb-4 ${config.textColor}`}>本月盲盒清单</h3>
            <div className={`h-1.5 w-20 mx-auto rounded-full ${config.accentColor}`}></div>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: '🍖', title: '高端零食', desc: '全天然无添加' },
              { icon: '🧶', title: '精选玩具', desc: '耐用且有趣' },
              { icon: '🛀', title: '护理用品', desc: '温和不刺激' },
              { icon: '📺', title: '训练教程', desc: '订阅者独家' },
            ].map((item, idx) => (
              <div key={idx} className="group bg-white/80 p-10 rounded-[2.5rem] shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 text-center border border-white">
                <div className={`text-5xl mb-6 inline-block p-6 rounded-[2rem] transition-colors ${config.primaryColor} group-hover:bg-white group-hover:shadow-inner`}>
                  {item.icon}
                </div>
                <h4 className="font-black text-xl mb-3 text-gray-800 tracking-tight">{item.title}</h4>
                <p className="text-sm text-gray-500 font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 页脚 / Footer */}
      <footer className="py-12 text-center opacity-40 text-[10px] font-bold uppercase tracking-[0.3em]">
        © 2026 PetSurprise - Designed by Wenjie Lin
      </footer>
    </div>
  );
};

export default SubscriptionPage;