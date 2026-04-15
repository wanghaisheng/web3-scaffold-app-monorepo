# OneKey 架构分析与业务实现指南

## 概述
本文档分析 OneKey 的架构模式，并提供新业务实现的具体指导方案。

## OneKey 架构分析

### **apps/mobile 的作用**

`apps/mobile` 确实是一个"壳"，它的主要作用是：

1. **平台入口**: 提供 React Native 应用的入口点
2. **原生桥接**: 连接 JavaScript 和原生平台代码
3. **配置管理**: Metro、Babel、Expo 等配置
4. **依赖声明**: 声明平台特定的依赖

#### **应用入口分析**
```typescript
// apps/mobile/index.ts - 应用入口
/* eslint-disable import/order */
import '@onekeyhq/shared/src/performance/init';
import './jsReady';

import { I18nManager } from 'react-native';
import { registerRootComponent } from 'expo';
import '@onekeyhq/shared/src/polyfills';
import { initSentry } from '@onekeyhq/shared/src/modules3rdParty/sentry';
import { ReactNativeDeviceUtils } from '@onekeyfe/react-native-device-utils';
import App from './App';

ReactNativeDeviceUtils.initEventListeners();
initSentry();
I18nManager.allowRTL(true);

if (typeof globalThis.nativePerformanceNow === 'function') {
  globalThis.$$onekeyAppWillMountFromPerformanceNow =
    globalThis.nativePerformanceNow();
  if (__DEV__) {
    console.log(
      'onekeyAppWillMountFromPerformanceNow',
      (globalThis.$$onekeyAppWillMountFromPerformanceNow || 0) -
        (globalThis.$$onekeyJsReadyFromPerformanceNow || 0),
    );
  }
}
registerRootComponent(App);
```

#### **主组件分析**
```typescript
// apps/mobile/App.tsx - 主组件
import { KitProvider } from '@onekeyhq/kit';
import { SentryErrorBoundaryFallback } from '@onekeyhq/kit/src/components/ErrorBoundary';
import { withSentryHOC } from '@onekeyhq/shared/src/modules3rdParty/sentry';
import { debugLandingLog } from '@onekeyhq/shared/src/performance/init';

const SentryKitProvider = withSentryHOC(
  KitProvider,
  SentryErrorBoundaryFallback,
);

export default function App(props: any) {
  if (process.env.NODE_ENV !== 'production') {
    debugLandingLog('App render');
  }
  return <SentryKitProvider {...props} />;
}
```

### **真正的业务逻辑在 packages/kit**

所有业务逻辑、页面、组件都在 `packages/kit` 中：

```
packages/kit/src/
├── views/           # 所有页面和业务逻辑
│   ├── Home/        # 钱包主页 (86 items)
│   ├── Swap/        # 交易页面 (116 items)
│   ├── Discovery/   # 浏览器/DApp (98 items)
│   ├── Market/      # 市场页面 (298 items)
│   ├── Earn/        # DeFi 收益 (40 items)
│   ├── Perp/        # 永续合约 (144 items)
│   ├── Setting/     # 设置页面 (110 items)
│   └── [其他模块...]
├── components/      # UI 组件
├── hooks/          # 自定义 Hooks
├── store/          # 状态管理
└── routes/         # 路由配置
```

## 页面定义系统

### **路由配置架构**
```
packages/kit/src/routes/
├── router.ts               # 根路由配置
├── Tab/                    # Tab 页面路由
│   ├── router.ts          # Tab 路由配置
│   ├── Discovery/router.ts
│   ├── Earn/router.ts
│   ├── Market/router.ts
│   └── [其他Tab路由]/
├── Modal/                  # 模态框路由
│   └── router.ts
└── config/                 # 路由配置
```

### **主要 Tab 页面**
从 `Tab/router.ts` 可以看到主要 Tab：

1. **Home** - 钱包主页 (`/`)
2. **Market** - 市场页面 (`/market`) 
3. **Swap** - 交易页面 (`/swap`)
4. **Perp** - 永续合约 (`/perps`)
5. **Earn** - DeFi 收益 (`/defi`)
6. **Discovery** - 浏览器/DApp (`/discovery`)
7. **DeviceManagement** - 设备管理
8. **ReferFriends** - 推荐朋友
9. **Developer** - 开发者模式 (仅开发环境)

