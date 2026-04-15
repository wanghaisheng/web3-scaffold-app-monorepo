# Web to Astro 迁移计划

## 概述
本文档详细描述了将 `apps/web` (React 应用) 迁移到 `apps/web-astro` (Astro 应用) 的完整计划，基于 Astro 框架的最佳实践和迁移策略。

## 迁移目标

### **为什么选择 Astro？**

1. **性能优先**: Astro 的 Islands 架构减少 JavaScript 开销
2. **SEO 友好**: 服务端渲染，零 JS 默认
3. **内容驱动**: 专为内容丰富网站设计
4. **UI 无关**: 支持多种 UI 框架，包括 React
5. **开发体验**: 简单的文件路由和组件系统

### **迁移策略**

采用 **渐进式迁移** 策略：
1. **第一阶段**: 创建 Astro 项目结构，保留 React 组件
2. **第二阶段**: 转换页面为 Astro 组件
3. **第三阶段**: 优化性能，减少 React 依赖
4. **第四阶段**: 完全 Astro 化

## 详细迁移计划

### **第一阶段: 项目初始化**

#### **1.1 创建 Astro 项目结构**
```bash
# 删除现有文件（保留配置）
rm -rf src/ webpack.config.js webpack.config.js rspack.config.ts

# 创建 Astro 项目结构
mkdir -p src/{components,pages,layouts,styles,utils}
mkdir -p src/content/{collections,schemas}
mkdir -p public/{icons,images,fonts}
```

#### **1.2 更新 package.json**
```json
{
  "name": "@onekeyhq/web-astro",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "_folderslint": "yarn folderslint"
  },
  "dependencies": {
    "@astrojs/react": "^3.0.0",
    "@onekeyhq/components": "*",
    "@onekeyhq/kit": "*",
    "@onekeyhq/shared": "*",
    "astro": "^4.0.0",
    "react": "^18.0.0",
    "react-dom": "^18.0.0"
  },
  "devDependencies": {
    "@astrojs/tailwind": "^5.0.0",
    "@astrojs/tsconfig": "^3.0.0",
    "@types/react": "^18.0.0",
    "@types/react-dom": "^18.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

#### **1.3 创建 Astro 配置**
```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwind from '@astrojs/tailwind';
import { ONEKEY_PROXY } from '../development/webpack/constant';

export default defineConfig({
  integrations: [
    react({
      // React 配置
      jsxImportSource: 'react',
      jsxRuntime: 'automatic',
    }),
    tailwind({
      // Tailwind CSS 配置
      config: {
        applyBaseStyles: false,
      },
    }),
  ],
  output: 'static',
  trailingSlash: 'never',
  build: {
    format: 'directory',
  },
  vite: {
    define: {
      ONEKEY_PROXY: JSON.stringify(ONEKEY_PROXY),
    },
  },
  devToolbar: {
    enabled: true,
  },
});
```

#### **1.4 创建 TypeScript 配置**
```json
// tsconfig.json
{
  "extends": "@astrojs/tsconfig/strict",
  "compilerOptions": {
    "allowJs": true,
    "strict": true,
    "jsx": "react-jsx",
    "jsxImportSource": "react",
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@components/*": ["./src/components/*"],
      "@layouts/*": ["./src/layouts/*"],
      "@utils/*": ["./src/utils/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}
```

### **第二阶段: 页面转换**

#### **2.1 创建布局组件**
```astro
// src/layouts/Layout.astro
---
import '@onekeyhq/shared/src/web/index.css';
import { SITE_TITLE } from '@utils/constants';

interface Props {
  title?: string;
  description?: string;
}

const { title = SITE_TITLE, description = 'OneKey Web Wallet' } = Astro.props;
---

<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>{title}</title>
    <meta name="description" content={description} />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="theme-color" content="#ffffff" />
    
    <!-- PWA 支持 -->
    <link rel="manifest" href="/manifest.json" />
    
    <!-- 预连接关键资源 -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  </head>
  <body>
    <slot />
    
    <!-- Service Worker (生产环境) -->
    {Astro.env.mode === 'production' && (
      <script>
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.register('/sw.js');
        }
      </script>
    )}
  </body>
</html>
```

#### **2.2 转换主页面**
```astro
// src/pages/index.astro
---
import Layout from '@layouts/Layout.astro';
import { KitProvider } from '@onekeyhq/kit';

// 在服务端获取数据
const pageTitle = 'OneKey - Secure Crypto Wallet';
const pageDescription = 'The most secure crypto wallet for Bitcoin, Ethereum, and more.';
---

<Layout title={pageTitle} description={pageDescription}>
  <div id="root">
    <KitProvider>
      {/* React 应用作为客户端岛 */}
      <div client:load id="react-app">
        {/* 这里将加载 React 应用 */}
      </div>
    </KitProvider>
  </div>
</Layout>

<style>
  #root {
    min-height: 100vh;
  }
  
  #react-app {
    width: 100%;
    height: 100%;
  }
