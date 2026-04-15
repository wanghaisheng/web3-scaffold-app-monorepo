# App、Web、浏览器插件后端实现与复用机制

## 一、总体架构

OneKey 通过**分层架构 + 平台适配**实现后端服务的复用：

```
┌─────────────────────────────────────────────────────────┐
│                   应用层 (apps/)                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Desktop  │  │ Mobile   │  │   Web    │  │  Ext    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              平台适配层 (kit-bg/)                      │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │ desktopApis  │  │   services   │  │     dbs       │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              核心逻辑层 (core/, shared/)                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  blockchain  │  │   utils      │  │  eventBus    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

## 二、kit-bg 包：后台服务核心

### 2.1 目录结构

```
packages/kit-bg/src/
├── apis/              # API 接口定义
├── connectors/        # 外部连接器（WalletConnect 等）
├── dbs/               # 数据库层
│   ├── local/         # 本地数据库
│   │   ├── indexed/   # IndexedDB (Web/Extension)
│   │   └── realm/     # Realm (Mobile/Desktop)
│   └── simple/        # 简单存储
├── desktopApis/       # Desktop 特定 API
├── migrations/        # 数据库迁移
├── offscreens/       # 离屏页面
├── providers/         # Service Provider
├── services/          # 业务逻辑服务（218 个服务）
├── states/            # 状态管理
├── vaults/            # 钱包保险库
└── webembeds/         # Web 嵌入支持
```

### 2.2 核心职责

- **数据持久化**：跨平台的数据存储方案
- **业务逻辑**：账户、交易、网络等业务服务
- **后台任务**：同步、推送、定期任务
- **平台适配**：处理不同平台的特定需求

## 三、数据库层：跨平台存储策略

### 3.1 双数据库方案

**IndexedDB**（Web/Extension）：
- 浏览器原生数据库
- 异步 API
- 支持 Web 和 Extension

**Realm**（Mobile/Desktop）：
- 移动端和桌面端数据库
- 同步 API
- 更好的性能

### 3.2 统一接口

**文件：`packages/kit-bg/src/dbs/local/LocalDbBase.ts`**

```typescript
export class LocalDbBase {
  // 统一的数据库操作接口
  async getAccount(walletId: string, accountId: string) {
    // 平台特定的实现
  }
  
  async saveAccount(account: IAccount) {
    // 平台特定的实现
  }
  
  async getHistory(params: IHistoryParams) {
    // 平台特定的实现
  }
}
```

**IndexedDB 实现**：
```typescript
// packages/kit-bg/src/dbs/local/indexed/IndexedDBAgent.ts
export class IndexedDBAgent extends LocalDbAgentBase implements ILocalDBAgent {
  constructor(buckets: IIndexedBucketsMap) {
    super();
    this.buckets = buckets;
  }
  
  async withTransaction(bucketName, task) {
    const indexed = this.getIndexedByBucketName(bucketName);
    const tx = indexed.transaction(bucketName, 'readwrite');
    return task(tx);
  }
}
```

### 3.3 平台自动选择

```typescript
// packages/kit-bg/src/dbs/local/LocalDbBaseContainer.ts
export class LocalDbBaseContainer {
  async getDbAgent() {
    if (platformEnv.isWeb || platformEnv.isExtension) {
      // 使用 IndexedDB
      return new IndexedDBAgent(this.buckets);
    } else if (platformEnv.isNative || platformEnv.isDesktop) {
      // 使用 Realm
      return new RealmAgent(this.realm);
    }
  }
}
```

## 四、服务层：统一业务逻辑

### 4.1 Service 基类

**文件：`packages/kit-bg/src/services/ServiceBase.ts`**

```typescript
@backgroundClass()
export default class ServiceBase {
  constructor({ backgroundApi }: IServiceBaseProps) {
    this.backgroundApi = backgroundApi;
  }
  
  backgroundApi: IBackgroundApi;
  
  // 获取 API 客户端
  async getClient(name: EServiceEndpointEnum) {
    return appApiClient.getClient(await getEndpointInfo({ name }));
  }
  
  // 显示加载对话框
  @backgroundMethod()
  async showDialogLoading(payload) {
    appEventBus.emit(EAppEventBusNames.ShowDialogLoading, payload);
  }
  
  // 显示提示
  @backgroundMethod()
  async showToast(params) {
    appEventBus.emit(EAppEventBusNames.ShowToast, params);
  }
}
```

### 4.2 服务装饰器

```typescript
import { backgroundClass, backgroundMethod } from '@onekeyhq/shared/src/background/backgroundDecorators';

@backgroundClass()
export class ServiceAccount extends ServiceBase {
  @backgroundMethod()
  async createAccount(params: ICreateAccountParams) {
    // 业务逻辑实现
  }
  
