# OneKey 数据库技术选型：Realm vs SQLite

## 一、实际数据库策略澄清

经过代码分析，OneKey 的实际数据库策略是：

| 平台 | 数据库 | 文件 |
|------|--------|------|
| Web | IndexedDB | `localDbInstance.ts` |
| Extension | IndexedDB | `localDbInstance.ts` |
| Desktop | IndexedDB | `localDbInstance.ts` |
| Mobile (iOS/Android) | Realm | `localDbInstance.native.ts` |

**文件后缀机制**：
```typescript
// packages/kit-bg/src/dbs/local/localDbInstance.ts
import { LocalDbIndexed } from './indexed/LocalDbIndexed';
const localDb: LocalDbBase = new LocalDbIndexed();  // Web/Extension/Desktop

// packages/kit-bg/src/dbs/local/localDbInstance.native.ts
import { LocalDbRealm } from './realm/LocalDbRealm';
const localDb: LocalDbBase = new LocalDbRealm();  // Mobile
```

**结论**：OneKey 并非在 Desktop 上使用 Realm，而是统一使用 IndexedDB。只有 Mobile 端使用 Realm。

## 二、为什么 Mobile 端选择 Realm 而非 SQLite？

### 2.1 Realm 的优势

#### 1. 性能优势

**查询性能**：
```typescript
// SQLite（同步阻塞）
const accounts = db.exec('SELECT * FROM accounts WHERE walletId = ?', [walletId]);
// 需要手动解析结果

// Realm（异步，但查询更快）
const accounts = realm.objects('Account').filtered('walletId == $0', walletId);
// 返回实时查询结果，无需手动解析
```

**批量操作**：
```typescript
// SQLite
db.transaction((tx) => {
  for (let i = 0; i < 1000; i++) {
    tx.executeSql('INSERT INTO accounts ...', [...]);
  }
});

// Realm（更高效）
realm.write(() => {
  for (let i = 0; i < 1000; i++) {
    realm.create('Account', {...});
  }
});
```

#### 2. 开发体验

**类型安全**：
```typescript
// SQLite（无类型安全）
const result = db.exec('SELECT * FROM accounts');
// 需要手动定义类型

// Realm（类型安全）
const accounts = realm.objects<IAccount>('Account');
// 自动推断类型
```

**Schema 定义**：
```typescript
// SQLite（手动创建表）
db.executeSql(`
  CREATE TABLE accounts (
    id INTEGER PRIMARY KEY,
    name TEXT,
    balance REAL
  )
`);

// Realm（Schema 定义）
const AccountSchema = {
  name: 'Account',
  properties: {
    id: 'int',
    name: 'string',
    balance: 'float',
  },
};
```

#### 3. React Native 集成

**SQLite**：
- 需要 `react-native-sqlite-storage` 或 `expo-sqlite`
- 需要手动处理线程同步
- 需要处理数据库文件路径

**Realm**：
- 原生 React Native 支持
- 自动线程同步
- 自动文件管理

```typescript
// SQLite（需要手动处理）
import SQLite from 'react-native-sqlite-storage';
const db = SQLite.open({ name: 'mydb.sqlite' });

// Realm（开箱即用）
import Realm from 'realm';
const realm = await Realm.open({
  path: 'mydb.realm',
  schema: [AccountSchema],
});
```

#### 4. 实时查询

**SQLite**：
- 需要手动监听数据变化
- 需要实现观察者模式

**Realm**：
- 内置实时查询
- 数据变化自动通知
```typescript
// SQLite
const accounts = db.getAllAccounts();
// 手动实现监听

// Realm
const accounts = realm.objects('Account');
// 自动监听变化
accounts.addListener(() => {
  console.log('Accounts changed');
});
```

### 2.2 SQLite 的优势

#### 1. 成熟稳定
- 存在时间更长，生态成熟
- 广泛使用，问题解决资源丰富
- SQL 标准化，跨平台兼容

#### 2. 文件格式简单
- 单一数据库文件
- 易于备份和迁移
- 工具支持丰富

#### 3. 查询灵活性
- SQL 查询语言强大
- 复杂查询更直观
- 聚合查询支持好

#### 4. 文件大小
- 数据库文件通常比 Realm 小
- 适合存储大量数据

### 2.3 OneKey 选择 Realm 的原因

