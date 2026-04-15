# packages 目录架构分析与扩展指南

## 概述
本文档分析 OneKey packages 目录下各个子包的架构特点、定位和扩展方式。

## packages 目录总览

```
packages/
├── components/     # UI 组件库 (4,152 items)
├── core/          # 区块链核心引擎 (380 items)
├── kit/           # 前端业务逻辑 (2,803 items)
├── kit-bg/        # 后台业务逻辑 (856 items)
├── qr-wallet-sdk/ # QR 钱包 SDK (18 items)
└── shared/        # 共享工具库 (707 items)
```

## 各包详细分析

### 1. @onekeyhq/components - UI 组件库

#### **定位与作用**
- **UI 组件库**: 提供跨平台的 UI 组件
- **设计系统**: 统一的设计语言和主题
- **导航系统**: React Navigation 集成
- **基础组件**: 原子级 UI 组件

#### **架构特点**
```
src/
├── actions/        # 操作组件 (27 items)
├── composite/      # 复合组件 (72 items)
├── content/        # 内容组件 (38 items)
├── forms/          # 表单组件 (34 items)
├── hocs/           # 高阶组件 (32 items)
├── hooks/          # 组件 Hooks (27 items)
├── layouts/        # 布局组件 (92 items)
├── primitives/     # 原子组件 (1,930 items)
├── utils/          # 工具函数 (6 items)
└── types/          # 类型定义 (1 item)
```

#### **核心依赖**
```json
{
  "@react-navigation/*": "导航组件",
  "moti": "^0.25.3",           "动画库",
  "react-native-svg": "15.15.1", "SVG 支持",
  "react-hook-form": "^7.22.1", "表单处理",
  "qrcode": "^1.5.0",          "二维码生成"
}
```

#### **扩展方式**

##### **方案1: 添加新组件**
```typescript
// 1. 创建新组件
// src/primitives/NewComponent/NewComponent.tsx
import { View, Text } from 'react-native';
import { useTheme } from '@onekeyhq/components';

interface NewComponentProps {
  title: string;
  onPress?: () => void;
}

export default function NewComponent({ title, onPress }: NewComponentProps) {
  const theme = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: theme.bgPrimary }]}>
      <Text style={[styles.title, { color: theme.textPrimary }]}>{title}</Text>
    </View>
  );
}

// 2. 导出组件
// src/primitives/NewComponent/index.ts
export { default } from './NewComponent';
export type { NewComponentProps } from './NewComponent';

// 3. 在主入口导出
// src/primitives/index.ts
export * from './NewComponent';

// 4. 在根入口导出
// src/index.tsx
export * from './primitives';
```

##### **方案2: 添加复合组件**
```typescript
// src/composite/NewFeature/NewFeature.tsx
import { Container, Button, Text } from '@onekeyhq/components';

export default function NewFeature() {
  return (
    <Container>
      <Button>Click Me</Button>
      <Text>New Feature Component</Text>
    </Container>
  );
}
```

##### **方案3: 添加布局组件**
```typescript
// src/layouts/NewLayout/NewLayout.tsx
import { LayoutProvider, useLayout } from '@onekeyhq/components';

interface NewLayoutProps {
  children: React.ReactNode;
}

export default function NewLayout({ children }: NewLayoutProps) {
  const { layout } = useLayout();
  
  return (
    <div style={layout.container}>
      {children}
    </div>
  );
}
```

#### **主题扩展**
```typescript
// src/theme/extendTheme.ts
import { extendTheme } from '@onekeyhq/components';

export const customTheme = extendTheme({
  colors: {
    newPrimary: '#007AFF',
    newSecondary: '#5856D6',
  },
  spacing: {
    newLarge: 24,
  },
});
```

#### **图标系统扩展**
```typescript
// 1. 添加 SVG 图标到 src/svg/
// 2. 运行构建脚本
yarn icon:build

// 3. 使用图标
import { NewIcon } from '@onekeyhq/components';
```

### 2. @onekeyhq/core - 区块链核心引擎

#### **定位与作用**
- **区块链核心**: 底层区块链操作
- **密码学工具**: 加密解密、签名验证
- **多链支持**: 30+ 区块链网络支持
- **纯逻辑**: 无 UI，纯业务逻辑