  @backgroundMethod()
  async deleteAccount(accountId: string) {
    // 业务逻辑实现
  }
}
```

**装饰器作用**：
- `@backgroundClass()`：标记为后台服务类
- `@backgroundMethod()`：标记可从前端调用的方法
- 自动处理跨平台通信

### 4.3 服务示例

**账户服务**：
```typescript
export class ServiceAccount extends ServiceBase {
  @backgroundMethod()
  async createAccount({ walletId, networkId, ... }) {
    // 1. 验证参数
    // 2. 调用 core 生成地址
    // 3. 保存到数据库
    // 4. 发送事件通知
  }
}
```

**交易服务**：
```typescript
export class ServiceTransaction extends ServiceBase {
  @backgroundMethod()
  async sendTransaction(params) {
    // 1. 构建交易
    // 2. 签名交易
    // 3. 广播交易
    // 4. 保存历史记录
  }
}
```

## 五、平台特定实现

### 5.1 Desktop 后端

**Electron 主进程**：`apps/desktop/app/app.ts`

```typescript
import desktopApi from '@onekeyhq/kit-bg/src/desktopApis/instance/desktopApi';
import { CALL_DESKTOP_API_EVENT_NAME } from '@onekeyhq/kit-bg/src/desktopApis/base/consts';

// 注册 IPC 处理器
ipcMain.handle(CALL_DESKTOP_API_EVENT_NAME, async (event, params) => {
  const result = await desktopApi.call(params);
  return result;
});

// 启动后台服务
import { startServices } from './service';
startServices();
```

**Desktop API 实例**：
```typescript
// packages/kit-bg/src/desktopApis/instance/desktopApi.ts
export const desktopApi = {
  async call(params: IDesktopApiParams) {
    // 路由到具体的 DesktopApi 实现
    const apiName = params.method.split('.')[0];
    const api = desktopApiMap[apiName];
    return api[params.method](params.params);
  }
};
```

### 5.2 Extension 后端

**Service Worker**：`apps/ext/src/background/serviceWorker.ts`

```typescript
import platformEnv from '@onekeyhq/shared/src/platformEnv';

function disableCacheInBackground() {
  if (platformEnv.isExtensionBackgroundServiceWorker) {
    self.addEventListener('install', () => {
      globalThis.skipWaiting();
    });
  }
}
```

**通信机制**：
- **Chrome Extension V3**：使用 Service Worker
- **消息传递**：chrome.runtime.sendMessage
- **跨域请求**：通过 background 代理

### 5.3 Web 后端

**Service Worker**：`apps/web/src/service-worker.js`

```typescript
// 缓存策略
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
```

**Web 特点**：
- 使用 IndexedDB 存储数据
- 通过 Service Worker 处理后台任务
- 依赖服务器端 API

### 5.4 Mobile 后端

**React Native**：
- 使用 Realm 本地数据库
- 原生模块处理硬件钱包连接
- 后台任务通过原生代码实现

## 六、跨平台通信机制

### 6.1 事件总线

**文件：`packages/shared/src/eventBus/appEventBus.ts`**

```typescript
export const appEventBus = {
  emit(eventName: EAppEventBusNames, payload: any) {
    // 跨平台事件发送
  },
  
  on(eventName: EAppEventBusNames, callback: Function) {
    // 跨平台事件监听
  },
  
  off(eventName: EAppEventBusNames, callback: Function) {
    // 跨平台事件取消
  },
};
```

### 6.2 IPC 通信

**Desktop (Electron)**：
```typescript
// Renderer → Main
ipcRenderer.invoke(CALL_DESKTOP_API_EVENT_NAME, params);

// Main → Renderer
mainWindow.webContents.send('event-name', payload);
```

**Extension**：
```typescript
// Content Script → Background
chrome.runtime.sendMessage({ type: 'method', params });

// Background → Content Script
chrome.tabs.sendMessage(tabId, { type: 'event', payload });
```

### 6.3 装饰器自动处理

```typescript
// @backgroundMethod() 装饰器自动处理跨平台通信
@backgroundMethod()
async someMethod(params: any) {
  // 方法实现
  // 装饰器自动：
  // 1. 注册 IPC 处理器 (Desktop)
  // 2. 注册消息监听器 (Extension)
  // 3. 暴露为全局方法 (Web)
}
```

## 七、服务复用策略

### 7.1 服务分层

```
业务服务 (services/)
├── ServiceAccount       # 账户管理
├── ServiceTransaction   # 交易处理
├── ServiceNetwork       # 网络管理
├── ServiceToken         # 代币管理
├── ServiceHistory       # 历史记录
└── ...
```

### 7.2 平台适配

**Desktop 特定服务**：
```typescript
// packages/kit-bg/src/desktopApis/DesktopApiNotification.ts
export class DesktopApiNotification {
  async showNotification(params) {
    // Electron 原生通知
  }
}
```

**Extension 特定服务**：
```typescript
// packages/kit-bg/src/offscreens/
export class OffscreenService {
  async processInOffscreen(params) {
    // Extension 离屏页面处理
  }
}
```

### 7.3 数据库迁移

**文件：`packages/kit-bg/src/migrations/`**

```typescript
// 数据库版本迁移
export class V4ToV5Migration {
  async migrate() {
    // 1. 备份旧数据
    // 2. 转换数据格式
    // 3. 迁移到新数据库
    // 4. 验证数据完整性
  }
}
```

## 八、核心复用模式

### 8.1 统一服务接口

```typescript
// 所有平台使用相同的服务接口
interface IAccountService {
  createAccount(params: ICreateAccountParams): Promise<IAccount>;
  deleteAccount(accountId: string): Promise<void>;
  updateAccount(accountId: string, updates: IAccountUpdate): Promise<void>;
}