### **页面组件结构**
每个功能模块都遵循相同的结构：

```
views/[ModuleName]/
├── pages/                  # 页面组件
│   ├── [PageName].tsx     # 具体页面
│   └── [SubPages]/        # 子页面
├── components/             # 模块专用组件
├── hooks/                  # 模块专用 Hooks
├── router/                 # 路由配置
│   └── index.ts
└── utils/                  # 工具函数
```

### **页面懒加载机制**
OneKey 使用懒加载来优化性能：

```typescript
// 懒加载页面组件
const HomePageContainer = LazyLoadPage(
  () => import('../pages/HomePageContainer'),
);

const UrlAccountPageContainer = LazyLoadPage(async () => {
  const { UrlAccountPageContainer } = await import('../pages/urlAccount/UrlAccountPage');
  return { default: UrlAccountPageContainer };
});
```

## 新业务实现方案

### **方案1: 在现有 kit 中添加（推荐）**

如果要添加新功能，最简单的方式是在现有 `packages/kit` 中添加：

#### **目录结构**
```typescript
// packages/kit/src/views/NewFeature/
├── pages/
│   ├── NewFeaturePage.tsx
│   ├── SubPage.tsx
│   └── components/
│       └── NewFeatureComponent.tsx
├── hooks/
│   └── useNewFeature.ts
├── router/
│   └── index.ts
├── utils/
│   └── newFeatureUtils.ts
└── types/
    └── newFeatureTypes.ts
```

#### **实现示例**
```typescript
// packages/kit/src/views/NewFeature/pages/NewFeaturePage.tsx
import { Container, Header } from '@onekeyhq/components';
import { useNewFeature } from '../hooks/useNewFeature';

export default function NewFeaturePage() {
  const { data, loading } = useNewFeature();
  
  return (
    <Container>
      <Header title="New Feature" />
      {loading ? (
        <LoadingSpinner />
      ) : (
        <FeatureContent data={data} />
      )}
    </Container>
  );
}

// packages/kit/src/views/NewFeature/hooks/useNewFeature.ts
import { useQuery } from '@tanstack/react-query';

export function useNewFeature() {
  return useQuery({
    queryKey: ['newFeature'],
    queryFn: async () => {
      // API 调用逻辑
      return fetchNewFeatureData();
    },
  });
}

// packages/kit/src/views/NewFeature/router/index.ts
import type { ITabSubNavigatorConfig } from '@onekeyhq/components';
import { ETabNewFeatureRoutes } from '@onekeyhq/shared/src/routes';
import { LazyLoadPage } from '../../../components/LazyLoadPage';

const NewFeaturePage = LazyLoadPage(
  () => import('../pages/NewFeaturePage'),
);

export const newFeatureRouters: ITabSubNavigatorConfig<any, any>[] = [
  {
    name: ETabNewFeatureRoutes.NewFeature,
    component: NewFeaturePage,
    rewrite: '/new-feature',
    exact: true,
  },
];
```

#### **路由注册**
```typescript
// packages/kit/src/routes/Tab/router.ts
import { newFeatureRouters } from '../../views/NewFeature/router';

// 添加到 tab 配置中
{
  name: ETabRoutes.NewFeature,
  tabBarIcon: (focused?: boolean) => 
    focused ? 'NewFeatureSolid' : 'NewFeatureOutline',
  translationId: ETranslations.global_new_feature,
  rewrite: '/new-feature',
  children: newFeatureRouters,
  trackId: 'global-new-feature',
}
```

#### **路由枚举定义**
```typescript
// packages/shared/src/routes/index.ts
export enum ETabRoutes {
  Home = 'TabHome',
  Market = 'TabMarket',
  Swap = 'TabSwap',
  // ... 现有路由
  NewFeature = 'TabNewFeature',  // 新增
}

export enum ETabNewFeatureRoutes {
  NewFeature = 'TabNewFeature',
  NewFeatureSubPage = 'TabNewFeatureSubPage',
}
```

#### **国际化文本**
```typescript
// packages/shared/src/locale/enum/translations.ts
export enum ETranslations {
  // ... 现有翻译
  global_new_feature = 'global__new_feature',
}
```

