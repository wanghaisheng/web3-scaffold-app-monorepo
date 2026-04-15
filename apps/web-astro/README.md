# OneKey Web (Astro) - 迁移进行中

## 概述
这是 OneKey Web 应用的 Astro 版本，作为轻量级壳子，核心业务逻辑在 `@onekeyhq/kit` 包中。

## 当前进度

### ✅ 已完成
- [x] Astro 项目配置 (`astro.config.mjs`)
- [x] TypeScript 配置 (`tsconfig.json`)
- [x] 基础布局组件 (`src/layouts/Layout.astro`)
- [x] 主页面 (`src/pages/index.astro`)
- [x] 测试页面 (`src/pages/test.astro`)
- [x] PWA 配置 (`public/manifest.json`)
- [x] 常量定义 (`src/utils/constants.ts`)

### 🔄 进行中
- [ ] 依赖安装 (React + Astro 集成)
- [ ] KitProvider 集成测试
- [ ] 开发服务器启动测试

### 📋 待完成
- [ ] React 组件 Islands 实现
- [ ] 路由系统优化
- [ ] 性能监控
- [ ] 构建和部署测试

## 架构

```
apps/web-astro (壳子)
├── src/
│   ├── layouts/Layout.astro      # ✅ 基础布局
│   ├── pages/index.astro         # ✅ 主页面
│   ├── pages/test.astro          # ✅ 测试页面
│   └── utils/constants.ts         # ✅ 常量定义
└── public/                        # ✅ 静态资源

packages/kit (核心逻辑)
├── src/
│   ├── provider/KitProvider.tsx   # 🎯 核心提供者
│   ├── provider/Container/        # 🎯 容器组件
│   └── views/                     # 🎯 页面组件
```

## 开发

### 1. 安装依赖
```bash
yarn install
```

### 2. 启动开发服务器
```bash
yarn dev
```

### 3. 访问页面
- 主页: http://localhost:4321/
- 测试页: http://localhost:4321/test

### 4. 构建生产版本
```bash
yarn build
```

### 5. 预览构建结果
```bash
yarn preview
```

## 迁移策略

### 🎯 核心原则
1. **最小化壳子**: web-astro 只包含 Astro 配置和入口
2. **复用核心逻辑**: 直接使用 `@onekeyhq/kit` 包
3. **渐进式迁移**: 先让基础功能工作，再优化性能
4. **保持兼容**: 确保 React 组件在 Islands 中正常工作

### 📊 性能目标
- **FCP**: < 800ms (vs React SPA ~1500ms)
- **TTI**: < 1200ms (vs React SPA ~2500ms)
- **Bundle Size**: < 200KB (vs React SPA ~800KB)

### 🔧 技术栈
- **Astro 4.0**: 现代静态站点生成器
- **React 18**: UI 框架 (Islands)
- **TypeScript**: 类型安全
- **Tailwind CSS**: 样式框架
- **@onekeyhq/kit**: 核心业务逻辑

## 特点

### ✅ 优势
- **更快的加载**: Astro 服务端渲染
- **更小的包体积**: 只在需要时加载 React
- **更好的 SEO**: 静态 HTML + 最小化 JS
- **相同的业务逻辑**: 完全复用 `packages/kit`
- **现代开发体验**: 热重载 + 快速构建

### ⚠️ 注意事项
- React 组件需要 `client:*` 指令
- 环境变量通过 Astro 配置传递
- 样式需要适配 Astro 的处理方式
- 部署配置需要调整

## 故障排除

### 常见问题

#### 1. TypeScript 错误
```bash
# 重新安装类型定义
yarn install --force
```

#### 2. React 组件不渲染
确保使用 `client:*` 指令：
```astro
<div client:load>
  <MyReactComponent />
</div>
```

#### 3. 样式不生效
检查 Tailwind 配置和 CSS 导入。

#### 4. KitProvider 错误
确保 `@onekeyhq/kit` 包正确安装和配置。

## 下一步

1. **立即**: 安装依赖并启动开发服务器
2. **测试**: 验证 KitProvider 在 Islands 中工作
3. **优化**: 实现 React 组件 Islands
4. **部署**: 测试构建和部署流程

---

*迁移状态: 🚧 进行中*  
*最后更新: 2026-03-22*
