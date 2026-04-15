# Bitcoin Ordinals 基础架构支撑 Roadmap（优先级版）

## 一、2025 年热门 Ordinals 项目参考

### 1.1 热门 Ordinals 项目分析

**BRC-20（比特币代币标准）**：
- 类似 ERC-20 的比特币代币标准
- 2025 年最流行的 Ordinals 代币标准
- 支持代币转账、授权、铸造
- 热门项目：$ORDI, $SATS, $RATS

**BRC-721（比特币 NFT 标准）**：
- 类似 ERC-721 的比特币 NFT 标准
- 支持 NFT 铸造、转账
- 2025 年 Ordinals NFT 热门项目：Bitcoin Punks, NodeRunners

**Ordinals Marketplace**：
- Ordinals 交易平台
- 2025 年热门：Gamma, Ordswap, Magic Eden

**Ordinals Wallet**：
- 支持 Ordinals 的比特币钱包
- 2025 年热门：UniSat, Ordinals Wallet, Xverse

**Ordinals Indexer**：
- Ordinals 索引器服务
- 2025 年热门：Unisat Ordinals Indexer, Ordinals.com Indexer

**Ordinals Explorer**：
- Ordinals 浏览器
- 2025 年热门：Unisat Explorer, Ordinals.com

### 1.2 GutHealth DAO 场景结合

**GutHealth DAO 需求**：
- 发行 $GUTH 代币（BRC-20）用于 DAO 治理
- 铸造健康数据 NFT（BRC-721）存储健康记录
- 铭文存储研究数据（不可篡改）
- Ordinals 市场交易健康数据访问权
- 基于 Ordinals 的激励机制

## 二、优先级调整

### 2.1 高优先级（P0）- 核心基础设施

**原因**：基础 Ordinals 协议支持，所有其他功能依赖

**任务**：
- [ ] BRC-20 代币标准实现
- [ ] BRC-721 NFT 标准实现
- [ ] Ordinals 铭文创建
- [ ] ORID 生成和解析
- [ ] 元数据验证
- [ ] 协议验证

**包**：
```
packages/ordinals/
├── brc20/             # BRC-20 代币标准
├── brc721/            # BRC-721 NFT 标准
├── inscription/       # 铭文创建和解析
├── oird/              # ORID 生成和解析
└── validation/       # 协议验证
```

**时间**：2-3 周

### 2.2 高优先级（P0）- 索引器和存储

**原因**：2025 年热门项目都依赖索引器，这是基础设施

**任务**：
- [ ] Ordinals 索引器实现
- [ ] UTXO 存储实现
- [] 元数据缓存
- [ ] 实时索引更新
- [ ] 批量索引优化

**包**：
```
packages/ordinals-indexer/
├── brc20/             # BRC-20 代币索引
├── brc721/            # BRC-721 NFT 索引
├── inscription/       # 铭文索引
└── realtime/          # 实时更新
```

**时间**：2-3 周

### 2.3 高优先级（P0）- 钱包集成

**原因**：用户需要钱包来使用 Ordinals 功能

**任务**：
- [ ] 扩展 packages/core/btc 支持 BRC-20
- [ ] 扩展 packages/core/btc 支持 BRC-721
- [ ] 扩展 packages/components 添加 Ordinals UI
- [ ] 扩展 packages/kit 添加 Ordinals 业务逻辑
- [ ] 实现铭文创建界面
- [ ] 实现 ORID 查询界面

**包**：
```
packages/core/src/chains/btc/
├── ordinals/
│   ├── brc20.ts
│   ├── brc721.ts
│   ├── inscription.ts
│   └── index.ts
packages/components/src/Ordinals/
├── BRC20Card.tsx
├── BRC721Card.tsx
├── CreateInscription.tsx
└── ORIDDisplay.tsx
packages/kit/src/hooks/
├── useBRC20.ts
├── useBRC721.ts
├── useCreateInscription.ts
└── useQueryORID.ts
```

**时间**：2-3 周

### 2.4 中优先级（P1）- GutHealth DAO 特定功能

**原因**：结合 GutHealth DAO 场景，实现特定功能

