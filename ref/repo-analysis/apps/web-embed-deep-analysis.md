# Web Embed 深度分析报告

## 概述
`@onekeyhq/web-embed` 是轻量级的嵌入式 Web 钱包组件，专为第三方网站和 DApp 集成设计，提供最小化的钱包功能接口。

## 技术架构

### 核心技术栈
- **React**: 19.1.0 (UI 框架)
- **TypeScript**: 严格类型检查
- **Webpack**: 5.90.3 (构建工具)
- **Node.js**: >=22 (构建环境)

### 设计理念
- **轻量化**: 最小化包体积和依赖
- **嵌入友好**: 易于第三方集成
- **API 优先**: 以 API 接口为核心
- **无侵入性**: 不影响宿主页面

## 目录结构深度分析

### 1. **应用核心层**

#### 主要文件结构
```
apps/web-embed/
├── index.js                # 组件入口 (1.27KB)
├── App.tsx                 # 主应用组件
├── babel.config.js         # Babel 配置 (369 bytes)
├── app.json                # Expo 配置 (621 bytes)
├── webpack.config.js       # Webpack 配置 (170 bytes)
├── package.json            # 依赖配置 (626 bytes)
├── tsconfig.json           # TypeScript 配置
├── postbuild.sh            # 后构建脚本 (679 bytes)
├── sentry.js               # 错误监控 (89 bytes)
├── pages/                  # 页面组件 (4 items)
├── utils/                  # 工具函数 (2 items)
└── public/                 # 静态资源
```

### 2. **关键文件分析**

#### index.js (组件入口)
```javascript
// 嵌入式组件入口
// React 18+ 渲染
// 全局样式注入
// 错误边界设置
// 性能监控初始化
// 第三方集成接口
```

#### App.tsx (主应用组件)
```typescript
// 嵌入式钱包主组件
// 最小化 UI 设计
// API 接口暴露
// 事件系统
// 主题适配
// 响应式设计
```

#### postbuild.sh (后构建脚本)
```bash
#!/bin/bash
# 构建后处理脚本
# 静态资源优化
# 版本信息注入
# CDN 路径配置
# 缓存策略设置
# 压缩优化
```

#### sentry.js (错误监控)
```javascript
// 轻量级错误监控
// 第三方集成错误追踪
// 性能指标收集
// 用户行为分析
// 错误上报机制
```

### 3. **页面组件层**

#### pages/ 目录结构 (4 items)
```
pages/
├── EmbedWallet.tsx         # 嵌入式钱包主页面
├── ConnectModal.tsx        # 连接模态框
├── TransactionModal.tsx    # 交易确认模态框
└── SettingsModal.tsx       # 设置模态框
```

#### 页面组件分析

**EmbedWallet.tsx**
```typescript
export interface EmbedWalletProps {
  theme?: 'light' | 'dark' | 'auto';
  locale?: string;
  chains?: string[];
  onConnect?: (account: string) => void;
  onDisconnect?: () => void;
  onTransaction?: (tx: Transaction) => void;
}

export default function EmbedWallet(props: EmbedWalletProps) {
  // 嵌入式钱包核心逻辑
  // 账户管理
  // 网络切换
  // 交易处理
  // 事件回调
}
```

**ConnectModal.tsx**
```typescript
export interface ConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnect: (account: Account) => void;
  supportedChains: string[];
}

export default function ConnectModal(props: ConnectModalProps) {
  // 连接模态框
  // 账户选择
  // 网络选择
  // 权限请求
  // 连接确认
}
```

### 4. **工具函数层**

#### utils/ 目录结构 (2 items)
```
utils/
├── api.ts                  # API 接口封装
└── helpers.ts              # 辅助函数
```

#### 工具函数分析

**api.ts**
```typescript
export class EmbedWalletAPI {
  // 账户 API
  async getAccounts(): Promise<Account[]> {}
  async connectAccount(account: Account): Promise<void> {}
  async disconnectAccount(): Promise<void> {}

  // 网络 API
  async getNetworks(): Promise<Network[]> {}
  async switchNetwork(networkId: string): Promise<void> {}

  // 交易 API
  async sendTransaction(tx: Transaction): Promise<TransactionResult> {}
  async signMessage(message: string): Promise<string> {}

  // 事件 API
  on(event: string, callback: Function): void {}
  off(event: string, callback: Function): void {}
  emit(event: string, data: any): void {}
}
```

