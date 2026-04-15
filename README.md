<div align="center">

# Web3 Monorepo Scaffold

基于 OneKey monorepo 架构学习的 Web3 多端应用脚手架

A Web3 multi-platform application scaffold based on OneKey monorepo architecture learning

</div>

## 📋 项目概述

本项目旨在学习和复用 OneKey monorepo 的组织架构，为 Web3 领域的业务快速布局提供可复用的脚手架。

**核心目标**：
- 学习 OneKey monorepo 的工程化组织方式
- 提供多端（Web/Mobile/Desktop/Extension）统一开发框架
- 抽象可复用的业务模块和 UI 组件
- 支持快速根据特定业务完成 Web3 领域布局

## 🏗️ 架构概览

### Monorepo 结构

```
app-monorepo-x/
├── apps/                      # 应用层
│   ├── desktop/              # Electron 桌面应用
│   ├── ext/                  # 浏览器扩展
│   ├── mobile/               # React Native 移动应用
│   ├── web/                  # 传统 React SPA
│   ├── web-astro/            # Astro + React Islands
│   ├── web-embed/            # 可嵌入的 Web 组件
│   └── react-native-godot-demo/  # Godot 游戏集成演示
├── packages/                  # 共享包层
│   ├── components/           # UI 组件库
│   ├── core/                 # 区块链核心逻辑
│   ├── kit/                  # 业务逻辑 hooks
│   ├── kit-bg/               # 后台服务
│   ├── qr-wallet-sdk/        # 二维码钱包 SDK
│   └── shared/               # 工具函数和常量
├── development/              # 开发工具和脚本
├── patches/                  # 依赖补丁
└── docs/                     # 文档
```

### 技术栈

| 层级 | 技术 |
|------|------|
| 前端框架 | React 19, React Native 0.81, Astro 4 |
| UI 库 | Tamagui, Tailwind CSS |
| 状态管理 | Jotai, Redux Toolkit |
| 构建工具 | Webpack, RSPack, Metro |
| 包管理 | Yarn 4.x (PnP) |
| 桌面框架 | Electron 39.5.1 |
| 区块链 | viem, ethers, solana-web3.js |

## 🚀 快速开始

### 环境要求

- Node.js >= 22
- Yarn 4.x (通过 Corepack)
- Git LFS

### 安装依赖

```bash
yarn install
```

### 开发命令

```bash
# Web 应用
yarn app:web

# iOS 应用
yarn app:ios

# Android 应用
yarn app:android

# 桌面应用
yarn app:desktop

# 浏览器扩展
yarn app:ext
```

## 📚 文档

### 核心文档

- [应用架构](docs/applications-architecture.md) - 各应用的技术架构详解
- [项目意图](docs/repo-intent.md) - 项目目标和设计意图
- [品牌替换分析](docs/brand-replacement-analysis.md) - OneKey 品牌名替换指南
- [Packages 组织学习](docs/packages-organization-learning.md) - OneKey packages 组织与跨平台复用策略
- [跨平台组件复用](docs/cross-platform-component-reuse.md) - Web 和 App 组件跨平台复用机制

### 业务规划

- [产品策略](docs/product-strategy.md) - 基于 monorepo 的产品策略
- [产品规划](docs/product-planning.md) - 详细的产品规划文档
- [产品矩阵](docs/product-matrix.md) - 产品矩阵与品牌架构
- [项目构思](docs/brainstorm-project.md) - GutHealth DAO 项目构思

### 开发指南

- [iOS App 上架 Checklist](docs/ios-app-submission-checklist.md) - iOS App 首次上架完整清单，避免审核被拒

### 技术专题

- [Bitcoin Ordinals 架构](docs/bitcoin-ordinals-architecture.md) - Bitcoin Ordinals 实现架构
- [Ordinals 合规架构](docs/btc-ordinals-compliant-architecture.md) - 合规的 Ordinals 架构
- [理想 Ordinals 架构](docs/ideal-bitcoin-ordinals-architecture.md) - 理想的 Ordinals 架构设计

### 参考文档

- [OneKey 上游 README](docs/reference/onekey-upstream-README.md) - OneKey 原始 README（参考）
- [Bug 规则](docs/BUG_RULES.md) - 漏洞奖励规则
- [Issue 模板](docs/ISSUE_TEMPLATE.md) - 问题报告模板

## 🎯 设计原则

### 1. 学习导向

本项目以学习 OneKey monorepo 的工程化实践为主要目标，重点关注：
- Monorepo 的组织结构
- 多端代码复用策略
- 模块化设计模式
- 工程化工具链配置

### 2. 可复用性

抽象出可复用的模块和组件，支持快速业务落地：
- 统一的 UI 组件库
- 可配置的业务逻辑模块
- 标准化的开发脚手架
- 完善的文档和示例

### 3. 业务导向

针对 Web3 领域的业务需求，提供：
- 多链钱包基础架构
- DeFi 协议集成模板
- NFT 交易平台框架
- DAO 治理工具

## 🔧 开发指南

### 添加新应用

参考 [应用架构文档](docs/applications-architecture.md) 中的开发工作流：

```bash
# 1. 创建应用脚手架
npx degit template-app apps/new-app

# 2. 安装依赖
yarn install

# 3. 配置环境
cp .env.example .env

# 4. 启动开发服务器
yarn workspace @onekeyhq/<app> dev
```

### 添加新包

```bash
# 在 packages/ 目录下创建新包
mkdir packages/new-package
cd packages/new-package
npm init -y

# 在根 package.json 中注册
# 在 tsconfig.base.json 中添加路径映射
```

## 📝 注意事项

1. **学习性质**：本项目主要用于学习和参考，不建议直接用于生产环境
2. **品牌替换**：如需去除 OneKey 品牌，参考 [品牌替换分析](docs/brand-replacement-analysis.md)
3. **依赖管理**：部分依赖指向 OneKey 的 Git 仓库，需要评估是否需要 fork 维护
4. **硬件钱包**：OneKey 硬件钱包 SDK 无法替换，需要评估是否使用官方方案

## 🤝 贡献

本项目主要用于学习和参考，欢迎提出改进建议。

## 📄 许可证

本项目基于 OneKey 的许可证，具体请参考 [LICENSE.md](LICENSE.md)。

---

> **提示**：本项目基于 [OneKey/app-monorepo](https://github.com/OneKeyHQ/app-monorepo) 学习而来，感谢 OneKey 团队的开源贡献。
