# OneKey 数据库策略与跨端数据同步

## 一、数据库架构总览

OneKey 采用**本地数据库优先 + 云端备份/同步**的策略：

```
┌─────────────────────────────────────────────────────────┐
│                   应用层（各平台）                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Desktop  │  │ Mobile   │  │   Web    │  │  Ext    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              本地数据库（平台特定）                    │
│  ┌──────────────────┐  ┌──────────────────┐          │
│  │ IndexedDB        │  │ Realm            │          │
│  │ (Web/Extension)  │  │ (Mobile/Desktop)  │          │
│  └──────────────────┘  └──────────────────┘          │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              云端备份/同步（跨平台）                    │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│  │ OneKey Cloud │  │ iCloud       │  │ Google Drive │   │
│  └──────────────┘  └──────────────┘  └──────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## 二、本地数据库策略

### 2.1 双数据库方案

**IndexedDB**（Web/Extension）：
- 浏览器原生数据库
- 异步 API
- 存储容量限制（通常 50MB+）
- 适合：Web、Extension

**Realm**（Mobile/Desktop）：
- 移动端和桌面端数据库
- 同步 API
- 更好的性能
- 存储容量大
- 适合：iOS、Android、Electron

### 2.2 数据库抽象层

**文件：`packages/kit-bg/src/dbs/local/LocalDbBase.ts`**

```typescript
export class LocalDbBase {
  // 统一的数据库操作接口
  async getAccount(walletId: string, accountId: string): Promise<IAccount> {
    // 平台特定的实现
  }
  
  async saveAccount(account: IAccount): Promise<void> {
    // 平台特定的实现
  }
  
  async getHistory(params: IHistoryParams): Promise<IHistory[]> {
    // 平台特定的实现
  }
}
```

**IndexedDB 实现**：
```typescript
// packages/kit-bg/src/dbs/local/indexed/IndexedDBAgent.ts
export class IndexedDBAgent extends LocalDbAgentBase implements ILocalDBAgent {
  async withTransaction(bucketName, task) {
    const indexed = this.getIndexedByBucketName(bucketName);
    const tx = indexed.transaction(bucketName, 'readwrite');
    return task(tx);
  }
}
```

**Realm 实现**：
```typescript
// packages/kit-bg/src/dbs/local/realm/LocalDbRealmBase.ts
export class RealmAgent extends LocalDbAgentBase implements ILocalDBAgent {
  async withTransaction(task) {
    const realm = await this.realm;
    realm.write(() => {
      task(realm);
    });
  }
}
```

### 2.3 平台自动选择

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

## 三、数据存储策略

### 3.1 数据分类

**敏感数据**（本地存储，加密）：
- 私钥、助记词
- 密码、PIN 码
- 签名数据

**非敏感数据**（本地存储，可选加密）：
- 账户信息
- 交易历史
- 设置偏好
- 地址簿

**云端数据**（加密同步）：
- 账户列表（不包含私钥）
- 地址簿
- 自定义网络
- 自定义代币
- 市场关注列表
- 浏览器书签

### 3.2 加密策略

**文件：`packages/core/src/secret/`**

```typescript
import { encryptAsync, decryptAsync } from '@onekeyhq/core/src/secret';

// 加密数据
const encrypted = await encryptAsync({
  data: JSON.stringify(sensitiveData),
  password: userPassword,
});

// 解密数据
const decrypted = await decryptAsync({
  encryptedData,
  password: userPassword,
});
```

**加密层次**：
1. **数据加密**：使用用户密码加密敏感数据
2. **传输加密**：HTTPS 加密传输
3. **存储加密**：数据库字段加密存储

## 四、云端备份机制

### 4.1 备份提供者

**文件：`packages/kit-bg/src/services/ServiceCloudBackupV2/backupProviders/`**

```
backupProviders/
├── ICloudBackupProvider.ts          # iCloud 备份（iOS）
├── GoogleDriveBackupProvider.ts    # Google Drive 备份（Android）
├── IOneKeyBackupProvider.ts         # OneKey 云备份（跨平台）
└── EmptyBackupProvider.ts           # 空提供者（无备份）
```

### 4.2 备份流程

**文件：`packages/kit-bg/src/services/ServiceCloudBackupV2/ServiceCloudBackupV2.ts`**

```typescript
@backgroundClass()
class ServiceCloudBackupV2 extends ServiceBase {
  @backgroundMethod()
  async backupToCloud(): Promise<void> {
    // 1. 检查是否支持云备份
    if (!await this.supportCloudBackup()) {
      throw new OneKeyLocalError('Cloud backup not supported');
    }
    
    // 2. 获取所有需要备份的数据
    const backupData = await this.collectBackupData();
    
    // 3. 加密备份数据
    const encryptedData = await encryptAsync({
      data: JSON.stringify(backupData),
      password: this.masterPassword,
    });
    
    // 4. 上传到云端
    const provider = this.getProvider();
    await provider.upload(encryptedData);
    
    // 5. 更新备份状态
    await cloudBackupStatusAtom.set({
      lastBackupTime: Date.now(),
      backupSize: encryptedData.length,
    });
  }
  
