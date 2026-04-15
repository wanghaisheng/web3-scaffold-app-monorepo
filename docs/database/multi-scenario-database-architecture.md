# 基于 Drizzle ORM 的多场景数据库架构设计

## 一、当前架构分析

### 1.1 现有能力

**文件：`packages/db/src/client.ts`**

```typescript
// 服务端数据库（Cloudflare D1）
export function getDB(env: { DB: D1Database }): DrizzleDB {
  return drizzle(env.DB, { schema }) as DrizzleDB;
}
```

**文件：`packages/db/src/client-local.ts`**

```typescript
// 本地数据库（SQLite）
export function getLocalDB(dbPath: string = "./local-test.db"): LocalDB {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}

// 内存数据库
export function getMemoryDB(): LocalDB {
  const sqlite = new Database(':memory:');
  return drizzle(sqlite, { schema });
}
```

**当前支持**：
- ✅ Cloudflare D1（服务端 SQLite）
- ✅ 本地 SQLite 文件
- ✅ 内存 SQLite
- ✅ 统一的 Schema 定义
- ✅ 统一的 Drizzle ORM 接口

### 1.2 架构扩展

基于现有能力，可以扩展为多场景架构：

```
packages/db/
├── src/
│   ├── schema.ts              # 统一 Schema 定义
│   ├── client.ts              # 服务端客户端
│   ├── client-local.ts        # 本地客户端
│   ├── client-hybrid.ts       # 混合客户端（新增）
│   ├── sync.ts                # 同步逻辑（新增）
│   └── encryption.ts          # 加密工具（新增）
```

## 二、三大场景架构设计

### 场景 A：本地数据库 + 云备份（钱包）

#### 2.1 架构设计

```
各平台应用
    ↓
本地数据库（SQLite）
    ↓ 加密
云端备份（加密存储）
    ↓
其他设备下载并解密
```

#### 2.2 Drizzle 实现

**文件：`packages/db/src/client-wallet.ts`**

```typescript
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { encryptAsync, decryptAsync } from '@onekeyhq/core/src/secret';

export type WalletDB = ReturnType<typeof drizzle<typeof schema>>;

export function getWalletDB(dbPath: string): WalletDB {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}

// 加密数据
export async function encryptData(data: any, password: string): Promise<string> {
  return await encryptAsync({
    data: JSON.stringify(data),
    password,
  });
}

// 解密数据
export async function decryptData(encryptedData: string, password: string): Promise<any> {
  const decrypted = await decryptAsync({
    encryptedData,
    password,
  });
  return JSON.parse(decrypted);
}
```

**文件：`packages/db/src/sync/cloudBackup.ts`**

```typescript
import { getWalletDB } from '../client-wallet';

export class CloudBackup {
  async backup(dbPath: string, password: string): Promise<string> {
    const db = getWalletDB(dbPath);
    
    // 1. 导出所有数据
    const accounts = await db.select().from(schema.accounts);
    const wallets = await db.select().from(schema.wallets);
    
    const data = {
      accounts,
      wallets,
      timestamp: Date.now(),
    };
    
    // 2. 加密
    return await encryptData(data, password);
  }
  
  async restore(encryptedData: string, dbPath: string, password: string): Promise<void> {
    const db = getWalletDB(dbPath);
    
    // 1. 解密
    const data = await decryptData(encryptedData, password);
    
    // 2. 恢复数据
    await db.insert(schema.accounts).values(data.accounts);
    await db.insert(schema.wallets).values(data.wallets);
  }
}
```

#### 2.3 平台实现

**Web/Extension**：
```typescript
// 使用 IndexedDB 作为本地数据库
import { getWalletDB } from '@gut-health-pal/db/client-wallet';

// 实际上 Web/Extension 可能需要使用 IndexedDB 而非 SQLite
// 可以创建一个 IndexedDB 适配器
```

