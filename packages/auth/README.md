# @web3-scaffold/auth

基于 Better Auth 的认证包，为 web3-scaffold 项目提供统一的认证解决方案。

## 特性

- ✅ Better Auth 集成
- ✅ GitHub OAuth 支持
- ✅ Google OAuth 支持
- ✅ Drizzle ORM 集成
- ✅ 配置驱动架构
- ✅ TypeScript 类型安全

## 安装

```bash
pnpm add @web3-scaffold/auth
```

## 配置

### 环境变量

在 `.env` 文件中添加以下环境变量：

```env
AUTH_BASE_URL=http://localhost:3000
AUTH_SECRET=your-secret-key-at-least-32-characters
AUTH_GITHUB_ID=your-github-client-id
AUTH_GITHUB_SECRET=your-github-client-secret
AUTH_GOOGLE_ID=your-google-client-id
AUTH_GOOGLE_SECRET=your-google-client-secret
```

### 数据库 Schema

确保数据库包含以下表：

- `user` - 用户表
- `session` - 会话表
- `account` - OAuth 账户表
- `verification` - 验证表

## 使用

### 服务端

```typescript
import { auth } from '@web3-scaffold/auth'

// 在 Next.js API 路由中
export const { GET, POST } = auth.handler
```

### 客户端

```typescript
import { authClient } from '@web3-scaffold/auth/client'

// 在 React 组件中
export async function AuthButton() {
  const session = await authClient.getSession()
  
  if (!session) {
    return <a href="/auth/sign-in/github">Login with GitHub</a>
  }
  
  return (
    <form action={async () => {
      await authClient.signOut()
    }}>
      <button type="submit">Logout</button>
    </form>
  )
}
```

## 架构

本包遵循 web3-scaffold 的配置驱动架构：

- `@web3-scaffold/db` - 提供数据库连接和 schema
- `@web3-scaffold/env` - 提供环境变量配置
- `@web3-scaffold/utils` - 提供工具函数

## 迁移

本包是从 Lucia Auth 迁移到 Better Auth 的新实现。旧的 Lucia 实现已备份到 `packages/auth-lucia-backup`。

## 文档

- [Better Auth 文档](https://www.better-auth.com)
- [迁移计划](../../openspec/changes/gut-health-pal-intelligent-health-system/design/auth/better-auth-implementation-plan.md)
- [迁移分析](../../openspec/changes/gut-health-pal-intelligent-health-system/design/auth/better-auth-migration-analysis.md)

## 许可证

MIT
