# 基于 OneKey Monorepo 的产品规划文档

## 一、核心能力概述

本项目是一个全栈加密钱包 monorepo，支持多平台（Web、Mobile、Desktop、Extension）和 60+ 区块链。

### 技术架构

| 层级   | 包                    | 功能                    |
| ------ | --------------------- | ----------------------- |
| UI 层  | `packages/components` | 组件库 (Tamagui)        |
| 业务层 | `packages/kit`        | 业务逻辑 (React Native) |
| 后台层 | `packages/kit-bg`     | 后台服务 (Jotai)        |
| 核心层 | `packages/core`       | 区块链交互 (60+ 链)     |
| 共享层 | `packages/shared`     | 工具函数                |

### 支持的平台

- **Web**: `apps/web`, `apps/web-astro`, `apps/web-embed`
- **Mobile**: `apps/mobile` (iOS/Android)
- **Desktop**: `apps/desktop` (Electron)
- **Extension**: `apps/ext` (Chrome)

---

## 二、产品矩阵

### 2.1 钱包核心产品 (100% 复用)

| 产品             | 说明               | 开发方式            |
| ---------------- | ------------------ | ------------------- |
| 多链加密钱包     | 主产品，现有       | 直接使用            |
| 硬件钱包配套软件 | Desktop/Mobile App | 裁剪 Mobile/Desktop |
| Web 钱包         | Web App            | 直接使用            |
| 交易所端钱包     | 机构托管方案       | 基于 core 模块      |

### 2.2 B2B 产品 (高复用)

| 产品               | 说明                 | 复用度 |
| ------------------ | -------------------- | ------ |
| **嵌入式钱包 SDK** | 为 DApp 提供钱包能力 | 85%    |
| **支付网关**       | 商户加密货币收款     | 70%    |
| **企业资产管理**   | 企业级多签钱包       | 75%    |
| **DAO 资金管理**   | 多签决策工具         | 60%    |

**实现方式**:

- 将 `packages/core` 打包为 SDK (npm/CDN)
- 将 `packages/components` 作为 UI 组件库
- 提供简单的初始化配置

### 2.3 DeFi 产品 (中复用)

| 产品         | 说明              | 复用度 |
| ------------ | ----------------- | ------ |
| DeFi 聚合器  | 交易/Staking/借贷 | 60%    |
| NFT 交易平台 | 跨链 NFT 买卖     | 50%    |
| Token 兑换   | 跨链 Swap         | 40%    |

**实现方式**:

- 复用 `packages/core` 的链交互能力
- 新增 DeFi 协议集成 (1inch, Uniswap, etc.)
- 新增 UI 组件

### 2.4 Web3 基础设施

| 产品         | 说明          | 复用度 |
| ------------ | ------------- | ------ |
| 区块链浏览器 | 交易/地址查询 | 50%    |
| Gas Fee 工具 | 实时 Gas 建议 | 80%    |
| 链上数据分析 | 钱包画像/趋势 | 55%    |

### 2.5 新兴产品 (需深度开发)

| 产品                  | 难度 | 说明                               |
| --------------------- | ---- | ---------------------------------- |
| Social Recovery       | 中   | 社交恢复钱包                       |
| Smart Contract Wallet | 高   | 智能合约钱包 (Account Abstraction) |
| Cross-chain Bridge    | 高   | 跨链桥                             |
| Identity/DID          | 中   | 去中心化身份                       |
| Soul Token            | 中   | SBT/灵魂代币                       |

---

## 三、群站矩阵方案 (借鉴出海 SaaS 架构)

### 3.1 架构设计

参考「CF Pages + Workers + D1 + Astro」模式，构建 Web3 工具站矩阵：

