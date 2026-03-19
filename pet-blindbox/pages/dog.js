import React from 'react';
// 导入我们之前写好的通用订阅页面组件
import SubscriptionPage from '../components/SubscriptionPage';

// 🌟 核心：必须使用 export default，这样 Next.js 才能识别这个页面
export default function DogPage() {
  return <SubscriptionPage type="dog" />;
}