  @backgroundMethod()
  async restoreFromCloud(): Promise<void> {
    // 1. 从云端下载
    const provider = this.getProvider();
    const encryptedData = await provider.download();
    
    // 2. 解密数据
    const decryptedData = await decryptAsync({
      encryptedData,
      password: this.masterPassword,
    });
    
    // 3. 恢复到本地数据库
    await this.restoreData(JSON.parse(decryptedData));
  }
}
```

### 4.3 平台特定实现

**iOS（iCloud）**：
```typescript
// OneKeyBackupProvider.ios.ts
export class ICloudBackupProvider implements ICloudBackupProvider {
  async upload(data: string): Promise<void> {
    // 使用 iCloud Documents 目录
    const iCloudContainer = await getICloudContainer();
    await iCloudContainer.writeFile('backup.json', data);
  }
  
  async download(): Promise<string> {
    const iCloudContainer = await getICloudContainer();
    return await iCloudContainer.readFile('backup.json');
  }
}
```

**Android（Google Drive）**：
```typescript
// GoogleDriveBackupProvider.ts
export class GoogleDriveBackupProvider implements ICloudBackupProvider {
  async upload(data: string): Promise<void> {
    const drive = await getGoogleDriveClient();
    await drive.files.create({
      name: 'backup.json',
      mimeType: 'application/json',
      parents: ['appDataFolder'],
    }, { media: { body: data } });
  }
  
  async download(): Promise<string> {
    const drive = await getGoogleDriveClient();
    const file = await drive.files.list({
      q: "name='backup.json' and 'appDataFolder' in parents",
    });
    return await drive.files.get({ fileId: file.data.files[0].id, alt: 'media' });
  }
}
```

**Desktop/Web（OneKey Cloud）**：
```typescript
// OneKeyBackupProvider.ts
export class OneKeyBackupProvider implements ICloudBackupProvider {
  async upload(data: string): Promise<void> {
    const client = await this.getClient();
    await client.post('/backup/upload', {
      encryptedData: data,
      timestamp: Date.now(),
    });
  }
  
  async download(): Promise<string> {
    const client = await this.getClient();
    const response = await client.get('/backup/download');
    return response.data.encryptedData;
  }
}
```

## 五、跨端数据同步（Prime Cloud Sync）

### 5.1 同步架构

**文件：`packages/kit-bg/src/services/ServicePrimeCloudSync/ServicePrimeCloudSync.tsx`**

```typescript
@backgroundClass()
class ServicePrimeCloudSync extends ServiceBase {
  // 同步数据类型
  async syncData(dataType: EPrimeCloudSyncDataType) {
    // 1. 收集本地数据
    const localData = await this.collectLocalData(dataType);
    
    // 2. 上传到服务器
    const uploadResult = await this.uploadToServer(localData);
    
    // 3. 从服务器下载最新数据
    const serverData = await this.downloadFromServer(dataType);
    
    // 4. 合并数据
    const mergedData = await this.mergeData(localData, serverData);
    
    // 5. 更新本地数据库
    await this.updateLocalDatabase(mergedData);
  }
}
```

### 5.2 同步数据类型

**文件：`packages/shared/src/consts/primeConsts.ts`**

```typescript
export enum EPrimeCloudSyncDataType {
  Wallet = 'Wallet',                    // 钱包列表
  Account = 'Account',                  // 账户信息
  AddressBook = 'AddressBook',          // 地址簿
  CustomNetwork = 'CustomNetwork',      // 自定义网络
  CustomToken = 'CustomToken',          // 自定义代币
  MarketWatchList = 'MarketWatchList',  // 市场关注列表
  BrowserBookmark = 'BrowserBookmark',  // 浏览器书签
  IndexedAccount = 'IndexedAccount',    // Indexed 账户
  Lock = 'Lock',                        // 锁屏状态
}
```

### 5.3 同步流程管理器

**文件：`packages/kit-bg/src/services/ServicePrimeCloudSync/CloudSyncFlowManager/`**

每个数据类型都有专门的 Flow Manager：

```typescript
// CloudSyncFlowManagerWallet.ts
export class CloudSyncFlowManagerWallet extends CloudSyncFlowManagerBase {
  async collectLocalData() {
    // 收集本地钱包数据
    const wallets = await localDb.getWallets();
    return this.buildSyncItems(wallets);
  }
  
