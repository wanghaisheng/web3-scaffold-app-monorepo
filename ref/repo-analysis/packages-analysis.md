# packages 目录分析报告

## 总体结构
`packages` 目录包含6个主要包，总计约 **9,877个文件**，构成了 OneKey 钱包应用的核心架构。

## 各包详细分析

### 1. **@onekeyhq/components** (4,152 items)
**用途**: UI组件库
- **主要功能**: 提供React Native UI组件
- **核心依赖**: React Navigation、Tamagui、SVG处理
- **目录结构**:
  - `primitives/` (1,930 items) - 基础UI组件
  - `composite/` (72 items) - 复合组件
  - `layouts/` (92 items) - 布局组件
  - `forms/` (34 items) - 表单组件
  - `hooks/` (27 items) - React Hooks
  - `svg/` (1,875 items) - SVG图标资源

### 2. **@onekeyhq/core** (380 items)
**用途**: 区块链核心引擎
- **主要功能**: 多链钱包核心逻辑
- **核心依赖**: 支持数十个区块链SDK
- **目录结构**:
  - `chains/` (336 items) - 各区块链实现
  - `secret/` (27 items) - 密钥管理
  - `base/` (4 items) - 基础设施
- **支持的链**: Bitcoin、Ethereum、Solana、Aptos、Cardano、Ton等

### 3. **@onekeyhq/kit** (2,803 items)
**用途**: 应用工具包
- **主要功能**: 业务逻辑和工具函数
- **核心依赖**: 组件库、相机、图表、国际化
- **目录结构**:
  - `src/` (2,728 items) - 主要源码
  - `assets/` (73 items) - 资源文件

### 4. **@onekeyhq/kit-bg** (856 items)
**用途**: 后台服务包
- **主要功能**: 后台处理和云同步
- **核心依赖**: IndexedDB、加密库
- **特色功能**: 
  - Keyless云同步模拟服务器
  - 以太坊URL解析

### 5. **@onekeyhq/qr-wallet-sdk** (18 items)
**用途**: QR钱包SDK
- **主要功能**: 硬件钱包QR码集成
- **核心依赖**: Keystone SDK
- **规模**: 最小化专用包

### 6. **@onekeyhq/shared** (707 items)
**用途**: 共享工具库
- **主要功能**: 通用工具和类型定义
- **核心依赖**: 存储、日志、浏览器扩展
- **特色功能**:
  - 国际化管理 (i18n脚本)
  - Redux持久化
  - 浏览器扩展支持

## 架构特点

1. **模块化设计**: 清晰的职责分离
2. **多链支持**: Core包支持30+区块链
3. **跨平台**: 基于React Native
4. **组件化**: 完整的UI组件体系
5. **国际化**: 内置多语言支持

## 依赖关系
- `kit` → `components`
- 所有包都使用统一的linting和TypeScript配置
- 使用Yarn workspaces管理monorepo

## 技术栈概览

### 前端技术
- React Native + TypeScript
- Tamagui (UI框架)
- React Navigation
- Moti (动画)

### 区块链集成
- Bitcoin.js系列
- Solana Web3.js
- Ethereum Web3
- 各链专用SDK

### 开发工具
- ESLint + TypeScript
- Yarn Workspaces
- SVGR (SVG处理)
- Folderslint (目录结构检查)

---
*生成时间: 2026-03-22*
*分析范围: packages目录及其子目录*
