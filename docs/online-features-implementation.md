# OneKey 在线功能实现详解

## 一、在线功能分类

OneKey 的在线功能主要分为三类：

1. **区块链节点连接** - 连接区块链 RPC 节点
2. **OneKey 后端服务** - 连接 OneKey 的 API 服务器
3. **第三方数据服务** - 获取市场数据、汇率等

## 二、实现位置

所有在线功能的实现都在 `packages/` 文件夹中：

```
packages/
├── core/              # 区块链节点连接
│   └── src/chains/    # 各链的 RPC 连接实现
├── shared/            # 网络请求基础设施
│   ├── appApiClient/  # HTTP 客户端
│   └── request/       # 请求拦截器、辅助函数
└── kit-bg/            # 业务服务（调用在线 API）
    └── src/services/ # 各种在线服务
```

## 三、区块链节点连接

### 3.1 EVM 链连接

**文件：`packages/core/src/chains/evm/sdkEvm/ethers.ts`**

```typescript
import { providers } from 'ethers';

export const EthersJsonRpcProvider = providers.JsonRpcProvider;
export const EthersJsonRpcBatchProvider = providers.JsonRpcBatchProvider;
```

**使用方式**：

```typescript
// 创建 RPC 提供者
const provider = new EthersJsonRpcProvider('https://eth-mainnet.alchemyapi.io/v2/xxx');

// 获取余额
const balance = await provider.getBalance(address);

// 广播交易
const receipt = await provider.sendTransaction(signedTx);
```

### 3.2 其他链连接

每个链都有自己的 SDK 和 RPC 连接方式：

- **Solana**: `@solana/web3.js`
- **Bitcoin**: `bitcoinjs-lib`
- **Cosmos**: `cosmjs-types`
- **Near**: `near-api-js`
- 等等...

**文件位置**：`packages/core/src/chains/{chain}/`

## 四、OneKey 后端服务连接

### 4.1 HTTP 客户端架构

**文件：`packages/shared/src/appApiClient/appApiClient.ts`**

```typescript
import axios from 'axios';

// 服务端点枚举
const clients: Record<EServiceEndpointEnum, AxiosInstance | null> = {
  [EServiceEndpointEnum.Wallet]: null,      // 钱包服务
  [EServiceEndpointEnum.Swap]: null,        // 交换服务
  [EServiceEndpointEnum.Utility]: null,     // 工具服务
  [EServiceEndpointEnum.Lightning]: null,  // Lightning 服务
  [EServiceEndpointEnum.Earn]: null,       // 收益服务
  [EServiceEndpointEnum.Notification]: null, // 通知服务
  [EServiceEndpointEnum.Prime]: null,      // Prime 服务
  [EServiceEndpointEnum.Transfer]: null,    // 转账服务
  [EServiceEndpointEnum.Rebate]: null,      // 返利服务
};

// 创建基础客户端
const getBasicClient = async ({ endpoint, name }: IEndpointInfo) => {
  const baseConfig = {
    baseURL: endpoint,
    timeout: REQUEST_TIMEOUT,
  };

  // 开发环境支持代理
  if (platformEnv.isDev && process.env.ONEKEY_PROXY) {
    baseConfig.baseURL = 'http://localhost:3180';
    baseConfig.headers = { 'X-OneKey-Dev-Proxy': endpoint };
  }

  const client = axios.create(baseConfig);
  return client;
};
```

### 4.2 服务端点配置

**文件：`packages/shared/types/endpoint.ts`**

```typescript
export enum EServiceEndpointEnum {
  Wallet = 'wallet',
  Swap = 'swap',
  Utility = 'utility',
  Lightning = 'lightning',
  Earn = 'earn',
  Notification = 'notification',
  Prime = 'prime',
  Transfer = 'transfer',
  Rebate = 'rebate',
}

export interface IEndpointInfo {
  endpoint: string;  // https://api.onekey.so/xxx
  name: EServiceEndpointEnum;
  autoHandleError?: boolean;
}
```

### 4.3 服务层使用

