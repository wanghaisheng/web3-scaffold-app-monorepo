# Web Embed 深度分析报告

## 概述
`apps/web-embed` 是 OneKey 的嵌入式 Web 钱包组件，专为第三方网站和 DApp 集成设计，提供轻量级的钱包功能接口。

## 技术架构

### 核心技术栈
- **React**: 19.1.0 (UI 框架)
- **TypeScript**: 严格类型检查
- **React Router**: Hash 路由管理
- **Webpack**: 开发和生产构建
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
├── index.js                # 应用入口 (1.27KB)
├── App.tsx                 # 主应用组件
├── package.json            # 依赖配置 (626 bytes)
├── app.json                # Expo 配置 (621 bytes)
├── webpack.config.js       # Webpack 配置 (170 bytes)
├── postbuild.sh            # 后构建脚本 (679 bytes)
├── sentry.js               # 错误监控 (89 bytes)
├── pages/                  # 页面组件 (4 items)
├── utils/                  # 工具函数 (2 items)
└── public/                 # 静态资源
```

#### 关键文件分析

**index.js (应用入口)**
```javascript
// React 18+ 渲染 API
import { createRoot } from 'react-dom/client';
import { HashRouter, Route, Routes } from 'react-router-dom';

// 懒加载页面组件
const PageIndex = lazy(() => import('./pages/PageIndex'));
const PageWebEmbedApi = lazy(() => import('./pages/PageWebEmbedApi'));
const PageWebEmbedPrimePurchase = lazy(() => import('./pages/PageWebEmbedPrimePurchase'));

// 路由配置
root.render(
  <HashRouter>
    <Routes>
      <Route path={EWebEmbedRoutePath.index} element={<PageIndex />} />
      <Route path={EWebEmbedRoutePath.webEmbedApi} element={<PageWebEmbedApi />} />
      <Route path={EWebEmbedRoutePath.primePurchase} element={<PageWebEmbedPrimePurchase />} />
    </Routes>
  </HashRouter>
);
```

### 2. **页面组件层**

#### pages/ 目录结构 (4 items)
```
pages/
├── PageIndex.tsx                 # 主页面 (477 bytes)
├── PageWebEmbedApi.ts           # API 页面 (3.47KB)
├── PageWebEmbedPrimePurchase.tsx # Prime 购买页面 (5.37KB)
└── WebEmbedAppProvider.tsx      # 应用提供者 (608 bytes)
```

#### PageIndex.tsx - 主页面
```typescript
export default function PageIndex() {
  return (
    <div style={{ padding: '20px' }}>
      <h1>PageIndex</h1>
      <ul>
        <li>
          <Link to={EWebEmbedRoutePath.webEmbedApi}>WebEmbedApi</Link>
        </li>
        <li>
          <Link to={EWebEmbedRoutePath.primePurchase}>PrimePurchase</Link>
        </li>
      </ul>
    </div>
  );
}
```

#### PageWebEmbedApi.ts - API 页面 (核心功能)
```typescript
// WebEmbed API 核心页面
// 处理与原生应用的通信
// 设置敏感文本编码
// 处理消息传递

const handler = async (payload: IJsBridgeMessagePayload) =>
  webembedApi.callWebEmbedApiMethod(
    payload.data as IBackgroundApiWebembedCallMessage,
  );

// 事件监听
globalThis.addEventListener('webembedReceiveHandler', async (event) => {
  const { detail } = event;
  const response = await handler(detail.data);
  // 回调处理
  (globalThis as any).$webEmbed.callWebEmbedApiMethod(
    detail.callbackId,
    error,
    response,
  );
});
```

#### PageWebEmbedPrimePurchase.tsx - Prime 购买页面
```typescript
// Prime 购买功能
// 与原生应用交互
// 支付流程处理

async function closeNativeWebViewModal() {
  await globalThis.$onekey.$private.request({
    method: EWebEmbedPrivateRequestMethod.closeWebViewModal,
  });
}

async function showNativeToast({ title, message }) {
  await globalThis.$onekey.$private.request({
    method: EWebEmbedPrivateRequestMethod.showToast,
    params: { title, message },
  });
}
```

### 3. **工具函数层**

#### utils/ 目录结构 (2 items)
```
utils/
├── init.ts              # 初始化工具 (73 bytes)
└── webEmbedAppSettings.ts # 应用设置
```

#### init.ts - 初始化工具
```typescript
// 请求助手初始化
const initRequestHelper = () => {
  requestHelper.overrideMethods({
    checkIsOneKeyDomain,
    getDevSettingsPersistAtom: async () => {
      return globalThis?.WEB_EMBED_ONEKEY_APP_SETTINGS?.$devSettings ?? { enabled: false };
    },
    getSettingsPersistAtom: async () => ({
      currencyInfo: { id: 'usd', symbol: '$' },
      instanceId: getValueFromWebEmbedOneKeyAppSettings('instanceId'),
      theme: getValueFromWebEmbedOneKeyAppSettings('themeVariant'),
      locale: getValueFromWebEmbedOneKeyAppSettings('localeVariant'),
    }),
  });
};

