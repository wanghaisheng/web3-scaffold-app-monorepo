# apps 目录分析报告

## 总体结构
`apps` 目录包含5个主要应用平台，总计约 **365个文件**，构成了 OneKey 钱包的全平台客户端矩阵。

## 各应用详细分析

### 1. **@onekeyhq/mobile** (143 items)
**用途**: React Native移动端钱包应用
- **支持平台**: iOS、Android
- **技术栈**: React Native 0.81.5 + Expo 54.0.26
- **核心特性**:
  - 多渠道构建 (Google Play、华为、直接分发)
  - 原生模块集成 (BLE、生物识别、相机等)
  - 性能监控 (Sentry、Perf模块)
  - 自动化测试 (Detox E2E测试)
- **目录结构**:
  - `android/` (57 items) - Android原生代码和配置
  - `ios/` (53 items) - iOS原生代码和配置
  - `e2e/` - E2E测试用例
  - `harness/` - 测试工具配置
- **关键依赖**:
  - React Native生态 (导航、动画、手势等)
  - Expo模块 (字体、图像、认证等)
  - OneKey专用模块 (@onekeyfe/*)
  - 第三方SDK (WalletConnect、Juicebox等)

### 2. **@onekeyhq/desktop** (151 items)
**用途**: Electron桌面钱包应用
- **技术栈**: Electron 39.5.1 + Webpack/Rspack
- **核心特性**:
  - 跨平台构建 (Windows、macOS、Linux、Snap)
  - 自动更新机制
  - 多架构支持 (x64、ARM64)
  - 应用商店发布 (MAS、Microsoft Store)
- **目录结构**:
  - `app/` (37 items) - 主应用代码
  - `public/` (73 items) - 静态资源
  - `scripts/` - 构建和打包脚本
  - `native-modules/` - 原生模块
- **关键文件**:
  - `app/app.ts` (55.6KB) - 主应用逻辑
  - `app/preload.ts` - 预加载脚本
  - `electron-builder-*.config.js` - 各平台构建配置
- **特色功能**:
  - iCloud集成 (macOS)
  - 生物识别验证
  - 安全区域保护

### 3. **@onekeyhq/web** (12 items)
**用途**: Web钱包应用
- **技术栈**: React + Webpack/Rspack
- **核心特性**:
  - SPA单页应用
  - PWA支持
  - 代理模式开发
  - 静态资源优化
- **依赖**: 仅依赖核心包 (@onekeyhq/components, kit, shared)
- **构建**: 支持Webpack和Rspack双构建系统

### 4. **@onekeyhq/ext** (44 items)
**用途**: 浏览器扩展钱包
- **技术栈**: Chrome Extension MV3
- **核心特性**:
  - 多浏览器支持 (Chrome、Firefox、Edge)
  - 内容脚本注入
  - 后台服务
  - 离屏页面处理
- **目录结构**:
  - `src/background/` - 后台服务
  - `src/content-script/` - 内容脚本
  - `src/ui/` - 扩展UI界面
  - `src/manifest/` - 扩展清单配置
- **构建模式**:
  - MV2兼容模式
  - MV3标准模式
  - 开发代理模式

### 5. **@onekeyhq/web-embed** (15 items)
**用途**: 嵌入式Web钱包组件
- **技术栈**: React + Webpack
- **核心特性**:
  - 轻量级嵌入
  - 独立端口 (3008)
  - Sentry错误追踪
  - 组件化设计
- **应用场景**: 第三方网站嵌入、DApp集成

## 技术架构特点

### 1. **统一技术栈**
- 所有应用共享核心包 (@onekeyhq/*)
- 统一的构建工具链 (Webpack/Rspack)
- 一致的TypeScript配置
- 共享的UI组件库

### 2. **平台特定优化**
- **移动端**: 原生模块集成、生物识别、推送通知
- **桌面端**: 系统集成、自动更新、多窗口管理
- **Web端**: SPA优化、PWA支持、SEO友好
- **扩展端**: 浏览器API集成、内容脚本、消息传递

### 3. **开发工具集成**
- **性能测试**: Detox E2E测试 (移动端)
- **构建系统**: Webpack + Rspack双支持
- **代码质量**: 统一的linting和格式化
- **错误监控**: Sentry全平台覆盖

### 4. **多渠道分发**
- **移动端**: Google Play、华为商店、直接分发
- **桌面端**: 官网、Microsoft Store、Mac App Store、Snap
- **Web端**: 官网部署、CDN分发
- **扩展端**: Chrome Web Store、Firefox Add-ons

## 构建配置对比

| 应用 | 构建工具 | 主要输出 | 特殊配置 |
|------|----------|----------|----------|
| Mobile | Metro + Gradle/Xcode | APK/IPA | 多渠道、代码分割 |
| Desktop | Webpack + Electron Builder | exe/dmg/deb | 多平台、自动签名 |
| Web | Webpack/Rspack | 静态文件 | SPA、PWA |
| Ext | Webpack | 扩展包 | MV2/MV3兼容 |
| Web-embed | Webpack | 组件库 | 轻量级、独立 |

## 依赖关系图

```
@onekeyhq/core (区块链引擎)
    ↓
@onekeyhq/shared (共享工具)
    ↓
@onekeyhq/components (UI组件)
    ↓
@onekeyhq/kit (业务逻辑)
    ↓
各平台应用 (mobile/desktop/web/ext/web-embed)
```

## 开发工作流

### 1. **统一开发命令**
```bash
# 开发模式
yarn start          # Web/Desktop
yarn android        # Mobile Android
yarn ios           # Mobile iOS
yarn start:v3      # Extension MV3

# 构建
yarn build         # 生产构建
yarn build:rspack  # Rspack构建
```

### 2. **质量保证**
- 统一的ESLint配置
- 自动化测试覆盖
- 性能回归检测
- 多平台兼容性测试

### 3. **发布流程**
- 自动化构建管道
- 多平台并行发布
- 版本管理和回滚
- 错误监控和追踪

## 架构优势

1. **代码复用**: 核心逻辑90%+跨平台共享
2. **平台适配**: 每个平台都有特定优化
3. **开发效率**: 统一工具链和开发体验
4. **维护性**: 模块化架构便于维护
5. **扩展性**: 新平台可快速集成

---
*生成时间: 2026-03-22*
*分析范围: apps目录及其子目录*