</style>
```

#### **2.3 创建 React 应用包装器**
```tsx
// src/components/ReactAppWrapper.tsx
import React, { Suspense, lazy } from 'react';
import { KitProvider } from '@onekeyhq/kit';
import { debugLandingLog } from '@onekeyhq/shared/src/performance/init';

// 懒加载开发工具
const AgentationDev = process.env.NODE_ENV !== 'production'
  ? lazy(() => import('agentation').then((m) => ({ default: m.Agentation })))
  : () => null;

interface Props {
  children?: React.ReactNode;
}

export default function ReactAppWrapper({ children }: Props) {
  if (process.env.NODE_ENV !== 'production') {
    debugLandingLog('ReactAppWrapper render');
  }

  return (
    <KitProvider>
      {children}
      {process.env.NODE_ENV !== 'production' ? (
        <Suspense fallback={null}>
          <AgentationDev endpoint="http://localhost:4747" />
        </Suspense>
      ) : null}
    </KitProvider>
  );
}
```

#### **2.4 创建动态路由页面**
```astro
// src/pages/wallet/[network]/[address].astro
---
import Layout from '@layouts/Layout.astro';
import ReactAppWrapper from '@components/ReactAppWrapper.tsx';

export async function getStaticPaths() {
  // 预生成常见路由
  const networks = ['ethereum', 'bitcoin', 'solana'];
  const paths = networks.map(network => 
    ({ params: { network, address: 'default' } })
  );
  
  return paths;
}

const { network, address } = Astro.params;
const pageTitle = `${network} Wallet - ${address} | OneKey`;
const pageDescription = `View ${network} wallet address ${address} on OneKey.`;
---

<Layout title={pageTitle} description={pageDescription}>
  <ReactAppWrapper>
    <div 
      client:load 
      data-network={network}
      data-address={address}
      id="react-app"
    />
  </ReactAppWrapper>
</Layout>
```

### **第三阶段: 组件转换**

#### **3.1 创建 Astro 组件**
```astro
// src/components/Header.astro
---
interface Props {
  title?: string;
  showNav?: boolean;
}

const { title = 'OneKey', showNav = true } = Astro.props;
---

<header class="bg-white shadow-sm border-b">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <h1 class="text-xl font-bold text-gray-900">{title}</h1>
      </div>
      
      {showNav && (
        <nav class="hidden md:flex space-x-8">
          <a href="/wallet" class="text-gray-600 hover:text-gray-900">Wallet</a>
          <a href="/swap" class="text-gray-600 hover:text-gray-900">Swap</a>
          <a href="/market" class="text-gray-600 hover:text-gray-900">Market</a>
        </nav>
      )}
    </div>
  </div>
</header>
```

#### **3.2 混合 Astro 和 React 组件**
```astro
// src/components/WalletOverview.astro
---
import Layout from '@layouts/Layout.astro';
import WalletBalance from '@components/react/WalletBalance.tsx';
import TransactionList from '@components/react/TransactionList.tsx';

// 服务端数据获取
const walletData = await fetch('https://api.onekey.so/wallet/overview')
  .then(res => res.json())
  .catch(() => ({ balance: '0', transactions: [] }));
---

<section class="py-8">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 class="text-2xl font-bold mb-6">Wallet Overview</h2>
    
    <!-- 静态内容 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Balance</h3>
        <p class="text-3xl font-bold text-green-600">${walletData.balance}</p>
      </div>
      
      <!-- React 组件作为客户端岛 -->
      <div class="bg-white p-6 rounded-lg shadow">
        <h3 class="text-lg font-semibold mb-4">Quick Actions</h3>
        <div client:load>
          <WalletBalance initialBalance={walletData.balance} />
        </div>
      </div>
    </div>
    
    <!-- 交易列表 - 需要交互性 -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4">Recent Transactions</h3>
      <div client:load>
        <TransactionList transactions={walletData.transactions} />
      </div>
    </div>
  </div>