在语言文件中添加翻译：
```json
// packages/shared/src/locale/json/en_US.json
{
  "global__new_feature": "New Feature"
}
```

### **方案2: 创建新的独立包**

如果要创建完全独立的业务模块，可以创建新的包：

#### **创建新包结构**
```bash
# 创建新包
mkdir packages/new-business
cd packages/new-business
```

#### **package.json 配置**
```json
{
  "name": "@onekeyhq/new-business",
  "version": "0.0.1",
  "private": true,
  "main": "src/index.ts",
  "dependencies": {
    "@onekeyhq/components": "*",
    "@onekeyhq/shared": "*"
  },
  "devDependencies": {
    "folderslint": "1.2.0",
    "typescript": "5.9.3"
  }
}
```

#### **包结构**
```typescript
// packages/new-business/src/
├── index.ts              # 导出入口
├── views/
│   ├── NewBusinessPage.tsx
│   └── components/
├── hooks/
│   └── useNewBusiness.ts
├── utils/
│   └── newBusinessUtils.ts
└── types/
    └── newBusinessTypes.ts
```

#### **导出接口**
```typescript
// packages/new-business/src/index.ts
export { default as NewBusinessPage } from './views/NewBusinessPage';
export { useNewBusiness } from './hooks/useNewBusiness';
export * from './types/newBusinessTypes';
```

#### **在应用中使用**
```typescript
// 在 kit 中的页面中使用
import { NewBusinessPage } from '@onekeyhq/new-business';

function SomePage() {
  return <NewBusinessPage />;
}
```

### **方案3: 创建全新的应用**

如果要创建完全独立的应用，可以复制 `apps/mobile`：

#### **复制应用模板**
```bash
# 复制移动应用模板
cp -r apps/mobile apps/new-app

# 修改配置
cd apps/new-app
```

#### **修改应用配置**
```json
// apps/new-app/package.json
{
  "name": "@onekeyhq/new-app",
  "version": "1.0.0",
  "main": "index.ts",
  // ... 其他配置
}
```

#### **自定义应用入口**
```typescript
// apps/new-app/App.tsx
import { NewAppProvider } from '@onekeyhq/new-business';

export default function App(props: any) {
  return <NewAppProvider {...props} />;
}
```

#### **修改路由配置**
```typescript
// apps/new-app/index.ts
import { registerRootComponent } from 'expo';
import App from './App';

registerRootComponent(App);
```

## 平台特定实现

### **条件渲染**
```typescript
import platformEnv from '@onekeyhq/shared/src/platformEnv';

function FeatureComponent() {
  // 根据平台显示不同内容
  if (platformEnv.isNative) {
    return <NativeFeature />;
  }
  
  if (platformEnv.isDesktop) {
    return <DesktopFeature />;
  }
  
  return <WebFeature />;
}
```

### **平台特定文件**
```
FeatureComponent.tsx           # 通用实现
FeatureComponent.native.tsx    # React Native 特定
FeatureComponent.web.tsx      # Web 特定
FeatureComponent.desktop.tsx  # 桌面特定
FeatureComponent.ext.tsx       # 扩展特定
```

## 状态管理

### **Jotai 状态管理**
OneKey 使用 Jotai 进行状态管理：

```typescript
// packages/kit/src/stores/jotai/atoms/newFeatureAtoms.ts
import { atom } from 'jotai';

export const newFeatureDataAtom = atom(null);
export const newFeatureLoadingAtom = atom(false);
export const newFeatureErrorAtom = atom<string | null>(null);
```

### **在组件中使用**
```typescript
import { useAtom } from 'jotai';
import { newFeatureDataAtom, newFeatureLoadingAtom } from '../../stores/jotai/atoms/newFeatureAtoms';

function NewFeatureComponent() {
  const [data, setData] = useAtom(newFeatureDataAtom);
  const [loading, setLoading] = useAtom(newFeatureLoadingAtom);
  
  // 组件逻辑
}
```

## API 集成

### **API 调用模式**
```typescript
// packages/kit/src/services/newFeatureApi.ts
import { backgroundMethod } from '@onekeyhq/shared/src/background/backgroundDecorators';

class NewFeatureApi {
  @backgroundMethod()
  static async getNewFeatureData(params: GetNewFeatureParams) {
    // API 调用逻辑
    return fetch('/api/new-feature', {
      method: 'POST',
      body: JSON.stringify(params),
    });
  }
}
```

