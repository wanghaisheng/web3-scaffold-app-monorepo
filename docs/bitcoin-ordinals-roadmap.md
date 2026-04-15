# Bitcoin Ordinals 基础架构支撑 Roadmap

## 一、架构目标

基于当前 OneKey Monorepo 架构，构建一个支持 Bitcoin Ordinals 协议的完整基础设施。

**核心原则**：
- 专注 Bitcoin 单链实现
- UTXO 链上铭文存储
- 协议级验证
- 零跨链依赖
- 最小化依赖模式

## 二、当前架构能力评估

### 2.1 已有 Bitcoin 支持

**packages/core/btc/**：
- Bitcoin 交易构建
- 地址生成
- 签名验证
- UTXO 管理

**已有依赖**：
```json
{
  "@onekeyfe/bitcoinforksjs-lib": "7.0.0-rc.0",
  "bitcoinjs-lib": "npm:@onekeyfe/bitcoinjs-lib@7.0.1",
  "bitcoinjs-message": "2.2.0"
}
```

### 2.2 需要添加的 Ordinals 能力

```
❌ Ordinal ID (ORID) 生成和跟踪
❌ SAT index 分配和管理
❌ 铭文元数据验证
❌ 链上验证流程
❌ 区块索引器
❌ UTXO 铭文存储
```

## 三、架构设计

### 3.1 包结构设计

基于当前架构，添加 Ordinals 专用包：

```
packages/
├── core/ (已有)           # 区块链 SDK（包含 btc）
├── components/ (已有)    # UI 组件库
├── kit/ (已有)           # 钱包业务逻辑
├── kit-bg/ (已有)        # 后台服务
├── shared/ (已有)        # 工具函数
├── ordinals/ (新增)      # Ordinals 协议实现
│   ├── src/
│   │   ├── oird/         # Ordinal ID 生成
│   │   ├── sat/          # SAT index 管理
│   │   ├── metadata/     # 元数据验证
│   │   ├── validation/   # 协议验证
│   │   └── index.ts
├── ordinals-indexer/ (新增) # Ordinals 索引器
│   ├── src/
│   │   ├── block/        # 区块处理
│   │   ├── transaction/  # 交易解析
│   │   ├── inscription/ # 铭文提取
│   │   └── index.ts
├── ordinals-storage/ (新增) # UTXO 铭文存储
│   ├── src/
│   │   ├── utxo/         # UTXO 管理
│   │   ├── kv/           # 键值存储
│   │   └── index.ts
└── db/ (已有)            # 数据库（可用于元数据缓存）
```

### 3.2 技术架构

```
┌─────────────────────────────────────────────────────────┐
│                   应用层                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌─────────┐ │
│  │ Wallet   │  │ Explorer │  │ Marketplace│  │ Inscription │ │
│  └──────────┘  └──────────┘  └──────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│              Ordinals 协议层（packages/ordinals）       │
│  ┌──────────────────────────────────────────────────┐  │
│  │ ORID 生成 | SAT 管理 | 元数据验证 | 协议验证  │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          Bitcoin 交互层（packages/core/btc）          │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 交易构建 | 地址生成 | 签名验证 | UTXO 管理      │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          索引器层（packages/ordinals-indexer）        │
│  ┌──────────────────────────────────────────────────┐  │
│  │ 区块处理 | 交易解析 | 铭文提取 | 元数据提取     │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│          存储层（packages/ordinals-storage）         │
│  ┌──────────────────────────────────────────────────┐  │
│  │ UTXO 管理 | 键值存储 | 元数据缓存              │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 四、实施 Roadmap

### 阶段 1：基础设施（2-3 周）

**目标**：创建 Ordinals 协议基础包

#### 1.1 创建 packages/ordinals

**任务**：
- [ ] 创建 packages/ordinals 目录结构
- [ ] 实现 ORID 生成算法
- [ ] 实现 SAT index 管理
- [ ] 实现元数据验证
- [ ] 实现协议验证
- [ ] 编写单元测试

**文件结构**：
```
packages/ordinals/src/
├── oird/
│   ├── generate.ts
│   ├── parse.ts
│   └── index.ts
├── sat/
│   ├── allocate.ts
│   ├── index.ts
│   └── index.ts
├── metadata/
│   ├── validate.ts
│   ├── extract.ts
│   └── index.ts
├── validation/
│   ├── protocol.ts
│   ├── consensus.ts
│   └── index.ts
└── index.ts
```

**关键代码示例**：

```typescript
// packages/ordinals/src/oird/generate.ts
export function generateORID(
  blockHeight: number,
  txIndex: number,
  outputIndex: number,
): string {
  // 实现 ORID 生成算法
  const sat = calculateSatNumber(blockHeight, txIndex, outputIndex);
  return encodeORID(sat);
}

// packages/ordinals/src/metadata/extract.ts
export function extractInscriptionMetadata(
  witness: string,
): InscriptionData {
  // 从 witness 数据中提取铭文元数据
  const data = decodeWitness(witness);
  return parseInscription(data);
}
```

#### 1.2 创建 packages/ordinals-indexer

**任务**：
- [ ] 创建 packages/ordinals-indexer 目录结构
- [ ] 实现区块处理逻辑
- [ ] 实现交易解析逻辑
- [ ] 实现铭文提取逻辑
- [ ] 实现元数据提取
- [ ] 编写单元测试

**文件结构**：
```
packages/ordinals-indexer/src/
├── block/
│   ├── process.ts
│   └── index.ts
├── transaction/
│   ├── parse.ts
│   ├── decode.ts
│   └── index.ts
├── inscription/
│   ├── extract.ts
│   ├── validate.ts
│   └── index.ts
└── index.ts
```

**关键代码示例**：

```typescript
// packages/ordinals-indexer/src/inscription/extract.ts
export function extractInscriptions(
  tx: Transaction,
): Inscription[] {
  const inscriptions: Inscription[] = [];
  
  for (const output of tx.outputs) {
    const witness = output.witness;
    if (isInscriptionWitness(witness)) {
      const inscription = parseInscription(witness);
      inscriptions.push(inscription);
    }
  }
  
  return inscriptions;
}
```

#### 1.3 创建 packages/ordinals-storage

**任务**：
- [ ] 创建 packages/ordinals-storage 目录结构
- [ ] 实现 UTXO 管理
- [ ] 实现键值存储
- [ ] 实现元数据缓存
- [ ] 编写单元测试

**文件结构**：
```
packages/ordinals-storage/src/
├── utxo/
│   ├── manager.ts
│   ├── index.ts
│   └── index.ts
├── kv/
│   ├── store.ts
│   └── index.ts
└── index.ts
```

**关键代码示例**：

```typescript
// packages/ordinals-storage/src/utxo/manager.ts
export class UTXOManager {
  async getUTXO(txid: string, outputIndex: number): Promise<UTXO> {
    // 从存储中获取 UTXO
  }
  
  async saveUTXO(utxo: UTXO): Promise<void> {
    // 保存 UTXO 到存储
  }
  
  async spendUTXO(txid: string, outputIndex: number): Promise<void> {
    // 标记 UTXO 为已花费
  }
}
```

### 阶段 2：集成现有架构（2-3 周）

**目标**：将 Ordinals 功能集成到现有 OneKey 架构

#### 2.1 扩展 packages/core/btc

**任务**：
- [ ] 添加 Ordinals 交易构建
- [ ] 添加 Ordinals 地址生成
- [ ] 添加 Ordinals 签名验证
- [ ] 添加 UTXO 铭文识别
- [ ] 编写单元测试

**文件结构**：
```
packages/core/src/chains/btc/
├── ordinals/
│   ├── transaction.ts
│   ├── address.ts
│   ├── sign.ts
│   └── index.ts
└── ...
```

**关键代码示例**：

```typescript
// packages/core/src/chains/btc/ordinals/transaction.ts
export function buildOrdinalsInscriptionTx(
  utxo: UTXO,
  content: string,
  contentType: string,
): Transaction {
  // 构建包含铭文的交易
  const script = buildInscriptionScript(content, contentType);
  const tx = new Transaction()
    .addInput(utxo.txid, utxo.outputIndex)
    .addOutput(script);
  
  return tx;
}
```

#### 2.2 扩展 packages/components

**任务**：
- [ ] 添加 Ordinals 铭文展示组件
- [ ] 添加 ORID 显示组件
- [ ] 添加铭文创建表单
- [ ] 添加元数据验证 UI

**文件结构**：
```
packages/components/src/
├── Ordinals/
│   ├── InscriptionCard.tsx
│   ├── ORIDDisplay.tsx
│   ├── CreateInscriptionForm.tsx
│   └── index.ts
└── ...
```

#### 2.3 扩展 packages/kit

**任务**：
- [ ] 添加 Ordinals 业务逻辑 hooks
- [ ] 添加铭文创建逻辑
- [ ] 添加铭文验证逻辑
- [ ] 添加 ORID 查询逻辑

**文件结构**：
```
packages/kit/src/hooks/
├── useOrdinals/
│   ├── useCreateInscription.ts
│   ├── useValidateInscription.ts
│   ├── useQueryORID.ts
│   └── index.ts
└── ...
```

#### 2.4 扩展 packages/kit-bg

**任务**：
- [ ] 添加 Ordinals 索引服务
- [ ] 添加铭文同步服务
- [ ] 添加元数据缓存服务
- [ ] 添加 UTXO 监控服务

**文件结构**：
```
packages/kit-bg/src/services/
├── ServiceOrdinalsIndexer.ts
├── ServiceOrdinalsSync.ts
├── ServiceOrdinalsCache.ts
└── ...
```

### 阶段 3：应用层实现（3-4 周）

**目标**：实现 Ordinals 应用

#### 3.1 Ordinals Wallet

**任务**：
- [ ] 创建 Ordinals 钱包界面
- [ ] 实现铭文创建功能
- [ ] 实现铭文管理功能
- [ ] 实现ORID 查询功能
- [ ] 实现元数据展示

**应用位置**：
```
apps/
├── wallet-ordinals/      # Ordinals 钱包应用
│   ├── src/
│   │   ├── screens/
│   │   │   ├── CreateInscription.tsx
│   │   │   ├── ManageInscriptions.tsx
│   │   │   └── QueryORID.tsx
│   │   └── ...
│   └── package.json
```

#### 3.2 Ordinals Explorer

**任务**：
- [ ] 创建 Ordinals 浏览器界面
- [ ] 实现区块浏览
- [ ] 实现交易浏览
- [ ] 实现铭文浏览
- [ ] 实现元数据展示

**应用位置**：
```
apps/
├── explorer-ordinals/   # Ordinals 浏览器应用
│   ├── src/
│   │   ├── screens/
│   │   │   ├── BlockView.tsx
│   │   │   ├── TransactionView.tsx
│   │   │   └── InscriptionView.tsx
│   │   └── ...
│   └── package.json
```

#### 3.3 Ordinals Marketplace

**任务**：
- [ ] 创建 Ordinals 市场界面
- [ ] 实现铭文上架
- [ ] 实现铭文交易
- [ ] 实现价格展示
- [ ] 实现搜索功能

**应用位置**：
```
apps/
├── marketplace-ordinals/ # Ordinals 市场应用
│   ├── src/
│   │   ├── screens/
│   │   │   ├── ListInscription.tsx
│   │   │   ├── BuyInscription.tsx
│   │   │   └── SellInscription.tsx
│   │   └── ...
│   └── package.json
```

### 阶段 4：验证和优化（2-3 周）

**目标**：验证协议合规性和性能优化

#### 4.1 协议验证

**任务**：
- [ ] 实现 Bitcoin Core 共识规则验证
- [ ] 实现不可变性证明验证
- [ ] 实现区块高度真实性检查
- [ ] 实现协议合规性评估
- [ ] 编写验证测试

**文件位置**：
```
packages/ordinals/src/validation/
├── consensus.ts
├── immutability.ts
├── blockHeight.ts
├── protocol.ts
└── index.ts
```

**关键代码示例**：

```typescript
// packages/ordinals/src/validation/consensus.ts
export function validateConsensusRules(
  inscriptionData: InscriptionData,
): ValidationResult {
  const blockValidation = checkBitcoinBlockHeight(inscriptionData.blockHeight);
  const immutabilityCheck = verifyImmutability(inscriptionData.dataHash);
  const protocolCompliance = validateProtocolRules(
    inscriptionData.transaction,
    inscriptionData.blockHash,
  );

  return combineResults([
    blockValidation,
    immutabilityCheck,
    protocolCompliance,
  ]);
}
```

#### 4.2 性能优化

**任务**：
- [ ] 优化索引器性能
- [ ] 优化存储查询性能
- [ ] 实现缓存机制
- [ ] 实现批量处理
- [ ] 性能测试

#### 4.3 安全审计

**任务**：
- [ ] 安全代码审计
- [ ] 智能合约审计（如果有）
- [ ] 渗透测试
- [ ] 漏洞修复
- [ ] 安全测试

### 阶段 5：部署和监控（1-2 周）

**目标**：部署到 Bitcoin 测试网

#### 5.1 测试网部署

**任务**：
- [ ] 部署到 Bitcoin Testnet
- [ ] 部署索引器到 Testnet
- [ ] 部署存储到 Testnet
- [ ] 功能测试
- [ ] 性能测试

#### 5.2 监控系统

**任务**：
- [ ] 实现索引器监控
- [ ] 实现存储监控
- [ ] 实现错误告警
- [ ] 实现性能监控
- [ ] 实现日志系统

#### 5.3 主网部署

**任务**：
- [ ] 部署到 Bitcoin Mainnet
- [ ] 部署索引器到 Mainnet
- [ ] 部署存储到 Mainnet
- [ ] 功能测试
- [ ] 性能测试
- [ ] 安全审计

## 五、依赖管理

### 5.1 零外部依赖原则

**当前架构已有 Bitcoin 依赖**：
```json
{
  "@onekeyfe/bitcoinforksjs-lib": "7.0.0-rc.0",
  "bitcoinjs-lib": "npm:@onekeyfe/bitcoinjs-lib@7.0.1",
  "bitcoinjs-message": "2.2.0"
}
```

**需要添加的依赖**：
```json
{
  // Ordinals 相关
  "ordinals-sdk": "^1.0.0",  // 如果需要
  "bitcoin-rpc": "^1.0.0"     // Bitcoin RPC 客户端
}
```

### 5.2 依赖隔离

**确保所有 Ordinals 相关代码只在 Bitcoin 链上运行**：

```typescript
// packages/ordinals/src/index.ts
import { CoreChainHd } from '@onekeyhq/core/src/chains/btc';

// 只支持 Bitcoin
const SUPPORTED_CHAINS = ['btc'];

export function isSupportedChain(chainId: string): boolean {
  return SUPPORTED_CHAINS.includes(chainId);
}
```

## 六、数据流设计

### 6.1 铭文创建流程

```
用户创建铭文
    ↓
packages/kit/hooks/useCreateInscription
    ↓
packages/core/btc/ordinals/transaction.ts
    ↓
构建交易（包含铭文脚本）
    ↓
用户签名
    ↓
广播到 Bitcoin 网络
    ↓
packages/ordinals-indexer 索引交易
    ↓
提取铭文元数据
    ↓
packages/ordinals-storage 存储 UTXO
    ↓
生成 ORID
    ↓
返回给用户
```

### 6.2 ORID 查询流程

```
用户查询 ORID
    ↓
packages/kit/hooks/useQueryORID
    ↓
packages/ordinals/oird/parse.ts
    ↓
解码 ORID 获取 SAT number
    ↓
packages/ordinals-storage 查询 UTXO
    ↓
获取交易信息
    ↓
packages/ordinals-indexer 获取元数据
    ↓
返回铭文信息
```

### 6.3 元数据验证流程

```
用户验证铭文
    ↓
packages/kit/hooks/useValidateInscription
    ↓
packages/ordinals/metadata/extract.ts
    ↓
从 witness 提取元数据
    ↓
packages/ordinals/validation/protocol.ts
    ↓
验证协议合规性
    ↓
packages/ordinals/validation/consensus.ts
    ↓
验证 Bitcoin Core 共识
    ↓
返回验证结果
```

## 七、测试策略

### 7.1 单元测试

**每个包都需要单元测试**：

```typescript
// packages/ordinals/src/oird/generate.test.ts
describe('ORID Generation', () => {
  it('should generate valid ORID', () => {
    const orid = generateORID(100000, 0, 0);
    expect(validateORID(orid)).toBe(true);
  });
});

// packages/ordinals-indexer/src/inscription/extract.test.ts
describe('Inscription Extraction', () => {
  it('should extract inscription from witness', () => {
    const tx = createTestTransaction();
    const inscriptions = extractInscriptions(tx);
    expect(inscriptions).toHaveLength(1);
  });
});
```

### 7.2 集成测试

**测试整个流程**：

```typescript
// integration/ordinals-flow.test.ts
describe('Ordinals Flow', () => {
  it('should create and query inscription', async () => {
    // 1. 创建铭文
    const inscription = await createInscription(content);
    
    // 2. 查询 ORID
    const orid = generateORID(inscription.blockHeight);
    const queried = await queryORID(orid);
    
    // 3. 验证
    expect(queried.content).toBe(content);
  });
});
```

### 7.3 协议验证测试

**测试协议合规性**：

```typescript
// packages/ordinals/src/validation/protocol.test.ts
describe('Protocol Validation', () => {
  it('should validate BRC-20 inscription', () => {
    const inscription = createBRC20Inscription();
    const result = validateProtocolRules(inscription);
    expect(result.isValid).toBe(true);
  });
});
```

## 八、里程碑

### Milestone 1：基础架构完成（第 1-3 周）

**交付物**：
- ✅ packages/ordinals
- ✅ packages/ordinals-indexer
- ✅ packages/ordinals-storage
- ✅ 单元测试

### Milestone 2：架构集成完成（第 4-6 周）

**交付物**：
- ✅ packages/core/btc 扩展
- ✅ packages/components 扩展
- ✅ packages/kit 扩展
- ✅ packages/kit-bg 扩展
- ✅ 集成测试

### Milestone 3：应用层完成（第 7-10 周）

**交付物**：
- ✅ Ordinals Wallet
- ✅ Ordinals Explorer
- ✅ Ordinals Marketplace
- ✅ E2E 测试

### Milestone 4：验证完成（第 11-13 周）

**交付物**：
- ✅ 协议验证实现
- ✅ 性能优化
- ✅ 安全审计
- ✅ 验证测试

### Milestone 5：部署完成（第 14-15 周）

**交付物**：
- ✅ Testnet 部署
- ✅ Mainnet 部署
- ✅ 监控系统
- ✅ 文档完善

## 九、风险评估

### 9.1 技术风险

**风险**：
- Ordinals 协议复杂性
- 性能瓶颈（索引器）
- 存储成本（UTXO 数据）

**缓解措施**：
- 分阶段实施
- 性能测试和优化
- 存储压缩和归档

### 9.2 安全风险

**风险**：
- 智能合约漏洞
- 私钥泄露
- 钓文数据篡改

**缓解措施**：
- 安全审计
- 硬件钱包支持
- 协议验证

### 9.3 合规风险

**风险**：
- 监管政策变化
- 法律合规问题

**缓解措施**：
- 法律咨询
- 合规性审查
- 用户协议

## 十、成功指标

### 10.1 技术指标

- ✅ 索引器延迟 < 1 分钟
- ✅ 存储查询延迟 < 100ms
- ✅ 协议验证准确率 100%
- ✅ 系统可用性 99.9%

### 10.2 产品指标

- ✅ 铭文创建成功率 > 99%
- ✅ ORID 查询成功率 > 99%
- ✅ 元数据验证准确率 100%
- ✅ 用户满意度 > 90%

### 10.3 业务指标

- ✅ 日活跃用户 > 1000
- ✅ 铭文创建数 > 10000
- ✅ 交易量 > $100000
- ✅ 社区活跃度 > 500

## 十一、总结

基于当前 OneKey Monorepo 架构，可以构建一个完整的 Bitcoin Ordinals 基础设施：

**优势**：
- ✅ 已有 Bitcoin SDK 支持
- ✅ 已有 UI 组件库
- ✅ 已有业务逻辑层
- ✅ 已有后台服务
- ✅ 已有跨平台支持

**需要添加**：
- Ordinals 协议实现（packages/ordinals）
- Ordinals 索引器（packages/ordinals-indexer）
- Ordinals 存储（packages/ordinals-storage）
- Ordinals 验证（packages/ordinals/validation）

**实施时间**：15 周

**预计成果**：完整的 Bitcoin Ordinals 生态系统，包括钱包、浏览器、市场和验证系统。

---

> **学习来源**：Bitcoin Ordinals Architecture + 当前 OneKey Monorepo 架构
> 
> **核心机制**：现有架构 + Ordinals 协议实现 + 索引器 + 存储 + 验证
