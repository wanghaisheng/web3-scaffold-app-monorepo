# 服务端数据库架构下的跨端数据同步策略

## 一、架构对比

### OneKey 架构（本地数据库优先）

```
各平台应用
    ↓
本地数据库（IndexedDB/Realm）
    ↓ 加密
云端备份/同步（iCloud/Google Drive/OneKey Cloud）
    ↓
其他设备下载并解密
```

**特点**：
- 数据主要存储在本地
- 云端只作为备份
- 离线可用
- 跨端通过备份/同步

### 当前架构（服务端数据库）

```
各平台应用
    ↓ tRPC
服务端数据库（Cloudflare D1）
    ↓
其他平台通过 tRPC 访问同一数据库
```

**特点**：
- 数据主要存储在服务端
- 所有平台共享同一数据库
- 需要网络连接
- 实时同步

## 二、服务端数据库的跨端同步策略

### 2.1 架构设计

```
┌─────────────────────────────────────────────────────────┐
│                   客户端层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Web      │  │ Mobile   │  │ Desktop  │  │  Ext    │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓ tRPC
┌─────────────────────────────────────────────────────────┐
│                   服务端层                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  tRPC Server (Next.js API / Cloudflare Workers)  │  │
│  │  - 认证中间件 (Better Auth)                      │  │
│  │  - 业务逻辑 (Routers)                            │  │
│  │  - 数据验证 (Zod)                                 │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓ Drizzle ORM
┌─────────────────────────────────────────────────────────┐
│                   数据库层                              │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Cloudflare D1 (SQLite)                        │  │
│  │  - userMeta                                    │  │
│  │  - moments                                     │  │
│  │  - recaps                                      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### 2.2 数据同步机制

#### 自动同步（实时）

**特点**：
- 所有平台共享同一数据库
- 数据变更实时反映到所有平台
- 通过 tRPC 实现类型安全的 API

**实现**：
```typescript
// packages/api/src/router/moments.ts
export const momentsRouter = router({
  // 创建 moment（所有平台立即看到）
  create: protectedProcedure
    .input(z.object({
      text: z.string(),
    }))
    .mutation(async ({ ctx, input }) => {
      const moment = await ctx.db.insert(moments).values({
        userId: ctx.user.userId,
        text: input.text,
        createdAt: new Date(),
      }).returning();
      
      return moment;
    }),
  
  // 获取 moments（所有平台看到相同数据）
  list: protectedProcedure
    .query(async ({ ctx }) => {
      return await ctx.db.select().from(moments)
        .where(eq(moments.userId, ctx.user.userId))
        .orderBy(desc(moments.createdAt));
    }),
});
```

#### 离线支持（可选）

如果需要离线支持，可以添加本地缓存：

```typescript
// packages/shared/src/cache/offlineCache.ts
export class OfflineCache {
  private cache: Map<string, any> = new Map();
  
  // 保存到本地
  async save(key: string, data: any) {
    if (platformEnv.isWeb || platformEnv.isExtension) {
      localStorage.setItem(key, JSON.stringify(data));
    } else if (platformEnv.isNative) {
      await AsyncStorage.setItem(key, JSON.stringify(data));
    }
  }
  
  // 从本地读取
  async get(key: string) {
    if (platformEnv.isWeb || platformEnv.isExtension) {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } else if (platformEnv.isNative) {
      const data = await AsyncStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    }
  }
  
  // 同步到服务器
  async sync(key: string, data: any) {
    try {
      await trpc.moments.create.mutate(data);
      await this.save(key, data);
    } catch (error) {
      // 离线时保存到队列
      await this.addToQueue(key, data);
    }
  }
}
```

## 三、跨端数据一致性保证

### 3.1 数据库 Schema 设计

**文件：`packages/db/src/schema.ts`**

```typescript
export const userMeta = sqliteTable('userMeta', {
  userId: text('userId').primaryKey(),
  email: text('email').notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  timezone: text('timezone').default('America/Los_Angeles').notNull(),
  lastRecapAt: integer({ mode: 'timestamp' }),
  artStyle: text('artStyle').$type<ArtStyle>().default('classical painting').notNull(),
});
```

**设计原则**：
- 使用 `userId` 作为外键
- 添加 `createdAt` 和 `updatedAt` 字段
- 使用 timestamp 类型（便于排序）
- 添加软删除字段（可选）

### 3.2 并发控制

#### 乐观锁

```typescript
export const userMeta = sqliteTable('userMeta', {
  userId: text('userId').primaryKey(),
  email: text('email').notNull(),
  version: integer('version').default(0),  // 版本号
  // ...
});

// 更新时检查版本
export const userRouter = router({
  updateMeta: protectedProcedure
    .input(z.object({
      timezone: z.string().optional(),
      artStyle: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.update(userMeta)
        .set({
          ...input,
          version: sql`${userMeta.version} + 1`,
        })
        .where(and(
          eq(userMeta.userId, ctx.user.userId),
          eq(userMeta.version, input.version),  // 检查版本
        ))
        .returning();
      
      if (!result.length) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Data was modified by another client',
        });
      }
      
      return result[0];
    }),
});
```

#### 悲观锁

```typescript
export const moments = sqliteTable('moments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull(),
  text: text('text').notNull(),
  lockedAt: integer({ mode: 'timestamp' }),  // 锁定时间
  lockedBy: text('lockedBy'),  // 锁定者
  // ...
});