#### **架构特点**
```
src/
├── base/          # 基础工具 (4 items)
├── chains/        # 区块链实现 (336 items)
├── consts/        # 常量定义 (1 item)
├── instance/      # 实例管理 (1 item)
├── secret/        # 密码学工具 (27 items)
├── types/         # 类型定义 (5 items)
└── utils/         # 工具函数 (2 items)
```

#### **核心依赖**
```json
{
  "@solana/web3.js": "1.98.2",        "Solana 支持",
  "@aptos-labs/ts-sdk": "^1.37.0",    "Aptos 支持",
  "bitcoinjs-lib": "7.0.1",          "Bitcoin 支持",
  "elliptic": "^6.6.0",               "椭圆曲线加密",
  "bip39": "^3.1.0",                  "助记词生成",
  "eth-sig-util": "^3.0.1",           "以太坊签名"
}
```

#### **扩展方式**

##### **方案1: 添加新区块链支持**
```typescript
// 1. 创建区块链实现
// src/chains/newchain/NewChainProvider.ts
export class NewChainProvider {
  async getBalance(address: string): Promise<string> {
    // 获取余额逻辑
  }

  async sendTransaction(params: any): Promise<string> {
    // 发送交易逻辑
  }

  async signTransaction(tx: any, privateKey: string): Promise<string> {
    // 签名逻辑
  }

  validateAddress(address: string): boolean {
    // 地址验证逻辑
  }
}

// 2. 创建工具函数
// src/chains/newchain/utils.ts
export function createAddress(publicKey: string): string {
  // 地址生成逻辑
}

export function parseTransaction(txData: any): any {
  // 交易解析逻辑
}

// 3. 导出实现
// src/chains/newchain/index.ts
export { NewChainProvider } from './NewChainProvider';
export * from './utils';

// 4. 在主入口注册
// src/chains/index.ts
export * from './newchain';
```

##### **方案2: 添加密码学工具**
```typescript
// src/secret/NewCrypto.ts
import { createHash } from 'crypto';

export function newHash(data: string): string {
  return createHash('sha256').update(data).digest('hex');
}

export function newEncrypt(data: string, key: string): string {
  // 加密逻辑
}

export function newDecrypt(encryptedData: string, key: string): string {
  // 解密逻辑
}
```

##### **方案3: 添加常量定义**
```typescript
// src/consts/newChain.ts
export const NEWCHAIN_NETWORKS = {
  mainnet: 'https://mainnet.newchain.com',
  testnet: 'https://testnet.newchain.com',
};

export const NEWCHAIN_DECIMALS = 18;
export const NEWCHAIN_SYMBOL = 'NEW';
```

### 3. @onekeyhq/shared - 共享工具库

#### **定位与作用**
- **工具函数**: 跨平台通用工具
- **类型定义**: 全局类型定义
- **平台检测**: 平台环境判断
- **国际化**: 多语言支持
- **存储抽象**: 统一存储接口

#### **架构特点**
```
src/
├── analytics/      # 分析工具 (5 items)
├── appCrypto/      # 应用加密 (11 items)
├── config/         # 配置管理 (4 items)
├── errors/         # 错误处理 (15 items)
├── locale/         # 国际化 (33 items)
├── logger/         # 日志系统 (145 items)
├── modules3rdParty/ # 第三方模块 (61 items)
├── performance/    # 性能监控 (17 items)
├── platformEnv.ts  # 平台环境 (核心文件)
├── routes/         # 路由定义 (56 items)
├── storage/        # 存储抽象 (47 items)
├── utils/          # 工具函数 (76 items)
└── types/          # 类型定义 (1 item)
```

#### **核心依赖**
```json
{
  "localforage": "^1.10.0",           "本地存储",
  "redux-persist": "^6.0.0",          "状态持久化",
  "webextension-polyfill": "^0.8.0",  "扩展兼容",
  "async-mutex": "^0.3.2",            "异步锁",
  "fast-safe-stringify": "^2.1.1"     "安全序列化"
}
```

#### **扩展方式**

