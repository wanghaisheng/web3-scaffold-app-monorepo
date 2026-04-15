# OneKey Packages 组织与跨平台复用学习笔记

## 一、Packages 总体架构

OneKey monorepo 采用分层架构设计，将功能按职责和复用层级划分为 6 个核心包：

```
packages/
├── components/     # UI 组件库（跨平台）
├── core/           # 区块链核心逻辑（平台无关）
├── kit/            # 业务逻辑层（跨平台）
├── kit-bg/         # 后台服务层（平台相关）
├── shared/         # 工具函数和平台适配（基础层）
└── qr-wallet-sdk/  # 硬件钱包 SDK（独立模块）
```

### 设计原则

1. **分层依赖**：上层依赖下层，避免循环依赖
2. **平台隔离**：通过文件后缀区分平台实现
3. **接口统一**：相同功能提供统一接口，平台差异在内部处理
4. **按需加载**：支持按平台打包，减小包体积

## 二、各包职责详解

### 2.1 packages/components - UI 组件库

**定位**：跨平台 UI 组件库，提供统一的视觉和交互体验

**目录结构**：
```
src/
├── actions/          # 交互动作组件
├── composite/        # 复合组件（多个 primitives 组合）
├── content/          # 内容展示组件
├── forms/            # 表单组件
├── hocs/             # 高阶组件
├── hooks/            # React Hooks
├── layouts/          # 布局组件
├── primitives/       # 基础 UI 原语（按钮、输入框等）
├── shared/           # 共享组件
├── types/            # TypeScript 类型定义
└── utils/            # 工具函数
```

**核心特点**：

1. **基于 Tamagui**：使用 Tamagui 实现跨平台样式系统
2. **平台适配**：通过文件后缀区分平台实现
   - `*.native.ts` - React Native 平台
   - `*.web.ts` - Web 平台
   - `*.desktop.ts` - Desktop 平台
   - `*.ext.ts` - Extension 平台

3. **主题系统**：支持暗色/亮色主题切换
4. **国际化**：内置多语言支持

**跨平台复用示例**：

```typescript
// hooks/useBackHandler.ts (Web 实现)
export const useBackHandler = (callback: () => boolean, enable = true) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') callback();
  }, [callback]);

  useEffect(() => {
    if (!enable) return;
    globalThis.addEventListener('keydown', handleKeyDown);
    return () => globalThis.removeEventListener('keydown', handleKeyDown);
  }, [enable, handleKeyDown]);
};

// hooks/useBackHandler.native.ts (React Native 实现)
export const useBackHandler = (callback: () => boolean, enable = true) => {
  useEffect(() => {
    if (!enable) return;
    const backHandler = BackHandler.addEventListener('hardwareBackPress', callback);
    return () => backHandler.remove();
  }, [callback, enable]);
};
```

**依赖关系**：
- 依赖 `@onekeyfe/react-native-*` 系列（OneKey 定制的 RN 组件）
- 依赖 React Navigation（导航）
- 依赖 Moti（动画）
- 平台无关，可被所有应用复用

### 2.2 packages/core - 区块链核心

**定位**：平台无关的区块链核心逻辑，支持 60+ 链

**目录结构**：
```
src/
├── base/             # 基础抽象接口
├── chains/           # 各链具体实现（60+ 条链）
├── consts/           # 常量定义
├── instance/         # 实例管理
├── secret/           # 密钥管理
├── types/            # 类型定义
└── utils/            # 工具函数
```

**支持的区块链**（部分）：
- **BTC 系列**：btc, bch, ltc, doge, nexa
- **EVM 系列**：evm（统一接口）
- **其他链**：sol, aptos, sui, near, cosmos, dot, xrp, stellar, ton, tron, ckb, algo, fil, kaspa, xmr, nostr 等

**核心特点**：

1. **统一抽象接口**：所有链遵循相同的接口规范
2. **纯 JavaScript/TypeScript**：无平台特定依赖
3. **模块化设计**：每条链独立实现，互不干扰
4. **依赖最小化**：只依赖必要的加密库

**链实现示例**：
```
chains/
├── btc/              # Bitcoin 实现
│   ├── vault.ts      # 钱包密钥管理
│   ├── builder.ts    # 交易构建
│   ├── decoder.ts    # 交易解码
│   └── ...
├── evm/              # EVM 统一接口
│   ├── vault.ts      # EVM 钱包
│   ├── builder.ts    # EVM 交易构建
│   └── ...
└── sol/              # Solana 实现
    ├── vault.ts
    ├── builder.ts
    └── ...
```

**依赖关系**：
- 依赖各链的官方 SDK（@solana/web3.js, viem, ethers 等）
- 依赖加密库（@noble/secp256k1, elliptic 等）
- 无平台特定依赖，完全平台无关

### 2.3 packages/kit - 业务逻辑层

**定位**：跨平台业务逻辑，连接 UI 和核心层