// 编辑前锁定
export const momentsRouter = router({
  lock: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      const result = await ctx.db.update(moments)
        .set({
          lockedAt: new Date(),
          lockedBy: ctx.user.userId,
        })
        .where(and(
          eq(moments.id, input.id),
          isNull(moments.lockedAt),  // 未被锁定
        ))
        .returning();
      
      if (!result.length) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'Moment is locked by another user',
        });
      }
      
      return result[0];
    }),
});
```

### 3.3 数据验证

**使用 Zod 进行输入验证**：

```typescript
export const momentsRouter = router({
  create: protectedProcedure
    .input(z.object({
      text: z.string().min(1).max(1000),
      // 其他验证
    }))
    .mutation(async ({ ctx, input }) => {
      // 输入已验证
      const moment = await ctx.db.insert(moments).values({
        userId: ctx.user.userId,
        text: input.text,
        createdAt: new Date(),
      }).returning();
      
      return moment;
    }),
});
```

## 四、离线支持策略

### 4.1 本地缓存 + 服务端数据库

**架构**：
```
客户端
    ↓
本地缓存（IndexedDB/AsyncStorage）
    ↓ 同步
服务端数据库（Cloudflare D1）
```

**实现**：
```typescript
// packages/shared/src/cache/syncManager.ts
export class SyncManager {
  async syncMoments() {
    if (!navigator.onLine) {
      return; // 离线时不同步
    }
    
    // 1. 获取本地缓存
    const localMoments = await this.getLocalMoments();
    
    // 2. 上传到服务器
    for (const moment of localMoments) {
      if (!moment.synced) {
        try {
          await trpc.moments.create.mutate(moment);
          moment.synced = true;
        } catch (error) {
          console.error('Sync failed:', error);
        }
      }
    }
    
    // 3. 从服务器拉取最新数据
    const serverMoments = await trpc.moments.list.query();
    
    // 4. 更新本地缓存
    await this.updateLocalMoments(serverMoments);
  }
  
  // 监听网络状态
  setupNetworkListener() {
    window.addEventListener('online', () => {
      this.syncMoments();
    });
  }
}
```

### 4.2 冲突解决

**Last-Write-Wins**：
```typescript
export const momentsRouter = router({
  update: protectedProcedure
    .input(z.object({
      id: z.number(),
      text: z.string(),
      updatedAt: z.date(),
    }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.select().from(moments)
        .where(eq(moments.id, input.id))
        .limit(1);
      
      if (!existing.length) {
        throw new TRPCError({ code: 'NOT_FOUND' });
      }
      
      // 比较时间戳，保留最新的
      if (input.updatedAt > existing[0].updatedAt) {
        const result = await ctx.db.update(moments)
          .set({ text: input.text })
          .where(eq(moments.id, input.id))
          .returning();
        return result[0];
      }
      
      return existing[0]; // 返回服务器版本
    }),
});
```

## 五、平台特定优化

### 5.1 Web 平台

**使用 Service Worker 缓存**：
```typescript
// apps/web/src/service-worker.ts
self.addEventListener('fetch', (event) => {
  if (event.request.url.includes('/api/trpc')) {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});
```

### 5.2 Mobile 平台

**使用 React Query 缓存**：
```typescript
// apps/mobile/src/hooks/useMoments.ts
export function useMoments() {
  return useQuery({
    queryKey: ['moments'],
    queryFn: () => trpc.moments.list.query(),
    staleTime: 5 * 60 * 1000, // 5 分钟
    cacheTime: 10 * 60 * 1000, // 10 分钟
  });
}
```

### 5.3 Extension 平台

**使用 chrome.storage.sync**：
```typescript
// apps/ext/src/background/sync.ts
chrome.storage.sync.get(['moments'], (result) => {
  if (result.moments) {
    // 使用缓存的 moments
  }
});
```

## 六、数据迁移策略

### 6.1 Drizzle Migrations

**文件：`packages/db/migrations/`**

```typescript
// 0001_init.ts
import { sql } from 'drizzle-orm';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

export const up = sql`
  CREATE TABLE userMeta (
    userId TEXT PRIMARY KEY NOT NULL,
    email TEXT NOT NULL,
    createdAt INTEGER NOT NULL,
    timezone TEXT DEFAULT 'America/Los_Angeles' NOT NULL,
    lastRecapAt INTEGER,
    artStyle TEXT DEFAULT 'classical painting' NOT NULL
  );
`;

export const down = sql`
  DROP TABLE userMeta;
`;
```

### 6.2 跨平台 Schema 同步

确保所有平台使用相同的 Schema：

```typescript
// packages/db/src/schema.ts - 单一数据源
export const moments = sqliteTable('moments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  text: text('text').notNull(),
});