基于代码分析和 Realm 的特性，OneKey 选择 Realm 的原因：

#### 1. React Native 生态

```typescript
// apps/mobile/package.json
{
  "dependencies": {
    "realm": "20.2.0",
    "realm-flipper-plugin-device": "^1.1.0"
  }
}
```

- Realm 对 React Native 有原生支持
- 不需要额外的桥接层
- 性能更好

#### 2. Schema 优先设计

OneKey 使用 TypeScript 和强类型，Realm 的 Schema 定义更符合：

```typescript
// Realm Schema（类型安全）
const AccountSchema = {
  name: 'Account',
  properties: {
    id: 'string',
    name: 'string',
    balance: 'string',
    networkId: 'string',
  },
};

// 自动生成类型
type Account = Realm.Object<AccountSchema>;
```

#### 3. 实时查询需求

钱包应用需要实时更新余额、交易状态等，Realm 的实时查询更方便：

```typescript
// 监听账户变化
const accounts = realm.objects('Account');
accounts.addListener(() => {
  // UI 自动更新
  updateUI();
});
```

#### 4. 历史原因

OneKey 早期选择 Realm 时（2017-2018 年）：
- Realm 对 React Native 的支持比 SQLite 更好
- Realm 的性能优势明显
- Realm 的开发体验更现代

## 三、为什么不使用 SQLite？

### 3.1 SQLite 在 React Native 中的挑战

#### 1. 线程同步问题

```typescript
// SQLite 需要手动处理线程同步
import SQLite from 'react-native-sqlite-storage';

// 在主线程查询
const result = await db.executeSql('SELECT * FROM accounts');

// 在后台线程查询（需要额外配置）
// 需要使用 react-native-quick-sqlite 或其他库
```

#### 2. 类型安全缺失

```typescript
// SQLite 返回类型为 any
const result = await db.executeSql('SELECT * FROM accounts');
const accounts = result.rows.raw as IAccount[];  // 需要手动断言
```

#### 3. Schema 管理复杂

```typescript
// SQLite 需要手动管理 Schema 版本
const migrations = [
  { version: 1, sql: 'CREATE TABLE accounts (...)' },
  { version: 2, sql: 'ALTER TABLE accounts ADD COLUMN ...' },
  // 需要手动执行迁移
];
```

### 3.2 OneKey 的权衡

**选择 Realm 的原因**：
1. React Native 集成更好
2. 类型安全更自然
3. 实时查询更方便
4. Schema 定义更符合 TypeScript
5. 性能在移动端更优

**SQLite 的劣势**：
1. React Native 集成需要额外桥接
2. 类型安全需要手动维护
3. 实时查询需要手动实现
4. Schema 迁移需要手动管理

## 四、Desktop/Web 为什么使用 IndexedDB？

### 4.1 IndexedDB 的优势

#### 1. 浏览器原生支持

- 无需额外依赖
- 性能在浏览器中优化
- 存储容量大（通常 50MB+）

#### 2. 异步 API

```typescript
// IndexedDB（异步）
const db = await idb.open('mydb', 1);
const tx = db.transaction('accounts', 'readwrite');
const store = tx.objectStore('accounts');
await store.add(account);
```

#### 3. 与 Web 技术栈一致

- Web 应用使用 IndexedDB 更自然
- Extension 也支持 IndexedDB
- 与 Service Worker 配合好

### 4.2 为什么 Desktop 不使用 Realm？

虽然 Realm 有 JavaScript SDK，但 OneKey 在 Desktop 使用 IndexedDB 的原因：

1. **统一架构**：Web/Extension/Desktop 使用相同数据库
2. **减少依赖**：不需要额外的 Realm JavaScript SDK
3. **Electron 限制**：Realm JS SDK 在 Electron 中可能有兼容性问题
4. **迁移成本**：从 IndexedDB 迁移到 Realm 成本高

## 五、技术对比总结

