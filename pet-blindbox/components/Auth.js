import React from 'react';
import { auth, provider } from '../lib/firebase';
import { signInWithPopup, signOut } from 'firebase/auth';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function AuthButton() {
  // 监听用户的登录状态
  const [user, loading, error] = useAuthState(auth);

  const login = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (err) {
      console.error("Google Login Error:", err);
      alert("登录失败，请检查 Firebase 配置是否正确。");
    }
  };

  if (loading) {
    return <div className="px-4 py-2 text-sm text-gray-400">正在加载...</div>;
  }

  if (error) {
    return <div className="px-4 py-2 text-sm text-red-400">登录功能暂不可用</div>;
  }

  // 如果用户已登录，显示头像和退出按钮
  if (user) {
    return (
      <div className="flex items-center gap-3 bg-white/50 p-1 pr-4 rounded-full border border-white">
        <img 
          src={user.photoURL} 
          alt="User Avatar" 
          className="w-8 h-8 rounded-full shadow-sm"
        />
        <div className="flex flex-col">
          <span className="text-xs font-bold text-gray-800 leading-tight">
            {user.displayName}
          </span>
          <button 
            onClick={() => signOut(auth)} 
            className="text-[10px] text-gray-500 hover:text-red-500 text-left underline"
          >
            退出登录
          </button>
        </div>
      </div>
    );
  }

  // 未登录状态：显示 Google 登录按钮
  return (
    <button 
      onClick={login}
      className="bg-white border border-gray-200 px-5 py-2.5 rounded-full text-sm font-bold flex items-center gap-2 hover:bg-gray-50 hover:shadow-md transition-all active:scale-95"
    >
      <img 
        src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
        width="18" 
        alt="G" 
      />
      使用 Google 登录
    </button>
  );
}