</section>
```

#### **3.3 创建内容集合**
```typescript
// src/content/config.ts
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
    author: z.string(),
    description: z.string(),
    image: z.string().optional(),
    tags: z.array(z.string()),
  }),
});

export const collections = {
  blog: blogCollection,
};
```

```mdx
---
// src/content/blog/onekey-astro-migration.mdx
title: "Migrating OneKey Web to Astro"
pubDate: 2024-03-22
author: "OneKey Team"
description: "How we migrated our React web app to Astro for better performance"
tags: ["astro", "migration", "performance", "react"]
image: "/images/blog/astro-migration.jpg"
---

# Migrating to Astro

Learn about our journey from React to Astro...
```

### **第四阶段: 性能优化**

#### **4.1 实现 Islands 架构**
```astro
// src/pages/index.astro
---
import Layout from '@layouts/Layout.astro';
import { ViewTransitions } from 'astro:transitions';

// 静态数据
const features = [
  { title: 'Secure', description: 'Industry-leading security' },
  { title: 'Fast', description: 'Lightning-fast transactions' },
  { title: 'Easy', description: 'Simple user interface' },
];
---

<Layout>
  <ViewTransitions />
  
  <!-- 静态内容 - 无 JS -->
  <section class="hero">
    <h1>OneKey Wallet</h1>
    <p>The most secure crypto wallet</p>
  </section>
  
  <!-- 半静态内容 - 最小 JS -->
  <section class="features">
    {features.map((feature) => (
      <div class="feature-card">
        <h3>{feature.title}</h3>
        <p>{feature.description}</p>
      </div>
    ))}
  </section>
  
  <!-- 交互内容 - 客户端岛 -->
  <section class="interactive">
    <div client:load>
      <WalletConnectButton />
    </div>
    <div client:visible>
      <MarketChart />
    </div>
  </section>
</Layout>
```

#### **4.2 创建 React 组件岛**
```tsx
// src/components/react/WalletConnectButton.tsx
import { useState } from 'react';
import { useWallet } from '@onekeyhq/kit/src/hooks/useWallet';