##### **方案1: 添加新工具函数**
```typescript
// src/utils/newUtils.ts
export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function generateId(length: number = 8): string {
  return Math.random().toString(36).substring(2, length + 2);
}

// src/utils/index.ts
export * from './newUtils';
```

##### **方案2: 添加平台检测**
```typescript
// src/platformEnv.ts (扩展现有文件)
export const platformEnv = {
  // 现有检测...
  
  // 新增检测
  isNewFeatureSupported: (() => {
    if (platformEnv.isNative) {
      return Platform.OS === 'ios' && Platform.Version >= '14.0';
    }
    return true;
  })(),
  
  isCustomEnvironment: process.env.NODE_ENV === 'custom',
};
```

##### **方案3: 添加错误类型**
```typescript
// src/errors/newErrors.ts
import { OneKeyError } from './OneKeyError';

export class NewFeatureError extends OneKeyError {
  constructor(message: string, options?: any) {
    super(message, {
      code: 'NEW_FEATURE_ERROR',
      ...options,
    });
  }
}

export class NetworkTimeoutError extends OneKeyError {
  constructor(timeout: number) {
    super(`Network timeout after ${timeout}ms`, {
      code: 'NETWORK_TIMEOUT',
      timeout,
    });
  }
}
```

##### **方案4: 添加存储接口**
```typescript
// src/storage/newStorage.ts
import { IStorageAdapter } from './types';

export class NewStorageAdapter implements IStorageAdapter {
  async get(key: string): Promise<any> {
    // 存储获取逻辑
  }

  async set(key: string, value: any): Promise<void> {
    // 存储设置逻辑
  }

  async remove(key: string): Promise<void> {
    // 存储删除逻辑
  }
}
```

##### **方案5: 添加国际化**
```typescript
// 1. 添加翻译键
// src/locale/enum/translations.ts
export enum ETranslations {
  // 现有翻译...
  new_feature_title = 'global__new_feature_title',
  new_feature_description = 'global__new_feature_description',
}

// 2. 在语言文件中添加翻译
// src/locale/json/en_US.json
{
  "global__new_feature_title": "New Feature",
  "global__new_feature_description": "This is a new feature"
}

// 3. 使用翻译
import { useIntl } from 'react-intl';

function NewFeatureComponent() {
  const intl = useIntl();
  
  return (
    <div>
      {intl.formatMessage({ id: ETranslations.new_feature_title })}
    </div>
  );
}
```

### 4. @onekeyhq/qr-wallet-sdk - QR 钱包 SDK

#### **定位与作用**
- **QR 钱包集成**: 与硬件钱包的 QR 通信
- **AirGap 协议**: 支持 AirGap UR 标准
- **Keystone 集成**: Keystone 硬件钱包支持
- **轻量级**: 最小化的 QR 钱包功能

#### **架构特点**
```
src/
├── AirGapSdk.ts           # AirGap SDK 封装
├── AirGapUR.ts            # AirGap UR 处理
├── OneKeyRequestDeviceQR.ts # OneKey 设备 QR
├── airGapUrUtils.ts       # UR 工具函数
├── chains/                # 多链支持 (9 items)
├── misc.ts                # 杂项工具
└── types.ts               # 类型定义
```

#### **核心依赖**
```json
{
  "@keystonehq/keystone-sdk": "^0.4.1"  // Keystone SDK
}
```

#### **扩展方式**

##### **方案1: 添加新硬件钱包支持**
```typescript
// src/chains/NewHardware/NewHardwareSdk.ts
export class NewHardwareSdk {
  async generateQRCode(transaction: any): Promise<string> {
    // 生成 QR 码逻辑
  }

  async parseQRCode(qrData: string): Promise<any> {
    // 解析 QR 码逻辑
  }

  async signTransaction(qrData: string): Promise<string> {
    // 签名交易逻辑
  }
}

// src/chains/NewHardware/index.ts
export { NewHardwareSdk } from './NewHardwareSdk';
```

##### **方案2: 添加新的 UR 类型**
```typescript
// src/types.ts
export enum NewURType {
  NEW_FEATURE = 'new-feature',
}

// src/airGapUrUtils.ts
export function parseNewFeatureUR(ur: string): any {
  // 解析新 UR 类型
}

export function createNewFeatureUR(data: any): string {
  // 创建新 UR 类型
}
```

