# Product Strategy Based on OneKey Monorepo

## 1. Wallet Products

| Product                   | Description                                 | Reuse Level |
| ------------------------- | ------------------------------------------- | ----------- |
| Multi-chain Crypto Wallet | Core wallet supporting 60+ chains           | 100%        |
| Hardware Wallet Companion | Desktop/Mobile app for hardware integration | 90%         |
| Web Wallet                | Browser-based wallet interface              | 80%         |
| Exchange Custody Solution | Institutional custody system                | 70%         |

## 2. DeFi Aggregation Products

| Product              | Description                             | Reuse Level               |
| -------------------- | --------------------------------------- | ------------------------- |
| DeFi Aggregator      | Unified DEX, staking, lending interface | 60% (new UI required)     |
| NFT Trading Platform | Cross-chain NFT marketplace             | 50% (new features needed) |
| Token Swap           | Cross-chain token exchange              | 40%                       |

## 3. B2B Offerings

| Product                        | Description                                     | Reuse Level        |
| ------------------------------ | ----------------------------------------------- | ------------------ |
| Embedded Wallet SDK            | SDK for DApps to integrate wallet functionality | 85% (core modules) |
| Crypto Payment Gateway         | Merchant crypto payment processing              | 70%                |
| Institutional Asset Management | Multi-sig treasury management                   | 75%                |
| DAO Fund Management Tool       | Multi-sig governance interface                  | 60%                |

## 4. Web3 Infrastructure

| Product                 | Description                         | Reuse Level               |
| ----------------------- | ----------------------------------- | ------------------------- |
| Blockchain Explorer     | Transaction and address browser     | 50% (reuses core modules) |
| Gas Fee Analyzer        | Real-time gas price recommendations | 80% (reuses core)         |
| On-Chain Data Analytics | Wallet profiling and trend analysis | 55%                       |

## 5. Emerging Directions

| Product                | Description                          | Complexity |
| ---------------------- | ------------------------------------ | ---------- |
| Social Recovery Wallet | Social contact-based recovery        | Medium     |
| Smart Contract Wallet  | Programmable wallet logic            | High       |
| Cross-Chain Bridge     | Secure asset transfer between chains | High       |
| Decentralized Identity | DID solutions for crypto identity    | Medium     |
| Soulbound Token (SBT)  | Reputation and identity tokens       | Medium     |

## Core Reusable Assets

- **packages/core**: 60+ chain interaction logic
- **packages/components**: UI component library
- **packages/kit**: Business logic modules
- **packages/kit-bg**: Background processing services

_Prioritization suggestion: Start with DAO fund management tool (75% reuse) and embedded wallet SDK (85% reuse) for fastest market entry._