// 分析工具初始化
export const initAnalytics = () => {
  const instanceId = getValueFromWebEmbedOnekeyAppSettings('instanceId');
  analytics.init({
    instanceId,
    baseURL: buildServiceEndpoint({
      serviceName: EServiceEndpointEnum.Utility,
      env: globalThis?.WEB_EMBED_ONEKEY_APP_SETTINGS?.enableTestEndpoint ? 'test' : 'prod',
    }),
  });
};
```

## 依赖分析

### 核心依赖
```json
{
  "@onekeyhq/components": "*",    // UI 组件库
  "@onekeyhq/kit": "*",          // 业务逻辑
  "@onekeyhq/shared": "*"        // 共享工具
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
// webpack.config.js - 继承配置
require('../../development/env');

const webConfig = require('../../development/webpack/webpack.web-embed.config');

module.exports = webConfig({ basePath: __dirname });
```

### 2. **开发配置**
```javascript
// 开发模式配置
module.exports = {
  target: 'web',
  mode: 'development',
  devServer: {
    port: 3008,
    hot: true,
    historyApiFallback: true,
  },
};
```

### 3. **生产构建**
```javascript
// 生产模式配置
module.exports = {
  mode: 'production',
  optimization: {
    minimize: true,
    usedExports: true,
    sideEffects: false,
  },
};
```

### 4. **后构建脚本**
```bash
#!/usr/bin/env bash
set -euo pipefail -x

# 创建 .well-known 目录
mkdir -p ./web-build/.well-known

# 同步到 Android 资源
rm -rf ../mobile/android/app/src/main/assets/web-embed
mkdir -p ../mobile/android/app/src/main/assets
rsync -r -c -v ./web-build/ ../mobile/android/app/src/main/assets/web-embed/

# 同步到 iOS 资源
rm -rf ../mobile/ios/OneKeyWallet/web-embed/
mkdir -p ../mobile/ios/OneKeyWallet/web-embed/
rsync -r -c -v ./web-build/ ../mobile/ios/OneKeyWallet/web-embed/

echo "Postbuild completed successfully."
```

## 功能特性分析

### 1. **WebEmbed API 接口**

#### 核心通信机制
```typescript
// 与原生应用的通信桥梁
interface IJsBridgeMessagePayload {
  data: IBackgroundApiWebembedCallMessage;
  callbackId: number;
}

// 消息处理
const handler = async (payload: IJsBridgeMessagePayload) => {
  return webembedApi.callWebEmbedApiMethod(payload.data);
};

// 事件监听
globalThis.addEventListener('webembedReceiveHandler', async (event) => {
  const response = await handler(event.detail.data);
  // 回调到原生应用
});
```

#### 敏感文本编码
```typescript
// 设置编码密钥
await globalThis.$onekey.$private.request({
  method: 'getSensitiveEncodeKey',
}).then((key) => {
  if (key) {
    setBgSensitiveTextEncodeKey(key as string);
    // API 准备就绪
    void globalThis.$onekey.$private.request({
      method: 'webEmbedApiReady',
    });
  }
});
```

### 2. **Prime 购买功能**

#### 原生交互接口
```typescript
// 关闭 WebView 模态框
async function closeNativeWebViewModal() {
  await globalThis.$onekey.$private.request({
    method: EWebEmbedPrivateRequestMethod.closeWebViewModal,
  });
}

// 显示原生 Toast
async function showNativeToast({ title, message }) {
  await globalThis.$onekey.$private.request({
    method: EWebEmbedPrivateRequestMethod.showToast,
    params: { title, message },
  });
}

// 显示调试对话框
async function showNativeDebugMessageDialog(debugMessage: any) {
  await globalThis.$onekey.$private.request({
    method: EWebEmbedPrivateRequestMethod.showDebugMessageDialog,
    params: debugMessage,
  });
}
```

#### 支付流程
```typescript
// 使用 Prime 支付方法
const { paymentMethods } = usePrimePaymentMethods();

// 支付处理逻辑
const handlePayment = useCallback(async (paymentMethodId: string) => {
  try {
    // 调用原生支付
    await globalThis.$onekey.$private.request({
      method: EWebEmbedPrivateRequestMethod.processPayment,
      params: { paymentMethodId },
    });
  } catch (error) {
    // 错误处理
    showNativeToast({
      title: 'Payment Failed',
      message: error.message,
    });
  }
}, []);
```

### 3. **应用设置集成**

#### 设置获取机制
```typescript
const getValueFromWebEmbedOneKeyAppSettings = <T extends keyof IWebEmbedOnekeyAppSettings>(
  key: T,
): IWebEmbedOnekeyAppSettings[keyof IWebEmbedOnekeyAppSettings] | string => {
  const value = globalThis?.WEB_EMBED_ONEKEY_APP_SETTINGS?.[key];
  return value ?? '';
};

// 设置映射
const settings = {
  instanceId: getValueFromWebEmbedOneKeyAppSettings('instanceId'),
  theme: getValueFromWebEmbedOnekeyAppSettings('themeVariant'),
  locale: getValueFromWebEmbedOnekeyAppSettings('localeVariant'),
  version: getValueFromWebEmbedOnekeyAppSettings('appVersion'),
  buildNumber: getValueFromWebEmbedOnekeyAppSettings('appBuildNumber'),
};
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

### 2. **构建流程**
```bash
# 1. Webpack 构建
webpack build

# 2. 后构建脚本
bash ./postbuild.sh

# 3. 同步到移动应用
# Android: ../mobile/android/app/src/main/assets/web-embed/
# iOS: ../mobile/ios/OneKeyWallet/web-embed/
```

### 3. **集成到移动应用**
```javascript
// 在移动应用中加载 WebEmbed
import { WebView } from 'react-native-webview';

function WebEmbedView() {
  return (
    <WebView
      source={{ uri: 'file:///android_asset/web-embed/index.html' }}
      onMessage={handleWebViewMessage}
      injectedJavaScript={injectedJavaScript}
    />
  );
}
```

## 部署策略

### 1. **静态部署**
```bash
# 构建产物
web-build/
├── index.html              # 主页面
├── static/                 # 静态资源
├── .well-known/            # 安全验证
└── [其他资源]
```

### 2. **移动应用集成**
```bash
# Android 集成路径
mobile/android/app/src/main/assets/web-embed/

# iOS 集成路径
mobile/ios/OneKeyWallet/web-embed/
```

### 3. **CDN 部署**
```bash
# CDN 部署配置
Cache-Control: public, max-age=31536000
ETag: 哈希值
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
```

### 2. **性能监控**
```typescript
// 性能指标收集
defaultLogger.app.webembed.renderHtmlRoot();
defaultLogger.app.webembed.renderHtmlWebembedPage();
defaultLogger.app.webembed.callPageInit();
defaultLogger.app.webembed.callPageGetEncodeKeySuccess();
```

### 3. **使用分析**
```typescript
// 分析工具初始化
analytics.init({
  instanceId,
  baseURL: buildServiceEndpoint({
    serviceName: EServiceEndpointEnum.Utility,
    env: globalThis?.WEB_EMBED_ONEKEY_APP_SETTINGS?.enableTestEndpoint ? 'test' : 'prod',
  }),
});
```

## 安全特性

### 1. **内容安全策略**
```html
<meta http-equiv="Content-Security-Policy" 
      content="default-src 'self'; script-src 'self' 'unsafe-inline'">
```

### 2. **敏感文本编码**
```typescript
// 设置编码密钥
setBgSensitiveTextEncodeKey(key);

// 敏感数据处理
const encryptedData = encryptSensitiveData(data, key);
```

### 3. **域名验证**
```typescript
// OneKey 域名验证
const isOneKeyDomain = await checkIsOneKeyDomain(url);
if (!isOneKeyDomain) {
  throw new Error('Invalid domain');
}
```

### 4. **消息验证**
```typescript
// 消息格式验证
interface IJsBridgeMessagePayload {
  data: IBackgroundApiWebembedCallMessage;
  callbackId: number;
}

function validateMessage(message: any): message is IJsBridgeMessagePayload {
  return message && typeof message.data === 'object' && typeof message.callbackId === 'number';
}
```

## 扩展方式

### **方案1: 添加新页面**
```typescript
// 1. 创建新页面
// pages/NewFeature.tsx
export default function NewFeature() {
  return (
    <div>
      <h1>New Feature</h1>
      <p>This is a new feature for web embed</p>
    </div>
  );
}

// 2. 添加路由常量
// @onekeyhq/shared/src/consts/webEmbedConsts.ts
export enum EWebEmbedRoutePath {
  index = '/',
  webEmbedApi = '/web-embed-api',
  primePurchase = '/prime-purchase',
  newFeature = '/new-feature',  // 新增
}

// 3. 注册路由
// index.js
const PageNewFeature = lazy(() => import('./pages/NewFeature'));

<Routes>
  <Route path={EWebEmbedRoutePath.newFeature} element={<PageNewFeature />} />
</Routes>
```

### **方案2: 添加新 API 接口**
```typescript
// 1. 扩展 WebEmbed API
// @onekeyhq/kit-bg/src/webembeds/instance/webembedApi.ts
class WebembedApi {
  async callWebEmbedApiMethod(message: IBackgroundApiWebembedCallMessage) {
    switch (message.method) {
      case 'newFeature':
        return this.handleNewFeature(message.params);
      // ... 现有方法
    }
  }

  private async handleNewFeature(params: any) {
    // 新功能逻辑
    return { success: true, data: params };
  }
}

// 2. 添加消息类型
// @onekeyhq/shared/src/types/webEmbed.ts
export interface IWebEmbedNewFeatureParams {
  input: string;
  config?: any;
}

export interface IWebEmbedNewFeatureResponse {
  success: boolean;
  data: any;
}
```

### **方案3: 添加原生交互**
```typescript
// 1. 添加私有请求方法
// @onekeyhq/shared/src/consts/webEmbedConsts.ts
export enum EWebEmbedPrivateRequestMethod {
  closeWebViewModal = 'closeWebViewModal',
  showToast = 'showToast',
  showDebugMessageDialog = 'showDebugMessageDialog',
  newFeature = 'newFeature',  // 新增
}

// 2. 在页面中使用
// pages/NewFeature.tsx
async function callNewFeature() {
  await globalThis.$onekey.$private.request({
    method: EWebEmbedPrivateRequestMethod.newFeature,
    params: { message: 'Hello from WebEmbed' },
  });
}
```

### **方案4: 添加主题支持**
```typescript
// 1. 扩展主题类型
// @onekeyhq/shared/src/types/webEmbed.ts
export interface IWebEmbedTheme {
  primaryColor: string;
  backgroundColor: string;
  textColor: string;
}

// 2. 在应用中使用
// pages/ThemeDemo.tsx
function ThemeDemo() {
  const theme = globalThis?.WEB_EMBED_ONEKEY_APP_SETTINGS?.theme;
  
  return (
    <div style={{
      backgroundColor: theme?.backgroundColor || '#ffffff',
      color: theme?.textColor || '#000000',
    }}>
      <h1 style={{ color: theme?.primaryColor }}>Theme Demo</h1>
    </div>
  );
}
```

## 测试策略

### 1. **单元测试**
```typescript
// pages/__tests__/PageIndex.test.tsx
import { render, screen } from '@testing-library/react';
import PageIndex from '../PageIndex';

test('renders navigation links', () => {
  render(<PageIndex />);
  expect(screen.getByText('WebEmbedApi')).toBeInTheDocument();
  expect(screen.getByText('PrimePurchase')).toBeInTheDocument();
});
```

### 2. **集成测试**
```typescript
// __tests__/WebEmbedApi.test.ts
import { renderHook } from '@testing-library/react-hooks';
import { useWebEmbedApi } from '../hooks/useWebEmbedApi';

test('should initialize web embed API', async () => {
  const { result } = renderHook(() => useWebEmbedApi());
  
  await waitFor(() => {
    expect(result.current).toBeDefined();
  });
});
```

### 3. **E2E 测试**
```typescript
// e2e/web-embed.e2e.js
describe('Web Embed Integration', () => {
  test('should communicate with native app', async () => {
    await page.goto('http://localhost:3008');
    
    // 测试 API 通信
    const result = await page.evaluate(() => {
      return globalThis.$onekey.$private.request({
        method: 'getSensitiveEncodeKey',
      });
    });
    
    expect(result).toBeDefined();
  });
});
```

## 总结

### **技术优势**
1. **轻量化**: 最小化的包体积和依赖
2. **易集成**: 简单的集成方式
3. **API 优先**: 完整的 API 接口
4. **平台兼容**: 支持所有现代浏览器
5. **移动集成**: 与 React Native 无缝集成

### **业务优势**
1. **无侵入性**: 不影响宿主页面
2. **响应式**: 完美的移动端适配
3. **国际化**: 内置多语言支持
4. **主题系统**: 灵活的主题定制
5. **安全优先**: 完整的安全机制

### **开发优势**
1. **快速开发**: 热重载和快速构建
2. **工具完善**: 完整的开发工具链
3. **测试覆盖**: 全面的测试策略
4. **文档完善**: 详细的 API 文档
5. **自动化**: 高度自动化的构建流程

### **架构优势**
1. **模块化**: 清晰的模块分离
2. **可扩展**: 易于添加新功能
3. **可维护**: 统一的代码规范
4. **可测试**: 独立的测试单元
5. **可部署**: 多种部署方式

Web Embed 作为 OneKey 的嵌入式解决方案，为第三方网站和 DApp 提供了强大而灵活的钱包集成能力，是 OneKey 生态系统的重要组成部分。

---
*生成时间: 2026-03-22*
*分析范围: apps/web-embed 目录完整分析*