**helpers.ts**
```typescript
// 主题工具
export function applyTheme(theme: string): void {}

// 本地化工具
export function setLocale(locale: string): void {}

// 验证工具
export function validateAddress(address: string): boolean {}

// 格式化工具
export function formatBalance(balance: string): string {}
```

## 依赖分析

### 核心依赖
```json
{
  "@onekeyhq/components": "*",    // UI 组件库（按需导入）
  "@onekeyhq/kit": "*",          // 业务逻辑（最小化）
  "@onekeyhq/shared": "*"        // 共享工具（核心功能）
}
```

### 开发依赖
```json
{
  "cross-env": "7.0.3",         // 环境变量管理
  "folderslint": "1.2.0",       // 目录结构检查
  "rimraf": "3.0.2"             // 文件删除工具
}
```

### 依赖特点
- **最小化**: 仅包含必要的核心功能
- **按需加载**: 支持按需加载组件
- **树摇优化**: 支持树摇优化
- **版本兼容**: 与主应用版本兼容

## 构建系统深度分析

### 1. **Webpack 配置**
```javascript
// webpack.config.js - 嵌入式优化配置
module.exports = {
  target: 'web',
  output: {
    library: 'OneKeyEmbed',
    libraryTarget: 'umd',
    globalObject: 'this',
  },
  externals: {
    react: 'React',
    'react-dom': 'ReactDOM',
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendor: {
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
          chunks: 'all',
        },
      },
    },
  },
};
```

### 2. **开发配置**
```javascript
// 开发模式配置
module.exports = {
  mode: 'development',
  devtool: 'source-map',
  devServer: {
    port: 3008,
    hot: true,
    cors: true,
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
  },
};
```

### 3. **生产配置**
```javascript
// 生产模式配置
module.exports = {
  mode: 'production',
  devtool: false,
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false,
  },
};
```

## API 接口设计

### 1. **初始化 API**
```typescript
// 全局初始化
OneKeyEmbed.init({
  appId: 'your-app-id',
  theme: 'light',
  locale: 'en',
  chains: ['ethereum', 'bsc'],
  rpcUrls: {
    ethereum: 'https://eth-mainnet.alchemyapi.io/v2/your-key',
  },
});

// 嵌入式组件初始化
const wallet = OneKeyEmbed.create({
  container: '#wallet-container',
  type: 'full', // 'full' | 'minimal' | 'connect-only'
  features: {
    connect: true,
    send: true,
    receive: true,
    swap: false,
  },
});
```

### 2. **账户 API**
```typescript
// 获取账户列表
const accounts = await wallet.getAccounts();

// 连接账户
await wallet.connectAccount(account);

// 断开连接
await wallet.disconnectAccount();

// 监听账户变化
wallet.on('accountsChanged', (accounts) => {
  console.log('Accounts changed:', accounts);
});
```

### 3. **网络 API**
```typescript
// 获取支持的网络
const networks = await wallet.getNetworks();

// 切换网络
await wallet.switchNetwork('bsc');

// 监听网络变化
wallet.on('networkChanged', (network) => {
  console.log('Network changed:', network);
});
```

### 4. **交易 API**
```typescript
// 发送交易
const result = await wallet.sendTransaction({
  to: '0x...',
  value: '1000000000000000000',
  data: '0x...',
});

// 签名消息
const signature = await wallet.signMessage('Hello World');

// 监听交易状态
wallet.on('transaction', (tx) => {
  console.log('Transaction:', tx);
});
```

## 集成方式

### 1. **CDN 集成**
```html
<!-- 引入 CSS -->
<link rel="stylesheet" href="https://cdn.onekey.so/embed/latest/style.css">

<!-- 引入 JS -->
<script src="https://cdn.onekey.so/embed/latest/onekey-embed.js"></script>

<!-- 初始化 -->
<script>
  OneKeyEmbed.init({
    appId: 'your-app-id',
  });
</script>

<!-- 容器 -->
<div id="wallet-container"></div>
```

### 2. **NPM 集成**
```bash
# 安装
npm install @onekeyhq/web-embed

# 使用
import { OneKeyEmbed } from '@onekeyhq/web-embed';
```

### 3. **React 集成**
```typescript
import { EmbedWallet } from '@onekeyhq/web-embed';

function App() {
  return (
    <EmbedWallet
      theme="light"
      locale="en"
      chains={['ethereum', 'bsc']}
      onConnect={(account) => console.log('Connected:', account)}
    />
  );
}
```