**Mobile**：
```typescript
import { getWalletDB } from '@gut-health-pal/db/client-wallet';
import RNFS from 'react-native-fs';

const dbPath = `${RNFS.DocumentDirectoryPath}/wallet.db`;
const db = getWalletDB(dbPath);
```

**Desktop**：
```typescript
import { getWalletDB } from '@gut-health-pal/db/client-wallet';
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'wallet.db');
const db = getWalletDB(dbPath);
```

### 场景 B：本地数据库 + 服务端数据库（DApp）

#### 2.4 架构设计

```
各平台应用
    ↓
本地数据库（缓存）
    ↓ 同步
服务端数据库（主存储）
    ↓
其他平台同步
```

#### 2.5 Drizzle 实现

**文件：`packages/db/src/client-hybrid.ts`**

```typescript
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";

export type HybridDB = ReturnType<typeof drizzle<typeof schema>>;

export class HybridDB {
  localDB: HybridDB;
  serverDB?: HybridDB;
  
  constructor(localDbPath: string, serverDB?: HybridDB) {
    const sqlite = new Database(localDbPath);
    this.localDB = drizzle(sqlite, { schema });
    this.serverDB = serverDB;
  }
  
  // 优先从本地读取
  async get(table: string, id: string) {
    try {
      const local = await this.localDB.select().from(schema[table])
        .where(eq(schema[table].id, id))
        .limit(1);
      
      if (local.length) {
        return local[0];
      }
    } catch (error) {
      console.warn('Local read failed:', error);
    }
    
    // 本地没有，从服务器读取
    if (this.serverDB) {
      const server = await this.serverDB.select().from(schema[table])
        .where(eq(schema[table].id, id))
        .limit(1);
      
      if (server.length) {
        // 缓存到本地
        await this.localDB.insert(schema[table]).values(server[0]);
        return server[0];
      }
    }
    
    return null;
  }
  
  // 写入本地和服务器
  async set(table: string, data: any) {
    // 先写入本地
    await this.localDB.insert(schema[table]).values(data);
    
    // 异步同步到服务器
    if (this.serverDB && navigator.onLine) {
      try {
        await this.serverDB.insert(schema[table]).values(data);
      } catch (error) {
        console.warn('Server sync failed:', error);
        // 添加到同步队列
        await this.addToSyncQueue({ type: 'insert', table, data });
      }
    } else if (!navigator.onLine) {
      // 离线时添加到同步队列
      await this.addToSyncQueue({ type: 'insert', table, data });
    }
  }
  
  private async addToSyncQueue(operation: any) {
    // 实现同步队列逻辑
  }
}
```

**文件：`packages/db/src/sync/hybridSync.ts`**

```typescript
export class HybridSync {
  async sync(localDB: HybridDB, serverDB: HybridDB) {
    // 1. 获取本地未同步的数据
    const unsynced = await localDB.select().from(schema.syncQueue);
    
    // 2. 同步到服务器
    for (const item of unsynced) {
      try {
        if (item.type === 'insert') {
          await serverDB.insert(schema[item.table]).values(item.data);
        } else if (item.type === 'update') {
          await serverDB.update(schema[item.table])
            .set(item.data)
            .where(eq(schema[item.table].id, item.id));
        }
        
        // 标记为已同步
        await localDB.delete(schema.syncQueue)
          .where(eq(schema.syncQueue.id, item.id));
      } catch (error) {
        console.warn('Sync failed:', error);
      }
    }
    
    // 3. 从服务器拉取最新数据
    const serverData = await serverDB.select().from(schema.moments);
    
    // 4. 合并到本地
    for (const item of serverData) {
      const local = await localDB.select().from(schema.moments)
        .where(eq(schema.moments.id, item.id))
        .limit(1);
      
      if (!local.length) {
        await localDB.insert(schema.moments).values(item);
      } else if (item.updatedAt > local[0].updatedAt) {
        await localDB.update(schema.moments)
          .set(item)
          .where(eq(schema.moments.id, item.id));
      }
    }
  }
}
```

