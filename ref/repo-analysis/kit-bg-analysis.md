# packages/kit-bg 架构分析与业务实现指南

## 概述
`packages/kit-bg` 是 OneKey 的后台服务层，提供所有核心业务逻辑、数据处理和后台服务。它不是"壳"，而是整个应用的业务核心。

## kit-bg 架构分析

### **核心定位**

`kit-bg` 是 OneKey 的**后台服务层**，包含：

1. **业务逻辑**: 所有核心业务逻辑实现
2. **数据处理**: 数据库操作、状态管理
3. **后台服务**: 长时间运行的后台任务
4. **API 接口**: 前端调用的所有后台 API
5. **区块链集成**: 与各区块链网络的交互

### **目录结构分析**

```
packages/kit-bg/src/
├── apis/                    # API 层
│   ├── BackgroundApi.ts    # 主要后台 API 类
│   ├── BackgroundApiBase.ts # API 基类
│   └── BackgroundApiProxy.ts # API 代理
├── services/                # 业务服务层 (218 items)
│   ├── ServiceAccount.ts      # 账户服务
│   ├── ServiceSwap.ts         # 交易服务
│   ├── ServiceStaking.ts      # 质押服务
│   ├── ServiceKeylessWallet.ts # Keyless 钱包服务
│   ├── ServicePrimeCloudSync.tsx # Prime 云同步服务
│   └── [其他服务...]
├── vaults/                  # 钱包保险库 (348 items)
│   ├── impls/              # 各区块链实现
│   │   ├── evm/           # 以太坊虚拟机
│   │   ├── btc/           # 比特币
│   │   ├── sol/           # Solana
│   │   └── [其他链...]
│   └── factory/           # 保险库工厂
├── dbs/                     # 数据库层 (98 items)
│   ├── local/             # 本地数据库
│   │   ├── indexed/      # IndexedDB
│   │   ├── realm/        # Realm 数据库
│   │   └── simple/       # 简单数据库
│   └── migrations/        # 数据库迁移
├── connectors/             # 外部连接器 (9 items)
│   ├── chains/            # 区块链连接器
│   └── externalWalletFactory.ts
├── providers/              # 提供者模式 (30 items)
│   ├── ProviderApiWalletConnect/
│   └── [其他提供者...]
├── states/                  # 状态管理 (40 items)
│   └── jotai/             # Jotai 状态原子
├── endpoints/               # 端点管理
├── desktopApis/            # 桌面特定 API (23 items)
├── offscreens/             # 离屏处理 (7 items)
└── webembeds/              # 嵌入式 Web (8 items)
```

### **核心组件分析**

#### **1. BackgroundApi - 主入口**
```typescript
// src/apis/BackgroundApi.ts
class BackgroundApi extends BackgroundApiBase implements IBackgroundApi {
  constructor() {
    super();
    vaultFactory.setBackgroundApi(this);
    externalWalletFactory.setBackgroundApi(this);
    localDb.setBackgroundApi(this);
    void this.serviceBootstrap.init();
  }

  // 数据库访问
  simpleDb = simpleDb;
  localDb = localDb;

  // 懒加载的服务
  get serviceAccount() { /* ... */ }
  get serviceSwap() { /* ... */ }
  get serviceStaking() { /* ... */ }
  get serviceKeylessWallet() { /* ... */ }
  get servicePrimeCloudSync() { /* ... */ }
  // ... 更多服务
}

export default BackgroundApi;
```

#### **2. 服务层架构**
每个服务都遵循相同的模式：

```typescript
// 服务基类
abstract class ServiceBase {
  constructor({ backgroundApi }: { backgroundApi: BackgroundApi }) {
    this.backgroundApi = backgroundApi;
  }

  protected backgroundApi: BackgroundApi;
}

// 具体服务实现
class ServiceSwap extends ServiceBase {
  async swapTokens(params: SwapParams) {
    // 交易逻辑实现
  }

  async getSwapQuote(params: QuoteParams) {
    // 报价逻辑实现
  }
}
```

#### **3. 保险库模式**
```typescript
// 保险库工厂
class VaultFactory {
  static createVault({ networkId, accountId }: CreateVaultParams) {
    switch (networkId) {
      case 'evm':
        return new EVMVault();
      case 'btc':
        return new BTCVault();
      // ... 其他链
    }
  }
}
```

## kit-bg 的作用机制