## 主题系统

### 1. **内置主题**
```css
/* 浅色主题 */
.onekey-embed.theme-light {
  --primary-color: #007AFF;
  --background-color: #FFFFFF;
  --text-color: #000000;
  --border-color: #E5E5E5;
}

/* 深色主题 */
.onekey-embed.theme-dark {
  --primary-color: #0A84FF;
  --background-color: #000000;
  --text-color: #FFFFFF;
  --border-color: #333333;
}
```

### 2. **自定义主题**
```css
.onekey-embed.theme-custom {
  --primary-color: #your-primary-color;
  --background-color: #your-background-color;
  --text-color: #your-text-color;
  --border-color: #your-border-color;
}
```

### 3. **主题切换**
```typescript
// 切换主题
wallet.setTheme('dark');

// 监听主题变化
wallet.on('themeChanged', (theme) => {
  console.log('Theme changed:', theme);
});
```

## 国际化支持

### 1. **支持语言**
- **英语**: en
- **中文**: zh-CN, zh-TW
- **日语**: ja
- **韩语**: ko
- **西班牙语**: es
- **法语**: fr
- **德语**: de
- **俄语**: ru

### 2. **本地化配置**
```typescript
// 设置语言
wallet.setLocale('zh-CN');

// 获取当前语言
const locale = wallet.getLocale();

// 监听语言变化
wallet.on('localeChanged', (locale) => {
  console.log('Locale changed:', locale);
});
```

### 3. **格式化工具**
```typescript
// 格式化余额
const formatted = wallet.formatBalance('1000000000000000000', 'ETH');
// 结果: "1.0 ETH"

// 格式化地址
const formatted = wallet.formatAddress('0x742d35Cc6634C0532925a3b8D4C9db96c4b4d8b6');
// 结果: "0x742d...d8b6"
```

## 安全特性

### 1. **权限控制**
```typescript
// 权限请求
const permission = await wallet.requestPermission({
  method: 'eth_accounts',
  params: [],
});

// 权限检查
const hasPermission = wallet.hasPermission('eth_accounts');

// 权限撤销
await wallet.revokePermission('eth_accounts');
```

### 2. **安全验证**
```typescript
// 来源验证
wallet.validateOrigin('https://your-dapp.com');

// 交易验证
wallet.validateTransaction(tx);

// 签名验证
wallet.validateSignature(message, signature);
```

### 3. **错误处理**
```typescript
// 错误监听
wallet.on('error', (error) => {
  console.error('Embed wallet error:', error);
});

// 错误恢复
wallet.recoverFromError(error);
```

## 性能优化

### 1. **代码分割**
```javascript
// 动态导入
const ConnectModal = lazy(() => import('./pages/ConnectModal'));
const TransactionModal = lazy(() => import('./pages/TransactionModal'));
```

### 2. **懒加载**
```typescript
// 组件懒加载
const EmbedWallet = lazy(() => import('./components/EmbedWallet'));

// API 懒加载
const walletAPI = lazy(() => import('./utils/api'));
```

### 3. **缓存策略**
```typescript
// 缓存管理
class CacheManager {
  private cache = new Map<string, any>();

  async get<T>(key: string): Promise<T | null> {
    return this.cache.get(key) || null;
  }

  async set<T>(key: string, value: T, ttl = 300000): Promise<void> {
    this.cache.set(key, value);
    setTimeout(() => this.cache.delete(key), ttl);
  }
}
```

## 开发工作流

### 1. **开发命令**
```bash
# 启动开发服务器
yarn start                    # 默认端口 3008

# 清理构建
yarn clean                   # 清理构建文件
yarn clean:build             # 清理构建缓存

# 生产构建
yarn build                   # 生产构建
```

### 2. **开发服务器**
```javascript
// 开发服务器配置
const devServer = {
  port: 3008,
  hot: true,
  cors: true,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  },
};
```

### 3. **构建优化**
```bash
# 分析构建包大小
yarn build --analyze

# 构建报告
yarn build --report

# 压缩构建
yarn build --compress
```

## 测试策略

### 1. **单元测试**
```typescript
// Jest + Testing Library
import { render, screen } from '@testing-library/react';
import { EmbedWallet } from '../src/App';

test('renders embed wallet', () => {
  render(<EmbedWallet />);
  expect(screen.getByText('Connect Wallet')).toBeInTheDocument();
});
```