**目录结构**：
```
src/
├── background/       # 后台任务
├── components/       # 业务组件
├── hooks/            # 业务 Hooks
├── provider/         # Context Provider
├── routes/           # 路由配置
├── states/           # 状态管理
├── utils/            # 业务工具
└── views/            # 页面视图
```

**核心特点**：

1. **业务聚合**：组合 components 和 core 提供业务功能
2. **状态管理**：使用 Jotai 进行状态管理
3. **Provider 模式**：通过 KitProvider 提供全局上下文
4. **路由管理**：统一的路由配置

**依赖关系**：
- 依赖 `@onekeyhq/components`（UI 层）
- 依赖 `@onekeyhq/core`（核心层）
- 依赖 `@onekeyhq/shared`（工具层）
- 依赖 `@onekeyhq/kit-bg`（后台服务）

### 2.4 packages/kit-bg - 后台服务层

**定位**：平台相关的后台服务，处理持久化、同步等任务

**目录结构**：
```
src/
├── apis/             # API 接口
├── connectors/       # 连接器（WalletConnect 等）
├── dbs/              # 数据库操作
├── desktopApis/      # Desktop 特定 API
├── endpoints/        # 端点配置
├── init/             # 初始化
├── migrations/       # 数据库迁移
├── offscreens/       # 离屏页面
├── providers/        # Service Provider
├── services/         # 业务服务
├── states/           # 后台状态
├── vaults/           # 钱包保险库
└── webembeds/        # Web 嵌入支持
```

**核心特点**：

1. **平台特定**：针对不同平台有不同实现
2. **数据持久化**：使用 IndexedDB/SQLite 等存储方案
3. **后台同步**：处理数据同步、推送等后台任务
4. **服务化**：将复杂逻辑封装为服务

**依赖关系**：
- 依赖 `@onekeyhq/core`（核心层）
- 依赖 `@onekeyhq/shared`（工具层）
- 平台特定依赖（如 idb for Web, SQLite for Native）

### 2.5 packages/shared - 工具和平台适配

**定位**：基础工具函数和平台环境适配

**目录结构**：
```
src/
├── IndexedDBPromised/        # IndexedDB Promise 封装
├── analytics/               # 分析统计
├── appCrypto/               # 应用加密
├── appDeviceInfo/           # 设备信息
├── appGlobals.ts            # 全局变量
├── background/              # 后台相关
├── biologyAuth/             # 生物认证
├── cloudBackup/             # 云备份
├── config/                  # 配置管理
├── consts/                  # 常量
├── engine/                  # 引擎相关
├── errors/                  # 错误处理
├── eventBus/                # 事件总线
├── hardware/                # 硬件相关
├── keyboard/                # 键盘相关
├── keylessWallet/           # 无密钥钱包
├── lazyLoad/                # 懒加载
├── locale/                  # 国际化
├── logger/                  # 日志系统
├── modules/                 # 模块管理
├── modules3rdParty/         # 第三方模块
├── performance/             # 性能监控
├── platformEnv.ts           # 平台环境（核心）
├── polyfills/               # Polyfills
├── request/                 # 请求封装
├── routes/                  # 路由相关
├── rpcCache/                # RPC 缓存
├── shortcuts/               # 快捷键
├── signMessage/             # 签名消息
├── spotlight/               # 搜索功能
├── storage/                 # 存储封装
├── storageChecker/          # 存储检查
├── types/                   # 类型定义
├── utils/                   # 工具函数
├── walletConnect/           # WalletConnect
├── web/                     # Web 特定
└── webAuth/                 # Web 认证
```

**核心特点**：

1. **平台环境检测**：`platformEnv.ts` 是核心文件，统一管理平台信息
2. **工具函数集合**：提供常用的工具函数
3. **平台适配**：处理不同平台的差异
4. **无依赖**：尽量减少外部依赖，保持轻量

**platformEnv.ts 核心功能**：

```typescript
export type IAppPlatform =
  | 'extension'   // 浏览器扩展
  | 'ios'         // iOS
  | 'android'     // Android
  | 'desktop'     // 桌面应用
  | 'web'         // Web 应用
  | 'web-embed';  // 可嵌入组件

export type IPlatformEnv = {
  // 平台检测
  isWeb?: boolean;
  isDesktop?: boolean;
  isExtension?: boolean;
  isNative?: boolean;

  // 细分平台
  isDesktopWin?: boolean;
  isDesktopMac?: boolean;
  isDesktopLinux?: boolean;
  isExtChrome?: boolean;
  isExtFirefox?: boolean;

  // 运行环境
  isDev?: boolean;
  isProduction?: boolean;
  isJest?: boolean;

  // 应用信息
  version: string | undefined;
  buildNumber: string | undefined;
  // ...
};
```

**依赖关系**：
- 基础层，无其他 package 依赖
- 依赖少量第三方库（localforage, webextension-polyfill 等）

### 2.6 packages/qr-wallet-sdk - 硬件钱包 SDK

**定位**：独立的硬件钱包 SDK，用于二维码扫描和连接