### **1. 前端调用模式**

前端通过 `backgroundMethod` 装饰器调用后台服务：

```typescript
// 在 kit 包中调用
class AppSwapService {
  @backgroundMethod()
  async swapTokens(params: SwapParams) {
    // 这个方法会在 kit-bg 中执行
    return this.backgroundApi.serviceSwap.swapTokens(params);
  }
}
```

### **2. 进程间通信**

- **桌面应用**: Electron 主进程 vs 渲染进程
- **移动应用**: React Native Bridge
- **Web应用**: Web Worker 或同进程
- **扩展应用**: Background Script vs Content Script

### **3. 数据流向**

```
Frontend (kit) 
    ↓ @backgroundMethod
BackgroundApi (kit-bg)
    ↓ Service Layer
Database / Blockchain
```

## 修改现有业务的思路

### **方案1: 修改现有服务**

#### **步骤1: 定位目标服务**
```typescript
// 假设要修改交易服务
// packages/kit-bg/src/services/Swap.ts

class ServiceSwap extends ServiceBase {
  // 现有方法
  async swapTokens(params: SwapParams) {
    // 现有逻辑
  }

  // 新增方法
  async enhancedSwap(params: EnhancedSwapParams) {
    // 新的业务逻辑
    const quote = await this.getEnhancedQuote(params);
    return this.executeSwap(quote);
  }
}
```

#### **步骤2: 更新 API 接口**
```typescript
// packages/kit-bg/src/apis/BackgroundApi.ts
class BackgroundApi extends BackgroundApiBase {
  // 新增服务方法
  get serviceSwap() {
    const Service = require('../services/Swap') as typeof import('../services/Swap');
    const value = new Service.default({ backgroundApi: this });
    Object.defineProperty(this, 'serviceSwap', { value });
    return value;
  }
}
```

#### **步骤3: 更新前端调用**
```typescript
// packages/kit/src/views/Swap/
class SwapService {
  @backgroundMethod()
  async enhancedSwap(params: EnhancedSwapParams) {
    return this.backgroundApi.serviceSwap.enhancedSwap(params);
  }
}
```

### **方案2: 创建新服务**

#### **步骤1: 创建新服务类**
```typescript
// packages/kit-bg/src/services/ServiceNewFeature.ts
import { ServiceBase } from './ServiceBase';

interface NewFeatureParams {
  input: string;
  config?: NewFeatureConfig;
}

class ServiceNewFeature extends ServiceBase {
  async processNewFeature(params: NewFeatureParams) {
    // 业务逻辑实现
    const result = await this.validateInput(params);
    return this.executeFeature(result);
  }

  private async validateInput(params: NewFeatureParams) {
    // 验证逻辑
  }

  private async executeFeature(validatedParams: any) {
    // 执行逻辑
  }
}

export default ServiceNewFeature;
```

#### **步骤2: 注册到 BackgroundApi**
```typescript
// packages/kit-bg/src/apis/BackgroundApi.ts
class BackgroundApi extends BackgroundApiBase {
  get serviceNewFeature() {
    const Service = require('../services/ServiceNewFeature') as typeof import('../services/ServiceNewFeature');
    const value = new Service.default({ backgroundApi: this });
    Object.defineProperty(this, 'serviceNewFeature', { value });
    return value;
  }
}
```

#### **步骤3: 创建前端服务接口**
```typescript
// packages/kit/src/services/NewFeatureService.ts
import { backgroundMethod } from '@onekeyhq/shared/src/background/backgroundDecorators';

class NewFeatureService {
  @backgroundMethod()
  async processNewFeature(params: NewFeatureParams) {
    return this.backgroundApi.serviceNewFeature.processNewFeature(params);
  }
}

export default new NewFeatureService();
```

#### **步骤4: 在组件中使用**
```typescript
// packages/kit/src/views/NewFeature/
import newFeatureService from '../../services/NewFeatureService';

function NewFeaturePage() {
  const handleProcess = async () => {
    try {
      const result = await newFeatureService.processNewFeature({
        input: 'test',
      });
      // 处理结果
    } catch (error) {
      // 错误处理
    }
  };
}
```

## 全新业务实现思路

### **方案1: 独立业务模块**