**文件：`packages/kit-bg/src/services/ServiceMarketV2.ts`**

```typescript
@backgroundClass()
class ServiceMarketV2 extends ServiceBase {
  @backgroundMethod()
  async fetchMarketTokenDetailByTokenAddress(
    tokenAddress: string,
    networkId: string,
  ) {
    // 1. 获取 HTTP 客户端
    const client = await this.getClient(EServiceEndpointEnum.Utility);
    
    // 2. 发送 HTTP 请求
    const response = await client.get<IMarketTokenDetailResponse>(
      '/utility/v2/market/token/detail',
      { params: { tokenAddress, networkId, currency: 'usd' } },
    );
    
    // 3. 返回数据
    return response.data;
  }
}
```

**ServiceBase 中的 getClient 方法**：

```typescript
// packages/kit-bg/src/services/ServiceBase.ts
export default class ServiceBase {
  async getClient(name: EServiceEndpointEnum) {
    return appApiClient.getClient(await getEndpointInfo({ name }));
  }
}
```

## 五、网络请求基础设施

### 5.1 请求拦截器

**文件：`packages/shared/src/request/axiosInterceptor.ts`**

```typescript
// 请求拦截器
axiosInstance.interceptors.request.use(
  (config) => {
    // 添加通用请求头
    config.headers['X-App-Version'] = appVersion;
    config.headers['X-Platform'] = platformEnv.isDesktop ? 'desktop' : 'web';
    
    // 添加认证 Token
    const token = await getAuthToken();
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => Promise.reject(error),
);

// 响应拦截器
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // 统一错误处理
    if (error.response?.status === 401) {
      // Token 过期，重新登录
      handleTokenExpired();
    }
    
    return Promise.reject(error);
  },
);
```

### 5.2 IP 表适配器

**文件：`packages/shared/src/request/helpers/ipTableAdapter.ts`**

```typescript
// 用于绕过网络限制
export const createIpTableAdapter = (config) => {
  return {
    async request(config) {
      // 通过 IP 表选择最佳节点
      const bestEndpoint = selectBestEndpoint(config.url);
      config.url = bestEndpoint;
      return axios(config);
    },
  };
};
```

### 5.3 JSON-RPC 请求

**文件：`packages/shared/src/request/JsonRPCRequest.ts`**

```typescript
export class JsonRPCRequest {
  async call(url: string, method: string, params?: any[]) {
    const response = await axios.post(url, {
      jsonrpc: '2.0',
      id: Date.now(),
      method,
      params,
    });
    return response.data.result;
  }
}
```

## 六、具体在线功能实现

### 6.1 市场数据

**服务**：`ServiceMarketV2`

**API 调用**：
```typescript
// 获取代币详情
GET /utility/v2/market/token/detail
Params: { tokenAddress, networkId, currency }

// 获取代币列表
GET /utility/v2/market/token/list
Params: { networkId, page, limit }

// 获取 K 线数据
GET /utility/v2/market/token/kline
Params: { tokenAddress, networkId, interval }
```

**缓存策略**：
```typescript
// 30 秒缓存
private _marketTokenBatchCacheTTL = timerUtils.getTimeDurationMs({
  seconds: 30,
});
```

### 6.2 交换服务

**服务**：`ServiceSwap`

**API 调用**：
```typescript
// 获取交换报价
POST /swap/v1/quote
Body: { fromToken, toToken, amount, slippage }

// 执行交换
POST /swap/v1/swap
Body: { fromToken, toToken, amount, slippage, userAddress }
```

### 6.3 通知服务

**服务**：`ServiceNotification`

**API 调用**：
```typescript
// 订阅价格提醒
POST /notification/v1/subscribe
Body: { tokenAddress, threshold, direction }

// WebSocket 连接
WS /notification/v1/ws
```

### 6.4 Prime 服务

**服务**：`ServicePrimeCloudSync`

**API 调用**：
```typescript
// 云同步
POST /prime/v1/sync
Body: { encryptedData, signature }

// 获取同步数据
GET /prime/v1/sync/latest
```

## 七、区块链节点配置