**核心特点**：
- 独立模块，可单独使用
- 依赖 Keystone 硬件钱包 SDK
- 支持二维码扫描和硬件钱包连接

## 三、跨平台复用策略

### 3.1 文件后缀机制

OneKey 使用文件后缀来区分平台实现：

| 后缀 | 平台 | 说明 |
|------|------|------|
| `.native.ts` | React Native | iOS/Android 通用实现 |
| `.web.ts` | Web | 浏览器环境实现 |
| `.desktop.ts` | Desktop | Electron 桌面实现 |
| `.ext.ts` | Extension | 浏览器扩展实现 |
| `.ios.ts` | iOS | iOS 特定实现 |
| `.android.ts` | Android | Android 特定实现 |
| 无后缀 | 通用 | 所有平台共享 |

**打包时自动选择**：
- React Native 环境优先加载 `.native.ts`
- Web 环境优先加载 `.web.ts`
- 其他平台加载对应后缀文件
- 回退到无后缀文件

### 3.2 平台环境检测

通过 `platformEnv.ts` 统一管理平台信息：

```typescript
// 使用示例
import { platformEnv } from '@onekeyhq/shared';

if (platformEnv.isNative) {
  // React Native 特定代码
} else if (platformEnv.isWeb) {
  // Web 特定代码
} else if (platformEnv.isDesktop) {
  // Desktop 特定代码
}
```

### 3.3 统一接口设计

相同功能在不同平台提供统一接口：

```typescript
// 统一的 Hook 接口
export const useBackHandler: (callback: () => boolean, enable?: boolean) => void;

// Web 实现（监听 Escape 键）
// Native 实现（监听硬件返回键）
// 使用方无需关心平台差异
```

### 3.4 依赖隔离

- **core**：完全平台无关，纯 JavaScript
- **shared**：最小依赖，基础工具
- **components**：跨平台 UI，通过后缀区分实现
- **kit**：业务逻辑，依赖上层组件
- **kit-bg**：平台相关，处理后台任务

### 3.5 按需打包

通过配置支持按平台打包：

```javascript
// webpack.config.js
module.exports = {
  resolve: {
    extensions: ['.web.ts', '.native.ts', '.ts'],
  },
  // 平台特定的打包配置
};
```

## 四、学习要点总结

### 4.1 架构设计

1. **分层清晰**：UI → 业务 → 核心 → 工具，依赖关系明确
2. **平台隔离**：通过文件后缀和平台检测实现平台隔离
3. **接口统一**：相同功能提供统一接口，平台差异内部处理
4. **模块化**：每个包职责单一，便于维护和复用

### 4.2 跨平台复用

1. **文件后缀机制**：简单有效的平台代码组织方式
2. **平台环境检测**：统一的平台信息管理
3. **统一接口设计**：降低使用方的平台感知
4. **依赖最小化**：核心层无平台依赖，提高复用性

### 4.3 多链支持

1. **统一抽象**：所有链遵循相同接口
2. **模块化实现**：每条链独立实现
3. **依赖最小化**：只依赖必要的链 SDK
4. **易于扩展**：添加新链只需实现统一接口

### 4.4 工程化实践

1. **类型安全**：全面使用 TypeScript
2. **代码规范**：统一的 lint 和格式化配置
3. **构建优化**：按需打包，减小体积
4. **开发体验**：热重载、类型提示、错误检查

## 五、脚手架应用建议

基于 OneKey 的学习，在设计 Web3 monorepo 脚手架时：

### 5.1 包结构设计

```
packages/
├── ui/               # UI 组件库（跨平台）
├── blockchain/       # 区块链核心（平台无关）
├── business/         # 业务逻辑（跨平台）
├── services/         # 后台服务（平台相关）
├── utils/            # 工具函数（基础层）
└── sdk/              # 独立 SDK 模块
```

### 5.2 跨平台策略

1. 采用文件后缀机制区分平台实现
2. 建立统一的平台环境检测
3. 设计统一的功能接口
4. 实现按需打包配置

### 5.3 多链支持

1. 设计统一的区块链接口
2. 模块化实现各链支持
3. 最小化外部依赖
4. 提供链扩展模板

### 5.4 开发工具

1. 提供包生成脚手架
2. 自动化平台代码生成
3. 统一的构建和测试脚本
4. 完善的类型检查和 lint

## 六、注意事项

1. **避免过度抽象**：不要为了复用而过度抽象，保持简单
2. **平台差异处理**：合理处理平台差异，不要强行统一
3. **依赖管理**：控制依赖数量，避免依赖膨胀
4. **性能优化**：关注打包体积和运行时性能
5. **文档完善**：提供清晰的文档和使用示例

---

> **学习来源**：OneKey/app-monorepo (https://github.com/OneKeyHQ/app-monorepo)
> 
> **学习目标**：理解大型 Web3 项目的工程化组织，为构建可复用的 Web3 monorepo 脚手架提供参考。