#### **目录结构**
```
packages/kit-bg/src/
├── services/
│   ├── ServiceNewBusiness/
│   │   ├── index.ts
│   │   ├── NewBusinessManager.ts
│   │   ├── processors/
│   │   │   ├── ProcessorA.ts
│   │   │   └── ProcessorB.ts
│   │   ├── validators/
│   │   │   └── BusinessValidator.ts
│   │   └── types/
│   │       └── NewBusinessTypes.ts
├── vaults/
│   └── impls/
│       └── newchain/
│           ├── NewChainVault.ts
│           └── utils/
├── dbs/
│   └── local/
│       └── schemas/
│           └── NewBusinessSchema.ts
```

#### **服务实现**
```typescript
// ServiceNewBusiness/index.ts
import { ServiceBase } from '../ServiceBase';
import { NewBusinessManager } from './NewBusinessManager';

class ServiceNewBusiness extends ServiceBase {
  private manager: NewBusinessManager;

  constructor({ backgroundApi }: { backgroundApi: BackgroundApi }) {
    super({ backgroundApi });
    this.manager = new NewBusinessManager({ backgroundApi });
  }

  async createBusiness(params: CreateBusinessParams) {
    return this.manager.create(params);
  }

  async updateBusiness(id: string, params: UpdateBusinessParams) {
    return this.manager.update(id, params);
  }

  async deleteBusiness(id: string) {
    return this.manager.delete(id);
  }
}

export default ServiceNewBusiness;
```

#### **业务管理器**
```typescript
// ServiceNewBusiness/NewBusinessManager.ts
class NewBusinessManager {
  constructor({ backgroundApi }: { backgroundApi: BackgroundApi }) {}

  async create(params: CreateBusinessParams) {
    // 1. 验证参数
    await this.validateParams(params);
    
    // 2. 创建数据库记录
    const record = await this.backgroundApi.simpleDb.addRecord('newBusiness', params);
    
    // 3. 执行业务逻辑
    await this.executeBusinessLogic(record);
    
    return record;
  }

  private async validateParams(params: CreateBusinessParams) {
    // 参数验证逻辑
  }

  private async executeBusinessLogic(record: any) {
    // 业务执行逻辑
  }
}
```

### **方案2: 新区块链集成**

#### **保险库实现**
```typescript
// packages/kit-bg/src/vaults/impls/newchain/NewChainVault.ts
import { VaultBase } from '../VaultBase';

class NewChainVault extends VaultBase {
  async getBalance(address: string) {
    // 获取余额逻辑
  }

  async sendTransaction(params: TransactionParams) {
    // 发送交易逻辑
  }

  async signTransaction(transaction: any, privateKey: string) {
    // 签名逻辑
  }

  async validateAddress(address: string) {
    // 地址验证逻辑
  }
}

export default NewChainVault;
```

#### **注册到工厂**
```typescript
// packages/kit-bg/src/vaults/factory/index.ts
import NewChainVault from '../impls/newchain/NewChainVault';

class VaultFactory {
  static createVault({ networkId, accountId }: CreateVaultParams) {
    switch (networkId) {
      // ... 现有链
      case 'newchain':
        return new NewChainVault({ accountId, networkId });
    }
  }
}
```

### **方案3: 新数据库模式**

#### **数据库 Schema**
```typescript
// packages/kit-bg/src/dbs/local/schemas/NewBusinessSchema.ts
export const NewBusinessSchema = {
  name: 'NewBusiness',
  properties: {
    id: 'string',
    name: 'string',
    data: 'object',
    createdAt: 'date',
    updatedAt: 'date',
  },
  primaryKey: 'id',
};
```

#### **数据库操作**
```typescript
// ServiceNewBusiness/NewBusinessManager.ts
class NewBusinessManager {
  async createRecord(data: any) {
    const db = this.backgroundApi.localDb;
    return db.addRecord('NewBusiness', {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async getRecord(id: string) {
    const db = this.backgroundApi.localDb;
    return db.getRecord('NewBusiness', id);
  }

  async updateRecord(id: string, data: any) {
    const db = this.backgroundApi.localDb;
    return db.updateRecord('NewBusiness', id, {
      ...data,
      updatedAt: new Date(),
    });
  }
}
```

## Keyless 云同步特殊功能

### **Mock Server 功能**
`kit-bg` 包含 Keyless 云同步的 Mock Server 功能：