export default function WalletConnectButton() {
  const [isConnecting, setIsConnecting] = useState(false);
  const { connect, isConnected } = useWallet();

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connect();
    } catch (error) {
      console.error('Connection failed:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <button
      onClick={handleConnect}
      disabled={isConnected || isConnecting}
      className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 disabled:opacity-50"
    >
      {isConnected ? 'Connected' : isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
```

#### **4.3 优化图片和资源**
```astro
// src/components/OptimizedImage.astro
---
import { Image } from 'astro:assets';

interface Props {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  format?: 'webp' | 'avif' | 'png' | 'jpg';
}

const { src, alt, width, height, format = 'webp' } = Astro.props;
---

<div class="image-container">
  <Image 
    src={src} 
    alt={alt} 
    width={width} 
    height={height}
    format={format}
    loading="lazy"
  />
</div>
```

### **第五阶段: 高级功能**

#### **5.1 实现服务端渲染**
```astro
// src/pages/api/wallet/[address].ts
import type { APIRoute } from 'astro';

export const GET: APIRoute = async ({ params }) => {
  const { address } = params;
  
  try {
    const walletData = await fetchWalletData(address);
    return new Response(JSON.stringify(walletData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300', // 5分钟缓存
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Wallet not found' }), {
      status: 404,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }
};

async function fetchWalletData(address: string) {
  // 实际的钱包数据获取逻辑
  return {
    address,
    balance: '1.234 ETH',
    transactions: [],
  }
}
```

#### **5.2 添加中间件**
```typescript
// src/middleware.ts
import { defineMiddleware } from 'astro:middleware';
import { ONEKEY_PROXY } from '../development/webpack/constant';

export const onRequest = defineMiddleware(async (context, next) => {
  // 安全头
  const response = await next();
  
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // 开发环境代理
  if (ONEKEY_PROXY && context.url.pathname.startsWith('/api/')) {
    const proxyUrl = `${ONEKEY_PROXY}${context.url.pathname}${context.url.search}`;
    const proxyResponse = await fetch(proxyUrl);
    return new Response(proxyResponse.body, {
      status: proxyResponse.status,
      headers: proxyResponse.headers,
    });
  }
  
  return response;
}, {
  // 只对特定路径应用中间件
  pathname: '/api/*'
});
```

#### **5.3 国际化支持**
```typescript
// astro.config.mjs
import { defineConfig } from 'astro/config';
import i18n from '@astrojs/i18n';

export default defineConfig({
  integrations: [
    i18n({
      defaultLocale: 'en',
      locales: ['en', 'zh-CN', 'ja', 'ko'],
      routing: {
        prefixDefaultLocale: false,
      },
    }),
  ],
});
```

```astro
// src/pages/index.astro
---
import Layout from '@layouts/Layout.astro';
import { t } from 'astro:i18n';

const pageTitle = t('home.title');
const pageDescription = t('home.description');
---

<Layout title={pageTitle} description={pageDescription}>
  <h1>{t('home.welcome')}</h1>
  <p>{t('home.subtitle')}</p>
</Layout>
```

## 迁移检查清单

### **第一阶段检查清单**
- [ ] 创建 Astro 项目结构
- [ ] 更新 package.json 依赖
- [ ] 配置 astro.config.mjs
- [ ] 设置 TypeScript 配置
- [ ] 创建基础布局组件

### **第二阶段检查清单**
- [ ] 转换主页面为 Astro 组件
- [ ] 创建 React 应用包装器
- [ ] 实现动态路由
- [ ] 设置服务端数据获取
- [ ] 测试基础功能

### **第三阶段检查清单**
- [ ] 转换静态组件为 Astro
- [ ] 混合 Astro 和 React 组件
- [ ] 创建内容集合
- [ ] 实现组件复用
- [ ] 优化组件结构

### **第四阶段检查清单**
- [ ] 实现 Islands 架构
- [ ] 优化客户端 JS
- [ ] 图片和资源优化
- [ ] 性能监控
- [ ] 缓存策略

### **第五阶段检查清单**
- [ ] 服务端渲染 API
- [ ] 中间件实现
- [ ] 国际化支持
- [ ] PWA 功能
- [ ] SEO 优化

## 性能对比

### **React SPA (当前)**
- **First Contentful Paint**: ~1.5s
- **Time to Interactive**: ~2.5s
- **Bundle Size**: ~800KB
- **JavaScript**: 客户端渲染

### **Astro (目标)**
- **First Contentful Paint**: ~0.8s
- **Time to Interactive**: ~1.2s
- **Bundle Size**: ~200KB
- **JavaScript**: 服务端渲染 + Islands

## 风险评估

### **技术风险**
- **React 组件兼容性**: 大部分组件可以直接使用
- **状态管理**: 需要适配 Astro 的 Islands 架构
- **路由系统**: 需要重新设计路由结构

### **业务风险**
- **功能回归**: 确保所有功能正常工作
- **性能影响**: 监控关键性能指标
- **用户体验**: 保持一致的交互体验

### **缓解策略**
- **渐进式迁移**: 分阶段降低风险
- **全面测试**: 自动化和手动测试
- **回滚计划**: 保留原代码备份

## 时间线

### **第1-2周**: 项目初始化
- 创建项目结构
- 配置开发环境
- 基础页面转换

### **第3-4周**: 组件迁移
- 静态组件转换
- React 组件适配
- 混合架构实现

### **第5-6周**: 性能优化
- Islands 架构实现
- 资源优化
- 缓存策略

### **第7-8周**: 高级功能
- 服务端渲染
- 国际化
- PWA 功能

## 总结

通过这个迁移计划，我们将：

1. **提升性能**: 减少 JavaScript 开销，加快页面加载
2. **改善 SEO**: 服务端渲染，更好的搜索引擎优化
3. **保持兼容**: React 组件可以继续使用
4. **渐进迁移**: 分阶段实施，降低风险
5. **未来友好**: 利用 Astro 的现代架构优势

这个迁移将使 OneKey Web 应用更快、更高效，同时保持所有现有功能。

---
*生成时间: 2026-03-22*
*迁移范围: apps/web → apps/web-astro*