// 所有平台都从这个文件导入
import { moments } from '@gut-health-pal/db';
```

## 七、监控和调试

### 7.1 数据同步监控

```typescript
// packages/api/src/middleware/syncMonitor.ts
export const syncMonitor = middleware(async ({ ctx, next }) => {
  const startTime = Date.now();
  
  const result = await next();
  
  const duration = Date.now() - startTime;
  
  // 记录同步指标
  if (duration > 1000) {
    console.warn(`Slow sync operation: ${duration}ms`);
  }
  
  return result;
});
```

### 7.2 调试工具

```typescript
// packages/api/src/router/debug.ts
export const debugRouter = router({
  // 查看数据状态
  getDataStatus: protectedProcedure
    .query(async ({ ctx }) => {
      const momentsCount = await ctx.db.select({ count: sql<number>`count(*)` })
        .from(moments);
      
      return {
        momentsCount: momentsCount[0].count,
        lastSync: new Date(),
      };
    }),
  
  // 强制同步
  forceSync: protectedProcedure
    .mutation(async ({ ctx }) => {
      // 触发同步逻辑
      return { success: true };
    }),
});
```

## 八、性能优化

### 8.1 数据库索引

```typescript
export const moments = sqliteTable('moments', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  userId: text('userId').notNull(),
  createdAt: integer({ mode: 'timestamp' }).notNull(),
  text: text('text').notNull(),
}, (table) => ({
  userIdIdx: index('userId_idx').on(table.userId),
  createdAtIdx: index('createdAt_idx').on(table.createdAt),
}));
```

### 8.2 查询优化

```typescript
export const momentsRouter = router({
  list: protectedProcedure
    .input(z.object({
      limit: z.number().max(100).default(20),
      cursor: z.number().optional(),
    }))
    .query(async ({ ctx, input }) => {
      const query = ctx.db.select().from(moments)
        .where(eq(moments.userId, ctx.user.userId))
        .orderBy(desc(moments.createdAt))
        .limit(input.limit);
      
      if (input.cursor) {
        query.where(lt(moments.id, input.cursor));
      }
      
      return await query;
    }),
});
```

### 8.3 缓存策略

```typescript
// 使用 React Query 的缓存
export function useMoments() {
  return useQuery({
    queryKey: ['moments'],
    queryFn: () => trpc.moments.list.query(),
    staleTime: 5 * 60 * 1000, // 5 分钟内使用缓存
  });
}
```

## 九、安全考虑

### 9.1 数据隔离

**确保用户只能访问自己的数据**：
```typescript
export const protectedProcedure = t.procedure
  .use(({ ctx, next }) => {
    if (!ctx.user) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }
    return next();
  })
  .use(({ ctx, next }) => {
    // 在所有查询中自动添加 userId 过滤
    return next({
      ctx: {
        ...ctx,
        // 可以在这里添加额外的上下文
      },
    });
  });
```

### 9.2 数据加密

**敏感数据加密存储**：
```typescript
export const userMeta = sqliteTable('userMeta', {
  userId: text('userId').primaryKey(),
  email: text('email').notNull(),
  // 敏感字段加密
  encryptedData: text('encryptedData'),  // 加密存储
  // ...
});
```

## 十、推荐架构

基于你的当前架构（Drizzle + Cloudflare D1 + tRPC），我推荐：

### 核心架构

```
packages/
├── api/        # tRPC routers（业务逻辑）
├── auth/       # Better Auth 认证
├── db/         # Drizzle ORM + Schema
├── cache/      # 跨平台缓存策略（新增）
└── shared/     # 共享类型和工具
```

### 数据同步策略

1. **主要方式**：服务端数据库（实时同步）
   - 所有平台通过 tRPC 访问同一数据库
   - 数据变更实时反映到所有平台

2. **离线支持**：本地缓存 + 同步队列
   - 使用 IndexedDB/AsyncStorage 缓存数据
   - 网络恢复时自动同步

3. **冲突解决**：Last-Write-Wins
   - 使用时间戳比较
   - 保留最新版本

### 实现步骤

1. **完善 packages/db**
   - 添加索引优化
   - 添加数据验证
   - 完善迁移脚本

2. **添加 packages/cache**
   - 实现跨平台缓存
   - 实现同步队列
   - 实现冲突解决

3. **完善 packages/api**
   - 添加并发控制
   - 添加性能监控
   - 添加调试工具

## 十一、与 OneKey 架构的对比

| 特性 | OneKey（本地数据库） | 当前架构（服务端数据库） |
|------|---------------------|----------------------|
| **数据存储** | 本地优先 | 服务端优先 |
| **跨端同步** | 云备份/同步 | 实时同步 |
| **离线支持** | 完全离线 | 需要实现缓存 |
| **数据一致性** | 手动合并 | 自动同步 |
| **实时性** | 低（需手动同步） | 高（实时） |
| **安全性** | 本地加密 | 传输加密 |
| **适用场景** | 钱包、隐私敏感 | 协作、实时性要求 |

---

> **学习来源**：基于 Drizzle ORM + Cloudflare D1 + tRPC 架构分析
> 
> **核心机制**：服务端数据库 + tRPC 实时同步 + 本地缓存 + 冲突解决