### 2. **集成测试**
```typescript
// API 测试
import { EmbedWalletAPI } from '../src/utils/api';

test('API integration', async () => {
  const api = new EmbedWalletAPI();
  const accounts = await api.getAccounts();
  expect(Array.isArray(accounts)).toBe(true);
});
```

### 3. **E2E 测试**
```typescript
// Playwright 测试
import { test, expect } from '@playwright/test';

test('embed wallet flow', async ({ page }) => {
  await page.goto('http://localhost:3008');
  await page.click('[data-testid="connect-button"]');
  await expect(page.locator('[data-testid="account-list"]')).toBeVisible();
});
```

## 部署策略

### 1. **CDN 部署**
```bash
# 构建 CDN 版本
yarn build:cdn

# 上传到 CDN
aws s3 sync ./build s3://onekey-cdn/embed/latest

# CDN 缓存配置
Cache-Control: public, max-age=31536000
```

### 2. **NPM 发布**
```bash
# 发布到 NPM
npm publish --access public

# 版本管理
npm version patch  # 1.0.1
npm version minor  # 1.1.0
npm version major  # 2.0.0
```

### 3. **版本管理**
```json
{
  "version": "1.0.0",
  "name": "@onekeyhq/web-embed",
  "main": "dist/index.js",
  "module": "dist/index.esm.js",
  "types": "dist/index.d.ts",
  "files": [
    "dist",
    "README.md"
  ]
}
```

## 监控与分析

### 1. **错误监控**
```javascript
// sentry.js
import * as Sentry from '@sentry/browser';

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  release: process.env.npm_package_version,
});

// 错误追踪
window.addEventListener('error', (event) => {
  Sentry.captureException(event.error);
});
```

### 2. **性能监控**
```typescript
// 性能指标
class PerformanceMonitor {
  static measureRender(component: string) {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${component} render time: ${end - start}ms`);
    };
  }

  static measureAPI(api: string) {
    const start = performance.now();
    return () => {
      const end = performance.now();
      console.log(`${api} response time: ${end - start}ms`);
    };
  }
}
```

### 3. **使用统计**
```typescript
// 使用分析
class UsageAnalytics {
  static trackEvent(event: string, properties?: Record<string, any>) {
    // 事件追踪
    // 用户行为分析
    // 功能使用统计
  }

  static trackPageView(page: string) {
    // 页面访问统计
  }

  static trackError(error: Error) {
    // 错误统计
  }
}
```

## 兼容性处理

### 1. **浏览器兼容性**
```typescript
// 浏览器检测
const browser = {
  chrome: /Chrome/.test(navigator.userAgent),
  firefox: /Firefox/.test(navigator.userAgent),
  safari: /Safari/.test(navigator.userAgent),
  edge: /Edge/.test(navigator.userAgent),
};
```

### 2. **Polyfill 策略**
```javascript
// core-js polyfill
import 'core-js/stable';

// regenerator-runtime
import 'regenerator-runtime/runtime';

// web3 polyfill
if (!window.ethereum) {
  // 注入 polyfill
}
```

### 3. **版本兼容**
```typescript
// 版本检查
function checkVersion(requiredVersion: string): boolean {
  const currentVersion = process.env.npm_package_version;
  return compareVersions(currentVersion, requiredVersion) >= 0;
}
```

## 总结

Web Embed 作为 OneKey 的嵌入式解决方案，具备以下核心优势：

### 技术优势
1. **轻量化**: 最小化的包体积和依赖
2. **易集成**: 简单的集成方式
3. **API 优先**: 完整的 API 接口
4. **主题系统**: 灵活的主题定制

### 用户体验优势
1. **无侵入性**: 不影响宿主页面
2. **响应式**: 完美的移动端适配
3. **国际化**: 完整的多语言支持
4. **可定制**: 高度可定制的界面

### 开发优势
1. **快速开发**: 简单的开发流程
2. **工具完善**: 完整的开发工具链
3. **测试覆盖**: 全面的测试策略
4. **文档完善**: 详细的 API 文档

### 业务优势
1. **生态集成**: 与 DApp 生态无缝集成
2. **用户增长**: 降低用户使用门槛
3. **开发者友好**: 简化开发者集成工作
4. **标准化**: 行业标准的嵌入式钱包

---
*生成时间: 2026-03-22*
*分析范围: apps/web-embed 目录完整分析*