  async mergeData(localData, serverData) {
    // 合并本地和服务器数据
    return this.mergeWallets(localData, serverData);
  }
  
  async updateLocalDatabase(mergedData) {
    // 更新本地数据库
    await localDb.updateWallets(mergedData);
  }
}
```

### 5.4 同步冲突解决

**策略**：
1. **Last-Write-Wins**：最后修改的数据覆盖
2. **手动合并**：用户选择保留哪个版本
3. **字段级合并**：不同字段分别合并

```typescript
async mergeData(localData, serverData) {
  const merged = {};
  
  for (const key of Object.keys(localData)) {
    const localItem = localData[key];
    const serverItem = serverData[key];
    
    if (!serverItem) {
      // 服务器没有，使用本地
      merged[key] = localItem;
    } else if (!localItem) {
      // 本地没有，使用服务器
      merged[key] = serverItem;
    } else {
      // 都有，比较时间戳
      merged[key] = localItem.updatedAt > serverItem.updatedAt
        ? localItem
        : serverItem;
    }
  }
  
  return merged;
}
```

## 六、数据一致性保证

### 6.1 版本控制

**数据结构**：
```typescript
interface IDBCloudSyncItem {
  id: string;
  dataType: EPrimeCloudSyncDataType;
  data: any;
  version: number;           // 数据版本
  updatedAt: number;        // 更新时间戳
  deviceId: string;         // 设备 ID
  isDeleted: boolean;       // 是否已删除
}
```

### 6.2 同步状态跟踪

**文件：`packages/kit-bg/src/states/jotai/atoms/primeCloudSync.ts`**

```typescript
export const primeCloudSyncPersistAtom = atom({
  key: 'primeCloudSync',
  default: {
    lastSyncTime: 0,
    syncStatus: 'idle',  // idle, syncing, success, error
    conflictCount: 0,
  },
});
```

### 6.3 增量同步

```typescript
async syncIncremental() {
  const lastSyncTime = primeCloudSyncPersistAtom.get().lastSyncTime;
  
  // 只同步变更的数据
  const changedData = await localDb.getChangedDataSince(lastSyncTime);
  
  // 上传变更
  await this.uploadToServer(changedData);
  
  // 下载服务器变更
  const serverChanges = await this.downloadFromServer(lastSyncTime);
  
  // 合并变更
  await this.mergeData(changedData, serverChanges);
  
  // 更新同步时间
  await primeCloudSyncPersistAtom.set({
    lastSyncTime: Date.now(),
  });
}
```

## 七、跨端数据同步策略

### 7.1 同步触发时机

**自动触发**：
- 应用启动时
- 数据变更时（延迟 5 秒）
- 网络恢复时
- 定时（每小时）

**手动触发**：
- 用户点击"同步"按钮
- 切换账号时
- 设置变更时

### 7.2 离线支持

**离线队列**：
```typescript
class SyncQueue {
  private queue: ISyncOperation[] = [];
  
  async addOperation(operation: ISyncOperation) {
    if (navigator.onLine) {
      await this.executeOperation(operation);
    } else {
      this.queue.push(operation);
    }
  }
  
  async processQueue() {
    while (this.queue.length > 0 && navigator.onLine) {
      const operation = this.queue.shift();
      await this.executeOperation(operation);
    }
  }
}
```

### 7.3 设备识别

**设备 ID 生成**：
```typescript
async getDeviceId(): Promise<string> {
  let deviceId = localStorage.getItem('deviceId');
  
  if (!deviceId) {
    deviceId = generateUUID();
    localStorage.setItem('deviceId', deviceId);
  }
  
  return deviceId;
}
```

## 八、数据迁移策略

### 8.1 数据库版本管理

**文件：`packages/kit-bg/src/migrations/`**

```typescript
export class V4ToV5Migration {
  async migrate() {
    // 1. 备份旧数据
    const backup = await this.backupV4Data();
    
    // 2. 转换数据格式
    const converted = await this.convertV4ToV5(backup);
    
    // 3. 写入新数据库
    await this.writeV5Data(converted);
    
    // 4. 验证数据完整性
    await this.validateData(converted);
    
    // 5. 清理旧数据
    await this.cleanupV4Data();
  }
}
```

### 8.2 跨平台迁移

**导出/导入**：
```typescript
// 导出数据
async exportData(password: string): Promise<string> {
  const data = await localDb.exportAll();
  const encrypted = await encryptAsync({
    data: JSON.stringify(data),
    password,
  });
  return encrypted;
}