#### 2.6 Schema 扩展

**添加同步相关字段**：

```typescript
// packages/db/src/schema.ts
export const syncQueue = sqliteTable('syncQueue', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  type: text('type').notNull(),  // 'insert', 'update', 'delete'
  table: text('table').notNull(),
  data: text('data').notNull(),  // JSON string
  createdAt: integer({ mode: 'timestamp' }).notNull(),
});

export const moments = sqliteTable('moments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull(),
  text: text('text').notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  updatedAt: integer({ mode: 'timestamp' }).notNull(),  // 新增
  syncedAt: integer({ mode: 'timestamp' }),  // 新增
});
```

### 场景 C：纯本地数据库（冷钱包）

#### 2.7 架构设计

```
各平台应用
    ↓
本地数据库（SQLite）
    ↓
手动导出/导入（加密文件）
    ↓
其他设备导入
```

#### 2.8 Drizzle 实现

**文件：`packages/db/src/client-cold.ts`**

```typescript
import * as schema from "./schema";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { encryptAsync, decryptAsync } from '@onekeyhq/core/src/secret';

export type ColdDB = ReturnType<typeof drizzle<typeof schema>>;

export function getColdDB(dbPath: string): ColdDB {
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}

// 导出加密数据
export async function exportEncrypted(dbPath: string, password: string): Promise<string> {
  const db = getColdDB(dbPath);
  
  // 1. 导出所有数据
  const data = await db.select().from(schema.accounts);
  
  // 2. 加密
  return await encryptData({ data, timestamp: Date.now() }, password);
}

// 导入加密数据
export async function importEncrypted(
  encryptedData: string,
  dbPath: string,
  password: string
): Promise<void> {
  const db = getColdDB(dbPath);
  
  // 1. 解密
  const { data } = await decryptData(encryptedData, password);
  
  // 2. 导入数据
  await db.insert(schema.accounts).values(data);
}
```

#### 2.9 平台实现

**Mobile**：
```typescript
import { getColdDB, exportEncrypted, importEncrypted } from '@gut-health-pal/db/client-cold';
import RNFS from 'react-native-fs';
import Share from 'react-native-share';

const dbPath = `${RNFS.DocumentDirectoryPath}/cold-wallet.db`;

// 导出
const encrypted = await exportEncrypted(dbPath, userPassword);
const filePath = `${RNFS.TemporaryDirectoryPath}/backup.enc`;
await RNFS.writeFile(filePath, encrypted, 'base64');

// 分享文件
await Share.open({ url: `file://${filePath}` });

// 导入
const encryptedData = await RNFS.readFile(filePath, 'base64');
await importEncrypted(encryptedData, dbPath, userPassword);
```

**Desktop**：
```typescript
import { getColdDB, exportEncrypted, importEncrypted } from '@gut-health-pal/db/client-cold';
import { dialog, BrowserWindow } from 'electron';

const dbPath = path.join(app.getPath('userData'), 'cold-wallet.db');

// 导出
const encrypted = await exportEncrypted(dbPath, userPassword);
const { filePath } = await dialog.showSaveDialog({
  defaultPath: 'backup.enc',
});
if (filePath) {
  await fs.writeFile(filePath, encrypted);
}

// 导入
const { filePath } = await dialog.showOpenDialog();
if (filePath) {
  const encryptedData = await fs.readFile(filePath, 'utf8');
  await importEncrypted(encryptedData, dbPath, userPassword);
}
```

## 三、统一接口设计

### 3.1 抽象层

**文件：`packages/db/src/index.ts`**

```typescript
export * from './schema';
export * from './client';
export * from './client-local';
export * from './client-wallet';
export * from './client-hybrid';
export * from './client-cold';

// 统一接口
export interface DBClient {
  select(): any;
  insert(): any;
  update(): any;
  delete(): any;
}

