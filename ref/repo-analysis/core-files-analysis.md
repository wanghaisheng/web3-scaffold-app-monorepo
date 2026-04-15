# 核心配置文件分析报告

## 概述
本报告分析 OneKey 项目三个核心配置文件，揭示项目架构、开发规范和技术栈配置。

## 文件分析

### 1. **INITIAL.md** - 功能开发模板
**用途**: 新功能开发的标准模板和检查清单

**内容结构**:
```markdown
## FEATURE: [功能描述]
## EXAMPLES: [示例说明]  
## DOCUMENTATION: [参考资料]
## OTHER CONSIDERATIONS: [其他考虑]
```

**作用**:
- 提供标准化的功能开发流程
- 确保开发思路的完整性
- 促进代码质量和文档规范
- 减少开发过程中的遗漏

**使用场景**:
- 新功能开发前的规划
- 代码审查的参考标准
- 团队协作的沟通基础

### 2. **CLAUDE.md** - AI开发助手指南
**用途**: 为 Claude Code AI 提供项目特定的开发指导和规范

**核心内容**:

#### 项目概览
- **架构**: Monorepo + Yarn Workspaces
- **平台**: Desktop, Mobile, Web, Extension
- **技术栈**: TypeScript + React/React Native
- **分支**: 主分支为 `x` (非 master/main)

#### 关键约束 - ULTRATHINK 模式
**触发条件**:
- 架构变更
- 跨平台代码修改
- 密码学/安全组件
- 核心包修改
- 硬件钱包集成

**分析框架**:
1. 依赖影响分析
2. 平台兼容性检查
3. 安全风险评估
4. 性能影响评估
5. 用户体验影响

#### 严格的导入层次规则
```
@onekeyhq/shared (最底层)
    ↓
@onekeyhq/components
    ↓  
@onekeyhq/kit-bg
    ↓
@onekeyhq/kit
    ↓
Apps (最上层)
```

**绝对禁止**:
- 循环依赖
- 跨层次导入
- 违反导入顺序

#### 安全要求 - 绝对规则
**禁止操作**:
- ❌ 提交敏感信息
- ❌ 日志记录敏感数据
- ❌ 暴露私钥或助记词
- ❌ 绕过安全验证
- ❌ 修改加密函数

**强制实践**:
- ✅ 硬件钱包通信隔离
- ✅ AES-256 本地存储加密
- ✅ 交易验证和风险检测
- ✅ 内容安全策略维护
- ✅ 用户输入验证和清理

#### 受限模式
- ❌ `toLocaleLowerCase()` → 使用 `toLowerCase()`
- ❌ 直接导入 `@onekeyfe/hd-core` → 使用 `CoreSDKLoader`
- ❌ 直接导入 `localDbInstance` → 使用 `localDb`
- ❌ 修改自动生成文件
- ❌ 绕过 TypeScript 类型
- ❌ 加密操作使用 `JSON.stringify()` → 使用 `stringUtils.stableStringify()`

#### Git 工作流
- **主分支**: `x`
- **提交格式**: `type: short description`
- **禁止**: AI 工具署名、合并提交修改
- **要求**: 干净的 Git 历史

#### 关键命令
```bash
yarn app:desktop    # 桌面开发
yarn app:web        # Web开发
yarn app:ext        # 扩展开发
yarn app:ios        # iOS开发
yarn app:android    # Android开发
yarn lint:staged    # 提交前检查
yarn tsc:staged     # 类型检查
yarn test           # 运行测试
```

### 3. **package.json** - 项目配置中心
**用途**: 定义整个 monorepo 的依赖、脚本和配置

**基本信息**:
- **名称**: @onekeyhq/app-monorepo
- **包管理器**: Yarn 4.12.0
- **Node版本**: >=22
- **工作区**: apps/*, packages/*

#### 脚本命令分类

**应用开发**:
```bash
# 桌面应用
app:desktop, app:desktop:rspack, app:desktop:build

# Web应用  
app:web, app:web:rspack, app:web:build

# 扩展应用
app:ext, app:ext:rspack, app:ext:build

# 移动应用
app:ios, app:android, app:native-bundle

# 嵌入式Web
app:web-embed, app:web-embed:build
```

**性能测试**:
```bash
perf:server                    # 性能服务器
perf:ios:debug/release        # iOS性能测试
perf:android:debug/release     # Android性能测试
perf:web:release              # Web性能测试
perf:desktop:release          # 桌面性能测试
perf:ext:release              # 扩展性能测试
```

**代码质量**:
```bash
lint:project                  # 项目完整检查
lint, eslint                  # 代码检查
oxlint                        # 快速检查
lint:staged                   # 暂存文件检查
tsc:only, tsc:staged         # TypeScript检查
```

**工具链**:
```bash
clean, clean:cache            # 清理构建
patch:fix                     # 补丁修复
i18n:pull/add/search         # 国际化
icon:build                   # 图标构建
```

#### 依赖分析

**生产依赖** (208个):
- **区块链**: @alephium/web3, @solana/web3.js, @mysten/sui, viem
- **UI框架**: React 19.1.0, Tamagui 1.108.0
- **状态管理**: Jotai 2.5.0
- **工具库**: ethersV6, bignumber.js, walletconnect
- **OneKey专用**: @onekeyfe/* 系列 (硬件钱包SDK)
- **监控**: Sentry 8.42.0

**开发依赖** (128个):
- **构建工具**: Webpack 5.90.3, Rspack 1.7.1, Metro 0.83.2
- **代码质量**: ESLint, Prettier, Oxlint
- **测试**: Jest, Playwright, Testing Library
- **TypeScript**: 5.9.3 + 相关插件
- **Babel**: 完整的 Babel 生态

#### 版本解析 (resolutions)
**关键版本锁定**:
- React 19.1.0 (统一版本)
- TypeScript 5.9.3
- Expo 54.0.26
- Sentry 8.42.0
- Electron 39.5.1

**安全考虑**:
- axios ^1.13.2 (安全版本)
- 各种加密库版本固定
- 依赖版本冲突解决

## 项目特色分析

### 1. **严格的架构约束**
- 明确的导入层次防止循环依赖
- 安全操作的绝对禁止规则
- 平台特定代码的隔离要求

### 2. **AI辅助开发集成**
- 详细的 Claude 指导文档
- Ultrathink 模式确保复杂操作的安全性
- 标准化的开发流程模板

### 3. **全面的工具链**
- 双构建系统支持 (Webpack + Rspack)
- 完整的性能测试体系
- 自动化的代码质量检查

### 4. **安全优先设计**
- 硬件钱包通信隔离
- 敏感信息处理规范
- 加密操作标准化

### 5. **多平台统一管理**
- 统一的脚本命令体系
- 平台特定的构建配置
- 共享的依赖版本管理

## 开发工作流集成

### 标准开发流程
1. 使用 INITIAL.md 规划功能
2. 遵循 CLAUDE.md 中的约束
3. 执行 package.json 中的脚本
4. 通过质量检查后提交

### 质量保证体系
- **代码质量**: ESLint + Oxlint + Prettier
- **类型安全**: TypeScript 严格模式
- **测试覆盖**: Jest + Playwright
- **性能监控**: 内置性能测试
- **安全检查**: 人工审查 + 自动化工具

## 技术债务管理

### 依赖管理策略
- 使用 resolutions 锁定关键版本
- 定期更新安全依赖
- 避免版本冲突

### 架构演进
- 模块化设计便于维护
- 清晰的依赖层次
- 平台特定代码隔离

---
*生成时间: 2026-03-22*
*分析文件: INITIAL.md, CLAUDE.md, package.json*