```
apps/web-astro/
├── src/
│   ├── components/        # 通用 UI 组件
│   │   ├── PricingCard/   # 定价组件
│   │   ├── AuthForm/      # 登录组件
│   │   └── PaymentButton/ # 支付组件
│   ├── core/              # 通用业务逻辑
│   │   ├── db.ts          # D1 ORM (可复用)
│   │   └── auth.ts        # 认证逻辑
│   └── sites/             # 站点配置
│       ├── tool-a/        # 站点 A 配置
│       │   ├── config.json
│       │   ├── content/
│       │   └── pages/
│       └── tool-b/        # 站点 B 配置
```

### 3.2 快速克隆新站点

```bash
# 复制站点配置，几分钟上线新站
cp -r apps/web-astro/sites/tool-a apps/web-astro/sites/tool-c
# 修改 config.json 中的品牌、标题、价格
```

### 3.3 配置即站点

| 配置项       | 说明      |
| ------------ | --------- |
| siteName     | 站点名称  |
| logo         | Logo 路径 |
| primaryColor | 主色调    |
| features     | 功能特性  |
| pricing      | 价格方案  |
| links        | 外部链接  |

### 3.4 通用组件库

将 `packages/components` 中的组件封装为 Astro 可用：

```astro
---
import { PricingTable } from '@onekeyhq/components/astro';
---
<PricingTable plans={site.pricing} />
```

---

## 四、产品路线图

### Phase 1: 核心钱包 (现有)

- [x] Web Wallet
- [x] Mobile App
- [x] Desktop App
- [x] Browser Extension

### Phase 2: B2B 拓展

- [ ] Embedded Wallet SDK (Web/DApp 嵌入)
- [ ] Payment Gateway (商户收款)
- [ ] Enterprise Dashboard (企业管理)

### Phase 3: 工具站矩阵

- [ ] Gas Fee Tracker
- [ ] Portfolio Tracker
- [ ] Token Analytics
- [ ] 多站点部署 (基于 web-astro)

### Phase 4: 新兴领域

- [ ] Social Recovery
- [ ] Smart Contract Wallet (ERC-4337)
- [ ] Cross-chain Bridge

---

## 五、技术复用详解

### 5.1 packages/core (区块链核心)

```typescript
// 60+ 链支持
import { Client } from '@onekeyhq/core';

// BTC
const btcClient = new Client({ network: 'bitcoin' });
// ETH
const ethClient = new Client({ network: 'ethereum' });
// Solana
const solClient = new Client({ network: 'solana' });
// ... 60+ networks
```

**可复用能力**:

- 钱包创建/导入
- 签名交易
- 余额查询
- 代币转账
- 合约交互

### 5.2 packages/components (UI 库)

- 1000+ UI 组件
- Dark/Light 主题
- 多语言支持
- 响应式设计

### 5.3 packages/kit (业务逻辑)

- 账户管理
- 交易历史
- DApp 连接
- 设置管理

### 5.4 packages/kit-bg (后台服务)

- 本地数据库
- 加密存储
- 消息推送
- Background sync

---

## 六、实施建议

### 6.1 短期 (1-3 个月)

1. 梳理 `packages/core` 为独立 SDK
2. 完善 `apps/web-astro` 工具站能力
3. 上线 Gas Fee 工具

### 6.2 中期 (3-6 个月)

1. 开发 Embedded Wallet SDK
2. 构建多站点部署能力
3. 上线 Portfolio Tracker

### 6.3 长期 (6-12 个月)

1. Smart Contract Wallet
2. Cross-chain Bridge
3. Identity/DID 集成

---

## 七、注意事项

1. **合规**: 钱包业务需考虑 KYC/AML 法规
2. **安全**: 私钥管理、签名安全
3. **成本**: 多链节点运维成本
4. **竞争**: 同类产品众多，需差异化

---

## 附录：技术栈

| 类别     | 技术                                |
| -------- | ----------------------------------- |
| 前端框架 | React 19, React Native 0.81         |
| UI 库    | Tamagui 1.108                       |
| 状态管理 | Jotai 2.5                           |
| 构建     | Webpack 5, Metro, rspack            |
| 区块链   | viem 2.37, ethers 6, solana-web3.js |
| 包管理   | Yarn 4.12 (PnP)                     |