export function getDBClient(scenario: 'wallet' | 'dapp' | 'cold', config: any): DBClient {
  switch (scenario) {
    case 'wallet':
      return getWalletDB(config.dbPath);
    case 'dapp':
      return new HybridDB(config.localDbPath, config.serverDB);
    case 'cold':
      return getColdDB(config.dbPath);
    default:
      throw new Error('Unknown scenario');
  }
}
```

### 3.2 Schema 扩展

**统一 Schema 支持所有场景**：

```typescript
// packages/db/src/schema.ts
// 基础 Schema（所有场景通用）
export const accounts = sqliteTable('accounts', {
  id: text('id').primaryKey(),
  userId: text('userId').notNull(),
  name: text('name').notNull(),
  // ...
});

// 场景特定 Schema
export const syncQueue = sqliteTable('syncQueue', {
  // 仅用于 DApp 场景
});

export const encryptionMeta = sqliteTable('encryptionMeta', {
  // 仅用于钱包/冷钱包场景
});
```

## 四、平台特定实现

### 4.1 Web/Extension

**本地存储选择**：
```typescript
// Web/Extension 使用 IndexedDB
import { getDBClient } from '@gut-health-pal/db';

if (scenario === 'wallet' || scenario === 'cold') {
  // 使用 IndexedDB 适配器
  return getIndexedDBClient();
} else if (scenario === 'dapp') {
  // 使用 IndexedDB + 服务端
  return new HybridDB(indexedDB, serverDB);
}
```

### 4.2 Mobile

**本地存储选择**：
```typescript
import RNFS from 'react-native-fs';

const dbPath = `${RNFS.DocumentDirectoryPath}/data.db`;

if (scenario === 'wallet' || scenario === 'cold') {
  // 使用 SQLite
  return getWalletDB(dbPath);
} else if (scenario === 'dapp') {
  // 使用 SQLite + 服务端
  return new HybridDB(dbPath, serverDB);
}
```

### 4.3 Desktop

**本地存储选择**：
```typescript
import path from 'path';

const dbPath = path.join(app.getPath('userData'), 'data.db');

if (scenario === 'wallet' || scenario === 'cold') {
  // 使用 SQLite
  return getWalletDB(dbPath);
} else if (scenario === 'dapp') {
  // 使用 SQLite + 服务端
  return new HybridDB(dbPath, serverDB);
}
```

## 五、配置管理

### 5.1 场景配置

**文件：`packages/db/src/config.ts`**

```typescript
export type Scenario = 'wallet' | 'dapp' | 'cold';

export interface DBConfig {
  scenario: Scenario;
  localDbPath?: string;
  serverDB?: any;
  encryptionPassword?: string;
}

export function getDBConfig(scenario: Scenario): DBConfig {
  switch (scenario) {
    case 'wallet':
      return {
        scenario: 'wallet',
        localDbPath: getWalletDBPath(),
      };
    case 'dapp':
      return {
        scenario: 'dapp',
        localDbPath: getDAppDBPath(),
        serverDB: getServerDB(),
      };
    case 'cold':
      return {
        scenario: 'cold',
        localDbPath: getColdDBPath(),
      };
  }
}

function getWalletDBPath() {
  if (platformEnv.isNative) {
    return `${RNFS.DocumentDirectoryPath}/wallet.db`;
  } else if (platformEnv.isDesktop) {
    return path.join(app.getPath('userData'), 'wallet.db');
  } else {
    return 'wallet.db';  // IndexedDB
  }
}

function getDAppDBPath() {
  // 类似逻辑
}

function getColdDBPath() {
  // 类似逻辑
}