**任务**：
- [ ] $GUTH 代币铸造（BRC-20）
- [ ] 健康数据 NFT 铸造（BRC-721）
- [ ] 研究数据铭文存储
- [ Ordinals 市场集成
- [ ] 基于铭文的激励机制

**应用**：
```
apps/
├── gut-health-wallet/     # GutHealth 钱包
├── gut-health-market/     # GutHealth 市场
└── gut-health-nft/        # GutHealth NFT
```

**时间**：3-4 周

### 2.5 中优先级（P1）- Ordinals 市场

**原因**：2025 年热门 Ordinals 市场，需要交易功能

**任务**：
- [ ] Ordinals 市场界面
- [ ] BRC-20 代币交易
- [ ] BRC-721 NFT 交易
- [ ] 订单簿实现
- [ ] 价格发现机制

**包**：
```
packages/ordinals-market/
├── orderbook/
├── pricing/
├── matching/
└── settlement/
```

**时间**：3-4 周

### 2.6 中优先级（P1）- Ordinals 浏览器

**原因**：2025 年热门 Ordinals 浏览器，需要探索功能

**任务**：
- [ ] Ordinals 浏览器界面
- [ ] 区块浏览
- [ ] 交易浏览
- [ ] 铭文浏览
- [ ] 元数据展示
- [ ] 搜索功能

**时间**：2-3 周

### 2.7 低优先级（P2）- 高级功能

**原因**：锦上添花功能，可以在后续迭代中添加

**任务**：
- [ ] Ordinals 社交功能
- [ ] Ordinals 游戏化
- [ ] Ordinals 跨链桥（如果需要）
- [ ] Ordinals DAO 治理
- [ ] Ordinals 分析工具

**时间**：4-6 周

## 三、调整后的实施 Roadmap（基于优先级）

### Phase 1：核心基础设施（P0，3-4 周）

**目标**：实现 BRC-20、BRC-721、铭文创建、ORID 生成

**Week 1-2：Ordinals 协议基础**
- [ ] 创建 packages/ordinals
- [ ] 实现 BRC-20 标准
- [ ] 实现 BRC-721 标准
- [ ] 实现铭文创建
- [ ] 实现 ORID 生成和解析
- [ ] 实现元数据验证
- [ ] 实现协议验证
- [ ] 单元测试

**Week 3-4：索引器和存储**
- [ ] 创建 packages/ordinals-indexer
- [ ] 实现 BRC-20 索引
- [ ] 实现 BRC-721 索引
- [ ] 实现铭文索引
- [ ] 创建 packages/ordinals-storage
- [ ] 实现 UTXO 存储
- [ ] 实现键值存储
- [ ] 实现实时索引更新
- [ ] 集成测试

### Phase 2：钱包集成（P0，2-3 周）

**目标**：将 Ordinals 功能集成到钱包

**Week 5-6：Bitcoin SDK 扩展**
- [ ] 扩展 packages/core/btc 支持 BRC-20
- [ ] 扩展 packages/core/btc 支持 BRC-721
- [ ] 扩展 packages/core/btc 支持铭文创建
- [ ] 扩展 packages/core/btc 支持铭文签名
- [ ] 单元测试

**Week 7：UI 和业务逻辑**
- [ ] 扩展 packages/components 添加 Ordinals UI 组件
- [ ] 扩展 packages/kit 添加 Ordinals 业务逻辑
- [ ] 扩展 packages/kit-bg 添加 Ordinals 服务
- [ ] 实现铭文创建界面
- [ ] 实现 ORID 查询界面
- [ ] 集成测试

### Phase 3：GutHealth DAO 特定功能（P1，3-4 周）

**目标**：实现 GutHealth DAO 特定的 Ordinals 功能

**Week 8-9：$GUTH 代币**
- [ ] 设计 $GUTH BRC-20 代币
- [ ] 实现代币铸造功能
- [ ] 实现代币转账功能
- [ ] 实现代币授权功能
- [ ] 实现代币治理投票
- [ ] 集成测试

**Week 10-11：健康数据 NFT**
- [ ] 设计健康数据 BRC-721 NFT
- [ ] 实现 NFT 铸造功能
- [ ] 实现 NFT 转账功能
- [ ] 实现元数据存储
- [ ] 实现访问控制
- [ ] 集成测试

**Week 12：研究数据铭文**
- [ ] 设计研究数据铭文格式
- [ ] 实现数据铭文创建
- [ ] 实现数据铭文验证
- [ ] 实现数据访问控制
- [ ] 集成测试

### Phase 4：Ordinals 市场（P1，3-4 周）

**目标**：实现 Ordinals 市场功能

**Week 13-14：市场基础**
- [ ] 创建 packages/ordinals-market
- [ ] 实现订单簿
- [ ] 实现价格发现
- [ ] 实现撮合引擎
- [ ] 实现结算系统
- [ ] 集成测试

**Week 15-16：BRC-20 和 BRC-721 交易**
- [ ] 实现 BRC-20 代币交易
- [ ] 实现 BRC-721 NFT 交易
- [ ] 实现交易历史
- [ ] 实现手续费计算
- [ ] 集成测试

### Phase 5：Ordinals 浏览器（P1，2-3 周）

**目标**：实现 Ordinals 浏览器功能

**Week 17-18：浏览器基础**
- [ ] 创建 Ordinals 浏览器界面
- [ ] 实现区块浏览
- [ ] 实现交易浏览
- [ ] 实现铭文浏览
- [ ] 实现元数据展示
- [ ] 实现搜索功能
- [ ] 集成测试

**Week 19：高级功能**
- [ ] 实现实时更新
- [ ] 实现数据可视化
- [ ] 实现统计分析
- [ ] 集成测试

### Phase 6：验证和优化（P1，2-3 周）

**目标**：验证协议合规性和性能优化

**Week 20-21：协议验证**
- [ ] 实现 Bitcoin Core 共识规则验证
- [ ] 实现 BRC-20 协议验证
- [ ] 实现 BRC-721 协议验证
- [ ] 实现不可变性证明验证
- [ ] 实现区块高度真实性检查
- [ ] 安全审计

**Week 22：性能优化**
- [ ] 优化索引器性能
- [ ] 优化存储查询性能
- [ ] 实现缓存机制
- [ ] 实现批量处理
- [ ] 性能测试

### Phase 7：部署和监控（P1，2-3 周）

**目标**：部署到 Bitcoin 测试网

**Week 23-24：测试网部署**
- [ ] 部署到 Bitcoin Testnet
- [ ] 部署索引器到 Testnet
- [ ] 部署存储到 Testnet
- [ ] 功能测试
- [ ] 性能测试
- [ ] 安全测试

**Week 25-26：主网部署**
- [ ] 部署到 Bitcoin Mainnet
- [ ] 部署索引器到 Mainnet
- [ ] 部署存储到 Mainnet
- [ ] 功能测试
- [ ] 性能测试
- [ ] 安全审计
- [ ] 监控系统

**Week 27：监控和优化**
- [ ] 实现索引器监控
- [ ] 实现存储监控
- [ ] 实现错误告警
- [ ] 实现性能监控
- [ ] 实现日志系统
- [ ] 持续优化

## 四、GutHealth DAO 特定设计

### 4.1 $GUTH 代币设计（BRC-20）

**代币属性**：
- 名称：Gut Health Token
- 符号：$GUTH
- 总供应量：10 亿
- 分配方案：
  - 40%：空投给早期贡献者
  - 30%：生态系统激励
  - 20%：研究资助
  - 10%：团队预留

**铭文设计**：
- 使用 BRC-20 标准
- 铭文类型：brc-20
- 元数据：包含代币名称、符号、总供应量

### 4.2 健康数据 NFT 设计（BRC-721）

**NFT 属性**：
- 类型：健康数据 NFT
- 元数据：包含用户 ID、数据类型、时间戳、加密数据
- 访问控制：基于 NFT 所有权的访问控制

**铭文设计**：
- 使用 BRC-721 标准
- 铭文类型：brc-721
- 元数据：JSON 格式，包含健康数据

### 4.3 研究数据铭文设计

**铭文设计**：
- 铭文类型：application/json
- 元数据：研究数据摘要
- 访问控制：基于付费的访问控制

**激励机制**：
- 数据提供者获得 $GUTH 奖励
- 数据使用者支付 $GUTH 访问费

## 五、2025 年热门项目参考

### 5.1 参考项目

**BRC-20 实现**：
- 参考：@unisat/ordinals-brc20
- 参考：@ordinals/brc-20

**BRC-721 实现**：
- 参考：@unisat/ordinals-brc721
- 参考：@ordinals/brc-721

**索引器实现**：
- 参考：@unisat/ordinals-indexer
- 参考：@ordinals/indexer

**钱包实现**：
- 参考：Unisat Wallet
- 参考：Ordinals Wallet
- 参考：Xverse

**市场实现**：
- 参考：Gamma
- 参考：Ordswap
- 参考：Magic Eden

### 5.2 学习 2025 年热门项目的最佳实践

**性能优化**：
- 批量索引处理
- 缓存机制
- 延迟优化

**安全实践**：
- 协议验证
- 访问控制
- 私钥管理

**用户体验**：
- 简化铭文创建流程
- 直观的 ORID 展示
- 清晰的元数据展示

## 六、优先级对比

| 优先级 | 功能 | 时间 | 依赖 |
|--------|------|------|------|
| P0 | BRC-20 标准 | 1 周 | 无 |
| P0 | BRC-721 标准 | 1 周 | 无 |
| P0 | 铭文创建 | 1 周 | BRC-20/BRC-721 |
| P0 | ORID 生成 | 1 周 | 铭文创建 |
| P0 | 索引器 | 2 周 | 铭文创建 |
| P0 | 存储 | 2 周 | 索引器 |
| P0 | 钱包集成 | 2 周 | 索引器 + 存储 |
| P1 | $GUTH 代币 | 2 周 | 钱包集成 |
| P1 | 健康数据 NFT | 2 周 | 钱包集成 |
| P1 | 研究数据铭文 | 1 周 | 钱包集成 |
| P1 | Ordinals 市场 | 3 周 | 索引器 + 存储 |
| P1 | Ordinals 浏览器 | 2 周 | 索引器 + 存储 |
| P2 | 社交功能 | 3 周 | 市场 |
| P2 | 游戏化 | 3 周 | 市场 |
| P2 | DAO 治理 | 2 周 | BRC-20 |

## 七、成功指标（调整）

### 7.1 技术指标

- ✅ 索引器延迟 < 1 分钟（BRC-20/BRC-721）
- ✅ 存储查询延迟 < 100ms
- ✅ 协议验证准确率 100%
- ✅ 系统可用性 99.9%
- ✅ 支持每秒 100+ 铭文创建

### 7.2 产品指标

- ✅ $GUTH 代币流通量 > 100 万
- ✅ 健康数据 NFT 数量 > 10,000
- ✅ 研究数据铭文数量 > 1,000
- ✅ Ordinals 市场交易量 > $10,000
- ✅ 日活跃用户 > 5,000

### 7.3 业务指标

- ✅ 研究资助项目 > 10 个
- ✅ 数据访问收入 > $50,000/月
- ✅ DAO 治理参与度 > 20%
- ✅ 社区活跃度 > 1,000

## 八、风险评估（调整）

### 8.1 技术风险

**风险**：
- BRC-20/BRC-721 标准变更
- 索引器性能瓶颈
- 存储成本增长

**缓解措施**：
- 遵循官方标准
- 性能测试和优化
- 存储压缩和归档

### 8.2 市场风险

**风险**：
- Ordinals 市场波动
- 竞争激烈
- 用户教育成本

**缓解措施**：
- 差异化定位（GutHealth DAO）
- 社区建设
- 用户教育

### 8.3 监管风险

**风险**：
- 代币合规问题
- 数据隐私问题
- 跨境监管差异

**缓解措施**：
- 法律咨询
- 用户协议
- 数据加密
- 分区部署

## 九、总结

基于 2025 年热门 Ordinals 项目和 GutHealth DAO 场景，调整后的 Roadmap 优先级：

**P0（高优先级）**：
- BRC-20 代币标准
- BRC-721 NFT 标准
- 铭文创建和解析
- ORID 生成和解析
- 索引器和存储
- 钱包集成

**P1（中优先级）**：
- $GUTH 代币铸造
- 健康数据 NFT 铸造
- 研究数据铭文存储
- Ordinals 市场集成
- Ordinals 浏览器

**P2（低优先级）**：
- 社交功能
- 游戏化
- DAO 治理
- 分析工具

**总时间**：27 周（约 6.5 个月）

**核心优势**：
- ✅ 利用 2025 年热门 Ordinals 项目经验
- ✅ 结合 GutHealth DAO 实际需求
- ✅ 基于 OneKey 完整架构
- ✅ 聚焦 BRC-20 和 BRC-721 标准
- ✅ 优先实现核心基础设施

---

> **学习来源**：2025 年热门 Ordinals 项目 + Bitcoin Ordinals Architecture + 当前 OneKey Monorepo 架构 + GutHealth DAO 场景
> 
> **核心机制**：BRC-20/BRC-721 优先 + 铭文创建 + 索引器 + 存储 + 钱包集成 + GutHealth DAO 特定功能