// 平台特定的实现
class ServiceAccountWeb extends ServiceBase implements IAccountService {
  // Web 特定实现
}

class ServiceAccountNative extends ServiceBase implements IAccountService {
  // Native 特定实现
}
```

### 8.2 数据库抽象层

```typescript
// 统一的数据库接口
interface IDbAgent {
  getAccount(walletId: string, accountId: string): Promise<IAccount>;
  saveAccount(account: IAccount): Promise<void>;
}

// 平台特定实现
class IndexedDBAgent implements IDbAgent {
  // IndexedDB 实现
}

class RealmAgent implements IDbAgent {
  // Realm 实现
}

// 自动选择
const dbAgent = platformEnv.isWeb ? new IndexedDBAgent() : new RealmAgent();
```

### 8.3 平台环境检测

```typescript
// packages/shared/src/platformEnv.ts
export const platformEnv: IPlatformEnv = {
  isWeb: typeof window !== 'undefined',
  isDesktop: process?.type === 'renderer',
  isExtension: typeof chrome !== 'undefined',
  isNative: typeof navigator !== 'undefined' && navigator.product === 'ReactNative',
  
  // 细分平台
  isDesktopWin: process.platform === 'win32',
  isDesktopMac: process.platform === 'darwin',
  isExtChrome: typeof chrome !== 'undefined' && chrome.runtime?.id,
  isExtFirefox: typeof browser !== 'undefined',
};
```

## 九、实际应用示例

### 9.1 创建账户流程

**前端调用**（所有平台统一）：
```typescript
// 调用后台服务
const result = await backgroundApi.serviceAccount.createAccount({
  walletId: 'wallet-1',
  networkId: 'eth--1',
  type: 'hd',
});
```

**后台处理**（kit-bg 统一）：
```typescript
@backgroundMethod()
async createAccount(params) {
  // 1. 调用 core 生成密钥
  const vault = await this.backgroundApi.engine.getVault(params);
  const address = await vault.getAccount();
  
  // 2. 保存到数据库（自动选择平台数据库）
  await this.backgroundApi.dbAgent.saveAccount(address);
  
  // 3. 发送事件通知
  appEventBus.emit(EAppEventBusNames.AccountCreated, address);
  
  return address;
}
```

### 9.2 数据存储

**IndexedDB (Web/Extension)**：
```typescript
// 自动使用 IndexedDB
const dbAgent = new IndexedDBAgent(buckets);
await dbAgent.saveAccount(account);
```

**Realm (Mobile/Desktop)**：
```typescript
// 自动使用 Realm
const dbAgent = new RealmAgent(realm);
await dbAgent.saveAccount(account);
```

## 十、脚手架应用建议

基于 OneKey 的学习，设计 Web3 monorepo 脚手架时：

### 10.1 后端架构

```
packages/backend/
├── services/          # 业务逻辑服务
│   ├── ServiceAccount.ts
│   ├── ServiceTransaction.ts
│   └── ...
├── database/          # 数据库层
│   ├── IDbAgent.ts    # 统一接口
│   ├── IndexedDBAgent.ts  # Web 实现
│   └── RealmAgent.ts  # Native 实现
├── platform/          # 平台适配
│   ├── desktop/       # Desktop 特定
│   ├── extension/     # Extension 特定
│   └── mobile/        # Mobile 特定
└── communication/    # 通信层
    ├── eventBus.ts    # 事件总线
    └── decorators.ts  # 装饰器
```

### 10.2 关键设计原则

1. **服务接口统一**：所有平台使用相同的服务接口
2. **数据库抽象**：提供统一的数据库操作接口
3. **平台自动选择**：根据平台环境自动选择实现
4. **通信机制统一**：使用装饰器自动处理跨平台通信
5. **事件驱动**：使用事件总线解耦组件

### 10.3 技术选型

**数据库**：
- Web/Extension：IndexedDB 或 Dexie.js
- Mobile/Desktop：Realm 或 SQLite

**通信**：
- Desktop：Electron IPC
- Extension：chrome.runtime
- Web：Service Worker + postMessage
- Mobile：React Native 原生模块

**状态管理**：
- Jotai（跨平台状态管理）
- 事件总线（跨平台事件通信）

## 十一、注意事项

1. **性能考虑**：数据库操作要异步，避免阻塞主线程
2. **错误处理**：统一错误处理机制，平台差异在内部处理
3. **数据迁移**：设计数据库版本迁移策略
4. **安全性**：敏感数据加密存储，平台特定安全机制
5. **测试覆盖**：各平台都要测试数据库操作和后台服务

---

> **学习来源**：OneKey/app-monorepo 后端实现与复用机制
> 
> **核心机制**：分层架构 + 数据库抽象 + 服务装饰器 + 平台自动选择