function getServerDB() {
  // 返回服务端数据库客户端
  return getDB({ DB: env.DB });
}
```

## 六、迁移策略

### 6.1 场景间迁移

**钱包 → DApp**：
```typescript
export async function migrateWalletToDApp(walletDbPath: string, dAppConfig: DBConfig) {
  // 1. 从钱包数据库导出数据
  const walletDB = getWalletDB(walletDbPath);
  const data = await walletDB.select().from(schema.accounts);
  
  // 2. 导入到 DApp 数据库
  const dAppDB = new HybridDB(dAppConfig.localDbPath, dAppConfig.serverDB);
  await dAppDB.insert(schema.accounts).values(data);
  
  // 3. 同步到服务器
  await dAppDB.sync();
}
```

**DApp → 冷钱包**：
```typescript
export async function migrateDAppToCold(dAppDBPath: string, coldDbPath: string, password: string) {
  // 1. 从 DApp 数据库导出数据
  const dAppDB = new HybridDB(dAppDBPath, dAppConfig.serverDB);
  const data = await dAppDB.select().from(schema.accounts);
  
  // 2. 加密并导入到冷钱包
  const coldDB = getColdDB(coldDbPath);
  const encrypted = await encryptData(data, password);
  
  // 3. 存储加密文件
  await fs.writeFile('backup.enc', encrypted);
}
```

## 七、推荐架构

### 7.1 包结构

```
packages/db/
├── src/
│   ├── schema.ts              # 统一 Schema 定义
│   ├── client.ts              # 服务端客户端
│   ├── client-local.ts        # 本地 SQLite 客户端
│   ├── client-wallet.ts       # 钱包场景客户端
│   ├── client-hybrid.ts       # DApp 混合客户端
│   ├── client-cold.ts         # 冷钱包客户端
│   ├── sync/
│   │   ├── cloudBackup.ts      # 云备份逻辑
│   │   ├── hybridSync.ts       # 混合同步逻辑
│   │   └── encryption.ts       # 加密工具
│   ├── config.ts              # 场景配置
│   └── index.ts               # 统一接口
├── migrations/                 # 数据库迁移
└── package.json
```

### 7.2 使用示例

```typescript
import { getDBClient, DBConfig, Scenario } from '@gut-health-pal/db';

// 场景 A：钱包
const walletConfig: DBConfig = {
  scenario: 'wallet',
  localDbPath: './wallet.db',
};
const walletDB = getDBClient('wallet', walletConfig);

// 场景 B：DApp
const dAppConfig: DBConfig = {
  scenario: 'dapp',
  localDbPath: './cache.db',
  serverDB: getServerDB(),
};
const dAppDB = getDBClient('dapp', dAppConfig);

// 场景 C：冷钱包
const coldConfig: DBConfig = {
  scenario: 'cold',
  localDbPath: './cold.db',
};
const coldDB = getDBClient('cold', coldConfig);
```

## 八、实施建议

### 8.1 阶段 1：基础设施

1. 扩展 `packages/db` 支持三种场景
2. 实现统一的 Schema 定义
3. 实现加密/解密工具
4. 实现同步逻辑

### 8.2 阶段 2：场景实现

1. 实现场景 A（钱包）的云备份
2. 实现场景 B（DApp）的混合同步
3. 实现场景 C（冷钱包）的导出/导入

### 8.3 阶段 3：平台适配

1. Web/Extension 适配（IndexedDB）
2. Mobile 适配（SQLite）
3. Desktop 适配（SQLite）

### 8.4 阶段 4：测试和文档

1. 为每个场景编写测试
2. 编写迁移工具
3. 完善文档

## 九、注意事项

1. **数据安全**：
   - 钱包/冷钱包场景必须加密
   - 使用强密码和 PBKDF2
   - 定期更换加密密钥

2. **性能考虑**：
   - 本地数据库使用索引
   - 批量操作优化
   - 同步频率控制

3. **兼容性**：
   - 确保所有平台使用相同 Schema
   - 数据迁移策略
   - 版本兼容

4. **用户体验**：
   - 场景切换提示
   - 数据迁移提示
   - 错误处理

---

> **学习来源**：基于 Drizzle ORM 架构的多场景数据库设计
> 
> **核心机制**：统一 Schema + 场景特定客户端 + 同步策略 + 加密工具
