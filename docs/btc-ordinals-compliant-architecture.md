# Bitcoin Ordinals Compliant Architecture

Based on Current OneKey Monorepo Structure

## 1. Core Principles

- Single-chain Bitcoin implementation only
- Immutable UTXO-based inscriptions
- Strict consensus validation
- No cross-chain references
- Minimalist dependency patterns

## 2. Project Structure

```
btc-core/
├── inscriptions/          # Ordinal templates & metadata
├── indexer/               # Bitcoin block processor
├── storage/               # UTXO-centric storage
├── core/                  # Script engine & transaction builder
└── validation/            # Protocol compliance engine

Important: All packages export ONLY Bitcoin primitives
```

## 3. Technical Requirements

- **Zero external storage** (Eliminate InfluxDB/LiteDB)
- **Protocol-level validation** (Full consensus verification)
- **Immutable data structures**
- **Bitcoin Core standard compliance**
- **No cross-chain references**

## 4. Core Components

### 3.1 Inscriptions System

- ORID (Ordinal ID) generation
- SAT index allocation
- Metadata URI validation
- On-chain verification flow

### 3.2 Indexer Engine

- Block height parsing
- Transaction parsing
- Saturation detection
- Metadata extraction

### 3.3 Data Protocol

- UTXO-based key-value storage
- Compact serialization
- State syncing patterns

## 5. Implementation Rules

1. Strict import hierarchy: `bitcoin-core > utilities > interfaces`
2. Replace all multi-chain configs with Bitcoin equivalents
3. Implement consensus validation for all components
4. Remove all HTTP server dependencies
5. Enforce audit requirements before deployment

## 6. Migration Path

1. Create Bitcoin-only forks of relevant packages
2. Migrate data models to UTXO format
3. Replace external dependencies with Bitcoin primitives
4. Implement full validation against Bitcoin testnet
5. Gradual production deployment

## 7. Compliance Validation

```ts
function validateOrdinal(inscription: OrdinalData): ValidationResult {
  const isInscribedInBitcoinBlock = checkBitcoinBlockHeight(
    inscription.blockHeight,
  );
  const isImmutable = verifyImmutability(inscription.dataHash);
  const followsProtocolRules = validateProtocolCompliance(
    inscription.transaction,
  );

  return combineResults(
    isInscribedInBitcoinBlock,
    isImmutable,
    followsProtocolRules,
  );
}
```

## 8. Future State

- Complete Bitcoin Ordinals Protocol compliance
- Sustainable UTXO-centric architecture
- Robust inscription verification system
- Production-ready Bitcoin network operation