### **在组件中使用**
```typescript
import { useBackgroundService } from '@onekeyhq/kit/src/hooks/useBackgroundService';

function NewFeaturePage() {
  const { service } = useBackgroundService();
  
  const handleGetData = async () => {
    try {
      const data = await service.backgroundApi.getNewFeatureData(params);
      // 处理数据
    } catch (error) {
      // 错误处理
    }
  };
}
```

## 测试策略

### **单元测试**
```typescript
// packages/kit/src/views/NewFeature/__tests__/NewFeaturePage.test.tsx
import { render, screen } from '@testing-library/react';
import NewFeaturePage from '../pages/NewFeaturePage';

test('renders new feature page', () => {
  render(<NewFeaturePage />);
  expect(screen.getByText('New Feature')).toBeInTheDocument();
});
```

### **E2E 测试**
```typescript
// apps/mobile/e2e/newFeature.e2e.js
describe('New Feature', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  it('should navigate to new feature', async () => {
    await element(by.id('new-feature-tab')).tap();
    await expect(element(by.text('New Feature'))).toBeVisible();
  });
});
```

## 性能优化

### **代码分割**
```typescript
// 使用 LazyLoadPage 进行代码分割
const NewFeaturePage = LazyLoadPage(
  () => import('../pages/NewFeaturePage'),
);
```

### **图片优化**
```typescript
// 使用优化的图片组件
import { Image } from '@onekeyhq/components';

function FeatureImage() {
  return (
    <Image
      source={require('./assets/feature-image.png')}
      resizeMode="contain"
      style={{ width: '100%', height: 200 }}
    />
  );
}
```

## 部署和发布

### **版本管理**
```bash
# 更新版本
yarn version patch  # 1.0.1
yarn version minor  # 1.1.0
yarn version major  # 2.0.0
```

### **构建发布**
```bash
# Android 构建
yarn android:build

# iOS 构建
yarn ios:build

# Web 构建
yarn app:web:build
```

## 最佳实践

### **代码规范**
- 使用 TypeScript 进行类型检查
- 遵循 ESLint 和 Prettier 规范
- 使用 folderslint 保持目录结构一致

### **错误处理**
```typescript
import { Sentry } from '@onekeyhq/shared/src/modules3rdParty/sentry';

function NewFeaturePage() {
  const handleError = (error: Error) => {
    Sentry.captureException(error);
    // 用户友好的错误提示
  };
}
```

### **国际化**
```typescript
import { useIntl } from 'react-intl';

function NewFeaturePage() {
  const intl = useIntl();
  
  return (
    <div>
      {intl.formatMessage({ id: ETranslations.new_feature_title })}
    </div>
  );
}
```

## 推荐方案总结

### **对于大多数情况：方案1（在 kit 中添加）**

**优点：**
- 复用现有基础设施
- 共享组件和工具
- 统一的状态管理
- 最小化开发成本
- 与现有功能无缝集成

**适用场景：**
- 新的功能模块
- 扩展现有功能
- 大多数新业务需求

### **对于完全独立的业务：方案2（新包）**

**适用场景：**
- 业务逻辑完全独立
- 可能需要独立部署
- 有独立的依赖需求
- 需要独立版本管理

**优点：**
- 模块化程度高
- 可独立测试和部署
- 清晰的依赖边界

### **对于全新应用：方案3（复制应用）**

**适用场景：**
- 需要不同的应用配置
- 需要不同的原生功能
- 要作为独立产品发布
- 完全不同的用户群体

**优点：**
- 完全独立的应用
- 可自定义所有配置
- 独立的应用商店发布

## 实施建议

1. **评估业务需求**：确定新业务的复杂度和独立性
2. **选择合适方案**：根据需求选择最合适的实现方案
3. **遵循现有模式**：保持与现有代码风格和架构一致
4. **渐进式开发**：从小功能开始，逐步扩展
5. **测试覆盖**：确保充分的测试覆盖
6. **文档更新**：及时更新相关文档

通过遵循这些指导原则，可以高效地在 OneKey 架构中实现新业务功能。

---
*生成时间: 2026-03-22*
*分析范围: OneKey 架构分析与业务实现指南*