```typescript
// package.json 中的脚本
{
  "scripts": {
    "keyless:mock-server:build": "tsc -p tsconfig.keyless-mock-server.json",
    "keyless:mock-server:start": "node dist/keyless-cloud-sync-mock-server/keylessCloudSyncMockServer/cli.js"
  }
}
```

### **云同步服务**
```typescript
// ServicePrimeCloudSync.tsx
class ServicePrimeCloudSync extends ServiceBase {
  async syncToCloud(data: any) {
    // 云同步逻辑
  }

  async syncFromCloud() {
    // 从云端同步
  }
}
```

## 最佳实践

### **1. 服务设计原则**
- **单一职责**: 每个服务只负责一个业务领域
- **依赖注入**: 通过 BackgroundApi 注入依赖
- **错误处理**: 统一的错误处理机制
- **类型安全**: 完整的 TypeScript 类型定义

### **2. 数据库操作**
```typescript
// 使用统一的数据库接口
class ServiceExample extends ServiceBase {
  async createData(params: any) {
    const db = this.backgroundApi.localDb;
    try {
      const result = await db.addRecord('TableName', params);
      return result;
    } catch (error) {
      throw new OneKeyError('Failed to create data', { cause: error });
    }
  }
}
```

### **3. 区块链集成**
```typescript
// 使用保险库模式
class ServiceBlockchain extends ServiceBase {
  async createTransaction(params: TransactionParams) {
    const vault = this.backgroundApi.vaultFactory.createVault({
      networkId: params.networkId,
      accountId: params.accountId,
    });
    
    return vault.sendTransaction(params);
  }
}
```

### **4. 状态管理**
```typescript
// 使用 Jotai 状态管理
import { atom } from 'jotai';

export const newFeatureDataAtom = atom(null);
export const newFeatureLoadingAtom = atom(false);

// 在服务中使用
class ServiceNewFeature extends ServiceBase {
  async updateData(data: any) {
    // 更新状态
    await newFeatureDataAtom.set(data);
  }
}
```

## 测试策略

### **1. 单元测试**
```typescript
// ServiceNewFeature.test.ts
import ServiceNewFeature from '../ServiceNewFeature';

describe('ServiceNewFeature', () => {
  let service: ServiceNewFeature;
  let mockBackgroundApi: jest.Mocked<BackgroundApi>;

  beforeEach(() => {
    mockBackgroundApi = createMockBackgroundApi();
    service = new ServiceNewFeature({ backgroundApi: mockBackgroundApi });
  });

  test('should process new feature', async () => {
    const result = await service.processNewFeature({ input: 'test' });
    expect(result).toBeDefined();
  });
});
```

### **2. 集成测试**
```typescript
// BackgroundApi.test.ts
describe('BackgroundApi', () => {
  test('should initialize all services', () => {
    const api = new BackgroundApi();
    expect(api.serviceNewFeature).toBeDefined();
  });
});
```

## 部署和发布

### **1. 构建流程**
```bash
# 构建 kit-bg
yarn workspace @onekeyhq/kit-bg build

# 构建 Mock Server
yarn workspace @onekeyhq/kit-bg keyless:mock-server:build
```

### **2. 开发调试**
```bash
# 启动 Mock Server
yarn workspace @onekeyhq/kit-bg keyless:mock-server:start

# 运行测试
yarn workspace @onekeyhq/kit-bg test
```

## 总结

### **kit-bg 的定位**
- **不是壳**: 是真正的业务核心
- **后台服务**: 提供所有业务逻辑
- **数据层**: 管理所有数据操作
- **区块链层**: 处理所有区块链交互

### **修改思路**
1. **定位服务**: 找到相关的 Service 类
2. **修改逻辑**: 在 Service 中修改或添加方法
3. **更新接口**: 在 BackgroundApi 中注册新方法
4. **前端调用**: 在 kit 中创建对应的调用接口

### **全新业务**
1. **创建服务**: 新建 Service 类
2. **实现逻辑**: 实现业务逻辑和数据操作
3. **注册服务**: 在 BackgroundApi 中注册
4. **前端集成**: 在 kit 中创建调用接口

### **架构优势**
- **模块化**: 清晰的服务分层
- **可扩展**: 易于添加新服务
- **可测试**: 完整的测试覆盖
- **类型安全**: TypeScript 类型保护

通过这种架构，OneKey 实现了前后端分离、业务逻辑集中管理、易于扩展和维护的后台服务系统。