##### **方案3: 添加新的功能模块**
```typescript
// src/NewFeatureSdk.ts
export class NewFeatureSdk {
  async processQRCode(qrData: string): Promise<any> {
    const parsedData = this.parseQRData(qrData);
    return this.executeFeature(parsedData);
  }

  private parseQRData(qrData: string): any {
    // QR 数据解析
  }

  private async executeFeature(data: any): Promise<any> {
    // 功能执行
  }
}
```

## 扩展最佳实践

### **1. 遵循现有架构模式**
- **目录结构**: 保持与现有模块一致的目录结构
- **命名规范**: 使用一致的命名约定
- **导出方式**: 统一的导出模式

### **2. 类型安全**
```typescript
// 始终使用 TypeScript 类型
interface NewComponentProps {
  title: string;
  onPress?: () => void;
}

// 使用泛型提高复用性
interface ApiResponse<T> {
  data: T;
  error?: string;
}
```

### **3. 错误处理**
```typescript
// 使用统一的错误处理
import { OneKeyError } from '@onekeyhq/shared/src/errors';

class NewServiceError extends OneKeyError {
  constructor(message: string) {
    super(message, { code: 'NEW_SERVICE_ERROR' });
  }
}
```

### **4. 测试覆盖**
```typescript
// 为新功能添加测试
describe('NewComponent', () => {
  test('should render correctly', () => {
    const { getByText } = render(<NewComponent title="Test" />);
    expect(getByText('Test')).toBeInTheDocument();
  });
});
```

### **5. 文档更新**
```typescript
// 添加 JSDoc 注释
/**
 * New component for displaying content
 * @param title - The title to display
 * @param onPress - Optional press handler
 * @returns React component
 */
export default function NewComponent({ title, onPress }: NewComponentProps) {
  // 组件实现
}
```

## 依赖关系管理

### **导入层次规则**
```
@onekeyhq/shared (最底层)
    ↓
@onekeyhq/core
    ↓
@onekeyhq/components
    ↓
@onekeyhq/kit-bg
    ↓
@onekeyhq/kit
    ↓
Apps (最上层)
```

### **循环依赖避免**
- **shared**: 不能导入任何其他 OneKey 包
- **components**: 只能导入 shared
- **core**: 只能导入 shared
- **kit-bg**: 只能导入 shared 和 core
- **kit**: 可以导入 shared、components、kit-bg

## 发布和版本管理

### **版本控制**
```json
{
  "name": "@onekeyhq/new-package",
  "version": "0.0.1",
  "private": true
}
```

### **构建脚本**
```json
{
  "scripts": {
    "build": "tsc",
    "lint": "tsc --noEmit && eslint . --ext .ts,.tsx",
    "test": "jest"
  }
}
```

## 总结

### **各包定位总结**

| 包名 | 定位 | 主要用途 | 扩展难度 |
|------|------|----------|----------|
| **components** | UI 组件库 | 跨平台 UI 组件 | 中等 |
| **core** | 区块链核心 | 底层区块链操作 | 困难 |
| **shared** | 共享工具 | 通用工具和类型 | 简单 |
| **kit-bg** | 后台服务 | 业务逻辑处理 | 中等 |
| **qr-wallet-sdk** | QR 钱包 | 硬件钱包集成 | 中等 |

### **扩展建议**

1. **新手友好**: 从 shared 开始，添加工具函数
2. **UI 开发**: 在 components 中添加新组件
3. **区块链开发**: 在 core 中添加新链支持（需要专业知识）
4. **业务逻辑**: 在 kit-bg 中添加新服务
5. **硬件集成**: 在 qr-wallet-sdk 中添加新硬件支持

### **架构优势**
- **模块化**: 清晰的职责分离
- **可扩展**: 易于添加新功能
- **可测试**: 独立的测试单元
- **可维护**: 统一的代码规范

通过这种分层架构，OneKey 实现了高度模块化和可扩展的代码库，便于不同团队协作开发新功能。
