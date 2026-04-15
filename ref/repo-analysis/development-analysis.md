# development 目录分析报告

## 总体结构
`development` 目录包含开发工具链、构建配置、性能测试和脚本工具，总计约 **121个文件**，构成了 OneKey 项目的完整开发基础设施。

## 主要模块分析

### 1. **构建系统** (webpack/ - 19 items)
**用途**: Webpack构建配置
- **核心文件**:
  - `webpack.base.config.js` (13.1KB) - 基础配置，包含React Native到Web的映射
  - `webpack.desktop.config.js` - 桌面应用配置
  - `webpack.ext.config.js` - 浏览器扩展配置
  - `webpack.web.config.js` - Web应用配置
- **特色功能**:
  - 自定义BuildDoneNotifyPlugin构建通知
  - React Native到Web的兼容性映射
  - 平台特定的构建变体

### 2. **性能测试** (perf-ci/ - 40 items)
**用途**: 跨平台性能回归测试
- **支持平台**: iOS、Android、Web、Desktop、Extension
- **核心功能**:
  - Detox自动化测试集成
  - 启动性能监控 (`tokensStartMs`, `tokensSpanMs`, `functionCallCount`)
  - 阈值检测和Slack通知
  - 守护进程模式支持
- **关键脚本**:
  - `run-ios-perf-detox.js` - iOS性能测试
  - `run-android-perf-detox.js` - Android性能测试
  - `run-web-perf.js` - Web性能测试
- **性能服务器**: `performance-server/` 用于收集性能数据

### 3. **开发脚本** (scripts/ - 14 items)
**用途**: 自动化开发任务
- **性能追踪**:
  - `add-rn-startup-performance-tracking.js` - 添加RN启动性能追踪
  - `remove-rn-startup-performance-tracking.js` - 移除性能追踪
- **国际化工具**:
  - `i18n/i18n-add.js` - 添加翻译条目
  - `i18n/i18n-search.js` - 搜索翻译
  - `i18n/build-locale-json-map.js` - 构建语言映射
- **其他工具**:
  - `extract-routes.ts` - 路由提取
  - `clean_workspace.js` - 工作区清理
  - `check-native-changes.sh` - 原生代码变更检查

### 4. **代码质量** (lint/ - 8 items)
**用途**: 代码质量和规范检查
- **ESLint规则**:
  - `eslint-rule-enforce-return-type.js` - 强制返回类型
  - `eslint-rule-force-async-bg-api.js` - 强制异步后台API
- **专项检查**:
  - `font.js` - 字体文件检查
  - `package-versions.js` - 包版本检查
  - `lang.js` - 语言文件检查

### 5. **Rspack配置** (rspack/ - 9 items)
**用途**: Rspack构建工具配置
- **功能**: 提供更快的构建替代方案
- **配置**: 针对不同平台的Rspack配置文件

### 6. **模块解析** (module-resolver/ - 4 items)
**用途**: 模块解析工具
- **功能**: 处理平台特定的模块导入和解析

### 7. **Babel插件** (babel-plugins/ - 1 items)
**用途**: 自定义Babel转换插件

## 核心配置文件

### 环境配置
- `env.js` - 环境变量加载，支持多层级.env文件
- `envExposedToClient.js` - 客户端暴露的环境变量
- `developmentConsts.js` - 开发常量定义

### 构建工具
- `babelTools.js` - Babel工具配置
- `patch-fix.js` - 补丁修复工具
- `resetCache.js` - 缓存重置工具

### 调试工具
- `debug-hardware-sdk.js` - 硬件SDK调试
- `statImgSize.js` - 图片大小统计

## 技术特点

### 1. **多平台支持**
- React Native (iOS/Android)
- Web (React Native Web)
- Desktop (Electron)
- Browser Extension (MV3)

### 2. **性能监控体系**
- 启动性能追踪
- CI性能回归检测
- 实时性能服务器
- 阈值告警机制

### 3. **开发工具链**
- Webpack + Rspack双构建系统
- 自定义ESLint规则
- 自动化脚本工具
- 国际化管理

### 4. **代码质量保证**
- 多层次代码检查
- 字体和资源验证
- 包版本管理
- 原生代码变更检测

## 开发流程集成

### 构建命令
```bash
# 性能测试
yarn perf:ios:release
yarn perf:android:release
yarn perf:web:release

# 构建通知
# 自动触发build完成通知
```

### 环境管理
```bash
# 多层级环境配置
.env.version -> .env.expo -> .env
```

### 质量检查
```bash
# 代码质量检查
yarn lint
yarn lint:fix
```

## 架构优势

1. **完整性**: 覆盖开发、构建、测试、部署全流程
2. **自动化**: 大量自动化脚本减少人工操作
3. **性能优先**: 内置性能监控和回归检测
4. **跨平台**: 统一工具链支持多平台开发
5. **可扩展**: 模块化设计便于添加新工具

---
*生成时间: 2026-03-22*
*分析范围: development目录及其子目录*
