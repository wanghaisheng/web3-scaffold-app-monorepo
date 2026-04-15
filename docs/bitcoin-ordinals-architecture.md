# Bitcoin Ordinals Architecture

Based on Current OneKey Monorepo Structure

## Core Principles

- Strictly single-chain Bitcoin implementation
- Immutable UTXO-based inscription storage
- Protocol-level validation only
- Zero cross-chain dependencies
- Minimalist dependency patterns

## Project Structure

```
monorepo/
├── inscriptions/          # Ordinal templates & metadata
├── indexer/               # Block and transaction processor
├── storage/               # UTXO-centric key-value store
├── core/                  # Script engines & transaction builders
└── validation/            # Consensus compliance engine

All packages export ONLY Bitcoin primitives
```

## Technical Requirements

- **Zero external dependencies** (Eliminate InfluxDB/LiteDB)
- **Full consensus validation** for all components
- **Immutable data structures**
- **Bitcoin Core compliance**
- **No external API dependencies**

## Core Components

### 3.1 Inscriptions System

- ORID (Ordinal ID) generation and tracking
- SAT index allocation and management
- Metadata URI validation pipeline
- On-chain verification flow

### 3.2 Indexer Engine

- Bitcoin block height parsing
- Transaction parsing and decoding
- Saturation detection and allocation
- Inscription metadata extraction pipeline

### 3.3 Data Protocol

- UTXO-based key-value storage pattern
- Compact serialization format
- State synchronization between nodes

## Implementation Rules

1. Strict import hierarchy: `bitcoin-core > utilities > interfaces`
2. Replace all multi-chain configurations with Bitcoin equivalents
3. Implement consensus validation for every component
4. Remove all HTTP server dependencies
5. Enforce audit requirements before deployment

## Migration Path

1. Create Bitcoin-only forks of relevant packages
2. Migrate data models to UTXO format
3. Replace external dependencies with Bitcoin primitives
4. Implement full validation against Bitcoin testnet
5. Gradual production deployment

## Compliance Validation Sample

```ts
function validateOrdinal(
  inscriptionData: InscriptionData,
): Promise<ValidationResult> {
  const blockValidation = checkBitcoinBlockHeight(inscriptionData.blockHeight);
  const immutabilityCheck = verifyImmutability(inscriptionData.dataHash);
  const protocolCompliance = validateProtocolRules(
    inscriptionData.transaction,
    inscriptionData.blockHash,
  );

  // Combine validation results
  return combineResults([
    blockValidation,
    immutabilityCheck,
    protocolCompliance,
  ]);
}
```

## Validation Requirements

All components must pass:

1. Bitcoin Core consensus rule verification
2. Immutability proof validation
3. Block height authenticity check
4. Protocol compliance assessment

## Future State

- Complete Bitcoin Ordinals Protocol compliance
- Sustainable UTXO-centric architecture
- Robust inscription verification system
- Production-ready Bitcoin network operation