| 特性 | SQLite | Realm | IndexedDB |
|------|--------|-------|-----------|
| **React Native 支持** | 需要额外库 | 原生支持 | 不支持 |
| **Web 支持** | 不直接支持 | JS SDK 支持 | 原生支持 |
| **Desktop 支持** | 需要 Node.js binding | JS SDK 支持 | Electron 支持 |
| **类型安全** | 手动维护 | Schema 定义 | 手动维护 |
| **实时查询** | 手动实现 | 内置支持 | 手动实现 |
| **性能** | 好 | 更好（移动端） | 好（Web） |
| **学习曲线** | SQL 知识 | Schema 定义 | 异步 API |
| **文件大小** | 小 | 较大 | 中等 |
| **跨平台** | 最好 | 较好 | Web 最好 |

## 六、脚手架设计建议

### 方案 A：统一使用 IndexedDB（推荐）

**适用场景**：Web、Extension、Desktop 为主，Mobile 为辅

```typescript
// packages/shared/src/db/
├── indexedDbAgent.ts
├── schemas/
│   ├── AccountSchema.ts
│   └── WalletSchema.ts
└── index.ts

// 所有平台统一使用 IndexedDB
```

**优点**：
- 统一架构
- 减少依赖
- 跨平台一致

**缺点**：
- Mobile 端性能可能略差
- 需要手动处理实时查询

### 方案 B：双数据库（OneKey 方案）

**适用场景**：需要针对不同平台优化

```typescript
// packages/shared/src/db/
├── indexedDbAgent.ts    # Web/Extension/Desktop
├── realmAgent.ts        # Mobile
└── index.ts

// 根据平台自动选择
```

**优点**：
- 各平台使用最优数据库
- 性能最大化

**缺点**：
- 架构复杂
- 维护成本高
- 数据迁移复杂

### 方案 C：统一使用 SQLite

**适用场景**：需要跨平台一致性，愿意处理 React Native 集成

```typescript
// packages/shared/src/db/
├── sqliteAgent.ts
├── migrations/
└── index.ts

// 使用 react-native-sqlite-storage
```

**优点**：
- SQL 标准化
- 跨平台一致
- 工具丰富

**缺点**：
- React Native 集成需要额外库
- 类型安全需要手动维护
- 线程同步需要处理

### 方案 D：使用 ORM 抽象层

**适用场景**：希望抽象数据库差异，提供统一接口

```typescript
// packages/shared/src/db/
├── orm/
│   ├── prisma/     # Prisma ORM（支持 SQLite/PostgreSQL）
│   ├── drizzle/     # Drizzle ORM（轻量级）
│   └── kysely/      # Kysely ORM
└── index.ts

// 通过 ORM 统一接口
```

**优点**：
- 类型安全
- 迁移方便
- 支持多种数据库

**缺点**：
- 增加依赖
- 性能有损耗
- 学习成本

## 七、推荐方案

基于 OneKey 的学习，我建议：

### Web/Extension/Desktop 脚手架

**推荐**：IndexedDB

**原因**：
- 浏览器原生支持
- 与 Web 技术栈一致
- 减少依赖
- 足够满足大多数需求

### Mobile 脚手架

**推荐**：Realm

**原因**：
- React Native 原生支持
- 性能优异
- 类型安全
- 实时查询方便

**备选**：SQLite + react-native-sqlite-storage

**原因**：
- 如果需要 SQL 查询能力
- 如果需要更小的文件大小
- 如果团队更熟悉 SQL

### 统一脚手架（跨平台）

**推荐**：双数据库 + 抽象层

```
packages/shared/src/db/
├── indexedDbAgent.ts    # Web/Extension/Desktop
├── realmAgent.ts        # Mobile
├── abstractDbAgent.ts    # 统一接口
└── index.ts             # 自动选择
```

```typescript
// 自动选择
export const getDbAgent = () => {
  if (platformEnv.isNative) {
    return new RealmAgent();
  }
  return new IndexedDbAgent();
};
```

## 八、注意事项

1. **性能测试**：不同数据库在不同平台的性能差异很大，需要实际测试
2. **数据迁移**：如果切换数据库，需要设计迁移策略
3. **类型安全**：无论选择哪种数据库，都要保证类型安全
4. **实时需求**：如果需要实时查询，优先考虑支持实时查询的数据库
5. **团队技能**：考虑团队对不同数据库的熟悉程度

---

> **学习来源**：OneKey/app-monorepo 数据库技术选型分析
> 
> **核心发现**：OneKey 实际使用 IndexedDB（Web/Extension/Desktop）+ Realm（Mobile），而非 Desktop 使用 Realm
