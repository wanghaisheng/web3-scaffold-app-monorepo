# Bitcoin Ordinals Compliant Ideal Architecture

### Based on Current OneKey Monorepo Structure

## 1. Core Principles

- Strict adherence to Bitcoin blockchain
- Immutable inscription on Bitcoin UTXOs
- No cross-chain implementation
- Single-chain data isolation
- Minimalistic protocol stack

## 2. Architecture Overview

```
src/
├── inscriptions/          # Ordinal inscription templates
│   ├── opreturn/          # OP_RETURN handling
│   ├── ricardian_contracts/# Smart contract definitions
│   └── sat_data/          # Inscription metadata storage
│
├── indexer/               # Bitcoin-indexer compliant scanner
│   ├── block_processor.ts
│   ├── transaction_parser.ts
│   └── sat_img_parser.ts
│
├── storage/               # Minimalist UTXO management
│   └── utxo_store.ts
│
├── core/                  # Core Bitcoin logic
│   ├── script_engines.ts
│   └── transaction_builder.ts
│
└── validation/            # Protocol compliance validation
    └── consensus_validator.ts
```

## 3. Technical Constraints

- **No external databases** (Eliminate InfluxDB/LiteDB)
- **Single-chain storage** (Only Bitcoin blocks)
- **No multi-chain support** (Remove all altchain references)
- **Protocol-level validation** (Full consensus verification)
- **Immutable data structures** (No mutable state)
- **No external API dependencies** (No HTTP servers)

## 4. Core Components

### 3.1 Inscriptions System

- ORID (Ordinal ID) generation and tracking
- SAT (Satoshi) index allocation
- Metadata URI validation
- On-chain verification flow

### 3.2 Indexer Engine

- Block height and transaction parsing
- Saturation detection and allocation
- Inscription metadata extraction
- Saturation status reporting

### 3.3 Data Protocol

- Minimalist storage interface
- UTXO-based key-value storage
- Compact serialization format
- State syncing between nodes

## 5. Implementation Rules

1. **No cross-chain references** (Remove all altchain configs)
2. **Consensus-first design** (All modules validate against Bitcoin consensus)
3. **Security hardening** (Mandatory audit for all components)
4. **Resource minimization** (Eliminate heavy dependencies)
5. **Protocol compliance** (Strict adherence to Bitcoin Core standards)

## 6. Migration Path

1. Fork existing packages with strict Bitcoin isolation
2. Replace multi-chain dependencies with Bitcoin-native equivalents
3. Implement UTXO-only storage patterns
4. Migrate all data to Bitcoin-inscription format
5. Complete validation through Bitcoin testnet

## 7. Sample Validation Flow

```ts
async function validateInscription(
  inscriptionData: InscriptionData
): Promise<ValidationResult> {
  // Core Principle Checks
  const isValidBlockHeight = await checkBlockHeight(
    inscriptionData.transactionBlockHeight
  )
  const inscriptionIsImmutable = verifyImmutability(
    inscriptionData.dataHash
  )
  const isProtocolCompliant = validateProtocolRules(
    inscriptionData.transaction,
    inscriptionData.blockHash
  )

  // Core Principle Combinators
  const result = validateCombinator(
    isValidBlockHeight,
    attestation: isImmutable
  )
  return result.combineWith(
    isProtocolCompliant
  )
}
```

## 8. Development Workflow Modifications

- Replace Monorepo dependency patterns with Bitcoin-specific isolation
- Implement strict import hierarchy focused on Bitcoin primitives
- Adopt new validation patterns for consensus compliance
- Remove all non-BTC platform-specific code paths
- Implement rigorous audit processes

## 9. Security Protocol

- Formal audit against Bitcoin Core consensus rules
- Periodic protocol compliance testing
- Immediate deprecation of non-compliant components
- Zero tolerance for cross-chain integration

## 10. Future State Vision

- Complete Bitcoin Ordinals Protocol compliance
- Minimal viable inscription implementation
- Robust UTXO-centric state management
- Sustainable protocol-level operation