### 7.1 RPC 节点选择

OneKey 使用多个 RPC 节点提供商：

- **Alchemy**
- **Infura**
- **QuickNode**
- **公共节点**

**配置文件**：`packages/shared/src/engine/engineConsts.ts`

```typescript
export const EVM_RPC_ENDPOINTS = {
  'eth--1': [
    'https://eth-mainnet.alchemyapi.io/v2/xxx',
    'https://mainnet.infura.io/v3/xxx',
    'https://eth.llamarpc.com',
  ],
  'btc--1': [
    'https://btc-node.example.com',
  ],
};
```

### 7.2 节点故障转移

```typescript
async function callWithFallback(rpcs: string[], method: string, params: any[]) {
  for (const rpc of rpcs) {
    try {
      const provider = new JsonRpcProvider(rpc);
      return await provider[method](...params);
    } catch (error) {
      console.warn(`RPC ${rpc} failed, trying next`);
    }
  }
  throw new Error('All RPC endpoints failed');
}
```

## 八、离线队列机制

### 8.1 交易广播队列

```typescript
class TransactionQueue {
  private queue: SignedTransaction[] = [];
  
  async broadcast(tx: SignedTransaction) {
    if (navigator.onLine) {
      // 在线，立即广播
      await this.broadcastNow(tx);
    } else {
      // 离线，加入队列
      this.queue.push(tx);
    }
  }
  
  async broadcastNow(tx: SignedTransaction) {
    const provider = this.getProvider();
    await provider.sendTransaction(tx);
  }
  
  async processQueue() {
    while (this.queue.length > 0 && navigator.onLine) {
      const tx = this.queue.shift();
      await this.broadcastNow(tx);
    }
  }
}
```

### 8.2 网络状态监听

```typescript
window.addEventListener('online', () => {
  transactionQueue.processQueue();
  marketData.refresh();
});
```

## 九、架构总结

```
前端（React/React Native）
    ↓ IPC/Messaging
本地后端（kit-bg/services）
    ↓ HTTP/RPC
┌─────────────────────────────┐
│  在线服务层                  │
│  - OneKey API 服务器         │
│  - 区块链 RPC 节点           │
│  - 第三方数据服务            │
└─────────────────────────────┘
```

## 十、与纯本地后端的区别

| 特性 | OneKey 混合架构 | 纯本地后端 |
|------|----------------|-----------|
| **密钥管理** | 本地 | 本地 |
| **交易签名** | 本地 | 本地 |
| **余额查询** | 在线（RPC 节点） | 离线（本地缓存） |
| **交易广播** | 在线（RPC 节点） | 离线队列 |
| **市场数据** | 在线（API 服务） | 离线（本地缓存） |
| **云同步** | 在线（API 服务） | 离线（手动导出） |

## 十一、脚手架设计建议

基于 OneKey 的学习，如果你的脚手架需要在线功能：

### 方案 A：类似 OneKey

```
packages/
├── core/              # 区块链 SDK（RPC 连接）
│   └── src/chains/
├── shared/            # 网络请求基础设施
│   ├── appApiClient/  # HTTP 客户端
│   └── request/       # 拦截器、辅助函数
└── kit-bg/            # 业务服务
    └── src/services/ # 调用在线 API
```

### 方案 B：完全离线

```
packages/
├── core/              # 区块链 SDK（本地签名）
│   └── src/chains/
└── kit-bg/            # 业务服务（纯本地）
    └── src/services/
        └── TransactionQueue.ts  # 离线队列
```

### 方案 C：可配置在线/离线

```typescript
// 配置文件
const config = {
  onlineMode: true,  // 是否启用在线功能
  rpcEndpoints: [...],
  apiEndpoints: [...],
};

// 服务中根据配置选择
if (config.onlineMode) {
  return await callRpc(method, params);
} else {
  return await getFromCache(method, params);
}
```

---

> **学习来源**：OneKey/app-monorepo 在线功能实现
> 
> **核心机制**：HTTP 客户端 + RPC 提供者 + 服务层封装 + 离线队列