// 导入数据
async importData(encryptedData: string, password: string): Promise<void> {
  const decrypted = await decryptAsync({
    encryptedData,
    password,
  });
  const data = JSON.parse(decrypted);
  await localDb.importAll(data);
}
```

## 九、脚手架设计建议

### 方案 A：本地数据库 + 云备份（类似 OneKey）

**适用场景**：钱包类应用，强调隐私

```
packages/
├── core/              # 区块链 SDK
├── shared/            # 共享工具
├── kit-bg/            # 本地后端
│   ├── src/dbs/       # 数据库层
│   │   ├── local/     # 本地数据库
│   │   │   ├── indexed/   # IndexedDB
│   │   │   └── realm/     # Realm
│   │   └── simple/    # 简单存储
│   └── src/services/  # 业务服务
│       ├── ServiceCloudBackup.ts    # 云备份
│       └── ServiceCloudSync.ts      # 云同步
└── trpc-server/       # tRPC 服务端（可选）
```

**特点**：
- 本地数据库优先
- 云端备份（加密）
- 跨平台同步（可选）
- 离线可用

### 方案 B：本地数据库 + 服务端数据库（tRPC）

**适用场景**：需要服务端逻辑的应用

```
packages/
├── core/              # 区块链 SDK
├── shared/            # 共享工具
├── kit-bg/            # 本地后端
│   ├── src/dbs/       # 本地数据库（缓存）
│   └── src/services/  # 本地服务
└── trpc-server/       # tRPC 服务端
    ├── prisma/        # 数据库 ORM
    └── routers/       # tRPC routers
```

**特点**：
- 本地数据库作为缓存
- 服务端数据库作为主存储
- tRPC 提供类型安全
- 实时同步

### 方案 C：纯本地数据库（完全离线）

**适用场景**：冷钱包、离线工具

```
packages/
├── core/              # 区块链 SDK
├── shared/            # 共享工具
└── kit-bg/            # 本地后端
    ├── src/dbs/       # 本地数据库
    └── src/services/  # 本地服务
```

**特点**：
- 完全离线
- 手动导出/导入
- 无云端同步
- 最高安全性

## 十、技术选型建议

### 数据库选择

| 平台 | 推荐数据库 | 备选 |
|------|-----------|------|
| Web | IndexedDB | Dexie.js |
| Extension | IndexedDB | Dexie.js |
| iOS | Realm | SQLite |
| Android | Realm | SQLite |
| Desktop | Realm | SQLite |

### 云存储选择

| 场景 | 推荐方案 | 备选 |
|------|---------|------|
| iOS | iCloud | OneKey Cloud |
| Android | Google Drive | OneKey Cloud |
| Desktop/Web | OneKey Cloud | AWS S3 |
| 跨平台 | OneKey Cloud | Dropbox |

### 同步策略

| 需求 | 推荐方案 |
|------|---------|
| 简单备份 | 定期完整备份 |
| 实时同步 | 增量同步 + 冲突解决 |
| 离线支持 | 离线队列 + 网络恢复同步 |
| 多设备 | 设备识别 + Last-Write-Wins |

## 十一、注意事项

1. **安全性**：
   - 敏感数据必须加密
   - 使用强密码和 PBKDF2
   - 定期更换加密密钥

2. **性能**：
   - 增量同步减少数据传输
   - 数据压缩减少存储空间
   - 批量操作减少数据库访问

3. **一致性**：
   - 版本控制避免冲突
   - 冲突解决策略明确
   - 同步状态跟踪

4. **隐私**：
   - 用户明确同意同步
   - 数据最小化原则
   - 符合 GDPR 等法规

5. **容错**：
   - 网络错误重试机制
   - 数据备份和恢复
   - 回滚能力

---

> **学习来源**：OneKey/app-monorepo 数据库策略和跨端同步实现
> 
> **核心机制**：双数据库 + 云备份/同步 + 加密存储 + 冲突解决
